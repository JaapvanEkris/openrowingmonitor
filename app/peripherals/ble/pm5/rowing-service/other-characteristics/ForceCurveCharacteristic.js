'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the StrokeData as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  todo: we could calculate all the missing stroke metrics in the RowerEngine
*/
import loglevel from 'loglevel'

import { BufferBuilder } from '../../../BufferBuilder.js'
import { GattNotifyCharacteristic } from '../../../BleManager.js'

import { toC2128BitUUID } from '../../Pm5Constants.js'

const log = loglevel.getLogger('Peripherals')

export class ForceCurveCharacteristic extends GattNotifyCharacteristic {
  #multiplexedCharacteristic

  /**
   * @param {import('./MultiplexedCharacteristic.js').MultiplexedCharacteristic} multiplexedCharacteristic
   */
  constructor (multiplexedCharacteristic) {
    super({
      name: 'Force Curve',
      uuid: toC2128BitUUID('003D'),
      properties: ['notify']
    })
    this.#multiplexedCharacteristic = multiplexedCharacteristic
  }

  /**
   * @param {Metrics} data
   */
  // @ts-ignore: Type is not assignable to type
  notify (data) {
    // PM5 broadcasts this in 20bytes batches (seemingly regardless of the MTU size)
    // Similar concept as ESP Rowing Monitor force curve (first two bytes: 1. 2x4bit value where first is total number of notifications - 'characteristics' in the Specs term - second the number of values in the current notification 2. current notification number - e.g. [0x29 /*i.e. 41 */, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0] total of 2 consecutive notification will be emitted, current is the 1 and it has 9 data points, all zeros), variable size based on negotiated MTU, only C2 uses 16bits values) - https://github.com/ergarcade/pm5-base/blob/3d16d5d4840af14104fca928acdd3af2ec19cb29/js/pm5.js#L449
    if (data.driveHandleForceCurve.length === 0) {
      return
    }

    // Data bytes packed as follows: (2 - 288 bytes) example: 0x79001800290029003B003B004000450045005300
    // separated into multiple successive notifications)

    const dataByteSize = 2
    const maxMessageDataSize = 20
    const chunkSize = Math.floor((maxMessageDataSize - 2) / dataByteSize)
    const split = Math.floor(data.driveHandleForceCurve.length / chunkSize + (data.driveHandleForceCurve.length % chunkSize === 0 ? 0 : 1))

    let i = 0
    log.debug(`Force curve data count: ${data.driveHandleForceCurve.length} chunk size(number of values): ${chunkSize}, number of chunks: ${split}`)

    while (i < split) {
      const end = (i + 1) * chunkSize < data.driveHandleForceCurve.length ? chunkSize * (i + 1) : data.driveHandleForceCurve.length

      const bufferBuilder = new BufferBuilder()
      const currentChunkedData = data.driveHandleForceCurve.slice(i * chunkSize, end)

      // MS Nib = # characteristics, LS Nib = # words,
      bufferBuilder.writeUInt8((split << 4) | (currentChunkedData.length & 0x0F))
      // Sequence number (current notification count)
      bufferBuilder.writeUInt8(i)

      currentChunkedData.forEach((data) => {
        // Data
        bufferBuilder.writeUInt16LE(Math.round(data * 0.224809))
      })

      i++

      if (this.isSubscribed) {
        super.notify(bufferBuilder.getBuffer())

        continue
      }

      this.#multiplexedCharacteristic.notify(0x3D, bufferBuilder.getBuffer())
    }
  }
}
