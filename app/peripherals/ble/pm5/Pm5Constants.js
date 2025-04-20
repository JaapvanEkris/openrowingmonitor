'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Some PM5 specific constants
*/

import { PeripheralConstants } from '../../PeripheralConstants.js'

import { ErgModelType } from './csafe-service/CsafeCommandsMapping.js'

export const pm5Constants = {
  ...PeripheralConstants,
  // See https://www.concept2.com/service/monitors/pm5/firmware for available versions
  // please note: hardware versions exclude a software version, and thus might confuse the client
  // ergMachineType: 0 TYPE_STATIC_D
  ergMachineType: ErgModelType.ERGMODEL_TYPE_D
}

/**
 * PM5 uses 128bit UUIDs that are always prefixed and suffixed the same way
 * @param {string} uuid
 */
export function toC2128BitUUID (uuid) {
  return `CE06${uuid}-43E5-11E4-916C-0800200C9A66`
}

export class Concept2Date extends Date {
  /**
 * Converts a Date object to a Concept2 date binary format
 * @returns {number} The UTC date as a uint16 parsed as per the Concept2 specs
 */
  toC2DateInt () {
    const yearEpoch = 2000

    return (this.getMonth() + 1) | (this.getDate()) << 4 | (this.getFullYear() - yearEpoch) << 9
  }

  /**
 * Converts a Date object to a Concept2 time binary format
 * @returns {number} The UTC time as a uint16 parsed as per the Concept2 specs
 */
  toC2TimeInt () {
    return this.getMinutes() | this.getHours() << 8
  }
}
