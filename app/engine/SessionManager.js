'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module calculates the training specific metrics.
*/
import { EventEmitter } from 'events'
import { createRowingStatistics } from './RowingStatistics.js'
import { createOLSLinearSeries } from './utils/OLSLinearSeries.js'
import { secondsToTimeString } from '../tools/Helper.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createSessionManager (config) {
  const numOfDataPointsForAveraging = config.numOfPhasesForAveragingScreenData
  const emitter = new EventEmitter()
  const rowingStatistics = createRowingStatistics(config)
  let metrics
  let sessionState = 'WaitingForStart'
  let lastSessionState = 'WaitingForStart'
  let intervalSettings = []
  let intervalType = 'JustRow'
  let noSpontaneousPauses = 0
  let currentIntervalNumber = -1
  let intervalTargetDistance = 0
  let intervalTargetTime = 0
  let intervalPrevAccumulatedDistance = 0
  let intervalPrevAccumulatedTime = 0
  const splitDistance = 500 // ToDo: make flexible
  let splitNumber = 0
  let splitPrevAccumulatedDistance = 0
  const distanceOverTime = createOLSLinearSeries(Math.min(4, numOfDataPointsForAveraging))
  let heartrate = 0
  let heartRateBatteryLevel = 0

  metrics = rowingStatistics.getMetrics()
  resetMetricsContext()
  emitMetrics('metricsUpdate')

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the RowingEngine will react to and what it will ignore
  function handleCommand (commandName) {
    metrics = rowingStatistics.getMetrics()
    resetMetricsContext()
    switch (commandName) {
      case ('start'):
        startOrResumeTraining()
        sessionState = 'WaitingForStart'
        break
      case ('startOrResume'):
        allowResumeTraining()
        sessionState = 'WaitingForStart'
        break
      case ('pause'):
        pauseTraining()
        metrics = rowingStatistics.getMetrics() // as the pause button is forced, we need to fetch the zero'ed metrics
        metrics.metricsContext.isPauseStart = true
        sessionState = 'Paused'
        break
      case ('stop'):
        stopTraining()
        metrics.metricsContext.isSessionStop = true
        sessionState = 'Stopped'
        break
      case ('reset'):
        resetTraining()
        metrics.metricsContext.isPauseStart = true
        sessionState = 'WaitingForStart'
        break
      case 'blePeripheralMode':
        break
      case 'switchBlePeripheralMode':
        break
      case 'antPeripheralMode':
        break
      case 'switchAntPeripheralMode':
        break
      case 'hrmPeripheralMode':
        break
      case 'switchHrmMode':
        break
      case 'uploadTraining':
        break
      case 'stravaAuthorizationCode':
        break
      case 'shutdown':
        stopTraining()
        metrics.metricsContext.isSessionStop = true
        sessionState = 'Stopped'
        break
      default:
        log.error(`Recieved unknown command: ${commandName}`)
    }
    emitMetrics('metricsUpdate')
    lastSessionState = sessionState
  }

  function startOrResumeTraining () {
    rowingStatistics.startOrResumeTraining()
  }

  function allowResumeTraining () {
    rowingStatistics.allowResumeTraining()
  }

  function stopTraining () {
    distanceOverTime.push(metrics.totalMovingTime, metrics.totalLinearDistance)
    rowingStatistics.stopTraining()
  }

  // clear the metrics in case the user pauses rowing
  function pauseTraining () {
    log.debug('*** Paused rowing ***')
    distanceOverTime.push(metrics.totalMovingTime, metrics.totalLinearDistance)
    rowingStatistics.pauseTraining()
    noSpontaneousPauses++
  }

  function resetTraining () {
    stopTraining()
    rowingStatistics.resetTraining()
    rowingStatistics.allowResumeTraining()
    metrics = rowingStatistics.getMetrics()
    intervalSettings = null
    intervalSettings = []
    noSpontaneousPauses = 0
    currentIntervalNumber = -1
    intervalTargetDistance = 0
    intervalTargetTime = 0
    intervalPrevAccumulatedDistance = 0
    intervalPrevAccumulatedTime = 0
    splitNumber = 0
    splitPrevAccumulatedDistance = 0
    distanceOverTime.reset()
    resetMetricsContext()
    sessionState = 'WaitingForStart'
    lastSessionState = 'WaitingForStart'
  }

  function handleRotationImpulse (currentDt) {
    // Provide the rower with new data
    metrics = rowingStatistics.handleRotationImpulse(currentDt)

    resetMetricsContext()

    // ToDo: check if we need to update the projected end time of the interval
    if (metrics.metricsContext.isMoving && (metrics.metricsContext.isDriveStart || metrics.metricsContext.isRecoveryStart)) {
      distanceOverTime.push(metrics.totalMovingTime, metrics.totalLinearDistance)
    }

    // This is the core of the finite state machine that defines all state transitions
    switch (true) {
      case (lastSessionState === 'WaitingForStart' && metrics.strokeState === 'Drive'):
        startOrResumeTraining()
        sessionState = 'Rowing'
        metrics.metricsContext.isIntervalStart = true
        metrics.metricsContext.isSessionStart = true
        break
      case (lastSessionState === 'WaitingForStart'):
        // We can't change into the "Rowing" state since we are waiting for a drive phase that didn't come
        break
      case (lastSessionState === 'Paused' && metrics.strokeState === 'Drive'):
        startOrResumeTraining()
        sessionState = 'Rowing'
        metrics.metricsContext.isIntervalStart = true
        metrics.metricsContext.isPauseEnd = true
        break
      case (lastSessionState === 'Paused'):
        // We are in a paused state, and didn't see a drive, so nothing to do here
        break
      case (lastSessionState !== 'Stopped' && metrics.strokeState === 'Stopped'):
        // We do not need to refetch the metrics as RowingStatistics will already have zero-ed the metrics when strokeState = 'Stopped'
        // This is intended behaviour, as the rower/flywheel indicate the rower has stopped somehow
        stopTraining()
        sessionState = 'Stopped'
        metrics.metricsContext.isSessionStop = true
        break
      case (lastSessionState === 'Stopped'):
        // We are in a stopped state, and will remain there
        sessionState = 'Stopped'
        break
      case (lastSessionState === 'Rowing' && metrics.strokeState === 'WaitingForDrive'):
        // We do not need to refetch the metrics as RowingStatistics will already have zero-ed the metrics when strokeState = 'WaitingForDrive'
        // This is intended behaviour, as the rower/flywheel indicate the rower has paused somehow
        pauseTraining()
        sessionState = 'Paused'
        metrics.metricsContext.isPauseStart = true
        break
      case (lastSessionState === 'Rowing' && isIntervalTargetReached() && isNextIntervalAvailable()):
        activateNextIntervalParameters()
        sessionState = 'Rowing'
        splitNumber = 0
        splitPrevAccumulatedDistance = intervalPrevAccumulatedDistance
        metrics.metricsContext.isIntervalStart = true
        metrics.metricsContext.isSplitEnd = true
        break
      case (lastSessionState === 'Rowing' && isIntervalTargetReached()):
        // Here we do NOT want zero the metrics, as we want to keep the metrics we had when we crossed the finishline
        stopTraining()
        sessionState = 'Stopped'
        metrics.metricsContext.isSessionStop = true
        break
      case (lastSessionState === 'Rowing' && isSplitBoundaryReached()):
        sessionState = 'Rowing'
        splitNumber++
        splitPrevAccumulatedDistance = intervalPrevAccumulatedDistance + (splitNumber * splitDistance)
        metrics.metricsContext.isSplitEnd = true
        break
      case (lastSessionState === 'Rowing'):
        sessionState = 'Rowing'
        break
      default:
        log.error(`Time: ${metrics.totalMovingTime}, combination of ${sessionState} and state ${metrics.strokeState()} found in the Rowing Statistics, which is not captured by Finite State Machine`)
    }
    emitMetrics('metricsUpdate')
    lastSessionState = sessionState
  }

  // Basic metricContext structure
  function resetMetricsContext () {
    metrics.metricsContext.isSessionStart = false
    metrics.metricsContext.isIntervalStart = false
    metrics.metricsContext.isSplitEnd = false
    metrics.metricsContext.isPauseStart = false
    metrics.metricsContext.isPauseEnd = false
    metrics.metricsContext.isSessionStop = false
  }

  function setIntervalParameters (intervalParameters) {
    intervalSettings = intervalParameters
    currentIntervalNumber = -1
    if (intervalSettings.length > 0) {
      log.info(`Workout recieved with ${intervalSettings.length} interval(s)`)
      activateNextIntervalParameters()
      resetMetricsContext()
      emitMetrics('metricsUpdate')
    } else {
      // intervalParameters were empty, lets log this odd situation
      log.error('Recieved workout containing no intervals')
    }
  }

  function isIntervalTargetReached () {
    // This tests wether the end of the current interval is reached
    if ((intervalTargetDistance > 0 && metrics.totalLinearDistance >= intervalTargetDistance) || (intervalTargetTime > 0 && metrics.totalMovingTime >= intervalTargetTime)) {
      return true
    } else {
      return false
    }
  }

  function isNextIntervalAvailable () {
    // This function tests whether there is a next interval available
    if (currentIntervalNumber > -1 && intervalSettings.length > 0 && intervalSettings.length > (currentIntervalNumber + 1)) {
      return true
    } else {
      return false
    }
  }

  function activateNextIntervalParameters () {
    if (intervalSettings.length > 0 && intervalSettings.length > (currentIntervalNumber + 1)) {
      // This function sets the interval parameters in absolute distances/times
      // Thus the interval target always is a projected "finishline" from the current position
      intervalPrevAccumulatedTime = metrics.totalMovingTime
      intervalPrevAccumulatedDistance = metrics.totalLinearDistance

      currentIntervalNumber++
      switch (true) {
        case (intervalSettings[currentIntervalNumber].targetDistance > 0):
          // A target distance is set
          intervalType = 'Distance'
          intervalTargetTime = 0
          intervalTargetDistance = intervalPrevAccumulatedDistance + intervalSettings[currentIntervalNumber].targetDistance
          log.info(`Interval settings for interval ${currentIntervalNumber + 1} of ${intervalSettings.length}: Distance target ${intervalSettings[currentIntervalNumber].targetDistance} meters`)
          break
        case (intervalSettings[currentIntervalNumber].targetTime > 0):
          // A target time is set
          intervalType = 'Time'
          intervalTargetTime = intervalPrevAccumulatedTime + intervalSettings[currentIntervalNumber].targetTime
          intervalTargetDistance = 0
          log.info(`Interval settings for interval ${currentIntervalNumber + 1} of ${intervalSettings.length}: time target ${secondsToTimeString(intervalSettings[currentIntervalNumber].targetTime)} minutes`)
          break
        case (intervalSettings[currentIntervalNumber].targetCalories > 0):
          // A calorie target is set
          intervalType = 'Calories'
          // ToDo, define the Calorie based interval as well!!!
          log.info(`Interval settings for interval ${currentIntervalNumber + 1} of ${intervalSettings.length}: calorie target ${intervalSettings[currentIntervalNumber].targetCalories} calories`)
          break
        default:
          intervalType = 'JustRow'
          log.error(`Time: ${metrics.totalMovingTime}, encountered a completely empty interval, switching to Just Row!`)
      }
    } else {
      log.error('Interval error: there is no next interval!')
    }

    // As the interval has changed, we need to reset the splitnumber as well
    splitNumber = 0
  }

  // initiated when a new heart rate value is received from heart rate sensor
  function isSplitBoundaryReached () {
    if ((metrics.totalLinearDistance - intervalPrevAccumulatedDistance) >= ((splitNumber + 1) * splitDistance)) {
      // We have exceeded the boundary of the split
      return true
    } else {
      return false
    }
  }

  // initiated when a new heart rate value is received from heart rate sensor
  function handleHeartRateMeasurement (value) {
    heartrate = value.heartrate
    heartRateBatteryLevel = value.batteryLevel
  }

  function emitMetrics (emitType = 'metricsUpdate') {
    enrichMetrics()
    emitter.emit(emitType, metrics)
  }

  function enrichMetrics () {
    metrics.sessiontype = intervalType
    metrics.sessionStatus = sessionState // ToDo: REMOVE NAME CONVERSION
    // ToDo: Add split number
    metrics.intervalNumber = Math.max(noSpontaneousPauses + currentIntervalNumber + 1, 0) // Interval number, for both planned and unplanned intervals
    metrics.intervalMovingTime = metrics.totalMovingTime - intervalPrevAccumulatedTime
    metrics.intervalTargetTime = intervalTargetTime > intervalPrevAccumulatedTime ? intervalTargetTime - intervalPrevAccumulatedTime : 0
    metrics.intervalLinearDistance = metrics.totalLinearDistance - intervalPrevAccumulatedDistance
    metrics.intervalTargetDistance = intervalTargetDistance > intervalPrevAccumulatedDistance ? intervalTargetDistance - intervalPrevAccumulatedDistance : 0
    metrics.splitNumber = metrics.metricsContext.isSplitEnd ? splitNumber - 1 : splitNumber // This is needed to satisfy the RowingData recorder, it needs the start of the split to mark the end of the previous split
    metrics.splitLinearDistance = metrics.metricsContext.isSplitEnd ? splitDistance : metrics.totalLinearDistance - splitPrevAccumulatedDistance // This is needed to satisfy the RowingData recorder
    metrics.cycleProjectedEndTime = intervalTargetDistance > 0 ? distanceOverTime.projectY(intervalTargetDistance) : intervalTargetTime
    metrics.cycleProjectedEndLinearDistance = intervalTargetTime > 0 ? distanceOverTime.projectX(intervalTargetTime) : intervalTargetDistance
    metrics.heartrate = heartrate > 30 ? heartrate : 0 // OPRUIMEN VAN DEZE INJECTIE
    metrics.heartRateBatteryLevel = heartRateBatteryLevel // OPRUIMEN VAN DEZE INJECTIE
  }

  function getMetrics () { // TESTING PURPOSSES ONLY!
    enrichMetrics()
    return metrics
  }

  return Object.assign(emitter, {
    handleCommand,
    handleHeartRateMeasurement,
    handleRotationImpulse,
    setIntervalParameters
  })
}

export { createSessionManager }
