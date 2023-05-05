'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This start file is currently a mess, but we are getting more structure as we know what this should do
  todo: refactor this as we progress
*/
import os from 'os'
import child_process from 'child_process'
import { promisify } from 'util'
import log from 'loglevel'
import config from './tools/ConfigManager.js'
import { createRowingStatistics } from './engine/RowingStatistics.js'
import { createWebServer } from './WebServer.js'
import { createPeripheralManager } from './peripherals/PeripheralManager.js'
import { createRecordingManager } from './recorders/recordingManager.js'
// eslint-disable-next-line no-unused-vars
import { replayRowingSession } from './tools/RowingRecorder.js'
import { createWorkoutUploader } from './engine/WorkoutUploader.js'
import { secondsToTimeString } from './tools/Helper.js'
const exec = promisify(child_process.exec)

// set the log levels
log.setLevel(config.loglevel.default)
for (const [loggerName, logLevel] of Object.entries(config.loglevel)) {
  if (loggerName !== 'default') {
    log.getLogger(loggerName).setLevel(logLevel)
  }
}

log.info(`==== Open Rowing Monitor ${process.env.npm_package_version || ''} ====\n`)

if (config.appPriority) {
  // setting the (near-real-time?) priority for the main process, to prevent blocking the GPIO thread
  const mainPriority = Math.min((config.appPriority), 0)
  log.debug(`Setting priority for the main server thread to ${mainPriority}`)
  try {
    // setting priority of current process
    os.setPriority(mainPriority)
  } catch (err) {
    log.debug('need root permission to set priority of main server thread')
  }
}

// a hook for setting session parameters that the rower has to obey
// Hopefully this will be filled through the WebGUI or through the BLE interface (PM5-BLE can do this...)
// When set, ORM will terminate the session after reaching the target. If not set, it will behave as usual (a "Just row" session).
// When set, the GUI will behave similar to a PM5 in that it counts down from the target to 0
const intervalSettings = []

/* an example of the workout setting that RowingStatistics will obey: a 1 minute warmup, a 2K timed piece followed by a 1 minute cooldown
// This should normally come from the PM5 interface or the webinterface
intervalSettings[0] = {
  targetDistance: 0,
  targetTime: 60
}

/* Additional intervals for testing
intervalSettings[1] = {
  targetDistance: 2000,
  targetTime: 0
}

intervalSettings[2] = {
  targetDistance: 0,
  targetTime: 60
}
*/

const peripheralManager = createPeripheralManager()

peripheralManager.on('control', (event) => {
  log.debug(`Peripheral requested ${event?.req?.name}`)
  rowingStatistics.handleCommand(event?.req?.name)
  recordingManager.handleCommand(event?.req?.name)
  // ideally it would also say peripheralManager.handleCommand(event?.req?.name), instead of the switch statement
  switch (event?.req?.name) {
    case 'reset':
      peripheralManager.notifyStatus({ name: 'reset' })
      break
    case 'stop':
      peripheralManager.notifyStatus({ name: 'stoppedOrPausedByUser' })
      break
    case 'pause':
      peripheralManager.notifyStatus({ name: 'stoppedOrPausedByUser' })
      break
    case 'startOrResume':
      peripheralManager.notifyStatus({ name: 'startedOrResumedByUser' })
      break
    case 'blePeripheralMode':
      webServer.notifyClients('config', getConfig())
      break
    case 'antPeripheralMode':
      webServer.notifyClients('config', getConfig())
      break
    case 'hrmPeripheralMode':
      webServer.notifyClients('config', getConfig())
      break
  }
  event.res = true
})

peripheralManager.on('heartRateMeasurement', (heartRateMeasurement) => {
  rowingStatistics.handleHeartRateMeasurement(heartRateMeasurement)
  recordingManager.recordHeartRate(heartRateMeasurement)
})

const gpioTimerService = child_process.fork('./app/gpio/GpioTimerService.js')
gpioTimerService.on('message', handleRotationImpulse)

process.once('SIGINT', async (signal) => {
  log.debug(`${signal} signal was received, shutting down gracefully`)
  await peripheralManager.shutdownAllPeripherals()
  process.exit(0)
})
process.once('SIGTERM', async (signal) => {
  log.debug(`${signal} signal was received, shutting down gracefully`)
  await peripheralManager.shutdownAllPeripherals()
  process.exit(0)
})
process.once('uncaughtException', async (error) => {
  log.error('Uncaught Exception:', error)
  await peripheralManager.shutdownAllPeripherals()
  process.exit(1)
})

function handleRotationImpulse (dataPoint) {
  recordingManager.recordRotationImpulse(dataPoint)
  rowingStatistics.handleRotationImpulse(dataPoint)
}

const rowingStatistics = createRowingStatistics(config)
if (intervalSettings.length > 0) {
  // There is an interval defined at startup, let's inform RowingStatistics
  // ToDo: update these settings when the PM5 or webinterface tells us to
  rowingStatistics.setIntervalParameters(intervalSettings)
} else {
  log.info('Starting a just row session, no time or distance target set')
}

const recordingManager = createRecordingManager(config)
const workoutUploader = createWorkoutUploader(recordingManager)

rowingStatistics.on('driveFinished', (metrics) => {
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('strokeStateChanged', metrics)
})

rowingStatistics.on('recoveryFinished', (metrics) => {
  logMetrics(metrics)
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('strokeFinished', metrics)
  recordingManager.recordStroke(metrics)
})

rowingStatistics.on('webMetricsUpdate', (metrics) => {
  webServer.notifyClients('metrics', metrics)
})

rowingStatistics.on('peripheralMetricsUpdate', (metrics) => {
  peripheralManager.notifyMetrics('metricsUpdate', metrics)
})

rowingStatistics.on('rowingPaused', (metrics) => {
  logMetrics(metrics)
  recordingManager.recordStroke(metrics)
  recordingManager.handleCommand('pause')
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('metricsUpdate', metrics)
})

rowingStatistics.on('intervalTargetReached', (metrics) => {
  // This is called when the RowingStatistics conclude the intervaltarget is reached
  // Update all screens to reflect this change, as targetTime and targetDistance have changed
  // ToDo: recording this event in the recordings accordingly should be done as well
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('metricsUpdate', metrics)
})

rowingStatistics.on('rowingStopped', (metrics) => {
  // This is called when the rowingmachine is stopped for some reason, could be reaching the end of the session,
  // could be user intervention
  logMetrics(metrics)
  recordingManager.recordStroke(metrics)
  recordingManager.handleCommand('stop')
  webServer.notifyClients('metrics', metrics)
  peripheralManager.notifyMetrics('metricsUpdate', metrics)
})

workoutUploader.on('authorizeStrava', (data, client) => {
  webServer.notifyClient(client, 'authorizeStrava', data)
})

workoutUploader.on('resetWorkout', () => {
  // WHY should the workout uploader be able to reset the entire application?????
  rowingStatistics.handleCommand('reset')
  recordingManager.handleCommand('reset')
  peripheralManager.notifyStatus({ name: 'reset' })
})

const webServer = createWebServer()
webServer.on('messageReceived', async (message, client) => {
  log.debug(`webclient requested ${message.command}`)
  recordingManager.handleCommand(message.command)
  rowingStatistics.handleCommand(message.command)
  switch (message.command) {
    case 'switchBlePeripheralMode':
      peripheralManager.switchBlePeripheralMode()
      break
    case 'switchAntPeripheralMode':
      peripheralManager.switchAntPeripheralMode()
      break
    case 'switchHrmMode':
      peripheralManager.switchHrmMode()
      break
    case 'reset':
      peripheralManager.notifyStatus({ name: 'reset' })
      break
    case 'uploadTraining':
      workoutUploader.upload(client)
      break
    case 'shutdown':
      await shutdown()
      break
    case 'stravaAuthorizationCode':
      workoutUploader.stravaAuthorizationCode(message.data)
      break
    default:
      log.warn('invalid command received:', message)
  }
})

webServer.on('clientConnected', (client) => {
  webServer.notifyClient(client, 'config', getConfig())
})

// todo: extract this into some kind of state manager
function getConfig () {
  return {
    blePeripheralMode: peripheralManager.getBlePeripheralMode(),
    antPeripheralMode: peripheralManager.getAntPeripheralMode(),
    hrmPeripheralMode: peripheralManager.getHrmPeripheralMode(),
    stravaUploadEnabled: !!config.stravaClientId && !!config.stravaClientSecret,
    shutdownEnabled: !!config.shutdownCommand
  }
}

// This shuts down the pi, use with caution!
async function shutdown () {
  if (Boolean(config.shutdownCommand)) {
    console.info('shutting down device...')
    try {
      const { stdout, stderr } = await exec(config.shutdownCommand)
      if (stderr) {
        log.error('can not shutdown: ', stderr)
      }
      log.info(stdout)
    } catch (error) {
      log.error('can not shutdown: ', error)
    }
  }
}

function logMetrics (metrics) {
  log.info(`stroke: ${metrics.totalNumberOfStrokes}, dist: ${metrics.totalLinearDistance.toFixed(1)}m, speed: ${metrics.cycleLinearVelocity.toFixed(2)}m/s` +
  `, pace: ${secondsToTimeString(metrics.cyclePace)}/500m, power: ${Math.round(metrics.cyclePower)}W, cal: ${metrics.totalCalories.toFixed(1)}kcal` +
  `, SPM: ${metrics.cycleStrokeRate.toFixed(1)}, drive dur: ${metrics.driveDuration.toFixed(2)}s, rec. dur: ${metrics.recoveryDuration.toFixed(2)}s` +
  `, stroke dur: ${metrics.cycleDuration.toFixed(2)}s`)
}

/*
replayRowingSession(handleRotationImpulse, {
//  filename: 'recordings/2021/04/rx800_2021-04-21_1845_Rowing_30Minutes_Damper8.csv', // 30 minutes, damper 10
  realtime: true,
  loop: false
})
*/
