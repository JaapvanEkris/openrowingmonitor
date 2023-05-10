'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import fs from 'fs/promises'
import { createLogRecorder } from './logRecorder.js'
import { createRawRecorder } from './rawRecorder.js'
import { createTCXRecorder } from './tcxRecorder.js'
import { createRowingDataRecorder } from './rowingDataRecorder.js'

function createRecordingManager (config) {
  let startTime
  const logRecorder = createLogRecorder(config)
  const rawRecorder = createRawRecorder(config)
  const tcxRecorder = createTCXRecorder(config)
  const rowingDataRecorder = createRowingDataRecorder(config)

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the WorkoutRecorder will react to and what it will ignore
  async function handleCommand (commandName) {
    switch (commandName) {
      case ('start'):
        if (config.createRawDataFiles) {
          await rawRecorder.createRawDataFile()
        }
        if (config.createRowingDataFile) {
          await rowingDataRecorder.createRowingDataFile()
        }
        break
      case ('startOrResume'):
        if (config.createRawDataFiles) {
          await rawRecorder.createRawDataFile()
        }
        if (config.createRowingDataFile) {
          await rowingDataRecorder.createRowingDataFile()
        }
        break
      case ('pause'):
        if (config.createRawDataFiles) {
          await rawRecorder.createRawDataFile()
        }
        if (config.createRowingDataFile) {
          await rowingDataRecorder.createRowingDataFile()
        }
        break
      case ('stop'):
        // This may be extracted to a separate private function if used at several places
        if (config.createRawDataFiles) {
          await rawRecorder.createRawDataFile()
        }
        if (config.createRowingDataFile) {
          await rowingDataRecorder.createRowingDataFile()
        }
        break
      case ('reset'):
        startTime = undefined
        if (config.createRawDataFiles) {
          await rawRecorder.createRawDataFile()
        }
        if (config.createRowingDataFile) {
          await rowingDataRecorder.createRowingDataFile()
        }
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
        if (config.createRawDataFiles) {
          await rawRecorder.createRawDataFile()
        }
        if (config.createRowingDataFile) {
          await rowingDataRecorder.createRowingDataFile()
        }
        break
      default:
        log.error(`recordingMnager: Recieved unknown command: ${commandName}`)
    }
  }

  async function recordRotationImpulse (impulse) {
    if (startTime === undefined && (config.createRawDataFiles || config.createTcxFiles || config.createRowingDataFiles)) {
      await nameFilesAndCreateDirectory()
    }
    if (config.createRawDataFiles) { await rawRecorder.recordRotationImpulse(impulse) }
  }

  async function recordMetrics (metrics) {
    if (startTime === undefined && (config.createRawDataFiles || config.createTcxFiles || config.createRowingDataFiles)) {
      await nameFilesAndCreateDirectory()
    }
    logRecorder.recordRowingMetrics(metrics)
    if (config.createTcxFiles) { tcxRecorder.recordRowingMetrics(metrics) }
    if (config.createRowingDataFiles) { rowingDataRecorder.recordRowingMetrics(metrics) }
  }

  async function recordHeartRate (heartRate) {
    logRecorder.recordHeartRate(heartRate)
    if (config.createTcxFiles) { tcxRecorder.recordHeartRate(heartRate) }
    if (config.createRowingDataFiles) { rowingDataRecorder.recordHeartRate(heartRate) }
  }

  async function nameFilesAndCreateDirectory () {
    startTime = new Date()
    // Calculate the directory name and create it if needed
    const directory = `${config.dataDirectory}/recordings/${startTime.getFullYear()}/${(startTime.getMonth() + 1).toString().padStart(2, '0')}`
    try {
      await fs.mkdir(directory, { recursive: true })
    } catch (error) {
      if (error.code !== 'EEXIST') {
        log.error(`can not create directory ${directory}`, error)
      }
    }

    // Determine the base filename to be used by all recorders
    const stringifiedStartTime = startTime.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '')
    const fileBaseName = `${directory}/${stringifiedStartTime}`
    if (config.createRawDataFiles) { rawRecorder.setBaseFileName(fileBaseName) }
    if (config.createTcxFiles) { tcxRecorder.setBaseFileName(fileBaseName) }
    if (config.createRowingDataFiles) { rowingDataRecorder.setBaseFileName(fileBaseName) }
  }

  async function activeWorkoutToTcx () {
    await tcxRecorder.activeWorkoutToTcx()
  }
  return {
    handleCommand,
    recordHeartRate,
    recordRotationImpulse,
    recordMetrics,
    activeWorkoutToTcx
  }
}

export { createRecordingManager }
