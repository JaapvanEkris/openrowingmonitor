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

export class LoggedWorkoutCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Additional Workout Summary',
      uuid: toC2128BitUUID('003F'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   * @param {SegmentMetrics} workoutData
   */
  /* eslint-disable-next-line no-unused-vars -- standardized characteristic interface where the parameters aren't relevant
  // @ts-ignore: Type is not assignable to type */
  notify (data, workoutData) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (15bytes) example: 0x 41A09A0C97A37088 CAE10801 D400 00 (00000000)

    // Logged Workout Hash (Lo), CSAFE_GET_CURRENT_WORKOUT_HASH
    // Logged Workout Hash,
    // Logged Workout Hash,
    // Logged Workout Hash,
    // Logged Workout Hash,
    // Logged Workout Hash,
    // Logged Workout Hash,
    // Logged Workout Hash (Hi),
    bufferBuilder.writeUInt32LE(0)
    bufferBuilder.writeUInt32LE(0)
    // Logged Workout Internal Log Address (Lo), // CSAFE_GET_INTERNALLOGPARAMS
    // Logged Workout Internal Log Address (Mid Lo),
    // Logged Workout Internal Log Address (Mid Hi),
    // Logged Workout Internal Log Address (Hi),
    bufferBuilder.writeUInt32LE(0)
    // Logged Workout Size (meters or seconds)
    if (data.sessiontype === 'distance') {
      bufferBuilder.writeUInt16LE(Math.round(workoutData.traveledLinearDistance()))
    } else {
      bufferBuilder.writeUInt16LE(Math.round(workoutData.movingTime()))
    }
    // Erg Model Type
    bufferBuilder.writeUInt8(pm5Constants.ergMachineType)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x3F, bufferBuilder.getBuffer())
  }
}
