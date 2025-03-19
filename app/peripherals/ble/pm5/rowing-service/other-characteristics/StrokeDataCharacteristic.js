'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  todo: we could calculate all the missing stroke metrics in the RowerEngine
*/
import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { toC2128BitUUID } from '../../Pm5Constants.js'

export class StrokeDataCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  constructor (multiplexedCharacteristic) {
    super({
      name: 'Stroke Data',
      uuid: toC2128BitUUID('0035'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  notify (data) {
    const bufferBuilder = new BufferBuilder()
    // elapsedTime: UInt24LE in 0.01 sec
    bufferBuilder.writeUInt24LE(Math.round(data.totalMovingTime * 100))
    // distance: UInt24LE in 0.1 m
    bufferBuilder.writeUInt24LE(data.totalLinearDistance > 0 ? Math.round(data.totalLinearDistance * 10) : 0)
    // driveLength: UInt8 in 0.01 m
    bufferBuilder.writeUInt8(data.driveLength > 0 ? Math.round(data.driveLength * 100) : 0)
    // driveTime: UInt8 in 0.01 s
    bufferBuilder.writeUInt8(data.driveDuration > 0 ? Math.round(data.driveDuration * 100) : 0)
    // strokeRecoveryTime: UInt16LE in 0.01 s
    bufferBuilder.writeUInt16LE(data.recoveryDuration > 0 ? Math.round(data.recoveryDuration * 100) : 0)
    // strokeDistance: UInt16LE in 0.01 s
    bufferBuilder.writeUInt16LE(data.cycleDistance > 0 ? Math.round(data.cycleDistance * 100) : 0)
    // peakDriveForce: UInt16LE in 0.1 lbs
    bufferBuilder.writeUInt16LE(data.drivePeakHandleForce > 0 ? Math.round(data.drivePeakHandleForce * 0.224809 * 10) : 0)
    // averageDriveForce: UInt16LE in 0.1 lbs
    bufferBuilder.writeUInt16LE(data.driveAverageHandleForce > 0 ? Math.round(data.driveAverageHandleForce * 0.224809 * 10) : 0)
    if (this.isSubscribed) {
      // workPerStroke is only added if data is not send via multiplexer
      // workPerStroke: UInt16LE in 0.1 Joules
      bufferBuilder.writeUInt16LE(Math.round(data.strokeWork * 10))
    }
    // strokeCount: UInt16LE
    bufferBuilder.writeUInt16LE(data.totalNumberOfStrokes > 0 ? Math.round(data.totalNumberOfStrokes) : 0)

    if (this.isSubscribed) {
      super.notify(bufferBuilder.getBuffer())

      return
    }

    this.#multiplexedCharacteristic.notify(0x35, bufferBuilder.getBuffer())
  }
}
