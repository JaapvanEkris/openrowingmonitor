import loglevel from 'loglevel'

import HciSocket from 'hci-socket'
import NodeBleHost from 'ble-host'

const log = loglevel.getLogger('Peripherals')

export class BleManager {
  #transport
  #manager
  #managerOpeningTask

  open () {
    if (this.#manager !== undefined) {
      return Promise.resolve(this.#manager)
    }

    if (this.#managerOpeningTask === undefined) {
      this.#managerOpeningTask = new Promise((resolve, reject) => {
        if (this.#manager) {
          resolve(this.#manager)
        }
        log.debug('Opening BLE manager')

        if (this.#transport === undefined) {
          this.#transport = new HciSocket()
        }

        NodeBleHost.BleManager.create(this.#transport, {}, (err, manager) => {
          if (err) { reject(err) }
          this.#manager = manager
          this.#managerOpeningTask = undefined
          resolve(manager)
        })
      })
    }

    return this.#managerOpeningTask
  }

  close () {
    try {
      this.#transport?.close()
    } catch (e) {
      if (e.message !== 'Transport closed') {
        log.error('Error while closing Ble socket')

        throw e
      }

      log.debug('Ble socket is closed')
      this.#transport = undefined
      this.#manager = undefined
    }
  }

  isOpen () {
    return this.#manager !== undefined
  }

  getManager () {
    return this.open()
  }
}

export const toBLEStandard128BitUUID = (uuid) => {
  return `0000${uuid}-0000-1000-8000-00805F9B34FB`
}

export class GattNotifyCharacteristic {
  get characteristic () {
    return this.#characteristic
  }

  get isSubscribed () {
    return this.#isSubscribed
  }

  #characteristic
  #isSubscribed = false
  #connection

  constructor (characteristic) {
    this.#characteristic = {
      ...characteristic,
      onSubscriptionChange: (connection, notification) => {
        log.debug(`${this.#characteristic.name} subscription change: ${connection.peerAddress}, notification: ${notification}`)
        this.#isSubscribed = notification
        this.#connection = notification ? connection : undefined
      }
    }
  }

  notify (buffer) {
    if (this.#characteristic.notify === undefined) {
      throw new Error(`Characteristics ${this.#characteristic.name} has not been initialized`)
    }

    if (!this.#isSubscribed || this.#connection === undefined) {
      return
    }

    this.#characteristic.notify(this.#connection, buffer)
  }
}

export class GattService {
  get gattService () {
    return this.#gattService
  }

  #gattService

  constructor (gattService) {
    this.#gattService = gattService
  }
}
