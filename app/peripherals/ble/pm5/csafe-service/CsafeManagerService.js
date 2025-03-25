import loglevel from 'loglevel'

import { swapObjectPropertyValues } from '../../../../tools/Helper.js'

import { Concept2Date } from '../Pm5Constants.js'

import { ProprietaryLongGetConfigCommands, ProprietaryLongSetConfigCommands, ProprietaryLongSetDataCommands, ProprietaryShortGetConfigCommands, ScreenTypes, ScreenValue, WorkoutTypes } from './CsafeCommandsMapping.js'

import { CsafeRequestFrame } from './CsafeRequestFrame.js'
import { CsafeResponseFrame } from './CsafeResponseFrame.js'

/**
 * @typedef {import('./CsafeCommand.js').CsafeCommand} CsafeCommand
 */

const log = loglevel.getLogger('Peripherals')

export class CsafeManagerService {
  #lastResponseFlag = 1
  #controlTransmitCharacteristic
  #controlPointCallback

  /**
   * @param {import('../control-service/ControlTransmitCharacteristic.js').ControlTransmitCharacteristic} controlTransmitCharacteristic
   * @param {ControlPointCallback} controlCallback
   */
  constructor (controlTransmitCharacteristic, controlCallback) {
    this.#controlTransmitCharacteristic = controlTransmitCharacteristic
    this.#controlPointCallback = controlCallback
  }

  /**
   * @param {Array<number>} buffer
   */
  processCommand (buffer) {
    const csafeFrame = new CsafeRequestFrame(buffer)

    let csafeCommands = csafeFrame.commands.map((command) => command.command)

    log.debug('PM5 commands received:', csafeFrame.commands.map((command) => command.toString()))

    this.#lastResponseFlag = this.#lastResponseFlag ^ 1

    const response = new CsafeResponseFrame(this.#lastResponseFlag, csafeFrame.frameType)

    if (csafeFrame.isExtended()) {
      // in the response the addresses should be swapped compared to the request
      response.setDestinationAddress(csafeFrame.sourceAddress)
      response.setSourceAddress(csafeFrame.destinationAddress)
    }

    if (csafeFrame.isProprietary()) {
      response.setProprietaryWrapper(csafeFrame.proprietaryCommandWrapper)
    }

    // TODO: the handling of the individual commands should be cleaned up in a way that this function does not grow to a huge unmaintainable call (probably splitting more complex handling to private member functions).
    if (csafeCommands.includes(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTTYPE)) {
      csafeCommands = csafeCommands.filter(
        (command) => command !== ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTTYPE
      )

      // Technically it is possible that one big workout is received via multiple frames https://www.c2forum.com/viewtopic.php?t=204541 workout building should be done as long as the SCREENVALUEWORKOUT_PREPARETOROWWORKOUT is not received as that is the indication of the start of the workout
      response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTTYPE)

      const commandData = /** @type {CsafeCommand} */(
        csafeFrame.getCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTTYPE)
      ).data

      log.debug(`CSAFE_PM_SET_WORKOUTTYPE data: ${swapObjectPropertyValues(WorkoutTypes)[commandData[0]]}`)

      // TODO: workout type received, here we build the workout. Based on the spec for proprietary workout commands its a realistic assumption that this is always the first command when compiling a workout. Except when WORKOUTTYPE_VARIABLE_INTERVAL because there the first command is CSAFE_PM_WORKOUTINTERVALCOUNT
    }

    if (csafeCommands.includes(ProprietaryLongSetConfigCommands.CSAFE_PM_CONFIGURE_WORKOUT)) {
      csafeCommands = csafeCommands.filter(
        (command) => command !== ProprietaryLongSetConfigCommands.CSAFE_PM_CONFIGURE_WORKOUT
      )

      response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_CONFIGURE_WORKOUT)

      const commandData = /** @type {CsafeCommand} */(
        csafeFrame.getCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_CONFIGURE_WORKOUT)
      ).data
      // I dont actually know what this command means in reality but it is sent along with an interval setup. This is probably not relevant for ORM as we can program workouts irrespective
      log.debug(`CSAFE_PM_CONFIGURE_WORKOUT Programming Mode: ${commandData[0] === 0 ? 'Disabled' : 'Enabled'}`)
    }

    if (csafeCommands.includes(ProprietaryLongGetConfigCommands.CSAFE_PM_GET_EXTENDED_HRBELT_INFO)) {
      csafeCommands = csafeCommands.filter(
        (command) => command !== ProprietaryLongGetConfigCommands.CSAFE_PM_GET_EXTENDED_HRBELT_INFO
      )

      response.addCommand(
        ProprietaryLongGetConfigCommands.CSAFE_PM_GET_EXTENDED_HRBELT_INFO,
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
      )
    }

    if (csafeCommands.includes(ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRBELT_INFO)) {
      csafeCommands = csafeCommands.filter(
        (command) => command !== ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRBELT_INFO
      )

      response.addCommand(ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRBELT_INFO)
    }

    if (csafeCommands.includes(ProprietaryShortGetConfigCommands.CSAFE_PM_GET_DATETIME)) {
      csafeCommands = csafeCommands.filter(
        (command) => command !== ProprietaryShortGetConfigCommands.CSAFE_PM_GET_DATETIME
      )

      const date = new Concept2Date()
      response.addCommand(ProprietaryShortGetConfigCommands.CSAFE_PM_GET_DATETIME, [
        date.getHours() % 12 || 12,
        date.getMinutes(),
        date.getHours() > 12 ? 1 : 0,
        date.getMonth() + 1,
        date.getDate(),
        (date.getFullYear() >> 8) & 0xFF,
        date.getFullYear() & 0xFF
      ])
    }

    if (csafeCommands.includes(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SCREENSTATE)) {
      response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SCREENSTATE)

      csafeCommands = csafeCommands.filter(
        (command) => command !== ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SCREENSTATE
      )

      const commandData = /** @type {CsafeCommand} */(
        csafeFrame.getCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SCREENSTATE)
      ).data

      log.debug(`CSAFE_PM_SET_SCREENSTATE data: ${swapObjectPropertyValues(ScreenTypes)[commandData[0]]}, ${swapObjectPropertyValues(ScreenValue)[commandData[1]]}`)

      if (commandData[0] === ScreenTypes.SCREENTYPE_WORKOUT) {
        switch (commandData[1]) {
          case ScreenValue.SCREENVALUEWORKOUT_TERMINATEWORKOUT:
            // we can handle specific commands and communicate back via the controlPointCallback by calling a Command
            this.#controlPointCallback({ req: { name: 'reset', client: null, data: {} } })
            break

          case ScreenValue.SCREENVALUEWORKOUT_PREPARETOROWWORKOUT:
            // TODO: the ControlPointEvent data interface should be fixed because it is not unified now across the consumers. It does not use the `req: {name: etc.}`format but rather uses `{name: etc.}`
            this.#controlPointCallback({ req: { name: 'start', client: null, data: {} } })

            break

            // no default
        }
      }
    }

    csafeCommands.forEach((command) => {
      // "When sending a frame consisting of multiple commands to a secondary device, the resulting response frame consists of multiple command responses." CSAFE Spec
      response.addCommand(command)
    })

    this.#controlTransmitCharacteristic.notify(response.build())
  }
}
