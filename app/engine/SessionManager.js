'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module calculates the training specific metrics.
*/
/* eslint-disable max-lines -- This handles quite a complex state machine with three levels of workout segments, not much we can do about it */
import { EventEmitter } from 'events'
import { createRowingStatistics } from './RowingStatistics.js'
import { createWorkoutSegment } from './utils/workoutSegment.js'
import { secondsToTimeString } from '../tools/Helper.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

export function createSessionManager (config) {
  const emitter = new EventEmitter()
  const rowingStatistics = createRowingStatistics(config)
  let metrics
  let lastBroadcastedMetrics = { }
  let pauseTimer
  let pauseCountdownTimer = 0
  let watchdogTimer
  const watchdogTimout = 1000 * config.rowerSettings.maximumStrokeTimeBeforePause // Pause timeout in miliseconds
  let sessionState = 'WaitingForStart'
  let lastSessionState = 'WaitingForStart'
  let intervalSettings = []
  let currentIntervalNumber = -1
  const interval = createWorkoutSegment(config)
  const split = createWorkoutSegment(config)
  let splitNumber = 0

  metrics = rowingStatistics.getMetrics()
  resetMetricsSessionContext(metrics)
  interval.setStart(metrics)
  split.setStart(metrics)
  emitMetrics(metrics)
  lastBroadcastedMetrics = { ...metrics }

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the RowingEngine will react to and what it will ignore
  // eslint-disable-next-line no-unused-vars
  function handleCommand (commandName, data, client) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        if (sessionState !== 'Rowing') {
          setIntervalParameters(data)
        } else {
          log.debug(`SessionManager, time: ${metrics.totalMovingTime}, rejected new interval settings as session was already in progress`)
        }
        break
      case ('start'):
        if (sessionState !== 'Rowing') {
          clearTimeout(pauseTimer)
          StartOrResumeTraining(lastBroadcastedMetrics)
          sessionState = 'WaitingForStart'
        }
        break
      case ('startOrResume'):
        if (sessionState !== 'Rowing') {
          clearTimeout(pauseTimer)
          StartOrResumeTraining(lastBroadcastedMetrics)
          sessionState = 'WaitingForStart'
        }
        break
      case ('pause'):
        if (sessionState === 'Rowing') {
          pauseTraining(lastBroadcastedMetrics)
          lastBroadcastedMetrics = rowingStatistics.getMetrics() // as the pause button is forced, we need to fetch the zero'ed metrics
          resetMetricsSessionContext(lastBroadcastedMetrics)
          lastBroadcastedMetrics.metricsContext.isPauseStart = true
          sessionState = 'Paused'
        }
        break
      case ('stop'):
        if (sessionState === 'Rowing') {
          clearTimeout(pauseTimer)
          stopTraining(lastBroadcastedMetrics)
          lastBroadcastedMetrics.metricsContext.isSessionStop = true
          sessionState = 'Stopped'
        }
        break
      case ('requestControl'):
        break
      case ('reset'):
        clearTimeout(pauseTimer)
        lastBroadcastedMetrics.metricsContext.isSessionStop = true
        emitMetrics(lastBroadcastedMetrics)
        resetTraining(lastBroadcastedMetrics)
        lastBroadcastedMetrics = rowingStatistics.getMetrics() // as the engine is reset, we need to fetch the zero'ed metrics
        resetMetricsSessionContext(lastBroadcastedMetrics)
        sessionState = 'WaitingForStart'
        break
      case 'switchBlePeripheralMode':
        break
      case 'switchAntPeripheralMode':
        break
      case 'switchHrmMode':
        break
      case 'refreshPeripheralConfig':
        break
      case 'authorizeStrava':
        break
      case 'uploadTraining':
        break
      case 'stravaAuthorizationCode':
        break
      case 'shutdown':
        clearTimeout(pauseTimer)
        stopTraining(lastBroadcastedMetrics)
        lastBroadcastedMetrics.metricsContext.isSessionStop = true
        sessionState = 'Stopped'
        break
      default:
        log.error(`Recieved unknown command: ${commandName}`)
    }
    emitMetrics(lastBroadcastedMetrics)
    lastSessionState = sessionState
  }

  function StartOrResumeTraining (baseMetrics) {
    rowingStatistics.allowStartOrResumeTraining()
  }

  function stopTraining (baseMetrics) {
    clearTimeout(watchdogTimer)
    interval.push(baseMetrics)
    split.push(baseMetrics)
    rowingStatistics.stopTraining()
  }

  // clear the metrics in case the user pauses rowing
  function pauseTraining (baseMetrics) {
    clearTimeout(watchdogTimer)
    interval.push(baseMetrics)
    rowingStatistics.pauseTraining()
  }

  function resetTraining (baseMetrics) {
    stopTraining(baseMetrics)
    rowingStatistics.resetTraining()
    rowingStatistics.allowStartOrResumeTraining()
    intervalSettings = null
    intervalSettings = []
    currentIntervalNumber = -1
    pauseCountdownTimer = 0
    splitNumber = 0
    metrics = rowingStatistics.getMetrics()
    resetMetricsSessionContext(metrics)
    sessionState = 'WaitingForStart'
    lastSessionState = 'WaitingForStart'
    interval.reset()
    interval.setStart(metrics)
    split.setStart(metrics)
    emitMetrics(metrics)
  }

  /* eslint-disable max-statements, complexity -- This handles quite a complex state machine with three levels of workout segments, not much we can do about it */
  function handleRotationImpulse (currentDt) {
    let temporaryDatapoint

    // Clear the watchdog as we got a currentDt, we'll set it at the end again
    clearTimeout(watchdogTimer)

    // Provide the rower with new data
    metrics = rowingStatistics.handleRotationImpulse(currentDt)
    resetMetricsSessionContext(metrics)
    if (lastSessionState === 'Rowing') {
      // If we are moving, timestamps should be based on movingTime as it is more accurate and consistent for the consumers
      metrics.timestamp = new Date(split.getStartTimestamp().getTime() + (split.timeSinceStart(metrics) * 1000))
    } else {
      metrics.timestamp = new Date()
    }

    if (metrics.metricsContext.isMoving && (metrics.metricsContext.isDriveStart || metrics.metricsContext.isRecoveryStart)) {
      interval.push(metrics)
      split.push(metrics)
    }

    // This is the core of the finite state machine that defines all state transitions
    switch (true) {
      case (lastSessionState === 'WaitingForStart' && metrics.metricsContext.isMoving === true):
        StartOrResumeTraining(metrics)
        sessionState = 'Rowing'
        metrics.metricsContext.isSessionStart = true
        interval.setStartTimestamp(new Date(metrics.timestamp.getTime() - metrics.totalMovingTime * 1000))
        split.setStartTimestamp(new Date(metrics.timestamp.getTime() - metrics.totalMovingTime * 1000))
        emitMetrics(metrics)
        break
      case (lastSessionState === 'WaitingForStart'):
        // We can't change into the "Rowing" state since we are waiting for a drive phase that didn't come
        emitMetrics(metrics)
        break
      case (lastSessionState === 'Paused' && metrics.metricsContext.isMoving === true):
        StartOrResumeTraining(metrics)
        sessionState = 'Rowing'
        metrics.metricsContext.isPauseEnd = true
        emitMetrics(metrics)
        if (interval.type() === 'rest') {
          metrics.metricsContext.isIntervalStart = true // ToDo: REMOVE ME!!!
          metrics.metricsContext.isIntervalEnd = true
          activateNextIntervalParameters(metrics)
        } else {
          activateNextSplitParameters(metrics)
        }
        break
      case (lastSessionState === 'Paused'):
        // We are in a paused state, and didn't see a drive, so nothing to do here
        emitMetrics(metrics)
        break
      case (lastSessionState !== 'Stopped' && metrics.strokeState === 'Stopped'):
        // We do not need to refetch the metrics as RowingStatistics will already have zero-ed the metrics when strokeState = 'Stopped'
        // This is intended behaviour, as the rower/flywheel indicate the rower has stopped somehow
        stopTraining(metrics)
        sessionState = 'Stopped'
        metrics.metricsContext.isSessionStop = true
        emitMetrics(metrics)
        break
      case (lastSessionState === 'Stopped'):
        // We are in a stopped state, and will remain there
        sessionState = 'Stopped'
        emitMetrics(metrics)
        break
      case (lastSessionState === 'Rowing' && metrics.strokeState === 'WaitingForDrive'):
        // We do not need to refetch the metrics as RowingStatistics will already have zero-ed the metrics when strokeState = 'WaitingForDrive'
        // This is intended behaviour, as the rower/flywheel indicate the rower has paused somehow
        pauseTraining(metrics)
        sessionState = 'Paused'
        metrics.metricsContext.isPauseStart = true
        metrics.metricsContext.isSplitEnd = true
        emitMetrics(metrics)
        activateNextSplitParameters(metrics)
        break
      case (lastSessionState === 'Rowing' && metrics.metricsContext.isMoving && interval.isEndReached(metrics) && isNextIntervalActive()):
        // The next interval is an active one, so we just keep on going
        // As we typically overshoot our interval target, we project the intermediate value
        temporaryDatapoint = interval.interpolateEnd(lastBroadcastedMetrics, metrics)
        sessionState = 'Rowing'
        if (temporaryDatapoint.modified) {
          // The intermediate datapoint is actually different
          resetMetricsSessionContext(temporaryDatapoint)
          temporaryDatapoint.metricsContext.isIntervalStart = true // ToDo: REMOVE ME!!!
          temporaryDatapoint.metricsContext.isIntervalEnd = true
          temporaryDatapoint.metricsContext.isSplitEnd = true
          emitMetrics(temporaryDatapoint)
          activateNextIntervalParameters(temporaryDatapoint)
          emitMetrics(metrics)
        } else {
          metrics.metricsContext.isIntervalStart = true // ToDo: REMOVE ME!!!
          metrics.metricsContext.isIntervalEnd = true
          metrics.metricsContext.isSplitEnd = true
          emitMetrics(metrics)
          activateNextIntervalParameters(metrics)
        }
        break
      case (lastSessionState === 'Rowing' && metrics.metricsContext.isMoving && interval.isEndReached(metrics) && isNextIntervalAvailable()):
        // There is a next interval, but it is a rest interval, so we forcefully stop the session
        // As we typically overshoot our interval target, we project the intermediate value
        stopTraining(metrics)
        temporaryDatapoint = interval.interpolateEnd(lastBroadcastedMetrics, metrics)
        sessionState = 'Paused'
        if (temporaryDatapoint.modified) {
          // The intermediate datapoint is actually different
          resetMetricsSessionContext(temporaryDatapoint)
          temporaryDatapoint.metricsContext.isIntervalStart = true // ToDo: REMOVE ME!!!
          temporaryDatapoint.metricsContext.isIntervalEnd = true
          temporaryDatapoint.metricsContext.isSplitEnd = true
          temporaryDatapoint.metricsContext.isPauseStart = true
          emitMetrics(temporaryDatapoint)
          activateNextIntervalParameters(temporaryDatapoint)
        } else {
          metrics.metricsContext.isIntervalStart = true // ToDo: REMOVE ME!!!
          metrics.metricsContext.isIntervalEnd = true
          metrics.metricsContext.isSplitEnd = true
          metrics.metricsContext.isPauseStart = true
          emitMetrics(metrics)
          activateNextIntervalParameters(metrics)
        }
        metrics = rowingStatistics.getMetrics() // Here we want to switch to a zero-ed message as the flywheel has stopped
        resetMetricsSessionContext(metrics)
        pauseCountdownTimer = interval.timeToEnd(metrics)
        pauseTimer = setTimeout(onPauseTimer, 100)
        break
      case (lastSessionState === 'Rowing' && metrics.metricsContext.isMoving && interval.isEndReached(metrics)):
        // Here we do NOT want zero the metrics, as we want to keep the metrics we had when we crossed the finishline
        stopTraining(metrics)
        sessionState = 'Stopped'
        temporaryDatapoint = interval.interpolateEnd(lastBroadcastedMetrics, metrics)
        if (temporaryDatapoint.modified) {
          resetMetricsSessionContext(temporaryDatapoint)
          temporaryDatapoint.metricsContext.isSessionStop = true
          emitMetrics(temporaryDatapoint)
        } else {
          metrics.metricsContext.isSessionStop = true
          emitMetrics(metrics)
        }
        break
      case (lastSessionState === 'Rowing' && metrics.metricsContext.isMoving && split.isEndReached(metrics)):
        sessionState = 'Rowing'
        temporaryDatapoint = split.interpolateEnd(lastBroadcastedMetrics, metrics)
        if (temporaryDatapoint.modified) {
          resetMetricsSessionContext(temporaryDatapoint)
          temporaryDatapoint.metricsContext.isSplitEnd = true
          emitMetrics(temporaryDatapoint)
          activateNextSplitParameters(temporaryDatapoint)
          emitMetrics(metrics)
        } else {
          metrics.metricsContext.isSplitEnd = true
          emitMetrics(metrics)
          activateNextSplitParameters(metrics)
        }
        break
      case (lastSessionState === 'Rowing' && metrics.metricsContext.isMoving):
        sessionState = 'Rowing'
        emitMetrics(metrics)
        break
      default:
        log.error(`SessionManager: Time: ${metrics.totalMovingTime}, combination of ${sessionState} and state ${metrics.strokeState} is not captured by Finite State Machine`)
    }

    if (sessionState === 'Rowing' && metrics.metricsContext.isMoving) {
      watchdogTimer = setTimeout(onWatchdogTimeout, watchdogTimout)
    }
    lastSessionState = sessionState
    lastBroadcastedMetrics = { ...metrics }
  }
  /* eslint-enable max-statements, complexity */

  // Basic metricContext structure
  function resetMetricsSessionContext (metricsToReset) {
    metricsToReset.metricsContext.isSessionStart = false
    metricsToReset.metricsContext.isIntervalStart = false // ToDo: REMOVE ME!!!
    metricsToReset.metricsContext.isIntervalEnd = false
    metricsToReset.metricsContext.isSplitEnd = false
    metricsToReset.metricsContext.isPauseStart = false
    metricsToReset.metricsContext.isPauseEnd = false
    metricsToReset.metricsContext.isSessionStop = false
  }

  function setIntervalParameters (intervalParameters) {
    intervalSettings = null
    intervalSettings = intervalParameters
    currentIntervalNumber = -1
    if (intervalSettings.length > 0) {
      log.info(`SessionManager: Workout recieved with ${intervalSettings.length} interval(s)`)
      metrics = rowingStatistics.getMetrics()
      activateNextIntervalParameters(metrics)
      resetMetricsSessionContext(metrics)
      emitMetrics(metrics)
    } else {
      // intervalParameters were empty, lets log this odd situation
      log.error('SessionManager: Recieved workout containing no intervals')
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

  function isNextIntervalActive () {
    // This function tests whether there is a next interval available
    if (currentIntervalNumber > -1 && intervalSettings.length > 0 && intervalSettings.length > (currentIntervalNumber + 1)) {
      return (intervalSettings[currentIntervalNumber + 1].type !== 'rest')
    } else {
      return false
    }
  }

  function activateNextIntervalParameters (baseMetrics) {
    if (intervalSettings.length > 0 && intervalSettings.length > (currentIntervalNumber + 1)) {
      // This function sets the interval parameters in absolute distances/times
      // Thus the interval target always is a projected "finishline" from the current position
      currentIntervalNumber++
      interval.setStart(baseMetrics)
      interval.setEnd(intervalSettings[currentIntervalNumber])
      log.info(`Interval settings for interval ${currentIntervalNumber + 1} of ${intervalSettings.length}: Distance target ${interval.targetDistance()} meters, time target ${secondsToTimeString(interval.targetTime())} minutes, split at ${interval.splitDistance()} meters`)

      // As the interval has changed, we need to reset the split metrics
      activateNextSplitParameters(baseMetrics)
    } else {
      log.error('SessionManager: expected a next interval, but did not find one!')
    }
  }

  function activateNextSplitParameters (baseMetrics) {
    splitNumber++
    split.setStart(baseMetrics)
    split.setEnd(interval.getSplit())
  }

  function onPauseTimer () {
    pauseCountdownTimer = pauseCountdownTimer - 0.1
    if (pauseCountdownTimer > 0) {
      // The countdowntimer still has some time left on it
      pauseTimer = setTimeout(onPauseTimer, 100)
    } else {
      // The timer has run out
      pauseTraining(lastBroadcastedMetrics)
      sessionState = 'Paused'
      lastBroadcastedMetrics = rowingStatistics.getMetrics()
      resetMetricsSessionContext(lastBroadcastedMetrics)
      pauseCountdownTimer = 0
      log.debug(`Time: ${lastBroadcastedMetrics.totalMovingTime}, rest interval ended`)
    }
    lastBroadcastedMetrics.timestamp = new Date()
    emitMetrics(lastBroadcastedMetrics)
  }

  function emitMetrics (metricsToEmit) {
    enrichMetrics(metricsToEmit)
    emitter.emit('metricsUpdate', metricsToEmit)
  }

  function enrichMetrics (metricsToEnrich) {
    const intervalMetrics = interval.metrics(metricsToEnrich)
    const splitMetrics = split.metrics(metricsToEnrich)
    metricsToEnrich.sessiontype = interval.type()
    metricsToEnrich.sessionStatus = sessionState // ToDo: remove this naming change by changing the consumers
    metricsToEnrich.workoutStepNumber = Math.max(currentIntervalNumber, 0) // Interval number, to keep in sync with the workout plan
    metricsToEnrich.pauseCountdownTime = Math.max(pauseCountdownTimer, 0) // Time left on the countdown timer
    metricsToEnrich.intervalMovingTime = intervalMetrics.movingTime.sinceStart // ToDo: REMOVE ME
    metricsToEnrich.intervalTargetTime = intervalMetrics.movingTime.target // ToDo: REMOVE ME
    metricsToEnrich.interval = { ...interval.metrics(metricsToEnrich) }
    metricsToEnrich.splitNumber = splitNumber
    metricsToEnrich.split = { ...split.metrics(metricsToEnrich) }
    metricsToEnrich.intervalLinearDistance = intervalMetrics.distance.fromStart // ToDo: REMOVE ME
    metricsToEnrich.intervalTargetDistance = intervalMetrics.distance.target // ToDo: REMOVE ME
    metricsToEnrich.splitLinearDistance = splitMetrics.distance.fromStart // ToDo: REMOVE ME
    metricsToEnrich.cycleProjectedEndTime = intervalMetrics.movingTime.projectedEnd // ToDo: REMOVE ME
    metricsToEnrich.cycleProjectedEndLinearDistance = intervalMetrics.distance.projectedEnd // ToDo: REMOVE ME
  }

  function onWatchdogTimeout () {
    log.error(`Time: ${metrics.totalMovingTime}, Forced a session stop due to unexpeted flywheel stop, exceeding the maximumStrokeTimeBeforePause (i.e. ${watchdogTimout / 1000} seconds) without new datapoints`)
    metrics = rowingStatistics.getMetrics()
    stopTraining(metrics)
    resetMetricsSessionContext(metrics)
    metrics.metricsContext.isSessionStop = true
    sessionState = 'Stopped'
    interval.push(metrics)
    emitMetrics(metrics)
  }

  function getMetrics () {
    // TESTING PURPOSSES ONLY!
    enrichMetrics(metrics)
    return metrics
  }

  return Object.assign(emitter, {
    handleCommand,
    handleRotationImpulse,
    getMetrics
  })
}
