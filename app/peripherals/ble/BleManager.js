import loglevel from 'loglevel'

/**
 * @typedef {import('./ble-host.interface.js').BleManager} BleHostManager
 */

const log = loglevel.getLogger('Peripherals')

const isBleSupported = process.platform === 'linux'

export class BleManager {
  /**
   * @type {any}
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
  /**
   * @type {any}
   */
  #HciSocket
  /**
   * @type {any}
   */
  #NodeBleHost

  constructor () {
    if (!isBleSupported) {
      log.warn(`BLE support unavailable on ${process.platform} (Linux only)`)
      throw new Error(`BLE is only supported on Linux, current platform: ${process.platform}`)
    }
  }

  open () {
    if (this.#manager !== undefined) {
      return Promise.resolve(this.#manager)
    }

    if (this.#managerOpeningTask === undefined) {
      this.#managerOpeningTask = (async () => {
        if (this.#manager) {
          return this.#manager
        }
        log.debug('Opening BLE manager')

        try {
          if (this.#HciSocket === undefined || this.#NodeBleHost === undefined) {
            const hciSocketModule = await import('hci-socket')
            const bleHostModule = await import('ble-host')
            this.#HciSocket = hciSocketModule.default
            this.#NodeBleHost = bleHostModule.default
          }

          if (this.#transport === undefined) {
            this.#transport = new this.#HciSocket()
          }

          return new Promise((resolve, reject) => {
            this.#NodeBleHost.BleManager.create(this.#transport, {}, (/** @type {Error | null} */err, /** @type {BleHostManager} */manager) => {
              if (err) { reject(err) }
              this.#manager = manager
              this.#managerOpeningTask = undefined
              resolve(manager)
            })
          })
        } catch (error) {
          log.error('Failed to load BLE modules:', error)
          throw error
        }
      })()
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

/**
 * Convert a 16-bit C2 PM5 UUID to a BLE standard 128-bit UUID.
 * @param {string} uuid
 * @returns
 */
export const toBLEStandard128BitUUID = (uuid) => `0000${uuid}-0000-1000-8000-00805F9B34FB`

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
      onSubscriptionChange: (/** @type {import('./ble-host.interface.js').Connection} */connection, /** @type {boolean} */ notification) => {
        log.debug(`${this.#characteristic.name} subscription change: ${connection.peerAddress}, notification: ${notification}`)
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

  /**
   * @param {GattServerServiceFactory} gattService
   */
  constructor (gattService) {
    this.#gattService = gattService
  }
}
