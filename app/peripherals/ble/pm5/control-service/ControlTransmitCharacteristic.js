'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implementation of the ControlTransmit Characteristic as defined in:
  https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
  Used to transmit controls to the central
*/
import { GattNotifyCharacteristic } from '../../BleManager.js'

import { toC2128BitUUID } from '../Pm5Constants.js'

export class ControlTransmitCharacteristic extends GattNotifyCharacteristic {
  constructor () {
    super({
      name: 'Control Transmit',
      uuid: toC2128BitUUID('0022'),
      properties: ['notify']
    })
  }

  notify (buffer) {
    super.notify(buffer)
  }
}
