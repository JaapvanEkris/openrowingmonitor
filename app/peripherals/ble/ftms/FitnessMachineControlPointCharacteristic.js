'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  The connected Central can remotely control some parameters or our rowing monitor via this Control Point
*/
import NodeBleHost from 'ble-host'
import logevel from 'loglevel'

import { swapObjectPropertyValues } from '../../../tools/Helper.js'

import { ResultOpCode } from '../common/CommonOpCodes.js'

const log = logevel.getLogger('Peripherals')

// see https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0 for details
const ControlPointOpCode = {
  requestControl: 0x00,
  reset: 0x01,
  setTargetSpeed: 0x02,
  setTargetInclincation: 0x03,
  setTargetResistanceLevel: 0x04,
  setTargetPower: 0x05,
  setTargetHeartRate: 0x06,
  startOrResume: 0x07,
  stopOrPause: 0x08,
  setTargetedExpendedEnergy: 0x09,
  setTargetedNumberOfSteps: 0x0A,
  setTargetedNumberOfStrides: 0x0B,
  setTargetedDistance: 0x0C,
  setTargetedTrainingTime: 0x0D,
  setTargetedTimeInTwoHeartRateZones: 0x0E,
  setTargetedTimeInThreeHeartRateZones: 0x0F,
  setTargetedTimeInFiveHeartRateZones: 0x10,
  setIndoorBikeSimulationParameters: 0x11,
  setWheelCircumference: 0x12,
  spinDownControl: 0x13,
  setTargetedCadence: 0x14,
  responseCode: 0x80
}

export class FitnessMachineControlPointCharacteristic {
  get characteristic () {
    return this.#characteristic
  }

  #controlled = false
  /**
   * @type {GattServerCharacteristicFactory}
   */
  #characteristic
  #controlPointCallback

  /**
   * @param {ControlPointCallback} controlPointCallback
   */
  constructor (controlPointCallback) {
    if (!controlPointCallback) { throw new Error('controlPointCallback required') }
    this.#controlPointCallback = controlPointCallback

    this.#characteristic = {
      name: 'Fitness Machine Control Point',
      uuid: 0x2AD9,
      properties: ['write', 'indicate'],
      onWrite: (connection, _needsResponse, opCode, callback) => {
        log.debug('FTMS control is called:', opCode)
        const response = this.#onWriteRequest(opCode)

        if (this.#characteristic.indicate === undefined) {
          throw new Error(`Characteristics ${this.#characteristic.name} has not been initialized`)
        }

        this.#characteristic.indicate(connection, response)
        callback(NodeBleHost.AttErrors.SUCCESS) // actually only needs to be called when needsResponse is true
      }
    }
  }

  /**
   * @param {Buffer} data
   * @returns {Buffer}
   */
  #onWriteRequest (data) {
    const opCode = data.readUInt8(0)
    switch (opCode) {
      case ControlPointOpCode.requestControl:
        if (!this.#controlled) {
          // TODO: This does not work, becurse the controlPointCallback injected in PeripheralManager does not have a return value, it simply emits the control event
          if (this.#controlPointCallback({
            req: {
              name: 'requestControl',
              data: {}
            }
          })) {
            log.debug('FitnessMachineControlPointCharacteristic: requestControl successful')
            this.#controlled = true

            // TODO: This is never called in the current implementation
            return this.#buildResponse(opCode, ResultOpCode.success)
          }

          return this.#buildResponse(opCode, ResultOpCode.operationFailed)
        }

        return this.#buildResponse(opCode, ResultOpCode.controlNotPermitted)

      case ControlPointOpCode.reset:
        // as per spec the reset command shall also reset the control
        this.#controlled = false
        return this.#handleSimpleCommand(ControlPointOpCode.reset, 'reset')

      case ControlPointOpCode.startOrResume:
        return this.#handleSimpleCommand(ControlPointOpCode.startOrResume, 'startOrResume')

      case ControlPointOpCode.stopOrPause: {
        const controlParameter = data.readUInt8(1)
        if (controlParameter === 1) {
          return this.#handleSimpleCommand(ControlPointOpCode.stopOrPause, 'stop')
        } else if (controlParameter === 2) {
          return this.#handleSimpleCommand(ControlPointOpCode.stopOrPause, 'pause')
        }

        log.error(`FitnessMachineControlPointCharacteristic: stopOrPause with invalid controlParameter: ${controlParameter}`)
        break
      }

      // TODO: Potentially handle setTargetPower and setDistance, etc. by integrating it into the interval/session manager. Difficulty is that this is a simple justrow like command with one target and no limits.

      // no default
    }

    log.info(`FitnessMachineControlPointCharacteristic: opCode ${swapObjectPropertyValues(ControlPointOpCode)[opCode]} is not supported`)
    return this.#buildResponse(opCode, ResultOpCode.opCodeNotSupported)
  }

  /**
   * @param {number} opCode
   * @param {Command} opName
   */
  #handleSimpleCommand (opCode, opName) {
    if (this.#controlled) {
      if (this.#controlPointCallback({
        req: {
          name: opName,
          data: {}
        }
      })) {
        const response = this.#buildResponse(opCode, ResultOpCode.success)

        return response
      }

      return this.#buildResponse(opCode, ResultOpCode.operationFailed)
    }

    log.info(`FitnessMachineControlPointCharacteristic: initiating command '${opName}' requires 'requestControl'`)

    return this.#buildResponse(opCode, ResultOpCode.controlNotPermitted)
  }

  /**
   * @param {number} opCode
   * @param {number} resultCode
   */
  #buildResponse (opCode, resultCode) {
    const buffer = Buffer.alloc(3)
    buffer.writeUInt8(0x80, 0)
    buffer.writeUInt8(opCode, 1)
    buffer.writeUInt8(resultCode, 2)
    return buffer
  }
}
