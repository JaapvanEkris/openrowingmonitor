'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This manager creates a Bluetooth Low Energy (BLE) Central that listens
  and subscribes to heart rate services
*/
import log from 'loglevel'
import EventEmitter from 'node:events'
import noble from '@stoprocent/noble'

const heartRateServiceUUID = '180d'
const heartRateMeasurementUUID = '2a37'

const batteryLevelUUID = '2a19'

function createHeartRateManager () {
  const emitter = new EventEmitter()
  let _batteryLevelCharacteristic
  let _heartRateMeasurementCharacteristic
  let _batteryLevel

  noble.on('stateChange', async (state) => {
    log.debug(`BLE HRM stateChange: ${state}`)
    if (state === 'poweredOn') {
      // search for heart rate service
      await noble.startScanningAsync([heartRateServiceUUID], false)
      return
    }

    await noble.stopScanningAsync()
  })

  noble.on('discover', async (peripheral) => {
    try {
      await noble.stopScanningAsync()
      log.debug('Connecting to peripheral')
      await peripheral.connectAsync()

      peripheral.once('disconnect', async () => {
        log.info('heart rate peripheral disconnected, searching new one')
        _batteryLevelCharacteristic?.removeAllListeners()
        _heartRateMeasurementCharacteristic?.removeAllListeners()
        _batteryLevel = undefined
        await noble.startScanningAsync([heartRateServiceUUID], false)
      })
    } catch (error) {
      log.error(`Error while connecting: ${error}`)
      await noble.startScanningAsync([heartRateServiceUUID], false)
      return
    }

    log.info(`heart rate peripheral connected, name: '${peripheral.advertisement?.localName}', id: ${peripheral.id}`)

    try {
      const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], [heartRateMeasurementUUID, batteryLevelUUID])
      log.debug('Discovered characteristics')

      _heartRateMeasurementCharacteristic = characteristics.find(
        characteristic => characteristic.uuid === heartRateMeasurementUUID
      )
      if (_heartRateMeasurementCharacteristic !== undefined) {
        _heartRateMeasurementCharacteristic.on('data', onHeartRateNotify)
        await _heartRateMeasurementCharacteristic.subscribeAsync()
      }

      _batteryLevelCharacteristic = characteristics.find(
        characteristic => characteristic.uuid === batteryLevelUUID
      )
      if (_batteryLevelCharacteristic !== undefined) {
        _batteryLevel = (await _batteryLevelCharacteristic.readAsync()).readUint8(0)
        _batteryLevelCharacteristic.on('data', onBatteryNotify)

        await _batteryLevelCharacteristic.subscribeAsync()
      }
    } catch (error) {
      log.error(`BLE HRM subscription error: ${error}`)
    }
  })

  function onHeartRateNotify (data) {
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
    emitter.emit('heartRateMeasurement', { heartrate, batteryLevel: _batteryLevel })
  }

  function onBatteryNotify (data) {
    _batteryLevel = data.readUInt8(0)
  }

  return Object.assign(emitter, {
  })
}

export { createHeartRateManager }
