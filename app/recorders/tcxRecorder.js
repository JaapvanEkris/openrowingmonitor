'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them into the tcx format
  It provides a tcx-file content, and some metadata for the filewriter and the file-uploaders
*/
import log from 'loglevel'
import { createName, createDragLine, createVO2MaxLine, createHRRLine } from './utils/decorators.js'
import { createSeries } from '../engine/utils/Series.js'
import { createVO2max } from './utils/VO2max.js'

export function createTCXRecorder (config) {
  const type = 'tcx'
  const postfix = '_rowing'
  const presentationName = 'Garmin tcx'
  const powerSeries = createSeries()
  const speedSeries = createSeries()
  const heartrateSeries = createSeries()
  const VO2max = createVO2max(config)
  const drag = createSeries()
  let heartRate = 0
  let sessionData
  let lapnumber = 0
  let postExerciseHR = []
  let lastMetrics = {}
  let tcxfileContent
  let tcxfileContentIsCurrent = true
  let allDataHasBeenWritten = true

  // This function handles all incomming commands. Here, the recordingmanager will have filtered
  // all unneccessary commands for us, so we only need to react to 'reset' and 'shutdown'
  async function handleCommand (commandName, data, client) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        break
      case ('reset'):
        if (lastMetrics !== undefined && !!lastMetrics.metricsContext && lastMetrics.metricsContext.isMoving && lastMetrics.totalMovingTime > sessionData.lap[lapnumber].strokes[sessionData.lap[lapnumber].strokes.length - 1].totalMovingTime) {
          // We apperantly get a reset during session
          updateLapMetrics(lastMetrics)
          addMetricsToStrokesArray(lastMetrics)
          calculateLapMetrics(lastMetrics)
        }
        heartRate = 0
        sessionData = null
        sessionData = {}
        sessionData.lap = []
        lapnumber = 0
        lastMetrics = {}
        postExerciseHR = null
        postExerciseHR = []
        powerSeries.reset()
        speedSeries.reset()
        heartrateSeries.reset()
        drag.reset()
        VO2max.reset()
        allDataHasBeenWritten = true
        break
      case 'shutdown':
        if (lastMetrics !== undefined && !!lastMetrics.metricsContext && lastMetrics.metricsContext.isMoving && lastMetrics.totalMovingTime > sessionData.lap[lapnumber].strokes[sessionData.lap[lapnumber].strokes.length - 1].totalMovingTime) {
          // We apperantly get a shutdown/crash during session
          updateLapMetrics(lastMetrics)
          addMetricsToStrokesArray(lastMetrics)
          calculateLapMetrics(lastMetrics)
        }
        break
      default:
        log.error(`tcxRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        sessionData = { startTime: metrics.timestamp }
        sessionData.lap = []
        lapnumber = 0
        startLap(lapnumber, metrics)
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        updateLapMetrics(metrics)
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseStart):
        updateLapMetrics(metrics)
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        resetLapMetrics()
        postExerciseHR = null
        postExerciseHR = []
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseEnd):
        // First add the rest lap hich we seem to have completed
        lapnumber++
        addRestLap(lapnumber, metrics, sessionData.lap[lapnumber - 1].endTime)
        lapnumber++
        startLap(lapnumber, metrics)
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isIntervalStart):
        // Please note: we deliberatly add the metrics twice as it marks both the end of the old interval and the start of a new one
        updateLapMetrics(metrics)
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        resetLapMetrics()
        lapnumber++
        startLap(lapnumber, metrics)
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSplitEnd):
        // Please note: we deliberatly add the metrics twice as it marks both the end of the old split and the start of a new one
        updateLapMetrics(metrics)
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        resetLapMetrics()
        lapnumber++
        startLap(lapnumber, metrics)
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        updateLapMetrics(metrics)
        addMetricsToStrokesArray(metrics)
        break
    }
    lastMetrics = metrics
  }

  function addMetricsToStrokesArray (metrics) {
    addHeartRateToMetrics(metrics)
    sessionData.lap[lapnumber].strokes.push(metrics)
    VO2max.push(metrics)
    if (!isNaN(metrics.dragFactor) && metrics.dragFactor > 0) { drag.push(metrics.dragFactor) }
    tcxfileContentIsCurrent = false
    allDataHasBeenWritten = false
  }

  function startLap (lapnumber, metrics) {
    sessionData.lap[lapnumber] = { startTime: metrics.timestamp }
    sessionData.lap[lapnumber].intensity = 'Active'
    sessionData.lap[lapnumber].strokes = []
  }

  function updateLapMetrics (metrics) {
    if (metrics.cyclePower !== undefined && metrics.cyclePower > 0) { powerSeries.push(metrics.cyclePower) }
    if (metrics.cycleLinearVelocity !== undefined && metrics.cycleLinearVelocity > 0) { speedSeries.push(metrics.cycleLinearVelocity) }
    if (!isNaN(heartRate) && heartRate > 0) { heartrateSeries.push(heartRate) }
  }

  function calculateLapMetrics (metrics) {
    sessionData.lap[lapnumber].endTime = metrics.timestamp
    sessionData.lap[lapnumber].totalMovingTime = metrics.totalMovingTime - sessionData.lap[lapnumber].strokes[0].totalMovingTime
    sessionData.lap[lapnumber].totalLinearDistance = metrics.totalLinearDistance - sessionData.lap[lapnumber].strokes[0].totalLinearDistance
    sessionData.lap[lapnumber].totalCalories = metrics.totalCalories - sessionData.lap[lapnumber].strokes[0].totalCalories
    sessionData.lap[lapnumber].numberOfStrokes = sessionData.lap[lapnumber].strokes.length
    sessionData.lap[lapnumber].averageStrokeRate = 60 * (sessionData.lap[lapnumber].numberOfStrokes / sessionData.lap[lapnumber].totalMovingTime)
    sessionData.lap[lapnumber].averageVelocity = sessionData.lap[lapnumber].totalLinearDistance / sessionData.lap[lapnumber].totalMovingTime
    sessionData.lap[lapnumber].averagePower = powerSeries.average()
    sessionData.lap[lapnumber].maximumPower = powerSeries.maximum()
    sessionData.lap[lapnumber].averageSpeed = speedSeries.average()
    sessionData.lap[lapnumber].maximumSpeed = speedSeries.maximum()
    sessionData.lap[lapnumber].averageHeartrate = heartrateSeries.average()
    sessionData.lap[lapnumber].maximumHeartrate = heartrateSeries.maximum()
  }

  function resetLapMetrics () {
    powerSeries.reset()
    speedSeries.reset()
    heartrateSeries.reset()
  }

  function addRestLap (lapnumber, metrics, startTime) {
    sessionData.lap[lapnumber] = { endTime: metrics.timestamp }
    sessionData.lap[lapnumber].intensity = 'Resting'
    sessionData.lap[lapnumber].startTime = startTime
    VO2max.handleRestart(metrics.totalMovingTime)
  }

  function addHeartRateToMetrics (metrics) {
    if (!isNaN(heartRate) && heartRate > 0) {
      metrics.heartrate = heartRate
    } else {
      metrics.heartrate = undefined
    }
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function recordHeartRate (value) {
    heartRate = value.heartrate
  }

  async function fileContent () {
    const tcx = await workoutToTcx(sessionData)
    if (tcx === undefined) {
      log.error('error creating tcx file content')
      return undefined
    } else {
      return tcx
    }
  }

  async function workoutToTcx (workout) {
    // The file content is filled and hasn't changed
    if (tcxfileContentIsCurrent === true && tcxfileContent !== undefined) { return tcxfileContent }

    let tcxData = ''
    tcxData += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    tcxData += '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:ns2="http://www.garmin.com/xmlschemas/ActivityExtension/v2">\n'
    tcxData += await createActivity(workout)
    tcxData += '</TrainingCenterDatabase>\n'
    tcxfileContent = tcxData
    tcxfileContentIsCurrent = true
    return tcxfileContent
  }

  async function createActivity (workout) {
    let tcxData = ''
    tcxData += '  <Activities>\n'
    tcxData += '    <Activity Sport="Other">\n'
    tcxData += `      <Id>${workout.startTime.toISOString()}</Id>\n`
    let i = 0
    while (i < workout.lap.length) {
      if (workout.lap[i].intensity !== 'Resting') {
        tcxData += await createActiveLap(workout.lap[i])
      } else {
        tcxData += await createRestLap(workout.lap[i])
      }
      i++
    }
    tcxData += await createNotes(workout)
    tcxData += await createAuthor()
    tcxData += '    </Activity>\n'
    tcxData += '  </Activities>\n'
    return tcxData
  }

  async function createActiveLap (lapdata) {
    let tcxData = ''
    tcxData += `      <Lap StartTime="${lapdata.startTime.toISOString()}">\n`
    tcxData += `        <TotalTimeSeconds>${lapdata.totalMovingTime.toFixed(1)}</TotalTimeSeconds>\n`
    tcxData += `        <DistanceMeters>${lapdata.totalLinearDistance.toFixed(1)}</DistanceMeters>\n`
    tcxData += `        <MaximumSpeed>${lapdata.maximumSpeed.toFixed(2)}</MaximumSpeed>\n`
    tcxData += `        <Calories>${Math.round(lapdata.totalCalories)}</Calories>\n`
    if (!isNaN(lapdata.averageHeartrate) && lapdata.averageHeartrate > 0 && !isNaN(lapdata.maximumHeartrate) && lapdata.maximumHeartrate > 0) {
      tcxData += `        <AverageHeartRateBpm>${Math.round(lapdata.averageHeartrate.toFixed(0))}</AverageHeartRateBpm>\n`
      tcxData += `        <MaximumHeartRateBpm>${Math.round(lapdata.maximumHeartrate.toFixed(0))}</MaximumHeartRateBpm>\n`
    }
    tcxData += `        <Intensity>${lapdata.intensity}</Intensity>\n`
    tcxData += `        <Cadence>${lapdata.averageStrokeRate.toFixed(0)}</Cadence>\n`
    tcxData += '        <TriggerMethod>Manual</TriggerMethod>\n'
    tcxData += '        <Track>\n'
    // Add the strokes
    let i = 0
    while (i < lapdata.strokes.length) {
      tcxData += await createTrackPoint(lapdata.strokes[i])
      i++
    }
    tcxData += '        </Track>\n'
    tcxData += '        <Extensions>\n'
    tcxData += '          <ns2:LX>\n'
    tcxData += `            <ns2:Steps>${lapdata.numberOfStrokes.toFixed(0)}</ns2:Steps>\n`
    tcxData += `            <ns2:AvgSpeed>${lapdata.averageSpeed.toFixed(2)}</ns2:AvgSpeed>\n`
    tcxData += `            <ns2:AvgWatts>${lapdata.averagePower.toFixed(0)}</ns2:AvgWatts>\n`
    tcxData += `            <ns2:MaxWatts>${lapdata.maximumPower.toFixed(0)}</ns2:MaxWatts>\n`
    tcxData += '          </ns2:LX>\n'
    tcxData += '        </Extensions>\n'
    tcxData += '      </Lap>\n'
    return tcxData
  }

  async function createRestLap (lapdata) {
    let tcxData = ''
    tcxData += `      <Lap StartTime="${lapdata.startTime.toISOString()}">\n`
    tcxData += `        <TotalTimeSeconds>${(lapdata.endTime - lapdata.startTime).toFixed(1)}</TotalTimeSeconds>\n`
    tcxData += '        <DistanceMeters>0</DistanceMeters>\n'
    tcxData += '        <MaximumSpeed>0</MaximumSpeed>\n'
    tcxData += '        <Calories>0</Calories>\n'
    tcxData += `        <Intensity>${lapdata.intensity}</Intensity>\n`
    tcxData += '        <TriggerMethod>Manual</TriggerMethod>\n'
    tcxData += '      </Lap>\n'
    return tcxData
  }

  async function createTrackPoint (trackpoint) {
    let tcxData = ''
    tcxData += '          <Trackpoint>\n'
    tcxData += `            <Time>${trackpoint.timestamp.toISOString()}</Time>\n`
    tcxData += `            <DistanceMeters>${trackpoint.totalLinearDistance.toFixed(2)}</DistanceMeters>\n`
    tcxData += `            <Cadence>${(trackpoint.cycleStrokeRate > 0 ? Math.round(trackpoint.cycleStrokeRate) : 0)}</Cadence>\n`
    if (trackpoint.cycleLinearVelocity > 0 || trackpoint.cyclePower > 0 || trackpoint.metricsContext.isPauseStart) {
      tcxData += '            <Extensions>\n'
      tcxData += '              <ns2:TPX>\n'
      if (trackpoint.cycleLinearVelocity > 0 || trackpoint.metricsContext.isPauseStart) {
        tcxData += `                <ns2:Speed>${(trackpoint.cycleLinearVelocity > 0 ? trackpoint.cycleLinearVelocity.toFixed(2) : 0)}</ns2:Speed>\n`
      }
      if (trackpoint.cyclePower > 0 || trackpoint.metricsContext.isPauseStart) {
        tcxData += `                <ns2:Watts>${(trackpoint.cyclePower > 0 ? Math.round(trackpoint.cyclePower) : 0)}</ns2:Watts>\n`
      }
      tcxData += '              </ns2:TPX>\n'
      tcxData += '            </Extensions>\n'
    }
    if (!isNaN(trackpoint.heartrate) && trackpoint.heartrate > 0) {
      tcxData += '            <HeartRateBpm>\n'
      tcxData += `              <Value>${trackpoint.heartrate}</Value>\n`
      tcxData += '            </HeartRateBpm>\n'
    }
    tcxData += '          </Trackpoint>\n'
    return tcxData
  }

  async function createNotes (workout) {
    const dragLine = createDragLine(drag.average())
    const VO2MaxLine = createVO2MaxLine(VO2max.result())
    const HRRLine = createHRRLine(postExerciseHR)
    const tcxData = `      <Notes>Indoor Rowing, ${dragLine}${VO2MaxLine}${HRRLine}</Notes>\n`
    return tcxData
  }

  async function createAuthor () {
    let versionArray = process.env.npm_package_version.split('.')
    if (versionArray.length < 3) versionArray = ['0', '0', '0']
    let tcxData = ''
    tcxData += '  <Author xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Application_t">\n'
    tcxData += '    <Name>Open Rowing Monitor</Name>\n'
    tcxData += '    <Build>\n'
    tcxData += '      <Version>\n'
    tcxData += `        <VersionMajor>${versionArray[0]}</VersionMajor>\n`
    tcxData += `        <VersionMinor>${versionArray[1]}</VersionMinor>\n`
    tcxData += `        <BuildMajor>${versionArray[2]}</BuildMajor>\n`
    tcxData += '        <BuildMinor>0</BuildMinor>\n'
    tcxData += '      </Version>\n'
    tcxData += '      <LangID>en</LangID>\n'
    tcxData += '      <PartNumber>OPE-NROWI-NG</PartNumber>\n'
    tcxData += '    </Build>\n'
    tcxData += '  </Author>\n'
    return tcxData
  }

  function measureRecoveryHR () {
    // This function is called when the rowing session is stopped. postExerciseHR[0] is the last measured excercise HR
    // Thus postExerciseHR[1] is Recovery HR after 1 min, etc..
    if (!isNaN(heartRate) && config.userSettings.restingHR <= heartRate && heartRate <= config.userSettings.maxHR) {
      log.debug(`*** tcx-recorder HRR-${postExerciseHR.length}: ${heartRate}`)
      postExerciseHR.push(heartRate)
      if ((postExerciseHR.length > 1) && (postExerciseHR.length <= 4)) {
        // We skip reporting postExerciseHR[0] and only report measuring postExerciseHR[1], postExerciseHR[2], postExerciseHR[3]
        tcxfileContentIsCurrent = false
        allDataHasBeenWritten = false
      }
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
    if (minimumRecordingTimeHasPassed() && lastMetrics.totalLinearDistance > 0) {
      return lastMetrics.totalLinearDistance
    } else {
      return 0
    }
  }

  function totalRecordedMovingTime () {
    if (minimumRecordingTimeHasPassed() && lastMetrics.totalMovingTime > 0) {
      return lastMetrics.totalMovingTime
    } else {
      return 0
    }
  }

  function sessionDrag () {
    return drag.average()
  }

  function sessionVO2Max () {
    let VO2maxoutput = ''
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

  return {
    handleCommand,
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
    allDataHasBeenWritten
  }
}
