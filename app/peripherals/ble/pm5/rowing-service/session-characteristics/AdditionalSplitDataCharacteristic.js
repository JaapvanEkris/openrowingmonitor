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
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (19bytes) - Multiplex as per spec 18bytes, but actually the list show 19. need to verify from the PM5

    // Elapsed Time Lo (0.01 sec lsb),
    // Elapsed Time Mid,
    // Elapsed Time High,
    bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
    // Split/Interval Avg Stroke Rate,
    bufferBuilder.writeUInt8(0)
    // Split/Interval Work Heartrate,
    bufferBuilder.writeUInt8(0)
    // Split/Interval Rest Heartrate,
    bufferBuilder.writeUInt8(0)
    // Split/Interval Avg Pace Lo (0.1 sec lsb)
    // Split/Interval Avg Pace Hi,
    bufferBuilder.writeUInt16LE(0)
    // Split/Interval Total Calories Lo (Cals),
    // Split/Interval Total Calories Hi,
    bufferBuilder.writeUInt16LE(0)
    // Split/Interval Avg Calories Lo (Cals/Hr),
    // Split/Interval Avg Calories Hi,
    bufferBuilder.writeUInt16LE(0)
    // Split/Interval Speed Lo (0.001 m/s, max=65.534 m/s)
    // Split/Interval Speed Hi,
    bufferBuilder.writeUInt16LE(0)
    // Split/Interval Power Lo (Watts, max = 65.534 kW)
    // Split/Interval Power Hi
    bufferBuilder.writeUInt16LE(0)
    // Split Avg Drag Factor,
    bufferBuilder.writeUInt8(0)
    // Split/Interval Number,
    bufferBuilder.writeUInt8(data.splitNumber)
    // Erg Machine Type
    bufferBuilder.writeUInt8(pm5Constants.ergMachineType)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x38, bufferBuilder.getBuffer())
  }
}
