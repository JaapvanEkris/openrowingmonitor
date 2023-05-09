'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Creates the WebServer which serves the static assets and communicates with the clients
  via WebSockets
*/
import { WebSocket, WebSocketServer } from 'ws'
import finalhandler from 'finalhandler'
import http from 'http'
import serveStatic from 'serve-static'
import log from 'loglevel'
import EventEmitter from 'events'

function createWebServer (config) {
  const emitter = new EventEmitter()
  const port = process.env.PORT || 80
  const serve = serveStatic('./build', { index: ['index.html'] })
  let timeOfLastMetricsUpdate = 0
  let lastKnownMetrics
  let heartRate

  const server = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res))
  })

  server.listen(port, (err) => {
    if (err) throw err
    log.info(`webserver running on port ${port}`)
  })

  const wss = new WebSocketServer({ server })

  wss.on('connection', function connection (client) {
    log.debug('websocket client connected')
    notifyClient(client, 'config', getConfig())
    client.on('message', function incoming (data) {
      try {
        const message = JSON.parse(data)
        if (message) {
          emitter.emit('messageReceived', message, client)
        } else {
          log.warn(`invalid message received: ${data}`)
        }
      } catch (err) {
        log.error(err)
      }
    })
    client.on('close', function () {
      log.debug('websocket client disconnected')
    })
  })

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the PeripheralManager will react to and what it will ignore
  function handleCommand (commandName) {
    switch (commandName) {
      case ('start'):
        break
      case ('startOrResume'):
        break
      case ('pause'):
        break
      case ('stop'):
        break
      case ('reset'):
        break
      case 'blePeripheralMode':
        notifyClients('config', getConfig())
        break
      case 'switchBlePeripheralMode':
        break
      case 'antPeripheralMode':
        notifyClients('config', getConfig())
        break
      case 'switchAntPeripheralMode':
        break
      case 'hrmPeripheralMode':
        notifyClients('config', getConfig())
        break
      case 'switchHrmMode':
        break
      case 'uploadTraining':
        break
      case 'stravaAuthorizationCode':
        break
      case 'shutdown':
        break
      default:
        log.error(`WebServer: Recieved unknown command: ${commandName}`)
    }
  }

  let timer = setInterval(notifyClients, 1000, 'metrics', lastKnownMetrics)

  function presentRowingMetrics (metrics) {
    addHeartRateToMetrics(metrics)
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isIntervalStart):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isPauseStart):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isPauseEnd):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isDriveStart):
        notifyClients('metrics', metrics)
        break
      case (metrics.metricsContext.isRecoveryStart):
        notifyClients('metrics', metrics)
        break
      case((Date.now() - timeOfLastMetricsUpdate) > config.webUpdateInterval):
        // Normal metrics update, only config.webUpdateInterval ms after the last broadcast
        notifyClients('metrics', metrics)
    }
    lastKnownMetrics = metrics
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function presentHeartRate (value) {
    heartRate = value.heartrate
    if ((Date.now() - timeOfLastMetricsUpdate) > config.webUpdateInterval) {
      addHeartRateToMetrics(lastKnownMetrics)
      notifyClients('metrics', lastKnownMetrics)
    }
  }

  function notifyClient (client, type, data) {
    const messageString = JSON.stringify({ type, data })
    if (wss.clients.has(client)) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString)
      }
    } else {
      log.error('trying to send message to a client that does not exist')
    }
  }

  function notifyClients (type, data) {
    const messageString = JSON.stringify({ type, data })
    if (type === 'metrics') timeOfLastMetricsUpdate = Date.now()
    wss.clients.forEach(function each (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString)
      }
    })
  }

  function addHeartRateToMetrics (metrics) {
    if (heartRate !== undefined && config.userSettings.restingHR <= heartRate &&  heartRate <= config.userSettings.maxHR) {
      metrics.heartrate = heartRate
    } else {
      metrics.heartrate = undefined
    }
  }

  function getConfig () {
    return {
      blePeripheralMode: config.bluetoothMode,
      antPeripheralMode: config.antplusMode,
      hrmPeripheralMode: config.heartRateMode,
      stravaUploadEnabled: !!config.stravaClientId && !!config.stravaClientSecret,
      shutdownEnabled: !!config.shutdownCommand
    }
  }

  return Object.assign(emitter, {
    notifyClient,
    notifyClients,
    presentRowingMetrics,
    presentHeartRate,
    handleCommand
  })
}

export { createWebServer }
