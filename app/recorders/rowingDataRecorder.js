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

export function createRowingDataRecorder (config) {
  let filename
  let startTime
  let splitNumber = 0
  let heartRate = 0
  let strokes = []
  let lastMetrics = {}
  let rowingDataFileContent
  let rowingDataFileContentIsCurrent = true
  let allDataHasBeenWritten = true

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the WorkoutRecorder will react to and what it will ignore
  async function handleCommand (commandName, data, client) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        break
      case ('reset'):
        if (lastMetrics !== undefined && lastMetrics.metricsContext !== undefined && lastMetrics.metricsContext.isMoving && lastMetrics.length > 0 && lastMetrics.totalMovingTime > strokes[strokes.length - 1].totalMovingTime) {
          addMetricsToStrokesArray(lastMetrics)
        }
        await createRowingDataFile()
        filename = ''
        startTime = undefined
        heartRate = 0
        strokes = null
        strokes = []
        rowingDataFileContent = null
        rowingDataFileContent = {}
        lastMetrics = null
        lastMetrics = {}
        allDataHasBeenWritten = true
        break
      case 'shutdown':
        if (lastMetrics !== undefined && lastMetrics.metricsContext !== undefined && lastMetrics.metricsContext.isMoving && lastMetrics.length > 0 && lastMetrics.totalMovingTime > strokes[strokes.length - 1].totalMovingTime) {
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
          startTime = metrics.timestamp
        }
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        addMetricsToStrokesArray(metrics)
        createRowingDataFile()
        break
      case (metrics.metricsContext.isIntervalStart):
        addMetricsToStrokesArray(metrics)
        splitNumber++
        break
      case (metrics.metricsContext.isPauseStart):
        addMetricsToStrokesArray(metrics)
        createRowingDataFile()
        break
      case (metrics.metricsContext.isPauseEnd):
        splitNumber++
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSplitEnd):
        addMetricsToStrokesArray(metrics)
        splitNumber++
        break
      case (metrics.metricsContext.isDriveStart):
        addMetricsToStrokesArray(metrics)
        break
    }
    lastMetrics = metrics
  }

  function addMetricsToStrokesArray (metrics) {
    addHeartRateToMetrics(metrics)
    addSplitnumberToMetrics(metrics)
    strokes.push(metrics)
    allDataHasBeenWritten = false
    rowingDataFileContentIsCurrent = false
  }

  function addHeartRateToMetrics (metrics) {
    if (heartRate !== undefined && heartRate > 0) {
      metrics.heartrate = heartRate
    } else {
      metrics.heartrate = undefined
    }
  }

  function addSplitnumberToMetrics (metrics) {
    metrics.rowingDataSplitNumber = splitNumber
  }

  async function createRowingDataFile () {
    // Do not write again if not needed
    if (allDataHasBeenWritten) return

    // we need at least two strokes and ten seconds to generate a valid tcx file
    if (strokes.length < 2 || !minimumRecordingTimeHasPassed()) {
      log.info('RowingData file has not been written, as there were not enough strokes recorded (minimum 10 seconds and two strokes)')
      return
    }

    const RowingData = await workoutToRowingData(strokes)

    if (RowingData === undefined) {
      log.error('error creating RowingData file')
    } else {
      await createFile(RowingData, `${filename}`, false)
      allDataHasBeenWritten = true
      log.info(`RowingData has been written as ${filename}`)
    }
  }

  async function fileContent () {
    // Be aware, this is exposed to the RowsAndAll exporter
    const RowingData = await workoutToRowingData(strokes)
    if (RowingData === undefined) {
      log.error('error creating RowingData file content')
      return undefined
    } else {
      return RowingData
    }
  }

  async function workoutToRowingData (strokedata) {
    // Be aware, this function has two entry points: createRowingDataFile and fileContent
    // The file content is filled and hasn't changed
    let currentstroke

    if (rowingDataFileContentIsCurrent === true && rowingDataFileContent !== undefined) { return rowingDataFileContent }

    // Required file header, please note this includes a typo and odd spaces as the specification demands it!
    let RowingData = ',index, Stroke Number, lapIdx,TimeStamp (sec), ElapsedTime (sec), HRCur (bpm),DistanceMeters, Cadence (stokes/min), Stroke500mPace (sec/500m), Power (watts), StrokeDistance (meters),' +
      ' DriveTime (ms), DriveLength (meters), StrokeRecoveryTime (ms),Speed, Horizontal (meters), Calories (kCal), DragFactor, PeakDriveForce (N), AverageDriveForce (N),' +
      'Handle_Force_(N),Handle_Velocity_(m/s),Handle_Power_(W)\n'

    // Add the strokes
    let i = 0
    while (i < strokedata.length) {
      currentstroke = strokedata[i]
      // Add the strokes
      RowingData += `${(i + 1).toFixed(0)},${(i + 1).toFixed(0)},${currentstroke.totalNumberOfStrokes.toFixed(0)},${currentstroke.rowingDataSplitNumber.toFixed(0)},${(currentstroke.timestamp / 1000).toFixed(3)},` +
      `${currentstroke.totalMovingTime.toFixed(5)},${(currentstroke.heartrate !== undefined ? currentstroke.heartrate.toFixed(0) : NaN)},${currentstroke.totalLinearDistance.toFixed(1)},` +
      `${currentstroke.cycleStrokeRate > 0 ? currentstroke.cycleStrokeRate.toFixed(1) : NaN},${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.cyclePace > 0 ? currentstroke.cyclePace.toFixed(2) : NaN)},${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.cyclePower > 0 ? currentstroke.cyclePower.toFixed(0) : NaN)},` +
      `${currentstroke.cycleDistance > 0 ? currentstroke.cycleDistance.toFixed(2) : NaN},${currentstroke.driveDuration > 0 ? (currentstroke.driveDuration * 1000).toFixed(0) : NaN},${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.driveLength ? currentstroke.driveLength.toFixed(2) : NaN)},${currentstroke.recoveryDuration > 0 ? (currentstroke.recoveryDuration * 1000).toFixed(0) : NaN},` +
      `${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.cycleLinearVelocity > 0 ? currentstroke.cycleLinearVelocity.toFixed(2) : NaN)},${currentstroke.totalLinearDistance.toFixed(1)},${currentstroke.totalCalories.toFixed(1)},${currentstroke.dragFactor > 0 ? currentstroke.dragFactor.toFixed(1) : NaN},` +
      `${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.drivePeakHandleForce > 0 ? currentstroke.drivePeakHandleForce.toFixed(1) : NaN)},${(currentstroke.totalNumberOfStrokes > 0 && currentstroke.driveAverageHandleForce > 0 ? currentstroke.driveAverageHandleForce.toFixed(1) : NaN)},"${currentstroke.driveAverageHandleForce > 0 ? currentstroke.driveHandleForceCurve.map(value => value.toFixed(2)) : NaN}",` +
      `"${currentstroke.driveAverageHandleForce > 0 ? currentstroke.driveHandleVelocityCurve.map(value => value.toFixed(3)) : NaN}","${currentstroke.driveAverageHandleForce > 0 ? currentstroke.driveHandlePowerCurve.map(value => value.toFixed(1)) : NaN}"\n`
      i++
    }
    rowingDataFileContent = RowingData
    rowingDataFileContentIsCurrent = true
    return rowingDataFileContent
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
    if (strokes.length > 2) {
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
    recordHeartRate,
    fileContent
  }
}
