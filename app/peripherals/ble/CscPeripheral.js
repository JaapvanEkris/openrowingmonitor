'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Cycling Speed and Cadence Profile
*/
import bleno from '@abandonware/bleno'
import config from '../../tools/ConfigManager.js'
import log from 'loglevel'
import DeviceInformationService from './common/DeviceInformationService.js'
import CyclingSpeedCadenceService from './csc/CyclingSpeedCadenceService.js'
import AdvertisingDataBuilder from './common/AdvertisingDataBuilder.js'

function createCscPeripheral () {
  const peripheralName = `${config.ftmsRowerPeripheralName} (CSC)`
  const cyclingSpeedCadenceService = new CyclingSpeedCadenceService((event) => log.debug('CSC Control Point', event))

  const broadcastInterval = config.peripheralUpdateInterval
  let lastKnownMetrics = {
    sessiontype: 'JustRow',
    sessionStatus: 'WaitingForStart',
    strokeState: 'WaitingForDrive',
    totalMovingTime: 0,
    totalLinearDistance: 0,
    dragFactor: config.rowerSettings.dragFactor
  }
  let timer = setTimeout(onBroadcastInterval, broadcastInterval)

  bleno.on('stateChange', (state) => {
    triggerAdvertising(state)
  })

  bleno.on('advertisingStart', (error) => {
    if (!error) {
      bleno.setServices(
        [
          cyclingSpeedCadenceService,
          new DeviceInformationService()
        ],
        (error) => {
          if (error) log.error(error)
        })
    }
  })

  bleno.on('accept', (clientAddress) => {
    log.debug(`ble central connected: ${clientAddress}`)
    bleno.updateRssi()
  })

  bleno.on('disconnect', (clientAddress) => {
    log.debug(`ble central disconnected: ${clientAddress}`)
  })

  bleno.on('platform', (event) => {
    log.debug('platform', event)
  })
  bleno.on('addressChange', (event) => {
    log.debug('addressChange', event)
  })
  bleno.on('mtuChange', (event) => {
    log.debug('mtuChange', event)
  })
  bleno.on('advertisingStartError', (event) => {
    log.debug('advertisingStartError', event)
  })
  bleno.on('servicesSetError', (event) => {
    log.debug('servicesSetError', event)
  })
  bleno.on('rssiUpdate', (event) => {
    log.debug('rssiUpdate', event)
  })

  function destroy () {
    clearTimeout(timer)
    return new Promise((resolve) => {
      bleno.disconnect()
      bleno.removeAllListeners()
      bleno.stopAdvertising(() => resolve())
    })
  }

  function triggerAdvertising (eventState) {
    const activeState = eventState || bleno.state
    if (activeState === 'poweredOn') {
      const cscAppearance = 1157
      const advertisingData = new AdvertisingDataBuilder([cyclingSpeedCadenceService.uuid], cscAppearance, peripheralName)

      bleno.startAdvertisingWithEIRData(
        advertisingData.buildAppearanceData(),
        advertisingData.buildScanData(),
        (error) => {
          if (error) log.error(error)
        }
      )
    } else {
      bleno.stopAdvertising()
    }
  }

  // present current rowing metrics to FTMS central
  function onBroadcastInterval () {
    cyclingSpeedCadenceService.notifyData(lastKnownMetrics)
    timer = setTimeout(onBroadcastInterval, broadcastInterval)
  }

  // Records the last known rowing metrics to FTMS central
  // As the client calculates its own speed based on time and distance,
  // we an only update the lastknown metrics upon a stroke state change to prevent spikey behaviour
  function notifyData (data) {
    if (metrics.metricsContext === undefined) return
    switch (true) {
      case (data.metricsContext.isSessionStart):
        lastKnownMetrics = data
        break
      case (data.metricsContext.isSessionStop):
        lastKnownMetrics = data
        break
      case (data.metricsContext.isIntervalStart):
        lastKnownMetrics = data
        break
      case (data.metricsContext.isPauseStart):
        lastKnownMetrics = data
        break
      case (data.metricsContext.isPauseEnd):
        lastKnownMetrics = data
        break
      case (data.metricsContext.isDriveStart):
        lastKnownMetrics = data
        break
      case (data.metricsContext.isRecoveryStart):
        lastKnownMetrics = data
        break
      default:
        // Do nothing
    }
  }

  // CSC does not have status characteristic
  function notifyStatus (status) {
  }

  return {
    triggerAdvertising,
    notifyData,
    notifyStatus,
    destroy
  }
}

export { createCscPeripheral }
