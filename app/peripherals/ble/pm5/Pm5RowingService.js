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

import bleno from '@stoprocent/bleno'
import { getFullUUID } from './Pm5Constants.js'
import MultiplexedCharacteristic from './characteristic/MultiplexedCharacteristic.js'
import GeneralStatus from './characteristic/GeneralStatus.js'
import AdditionalStatus from './characteristic/AdditionalStatus.js'
import AdditionalStatus2 from './characteristic/AdditionalStatus2.js'
import AdditionalStrokeData from './characteristic/AdditionalStrokeData.js'
import StrokeData from './characteristic/StrokeData.js'
import StaticNotifyCharacteristic from '../common/StaticNotifyCharacteristic.js'

let lastKnownMetrics
let broadcastInterval = 1000
let timer

export default class PM5RowingService extends bleno.PrimaryService {
  constructor (config) {
    const multiplexedCharacteristic = new MultiplexedCharacteristic()
    const generalStatus = new GeneralStatus(multiplexedCharacteristic)
    const additionalStatus = new AdditionalStatus(multiplexedCharacteristic)
    const additionalStatus2 = new AdditionalStatus2(multiplexedCharacteristic)
    const strokeData = new StrokeData(multiplexedCharacteristic)
    const additionalStrokeData = new AdditionalStrokeData(multiplexedCharacteristic)
    broadcastInterval = config.pm5UpdateInterval
    lastKnownMetrics = {
      sessiontype: 'JustRow',
      sessionStatus: 'WaitingForStart',
      strokeState: 'WaitingForDrive',
      totalMovingTime: 0,
      totalLinearDistance: 0,
      dragFactor: config.rowerSettings.dragFactor
    }

    super({
      uuid: getFullUUID('0030'),
      characteristics: [
        // C2 rowing general status
        generalStatus,
        // C2 rowing additional status
        additionalStatus,
        // C2 rowing additional status 2
        additionalStatus2,
        // C2 rowing general status and additional status samplerate
        new StaticNotifyCharacteristic(getFullUUID('0034'), 'samplerate', 'samplerate', true),
        // C2 rowing stroke data
        strokeData,
        // C2 rowing additional stroke data
        additionalStrokeData,
        // C2 rowing split/interval data
        new StaticNotifyCharacteristic(getFullUUID('0037'), 'split data', 'split data', true),
        // C2 rowing additional split/interval data
        new StaticNotifyCharacteristic(getFullUUID('0038'), 'additional split data', 'additional split data', true),
        // C2 rowing end of workout summary data
        new StaticNotifyCharacteristic(getFullUUID('0039'), 'workout summary', 'workout summary', true),
        // C2 rowing end of workout additional summary data
        new StaticNotifyCharacteristic(getFullUUID('003A'), 'additional workout summary', 'additional workout summary', true),
        // C2 rowing heart rate belt information
        new StaticNotifyCharacteristic(getFullUUID('003B'), 'heart rate belt information', 'heart rate belt information', true),
        // C2 force curve data
        new StaticNotifyCharacteristic(getFullUUID('003D'), 'force curve data', 'force curve data', true),
        // C2 multiplexed information
        multiplexedCharacteristic
      ]
    })
    this.generalStatus = generalStatus
    this.additionalStatus = additionalStatus
    this.additionalStatus2 = additionalStatus2
    this.strokeData = strokeData
    this.additionalStrokeData = additionalStrokeData
    this.multiplexedCharacteristic = multiplexedCharacteristic

    timer = setTimeout(this.onBroadcastInterval.bind(this), broadcastInterval)
  }

  notifyData (metrics) {
    if (metrics.metricsContext === undefined) return
    lastKnownMetrics = metrics
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        this.longNotifyData(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        this.longNotifyData(metrics)
        break
      case (metrics.metricsContext.isIntervalStart):
        this.longNotifyData(metrics)
        break
      case (metrics.metricsContext.isPauseStart):
        this.longNotifyData(metrics)
        break
      case (metrics.metricsContext.isPauseEnd):
        this.longNotifyData(metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        this.longNotifyData(metrics)
        break
      case (metrics.metricsContext.isRecoveryStart):
        this.shortNotifyData(metrics)
        break
      default:
        // Do nothing
    }
  }

  onBroadcastInterval () {
    this.longNotifyData(lastKnownMetrics)
  }

  shortNotifyData (metrics) {
    clearTimeout(timer)
    this.generalStatus.notify(metrics)
    timer = setTimeout(this.onBroadcastInterval.bind(this), broadcastInterval)
  }

  longNotifyData (metrics) {
    clearTimeout(timer)
    this.generalStatus.notify(metrics)
    this.additionalStatus.notify(metrics)
    this.additionalStatus2.notify(metrics)
    this.strokeData.notify(metrics)
    this.additionalStrokeData.notify(metrics)
    timer = setTimeout(this.onBroadcastInterval.bind(this), broadcastInterval)
  }
}
