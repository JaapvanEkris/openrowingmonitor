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
import { createSessionManager } from './engine/SessionManager.js'
import { createWebServer } from './WebServer.js'
import { createPeripheralManager } from './peripherals/PeripheralManager.js'
import { createRecordingManager } from './recorders/recordingManager.js'
// eslint-disable-next-line no-unused-vars
import { replayRowingSession } from './tools/RowingRecorder.js'
import { createWorkoutUploader } from './engine/WorkoutUploader.js'
const exec = promisify(child_process.exec)

const shutdownEnabled = !!config.shutdownCommand

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

/* an example of the workout setting that the sessionManager will obey: a 1 minute warmup, a 2K timed piece followed by a 1 minute cooldown
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

const peripheralManager = createPeripheralManager(config)

peripheralManager.on('control', (event) => {
  log.debug(`peripheral requested ${event?.req?.name}`)
  sessionManager.handleCommand(event?.req?.name)
  recordingManager.handleCommand(event?.req?.name)
  peripheralManager.handleCommand(event?.req?.name)
  webServer.handleCommand(event?.req?.name)
  event.res = true
})

peripheralManager.on('heartRateMeasurement', (heartRateMeasurement) => {
  recordingManager.recordHeartRate(heartRateMeasurement)
  sessionManager.handleHeartRateMeasurement(heartRateMeasurement)
  webServer.presentHeartRate(heartRateMeasurement)
})

const gpioTimerService = child_process.fork('./app/gpio/GpioTimerService.js')
gpioTimerService.on('message', handleRotationImpulse)

// Be aware, both the GPIO as well as the replayer use this as an entrypoint!
function handleRotationImpulse (dataPoint) {
  recordingManager.recordRotationImpulse(dataPoint)
  sessionManager.handleRotationImpulse(dataPoint)
}

const recordingManager = createRecordingManager(config)
const sessionManager = createSessionManager(config)

sessionManager.on('metricsUpdate', (metrics) => {
  webServer.presentRowingMetrics(metrics)
  recordingManager.recordMetrics(metrics)
  // ToDo: move underlying decissions into all individual peripheralManager's peripherals
  // BE AWARE: This construct has an implicit filter as the regular in-stroke metricsUpdates will not be sent to the peripheralManager, as it is caught by the default
  // As peripheralMetricsUpdate is needed (which still is triggered by the sessionmanager), we can not remove this setup here until all peripherals do their own timing and filtering
  switch (true) {
    case (metrics.metricsContext.isSessionStop === true):
      // This is called when the rowingmachine is stopped for some reason, could be reaching the end of the session,
      // could be user intervention
      peripheralManager.notifyMetrics('metricsUpdate', metrics)
      break
    case (metrics.metricsContext.isIntervalStart === true):
      // This is called when the sessionManager concludes the intervaltarget is reached
      // Update all screens to reflect this change, as targetTime and targetDistance have changed
      // ToDo: recording this event in the recordings accordingly should be done as well
      peripheralManager.notifyMetrics('metricsUpdate', metrics)
      break
    case (metrics.metricsContext.isPauseStart === true):
      peripheralManager.notifyMetrics('strokeStateChanged', metrics)
      break
    case (metrics.metricsContext.isRecoveryStart === true):
      peripheralManager.notifyMetrics('strokeStateChanged', metrics)
      break
    case (metrics.metricsContext.isDriveStart === true):
      peripheralManager.notifyMetrics('strokeFinished', metrics)
      break
    default:
      // Nothing to do here
  }
})

// ToDo: REMOVE THIS AS SOON AS PERIPHERALS CAN DO THEIR OWN CACHING AND TIMING
sessionManager.on('peripheralMetricsUpdate', (metrics) => {
  peripheralManager.notifyMetrics('metricsUpdate', metrics)
})

const workoutUploader = createWorkoutUploader(config, recordingManager)

workoutUploader.on('authorizeStrava', (data, client) => {
  webServer.notifyClient(client, 'authorizeStrava', data)
})

const webServer = createWebServer(config)
webServer.on('messageReceived', async (message, client) => {
  log.debug(`webclient requested ${message.command}`)
  if (message.command === 'shutdown' && shutdownEnabled) {
    await shutdown()
  } else {
    sessionManager.handleCommand(message.command)
    recordingManager.handleCommand(message.command)
    peripheralManager.handleCommand(message.command)
    webServer.handleCommand(message.command)
    // ToDo: refactor the Strava uploader to something that fits in the architecture
    switch (message.command) {
      case 'uploadTraining':
        workoutUploader.upload(client)
        break
      case 'stravaAuthorizationCode':
        workoutUploader.stravaAuthorizationCode(message.data)
        break
    }
  }
})

if (intervalSettings.length > 0) {
  // There is an interval defined at startup, let's inform the sessionManager
  // ToDo: update these settings when the PM5 or webinterface tells us to
  sessionManager.setIntervalParameters(intervalSettings)
} else {
  log.info('Starting a just row session, no time or distance target set')
}

// This shuts down the pi, use with caution!
async function shutdown () {
  if (shutdownEnabled) {
    // As we are shutting down, we need to make sure things are closed down nicely
    await recordingManager.handleCommand('shutdown')
    await peripheralManager.handleCommand('shutdown')
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

process.once('SIGINT', async (signal) => {
  log.debug(`${signal} signal was received, shutting down gracefully`)
  await recordingManager.handleCommand('shutdown')
  await peripheralManager.handleCommand('shutdown')
  process.exit(0)
})

process.once('SIGTERM', async (signal) => {
  log.debug(`${signal} signal was received, shutting down gracefully`)
  await recordingManager.handleCommand('shutdown')
  await peripheralManager.handleCommand('shutdown')
  process.exit(0)
})

process.once('uncaughtException', async (error) => {
  log.error('Uncaught Exception:', error)
  await recordingManager.handleCommand('shutdown')
  await peripheralManager.handleCommand('shutdown')
  process.exit(1)
})

/*
replayRowingSession(handleRotationImpulse, {
//  filename: 'recordings/2021/04/rx800_2021-04-21_1845_Rowing_30Minutes_Damper8.csv', // 30 minutes, damper 10
  realtime: true,
  loop: false
})
*/
