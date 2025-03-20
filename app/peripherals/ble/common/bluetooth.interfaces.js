/**
 * @typedef {{
 * req?: {
 *   name: Command,
 *   data: unknown,
 *   client: null
 * }
 * }} ControlPointEvent
 */
/**
 * @typedef {(event: ControlPointEvent) => boolean} ControlPointCallback
 */
/**
 * @typedef {Partial<import('../ble-host.interface.js').GattServerCharacteristic> & {name: string}} GattServerCharacteristicFactory
 */
/**
 * @typedef {Partial<import('../ble-host.interface.js').GattServerService> & { name: string }} GattServerServiceFactory
 */
