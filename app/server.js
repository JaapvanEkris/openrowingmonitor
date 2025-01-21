'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
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
import { replayRowingSession } from './recorders/RowingReplayer.js'
import { createWorkoutUploader } from './recorders/WorkoutUploader.js'

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

/* an example of the workout setting that the sessionManager will obey: a 1 minute warmup, one minute rest, a 2K timed piece, followed by one minute rest, and a 1 minute cooldown
// Some with a 500 meter split, one with a 30 second split
// ToDo: This should normally come from the PM5 interface, the webinterface or one of the integration partners
intervalSettings[0] = {
  type: 'time',
  targetDistance: 0,
  targetTime: 60,
  split: {
    type: 'distance',
    targetDistance: 0,
    targetTime: 30
  }
}

intervalSettings[1] = {
  type: 'rest',
  targetDistance: 0,
  targetTime: 60,
}

intervalSettings[2] = {
  type: 'distance',
  targetDistance: 2000,
  targetTime: 0,
  split: {
    type: 'distance',
    targetDistance: 500,
    targetTime: 0
  }
}

intervalSettings[3] = {
  type: 'rest',
  targetDistance: 0,
  targetTime: 60,
}

intervalSettings[4] = {
  type: 'time',
  targetDistance: 0,
  targetTime: 60,
  split: {
    type: 'distance',
    targetDistance: 500,
    targetTime: 0
  }
}
*/

const peripheralManager = createPeripheralManager(config)

peripheralManager.on('control', (event) => {
  log.debug(`Server: peripheral requested ${event?.req?.name}`)
  handleCommand(event?.req?.name, event?.req?.data, event?.req?.client)
  event.res = true
})

peripheralManager.on('heartRateMeasurement', (heartRateMeasurement) => {
  // As the peripheralManager already has this info, it will enrich metrics based on the data internally
  recordingManager.recordHeartRate(heartRateMeasurement)
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
const workoutUploader = createWorkoutUploader(config, recordingManager)

const sessionManager = createSessionManager(config)

sessionManager.on('metricsUpdate', (metrics) => {
  webServer.presentRowingMetrics(metrics)
  recordingManager.recordMetrics(metrics)
  peripheralManager.notifyMetrics(metrics)
})

workoutUploader.on('authorizeStrava', (data, client) => {
  // ToDo: bring further in line with command handler structure to allow workoutUploader to send more commands
  handleCommand('authorizeStrava', data, client)
})

const webServer = createWebServer(config)
webServer.on('messageReceived', async (message, client) => {
  log.debug(`server: webclient requested ${message.command}`)
  await handleCommand(message.command, message.data, client)
})

async function handleCommand (command, data, client) {
  switch (command) {
    case 'shutdown':
      if (shutdownEnabled) {
        await shutdownApp()
        await shutdownPi()
      } else {
        log.error('Shutdown requested, but shutdown is disabled')
      }
      break
    case 'uploadTraining':
      // ToDo: move this into the recordingmanager commandhandler
      workoutUploader.upload(client)
      break
    case 'stravaAuthorizationCode':
      // ToDo: move this into the recordingmanager commandhandler
      workoutUploader.stravaAuthorizationCode(data)
      break
    default:
      sessionManager.handleCommand(command, data, client)
      recordingManager.handleCommand(command, data, client)
      peripheralManager.handleCommand(command, data, client)
      webServer.handleCommand(command, data, client)
      break
  }
}

// Be Aware, this is a temporary workaround to activate the hardcoded settings at application start
// ToDo: move this to the handlecommand structure as soon as the PM5/web-interface can do this
if (intervalSettings.length > 0) {
  // There is a manually defined interval at startup, let's inform the sessionManager
  handleCommand('updateIntervalSettings', intervalSettings, null)
} else {
  log.info('Starting a just row session, no time or distance target set')
}

// This shuts down the pi hardware, use with caution!
async function shutdownPi () {
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

process.once('SIGINT', async (signal) => {
  log.debug(`${signal} signal was received, shutting down gracefully`)
  await shutdownApp()
  process.exit(0)
})

process.once('SIGTERM', async (signal) => {
  log.debug(`${signal} signal was received, shutting down gracefully`)
  await shutdownApp()
  process.exit(0)
})

process.once('uncaughtException', async (error) => {
  log.error('Uncaught Exception:', error)
  await shutdownApp()
  process.exit(1)
})

// This shuts down the pi, use with caution!
async function shutdownApp () {
  // As we are shutting down, we need to make sure things are closed down nicely and save what we can
  await recordingManager.handleCommand('shutdown')
  await peripheralManager.handleCommand('shutdown')
}

/* Uncomment the following lines to simulate a session
replayRowingSession(handleRotationImpulse, {
  filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', // Concept 2, 2000 meter session
  realtime: true,
  loop: false
})
*/
