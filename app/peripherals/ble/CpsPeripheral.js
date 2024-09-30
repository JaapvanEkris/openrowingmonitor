'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Creates a Bluetooth Low Energy (BLE) Peripheral with all the Services that are required for
  a Cycling Power Profile
*/
import bleno from '@abandonware/bleno'
import log from 'loglevel'
import CyclingPowerService from './cps/CyclingPowerMeterService.js'
import DeviceInformationService from './common/DeviceInformationService.js'
import AdvertisingDataBuilder from './common/AdvertisingDataBuilder.js'
import { bleBroadcastInterval, bleMinimumKnowDataUpdateInterval } from '../PeripheralConstants.js'

function createCpsPeripheral (config) {
  const peripheralName = `${config.ftmsRowerPeripheralName} (CPS)`
  const cyclingPowerService = new CyclingPowerService((event) => log.debug('CPS Control Point', event))
  let lastKnownMetrics = {
    sessiontype: 'JustRow',
    sessionStatus: 'WaitingForStart',
    strokeState: 'WaitingForDrive',
    totalMovingTime: 0,
    totalLinearDistance: 0,
    dragFactor: config.rowerSettings.dragFactor,
    lastDataUpdateTime: Date.now()
  }
  let timer = setTimeout(onBroadcastInterval, bleBroadcastInterval)

  bleno.on('stateChange', (state) => {
    triggerAdvertising(state)
  })

  bleno.on('advertisingStart', (error) => {
    if (!error) {
      bleno.setServices(
        [
          cyclingPowerService,
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
      const cpsAppearance = 1156
      const advertisingData = new AdvertisingDataBuilder([cyclingPowerService.uuid], cpsAppearance, peripheralName)

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

  // Broadcast the last known metrics
  function onBroadcastInterval () {
    cyclingPowerService.notifyData(lastKnownMetrics)
    timer = setTimeout(onBroadcastInterval, bleBroadcastInterval)
  }

  // Records the last known rowing metrics to CPS central
  // As the client calculates its own speed based on time and distance,
  // we an only update the last known metrics upon a stroke state change to prevent spiky behaviour
  function notifyData (data) {
    const now = Date.now()
    if (data?.metricsContext && ((data.metricsContext.isRecoveryStart || data.metricsContext.isPauseStart || data.metricsContext.isSessionStop) || now - lastKnownMetrics.lastDataUpdateTime >= bleMinimumKnowDataUpdateInterval)) {
      lastKnownMetrics = { ...data, lastDataUpdateTime: now }
      clearTimeout(timer)
      onBroadcastInterval()
    }
  }

  // CPS does not have status characteristic
  function notifyStatus (status) {
  }

  return {
    triggerAdvertising,
    notifyData,
    notifyStatus,
    destroy
  }
}

export { createCpsPeripheral }
