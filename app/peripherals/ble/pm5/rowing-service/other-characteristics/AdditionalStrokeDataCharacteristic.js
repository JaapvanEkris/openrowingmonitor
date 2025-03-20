'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the AdditionalStrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { toC2128BitUUID } from '../../Pm5Constants.js'

export class AdditionalStrokeDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('./MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Stroke Data',
      uuid: toC2128BitUUID('0036'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
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
    if (!this.isSubscribed) {
      // the multiplexer uses a slightly different format for the AdditionalStrokeData
      // it adds workPerStroke at the end
      // workPerStroke: UInt16LE in 0.1 Joules
      bufferBuilder.writeUInt16LE(data.strokeWork > 0 ? Math.round(data.strokeWork * 10) : 0)
    }

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x36, bufferBuilder.getBuffer())
  }
}
