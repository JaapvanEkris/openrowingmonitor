'use strict'
/*
 * OpenRowingMonitor, https://github.com/JaapvanEkris/openrowingmonitor
 */
/**
 * @file This Module captures the metrics of a rowing session and persists them into the fit format
 * It provides a fit-file content, and some metadata for the filewriter and the file-uploaders
 *
 * Be aware: OpenRowingMonitor and Garmin actually use conflicting terminology!
 * - An OpenRowingMonitor Interval is nearly identical as a Garmin Split (aside the handling of unplanned pauses)
 * - An OpenRowingMonitor Split is identical to a Garmin lap
 *
 * Analysis of Garmin files show that splits, laps and strokes are completely disconnected, so we use that loose structure here as well
 */
/* eslint-disable camelcase -- Imported parameters are not camelCase */
/* eslint-disable max-lines -- The length is governed by the fit-parameterisation, which we can't control */
import log from 'loglevel'
import { createName } from './utils/decorators.js'
import { createSeries } from '../engine/utils/Series.js'
import { createVO2max } from './utils/VO2max.js'
import { FitWriter } from '@markw65/fit-file-writer'

export function createFITRecorder (config) {
  const type = 'fit'
  const postfix = '_rowing'
  const presentationName = 'Garmin fit'
  const sessionHRMetrics = createSeries()
  const splitActiveHRMetrics = createSeries()
  const splitRestHRMetrics = createSeries()
  const splitVelocityMetrics = createSeries()
  const lapHRMetrics = createSeries()
  const VO2max = createVO2max(config)
  let heartRate = 0
  let sessionData = {}
  sessionData.workoutplan = []
  sessionData.workoutplan[0] = { type: 'justrow' }
  sessionData.splits = []
  sessionData.laps = []
  sessionData.strokes = []
  sessionData.noActiveSplits = 0
  sessionData.noRestSplits = 0
  sessionData.complete = false
  let postExerciseHR = []
  let lastMetrics = {}
  let fitfileContent
  let fitfileContentIsCurrent = true
  let allDataHasBeenWritten = true

  /**
   * This function handles all incomming commands. Here, the recordingmanager will have filtered
   * all unneccessary commands for us, so we only need to react to 'updateIntervalSettings', 'reset' and 'shutdown'
   */
  async function handleCommand (commandName, data) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        if (!lastMetrics.metricsContext.isMoving) {
          setIntervalParameters(data)
        }
        break
      case ('reset'):
      case ('shutdown'):
        if (lastMetrics !== undefined && !!lastMetrics.metricsContext && lastMetrics.metricsContext.isMoving === true && (lastMetrics.totalNumberOfStrokes > 0) && (lastMetrics.totalMovingTime > sessionData.totalMovingTime)) {
          // We apperantly get a shutdown/crash during session
          addMetricsToStrokesArray(lastMetrics)
          calculateLapMetrics(lastMetrics)
          calculateSplitMetrics(lastMetrics)
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

  /**
   * This function records the metrics in the structure for he fit-file to be generated
   * @param {Metrics} metrics to be recorded
   */
  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        sessionData.startTime = metrics.timestamp
        startSplit(metrics)
        startLap(metrics)
        sessionHRMetrics.reset()
        splitActiveHRMetrics.reset()
        splitRestHRMetrics.reset()
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSessionStop && lastMetrics.sessionState !== 'Stopped'):
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        calculateSplitMetrics(metrics)
        calculateSessionMetrics(metrics)
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseStart && lastMetrics.sessionState === 'Rowing'):
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        calculateSplitMetrics(metrics)
        calculateSessionMetrics(metrics)
        resetLapMetrics()
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseEnd):
        // The session is resumed, so it was a pause instead of a stop. First add the rest split and lap
        // eslint-disable-next-line no-case-declarations -- Code clarity outweighs lint rules
        const endTime = sessionData.splits[sessionData.splits.length - 1].endTime
        addRestSplit(metrics, endTime)
        addRestLap(metrics, endTime, metrics.interval.workoutStepNumber)
        // Now start a new active split and lap
        startSplit(metrics)
        startLap(metrics)
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isIntervalEnd):
        addMetricsToStrokesArray(metrics) // Add a trackpoint to provide the lap and split with an anchor
        calculateSplitMetrics(metrics)
        calculateLapMetrics(metrics)
        resetLapMetrics()
        startSplit(metrics)
        startLap(metrics)
        break
      case (metrics.metricsContext.isSplitEnd):
        addMetricsToStrokesArray(metrics) // Add a trackpoint to provide the lap and split with an anchor
        calculateLapMetrics(metrics)
        resetLapMetrics()
        startLap(metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        addMetricsToStrokesArray(metrics)
        splitVelocityMetrics.push(metrics.cycleLinearVelocity)
        break
      // no default
    }
    lastMetrics = metrics
  }

  function addMetricsToStrokesArray (metrics) {
    sessionData.strokes.push({
      timestamp: metrics.timestamp,
      totalNumberOfStrokes: metrics.totalNumberOfStrokes,
      totalLinearDistance: metrics.totalLinearDistance,
      cycleStrokeRate: metrics.cycleStrokeRate,
      cyclePower: metrics.cyclePower,
      cycleLinearVelocity: metrics.cycleLinearVelocity,
      cycleDistance: metrics.cycleDistance,
      dragFactor: metrics.dragFactor,
      ...(!isNaN(heartRate) && heartRate > 0 ? { heartrate: heartRate } : { heartrate: undefined })
    })
    sessionData.totalMovingTime = metrics.workout.timeSpent.moving
    VO2max.push(metrics, heartRate)
    fitfileContentIsCurrent = false
    allDataHasBeenWritten = false
  }

  function startSplit (metrics) {
    sessionData.noActiveSplits++
    splitVelocityMetrics.reset()
    splitVelocityMetrics.push(metrics.cycleLinearVelocity)
    const splitnumber = sessionData.splits.length
    sessionData.splits.push({
      startTime: metrics.timestamp,
      splitNumber: splitnumber,
      totalMovingTimeAtStart: metrics.totalMovingTime,
      startDistance: metrics.totalLinearDistance,
      startCalories: metrics.workout.caloriesSpent.total,
      intensity: 'active',
      complete: false
    })
  }

  function calculateSplitMetrics (metrics) {
    const splitnumber = sessionData.splits.length - 1
    sessionData.splits[splitnumber].totalTime = metrics.totalMovingTime - sessionData.splits[splitnumber].totalMovingTimeAtStart
    sessionData.splits[splitnumber].totalLinearDistance = metrics.totalLinearDistance - sessionData.splits[splitnumber].startDistance
    sessionData.splits[splitnumber].calories = metrics.workout.caloriesSpent.total - sessionData.splits[splitnumber].startCalories
    sessionData.splits[splitnumber].endTime = metrics.timestamp
    sessionData.splits[splitnumber].maxSpeed = splitVelocityMetrics.maximum()
    sessionData.splits[splitnumber].complete = true
    sessionData.totalMovingTime = metrics.workout.timeSpent.moving
  }

  function addRestSplit (metrics, startTime) {
    sessionData.noRestSplits++
    const splitnumber = sessionData.splits.length
    sessionData.splits.push({
      startTime: startTime,
      splitNumber: splitnumber,
      intensity: 'rest',
      totalTime: metrics.split.timeSpent.rest,
      calories: metrics.split.caloriesSpent.rest,
      endTime: metrics.timestamp,
      complete: true
    })
  }

  function startLap (metrics) {
    resetLapMetrics()
    const lapnumber = sessionData.laps.length
    sessionData.laps.push({
      startTime: metrics.timestamp,
      lapNumber: lapnumber,
      totalMovingTimeAtStart: metrics.totalMovingTime,
      intensity: 'active',
      complete: false
    })
  }

  function calculateLapMetrics (metrics) {
    const lapnumber = sessionData.laps.length - 1
    sessionData.laps[lapnumber].workoutStepNumber = metrics.interval.workoutStepNumber
    sessionData.laps[lapnumber].endTime = metrics.timestamp
    switch (true) {
      case (metrics.metricsContext.isSessionStop && (metrics.interval.type === 'distance' || metrics.interval.type === 'time' || metrics.interval.type === 'calories')):
        // As the workout closure has its own events, we need to close the workout step here
        sessionData.laps[lapnumber].trigger = metrics.interval.type
        sessionData.laps[lapnumber].event = 'workoutStep'
        break
      case (metrics.metricsContext.isSessionStop):
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'workoutStep'
        break
      case (metrics.metricsContext.isIntervalEnd && (metrics.interval.type === 'distance' || metrics.interval.type === 'time')):
        sessionData.laps[lapnumber].trigger = metrics.interval.type
        sessionData.laps[lapnumber].event = 'workoutStep'
        break
      case (metrics.metricsContext.isIntervalEnd && metrics.interval.type === 'calories'):
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'workoutStep'
        break
      case (metrics.metricsContext.isIntervalEnd):
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'workoutStep'
        break
      case (metrics.metricsContext.isPauseStart):
        // As metrics.metricsContext.isIntervalEnd === false, we know this is a spontanuous pause and not a planned rest interval
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'speedLowAlert'
        break
      case (metrics.metricsContext.isSplitEnd && (metrics.split.type === 'distance' || metrics.split.type === 'time')):
        sessionData.laps[lapnumber].trigger = metrics.split.type
        sessionData.laps[lapnumber].event = 'lap'
        break
      case (metrics.metricsContext.isSplitEnd && metrics.split.type === 'calories'):
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'lap'
        break
      case (metrics.metricsContext.isSplitEnd):
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'lap'
        break
      default:
        sessionData.laps[lapnumber].trigger = 'manual'
        sessionData.laps[lapnumber].event = 'lap'
    }
    sessionData.laps[lapnumber].summary = { ...metrics.split }
    sessionData.laps[lapnumber].averageHeartrate = lapHRMetrics.average()
    sessionData.laps[lapnumber].maximumHeartrate = lapHRMetrics.maximum()
    sessionData.laps[lapnumber].complete = true
    sessionData.totalMovingTime = metrics.workout.timeSpent.moving
  }

  function addRestLap (metrics, startTime, workoutStepNo) {
    resetLapMetrics()
    const lapnumber = sessionData.laps.length
    sessionData.laps.push({
      startTime: startTime,
      lapNumber: lapnumber,
      intensity: 'rest',
      workoutStepNumber: workoutStepNo,
      ...(metrics.metricsContext.isIntervalEnd ? { trigger: 'time' } : { trigger: 'manual' }),
      ...(metrics.metricsContext.isIntervalEnd ? { event: 'workoutStep' } : { event: 'lap' }),
      endTime: metrics.timestamp,
      averageHeartrate: lapHRMetrics.average(),
      maximumHeartrate: lapHRMetrics.maximum(),
      summary: { ...metrics.split },
      complete: true
    })
    VO2max.handleRestart(metrics.split.timeSpent.moving)
  }

  function resetLapMetrics () {
    lapHRMetrics.reset()
    if (!isNaN(heartRate) && heartRate > 0) { lapHRMetrics.push(heartRate) }
  }

  function calculateSessionMetrics (metrics) {
    sessionData.totalNoLaps = sessionData.laps.length
    sessionData.totalTime = metrics.workout.timeSpent.total
    sessionData.totalMovingTime = metrics.workout.timeSpent.moving
    sessionData.totalRestTime = metrics.workout.timeSpent.rest
    sessionData.totalMovingCalories = metrics.workout.caloriesSpent.moving
    sessionData.totalRestCalories = metrics.workout.caloriesSpent.rest
    sessionData.totalLinearDistance = metrics.workout.distance.fromStart
    sessionData.totalNumberOfStrokes = metrics.workout.numberOfStrokes
    sessionData.averageLinearVelocity = metrics.workout.linearVelocity.average
    sessionData.maximumLinearVelocity = metrics.workout.linearVelocity.maximum
    sessionData.averagePower = metrics.workout.power.average
    sessionData.maximumPower = metrics.workout.power.maximum
    sessionData.averageStrokerate = metrics.workout.strokerate.average
    sessionData.maximumStrokerate = metrics.workout.strokerate.maximum
    sessionData.averageStrokeDistance = metrics.workout.strokeDistance.average
    sessionData.minimumHeartrate = sessionHRMetrics.minimum()
    sessionData.averageHeartrate = sessionHRMetrics.average()
    sessionData.maximumHeartrate = sessionHRMetrics.maximum()
    sessionData.endTime = metrics.timestamp
    sessionData.complete = true
  }

  /**
   * initiated when a new heart rate value is received from heart rate sensor
   */
  async function recordHeartRate (value) {
    heartRate = value.heartrate
    if (!isNaN(heartRate) && heartRate > 0) {
      lapHRMetrics.push(heartRate)
      if (lastMetrics.sessionState === 'Paused') { splitRestHRMetrics.push(heartRate) }
      if (lastMetrics.sessionState === 'Rowing') { splitActiveHRMetrics.push(heartRate) }
      sessionHRMetrics.push(heartRate)
    }
  }

  /**
   * This externally exposed function generates the file contont for the file writer and uploaders
   */
  async function fileContent () {
    if (Object.keys(lastMetrics).length === 0 || Object.keys(sessionData).length === 0) { return undefined }

    if (sessionData.laps[sessionData.laps.length - 1].complete !== true) {
      addMetricsToStrokesArray(lastMetrics)
      calculateLapMetrics(lastMetrics)
    }

    if (sessionData.splits[sessionData.splits.length - 1].complete !== true) {
      calculateSplitMetrics(lastMetrics)
    }

    if (sessionData.complete !== true) {
      calculateSessionMetrics(lastMetrics)
    }

    const fitData = await workoutToFit(sessionData)
    if (fitData === undefined) {
      log.error('error creating fit file content')
      return undefined
    } else {
      return fitData
    }
  }

  /**
   * @see {@link https://developer.garmin.com/fit/file-types/activity/|the fields and their meaning}. We use 'Smart Recording' per stroke.
   * @see {@link https://developer.garmin.com/fit/cookbook/encoding-activity-files/|the description of the filestructure and how timestamps}
   * We use 'summary last message sequencing' as the stream makes most sense that way
   */
  async function workoutToFit (workout) {
    // The file content is filled and hasn't changed
    if (fitfileContentIsCurrent === true && fitfileContent !== undefined) { return fitfileContent }

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

    // Activity summary
    fitWriter.writeMessage(
      'activity',
      {
        timestamp: fitWriter.time(workout.startTime),
        local_timestamp: fitWriter.time(workout.startTime) - workout.startTime.getTimezoneOffset() * 60,
        total_timer_time: workout.totalTime,
        num_sessions: 1,
        event: 'activity',
        event_type: 'stop',
        type: 'manual'
      },
      null,
      true
    )

    /*
     * The session summary
     * @see {@link https://developer.garmin.com/fit/cookbook/durations/|for explanation about times}
     */
    fitWriter.writeMessage(
      'session',
      {
        timestamp: fitWriter.time(workout.startTime),
        message_index: 0,
        sport: 'rowing',
        sub_sport: 'indoorRowing',
        event: 'session',
        event_type: 'stop',
        trigger: 'activityEnd',
        sport_profile_name: 'Row Indoor',
        start_time: fitWriter.time(workout.startTime),
        total_elapsed_time: workout.totalTime,
        total_timer_time: workout.totalTime,
        total_moving_time: workout.totalMovingTime,
        total_distance: workout.totalLinearDistance,
        total_calories: workout.totalMovingCalories + workout.totalRestCalories,
        total_cycles: workout.totalNumberOfStrokes,
        avg_speed: workout.averageLinearVelocity,
        max_speed: workout.maximumLinearVelocity,
        avg_power: workout.averagePower,
        max_power: workout.maximumPower,
        avg_cadence: workout.averageStrokerate,
        max_cadence: workout.maximumStrokerate,
        ...(workout.minimumHeartrate > 0 ? { min_heart_rate: workout.minimumHeartrate } : {}),
        ...(workout.averageHeartrate > 0 ? { avg_heart_rate: workout.averageHeartrate } : {}),
        ...(workout.maximumHeartrate > 0 ? { max_heart_rate: workout.maximumHeartrate } : {}),
        avg_stroke_distance: workout.averageStrokeDistance,
        first_lap_index: 0,
        num_laps: sessionData.totalNoLaps
      },
      null,
      true
    )

    // Write the laps
    await writeLaps(fitWriter, workout)

    // Write the splits
    await writeSplits(fitWriter, workout)

    // Write the events
    await writeEvents(fitWriter, workout)

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

    // The workout definition before the start
    await createWorkoutSteps(fitWriter, workout)

    await writeRecords(fitWriter, workout)

    await createVO2MaxRecord(fitWriter, workout)

    await addHRR2Event(fitWriter)

    fitfileContent = fitWriter.finish()
    fitfileContentIsCurrent = true
    return fitfileContent
  }

  async function writeLaps (writer, workout) {
    // Write all laps
    let i = 0
    while (i < workout.laps.length) {
      if (workout.laps[i].intensity === 'active') {
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createActiveLap(writer, workout.laps[i])
      } else {
        // This is a rest interval
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createRestLap(writer, workout.laps[i])
      }
      i++
    }
  }

  async function createActiveLap (writer, lapdata) {
    // It is an active lap, after we make sure it is a completed lap, we can write all underlying records
    if (!!lapdata.complete && lapdata.complete) {
      // See https://developer.garmin.com/fit/cookbook/durations/ for how the different times are defined
      writer.writeMessage(
        'lap',
        {
          timestamp: writer.time(sessionData.startTime),
          message_index: lapdata.lapNumber,
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          event: lapdata.event,
          wkt_step_index: lapdata.workoutStepNumber,
          event_type: 'stop',
          intensity: lapdata.intensity,
          ...(sessionData.totalNoLaps === (lapdata.lapNumber + 1) ? { lap_trigger: 'sessionEnd' } : { lap_trigger: lapdata.trigger }),
          start_time: writer.time(lapdata.startTime),
          total_elapsed_time: lapdata.summary.timeSpent.total,
          total_timer_time: lapdata.summary.timeSpent.total,
          total_moving_time: lapdata.summary.timeSpent.moving,
          total_distance: lapdata.summary.distance.fromStart,
          total_cycles: lapdata.summary.numberOfStrokes,
          avg_cadence: lapdata.summary.strokerate.average,
          max_cadence: lapdata.summary.strokerate.maximum,
          avg_stroke_distance: lapdata.summary.strokeDistance.average,
          total_calories: lapdata.summary.caloriesSpent.moving,
          avg_speed: lapdata.summary.linearVelocity.average,
          max_speed: lapdata.summary.linearVelocity.maximum,
          avg_power: lapdata.summary.power.average,
          max_power: lapdata.summary.power.maximum,
          ...(lapdata.averageHeartrate > 0 ? { avg_heart_rate: lapdata.averageHeartrate } : {}),
          ...(lapdata.maximumHeartrate > 0 ? { max_heart_rate: lapdata.maximumHeartrate } : {})
        },
        null,
        sessionData.totalNoLaps === (lapdata.lapNumber + 1)
      )
    }
  }

  async function createRestLap (writer, lapdata) {
    // First, make sure the rest lap is complete
    if (!!lapdata.complete && lapdata.complete) {
      writer.writeMessage(
        'lap',
        {
          timestamp: writer.time(sessionData.startTime),
          message_index: lapdata.lapNumber,
          sport: 'rowing',
          sub_sport: 'indoorRowing',
          event: lapdata.event,
          wkt_step_index: lapdata.workoutStepNumber,
          event_type: 'stop',
          intensity: lapdata.intensity,
          lap_trigger: lapdata.trigger,
          start_time: writer.time(lapdata.startTime),
          total_elapsed_time: lapdata.summary.timeSpent.total,
          total_timer_time: lapdata.summary.timeSpent.total,
          total_moving_time: 0,
          total_distance: 0,
          total_cycles: 0,
          avg_cadence: 0,
          max_cadence: 0,
          avg_stroke_distance: 0,
          total_calories: lapdata.summary.caloriesSpent.rest,
          avg_speed: 0,
          max_speed: 0,
          avg_power: 0,
          max_power: 0,
          ...(lapdata.averageHeartrate > 0 ? { avg_heart_rate: lapdata.averageHeartrate } : {}),
          ...(lapdata.maximumHeartrate > 0 ? { max_heart_rate: lapdata.maximumHeartrate } : {})
        },
        null,
        sessionData.totalNoLaps === (lapdata.lapNumber + 1)
      )
    }
  }

  async function writeSplits (writer, workout) {
    // Create the splits
    let i = 0
    while (i < workout.splits.length) {
      if (workout.splits[i].intensity === 'active') {
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createActiveSplit(writer, workout.splits[i])
      } else {
        // This is a rest interval
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createRestSplit(writer, workout.splits[i])
      }
      i++
    }

    // Write the split summary
    writer.writeMessage(
      'split_summary',
      {
        timestamp: writer.time(workout.startTime),
        message_index: 0,
        split_type: 'interval_active',
        num_splits: sessionData.noActiveSplits,
        total_timer_time: workout.totalMovingTime,
        total_distance: workout.totalLinearDistance,
        avg_speed: workout.averageLinearVelocity,
        max_speed: workout.maximumLinearVelocity,
        total_calories: sessionData.totalMovingCalories,
        ...(splitActiveHRMetrics.average() > 0 ? { avg_heart_rate: splitActiveHRMetrics.average() } : {}),
        ...(splitActiveHRMetrics.maximum() > 0 ? { max_heart_rate: splitActiveHRMetrics.maximum() } : {})
      },
      null,
      sessionData.noRestSplits === 0
    )

    if (sessionData.noRestSplits > 0) {
      // There was a pause
      writer.writeMessage(
        'split_summary',
        {
          timestamp: writer.time(workout.startTime),
          message_index: 1,
          split_type: 'interval_rest',
          num_splits: sessionData.noRestSplits,
          total_timer_time: sessionData.totalRestTime,
          total_distance: 0,
          avg_speed: 0,
          max_speed: 0,
          total_calories: sessionData.totalRestCalories,
          ...(splitRestHRMetrics.average() > 0 ? { avg_heart_rate: splitRestHRMetrics.average() } : {}),
          ...(splitRestHRMetrics.maximum() > 0 ? { max_heart_rate: splitRestHRMetrics.maximum() } : {})
        },
        null,
        true
      )
    }
  }

  /**
   * Creation of the active split
   * @see {@link https://developer.garmin.com/fit/cookbook/durations/|how the different times are defined}
   */
  async function createActiveSplit (writer, splitdata) {
    if (!!splitdata.complete && splitdata.complete) {
      // The split is complete

      writer.writeMessage(
        'split',
        {
          timestamp: writer.time(sessionData.startTime),
          message_index: splitdata.splitNumber,
          split_type: 'interval_active',
          total_elapsed_time: splitdata.totalTime,
          total_timer_time: splitdata.totalTime,
          total_moving_time: splitdata.totalTime,
          total_distance: splitdata.totalLinearDistance,
          avg_speed: splitdata.totalLinearDistance > 0 ? splitdata.totalLinearDistance / splitdata.totalTime : 0,
          max_speed: splitdata.maxSpeed,
          total_calories: splitdata.calories,
          start_time: writer.time(splitdata.startTime),
          end_time: writer.time(splitdata.endTime)
        },
        null,
        (splitdata.splitNumber + 1) === (sessionData.noRestSplits + sessionData.noActiveSplits)
      )
    }
  }

  /**
   * Creation of the rest split
   * @see {@link https://developer.garmin.com/fit/cookbook/durations/|how the different times are defined}
   */
  async function createRestSplit (writer, splitdata) {
    // First, make sure the rest lap is complete
    if (!!splitdata.complete && splitdata.complete) {
      // Add a rest lap summary
      writer.writeMessage(
        'split',
        {
          timestamp: writer.time(sessionData.startTime),
          message_index: splitdata.splitNumber,
          split_type: 'interval_rest',
          total_elapsed_time: splitdata.totalTime,
          total_timer_time: splitdata.totalTime,
          total_moving_time: 0,
          total_distance: 0,
          avg_speed: 0,
          max_speed: 0,
          total_calories: splitdata.calories,
          start_time: writer.time(splitdata.startTime),
          end_time: writer.time(splitdata.endTime)
        },
        null,
        (splitdata.splitNumber + 1) === (sessionData.noRestSplits + sessionData.noActiveSplits)
      )
    }
  }

  // Write the events
  async function writeEvents (writer, workout) {
    // Start of the session
    await addEvent(writer, workout.startTime, 'workout', 'start')
    await addEvent(writer, workout.startTime, 'timer', 'start')

    // Write all rest laps
    let i = 0
    while (i < workout.laps.length) {
      if (workout.laps[i].intensity === 'rest') {
        // This is a rest interval
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await addEvent(writer, workout.laps[i].startTime, workout.laps[i].event, 'stop')
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await addEvent(writer, workout.laps[i].endTime, 'timer', 'start')
      }
      i++
    }

    // Finish the seesion with a stop event
    await addEvent(writer, workout.endTime, 'timer', 'stopAll')
    await addEvent(writer, workout.endTime, 'workout', 'stop')
  }

  async function addEvent (writer, time, event, eventType) {
    writer.writeMessage(
      'event',
      {
        timestamp: writer.time(time),
        event: event,
        event_type: eventType,
        event_group: 0
      },
      null,
      true
    )
  }

  /**
   * @see {@link https://developer.garmin.com/fit/file-types/workout/|a general description of the workout structure}
   * @see {@link https://developer.garmin.com/fit/cookbook/encoding-workout-files/|a detailed description of the workout structure}
   */
  async function createWorkoutSteps (writer, workout) {
    // The file header
    writer.writeMessage(
      'training_file',
      {
        timestamp: writer.time(workout.startTime),
        time_created: writer.time(workout.startTime),
        type: 'workout',
        manufacturer: 'concept2',
        product: 0,
        serial_number: 0
      },
      null,
      true
    )

    const maxWorkoutStepNumber = workout.laps[workout.laps.length - 1].workoutStepNumber
    writer.writeMessage(
      'workout',
      {
        sport: 'rowing',
        sub_sport: 'indoorRowing',
        capabilities: 'fitnessEquipment',
        num_valid_steps: maxWorkoutStepNumber + 1,
        wkt_name: `Indoor rowing ${createName(workout.totalLinearDistance, workout.totalMovingTime)}`
      },
      null,
      true
    )

    let i = 0
    while (i < workout.workoutplan.length && i <= maxWorkoutStepNumber) {
      switch (true) {
        case (workout.workoutplan[i].type === 'distance' && workout.workoutplan[i].targetDistance > 0):
          // A target distance is set
          createWorkoutStep(writer, i, 'distance', workout.workoutplan[i].targetDistance * 100, 'active')
          break
        case (workout.workoutplan[i].type === 'time' && workout.workoutplan[i].targetTime > 0):
          // A target time is set
          createWorkoutStep(writer, i, 'time', workout.workoutplan[i].targetTime * 1000, 'active')
          break
        case (workout.workoutplan[i].type === 'calories' && workout.workoutplan[i].targetCalories > 0):
          // A target time is set
          createWorkoutStep(writer, i, 'calories', workout.workoutplan[i].targetCalories, 'active')
          break
        case (workout.workoutplan[i].type === 'rest' && workout.workoutplan[i].targetTime > 0):
          // A target time is set
          createWorkoutStep(writer, i, 'time', workout.workoutplan[i].targetTime * 1000, 'rest')
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

  async function writeRecords (writer, workout) {
    // It is an active lap, after we make sure it is a completed lap, we can write all underlying records
    if (!!sessionData.totalMovingTime && sessionData.totalMovingTime > 0 && !!workout.strokes[workout.strokes.length - 1].totalLinearDistance && workout.strokes[workout.strokes.length - 1].totalLinearDistance > 0) {
      let i = 0
      while (i < workout.strokes.length) {
        // eslint-disable-next-line no-await-in-loop -- This is inevitable if you want to have some decent order in the file
        await createTrackPoint(writer, workout.strokes[i])
        i++
      }
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
        ...(trackpoint.cycleLinearVelocity > 0 || trackpoint.isPauseStart ? { speed: trackpoint.cycleLinearVelocity } : {}),
        ...(trackpoint.cyclePower > 0 || trackpoint.isPauseStart ? { power: trackpoint.cyclePower } : {}),
        ...(trackpoint.cycleStrokeRate > 0 ? { cadence: trackpoint.cycleStrokeRate } : {}),
        ...(trackpoint.cycleDistance > 0 ? { cycle_length16: trackpoint.cycleDistance } : {}),
        ...(trackpoint.dragFactor > 0 || trackpoint.dragFactor < 255 ? { resistance: trackpoint.dragFactor } : {}), // As the data is stored in an int8, we need to guard the ma>
        ...(trackpoint.heartrate !== undefined && trackpoint.heartrate > 0 ? { heart_rate: trackpoint.heartrate } : {})
      }
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

  /**
   * This function is called when the rowing session is stopped. postExerciseHR[0] is the last measured excercise HR
   * Thus postExerciseHR[1] is Recovery HR after 1 min, etc..
   */
  function measureRecoveryHR () {
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
    return lastMetrics.workout.dragfactor.average
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
    lapHRMetrics.reset()
    splitActiveHRMetrics.reset()
    splitRestHRMetrics.reset()
    splitVelocityMetrics.reset()
    sessionHRMetrics.reset()
    sessionData = null
    sessionData = {}
    sessionData.workoutplan = []
    sessionData.workoutplan[0] = { type: 'justrow' }
    sessionData.lap = []
    sessionData.split = []
    sessionData.noActiveSplits = 0
    sessionData.noRestSplits = 0
    sessionData.complete = false
    postExerciseHR = null
    postExerciseHR = []
    VO2max.reset()
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
