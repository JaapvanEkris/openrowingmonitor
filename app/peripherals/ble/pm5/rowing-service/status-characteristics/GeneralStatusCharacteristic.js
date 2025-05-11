'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the GeneralStatus as defined in:
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  * https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'
import { toC2128BitUUID, toC2WorkoutType, toC2IntervalType, toC2WorkoutState, toC2RowingState, toC2StrokeState, toC2DurationType } from '../../utils/ORMtoC2Mapper.js'

export class GeneralStatusCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'General Status',
      uuid: toC2128BitUUID('0031'),
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
    bufferBuilder.writeUInt24LE(data.workout.timeSpent.total > 0 ? Math.round(data.workout.timeSpent.total * 100) : 0)
    // distance: UInt24LE in 0.1 m
    bufferBuilder.writeUInt24LE(data.workout.distance.fromStart > 0 ? Math.round(data.workout.distance.fromStart * 10) : 0)
    // workoutType: UInt8, see OBJ_WORKOUTTYPE_T enum
    bufferBuilder.writeUInt8(toC2WorkoutType(data))
    // intervalType: UInt8, see OBJ_INTERVALTYPE_T enum
    bufferBuilder.writeUInt8(toC2IntervalType(data))
    // workoutState: UInt8, see OBJ_WORKOUTSTATE_T enum
    bufferBuilder.writeUInt8(toC2WorkoutState(data))
    // rowingState: UInt8, see OBJ_ROWINGSTATE_T
    bufferBuilder.writeUInt8(toC2RowingState(data))
    // strokeState: UInt8, see OBJ_STROKESTATE_T
    bufferBuilder.writeUInt8(toC2StrokeState(data))
    // totalWorkDistance: UInt24LE in 1 m
    bufferBuilder.writeUInt24LE(data.interval.distance.fromStart > 0 ? Math.round(data.interval.distance.fromStart) : 0)
    // workoutDuration: UInt24LE in 0.01 sec (if type TIME)
    if (data.interval.type === 'distance') {
      bufferBuilder.writeUInt24LE(data.interval.distance.target > 0 ? Math.round(data.interval.distance.absoluteTarget) : 0)
    } else {
      bufferBuilder.writeUInt24LE(data.interval.movingTime.target > 0 ? Math.round(data.interval.movingTime.absoluteTarget * 100) : 0)
    }
    // workoutDurationType: UInt8, see DurationTypes enum
    bufferBuilder.writeUInt8(toC2DurationType(data))
    // dragFactor: UInt8
    bufferBuilder.writeUInt8(data.dragFactor > 0 ? Math.round(Math.min(data.dragFactor, 255)) : 0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x31, bufferBuilder.getBuffer())
  }
}
