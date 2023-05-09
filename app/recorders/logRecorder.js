'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import { secondsToTimeString } from '../tools/Helper.js'

function createLogRecorder (config) {
  let heartRateResetTimer
  let heartRate = 0

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the WorkoutRecorder will react to and what it will ignore
  async function handleCommand (commandName) {
    switch (commandName) {
      case ('start'):
        break
      case ('startOrResume'):
        break
      case ('pause'):
        break
      case ('stop'):
        break
      case ('reset'):
        break
      case 'shutdown':
        break
      default:
        log.error(`Logecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function setBaseFileName (baseFileName) {
    filename = `${baseFileName}_rowingData.csv`
    log.info(`Saving RowingData file as ${filename}...`)
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function recordHeartRate (value) {
    if (heartRateResetTimer)clearInterval(heartRateResetTimer)
    // set the heart rate to zero if we did not receive a value for some time
    heartRateResetTimer = setTimeout(() => {
      heartRate = 0
    }, 6000)
    heartRate = value.heartrate
  }

  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        logMetrics(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        logMetrics(metrics)
        break
      case (metrics.metricsContext.isPauseStart):
        logMetrics(metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        logMetrics(metrics)
        break
    }
  }

  function logMetrics (metrics) {
    addHeartRateToMetrics(metrics)
    log.info(`stroke: ${metrics.totalNumberOfStrokes}, dist: ${metrics.totalLinearDistance.toFixed(1)}m, speed: ${metrics.cycleLinearVelocity.toFixed(2)}m/s` +
      `, pace: ${secondsToTimeString(metrics.cyclePace)}/500m, power: ${Math.round(metrics.cyclePower)}W, cal: ${metrics.totalCalories.toFixed(1)}kcal` +
      `, SPM: ${metrics.cycleStrokeRate.toFixed(1)}, drive dur: ${metrics.driveDuration.toFixed(2)}s, rec. dur: ${metrics.recoveryDuration.toFixed(2)}s` +
      `, stroke dur: ${metrics.cycleDuration.toFixed(2)}s`)
  }

  function addHeartRateToMetrics (metrics) {
    if (heartRate !== undefined && config.userSettings.restingHR <= heartRate &&  heartRate <= config.userSettings.maxHR) {
      metrics.heartrate = heartRate
    } else {
      metrics.heartrate = undefined
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
