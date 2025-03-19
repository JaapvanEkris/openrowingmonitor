'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  todo: we could calculate all the missing stroke metrics in the RowerEngine
*/
import { BufferBuilder } from '../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../BleManager.js'

import { SessionTypes, toC2128BitUUID } from '../Pm5Constants.js'

export class SplitDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  constructor (multiplexedCharacteristic) {
    super({
      name: 'Split Data',
      uuid: toC2128BitUUID('0037'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (18bytes)

    // Elapsed Time Lo (0.01 sec lsb),
    // Elapsed Time Mid,
    // Elapsed Time High,
    bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
    // Distance Lo (0.1 m lsb),
    // Distance Mid,
    // Distance High,
    bufferBuilder.writeUInt24LE(data.totalLinearDistance > 0 ? Math.round(data.totalLinearDistance * 10) : 0)
    // Split/Interval Time Lo (0.1 sec lsb),
    // Split/Interval Time Mid,
    // Split/Interval Time High,
    bufferBuilder.writeUInt24LE(0)
    // Split/Interval Distance Lo ( 1m lsb),
    // Split/Interval Distance Mid,
    // Split/Interval Distance High,
    bufferBuilder.writeUInt24LE(0)
    // Interval Rest Time Lo (1 sec lsb),
    // Interval Rest Time Hi,
    bufferBuilder.writeUInt16LE(0)
    // Interval Rest Distance Lo (1m lsb),
    // Interval Rest Distance Hi
    bufferBuilder.writeUInt16LE(0)
    // Split/Interval Type (This value will change depending on where you are in the interval (work, rest, etc). Use workout type to determine whether the intervals are time or distance intervals),
    bufferBuilder.writeUInt8(SessionTypes[data.sessiontype] ?? SessionTypes.justrow)
    // Split/Interval Number,
    bufferBuilder.writeUInt8(0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x37, bufferBuilder.getBuffer())
  }
}
