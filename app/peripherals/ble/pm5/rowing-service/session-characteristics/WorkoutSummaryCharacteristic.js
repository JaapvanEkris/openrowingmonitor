'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  todo: we could calculate all the missing stroke metrics in the RowerEngine
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { Concept2Date, SessionTypes, toC2128BitUUID } from '../../Pm5Constants.js'

export class WorkoutSummaryCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('../other-characteristics/MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Workout Summary',
      uuid: toC2128BitUUID('0039'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   * @param {SegmentMetrics} workoutData
   */
  // @ts-ignore: Type is not assignable to type
  notify (data, workoutData) {
    const bufferBuilder = new BufferBuilder()
    // Data bytes packed as follows: (20bytes) example: 0333 1212 A0A500 102700 0C 00 00 00 00 8D 00 07 4808

    // Log Entry Date (see https://www.c2forum.com/viewtopic.php?t=200769)
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2DateInt())
    // Log Entry Time (see https://www.c2forum.com/viewtopic.php?t=200769)
    bufferBuilder.writeUInt16LE(new Concept2Date().toC2TimeInt())
    // Elapsed Time Lo (0.01 sec lsb),
    bufferBuilder.writeUInt24LE(Math.round(workoutData.totalTime() * 100))
    // Distance Lo (0.1 m)
    bufferBuilder.writeUInt24LE(workoutData.traveledLinearDistance() > 0 ? Math.round(workoutData.traveledLinearDistance() * 10) : 0)
    // Average Stroke Rate,
    bufferBuilder.writeUInt8(workoutData.strokerate.average() > 0 && workoutData.strokerate.average() < 255 ? Math.round(workoutData.strokerate.average()) : 0)
    // Ending Heartrate,
    bufferBuilder.writeUInt8(workoutData.heartrate.atSeriesEnd() > 0 ? Math.round(workoutData.heartrate.atSeriesEnd()) : 0)
    // Average Heartrate,
    bufferBuilder.writeUInt8(workoutData.heartrate.average() > 0 ? Math.round(workoutData.heartrate.average()) : 0)
    // Min Heartrate,
    bufferBuilder.writeUInt8(workoutData.heartrate.minimum() > 0 ? Math.round(workoutData.heartrate.minimum()) : 0)
    // Max Heartrate,
    bufferBuilder.writeUInt8(workoutData.heartrate.maximum() > 0 ? Math.round(workoutData.heartrate.maximum()) : 0)
    // Drag Factor Average,
    bufferBuilder.writeUInt8(workoutData.dragFactor.average() > 0 && workoutData.dragFactor.average() < 255 ? Math.round(workoutData.dragFactor.average()) : 255)
    // Recovery Heart Rate, (zero = not valid data. After 1 minute of rest/recovery, PM5 sends this data as a revised End Of Workout summary data characteristic unless the monitor has been turned off or a new workout started)
    bufferBuilder.writeUInt8(0)
    // Workout Type,
    bufferBuilder.writeUInt8(SessionTypes[data.sessiontype] ?? SessionTypes.justrow)
    if (this.isSubscribed) {
    // Avg Pace Lo (0.1 sec lsb) - NOT IN MULTIPLEXED
    // Avg Pace Hi - NOT IN MULTIPLEXED
      bufferBuilder.writeUInt16LE(Math.round(workoutData.pace.average()))
    }

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x39, bufferBuilder.getBuffer())
  }
}
