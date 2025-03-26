'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  todo: we could calculate all the missing stroke metrics in the RowerEngine
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { SessionTypes, toC2128BitUUID } from '../../Pm5Constants.js'

export class SplitDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Split Data',
      uuid: toC2128BitUUID('0037'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data, splitData) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (18bytes)

    // Elapsed Time (0.01 sec),
    bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
    // Distance (0.1 m)
    bufferBuilder.writeUInt24LE(data.totalLinearDistance > 0 ? Math.round(data.totalLinearDistance * 10) : 0)
    // Split/Interval Time (0.1 sec)
    bufferBuilder.writeUInt24LE(splitData.totalTime() > 0 ? Math.round(splitData.totalTime() * 10) : 0)
    // Split/Interval Distance ( 1m lsb)
    bufferBuilder.writeUInt24LE(splitData.travelledLinearDistance() > 0 ? Math.round(splitData.travelledLinearDistance()) : 0)
    // Interval Rest Time (1 sec lsb)
    bufferBuilder.writeUInt16LE(splitData.restTime() > 0 ? Math.round(splitData.restTime()) : 0)
    // Interval Rest Distance Lo (1m lsb)
    bufferBuilder.writeUInt16LE(Math.round(0))
    // Split/Interval Type (This value will change depending on where you are in the interval (work, rest, etc). Use workout type to determine whether the intervals are time or distance intervals),
    bufferBuilder.writeUInt8(SessionTypes[data.sessiontype] ?? SessionTypes.justrow)
    // Split/Interval Number,
    bufferBuilder.writeUInt8(data.splitNumber > 0 ? data.splitNumber : 0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x37, bufferBuilder.getBuffer())
  }
}
