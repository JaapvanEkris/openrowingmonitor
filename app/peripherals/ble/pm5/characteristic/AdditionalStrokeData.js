'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the AdditionalStrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import bleno from '@stoprocent/bleno'
import { getFullUUID } from '../Pm5Constants.js'
import log from 'loglevel'
import BufferBuilder from '../../BufferBuilder.js'

export default class AdditionalStrokeData extends bleno.Characteristic {
  constructor (multiplexedCharacteristic) {
    super({
      // id for AdditionalStrokeData as defined in the spec
      uuid: getFullUUID('0036'),
      value: null,
      properties: ['notify']
    })
    this._updateValueCallback = null
    this._multiplexedCharacteristic = multiplexedCharacteristic
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    log.debug(`AdditionalStrokeData - central subscribed with maxSize: ${maxValueSize}`)
    this._updateValueCallback = updateValueCallback
    return this.RESULT_SUCCESS
  }

  onUnsubscribe () {
    log.debug('AdditionalStrokeData - central unsubscribed')
    this._updateValueCallback = null
    return this.RESULT_UNLIKELY_ERROR
  }

  notify (data) {
    if (this._updateValueCallback || this._multiplexedCharacteristic.centralSubscribed()) {
      const bufferBuilder = new BufferBuilder()
      // elapsedTime: UInt24LE in 0.01 sec
      bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
      // strokePower: UInt16LE in watts
      bufferBuilder.writeUInt16LE(data.cyclePower > 0 ? Math.round(data.cyclePower) : 0)
      // strokeCalories: UInt16LE in cal
      bufferBuilder.writeUInt16LE(data.strokeCalories > 0 ? Math.round(data.strokeCalories * 1000) : 0)
      // strokeCount: UInt16LE
      bufferBuilder.writeUInt16LE(data.totalNumberOfStrokes > 0 ? Math.round(data.totalNumberOfStrokes) : 0)
      // projectedWorkTime: UInt24LE in 1 sec
      bufferBuilder.writeUInt24LE(data.cycleProjectedEndTime > 0 ? Math.round(data.cycleProjectedEndTime) : 0)
      // projectedWorkDistance: UInt24LE in 1 m
      bufferBuilder.writeUInt24LE(data.cycleProjectedEndLinearDistance > 0 ? Math.round(data.cycleProjectedEndLinearDistance) : 0)
      if (!this._updateValueCallback) {
        // the multiplexer uses a slightly different format for the AdditionalStrokeData
        // it adds workPerStroke at the end
        // workPerStroke: UInt16LE in 0.1 Joules
        bufferBuilder.writeUInt16LE(data.strokeWork > 0 ? Math.round(data.strokeWork * 10) : 0)
      }

      if (this._updateValueCallback) {
        this._updateValueCallback(bufferBuilder.getBuffer())
      } else {
        this._multiplexedCharacteristic.notify(0x36, bufferBuilder.getBuffer())
      }
      return this.RESULT_SUCCESS
    }
  }
}
