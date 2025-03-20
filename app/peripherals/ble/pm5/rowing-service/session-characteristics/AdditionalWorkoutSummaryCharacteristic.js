'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  todo: we could calculate all the missing stroke metrics in the RowerEngine
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { Concept2Date, toC2128BitUUID } from '../../Pm5Constants.js'

export class AdditionalWorkoutSummaryCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Workout Summary',
      uuid: toC2128BitUUID('003A'),
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
    // Data bytes packed as follows: (19bytes) example: 0x 0333 1212 02 C800 05 3B00 2500 550000 3C00 AA01

    // Log Entry Date Lo, (https://www.c2forum.com/viewtopic.php?t=200769)
    // Log Entry Date Hi,
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2DateInt())
    // Log Entry Time Lo, (https://www.c2forum.com/viewtopic.php?t=200769)
    // Log Entry Time Hi,
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2TimeInt())
    if (this.isSubscribed) {
    // Split/Interval Type12, - NOT IN MULTIPLEXED
      bufferBuilder.writeUInt8(0)
    }
    // Split/Interval Size Lo, (meters or seconds)
    // Split/Interval Size Hi,
    bufferBuilder.writeUInt16LE(data.totalCalories)
    // Split/Interval Count,
    bufferBuilder.writeUInt8(0)
    // Total Calories Lo,
    // Total Calories Hi,
    bufferBuilder.writeUInt16LE(data.totalCalories)
    // Watts Lo,
    // Watts Hi,
    bufferBuilder.writeUInt16LE(data.totalCalories)
    // Total Rest Distance Lo (1 m lsb),
    // Total Rest Distance Mid,
    // Total Rest Distance High
    bufferBuilder.writeUInt24LE(data.totalCalories)
    // Interval Rest Time Lo (seconds),
    // Interval Rest Time Hi,
    bufferBuilder.writeUInt16LE(data.totalCalories)
    // Avg Calories Lo, (cals/hr)
    // Avg Calories Hi,
    bufferBuilder.writeUInt16LE(data.totalCalories)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x3A, bufferBuilder.getBuffer())
  }
}
