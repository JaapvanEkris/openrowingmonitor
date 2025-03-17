'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import NodeBleHost from 'ble-host'
import loglevel from 'loglevel'

const log = loglevel.getLogger('Peripherals')
export function createStaticReadCharacteristic (uuid, value, description, addNotify = false) {
  const descriptors = description !== undefined
    ? [
        {
          uuid: 0x2901,
          value: description
        }]
    : undefined

  const onSubscriptionChange = addNotify
    ? (connection, notification) => {
        log.debug(`${description !== undefined ? description : uuid} subscription change: ${connection.peerAddress}, notification: ${notification}`)
      }
    : undefined

  return {
    uuid,
    properties: addNotify ? ['read', 'notify'] : ['read'],
    descriptors,
    onRead: (connection, callback) => {
      log.debug(`Static read characteristic has been called: ${description}`)
      callback(NodeBleHost.AttErrors.SUCCESS, Buffer.isBuffer(value) ? value : Buffer.from(value))
    },
    onSubscriptionChange
  }
}
