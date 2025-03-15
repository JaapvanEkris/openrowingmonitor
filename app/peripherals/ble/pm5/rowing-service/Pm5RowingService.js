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

import { AdditionalStatus2Characteristic } from './AdditionalStatus2Characteristic.js'
import { AdditionalStatusCharacteristic } from './AdditionalStatusCharacteristic.js'
import { AdditionalStrokeDataCharacteristic } from './AdditionalStrokeDataCharacteristic.js'
import { GeneralStatusCharacteristic } from './GeneralStatusCharacteristic.js'
import { MultiplexedCharacteristic } from './MultiplexedCharacteristic.js'
import { StrokeDataCharacteristic } from './StrokeDataCharacteristic.js'

export class Pm5RowingService extends GattService {
  #generalStatus
  #additionalStatus
  #additionalStatus2
  #strokeData
  #additionalStrokeData

  #lastKnownMetrics
  #broadcastInterval = 1_000
  #timer

  constructor (config) {
    const multiplexedCharacteristic = new MultiplexedCharacteristic()
    const generalStatus = new GeneralStatusCharacteristic(multiplexedCharacteristic)
    const additionalStatus = new AdditionalStatusCharacteristic(multiplexedCharacteristic)
    const additionalStatus2 = new AdditionalStatus2Characteristic(multiplexedCharacteristic)
    const strokeData = new StrokeDataCharacteristic(multiplexedCharacteristic)
    const additionalStrokeData = new AdditionalStrokeDataCharacteristic(multiplexedCharacteristic)

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
        // C2 rowing general status and additional status sample rate (0 - for 1000 ms) - TODO: Specs states Write is necessary we omit that as this is not changeable for now (https://www.c2forum.com/viewtopic.php?t=152485)
        createStaticReadCharacteristic(toC2128BitUUID('0034'), [0], 'Sample Rate'),
        // C2 rowing stroke data
        strokeData.characteristic,
        // C2 rowing additional stroke data
        additionalStrokeData.characteristic,
        // C2 rowing split/interval data (18 bytes)
        // TODO: add these new characteristics as we support these now
        createStaticReadCharacteristic(toC2128BitUUID('0037'), new Array(18).fill(0), 'Split Data', true),
        // C2 rowing additional split/interval data (19 bytes)
        createStaticReadCharacteristic(toC2128BitUUID('0038'), new Array(19).fill(0), 'Additional Split Data', true),
        // C2 rowing end of workout summary data (20 bytes)
        createStaticReadCharacteristic(toC2128BitUUID('0039'), new Array(20).fill(0), 'Workout Summary', true),
        // C2 rowing end of workout additional summary data (19 bytes)
        createStaticReadCharacteristic(toC2128BitUUID('003A'), new Array(18).fill(0), 'Additional Workout Summary', true),
        // C2 rowing heart rate belt information (6 bytes) - Specs states Write is necessary we omit that
        createStaticReadCharacteristic(toC2128BitUUID('003B'), new Array(6).fill(0), 'Heart Rate Belt Information', true),
        // C2 force curve data - Same concept as ESP Rowing Monitor force curve (first two bytes: 1. 2x4bit value where first is total number of notifications - 'characteristics' in the Specs term - second the number of values in the current notification 2. current notification number - e.g. [0x29 /*i.e. 41 */, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0] total of 2 consecutive notification will be emitted, current is the 1 and it has 9 data points, all zeros), variable size based on negotiated MTU, only C2 uses 16bits values) - https://github.com/ergarcade/pm5-base/blob/3d16d5d4840af14104fca928acdd3af2ec19cb29/js/pm5.js#L449
        createStaticReadCharacteristic(toC2128BitUUID('003D'), [0x19, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0], 'Force Curve Data', true),
        // C2 multiplexed information
        multiplexedCharacteristic.characteristic
      ]
    })
    this.#generalStatus = generalStatus
    this.#additionalStatus = additionalStatus
    this.#additionalStatus2 = additionalStatus2
    this.#strokeData = strokeData
    this.#additionalStrokeData = additionalStrokeData
    this.#broadcastInterval = config.pm5UpdateInterval
    this.#lastKnownMetrics = {
      sessiontype: 'JustRow',
      sessionStatus: 'WaitingForStart',
      strokeState: 'WaitingForDrive',
      totalMovingTime: 0,
      totalLinearDistance: 0,
      dragFactor: config.rowerSettings.dragFactor
    }
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#broadcastInterval)
  }

  notifyData (metrics) {
    if (metrics.metricsContext === undefined) return
    this.#lastKnownMetrics = metrics
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        this.#longNotifyData(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        this.#longNotifyData(metrics)
        break
      case (metrics.metricsContext.isIntervalStart):
        this.#longNotifyData(metrics)
        break
      case (metrics.metricsContext.isPauseStart):
        this.#longNotifyData(metrics)
        break
      case (metrics.metricsContext.isPauseEnd):
        this.#longNotifyData(metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        this.#longNotifyData(metrics)
        break
      case (metrics.metricsContext.isRecoveryStart):
        this.#shortNotifyData(metrics)
        break
      default:
        // Do nothing
    }
  }

  #onBroadcastInterval () {
    this.#longNotifyData(this.#lastKnownMetrics)
  }

  #shortNotifyData (metrics) {
    clearTimeout(this.#timer)
    this.#generalStatus.notify(metrics)
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#broadcastInterval)
  }

  #longNotifyData (metrics) {
    clearTimeout(this.#timer)
    this.#generalStatus.notify(metrics)
    this.#additionalStatus.notify(metrics)
    this.#additionalStatus2.notify(metrics)
    this.#strokeData.notify(metrics)
    this.#additionalStrokeData.notify(metrics)
    this.#timer = setTimeout(() => { this.#onBroadcastInterval() }, this.#broadcastInterval)
  }
}
