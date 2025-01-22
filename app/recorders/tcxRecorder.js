'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them in the tcx format.
*/
import log from 'loglevel'
import zlib from 'zlib'
import fs from 'fs/promises'
import { createSeries } from '../engine/utils/Series.js'
import { createVO2max } from './utils/VO2max.js'
import { promisify } from 'util'
const gzip = promisify(zlib.gzip)

export function createTCXRecorder (config) {
  const powerSeries = createSeries()
  const speedSeries = createSeries()
  const heartrateSeries = createSeries()
  const VO2max = createVO2max(config)
  const drag = createSeries()
  let filename
  let heartRate = 0
  let sessionData
  let lapnumber = 0
  let postExerciseHR = []
  let lastMetrics
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
        if (lastMetrics !== undefined && lastMetrics.metricsContext !== undefined && lastMetrics.metricsContext.isMoving && lastMetrics.totalMovingTime > sessionData.lap[lapnumber].strokes[sessionData.lap[lapnumber].strokes.length - 1].totalMovingTime) {
          // We apperantly get a reset during session
          updateLapMetrics(lastMetrics)
          addMetricsToStrokesArray(lastMetrics)
          calculateLapMetrics(lastMetrics)
        }
        await createTcxFile()
        heartRate = 0
        sessionData = null
        sessionData = {}
        sessionData.lap = []
        lapnumber = 0
        postExerciseHR = null
        postExerciseHR = []
        powerSeries.reset()
        speedSeries.reset()
        heartrateSeries.reset()
        VO2max.reset()
        allDataHasBeenWritten = true
        break
      case 'shutdown':
        if (lastMetrics !== undefined && lastMetrics.metricsContext !== undefined && lastMetrics.metricsContext.isMoving && lastMetrics.totalMovingTime > sessionData.lap[lapnumber].strokes[sessionData.lap[lapnumber].strokes.length - 1].totalMovingTime) {
          // We apperantly get a shutdown/crash during session
          updateLapMetrics(lastMetrics)
          addMetricsToStrokesArray(lastMetrics)
          calculateLapMetrics(lastMetrics)
        }
        await createTcxFile()
        break
      default:
        log.error(`tcxRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function setBaseFileName (baseFileName) {
    filename = `${baseFileName}_rowing.tcx`
    log.info(`Garmin tcx-file will be saved as ${filename} (after the session)`)
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
        createTcxFile()
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseStart):
        updateLapMetrics(metrics)
        addMetricsToStrokesArray(metrics)
        calculateLapMetrics(metrics)
        resetLapMetrics()
        postExerciseHR = null
        postExerciseHR = []
        createTcxFile()
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

  async function createTcxFile () {
    // Do not write again if not needed
    if (allDataHasBeenWritten) return

    // we need at least two strokes and ten seconds to generate a valid tcx file
    if (!minimumNumberOfStrokesHaveCompleted() || !minimumRecordingTimeHasPassed()) {
      log.info('tcx file has not been written, as there were not enough strokes recorded (minimum 10 seconds and two strokes)')
      return
    }

    const tcxRecord = await workoutToTcx(sessionData)
    if (tcxRecord === undefined) {
      log.error('error creating tcx file')
    } else {
      await createFile(tcxRecord, `${filename}`, config.gzipTcxFiles)
      allDataHasBeenWritten = true
      log.info(`Garmin tcx data has been written as ${filename}`)
    }
  }

  async function fileContent () {
    // Be aware, this is exposed to the Strava and intervals.icu exporters
    const tcx = await workoutToTcx(sessionData)
    if (tcx === undefined) {
      log.error('error creating tcx file content')
      return undefined
    } else {
      return {
        tcx,
        filename
      }
    }
  }

  async function workoutToTcx (workout) {
    // Be aware, this function has two entry points: createTcxFile and fileContent
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
    let VO2maxoutput

    // VO2Max calculation
    const VO2maxResult = VO2max.result()
    if (VO2maxResult > 10 && VO2maxResult < 60) {
      VO2maxoutput = `${VO2maxResult.toFixed(1)} mL/(kg*min)`
    } else {
      VO2maxoutput = 'UNDEFINED'
    }

    // Addition of HRR data
    let hrrAdittion = ''
    if (postExerciseHR.length > 1 && (postExerciseHR[0] > (0.7 * config.userSettings.maxHR))) {
      // Recovery Heartrate is only defined when the last excercise HR is above 70% of the maximum Heartrate
      if (postExerciseHR.length === 2) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM)`
      }
      if (postExerciseHR.length === 3) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM), HRR2: ${postExerciseHR[2] - postExerciseHR[0]} (${postExerciseHR[2]} BPM)`
      }
      if (postExerciseHR.length >= 4) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM), HRR2: ${postExerciseHR[2] - postExerciseHR[0]} (${postExerciseHR[2]} BPM), HRR3: ${postExerciseHR[3] - postExerciseHR[0]} (${postExerciseHR[3]} BPM)`
      }
    }
    const tcxData = `      <Notes>Indoor Rowing, Drag factor: ${drag.average().toFixed(1)} 10-6 N*m*s2, Estimated VO2Max: ${VO2maxoutput}${hrrAdittion}</Notes>\n`
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

  async function createFile (content, filename, compress = false) {
    if (compress) {
      const gzipContent = await gzip(content)
      try {
        await fs.writeFile(filename, gzipContent)
      } catch (err) {
        log.error(err)
      }
    } else {
      try {
        await fs.writeFile(filename, content)
      } catch (err) {
        log.error(err)
      }
    }
  }

  function measureRecoveryHR () {
    // This function is called when the rowing session is stopped. postExerciseHR[0] is the last measured excercise HR
    // Thus postExerciseHR[1] is Recovery HR after 1 min, etc..
    if (!isNaN(heartRate) && config.userSettings.restingHR <= heartRate && heartRate <= config.userSettings.maxHR) {
      log.debug(`*** HRR-${postExerciseHR.length}: ${heartRate}`)
      postExerciseHR.push(heartRate)
      if ((postExerciseHR.length > 1) && (postExerciseHR.length <= 4)) {
        // We skip reporting postExerciseHR[0] and only report measuring postExerciseHR[1], postExerciseHR[2], postExerciseHR[3]
        tcxfileContentIsCurrent = false
        allDataHasBeenWritten = false
        createTcxFile()
      }
      if (postExerciseHR.length < 4) {
        // We haven't got three post-exercise HR measurements yet, let's schedule the next measurement
        setTimeout(measureRecoveryHR, 60000)
      } else {
        log.debug('*** Skipped HRR measurement')
      }
    }
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

  return {
    handleCommand,
    setBaseFileName,
    recordRowingMetrics,
    recordHeartRate,
    fileContent
  }
}
