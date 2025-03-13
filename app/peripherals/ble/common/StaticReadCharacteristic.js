'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/

export default function createStaticReadCharacteristic (uuid, value, description, addNotify = false) {
  const descriptors = description !== undefined
    ? [
        {
          uuid: 0x2901,
          value: description
        }]
    : undefined

  return {
    uuid,
    properties: addNotify ? ['read', 'notify'] : ['read'],
    value: Buffer.isBuffer(value) ? value : Buffer.from(value),
    descriptors
  }
}
