'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import fs from 'fs'

function createRowingDataRecorder (config) {
  let filename
  let startTime
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
        // ToDo: reset the startTime without adding a header!!!
        break
      case ('stop'):
        break
      case ('reset'):
        filename = ""
        startTime = undefined
        break
      case 'shutdown':
        break
      default:
        log.error(`RowingDataRecorder: Recieved unknown command: ${commandName}`)
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

  function recordStroke (stroke) {
    if (startTime === undefined) {
      startTime = new Date()
      // Required file header, please note this includes a typo and odd spaces as the specification demands it!
      fs.appendFile(`${filename}`,
      ',index, Stroke Number,TimeStamp (sec), ElapsedTime (sec), HRCur (bpm),DistanceMeters, Cadence (stokes/min), Stroke500mPace (sec/500m), Power (watts), StrokeDistance (meters),' +
      ' DriveTime (ms), DriveLength (meters), StrokeRecoveryTime (ms),Speed, Horizontal (meters), Calories (kCal), DragFactor, PeakDriveForce (N), AverageDriveForce (N),' +
      'Handle_Force_(N),Handle_Velocity_(m/s),Handle_Power_(W)\n',
      (err) => { if (err) log.error(err) })
    }
    const trackPointTime = new Date(startTime.getTime() + stroke.totalMovingTime * 1000)
    const timestamp = trackPointTime.getTime() / 1000
    fs.appendFile(`${filename}`,
    `${stroke.totalNumberOfStrokes.toFixed(0)},${stroke.totalNumberOfStrokes.toFixed(0)},${stroke.totalNumberOfStrokes.toFixed(0)},${timestamp.toFixed(5)},` +
//    `${stroke.totalMovingTime.toFixed(5)},${(stroke.heartrate > 30 ? stroke.heartrate.toFixed(0) : NaN)},${stroke.totalLinearDistance.toFixed(1)},` +
    `${stroke.totalMovingTime.toFixed(5)},${(heartRate > 30 ? heartRate.toFixed(0) : NaN)},${stroke.totalLinearDistance.toFixed(1)},` +
    `${stroke.cycleStrokeRate.toFixed(1)},${(stroke.totalNumberOfStrokes > 0 ? stroke.cyclePace.toFixed(2) : NaN)},${(stroke.totalNumberOfStrokes > 0 ? stroke.cyclePower.toFixed(0) : NaN)},` +
    `${stroke.cycleDistance.toFixed(2)},${(stroke.driveDuration * 1000).toFixed(0)},${(stroke.totalNumberOfStrokes > 0 ? stroke.driveLength.toFixed(2) : NaN)},${(stroke.recoveryDuration * 1000).toFixed(0)},` +
    `${(stroke.totalNumberOfStrokes > 0 ? stroke.cycleLinearVelocity.toFixed(2) : 0)},${stroke.totalLinearDistance.toFixed(1)},${stroke.totalCalories.toFixed(1)},${stroke.dragFactor.toFixed(1)},` +
    `${(stroke.totalNumberOfStrokes > 0 ? stroke.drivePeakHandleForce.toFixed(1) : NaN)},${(stroke.totalNumberOfStrokes > 0 ? stroke.driveAverageHandleForce.toFixed(1) : 0)},"${stroke.driveHandleForceCurve.map(value => value.toFixed(2))}",` +
    `"${stroke.driveHandleVelocityCurve.map(value => value.toFixed(3))}","${stroke.driveHandlePowerCurve.map(value => value.toFixed(1))}"\n`,
    (err) => { if (err) log.error(err) })
  }

  return {
    handleCommand,
    setBaseFileName,
    recordStroke,
    recordHeartRate
  }
}

export { createRowingDataRecorder }
