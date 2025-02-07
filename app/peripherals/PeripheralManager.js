'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This manager creates the different Bluetooth Low Energy (BLE) Peripherals and allows
  switching between them
*/
import { createFtmsPeripheral } from './ble/FtmsPeripheral.js'
import { createPm5Peripheral } from './ble/Pm5Peripheral.js'
import log from 'loglevel'
import EventEmitter from 'node:events'
import { createCpsPeripheral } from './ble/CpsPeripheral.js'
import { createCscPeripheral } from './ble/CscPeripheral.js'
import AntManager from './ant/AntManager.js'
import { createAntHrmPeripheral } from './ant/HrmPeripheral.js'
import { createBleHrmPeripheral } from './ble/HrmPeripheral.js'
import { createFEPeripheral } from './ant/FEPeripheral.js'

const bleModes = ['FTMS', 'FTMSBIKE', 'PM5', 'CSC', 'CPS', 'OFF']
const antModes = ['FE', 'OFF']
const hrmModes = ['ANT', 'BLE', 'OFF']

export function createPeripheralManager (config) {
  const emitter = new EventEmitter()
  let _antManager
  let blePeripheral
  let bleMode

  let antPeripheral
  let antMode

  let hrmPeripheral
  let hrmMode
  let hrmWatchdogTimer
  let lastHrmData = {
    heartrate: undefined,
    heartRateBatteryLevel: undefined
  }

  let isPeripheralChangeInProgress = false

  setupPeripherals()

  async function setupPeripherals () {
    await createHrmPeripheral(config.heartRateMode)
    if (config.heartRateMode === 'BLE') { await delay(10000) } // WORKAROUND for BLE-Fix. ToDo: remove the need for this delay in the bluetooth startup completely
    await createBlePeripheral(config.bluetoothMode)
    await createAntPeripheral(config.antPlusMode)
  }

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the PeripheralManager will react to and what it will ignore
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
        log.error(`PeripheralManager: Recieved unknown command: ${commandName}`)
    }
  }

  function switchBlePeripheralMode (newMode) {
    if (isPeripheralChangeInProgress) return
    isPeripheralChangeInProgress = true
    // if no mode was passed, select the next one from the list
    if (newMode === undefined) {
      newMode = bleModes[(bleModes.indexOf(bleMode) + 1) % bleModes.length]
    }
    config.bluetoothMode = newMode
    createBlePeripheral(newMode)
    isPeripheralChangeInProgress = false
  }

  function notifyMetrics (metrics) {
    addHeartRateToMetrics(metrics)
    if (bleMode !== 'OFF') { blePeripheral?.notifyData(metrics) }
    if (antMode !== 'OFF') { antPeripheral?.notifyData(metrics) }
  }

  function notifyStatus (status) {
    if (bleMode !== 'OFF') { blePeripheral?.notifyStatus(status) }
    if (antMode !== 'OFF') { antPeripheral?.notifyStatus(status) }
  }

  async function createBlePeripheral (newMode) {
    if (blePeripheral) {
      await blePeripheral?.destroy()
      blePeripheral = undefined
    }
    switch (newMode) {
      case 'PM5':
        log.info('bluetooth profile: Concept2 PM5')
        blePeripheral = createPm5Peripheral(config)
        bleMode = 'PM5'
        break
      case 'FTMSBIKE':
        log.info('bluetooth profile: FTMS Indoor Bike')
        blePeripheral = createFtmsPeripheral(controlCallback, config, true)
        bleMode = 'FTMSBIKE'
        break
      case 'CSC':
        log.info('bluetooth profile: Cycling Speed and Cadence')
        blePeripheral = createCscPeripheral(config)
        bleMode = 'CSC'
        break
      case 'CPS':
        log.info('bluetooth profile: Cycling Power Meter')
        blePeripheral = createCpsPeripheral(config)
        bleMode = 'CPS'
        break
      case 'FTMS':
        log.info('bluetooth profile: FTMS Rower')
        blePeripheral = createFtmsPeripheral(controlCallback, config, false)
        bleMode = 'FTMS'
        break
      default:
        log.info('bluetooth profile: Off')
        bleMode = 'OFF'
    }
    if (bleMode.toLocaleLowerCase() !== 'OFF'.toLocaleLowerCase()) { blePeripheral.triggerAdvertising() }

    emitter.emit('control', {
      req: {
        name: 'refreshPeripheralConfig',
        data: {},
        client: null
      }
    })
  }

  function switchAntPeripheralMode (newMode) {
    if (isPeripheralChangeInProgress) return
    isPeripheralChangeInProgress = true
    if (newMode === undefined) {
      newMode = antModes[(antModes.indexOf(antMode) + 1) % antModes.length]
    }
    config.antPlusMode = newMode
    createAntPeripheral(newMode)
    isPeripheralChangeInProgress = false
  }

  async function createAntPeripheral (newMode) {
    if (antPeripheral) {
      await antPeripheral?.destroy()
      antPeripheral = undefined

      try {
        if (_antManager && hrmMode !== 'ANT' && newMode === 'OFF') { await _antManager.closeAntStick() }
      } catch (error) {
        log.error(error)
        return
      }
    }

    switch (newMode) {
      case 'FE':
        log.info('ant plus profile: FE')
        if (!_antManager) {
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
    }

    emitter.emit('control', {
      req: {
        name: 'refreshPeripheralConfig',
        data: {},
        client: null
      }
    })
  }

  function switchHrmMode (newMode) {
    if (isPeripheralChangeInProgress) return
    isPeripheralChangeInProgress = true
    if (newMode === undefined) {
      newMode = hrmModes[(hrmModes.indexOf(hrmMode) + 1) % hrmModes.length]
    }
    config.heartRateMode = newMode
    createHrmPeripheral(newMode)
    isPeripheralChangeInProgress = false
  }

  async function createHrmPeripheral (newMode) {
    if (hrmPeripheral) {
      await hrmPeripheral?.destroy()
      hrmPeripheral?.removeAllListeners()
      hrmPeripheral = undefined
      try {
        if (_antManager && newMode !== 'ANT' && antMode === 'OFF') { await _antManager.closeAntStick() }
      } catch (error) {
        log.error(error)
        return
      }
    }

    switch (newMode) {
      case 'ANT':
        log.info('heart rate profile: ANT')
        if (!_antManager) {
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
        hrmPeripheral = createBleHrmPeripheral()
        hrmMode = 'BLE'
        break

      default:
        log.info('heart rate profile: Off')
        hrmMode = 'OFF'
    }

    if (hrmMode.toLocaleLowerCase() !== 'OFF'.toLocaleLowerCase()) {
      hrmPeripheral.on('heartRateMeasurement', (heartRateMeasurement) => {
        // Clear the HRM watchdog as new HRM data has been recieved
        clearTimeout(hrmWatchdogTimer)
        // Make sure we check the HRM validity here, so the rest of the app doesn't have to
        if (heartRateMeasurement.heartrate !== undefined && config.userSettings.restingHR <= heartRateMeasurement.heartrate && heartRateMeasurement.heartrate <= config.userSettings.maxHR) {
          lastHrmData = { ...heartRateMeasurement }
          emitter.emit('heartRateMeasurement', heartRateMeasurement)
        } else {
          log.info(`PeripheralManager: Heartrate value of ${heartRateMeasurement.heartrate} was outside valid range, setting it to undefined`)
          heartRateMeasurement.heartrate = undefined
          heartRateMeasurement.heartRateBatteryLevel = undefined
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

  function addHeartRateToMetrics (metrics) {
    if (lastHrmData.heartrate !== undefined) {
      metrics.heartrate = lastHrmData.heartrate
    } else {
      metrics.heartrate = undefined
    }
    if (lastHrmData.heartRateBatteryLevel !== undefined) {
      metrics.heartRateBatteryLevel = lastHrmData.heartRateBatteryLevel
    } else {
      metrics.heartRateBatteryLevel = undefined
    }
  }

  function controlCallback (event) {
    emitter.emit('control', event)
  }

  async function shutdownAllPeripherals () {
    log.debug('shutting down all peripherals')

    try {
      await blePeripheral?.destroy()
      await antPeripheral?.destroy()
      await hrmPeripheral?.destroy()
      await _antManager?.closeAntStick()
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

function delay (ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms)
  })
}
