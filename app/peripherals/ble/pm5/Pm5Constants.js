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
  // ergMachineType: 0 TYPE_STATIC_D
  ergMachineType: 0
}

// PM5 uses 128bit UUIDs that are always prefixed and suffixed the same way
export function toC2128BitUUID (uuid) {
  return `CE06${uuid}-43E5-11E4-916C-0800200C9A66`
}

export const SessionTypes = {
  justrow: 0,
  time: 6,
  distance: 7,
  calories: 12
}

export class Concept2Date extends Date {
  toC2DateInt () {
    const yearEpoch = 2000

    return (this.getMonth() + 1) | (this.getDate()) << 4 | (this.getFullYear() - yearEpoch) << 9
  }

  toC2TimeInt () {
    return this.getMinutes() | this.getHours() << 8
  }
}
