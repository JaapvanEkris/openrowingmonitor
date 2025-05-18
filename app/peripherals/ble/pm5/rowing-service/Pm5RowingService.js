'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This is the central service to get information about the workout
 *
 * Critical messages:
 * - fluid simulation uses GeneralStatus STROKESTATE_DRIVING
 * - cloud simulation uses MULTIPLEXER, AdditionalStatus -> currentPace
 * - EXR: subscribes to: 'general status', 'additional status', 'additional status 2', 'additional stroke data' and 'force curve data'
 */
import { createSeries } from '../../../../engine/utils/Series.js'
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
import { ForceCurveCharacteristic } from './other-characteristics/ForceCurveCharacteristic.js'
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
  #forceCurveData

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

  #splitHR
  #workoutHR
  #previousSplitMetrics
  #timer

  /**
   * @param {Config} config
   */
  /* eslint-disable max-statements -- This is the heart of the PM5 interface with a lot of characteristics, so there is a lot to initialise */
  constructor (config) {
    const multiplexedCharacteristic = new MultiplexedCharacteristic()
    const generalStatus = new GeneralStatusCharacteristic(multiplexedCharacteristic)
    const additionalStatus = new AdditionalStatusCharacteristic(multiplexedCharacteristic)
    const additionalStatus2 = new AdditionalStatus2Characteristic(multiplexedCharacteristic)
    const additionalStatus3 = new AdditionalStatus3Characteristic(multiplexedCharacteristic)
    const strokeData = new StrokeDataCharacteristic(multiplexedCharacteristic)
    const forceCurveData = new ForceCurveCharacteristic(multiplexedCharacteristic)
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
        additionalStatus3.characteristic, // TODO: disabled for now as otherwise ErgData connection does not seem to be stable
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
        // C2 force curve data (2-288 bytes)
        forceCurveData.characteristic,
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
    this.#forceCurveData = forceCurveData
    this.#additionalSplitData = additionalSplitData
    this.#workoutSummary = workoutSummary
    this.#additionalWorkoutSummary = additionalWorkoutSummary
    this.#additionalWorkoutSummary2 = new AdditionalWorkoutSummary2Characteristic(multiplexedCharacteristic)
    this.#loggedWorkout = loggedWorkout
    this.#lastKnownMetrics = {
      .../** @type {Metrics} */({}),
      sessionState: 'WaitingForStart',
      strokeState: 'WaitingForDrive',
      totalMovingTime: 0,
      totalLinearDistance: 0,
      cycleLinearVelocity: 0,
      cycleStrokeRate: 0,
      cyclePace: 0,
      cyclePower: 0,
      workout: {
        timeSpent: {
          total: 0,
          rest: 0
        },
        distance: {
          fromStart: 0
        },
        calories: {
          totalSpent: 0
        }
      },
      interval: {
        type: 'justrow',
        movingTime: {
          target: 0
        },
        distance: {
          target: 0
        },
        pace: {
          average: 0
        }
      },
      split: {
        type: 'justrow',
        pace: {
          average: 0
        },
        power: {
          average: 0
        },
        calories: {
          averagePerHour: 0
        }
      },
      dragFactor: config.rowerSettings.dragFactor
    }
    this.#splitHR = createSeries()
    this.#workoutHR = createSeries()
    this.#config = config
    this.#previousSplitMetrics = {
      totalMovingTime: 0,
      totalLinearDistance: 0
    }
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#config.pm5UpdateInterval)
  }
  /* eslint-enable max-statements */

  /**
  * @param {Metrics} metrics
  */
  notifyData (metrics) {
    if (metrics.metricsContext === undefined) { return }
    if (!(metrics.sessionState === 'Stopped' && !metrics.metricsContext.isSessionStop)) { this.#lastKnownMetrics = metrics }
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        this.#workoutHR.push(this.#lastKnownMetrics.heartrate)
        this.#genericStatusDataNotifies(this.#lastKnownMetrics, this.#previousSplitMetrics)
        break
      case (metrics.metricsContext.isSessionStop):
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        this.#workoutHR.push(this.#lastKnownMetrics.heartrate)
        this.#genericStatusDataNotifies(this.#lastKnownMetrics, this.#previousSplitMetrics)
        this.#splitDataNotifies(this.#lastKnownMetrics, this.#splitHR)
        this.#workoutEndDataNotifies(this.#lastKnownMetrics, this.#workoutHR)
        break
      case (metrics.metricsContext.isPauseStart):
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        this.#workoutHR.push(this.#lastKnownMetrics.heartrate)
        this.#genericStatusDataNotifies(this.#lastKnownMetrics, this.#previousSplitMetrics)
        this.#splitDataNotifies(this.#lastKnownMetrics, this.#splitHR)
        this.#previousSplitMetrics = {
          totalMovingTime: this.#lastKnownMetrics.split.timeSpent.moving,
          totalLinearDistance: this.#lastKnownMetrics.split.distancefromStart
        }
        this.#splitHR.reset()
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        break
      case (metrics.metricsContext.isPauseEnd):
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        this.#workoutHR.push(this.#lastKnownMetrics.heartrate)
        this.#recoveryStartDataNotifies(this.#lastKnownMetrics)
        this.#genericStatusDataNotifies(this.#lastKnownMetrics, this.#previousSplitMetrics)
        this.#splitDataNotifies(this.#lastKnownMetrics, this.#splitHR)
        this.#splitHR.reset()
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        break
      case (metrics.metricsContext.isSplitEnd):
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        this.#workoutHR.push(this.#lastKnownMetrics.heartrate)
        this.#genericStatusDataNotifies(this.#lastKnownMetrics, this.#previousSplitMetrics)
        this.#splitDataNotifies(this.#lastKnownMetrics, this.#splitHR)
        this.#previousSplitMetrics = {
          totalMovingTime: this.#lastKnownMetrics.split.timeSpent.moving,
          totalLinearDistance: this.#lastKnownMetrics.split.distancefromStart
        }
        this.#splitHR.reset()
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        break
      case (metrics.metricsContext.isDriveStart):
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        this.#workoutHR.push(this.#lastKnownMetrics.heartrate)
        this.#driveStartNotifies(this.#lastKnownMetrics)
        break
      case (metrics.metricsContext.isRecoveryStart):
        this.#splitHR.push(this.#lastKnownMetrics.heartrate)
        this.#workoutHR.push(this.#lastKnownMetrics.heartrate)
        this.#recoveryStartDataNotifies(this.#lastKnownMetrics)
        break
      default:
        // Do nothing
    }
  }

  #onBroadcastInterval () {
    this.#genericStatusDataNotifies(this.#lastKnownMetrics, this.#previousSplitMetrics)
  }

  /**
   * @param {Metrics} metrics
   * @param {SplitTimeDistanceData} previousSplitMetrics
   * @param {SegmentMetrics} splitMetrics
   */
  #genericStatusDataNotifies (metrics, previousSplitMetrics) {
    clearTimeout(this.#timer)
    this.#generalStatus.notify(metrics)
    this.#additionalStatus.notify(metrics)
    this.#additionalStatus2.notify(metrics, previousSplitMetrics)
    this.#additionalStatus3.notify(metrics)
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#config.pm5UpdateInterval)
  }

  /**
   * @param {Metrics} metrics
   * @param {SegmentMetrics} splitMetrics
   */
  #splitDataNotifies (metrics, splitHRMetrics) {
    clearTimeout(this.#timer)
    this.#splitData.notify(metrics)
    this.#additionalSplitData.notify(metrics, splitHRMetrics)
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#config.pm5UpdateInterval)
  }

  /**
   * @param {Metrics} metrics
   */
  #driveStartNotifies (metrics) {
    clearTimeout(this.#timer)
    this.#strokeData.notify(metrics)
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#config.pm5UpdateInterval)
  }

  /**
   * @param {Metrics} metrics
   */
  #recoveryStartDataNotifies (metrics) {
    clearTimeout(this.#timer)
    this.#strokeData.notify(metrics)
    this.#additionalStrokeData.notify(metrics)
    this.#forceCurveData.notify(metrics)
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#config.pm5UpdateInterval)
  }

  /**
   * @param {Metrics} metrics
   * @param {SegmentMetrics} workoutMetrics
   */
  #workoutEndDataNotifies (metrics, workoutHRMetrics) {
    clearTimeout(this.#timer)
    this.#workoutSummary.notify(metrics, workoutHRMetrics)
    this.#additionalWorkoutSummary.notify(metrics)
    this.#additionalWorkoutSummary2.notify(metrics)
    this.#loggedWorkout.notify(metrics, workoutHRMetrics)
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#config.pm5UpdateInterval)
  }
}
