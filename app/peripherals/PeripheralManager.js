'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This manager creates the different Bluetooth Low Energy (BLE) Peripherals and allows
  switching between them
*/
import EventEmitter from 'node:events'

import log from 'loglevel'

import AntManager from './ant/AntManager.js'
import { BleManager } from './ble/BleManager.js'

import { createAntHrmPeripheral } from './ant/HrmPeripheral.js'
import { createBleHrmPeripheral } from './ble/HrmPeripheral.js'
import { createCpsPeripheral } from './ble/CpsPeripheral.js'
import { createCscPeripheral } from './ble/CscPeripheral.js'
import { createFEPeripheral } from './ant/FEPeripheral.js'
import { createFtmsPeripheral } from './ble/FtmsPeripheral.js'
import { createMQTTPeripheral } from './mqtt/mqtt.js'
import { createPm5Peripheral } from './ble/Pm5Peripheral.js'

/**
 * @type {Array<BluetoothModes>}
 */
const bleModes = ['FTMS', 'FTMSBIKE', 'PM5', 'CSC', 'CPS', 'OFF']
/**
 * @type {Array<AntPlusModes>}
 */
const antModes = ['FE', 'OFF']
/**
 * @type {Array<HeartRateModes>}
 */
const hrmModes = ['ANT', 'BLE', 'OFF']

/**
 * @param {Config} config
 */
export function createPeripheralManager (config) {
  /**
   * @type {EventEmitter<{heartRateMeasurement: Array<Partial<HeartRateMeasurementEvent>>, control: Array<ControlPointEvent>}>}
   */
  const emitter = new EventEmitter()
  const mqttEnabled = (config.mqtt.mqttBroker !== '') && (config.mqtt.username !== '') && (config.mqtt.password !== '') && (config.mqtt.machineName !== '')
  let _antManager
  let _bleManager

  let blePeripheral
  let bleMode

  let antPeripheral
  let antMode

  let mqttPeripheral
  if (mqttEnabled) {
    mqttPeripheral = createMQTTPeripheral(config)

    mqttPeripheral.on('control', (req) => {
      emitter.emit('control', req)
    })
  }

  let hrmPeripheral
  let hrmMode
  let hrmWatchdogTimer
  /**
   * @type {Omit<HeartRateMeasurementEvent,'batteryLevel'> & {heartRateBatteryLevel?: number }}
   */
  let lastHrmData = {
    heartrate: undefined,
    heartRateBatteryLevel: undefined,
    rrIntervals: []
  }

  let isPeripheralChangeInProgress = false

  setupPeripherals()

  async function setupPeripherals () {
    // The order is important, starting with the BLEs causes EBUSY error on the HCI socket on switching. I was not able to find the cause - its probably the order within the async initialization of the BleManager, but cannot find a proper fix
    await createAntPeripheral(config.antPlusMode)
    await createHrmPeripheral(config.heartRateMode)
    await createBlePeripheral(config.bluetoothMode)
  }

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the PeripheralManager will react to and what it will ignore
  // eslint-disable-next-line no-unused-vars
  async function handleCommand (commandName, data, client) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        break
      case ('start'):
        break
      case ('startOrResume'):
        notifyStatus({ name: 'startedOrResumedByUser' })
        break
      case ('pause'):
        notifyStatus({ name: 'stoppedOrPausedByUser' })
        break
      case ('stop'):
        notifyStatus({ name: 'stoppedOrPausedByUser' })
        break
      case ('requestControl'):
        break
      case ('reset'):
        notifyStatus({ name: 'reset' })
        break
      case 'switchBlePeripheralMode':
        switchBlePeripheralMode()
        break
      case 'switchAntPeripheralMode':
        switchAntPeripheralMode()
        break
      case 'switchHrmMode':
        switchHrmMode()
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
        await shutdownAllPeripherals()
        break
      default:
        log.error(`PeripheralManager: Received unknown command: ${commandName}`)
    }
  }

  async function switchBlePeripheralMode (newMode) {
    if (isPeripheralChangeInProgress) return
    isPeripheralChangeInProgress = true
    // if no mode was passed, select the next one from the list
    if (newMode === undefined) {
      newMode = bleModes[(bleModes.indexOf(bleMode) + 1) % bleModes.length]
    }
    config.bluetoothMode = newMode
    await createBlePeripheral(newMode)
    isPeripheralChangeInProgress = false
  }

  function notifyMetrics (metrics) {
    addHeartRateToMetrics(metrics)
    if (bleMode !== 'OFF') { blePeripheral?.notifyData(metrics) }
    if (antMode !== 'OFF') { antPeripheral?.notifyData(metrics) }
    if (mqttEnabled) { mqttPeripheral.notifyData(metrics) }
  }

  function notifyStatus (status) {
    if (bleMode !== 'OFF') { blePeripheral?.notifyStatus(status) }
    if (antMode !== 'OFF') { antPeripheral?.notifyStatus(status) }
  }

  async function createBlePeripheral (newMode) {
    try {
      if (_bleManager === undefined && newMode !== 'OFF') {
        _bleManager = new BleManager()
      }
    } catch (error) {
      log.error('BleManager creation error: ', error)
      return
    }

    if (blePeripheral) {
      await blePeripheral?.destroy()
      blePeripheral = undefined
    }

    switch (newMode) {
      case 'PM5':
        log.info('bluetooth profile: Concept2 PM5')
        blePeripheral = createPm5Peripheral(_bleManager, config, controlCallback)
        bleMode = 'PM5'
        break
      case 'FTMSBIKE':
        log.info('bluetooth profile: FTMS Indoor Bike')
        blePeripheral = createFtmsPeripheral(_bleManager, controlCallback, config, true)
        bleMode = 'FTMSBIKE'
        break
      case 'CSC':
        log.info('bluetooth profile: Cycling Speed and Cadence')
        blePeripheral = createCscPeripheral(_bleManager, config)
        bleMode = 'CSC'
        break
      case 'CPS':
        log.info('bluetooth profile: Cycling Power Meter')
        blePeripheral = createCpsPeripheral(_bleManager, config)
        bleMode = 'CPS'
        break
      case 'FTMS':
        log.info('bluetooth profile: FTMS Rower')
        blePeripheral = createFtmsPeripheral(_bleManager, controlCallback, config, false)
        bleMode = 'FTMS'
        break
      default:
        log.info('bluetooth profile: Off')
        bleMode = 'OFF'
        try {
          if (_bleManager && hrmMode !== 'BLE') {
            _bleManager.close()
          }
        } catch (error) {
          log.error(error)
          return
        }
    }

    emitter.emit('control', {
      req: {
        name: 'refreshPeripheralConfig',
        data: {},
        client: null
      }
    })
  }

  async function switchAntPeripheralMode (newMode) {
    if (isPeripheralChangeInProgress) return
    isPeripheralChangeInProgress = true
    if (newMode === undefined) {
      newMode = antModes[(antModes.indexOf(antMode) + 1) % antModes.length]
    }
    config.antPlusMode = newMode
    await createAntPeripheral(newMode)
    isPeripheralChangeInProgress = false
  }

  async function createAntPeripheral (newMode) {
    if (antPeripheral) {
      await antPeripheral?.destroy()
      antPeripheral = undefined
    }

    switch (newMode) {
      case 'FE':
        log.info('ant plus profile: FE')
        if (_antManager === undefined) {
          _antManager = new AntManager()
        }

        try {
          antPeripheral = createFEPeripheral(_antManager)
          antMode = 'FE'
          await antPeripheral.attach()
        } catch (error) {
          log.error(error)
          return
        }
        break

      default:
        log.info('ant plus profile: Off')
        antMode = 'OFF'
        try {
          if (_antManager && hrmMode !== 'ANT') { await _antManager.closeAntStick() }
        } catch (error) {
          log.error(error)
          return
        }
    }

    emitter.emit('control', {
      req: {
        name: 'refreshPeripheralConfig',
        data: {},
        client: null
      }
    })
  }

  async function switchHrmMode (newMode) {
    if (isPeripheralChangeInProgress) return
    isPeripheralChangeInProgress = true
    if (newMode === undefined) {
      newMode = hrmModes[(hrmModes.indexOf(hrmMode) + 1) % hrmModes.length]
    }
    config.heartRateMode = newMode
    await createHrmPeripheral(newMode)
    isPeripheralChangeInProgress = false
  }

  async function createHrmPeripheral (newMode) {
    if (hrmPeripheral) {
      await hrmPeripheral?.destroy()
      hrmPeripheral?.removeAllListeners()
      hrmPeripheral = undefined
      try {
        if (_antManager && newMode !== 'ANT' && antMode === 'OFF') { await _antManager.closeAntStick() }
        if (_bleManager && newMode !== 'BLE' && bleMode === 'OFF') { _bleManager.close() }
      } catch (error) {
        log.error(error)
        return
      }
    }

    switch (newMode) {
      case 'ANT':
        log.info('heart rate profile: ANT')
        if (_antManager === undefined) {
          _antManager = new AntManager()
        }

        try {
          hrmPeripheral = createAntHrmPeripheral(_antManager)
          hrmMode = 'ANT'
          await hrmPeripheral.attach()
        } catch (error) {
          log.error(error)
          return
        }
        break

      case 'BLE':
        log.info('heart rate profile: BLE')
        try {
          if (_bleManager === undefined) {
            _bleManager = new BleManager()
          }
        } catch (error) {
          log.error('BleManager creation error: ', error)
          return
        }
        hrmPeripheral = createBleHrmPeripheral(_bleManager)
        hrmMode = 'BLE'
        await hrmPeripheral.attach()
        break

      default:
        log.info('heart rate profile: Off')
        hrmMode = 'OFF'
    }

    if (hrmMode.toLocaleLowerCase() !== 'OFF'.toLocaleLowerCase()) {
      hrmPeripheral.on('heartRateMeasurement', (/** @type {HeartRateMeasurementEvent} */heartRateMeasurement) => {
        // Clear the HRM watchdog as new HRM data has been received
        clearTimeout(hrmWatchdogTimer)
        // Make sure we check the HRM validity here, so the rest of the app doesn't have to
        if (heartRateMeasurement.heartrate !== undefined && config.userSettings.restingHR <= heartRateMeasurement.heartrate && heartRateMeasurement.heartrate <= config.userSettings.maxHR) {
          lastHrmData = { ...heartRateMeasurement, heartRateBatteryLevel: heartRateMeasurement.batteryLevel }
          emitter.emit('heartRateMeasurement', heartRateMeasurement)
        } else {
          log.info(`PeripheralManager: Heartrate value of ${heartRateMeasurement.heartrate} was outside valid range, setting it to undefined`)
          heartRateMeasurement.heartrate = undefined
          heartRateMeasurement.batteryLevel = undefined
          emitter.emit('heartRateMeasurement', heartRateMeasurement)
        }
        // Re-arm the HRM watchdog to guarantee failsafe behaviour: after 6 seconds of no new HRM data, it will be invalidated
        hrmWatchdogTimer = setTimeout(onHRMWatchdogTimeout, 6000)
      })
    }

    emitter.emit('control', {
      req: {
        name: 'refreshPeripheralConfig',
        data: {},
        client: null
      }
    })
  }

  function onHRMWatchdogTimeout () {
    lastHrmData.heartrate = undefined
    lastHrmData.heartRateBatteryLevel = undefined
    log.info('PeripheralManager: Heartrate data has not been updated in 6 seconds, setting it to undefined')
    emitter.emit('heartRateMeasurement', lastHrmData)
  }

  /**
   * @param {Metrics} metrics
   */
  function addHeartRateToMetrics (metrics) {
    if (lastHrmData.heartrate !== undefined) {
      metrics.heartrate = lastHrmData.heartrate
    } else {
      metrics.heartrate = undefined
    }
    // So far battery level is not used by any of the peripherals adding it for completeness sake
    if (lastHrmData.heartRateBatteryLevel !== undefined) {
      metrics.heartRateBatteryLevel = lastHrmData.heartRateBatteryLevel
    } else {
      metrics.heartRateBatteryLevel = undefined
    }
  }

  /**
   * @param {ControlPointEvent} event
   */
  function controlCallback (event) {
    emitter.emit('control', event)

    return true
  }

  async function shutdownAllPeripherals () {
    log.debug('shutting down all peripherals')

    try {
      await blePeripheral?.destroy()
      await antPeripheral?.destroy()
      await hrmPeripheral?.destroy()
      await _antManager?.closeAntStick()
      _bleManager?.close()
      if (mqttEnabled) { await mqttPeripheral?.destroy() }
    } catch (error) {
      log.error('peripheral shutdown was unsuccessful, restart of Pi may required', error)
    }
  }

  return Object.assign(emitter, {
    handleCommand,
    notifyMetrics,
    notifyStatus
  })
}
