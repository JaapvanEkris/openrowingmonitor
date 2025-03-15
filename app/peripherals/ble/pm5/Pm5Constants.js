'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Some PM5 specific constants
*/

import { PeripheralConstants } from '../../PeripheralConstants.js'

export const pm5Constants = {
  ...PeripheralConstants,
  // See https://www.concept2.com/service/monitors/pm5/firmware for available versions
  // please note: hardware versions exclude a software version, and thus might confuse the client
  ergMachineType: [0x05]
}

// PM5 uses 128bit UUIDs that are always prefixed and suffixed the same way
export function toC2128BitUUID (uuid) {
  return `CE06${uuid}-43E5-11E4-916C-0800200C9A66`
}
