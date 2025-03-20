import { EventEmitter } from 'node:stream'

/**
 * - not-permitted (Characteristic cannot be read)
 * - open (Can always be read)
 * - encrypted (Can only be read when the link is encrypted)
 * - encrypted-mitm (Can only be read when the link is encrypted with a key that was generated with MITM protection)
 * - encrypted-mitm-sc (Can only be read when the link is encrypted with a key that was generated with MITM protection and Secure Connections pairing)
 * - custom (A user-provided method will called upon each read to determine if the read should be permitted)
 * @typedef {'not-permitted'|'open'|'encrypted'|'encrypted-mitm'|'encrypted-mitm-sc'|'custom'}CharacteristicPermission
 */

/**
 * BLE Manager for handling Bluetooth Low Energy operations.
 */
export class BleManager {
  /**
   * @type {GattServerDb}
   */
  // @ts-ignore
  gattDb
  /**
   * Creates a BleManager instance.
   * @param {import('node:events').EventEmitter} transport - The transport object for HCI packets.
   * @param {object} options - Optional parameters.
   * @param {string} options.staticRandomAddress - Optional static random address.
   * @param {Function} callback - Callback function with error and manager instance.
   */
  static create (transport, options, callback) {
    callback(null, new BleManager())
  }

  /**
   * Starts a scan for BLE devices.
   * @param {object} parameters - Scan parameters.
   * @param {boolean} [parameters.activeScan=true] - Request scan response data.
   * @param {number} [parameters.scanWindow=16] - Scan window in 0.625 ms units.
   * @param {number} [parameters.scanInterval=16] - Scan interval in 0.625 ms units.
   * @param {boolean} [parameters.filterDuplicates=false] - Filter duplicate advertisements.
   * @param {Array<ScanFilter>} [parameters.scanFilters] - Array of scan filters.
   * @returns {Scanner} The scanner instance.
   */
  startScan (parameters) {
    return new Scanner()
  }

  /**
   * Connects to a BLE device.
   * @param {string} bdAddrType - Address type: "public" or "random".
   * @param {string} bdAddr - Bluetooth Device Address.
   * @param {object} parameters - Connection parameters.
   * @param {number} [parameters.connIntervalMin=20] - Minimum connection interval.
   * @param {number} [parameters.connIntervalMax=25] - Maximum connection interval.
   * @param {number} [parameters.connLatency=0] - Slave latency.
   * @param {number} [parameters.supervisionTimeout=500] - Supervision timeout.
   * @param {(connection: Connection) => void} callback - Callback with the connection object.
   * @returns {PendingConnection} A pending connection object.
   */
  connect (bdAddrType, bdAddr, parameters, callback) {
    return new PendingConnection()
  }

  /**
   * Removes a bonding between the local controller and a peer device.
   * @param {string} identityAddressType - Identity address type ("public" or "random").
   * @param {string} identityAddress - The identity address.
   */
  removeBond (identityAddressType, identityAddress) {}

  /**
   * Sets advertising data.
   * @param {Buffer} data - Buffer containing max 31 bytes of advertising data.
   * @param {Function} [callback] - Callback with HCI status code.
   */
  setAdvertisingData (data, callback) {}

  /**
   * Sets scan response data.
   * @param {Buffer} data - Buffer containing max 31 bytes of scan response data.
   * @param {Function} [callback] - Callback with HCI status code.
   */
  setScanResponseData (data, callback) {}

  /**
   * Starts advertising.
   * @param {object} parameters - Advertising parameters.
   * @param {number} [parameters.intervalMin=62.5] - Minimum advertising interval.
   * @param {number} [parameters.intervalMax=62.5] - Maximum advertising interval.
   * @param {string} [parameters.advertisingType="ADV_IND"] - Advertising type.
   * @param {object} [parameters.directedAddress] - Directed address object.
   * @param {(status: number, connection: Connection) => void} callback - Callback function.
   */
  startAdvertising (parameters, callback) {}

  /**
   * Stops advertising.
   * @param {Function} [callback] - Callback with HCI status code.
   */
  stopAdvertising (callback) {}
}

/**
 * Scanner for BLE device discovery.
 * @fires Scanner#report
 */
export class Scanner extends EventEmitter {
  /**
   * Stops the scan.
   */
  stopScan () {}
}

/**
 * Event emitted when a report is received during the scan.
 * @type {object}
 * @property {boolean} connectable - Whether the device is connectable (i.e. it did not send ADV_NONCONN_IND).
 * @property {string} addressType - Address type, either 'public' or 'random'.
 * @property {string} address - The Bluetooth address of the device.
 * @property {number} rssi - The RSSI (Received Signal Strength Indicator) in dBm. (-127 to 20, 127 means not available).
 * @property {Array<object>} rawDataItems - Raw advertising data items.
 * @property {number} type - Type of advertisement.
 * @property {Buffer} data - Raw advertisement data.
 * @property {object} parsedDataItems - Parsed advertising data items (only included fields will be present).
 * @property {object} flags - Flags object for advertisement.
 * @property {boolean} leLimitedDiscoverableMode - Whether the device supports LE limited discoverable mode.
 * @property {boolean} leGeneralDiscoverableMode - Whether the device supports LE general discoverable mode.
 * @property {boolean} brEdrNotSupported - Whether the device does not support BR/EDR.
 * @property {boolean} simultaneousLeAndBdEdrToSameDeviceCapableController - Whether the controller supports simultaneous LE and BR/EDR to the same device.
 * @property {boolean} simultaneousLeAndBrEdrToSameDeviceCapableHost - Whether the host supports simultaneous LE and BR/EDR to the same device.
 * @property {Buffer} raw - Raw advertisement data.
 * @property {Array<string>} serviceUuids - Array of UUIDs of the services advertised.
 * @property {string} localName - The local name of the device (shortened form ends with '...').
 * @property {number} txPowerLevel - Transmit power level in dBm.
 * @property {object} slaveConnectionIntervalRange - Connection interval range object for slave devices.
 * @property {number} slaveConnectionIntervalRange.min - Minimum connection interval in 1.25ms units.
 * @property {number} slaveConnectionIntervalRange.max - Maximum connection interval in 1.25ms units.
 * @property {Array<string>} serviceSolicitations - Array of UUIDs for service solicitations.
 * @property {Array<object>} serviceData - Service data array.
 * @property {string} serviceData.uuid - The UUID of the service data.
 * @property {Buffer} serviceData.data - The service data buffer.
 * @property {number} appearance - The 16-bit appearance value of the device.
 * @property {Array<string>} publicTargetAddresses - Array of public target addresses.
 * @property {Array<string>} randomTargetAddresses - Array of random target addresses.
 * @property {number} advertisingInterval - The advertising interval in 0.625ms units.
 * @property {string} uri - URI data (if available).
 * @property {object} leSupportedFeatures - Supported features for the device.
 * @property {number} leSupportedFeatures.low - The lower 32 bits of the supported features.
 * @property {number} leSupportedFeatures.high - The higher 32 bits of the supported features.
 * @property {Array<object>} manufacturerSpecificData - Manufacturer-specific data.
 * @property {number} manufacturerSpecificData.companyIdentifierCode - Company identifier code.
 * @property {Buffer} manufacturerSpecificData.data - Manufacturer-specific data buffer.
 * @event Scanner#report
 */

/**
 * Pending connection object.
 */
export class PendingConnection {
  /**
   * Cancels a pending connection.
   * @param {Function} callback - Callback function if cancel succeeds.
   */
  cancel (callback) {}
}

/**
 * BLE Connection object.
 */
export class Connection extends EventEmitter {
  /**
   * @type {string}
   * Local address type ("public" or "random").
   */
  // @ts-ignore
  ownAddressType

  /**
   * @type {string}
   * Local address.
   */
  // @ts-ignore
  ownAddress

  /**
   * @type {string}
   * Peer device address type.
   */
  // @ts-ignore
  peerAddressType

  /**
   * @type {string}
   * Peer device address.
   */
  // @ts-ignore
  peerAddress

  /**
   * @type {GattConnection}
   */
  // @ts-ignore
  gatt

  /**
   * Disconnects the connection.
   * @param {number} [reason] - HCI error code.
   */
  disconnect (reason) {}

  /**
   * Reads RSSI value.
   * @param {Function} callback - Callback function with status and RSSI value.
   */
  readRssi (callback) {}
}

/**
 * Scan filter object.
 * @typedef {object} ScanFilter
 * @property {string} uuid - UUID of the filter.
 */

/**
 * Represents a GATT Server Database that manages services, characteristics, and descriptors.
 */
export class GattServerDb {
  /**
   * Sets the device name in the Device Name characteristic.
   * @param {Buffer | string} name - The new device name to store (max 248 bytes).
   */
  setDeviceName (name) { }

  /**
   * Sets the Appearance characteristic.
   * @param {number} appearance - The 16-bit unsigned integer representing the appearance.
   */
  setAppearance (appearance) { }

  /**
   * Returns the Service Changed Characteristic from the GATT service.
   * @returns {GattServerCharacteristic} The Service Changed Characteristic.
   */
  getSvccCharacteristic () {
    return new GattServerCharacteristic()
  }

  /**
   * Adds one or more services to the GATT database.
   * @param {Array<Partial<GattServerService>>} services - Array of services to add.
   */
  addServices (services) { }

  /**
   * Removes a service from the GATT database.
   * @param {Partial<GattServerService>} service - The service to remove.
   * @returns {boolean} True if the service was removed, false otherwise.
   */
  removeService (service) {
    return true
  }
}

/**
 * Represents a GATT Service.
 * @typedef {object} GattServerService
 * @property {string | number} uuid - The UUID of the service.
 * @property {boolean} [isSecondaryService=false] - Whether the service is secondary.
 * @property {Array<GattServerService>} [includedServices=[]] - Array of included services.
 * @property {number} [startHandle] - Proposed start handle for the service.
 * @property {number} endHandle - Actual end handle after service is added.
 * @property {Array<Partial<GattServerCharacteristic>>} [characteristics=[]] - Array of characteristics for this service.
 */

/**
 * Represents a GATT Server Descriptor.
 * @typedef {object} GattServerDescriptor
 * @property {string | number} uuid - The UUID of the descriptor.
 * @property {number} [maxLength] - Maximum length of the descriptor value.
 * @property {string} [readPerm] - Read permission for the descriptor.
 * @property {string} [writePerm] - Write permission for the descriptor.
 * @property {Buffer | string} value - The value of the descriptor.
 * @property {Function} [onAuthorizeRead] - Custom authorization for read operations.
 * @property {Function} [onRead] - Custom read handler for the descriptor.
 * @property {Function} [onPartialRead] - Custom partial read handler for the descriptor.
 * @property {Function} [onAuthorizeWrite] - Custom authorization for write operations.
 * @property {Function} [onWrite] - Custom write handler for the descriptor.
 * @property {Function} [onPartialWrite] - Custom partial write handler for the descriptor.
 */

/**
 * GATT Server Characteristic Class
 */
export class GattServerCharacteristic {
  /**
   * The declared properties for this characteristic.
   * @type {object}
   */
  // @ts-ignore
  properties

  /**
   * The declaration handle of the characteristic.
   * @type {number}
   */
  // @ts-ignore
  declarationHandle

  /**
   * The value handle of the characteristic.
   * @type {Buffer}
   */
  // @ts-ignore
  value
  /**
   * The UUID of the characteristic.
   * @type {string | number}
   */
  // @ts-ignore
  uuid
  /**
   * MAx MTU size.
   * @type {number}
   */
  // @ts-ignore
  maxLength = 512
  /**
   * Defines the permission needed to read the characteristic.
   * @type {CharacteristicPermission}
   */
  // @ts-ignore
  readPerm = 'open'
  /**
   * Defines the permission needed to write the characteristic.
   * @type {CharacteristicPermission}
   */
  // @ts-ignore
  writePerm = 'open'
  /**
   * @type {Array<GattServerDescriptor>}
   */
  descriptors = []

  /**
   * Notify the connection of a value update.
   * @param {Connection} connection - The BLE connection.
   * @param {Buffer | string} value - The value to notify.
   * @param {Function} [sentCallback] - A callback when the packet is sent.
   * @param {Function} [completeCallback] - A callback when the packet is fully acknowledged.
   * @returns {boolean} Whether the client was subscribed or not.
   */
  notify (connection, value, sentCallback, completeCallback) {
    return true
  }

  /**
   * Indicate to the connection with a value update.
   * @param {Connection} connection - The BLE connection.
   * @param {Buffer | string} value - The value to indicate.
   * @param {(errorCode: number, value: Buffer | string) => void} [callback] - Callback that will be called when confirmation arrives.
   * @returns {boolean} Whether the client was subscribed or not.
   */
  indicate (connection, value, callback) {
    return true
  }

  /**
   * Handler for when the subscription to notifications or indications changes.
   * @param {Connection} connection - The BLE connection.
   * @param {boolean} notification - Whether the client has subscribed to notifications.
   * @param {boolean} indication - Whether the client has subscribed to indications.
   * @param {boolean} isWrite - Whether the change is due to a write to the CCCD.
   */
  onSubscriptionChange (connection, notification, indication, isWrite) { }

  /**
   * @param {Connection} connection - The BLE connection that requests the read
   * @param {(errorCode: number, value: Buffer | string) => void} callback - Callback that should be called with the result
   */
  onRead (connection, callback) {}

  /**
   * This optional method will be called when a write needs to be done
   * @param {Connection} connection
   * @param {boolean} needsResponse
   * @param {Buffer} value
   * @param {(errorCode: number, value?: Buffer | string) => void} callback
   */
  onWrite (connection, needsResponse, value, callback) {}
}

/**
 * Represents a GATT Client connection for interacting with remote GATT servers.
 */
export class GattConnection {
  /**
   * Performs an MTU exchange request to negotiate the MTU size.
   * @param {Function} [callback] - The callback function to be invoked after the operation.
   * The first argument passed to the callback will be an `AttErrors` code or 0 on success.
   * @throws {Error} Will throw if MTU exchange is attempted more than once on the same connection.
   */
  exchangeMtu (callback) { }

  /**
   * Performs the Discover All Primary Services procedure.
   * The services will be cached and persisted if bonded.
   * If cached, the callback will be invoked immediately.
   * @param {(services: Array<GattClientService>) => void} callback - The callback function that receives an array of `GattClientService` objects.
   */
  discoverAllPrimaryServices (callback) { }

  /**
   * Performs the Discover Primary Service By UUID procedure.
   * The services array will contain only services with the specified UUID.
   * @param {string | number} uuid - The UUID of the service to find.
   * @param {number} [numToFind] - Optional limit to the number of services to discover.
   * @param {Function} [callback] - The callback function that receives an array of `GattClientService` objects.
   */
  discoverServicesByUuid (uuid, numToFind, callback) { }

  /**
   * Invalidates the services from the service cache within a specified handle range.
   * @param {number} startHandle - The starting handle of the invalidated range.
   * @param {number} endHandle - The ending handle of the invalidated range.
   * @param {Function} [callback] - Callback to be called when the invalidation is complete.
   */
  invalidateServices (startHandle, endHandle, callback) { }

  /**
   * Reads characteristics using their UUID within a specified handle range.
   * @param {number} startHandle - The starting handle of the search.
   * @param {number} endHandle - The ending handle of the search.
   * @param {string | number} uuid - The UUID of the characteristic.
   * @param {Function} callback - Callback function that receives the `AttErrors` code and results.
   */
  readUsingCharacteristicUuid (startHandle, endHandle, uuid, callback) { }

  /**
   * Starts a Reliable Write transaction. All writes after this call will be queued until `commitReliableWrite` is called.
   */
  beginReliableWrite () { }

  /**
   * Cancels any pending Reliable Write transactions.
   * @param {Function} [callback] - Callback to be called when the transaction is canceled.
   */
  cancelReliableWrite (callback) { }

  /**
   * Commits all pending writes in a Reliable Write transaction.
   * @param {Function} [callback] - Callback to be called when the transaction is committed.
   */
  commitReliableWrite (callback) { }

  /**
   * Retrieves the current MTU for the connection.
   * @type {number}
   */
  get currentMtu () { return 23 }

  /**
   * Event emitted when a GATT request times out (30 seconds after it was sent).
   * @event timeout
   */
}

/**
 * Represents a service on a remote GATT server.
 * Instances of this class are created during discovery procedures.
 */
export class GattClientService {
  /**
   * The starting handle of the service.
   * @type {number}
   */
  // @ts-ignore
  startHandle

  /**
   * The ending handle of the service.
   * @type {number}
   */
  // @ts-ignore
  endHandle

  /**
   * The UUID of the service.
   * @type {string}
   */
  // @ts-ignore
  uuid

  /**
   * Finds all included services for this service.
   * @param {(characteristics: Array<GattClientCharacteristic>) => void} callback - The callback function that receives an array of `GattClientService` objects.
   */
  findIncludedServices (callback) { }

  /**
   * Discovers all characteristics of this service.
   * @param {(characteristics: Array<GattClientCharacteristic>) => void} callback - The callback function that receives an array of `GattClientCharacteristic` objects.
   */
  discoverCharacteristics (callback) { }
}

/**
 * Represents a characteristic present on a remote GATT server.
 * Instances of this class are created during characteristic discovery.
 */
export class GattClientCharacteristic extends EventEmitter {
  /**
   * The declared properties for this characteristic.
   * @type {object}
   */
  // @ts-ignore
  properties

  /**
   * The declaration handle of the characteristic.
   * @type {number}
   */
  // @ts-ignore
  declarationHandle

  /**
   * The value handle of the characteristic.
   * @type {number}
   */
  // @ts-ignore
  valueHandle

  /**
   * The UUID of the characteristic.
   * @type {string}
   */
  // @ts-ignore
  uuid

  /**
   * Discovers all descriptors associated with this characteristic.
   * @param {Function} callback - The callback function that receives an array of `GattClientDescriptor` objects.
   */
  discoverDescriptors (callback) { }

  /**
   * Reads the value of this characteristic.
   * @param {(errorCode: number, value: Buffer) => void} callback - The callback function that receives an `AttErrors` code and the read value (Buffer).
   */
  read (callback) { }

  /**
   * Reads the value of this characteristic with a single read request.
   * @param {Function} callback - The callback function that receives an `AttErrors` code and the read value (Buffer).
   */
  readShort (callback) { }

  /**
   * Reads the value of this characteristic starting from a specific offset.
   * @param {number} offset - The starting offset.
   * @param {Function} callback - The callback function that receives the value (Buffer).
   */
  readLong (offset, callback) { }

  /**
   * Writes a value to this characteristic.
   * @param {Buffer | string} value - The value to write.
   * @param {Function} [callback] - The callback function that receives an `AttErrors` code.
   */
  write (value, callback) { }

  /**
   * Writes a value to this characteristic at a specific offset.
   * @param {Buffer | string} value - The value to write.
   * @param {number} offset - The starting offset.
   * @param {Function} [callback] - The callback function that receives an `AttErrors` code.
   */
  writeLong (value, offset, callback) { }

  /**
   * Writes a value to this characteristic without expecting a response.
   * @param {Buffer | string} value - The value to write.
   * @param {Function} [sentCallback] - Callback when the packet has been sent.
   * @param {Function} [completeCallback] - Callback when the packet has been acknowledged.
   */
  writeWithoutResponse (value, sentCallback, completeCallback) { }

  /**
   * Writes the Client Characteristic Configuration Descriptor (CCCD) to enable or disable notifications/indications.
   * @param {boolean} enableNotifications - Whether notifications should be enabled.
   * @param {boolean} enableIndications - Whether indications should be enabled.
   * @param {(err: number) => void} [callback] - The callback function that receives an `AttErrors` code.
   */
  writeCCCD (enableNotifications, enableIndications, callback) { }

  /**
   * Event emitted when a notification or indication is received for this characteristic.
   * @param {Buffer} value - The value of the notification/indication.
   * @param {boolean} isIndication - Whether it is an indication (true) or notification (false).
   * @param {Function} callback - Callback that must be called if `isIndication` is true.
   * @event change
   */
}

/**
 * Represents a descriptor associated with a characteristic on a remote GATT server.
 */
export class GattClientDescriptor {
  /**
   * The handle of this descriptor.
   * @type {number}
   */
  // @ts-ignore
  handle

  /**
   * The UUID of this descriptor.
   * @type {string}
   */
  // @ts-ignore
  uuid

  /**
   * Reads the value of this descriptor.
   * @param {Function} callback - The callback function that receives an `AttErrors` code and the read value (Buffer).
   */
  read (callback) { }

  /**
   * Reads the value of this descriptor with a single read request.
   * @param {Function} callback - The callback function that receives an `AttErrors` code and the read value (Buffer).
   */
  readShort (callback) { }

  /**
   * Reads the value of this descriptor starting from a specific offset.
   * @param {number} offset - The starting offset.
   * @param {Function} callback - The callback function that receives the value (Buffer).
   */
  readLong (offset, callback) { }

  /**
   * Writes a value to this descriptor.
   * @param {Buffer | string} value - The value to write.
   * @param {Function} [callback] - The callback function that receives an `AttErrors` code.
   */
  write (value, callback) { }

  /**
   * Writes a value to this descriptor at a specific offset.
   * @param {Buffer | string} value - The value to write.
   * @param {number} offset - The starting offset.
   * @param {Function} [callback] - The callback function that receives an `AttErrors` code.
   */
  writeLong (value, offset, callback) { }
}
