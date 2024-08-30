'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import zlib from 'zlib'
import fs from 'fs/promises'
import { promisify } from 'util'
const gzip = promisify(zlib.gzip)

function createRowingDataRecorder (config) {
  let filename
  let startTime
  let heartRate = 0
  let strokes = []
  let lastMetrics
  let allDataHasBeenWritten

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the WorkoutRecorder will react to and what it will ignore
  async function handleCommand (commandName) {
    switch (commandName) {
      case ('reset'):
        if (lastMetrics.length > 0 && lastMetrics.totalMovingTime > strokes[strokes.length - 1].totalMovingTime) {
          addMetricsToStrokesArray(lastMetrics)
        }
        await createRowingDataFile()
        filename = ''
        startTime = undefined
        heartRate = 0
        strokes = null
        strokes = []
        lastMetrics = null
        allDataHasBeenWritten = true
        break
      case 'shutdown':
        if (lastMetrics.length > 0 && lastMetrics.totalMovingTime > strokes[strokes.length - 1].totalMovingTime) {
          addMetricsToStrokesArray(lastMetrics)
        }
        await createRowingDataFile()
        break
      default:
        log.error(`RowingDataRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function setBaseFileName (baseFileName) {
    filename = `${baseFileName}_rowingData.csv`
    log.info(`RowingData file will be saved as ${filename} (after the session)`)
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function recordHeartRate (value) {
    heartRate = value.heartrate
  }

  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        if (startTime === undefined) {
          startTime = new Date()
        }
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        addMetricsToStrokesArray(metrics)
        createRowingDataFile()
        break
      case (metrics.metricsContext.isIntervalStart):
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isPauseStart):
        addMetricsToStrokesArray(metrics)
        createRowingDataFile()
        break
      case (metrics.metricsContext.isDriveStart):
        addMetricsToStrokesArray(metrics)
        break
    }
    lastMetrics = metrics
  }

  function addMetricsToStrokesArray (metrics) {
    addHeartRateToMetrics(metrics)
    addTimestampToMetrics(metrics)
    strokes.push(metrics)
    allDataHasBeenWritten = false
  }

  function addHeartRateToMetrics (metrics) {
    if (heartRate !== undefined && heartRate > 30) {
      metrics.heartrate = heartRate
    } else {
      metrics.heartrate = undefined
    }
  }

  function addTimestampToMetrics (metrics) {
    if (metrics.totalMovingTime !== undefined) {
      const trackPointTime = new Date(startTime.getTime() + metrics.totalMovingTime * 1000)
      metrics.timestamp = trackPointTime.getTime() / 1000
    } else {
      const currentTime = new Date()
      metrics.timestamp = currentTime.getTime() / 1000
    }
  }

  async function createRowingDataFile () {
    let currentstroke
    let i

    // Do not write again if not needed
    if (allDataHasBeenWritten) return

    // we need at least two strokes and ten seconds to generate a valid tcx file
    if (strokes.length < 2 || !minimumRecordingTimeHasPassed()) {
      log.info('RowingData file has not been written, as there were not enough strokes recorded (minimum 10 seconds and two strokes)')
      return
    }

    // Required file header, please note this includes a typo and odd spaces as the specification demands it!
    let RowingData = ',index, Stroke Number, lapIdx,TimeStamp (sec), ElapsedTime (sec), HRCur (bpm),DistanceMeters, Cadence (stokes/min), Stroke500mPace (sec/500m), Power (watts), StrokeDistance (meters),' +
      ' DriveTime (ms), DriveLength (meters), StrokeRecoveryTime (ms),Speed, Horizontal (meters), Calories (kCal), DragFactor, PeakDriveForce (N), AverageDriveForce (N),' +
      'Handle_Force_(N),Handle_Velocity_(m/s),Handle_Power_(W)\n'

    // Add the strokes
    i = 0
    while (i < strokes.length) {
      currentstroke = strokes[i]
      // Add the strokes
      RowingData += `${currentstroke.totalNumberOfStrokes.toFixed(0)},${currentstroke.totalNumberOfStrokes.toFixed(0)},${currentstroke.totalNumberOfStrokes.toFixed(0)},${currentstroke.intervalNumber.toFixed(0)},${currentstroke.timestamp.toFixed(5)},` +
        `${currentstroke.totalMovingTime.toFixed(5)},${(currentstroke.heartrate !== undefined ? currentstroke.heartrate.toFixed(0) : NaN)},${currentstroke.totalLinearDistance.toFixed(1)},` +
        `${currentstroke.cycleStrokeRate.toFixed(1)},${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.cyclePace.toFixed(2) : NaN)},${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.cyclePower.toFixed(0) : NaN)},` +
        `${currentstroke.cycleDistance.toFixed(2)},${(currentstroke.driveDuration * 1000).toFixed(0)},${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.driveLength.toFixed(2) : NaN)},${(currentstroke.recoveryDuration * 1000).toFixed(0)},` +
        `${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.cycleLinearVelocity.toFixed(2) : 0)},${currentstroke.totalLinearDistance.toFixed(1)},${currentstroke.totalCalories.toFixed(1)},${currentstroke.dragFactor.toFixed(1)},` +
        `${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.drivePeakHandleForce.toFixed(1) : NaN)},${(currentstroke.totalNumberOfStrokes > 0 ? currentstroke.driveAverageHandleForce.toFixed(1) : 0)},"${currentstroke.driveHandleForceCurve.map(value => value.toFixed(2))}",` +
        `"${currentstroke.driveHandleVelocityCurve.map(value => value.toFixed(3))}","${currentstroke.driveHandlePowerCurve.map(value => value.toFixed(1))}"\n`
      i++
    }
    await createFile(RowingData, `${filename}`, false)
    allDataHasBeenWritten = true
    log.info(`RowingData has been written as ${filename}`)
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

  function minimumRecordingTimeHasPassed () {
    const minimumRecordingTimeInSeconds = 10
    if (strokes.length > 0) {
      const strokeTimeTotal = strokes[strokes.length - 1].totalMovingTime
      return (strokeTimeTotal > minimumRecordingTimeInSeconds)
    } else {
      return (false)
    }
  }

  return {
    handleCommand,
    setBaseFileName,
    recordRowingMetrics,
    recordHeartRate
  }
}

export { createRowingDataRecorder }
