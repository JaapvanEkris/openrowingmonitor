'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  The Control service can be used to send control commands to the PM5 device
  todo: not yet wired
*/
import { GattService } from '../../BleManager.js'

import { toC2128BitUUID } from '../Pm5Constants.js'

import { ControlReceiveCharacteristic } from './ControlReceiveCharacteristic.js'
import { ControlTransmitCharacteristic } from './ControlTransmitCharacteristic.js'

export class Pm5ControlService extends GattService {
  constructor () {
    super({
      name: 'Control Service',
      uuid: toC2128BitUUID('0020'),
      characteristics: [
        new ControlReceiveCharacteristic().characteristic,
        new ControlTransmitCharacteristic().characteristic
      ]
    })
  }
}
