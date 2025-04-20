'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the AdditionalStatus2 as defined in:
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
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
   * @param {SplitTimeDistanceData} previousSplitData
   * @param {SegmentMetrics} splitData
   */
  // @ts-ignore: Type is not assignable to type
  notify (data, previousSplitData) {
    const bufferBuilder = new BufferBuilder()
    // elapsedTime: UInt24LE in 0.01 sec
    bufferBuilder.writeUInt24LE(data.workout.timeSpent.total > 0 ? Math.round(data.workout.timeSpent.total * 100) : 0)
    // intervalCount: UInt8
    bufferBuilder.writeUInt8(data.split.number > 0 ? data.split.number : 0)
    if (this.isSubscribed) {
      // the multiplexer uses a slightly different format for the AdditionalStatus2
      // it skips averagePower before totalCalories
      // averagePower: UInt16LE in watts
      bufferBuilder.writeUInt16LE(data.cyclePower > 0 ? Math.round(data.cyclePower) : 0)
    }
    // totalCalories: UInt16LE in kCal
    bufferBuilder.writeUInt16LE(data.workout.calories.totalSpent > 0 ? Math.round(data.workout.calories.totalSpent) : 0)
    // splitAveragePace: UInt16LE in 0.01 sec/500m
    bufferBuilder.writeUInt16LE(data.split.pace.average && data.split.pace.average > 0 && data.split.pace.average < 655.34 ? Math.round(data.split.pace.average * 100) : 0)
    // splitAveragePower UInt16LE in watts
    bufferBuilder.writeUInt16LE(data.split.power.average > 0 && data.split.power.average < 65534 ? Math.round(data.split.power.average) : 0)
    // splitAverageCalories
    bufferBuilder.writeUInt16LE(data.split.calories.averagePerHour > 0 && data.split.calories.averagePerHour < 65534 ? Math.round(data.split.calories.averagePerHour) : 0)
    // lastSplitTime in 0.1 sec
    bufferBuilder.writeUInt24LE(previousSplitData.totalMovingTime > 0 ? Math.round(previousSplitData.totalMovingTime * 10) : 0)
    // lastSplitDistance in 1 m
    bufferBuilder.writeUInt24LE(previousSplitData.totalLinearDistance > 0 ? Math.round(previousSplitData.totalLinearDistance) : 0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x33, bufferBuilder.getBuffer())
  }
}
