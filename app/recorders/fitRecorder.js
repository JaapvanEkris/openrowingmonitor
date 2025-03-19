'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them into the fit format
  It provides a fit-file content, and some metadata for the filewriter and the file-uploaders

*/

/* eslint-disable camelcase -- Imported parameters are not camelCase */
import log from 'loglevel'
import { createName } from './utils/decorators.js'
import { createSeries } from '../engine/utils/Series.js'
import { createSegmentMetrics } from './utils/segmentMetrics.js'
import { createVO2max } from './utils/VO2max.js'
import { FitWriter } from '@markw65/fit-file-writer'

export function createFITRecorder (config) {
  const type = 'fit'
  const postfix = '_rowing'
  const presentationName = 'Garmin fit'
  const lapMetrics = createSegmentMetrics()
  const sessionMetrics = createSegmentMetrics()
  const VO2max = createVO2max(config)
  const drag = createSeries()
  let heartRate = 0
  let sessionData = {}
  sessionData.workoutplan = []
  sessionData.workoutplan[0] = { type: 'justrow' }
  sessionData.lap = []
  let lapnumber = 0
  let postExerciseHR = []
  let lastMetrics = {}
  let fitfileContent
  let fitfileContentIsCurrent = true
  let allDataHasBeenWritten = true

  // This function handles all incomming commands. Here, the recordingmanager will have filtered
  // all unneccessary commands for us, so we only need to react to 'updateIntervalSettings', 'reset' and 'shutdown'
  async function handleCommand (commandName, data) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        if (!lastMetrics.metricsContext.isMoving) {
          setIntervalParameters(data)
        }
        break
      case ('reset'):
      case ('shutdown'):
        if (lastMetrics !== undefined && !!lastMetrics.metricsContext && lastMetrics.metricsContext.isMoving && lastMetrics.totalMovingTime > sessionData.lap[lapnumber].strokes[sessionData.lap[lapnumber].strokes.length - 1].totalMovingTime) {
          // We apperantly get a shutdown/crash during session
          addMetricsToStrokesArray(lastMetrics)
          updateLapMetrics(lastMetrics)
          updateSessionMetrics(lastMetrics)
          calculateLapMetrics(lastMetrics)
          calculateSessionMetrics(lastMetrics)
        }
        break
      default:
        log.error(`fitRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function setIntervalParameters (intervalParameters) {
    if (intervalParameters !== undefined && intervalParameters.length > 0) {
      sessionData.workoutplan = null
      sessionData.workoutplan = intervalParameters
    }
  }

  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        sessionData.startTime = metrics.timestamp
        lapnumber = 0
        startLap(lapnumber, metrics)
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        addMetricsToStrokesArray(metrics)
        updateLapMetrics(metrics)
        updateSessionMetrics(metrics)
        calculateLapMetrics(metrics)
        calculateSessionMetrics(metrics)
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseStart):
        addMetricsToStrokesArray(metrics)
        updateLapMetrics(metrics)
        updateSessionMetrics(metrics)
        calculateLapMetrics(metrics)
        calculateSessionMetrics(metrics)
        resetLapMetrics()
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseEnd):
        // The session is resumed, so it was a pause instead of a stop
        lapnumber++
        addRestLap(lapnumber, metrics, sessionData.lap[lapnumber - 1].endTime, sessionData.lap[lapnumber - 1].strokes[sessionData.lap[lapnumber - 1].strokes.length - 1].workoutStepNumber)
        lapnumber++
        startLap(lapnumber, metrics)
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isIntervalStart):
        addHeartRateToMetrics(metrics)
        if (metrics.metricsContext.isDriveStart) { addMetricsToStrokesArray(metrics) }
        updateLapMetrics(metrics)
        updateSessionMetrics(metrics)
        calculateLapMetrics(metrics)
        calculateSessionMetrics(metrics)
        resetLapMetrics()
        lapnumber++
        startLap(lapnumber, metrics)
        updateLapMetrics(metrics)
        break
      case (metrics.metricsContext.isSplitEnd):
        addHeartRateToMetrics(metrics)
        if (metrics.metricsContext.isDriveStart) { addMetricsToStrokesArray(metrics) }
        updateLapMetrics(metrics)
        updateSessionMetrics(metrics)
        calculateLapMetrics(metrics)
        calculateSessionMetrics(metrics)
        resetLapMetrics()
        lapnumber++
        startLap(lapnumber, metrics)
        updateLapMetrics(metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        addMetricsToStrokesArray(metrics)
        updateLapMetrics(metrics)
        updateSessionMetrics(metrics)
        break
    }
    lastMetrics = metrics
  }

  function addMetricsToStrokesArray (metrics) {
    addHeartRateToMetrics(metrics)
    sessionData.lap[lapnumber].strokes.push(metrics)
    VO2max.push(metrics)
    if (!isNaN(metrics.dragFactor) && metrics.dragFactor > 0) { drag.push(metrics.dragFactor) }
    fitfileContentIsCurrent = false
    allDataHasBeenWritten = false
  }

  function startLap (lapnumber, metrics) {
    sessionData.lap[lapnumber] = { totalMovingTimeAtStart: metrics.totalMovingTime }
    sessionData.lap[lapnumber].intensity = 'active'
    sessionData.lap[lapnumber].strokes = []
    sessionData.lap[lapnumber].totalLinearDistanceAtStart = metrics.totalLinearDistance
    sessionData.lap[lapnumber].totalCaloriesAtStart = metrics.totalCalories
    sessionData.lap[lapnumber].totalNumberOfStrokesAtStart = metrics.totalNumberOfStrokes
    sessionData.lap[lapnumber].startTime = metrics.timestamp
    sessionData.lap[lapnumber].workoutStepNumber = metrics.workoutStepNumber
    sessionData.lap[lapnumber].lapNumber = lapnumber + 1
  }

  function updateLapMetrics (metrics) {
    lapMetrics.push(metrics)
  }

  function calculateLapMetrics (metrics) {
    // We need to calculate the end time of the interval based on the time passed in the interval, as delay in message handling can cause weird effects here
    sessionData.lap[lapnumber].totalMovingTime = metrics.totalMovingTime - sessionData.lap[lapnumber].totalMovingTimeAtStart
    sessionData.lap[lapnumber].endTime = metrics.timestamp
    sessionData.lap[lapnumber].totalLinearDistance = metrics.totalLinearDistance - sessionData.lap[lapnumber].totalLinearDistanceAtStart
    sessionData.lap[lapnumber].totalCalories = metrics.totalCalories - sessionData.lap[lapnumber].totalCaloriesAtStart
    sessionData.lap[lapnumber].numberOfStrokes = metrics.totalNumberOfStrokes - sessionData.lap[lapnumber].totalNumberOfStrokesAtStart
    sessionData.lap[lapnumber].averageStrokeRate = lapMetrics.strokerate.average()
    sessionData.lap[lapnumber].maximumStrokeRate = lapMetrics.strokerate.maximum()
    sessionData.lap[lapnumber].averageStrokeDistance = lapMetrics.strokedistance.average()
    sessionData.lap[lapnumber].averagePower = lapMetrics.power.average()
    sessionData.lap[lapnumber].maximumPower = lapMetrics.power.maximum()
    sessionData.lap[lapnumber].averageSpeed = lapMetrics.linearVelocity.average()
    sessionData.lap[lapnumber].maximumSpeed = lapMetrics.linearVelocity.maximum()
    sessionData.lap[lapnumber].averageHeartrate = lapMetrics.heartrate.average()
    sessionData.lap[lapnumber].maximumHeartrate = lapMetrics.heartrate.maximum()
  }

  function resetLapMetrics () {
    lapMetrics.reset()
  }

  function addRestLap (lapnumber, metrics, startTime, workoutStepNo) {
    sessionData.lap[lapnumber] = { startTime }
    sessionData.lap[lapnumber].intensity = 'rest'
    sessionData.lap[lapnumber].workoutStepNumber = workoutStepNo
    sessionData.lap[lapnumber].lapNumber = lapnumber + 1
    sessionData.lap[lapnumber].endTime = metrics.timestamp
    VO2max.handleRestart(metrics.totalMovingTime)
  }

  function updateSessionMetrics (metrics) {
    sessionMetrics.push(metrics)
  }

  function calculateSessionMetrics (metrics) {
    sessionData.totalNoLaps = lapnumber + 1
    sessionData.totalMovingTime = metrics.totalMovingTime
    sessionData.totalLinearDistance = metrics.totalLinearDistance
    sessionData.totalNumberOfStrokes = metrics.totalNumberOfStrokes
    sessionData.endTime = sessionData.lap[lapnumber].endTime
  }

  function resetSessionMetrics () {
    sessionMetrics.reset()
    VO2max.reset()
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function recordHeartRate (value) {
    heartRate = value.heartrate
  }

  function addHeartRateToMetrics (metrics) {
    if (heartRate !== undefined && heartRate > 0) {
      metrics.heartrate = heartRate
    } else {
      metrics.heartrate = undefined
    }
  }

  async function fileContent () {
    const fitData = await workoutToFit(sessionData)
    if (fitData === undefined) {
      log.error('error creating fit file content')
      return undefined
    } else {
      return fitData
    }
  }

  async function workoutToFit (workout) {
    // The file content is filled and hasn't changed
    if (fitfileContentIsCurrent === true && fitfileContent !== undefined) { return fitfileContent }

    // See https://developer.garmin.com/fit/file-types/activity/ for the fields and their meaning. We use 'Smart Recording' per stroke.
    // See also https://developer.garmin.com/fit/cookbook/encoding-activity-files/ for a description of the filestructure and how timestamps should be implemented
    // We use 'summary last message sequencing' as the stream makes most sense that way
    const fitWriter = new FitWriter()
    const versionNumber = parseInt(process.env.npm_package_version, 10)

    // The file header
    fitWriter.writeMessage(
      'file_id',
      {
        time_created: fitWriter.time(workout.startTime),
        type: 'activity',
        manufacturer: 'concept2',
        product: 0,
        number: 0
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'file_creator',
      {
        software_version: versionNumber
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'device_info',
      {
        timestamp: fitWriter.time(workout.startTime),
        device_index: 0,
        device_type: 0,
        manufacturer: 'concept2'
      },
      null,
      true
    )

    // The below message deliberately leans on the config.userSettings as they might be changed by external sources
    fitWriter.writeMessage(
      'user_profile',
      {
        gender: config.userSettings.sex,
        weight: config.userSettings.weight,
        weight_setting: 'metric',
        resting_heart_rate: config.userSettings.restingHR,
        default_max_heart_rate: config.userSettings.maxHR
      },
      null,
      true
    )

    fitWriter.writeMessage(
      'sport',
      {
        sport: 'rowing',
        sub_sport: 'indoorRowing',
        name: 'Indoor rowing'
      },
      null,
      true
    )

    // The workout before the start
    await createWorkoutSteps(fitWriter, workout)

    // Write the metrics
    await createActivity(fitWriter, workout)

    fitfileContent = fitWriter.finish()
    fitfileContentIsCurrent = true
    return fitfileContent
  }

  async function createActivity (writer, workout) {
    // Start of the session
    await addTimerEvent(writer, workout.startTime, 'start')

    // Write all laps
    let i = 0
    while (i < workout.lap.length) {
      if (workout.lap[i].intensity === 'active') {
        await createActiveLap(writer, workout.lap[i])
      } else {
        // This is a rest interval
        await createRestLap(writer, workout.lap[i])
      }
      i++
    }

    // Finish the seesion with a stop event
    await addTimerEvent(writer, workout.endTime, 'stopAll')

    // Write the split summary
    // ToDo: Find out how records, splits, laps and sessions can be subdivided
    writer.writeMessage(
      'split',
      {
        start_time: writer.time(workout.startTime),
        split_type: 'intervalActive',
        total_elapsed_time: Math.abs(workout.endTime - workout.startTime) / 1000,
        total_timer_time: Math.abs(workout.endTime - workout.startTime) / 1000,
        total_moving_time: workout.totalMovingTime,
        total_distance: workout.totalLinearDistance,
        avg_speed: sessionMetrics.linearVelocity.average(),
        max_speed: sessionMetrics.linearVelocity.maximum(),
        end_time: writer.time(workout.endTime)
      },
      null,
      true
    )

    await createVO2MaxRecord(writer, workout)

    // Conclude with a session summary
    // See https://developer.garmin.com/fit/cookbook/durations/ for explanation about times
    writer.writeMessage(
      'session',
      {
        timestamp: writer.time(workout.endTime),
        message_index: 0,
        sport: 'rowing',
        sub_sport: 'indoorRowing',
        event: 'session',
        event_type: 'stop',
        trigger: 'activityEnd',
        start_time: writer.time(workout.startTime),
        total_elapsed_time: Math.abs(workout.endTime - workout.startTime) / 1000,
        total_timer_time: Math.abs(workout.endTime - workout.startTime) / 1000,
        total_moving_time: workout.totalMovingTime,
        total_distance: workout.totalLinearDistance,
        total_cycles: workout.totalNumberOfStrokes,
        avg_speed: sessionMetrics.linearVelocity.average(),
        max_speed: sessionMetrics.linearVelocity.maximum(),
        avg_power: sessionMetrics.power.average(),
        max_power: sessionMetrics.power.maximum(),
        avg_cadence: sessionMetrics.strokerate.average(),
        max_cadence: sessionMetrics.strokerate.maximum(),
        ...(sessionMetrics.heartrate.minimum() > 0 ? { min_heart_rate: sessionMetrics.heartrate.minimum() } : {}),
        ...(sessionMetrics.heartrate.average() > 0 ? { avg_heart_rate: sessionMetrics.heartrate.average() } : {}),
        ...(sessionMetrics.heartrate.maximum() > 0 ? { max_heart_rate: sessionMetrics.heartrate.maximum() } : {}),
        avg_stroke_distance: sessionMetrics.strokedistance.average(),
        num_laps: sessionData.totalNoLaps,
        first_lap_index: 0
      },
      null,
      true
    )

    // Activity summary
    writer.writeMessage(
      'activity',
      {
        timestamp: writer.time(workout.endTime),
        local_timestamp: writer.time(workout.startTime) - workout.startTime.getTimezoneOffset() * 60,
        total_timer_time: Math.abs(workout.endTime - workout.startTime) / 1000,
        num_sessions: 1,
        event: 'activity',
        event_type: 'stop',
        type: 'manual'
      },
      null,
      true
    )

    await addHRR2Event(writer)
  }

  async function addTimerEvent (writer, time, eventType) {
    writer.writeMessage(
      'event',
      {
        timestamp: writer.time(time),
        event: 'timer',
        event_type: eventType,
        event_group: 0
      },
      null,
      true
    )
  }

  async function createActiveLap (writer, lapdata) {
    // It is an active lap, after we make sure it is a completed lap, we can write all underlying records
    if (!!lapdata.totalMovingTime && lapdata.totalMovingTime > 0 && !!lapdata.totalLinearDistance && lapdata.totalLinearDistance > 0) {
      let i = 0
      while (i < lapdata.strokes.length) {
        await createTrackPoint(writer, lapdata.strokes[i])
        i++
      }

      // Conclude the lap with a summary
      // See https://developer.garmin.com/fit/cookbook/durations/ for how the different times are defined
      writer.writeMessage(
        'lap',
        {
          timestamp: writer.time(lapdata.endTime),
          message_index: lapdata.lapNumber - 1,
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          event: 'lap',
          wkt_step_index: lapdata.workoutStepNumber,
          event_type: 'stop',
          intensity: lapdata.intensity,
          ...(sessionData.totalNoLaps === lapdata.lapNumber ? { lap_trigger: 'sessionEnd' } : { lap_trigger: 'fitnessEquipment' }),
          start_time: writer.time(lapdata.startTime),
          total_elapsed_time: Math.abs(lapdata.endTime - lapdata.startTime) / 1000,
          total_timer_time: Math.abs(lapdata.endTime - lapdata.startTime) / 1000,
          total_moving_time: lapdata.totalMovingTime,
          total_distance: lapdata.totalLinearDistance,
          total_cycles: lapdata.numberOfStrokes,
          avg_cadence: lapdata.averageStrokeRate,
          max_cadence: lapdata.maximumStrokeRate,
          avg_stroke_distance: lapdata.averageStrokeDistance,
          total_calories: lapdata.totalCalories,
          avg_speed: lapdata.averageSpeed,
          max_speed: lapdata.maximumSpeed,
          avg_power: lapdata.averagePower,
          max_power: lapdata.maximumPower,
          ...(lapdata.averageHeartrate > 0 ? { avg_heart_rate: lapdata.averageHeartrate } : {}),
          ...(lapdata.maximumHeartrate > 0 ? { max_heart_rate: lapdata.maximumHeartrate } : {})
        },
        null,
        sessionData.totalNoLaps === lapdata.lapNumber
      )
    }
  }

  async function createRestLap (writer, lapdata) {
    // First, make sure the rest lap is complete
    if (!!lapdata.endTime && lapdata.endTime > 0 && !!lapdata.startTime && lapdata.startTime > 0) {
      // Pause the session with a stop event at the begin of the rest interval
      await addTimerEvent(writer, lapdata.startTime, 'stopAll')

      // Add a rest lap summary
      // See https://developer.garmin.com/fit/cookbook/durations/ for how the different times are defined
      writer.writeMessage(
        'lap',
        {
          timestamp: writer.time(lapdata.endTime),
          message_index: lapdata.lapNumber - 1,
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          event: 'lap',
          wkt_step_index: lapdata.workoutStepNumber,
          event_type: 'stop',
          intensity: lapdata.intensity,
          lap_trigger: 'fitnessEquipment',
          start_time: writer.time(lapdata.startTime),
          total_elapsed_time: Math.abs(lapdata.endTime - lapdata.startTime) / 1000,
          total_timer_time: Math.abs(lapdata.endTime - lapdata.startTime) / 1000,
          total_moving_time: 0,
          total_distance: 0,
          total_cycles: 0,
          avg_cadence: 0,
          max_cadence: 0,
          avg_stroke_distance: 0,
          total_calories: 0,
          avg_speed: 0,
          max_speed: 0,
          avg_power: 0,
          max_power: 0
        },
        null,
        sessionData.totalNoLaps === lapdata.lapNumber
      )

      // Restart of the session
      await addTimerEvent(writer, lapdata.endTime, 'start')
    }
  }

  async function createTrackPoint (writer, trackpoint) {
    writer.writeMessage(
      'record',
      {
        timestamp: writer.time(trackpoint.timestamp),
        distance: trackpoint.totalLinearDistance,
        total_cycles: trackpoint.totalNumberOfStrokes,
        activity_type: 'fitnessEquipment',
        ...(trackpoint.cycleLinearVelocity > 0 || trackpoint.metricsContext.isPauseStart ? { speed: trackpoint.cycleLinearVelocity } : {}),
        ...(trackpoint.cyclePower > 0 || trackpoint.metricsContext.isPauseStart ? { power: trackpoint.cyclePower } : {}),
        ...(trackpoint.cycleStrokeRate > 0 ? { cadence: trackpoint.cycleStrokeRate } : {}),
        ...(trackpoint.cycleDistance > 0 ? { cycle_length16: trackpoint.cycleDistance } : {}),
        ...(trackpoint.dragFactor > 0 || trackpoint.dragFactor < 255 ? { resistance: trackpoint.dragFactor } : {}), // As the data is stored in an int8, we need to guard the maximum
        ...(trackpoint.heartrate !== undefined && trackpoint.heartrate > 0 ? { heart_rate: trackpoint.heartrate } : {})
      }
    )
  }

  async function createWorkoutSteps (writer, workout) {
    // See https://developer.garmin.com/fit/file-types/workout/ for a general description of the workout structure
    // and https://developer.garmin.com/fit/cookbook/encoding-workout-files/ for a detailed description of the workout structure
    writer.writeMessage(
      'workout',
      {
        sport: 'rowing',
        sub_sport: 'indoorRowing',
        capabilities: 'fitnessEquipment',
        num_valid_steps: workout.workoutplan.length,
        wkt_name: `Indoor rowing ${createName(workout.totalLinearDistance, workout.totalMovingTime)}`
      },
      null,
      true
    )

    let i = 0
    while (i < workout.workoutplan.length) {
      switch (true) {
        case (workout.workoutplan[i].type === 'distance' && workout.workoutplan[i].targetDistance > 0):
          // A target distance is set
          createWorkoutStep(writer, i, 'distance', workout.workoutplan[i].targetDistance * 100, 'active')
          break
        case (workout.workoutplan[i].type === 'time' && workout.workoutplan[i].targetTime > 0):
          // A target time is set
          createWorkoutStep(writer, i, 'time', workout.workoutplan[i].targetTime, 'active')
          break
        case (workout.workoutplan[i].type === 'rest' && workout.workoutplan[i].targetTime > 0):
          // A target time is set
          createWorkoutStep(writer, i, 'time', workout.workoutplan[i].targetTime, 'rest')
          break
        case (workout.workoutplan[i].type === 'justrow'):
          createWorkoutStep(writer, i, 'open', 0, 'active')
          break
        default:
          // Nothing to do here, ignore malformed data
      }
      i++
    }
  }

  async function createWorkoutStep (writer, stepNumber, durationType, durationValue, intensityValue) {
    writer.writeMessage(
      'workout_step',
      {
        message_index: stepNumber,
        duration_type: durationType,
        ...(durationValue > 0 ? { duration_value: durationValue } : {}),
        intensity: intensityValue
      },
      null,
      true
    )
  }

  async function createVO2MaxRecord (writer, workout) {
    if (!isNaN(VO2max.result()) && VO2max.result() > 10 && VO2max.result() < 60) {
      writer.writeMessage(
        'max_met_data',
        {
          update_time: writer.time(workout.endTime),
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          vo2_max: VO2max.result(),
          max_met_category: 'generic'
        },
        null,
        true
      )
    }
  }

  async function addHRR2Event (writer) {
    if (postExerciseHR.length >= 2 && !isNaN(postExerciseHR[2]) && postExerciseHR[2] > 0) {
      writer.writeMessage(
        'event',
        {
          timestamp: writer.time(new Date()),
          event: 'recoveryHr',
          event_type: 'marker',
          data: postExerciseHR[2]
        },
        null,
        true
      )
    }
  }

  function measureRecoveryHR () {
    // This function is called when the rowing session is stopped. postExerciseHR[0] is the last measured excercise HR
    // Thus postExerciseHR[1] is Recovery HR after 1 min, etc..
    if (!isNaN(heartRate) && config.userSettings.restingHR <= heartRate && heartRate <= config.userSettings.maxHR) {
      log.debug(`*** Fit-recorder HRR-${postExerciseHR.length}: ${heartRate}`)
      postExerciseHR.push(heartRate)
      fitfileContentIsCurrent = false
      allDataHasBeenWritten = false
      if (postExerciseHR.length < 4) {
        // We haven't got three post-exercise HR measurements yet, let's schedule the next measurement
        setTimeout(measureRecoveryHR, 60000)
      } else {
        log.debug('*** Skipped HRR measurement')
      }
    }
  }

  function minimumDataAvailable () {
    return (minimumRecordingTimeHasPassed() && minimumNumberOfStrokesHaveCompleted())
  }

  function minimumRecordingTimeHasPassed () {
    const minimumRecordingTimeInSeconds = 10
    if (lastMetrics !== undefined && lastMetrics.totalMovingTime !== undefined) {
      const strokeTimeTotal = lastMetrics.totalMovingTime
      return (strokeTimeTotal > minimumRecordingTimeInSeconds)
    } else {
      return false
    }
  }

  function minimumNumberOfStrokesHaveCompleted () {
    const minimumNumberOfStrokes = 2
    if (lastMetrics !== undefined && lastMetrics.totalNumberOfStrokes !== undefined) {
      const noStrokes = lastMetrics.totalNumberOfStrokes
      return (noStrokes > minimumNumberOfStrokes)
    } else {
      return false
    }
  }

  function totalRecordedDistance () {
    if (!!sessionData.totalLinearDistance && sessionData.totalLinearDistance > 0) {
      return sessionData.totalLinearDistance
    } else {
      return 0
    }
  }

  function totalRecordedMovingTime () {
    if (!!sessionData.totalMovingTime && sessionData.totalMovingTime > 0) {
      return sessionData.totalMovingTime
    } else {
      return 0
    }
  }

  function sessionDrag () {
    return drag.average()
  }

  function sessionVO2Max () {
    if (VO2max.result() > 10 && VO2max.result() < 60) {
      return VO2max.result()
    } else {
      return undefined
    }
  }

  function sessionHRR () {
    if (postExerciseHR.length > 1 && (postExerciseHR[0] > (0.7 * config.userSettings.maxHR))) {
      // Recovery Heartrate is only defined when the last excercise HR is above 70% of the maximum Heartrate
      return postExerciseHR
    } else {
      return []
    }
  }

  function reset () {
    heartRate = 0
    lapnumber = 0
    resetSessionMetrics()
    resetLapMetrics()
    sessionData = null
    sessionData = {}
    sessionData.workoutplan = []
    sessionData.workoutplan[0] = { type: 'justrow' }
    sessionData.lap = []
    postExerciseHR = null
    postExerciseHR = []
    VO2max.reset()
    drag.reset()
    lastMetrics = {}
    fitfileContent = null
    fitfileContentIsCurrent = true
    allDataHasBeenWritten = true
  }

  return {
    handleCommand,
    setIntervalParameters,
    recordRowingMetrics,
    recordHeartRate,
    minimumDataAvailable,
    fileContent,
    type,
    postfix,
    presentationName,
    totalRecordedDistance,
    totalRecordedMovingTime,
    sessionDrag,
    sessionVO2Max,
    sessionHRR,
    allDataHasBeenWritten,
    reset
  }
}
