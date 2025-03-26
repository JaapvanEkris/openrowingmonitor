'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the AdditionalStatus2 as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { toC2128BitUUID } from '../../Pm5Constants.js'

export class AdditionalStatus2Characteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Status 2',
      uuid: toC2128BitUUID('0033'),
      properties: ['notify']
    })

    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data, previousSplitData, splitData) {
    const bufferBuilder = new BufferBuilder()
    // elapsedTime: UInt24LE in 0.01 sec
    bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
    // intervalCount: UInt8
    bufferBuilder.writeUInt8(data.splitNumber)
    if (this.isSubscribed) {
      // the multiplexer uses a slightly different format for the AdditionalStatus2
      // it skips averagePower before totalCalories
      // averagePower: UInt16LE in watts
      bufferBuilder.writeUInt16LE(data.cyclePower > 0 ? Math.round(data.cyclePower) : 0)
    }
    // totalCalories: UInt16LE in kCal
    bufferBuilder.writeUInt16LE(data.totalCalories > 0 ? Math.round(data.totalCalories) : 0)
    // splitAveragePace: UInt16LE in 0.01 sec/500m
    bufferBuilder.writeUInt16LE(splitData.pace.average() && splitData.pace.average() > 0 && splitData.pace.average() < 655.34 ? Math.round(splitData.pace.average() * 100) : 0xFFFF)
    // splitAveragePower UInt16LE in watts
    bufferBuilder.writeUInt16LE(splitData.power.average() > 0 && splitData.power.average() < 65534 ? Math.round(splitData.power.average()) : 0)
    // splitAverageCalories
    bufferBuilder.writeUInt16LE(splitData.caloriesPerHour.average() > 0 && splitData.caloriesPerHour.average() < 65534 ? Math.round(splitData.caloriesPerHour.average()) : 0)
    // lastSplitTime
    bufferBuilder.writeUInt24LE(previousSplitData.totalMovingTime > 0 ? Math.round(previousSplitData.totalMovingTime * 100) : 0)
    // lastSplitDistance in 1 m
    bufferBuilder.writeUInt24LE(previousSplitData.totalLinearDistance > 0 ? Math.round(previousSplitData.totalLinearDistance) : 0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x33, bufferBuilder.getBuffer())
  }
}
