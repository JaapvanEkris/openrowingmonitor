'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  todo: we could calculate all the missing stroke metrics in the RowerEngine
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { pm5Constants, toC2128BitUUID } from '../../Pm5Constants.js'

export class AdditionalSplitDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Split Data',
      uuid: toC2128BitUUID('0038'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   * @param {SegmentMetrics} splitData
   */
  // @ts-ignore: Type is not assignable to type
  notify (data, splitData) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (19bytes) - Multiplex as per spec 18bytes, but actually the list show 19. need to verify from the PM5

    // Elapsed Time
    bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
    // Split/Interval Avg Stroke Rate
    bufferBuilder.writeUInt8(splitData.strokerate.average() > 0 ? Math.round(splitData.strokerate.average()) : 0)
    // Split/Interval Work Heartrate,
    bufferBuilder.writeUInt8(splitData.heartrate.average() > 0 ? Math.round(splitData.heartrate.average()) : 0)
    // Split/Interval Rest Heartrate,
    bufferBuilder.writeUInt8(0)
    // Split/Interval Average Pace (0.1 sec)
    bufferBuilder.writeUInt16LE(splitData.pace.average() !== Infinity && splitData.pace.average() > 0 && splitData.pace.average() < 655.34 ? Math.round(splitData.pace.average() * 10) : 0xFFFF)
    // Split/Interval Total Calories (Cals),
    bufferBuilder.writeUInt16LE(splitData.spentCalories() > 0 && splitData.spentCalories() < 65534 ? Math.round(splitData.spentCalories()) : 0)
    // Split/Interval Average Calories (Cals/Hr),
    bufferBuilder.writeUInt16LE(splitData.caloriesPerHour.average() > 0 && splitData.caloriesPerHour.average() < 65534 ? Math.round(splitData.caloriesPerHour.average()) : 0)
    // Split/Interval Speed (0.001 m/s, max=65.534 m/s)
    bufferBuilder.writeUInt16LE(splitData.linearVelocity.average() !== Infinity && splitData.linearVelocity.average() > 0 && splitData.linearVelocity.average() < 655.34 ? Math.round(splitData.linearVelocity.average() * 1000) : 0)
    // Split/Interval Power (Watts, max = 65.534 kW)
    bufferBuilder.writeUInt16LE(splitData.power.average() > 0 && splitData.power.average() < 65534 ? Math.round(splitData.power.average()) : 0)
    // Split Avg Drag Factor,
    bufferBuilder.writeUInt8(splitData.dragFactor.average() > 0 && splitData.dragFactor.average() < 255 ? Math.round(splitData.dragFactor.average()) : 255)
    // Split/Interval Number,
    bufferBuilder.writeUInt8(data.splitNumber > 0 ? data.splitNumber : 0)
    // Erg Machine Type
    bufferBuilder.writeUInt8(pm5Constants.ergMachineType)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x38, bufferBuilder.getBuffer())
  }
}
