import EventEmitter from 'node:events'
import loglevel from 'loglevel'

import HciSocket from 'hci-socket'
import NodeBleHost from 'ble-host'

/**
 * @typedef {import('./ble-host.interface.js').BleManager} BleHostManager
 */

const log = loglevel.getLogger('Peripherals')

export class BleManager extends EventEmitter {
  /**
   * @type {HciSocket | undefined}
   */
  #transport
  /**
   * @type {BleHostManager | undefined}
   */
  #manager
  /**
   * @type {Promise<BleHostManager> | undefined}
   */
  #managerOpeningTask
  #isClosing = false

  constructor () {
    super()
  }

  /**
   * @param {Error} error
   */
  #handleManagerError (error) {
    if (this.#isClosing && error.message === 'Transport closed') {
      log.debug('BLE transport closed')

      return
    }

    log.error('BLE manager error, clearing cached state:', error.message)

    try {
      this.#transport?.close()
    } catch (e) {
      log.debug('BLE transport close during error recovery:', e.message)
    }

    this.#resetState()
    this.emit('hardwareError', error)
  }

  #resetState () {
    this.#transport = undefined
    this.#manager = undefined
    this.#managerOpeningTask = undefined
  }

  open () {
    if (this.#manager !== undefined) {
      return Promise.resolve(this.#manager)
    }

    if (this.#managerOpeningTask === undefined) {
      this.#managerOpeningTask = new Promise((resolve, reject) => {
        if (this.#manager) {
          resolve(this.#manager)

          return
        }

        log.debug('Opening BLE manager')

        if (this.#transport === undefined) {
          this.#transport = new HciSocket()
        }

        NodeBleHost.BleManager.create(
          this.#transport,
          {},
          (
            /** @type {Error | null} */ err,
            /** @type {BleHostManager} */ manager
          ) => {
            if (err) {
              this.#managerOpeningTask = undefined
              this.#transport = undefined
              reject(err)

              return
            }

            manager.on('error', (error) => {
              this.#handleManagerError(error)
            })

            this.#manager = manager
            this.#managerOpeningTask = undefined
            resolve(manager)
          }
        )
      })
    }

    return this.#managerOpeningTask
  }

  close () {
    this.#isClosing = true

    try {
      this.#transport?.close()
    } catch (e) {
      if (e.message !== 'Transport closed') {
        log.error('Error while closing Ble socket')

        throw e
      }

      log.debug('Ble socket is closed')
    } finally {
      this.#resetState()
      this.#isClosing = false
    }
  }

  isOpen () {
    return this.#manager !== undefined
  }

  getManager () {
    return this.open()
  }
}

/**
 * Convert a 16-bit C2 PM5 UUID to a BLE standard 128-bit UUID.
 * @param {string} uuid
 * @returns
 */
export const toBLEStandard128BitUUID = (uuid) =>
  `0000${uuid}-0000-1000-8000-00805F9B34FB`

export class GattNotifyCharacteristic {
  get characteristic () {
    return this.#characteristic
  }

  get isSubscribed () {
    return this.#isSubscribed
  }

  #characteristic
  #isSubscribed = false

  /**
   * @type {import('./ble-host.interface.js').Connection | undefined}
   */
  #connection

  /**
   * @param {GattServerCharacteristicFactory} characteristic
   */
  constructor (characteristic) {
    this.#characteristic = {
      ...characteristic,
      onSubscriptionChange: (
        /** @type {import('./ble-host.interface.js').Connection} */ connection,
        /** @type {boolean} */ notification
      ) => {
        log.debug(
          `${this.#characteristic.name} subscription change: ${connection.peerAddress}, notification: ${notification}`
        )
        this.#isSubscribed = notification
        this.#connection = notification ? connection : undefined
      }
    }
  }

  /**
   * @param {Buffer | string} buffer
   */
  notify (buffer) {
    if (this.#characteristic.notify === undefined) {
      throw new Error(
        `Characteristics ${this.#characteristic.name} has not been initialized`
      )
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

  /**
   * @param {GattServerServiceFactory} gattService
   */
  constructor (gattService) {
    this.#gattService = gattService
  }
}
