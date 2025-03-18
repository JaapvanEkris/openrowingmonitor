'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  The connected Central can remotely control some parameters or our rowing monitor via this Control Point

  But for our use case proper implementation is not necessary (its mere existence with an empty handler suffice)
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

const log = loglevel.getLogger('Peripherals')

export class CyclingPowerControlPointCharacteristic {
  get characteristic () {
    return this.#characteristic
  }

  #characteristic
  constructor (controlPointCallback) {
    this.#characteristic = {
      name: 'Cycling Power Meter Control Point',
      uuid: 0x2A55,
      properties: ['write', 'indicate'],
      onWrite: (connection, _needsResponse, opCode, callback) => {
        log.debug(`CPS control is called: ${opCode}`)
        const response = this.#onWriteRequest(opCode)

        if (this.#characteristic.indicate === undefined) {
          throw new Error(`Characteristics ${this.#characteristic.name} has not been initialized`)
        }

        this.#characteristic.indicate(connection, response)
        callback(NodeBleHost.AttErrors.SUCCESS) // actually only needs to be called when needsResponse is true
      }
    }
  }

  // Central sends a command to the Control Point
  // No need to handle any request to have this working
  #onWriteRequest (data, offset, withoutResponse, callback) {
    return Buffer.from([0])
  }
}
