'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import fs from 'fs/promises'
import { createFileWriter } from './fileWriter.js'
import { createLogRecorder } from './logRecorder.js'
import { createRawRecorder } from './rawRecorder.js'
import { createTCXRecorder } from './tcxRecorder.js'
import { createFITRecorder } from './fitRecorder.js'
import { createRowingDataRecorder } from './rowingDataRecorder.js'
import { createRowsAndAllInterface } from './rowsAndAllInterface.js'
import { createIntervalsInterface } from './intervalsInterface.js'

export function createRecordingManager (config) {
  let startTime
  let allRecordingsHaveBeenUploaded = true // ToDo: Make this an uploader responsibility!
  const fileWriter = createFileWriter()
  const logRecorder = createLogRecorder()
  const rawRecorder = createRawRecorder()
  const tcxRecorder = createTCXRecorder(config)
  const fitRecorder = createFITRecorder(config)
  const rowingDataRecorder = createRowingDataRecorder(config)
  const rowsAndAllInterface = createRowsAndAllInterface(config)
  const intervalsInterface = createIntervalsInterface(config)
  const recordRawData = config.createRawDataFiles
  const recordTcxData = config.createTcxFiles || config.stravaClientId !== ''
  const recordFitData = config.createFitFiles || config.userSettings.intervals.upload
  const recordRowingData = config.createRowingDataFiles || config.userSettings.rowsAndAll.upload

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the WorkoutRecorder will react to and what it will ignore
  // For the 'start', 'startOrResume', 'pause' and 'stop' commands, we await the official rowingengine reaction
  // eslint-disable-next-line no-unused-vars
  async function handleCommand (commandName, data, client) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        executeCommandsInParralel(commandName, data)
        break
      case ('start'):
        break
      case ('startOrResume'):
        break
      case ('pause'):
        break
      case ('stop'):
        break
      case ('reset'):
        await executeCommandsInParralel(commandName, data)
        await writeRecordings()
        await uploadRecordings()
        startTime = undefined
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
        await executeCommandsInParralel(commandName, data)
        await writeRecordings()
        await uploadRecordings()
        break
      default:
        log.error(`recordingManager: Recieved unknown command: ${commandName}`)
    }
  }

  async function recordRotationImpulse (impulse) {
    if (startTime === undefined && (recordRawData || recordTcxData || recordFitData || recordRowingData)) {
      await nameFilesAndCreateDirectory()
    }
    if (recordRawData) { await rawRecorder.recordRotationImpulse(impulse) }
  }

  async function recordMetrics (metrics) {
    if (startTime === undefined && (recordRawData || recordTcxData || recordFitData || recordRowingData)) {
      await nameFilesAndCreateDirectory()
    }
    logRecorder.recordRowingMetrics(metrics)
    if (recordRawData) { rawRecorder.recordRowingMetrics(metrics) }
    if (recordTcxData) { tcxRecorder.recordRowingMetrics(metrics) }
    if (recordFitData) { fitRecorder.recordRowingMetrics(metrics) }
    if (recordRowingData) { rowingDataRecorder.recordRowingMetrics(metrics) }
    allRecordingsHaveBeenUploaded = false

    if (metrics.metricsContext.isSessionStop || metrics.metricsContext.isPauseStart) {
      writeRecordings()
      setTimeout(writeRecordings, 195000)
      setTimeout(uploadRecordings, 200000)
    }
  }

  async function recordHeartRate (hrmData) {
    logRecorder.recordHeartRate(hrmData)
    if (recordTcxData) { tcxRecorder.recordHeartRate(hrmData) }
    if (recordFitData) { fitRecorder.recordHeartRate(hrmData) }
    if (recordRowingData) { rowingDataRecorder.recordHeartRate(hrmData) }
  }

  async function executeCommandsInParralel (commandName, data, client) {
    const parallelCalls = []
    parallelCalls.push(logRecorder.handleCommand(commandName, data, client))
    if (recordRawData) { parallelCalls.push(rawRecorder.handleCommand(commandName, data, client)) }
    if (recordTcxData) { parallelCalls.push(tcxRecorder.handleCommand(commandName, data, client)) }
    if (recordFitData) { parallelCalls.push(fitRecorder.handleCommand(commandName, data, client)) }
    if (recordRowingData) { parallelCalls.push(rowingDataRecorder.handleCommand(commandName, data, client)) }
    await Promise.all(parallelCalls)
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
    fileWriter.setBaseFileName(fileBaseName)
    rowsAndAllInterface.setBaseFileName(fileBaseName)
  }

  async function writeRecordings () {
    if (config.createRawDataFiles) { fileWriter.writeFile(rawRecorder, config.gzipRawDataFiles) }
    if (config.createRowingDataFiles) { fileWriter.writeFile(rowingDataRecorder, false) }
    if (config.createFitFiles) { fileWriter.writeFile(fitRecorder, config.gzipFitFiles) }
    if (config.createTcxFiles) { fileWriter.writeFile(tcxRecorder, config.gzipTcxFiles) }
  }

  async function uploadRecordings () {
    if (allRecordingsHaveBeenUploaded === true) { return }
    if (config.userSettings.rowsAndAll.upload) { await rowsAndAllInterface.uploadSessionResults(rowingDataRecorder) }
    if (config.userSettings.intervals.upload) { await intervalsInterface.uploadSessionResults(fitRecorder) }
    allRecordingsHaveBeenUploaded = true
  }

  async function activeWorkoutToTcx () {
    const tcx = await tcxRecorder.fileContent()
    const filename = 'results.tcx'
    return {
      tcx,
      filename
    }
  }

  return {
    handleCommand,
    recordHeartRate,
    recordRotationImpulse,
    recordMetrics,
    activeWorkoutToTcx
  }
}
