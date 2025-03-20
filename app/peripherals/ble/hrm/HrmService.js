'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Starts the central this.#manager in a forked thread since noble does not like
  to run in the same thread as bleno
*/
import EventEmitter from 'node:events'

import { BleManager } from 'ble-host'
import logger from 'loglevel'

import { toBLEStandard128BitUUID } from '../BleManager.js'

/**
 * @typedef {import('../ble-host.interface.js').Connection} Connection
 * @typedef {import('../ble-host.interface.js').Scanner} Scanner
 */

const log = logger.getLogger('Peripherals')

const heartRateServiceUUID = toBLEStandard128BitUUID('180D')
const heartRateMeasurementUUID = toBLEStandard128BitUUID('2A37')

const batteryLevelServiceUUID = toBLEStandard128BitUUID('180F')
const batteryLevelMeasurementUUID = toBLEStandard128BitUUID('2A19')

export class HrmService extends EventEmitter {
  #manager
  /**
   * @type {Scanner | undefined}
   */
  #scanner
  /**
   * @type {Connection | undefined}
   */
  #connection
  /**
   * @type {import('../ble-host.interface.js').GattClientCharacteristic | undefined}
   */
  #heartRateMeasurementCharacteristic
  /**
   * @type {import('../ble-host.interface.js').GattClientCharacteristic | undefined}
   */
  #batteryLevelCharacteristic
  /**
   * @type {number | undefined}
   */
  #batteryLevel

  /**
   * @param {import('../ble-host.interface.js').BleManager} manager
   */
  constructor (manager) {
    super()
    this.#manager = manager
  }

  async start () {
    this.#scanner = this.#manager.startScan({
      scanFilters: [new BleManager.ServiceUUIDScanFilter(heartRateServiceUUID)]
    })
    this.#connection = undefined
    this.#heartRateMeasurementCharacteristic?.removeAllListeners()
    this.#batteryLevelCharacteristic?.removeAllListeners()

    const device = await new Promise((resolve) => {
      /** @type {Scanner} */(this.#scanner).on('report', (eventData) => {
        if (eventData.connectable) {
          resolve(eventData)
        }
      })
    })

    log.info(`Found device (${device.parsedDataItems.localName || 'no name'})`)

    this.#scanner.removeAllListeners()
    this.#scanner.stopScan()

    this.#connection = await new Promise((/** @type {(value: Connection) => void} */resolve) => {
      this.#manager.connect(device.addressType, device.address, {}, (connection) => {
        resolve(connection)
      })
    })

    this.#connection.once('disconnect', () => {
      log.debug(`Disconnected from ${this.#connection?.peerAddress}, restart scanning`)

      this.start()
    })

    log.debug('Connected to ' + this.#connection.peerAddress)
    const primaryServices = await new Promise((/** @type {(value: Array<import('../ble-host.interface.js').GattClientService>) => void} */resolve, reject) => {
      if (this.#connection === undefined) {
        reject(new Error('Connection has been disposed'))

        return
      }

      this.#connection.gatt.discoverAllPrimaryServices((services) => {
        if (services.length === 0) {
          reject(new Error('No heart rate services was found'))
        }
        resolve(services)
      })
    })

    const heartRateService = primaryServices.find(service => service.uuid === heartRateServiceUUID)
    if (heartRateService === undefined) {
      log.error(`Heart rate service not found in ${device.localName}`)

      this.start()

      return
    }

    this.#heartRateMeasurementCharacteristic = await new Promise((resolve) => {
      heartRateService.discoverCharacteristics((characteristics) => {
        resolve(characteristics.find(characteristic => characteristic.uuid === heartRateMeasurementUUID))
      })
    })

    if (this.#heartRateMeasurementCharacteristic === undefined) {
      log.error(`Heart rate measurement characteristic not found in ${device.localName}`)

      this.start()

      return
    }

    this.#heartRateMeasurementCharacteristic.writeCCCD(/* enableNotifications */ true, /* enableIndications */ false)
    this.#heartRateMeasurementCharacteristic.on('change', (value) => {
      log.debug('New heart rate value:', value)
      this.#onHeartRateNotify(value)
    })

    const batteryService = primaryServices.find(service => service.uuid === batteryLevelServiceUUID)
    if (batteryService === undefined) {
      log.info(`Battery service not found in ${device.localName}`)

      return
    }

    this.#batteryLevelCharacteristic = await new Promise((resolve) => {
      batteryService.discoverCharacteristics((characteristics) => {
        resolve(characteristics.find(characteristic => characteristic.uuid === batteryLevelMeasurementUUID))
      })
    })

    if (this.#batteryLevelCharacteristic === undefined) {
      log.error(`Battery level characteristic not found in ${device.localName}`)

      return
    }

    this.#batteryLevel = await new Promise((resolve) => {
      if (this.#batteryLevelCharacteristic === undefined) {
        resolve(0)

        return
      }

      this.#batteryLevelCharacteristic.read((_errorCode, data) => resolve(data.readUInt8(0)))
    })
    this.#batteryLevelCharacteristic.writeCCCD(/* enableNotifications */ true, /* enableIndications */ false)
    this.#batteryLevelCharacteristic.on('change', (level) => {
      log.debug('New battery level value:', level)
      this.#onBatteryNotify(level)
    })
  }

  stop () {
    this.#batteryLevelCharacteristic?.removeAllListeners()
    this.#heartRateMeasurementCharacteristic?.removeAllListeners()
    this.#scanner?.stopScan()
    return new Promise((/** @type {(value: void) => void} */resolve) => {
      log.debug('Shutting down HRM peripheral')
      if (this.#connection !== undefined) {
        log.debug('Terminating current HRM connection')
        this.#connection.removeAllListeners()
        this.#connection.once('disconnect', resolve)
        this.#connection.disconnect()

        return
      }
      resolve()
    })
  }

  /**
   * @param {Buffer} data
   */
  #onHeartRateNotify (data) {
    const flags = data.readUInt8(0)
    // bits of the feature flag:
    // 0: Heart Rate Value Format
    // 1 + 2: Sensor Contact Status
    // 3: Energy Expended Status
    // 4: RR-Interval
    const heartRateUint16LE = flags & 0b1

    // from the specs:
    // While most human applications require support for only 255 bpm or less, special
    // applications (e.g. animals) may require support for higher bpm values.
    // If the Heart Rate Measurement Value is less than or equal to 255 bpm a UINT8 format
    // should be used for power savings.
    // If the Heart Rate Measurement Value exceeds 255 bpm a UINT16 format shall be used.
    const heartrate = heartRateUint16LE ? data.readUInt16LE(1) : data.readUInt8(1)
    this.emit('heartRateMeasurement', { heartrate, batteryLevel: this.#batteryLevel })
  }

  /**
   * @param {Buffer} data
   */
  #onBatteryNotify (data) {
    this.#batteryLevel = data.readUInt8(0)
  }
}
