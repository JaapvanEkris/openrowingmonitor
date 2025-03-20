'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the ControlReceive Characteristic as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  Used to receive controls from the central
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

import { toC2128BitUUID } from '../Pm5Constants.js'

const log = loglevel.getLogger('Peripherals')

export class ControlReceiveCharacteristic {
  get characteristic () {
    return this.#characteristic
  }

  /**
   * @type {GattServerCharacteristicFactory}
   */
  #characteristic

  constructor () {
    this.#characteristic = {
      name: 'Control Receive',
      uuid: toC2128BitUUID('0021'),
      properties: ['write', 'write-without-response'],
      onWrite: (_connection, needsResponse, opCode, callback) => {
        log.debug('PM5 Control is called:', opCode)
        if (needsResponse) {
          callback(NodeBleHost.AttErrors.SUCCESS) // actually only needs to be called when needsResponse is true
        }
      }
    }
  }
}
