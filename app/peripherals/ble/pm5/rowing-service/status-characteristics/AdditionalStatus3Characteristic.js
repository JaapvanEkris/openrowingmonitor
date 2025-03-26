'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the AdditionalStatus2 as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { toC2128BitUUID } from '../../Pm5Constants.js'

export class AdditionalStatus3Characteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Status 3',
      uuid: toC2128BitUUID('003E'),
      properties: ['notify']
    })

    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  //
  /* eslint-disable-next-line no-unused-vars -- standardized characteristic interface where the data parameter isn't relevant
  @ts-ignore: Type is not assignable to type */
  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // Operational State: 0 RESET, 1 READY, 2 WORKOUT, 3 WARMUP, 6 PAUSE, 10 IDLE, TODO: to be mapped to something ORM uses
    bufferBuilder.writeUInt8(1)
    // Workout Verification State: unknown, but based on real PM5 1 is acceptable
    bufferBuilder.writeUInt8(1)
    // Screen Number: UInt16
    bufferBuilder.writeUInt16LE(1)
    // Last Error: UInt16
    bufferBuilder.writeUInt16LE(0)
    // Calibration Mode, (BikeErg only; 0 otherwise)
    bufferBuilder.writeUInt8(0)
    // Calibration State, (BikeErg only; 0 otherwise)
    bufferBuilder.writeUInt8(0)
    // Calibration Status, (BikeErg only; 0 otherwise)
    bufferBuilder.writeUInt8(0)
    // Game ID: UInt8
    bufferBuilder.writeUInt8(0)
    // Game Score: UInt16LE
    bufferBuilder.writeUInt16LE(0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x3e, bufferBuilder.getBuffer())
  }
}
