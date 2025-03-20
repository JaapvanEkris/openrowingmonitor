'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This is the central service to get information about the workout

  ToDo: Check if all messages are correctly with respect to the rowing stroke. It seems a bit overkill to broadcast a longNotifyData every second,
        as most metrics broadcast haven't changed

  ToDo: figure out to which services some common applications subscribe and then just implement those

  Critical messages:
  - fluid simulation uses GeneralStatus STROKESTATE_DRIVING
  - cloud simulation uses MULTIPLEXER, AdditionalStatus -> currentPace
  - EXR: subscribes to: 'general status', 'additional status', 'additional status 2', 'additional stroke data'
*/

import { GattService } from '../../BleManager.js'
import { createStaticReadCharacteristic } from '../../common/StaticReadCharacteristic.js'

import { toC2128BitUUID } from '../Pm5Constants.js'

import { AdditionalSplitDataCharacteristic } from './session-characteristics/AdditionalSplitDataCharacteristic.js'
import { AdditionalStatus2Characteristic } from './status-characteristics/AdditionalStatus2Characteristic.js'
import { AdditionalStatus3Characteristic } from './status-characteristics/AdditionalStatus3Characteristic.js'
import { AdditionalStatusCharacteristic } from './status-characteristics/AdditionalStatusCharacteristic.js'
import { AdditionalStrokeDataCharacteristic } from './other-characteristics/AdditionalStrokeDataCharacteristic.js'
import { AdditionalWorkoutSummary2Characteristic } from './session-characteristics/AdditionalWorkoutSummary2Characteristic.js'
import { AdditionalWorkoutSummaryCharacteristic } from './session-characteristics/AdditionalWorkoutSummaryCharacteristic.js'
import { GeneralStatusCharacteristic } from './status-characteristics/GeneralStatusCharacteristic.js'
import { LoggedWorkoutCharacteristic } from './session-characteristics/LoggedWorkoutCharacteristic.js'
import { MultiplexedCharacteristic } from './other-characteristics/MultiplexedCharacteristic.js'
import { SampleRateCharacteristic } from './other-characteristics/SampleRateCharacteristic.js'
import { SplitDataCharacteristic } from './session-characteristics/SplitDataCharacteristic.js'
import { StrokeDataCharacteristic } from './other-characteristics/StrokeDataCharacteristic.js'
import { WorkoutSummaryCharacteristic } from './session-characteristics/WorkoutSummaryCharacteristic.js'

export class Pm5RowingService extends GattService {
  #generalStatus
  #additionalStatus
  #additionalStatus2
  #additionalStatus3

  #strokeData
  #additionalStrokeData

  #splitData
  #additionalSplitData

  #workoutSummary
  #additionalWorkoutSummary
  #additionalWorkoutSummary2

  #loggedWorkout

  /**
   * @type {Metrics}
   */
  #lastKnownMetrics
  #config

  /**
   * @param {Config} config
   */
  constructor (config) {
    const multiplexedCharacteristic = new MultiplexedCharacteristic()
    const generalStatus = new GeneralStatusCharacteristic(multiplexedCharacteristic)
    const additionalStatus = new AdditionalStatusCharacteristic(multiplexedCharacteristic)
    const additionalStatus2 = new AdditionalStatus2Characteristic(multiplexedCharacteristic)
    const additionalStatus3 = new AdditionalStatus3Characteristic(multiplexedCharacteristic)
    const strokeData = new StrokeDataCharacteristic(multiplexedCharacteristic)
    const additionalStrokeData = new AdditionalStrokeDataCharacteristic(multiplexedCharacteristic)
    const splitData = new SplitDataCharacteristic(multiplexedCharacteristic)
    const additionalSplitData = new AdditionalSplitDataCharacteristic(multiplexedCharacteristic)
    const workoutSummary = new WorkoutSummaryCharacteristic(multiplexedCharacteristic)
    const additionalWorkoutSummary = new AdditionalWorkoutSummaryCharacteristic(multiplexedCharacteristic)
    const loggedWorkout = new LoggedWorkoutCharacteristic(multiplexedCharacteristic)

    super({
      name: 'Rowing Service',
      uuid: toC2128BitUUID('0030'),
      characteristics: [
        // C2 rowing general status
        generalStatus.characteristic,
        // C2 rowing additional status
        additionalStatus.characteristic,
        // C2 rowing additional status 2
        additionalStatus2.characteristic,
        // C2 rowing additional status 3
        additionalStatus3.characteristic,
        // C2 rowing general status and additional status sample rate (0 - for 1000 ms)
        new SampleRateCharacteristic(config).characteristic,
        // C2 rowing stroke data
        strokeData.characteristic,
        // C2 rowing additional stroke data
        additionalStrokeData.characteristic,
        // C2 rowing split/interval data (18 bytes)
        splitData.characteristic,
        // C2 rowing additional split/interval data (19 bytes)
        additionalSplitData.characteristic,
        // C2 rowing end of workout summary data (20 bytes)
        workoutSummary.characteristic,
        // C2 rowing end of workout additional summary data (19 bytes)
        additionalWorkoutSummary.characteristic,
        // C2 rowing heart rate belt information (6 bytes) - Specs states Write is necessary we omit that
        createStaticReadCharacteristic(toC2128BitUUID('003B'), new Array(6).fill(0), 'Heart Rate Belt Information', true),
        // C2 force curve data - Same concept as ESP Rowing Monitor force curve (first two bytes: 1. 2x4bit value where first is total number of notifications - 'characteristics' in the Specs term - second the number of values in the current notification 2. current notification number - e.g. [0x29 /*i.e. 41 */, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0] total of 2 consecutive notification will be emitted, current is the 1 and it has 9 data points, all zeros), variable size based on negotiated MTU, only C2 uses 16bits values) - https://github.com/ergarcade/pm5-base/blob/3d16d5d4840af14104fca928acdd3af2ec19cb29/js/pm5.js#L449
        createStaticReadCharacteristic(toC2128BitUUID('003D'), [0x19, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0], 'Force Curve Data', true),
        // Logged Workout
        loggedWorkout.characteristic,
        // C2 multiplexed information
        multiplexedCharacteristic.characteristic
      ]
    })
    this.#generalStatus = generalStatus
    this.#additionalStatus = additionalStatus
    this.#additionalStatus2 = additionalStatus2
    this.#additionalStatus3 = additionalStatus3
    this.#strokeData = strokeData
    this.#additionalStrokeData = additionalStrokeData
    this.#splitData = splitData
    this.#additionalSplitData = additionalSplitData
    this.#workoutSummary = workoutSummary
    this.#additionalWorkoutSummary = additionalWorkoutSummary
    this.#additionalWorkoutSummary2 = new AdditionalWorkoutSummary2Characteristic(multiplexedCharacteristic)
    this.#loggedWorkout = loggedWorkout
    this.#lastKnownMetrics = {
      .../** @type {Metrics} */({}),
      sessiontype: 'justrow',
      sessionStatus: 'WaitingForStart',
      strokeState: 'WaitingForDrive',
      totalMovingTime: 0,
      totalLinearDistance: 0,
      dragFactor: config.rowerSettings.dragFactor
    }
    this.#config = config
    setTimeout(() => { this.#onBroadcastInterval() }, this.#config.pm5UpdateInterval)
  }

  /**
  * @param {Metrics} metrics
  */
  notifyData (metrics) {
    if (metrics.metricsContext === undefined) return
    this.#lastKnownMetrics = metrics
    switch (true) {
      case (metrics.metricsContext.isSessionStop):
        this.#workoutEndDataNotifies(this.#lastKnownMetrics)
        break
      case (metrics.metricsContext.isSplitEnd):
        this.#splitDataNotifies(this.#lastKnownMetrics)
        break
      case (metrics.metricsContext.isPauseStart):
        this.#splitDataNotifies(this.#lastKnownMetrics)
        break
      case (metrics.metricsContext.isDriveStart):
        this.#strokeData.notify(this.#lastKnownMetrics)
        break
      case (metrics.metricsContext.isRecoveryStart):
        this.#strokeEndDataNotifies(this.#lastKnownMetrics)
        break
      default:
        // Do nothing
    }
  }

  #onBroadcastInterval () {
    this.#genericStatusDataNotifies(this.#lastKnownMetrics)
  }

  /**
   * @param {Metrics} metrics
   */
  #genericStatusDataNotifies (metrics) {
    this.#generalStatus.notify(metrics)
    this.#additionalStatus.notify(metrics)
    this.#additionalStatus2.notify(metrics)
    this.#additionalStatus3.notify(metrics)
    setTimeout(() => this.#onBroadcastInterval(), this.#config.pm5UpdateInterval)
  }

  /**
   * @param {Metrics} metrics
   */
  #splitDataNotifies (metrics) {
    this.#splitData.notify(metrics)
    this.#additionalSplitData.notify(metrics)
  }

  /**
   * @param {Metrics} metrics
   */
  #strokeEndDataNotifies (metrics) {
    this.#strokeData.notify(metrics)
    this.#additionalStrokeData.notify(metrics)
    // ForceCurve
  }

  /**
   * @param {Metrics} metrics
   */
  #workoutEndDataNotifies (metrics) {
    this.#workoutSummary.notify(metrics)
    this.#additionalWorkoutSummary.notify(metrics)
    this.#additionalWorkoutSummary2.notify(metrics)
    this.#loggedWorkout.notify(metrics)
  }
}
