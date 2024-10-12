'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import { secondsToTimeString } from '../tools/Helper.js'

function createLogRecorder (config) {
  let heartRate = 0
  let lastMetrics

  // This function handles all incomming commands. Here, the recordingmanager will have filtered
  // all unneccessary commands for us, so we only need to react to 'reset' and 'shutdown'
  async function handleCommand (commandName) {
    const currentdate = new Date()
    switch (commandName) {
      case ('reset'):
        log.info(`OpenRowingMonitor reset at ${currentdate.getHours()}:${currentdate.getMinutes()}, at ${lastMetrics.totalMovingTime.toFixed(5)} seconds,distance ${lastMetrics.totalLinearDistance.toFixed(1)}m`)
        break
      case 'shutdown':
        log.info(`OpenRowingMonitor shutdown at ${currentdate.getHours()}:${currentdate.getMinutes()}, at ${lastMetrics.totalMovingTime.toFixed(5)} seconds,distance ${lastMetrics.totalLinearDistance.toFixed(1)}m`)
        break
      default:
        log.error(`Logecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function setBaseFileName (baseFileName) {
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function recordHeartRate (value) {
    heartRate = value.heartrate
  }

  function recordRowingMetrics (metrics) {
    const currentdate = new Date()
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        log.info(`Rowing started at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`)
        break
      case (metrics.metricsContext.isSessionStop):
        logMetrics(metrics)
        log.info(`Rowing ended at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}, at ${metrics.totalMovingTime.toFixed(5)} seconds,distance ${metrics.totalLinearDistance.toFixed(1)}m`)
        break
      case (metrics.metricsContext.isIntervalStart):
        log.info(`New interval started at ${metrics.totalMovingTime.toFixed(5)} seconds, distance ${metrics.totalLinearDistance.toFixed(1)}m`)
        break
      case (metrics.metricsContext.isPauseStart):
        logMetrics(metrics)
        log.info(`Rowing stopped/paused at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}, at ${metrics.totalMovingTime.toFixed(5)} seconds,distance ${metrics.totalLinearDistance.toFixed(1)}m`)
        break
      case (metrics.metricsContext.isPauseEnd):
        log.info(`Rowing resumed at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`)
        break
      case (metrics.metricsContext.isDriveStart):
        logMetrics(metrics)
        break
    }
    lastMetrics = metrics
  }

  function logMetrics (metrics) {
    if (heartRate !== undefined && config.userSettings.restingHR <= heartRate && heartRate <= config.userSettings.maxHR) {
      log.info(`stroke: ${metrics.totalNumberOfStrokes}, dist: ${metrics.totalLinearDistance.toFixed(1)}m, heartrate ${heartRate} BPM` +
        `, pace: ${metrics.cyclePace > 0 ? secondsToTimeString(metrics.cyclePace) : NaN}/500m, stroke dist: ${metrics.cycleDistance > 0 ? metrics.cycleDistance.toFixed(1) : NaN}m, strokerate: ${metrics.cycleStrokeRate > 0 ? metrics.cycleStrokeRate.toFixed(1) : NaN} SPM` +
        `, drive dur: ${metrics.driveDuration > 0 ? metrics.driveDuration.toFixed(2) : NaN}s, rec. dur: ${metrics.recoveryDuration > 0 ? metrics.recoveryDuration.toFixed(2) : NaN}s, stroke dur: ${metrics.cycleDuration ? metrics.cycleDuration.toFixed(2) : NaN}s`)
    } else {
      log.info(`stroke: ${metrics.totalNumberOfStrokes}, dist: ${metrics.totalLinearDistance.toFixed(1)}m, No heartrate detected` +
        `, pace: ${metrics.cyclePace > 0 ? secondsToTimeString(metrics.cyclePace) : NaN}/500m, stroke dist: ${metrics.cycleDistance > 0 ? metrics.cycleDistance.toFixed(1) : NaN}m, strokerate: ${metrics.cycleStrokeRate > 0 ? metrics.cycleStrokeRate.toFixed(1) : NaN} SPM` +
        `, drive dur: ${metrics.driveDuration > 0 ? metrics.driveDuration.toFixed(2) : NaN}s, rec. dur: ${metrics.recoveryDuration > 0 ? metrics.recoveryDuration.toFixed(2) : NaN}s, stroke dur: ${metrics.cycleDuration ? metrics.cycleDuration.toFixed(2) : NaN}s`)
    }
  }

  return {
    handleCommand,
    setBaseFileName,
    recordRowingMetrics,
    recordHeartRate
  }
}

export { createLogRecorder }
