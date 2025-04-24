import loglevel from 'loglevel'

import { swapObjectPropertyValues } from '../../../../tools/Helper.js'

import { Concept2Date, createWorkoutPlan, readUInt16, readUInt32 } from '../utils/C2toORMMapper.js'

import { DurationTypes, IntervalTypes, ProprietaryLongGetConfigCommands, ProprietaryLongSetConfigCommands, ProprietaryLongSetDataCommands, ProprietaryShortGetConfigCommands, ScreenTypes, ScreenValue, WorkoutTypes } from './CsafeCommandsMapping.js'

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
  #workoutplan

  /**
   * @param {import('../control-service/ControlTransmitCharacteristic.js').ControlTransmitCharacteristic} controlTransmitCharacteristic
   * @param {ControlPointCallback} controlCallback
   */
  constructor (controlTransmitCharacteristic, controlCallback) {
    this.#controlTransmitCharacteristic = controlTransmitCharacteristic
    this.#controlPointCallback = controlCallback
    this.#workoutplan = createWorkoutPlan()
  }

  /**
   * @param {Array<number>} buffer
   */
  processCommand (buffer) {
    const csafeFrame = new CsafeRequestFrame(buffer)

    const commands = csafeFrame.commands

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

    // TODO: the handling of the individual commands should be cleaned up by moving the construction of the workoutplan into a seperate object
    let i = 0
    let commandData
    let duration
    while (i < commands.length) {
      commandData = commands[i].data
      switch (commands[i].command) {
        case (ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTINTERVALCOUNT):
          if (commandData[0] === 0) {
            this.#workoutplan.reset()
            log.debug('Created empty workoutplan')
          }
          log.debug(`command ${i + 1}, CSAFE_PM_SET_WORKOUTINTERVALCOUNT, number: ${commandData}`)
          break
        case (ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTTYPE):
          log.debug(`command ${i + 1}, CSAFE_PM_SET_WORKOUTTYPE, ${swapObjectPropertyValues(WorkoutTypes)[commandData[0]]}`)
          if (commandData[0] === WorkoutTypes.WORKOUTTYPE_JUSTROW_NOSPLITS || commandData[0] === WorkoutTypes.WORKOUTTYPE_JUSTROW_SPLITS) {
            this.#workoutplan.addInterval('justrow', 0)
            log.debug('  Added justrow interval')
          }
          if (commandData[0] === WorkoutTypes.WORKOUTTYPE_FIXEDTIME_INTERVAL) {
            this.#workoutplan.addInterval('justrow', 0)
            i++ // Move to the duration
            commandData = commands[i].data
            duration = readUInt32(commandData[1], commandData[2], commandData[3], commandData[4])
            this.#workoutplan.addSplit('time', duration)
            i++ // Move to the rest specification
            log.error(`PM5 WORKOUTTYPE_FIXEDTIME_INTERVAL is mapped to 'justrow' interval with ${duration / 100} second splits, rest information will be lost`)
          }
          if (commandData[0] === WorkoutTypes.WORKOUTTYPE_FIXEDDIST_INTERVAL) {
            this.#workoutplan.addInterval('justrow', 0)
            i++ // Move to the duration
            commandData = commands[i].data
            duration = readUInt32(commandData[1], commandData[2], commandData[3], commandData[4])
            this.#workoutplan.addSplit('distance', duration)
            i++ // Move to the rest specification
            log.error(`PM5 WORKOUTTYPE_FIXEDDIST_INTERVAL is mapped to 'justrow' interval with ${duration} meter splits, rest information will be lost`)
          }
          break
        case (ProprietaryLongSetConfigCommands.CSAFE_PM_SET_INTERVALTYPE):
          if (commandData[0] === IntervalTypes.INTERVALTYPE_NONE) {
            this.#workoutplan.addInterval('justrow', 0)
            log.debug(`command ${i + 1}, CSAFE_PM_SET_INTERVALTYPE, ${swapObjectPropertyValues(IntervalTypes)[commandData[0]]}, mapped to 'justrow' interval`)
          }
          break
        case (ProprietaryLongSetConfigCommands.CSAFE_PM_SET_WORKOUTDURATION):
          duration = readUInt32(commandData[1], commandData[2], commandData[3], commandData[4])
          if (commandData[0] === DurationTypes.CSAFE_DISTANCE_DURATION) {
            this.#workoutplan.addInterval('distance', duration)
            log.debug(`command ${i + 1}, CSAFE_PM_SET_WORKOUTDURATION, Interval type: ${swapObjectPropertyValues(DurationTypes)[commandData[0]]}, length ${duration} meters`)
          } else {
            this.#workoutplan.addInterval('time', duration)
            log.debug(`command ${i + 1}, CSAFE_PM_SET_WORKOUTDURATION Interval type: ${swapObjectPropertyValues(DurationTypes)[commandData[0]]}, duration ${Math.round(duration / 100)} seconds`)
          }
          break
        case (ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SPLITDURATION):
          duration = readUInt32(commandData[1], commandData[2], commandData[3], commandData[4])
          if (commandData[0] === DurationTypes.CSAFE_DISTANCE_DURATION) {
            this.#workoutplan.addSplit('distance', duration)
            log.debug(`command ${i + 1}, CSAFE_PM_SET_SPLITDURATION split type: ${swapObjectPropertyValues(DurationTypes)[commandData[0]]}, length ${duration} meters`)
          } else {
            this.#workoutplan.addSplit('time', duration)
            log.debug(`command ${i + 1}, CSAFE_PM_SET_SPLITDURATION split type: ${swapObjectPropertyValues(DurationTypes)[commandData[0]]}, duration ${Math.round(duration / 100)} seconds`)
          }
          break
        case (ProprietaryLongSetConfigCommands.CSAFE_PM_SET_RESTDURATION):
          duration = readUInt16(commandData[0], commandData[1])
          this.#workoutplan.addInterval('rest', duration)
          break
        case (ProprietaryLongSetConfigCommands.CSAFE_PM_CONFIGURE_WORKOUT):
          response.addCommand(ProprietaryLongSetConfigCommands.CSAFE_PM_CONFIGURE_WORKOUT)
          log.debug(`command ${i + 1}, CSAFE_PM_CONFIGURE_WORKOUT Programming Mode: ${commandData[0] === 0 ? 'Disabled' : 'Enabled'}`)
          break
        case (ProprietaryLongGetConfigCommands.CSAFE_PM_GET_EXTENDED_HRBELT_INFO):
          response.addCommand(
            ProprietaryLongGetConfigCommands.CSAFE_PM_GET_EXTENDED_HRBELT_INFO,
            [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
          )
          log.debug(`command ${i + 1}, CSAFE_PM_GET_EXTENDED_HRBELT_INFO`)
          break
        case (ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRBELT_INFO):
          response.addCommand(ProprietaryLongSetDataCommands.CSAFE_PM_SET_EXTENDED_HRBELT_INFO)
          log.debug(`command ${i + 1}, CSAFE_PM_SET_EXTENDED_HRBELT_INFO`)
          break
        case (ProprietaryShortGetConfigCommands.CSAFE_PM_GET_DATETIME):
          response.addCommand(ProprietaryShortGetConfigCommands.CSAFE_PM_GET_DATETIME, new Concept2Date().toC2DateByteArray())
          log.debug(`command ${i + 1}, CSAFE_PM_GET_DATETIME`)
          break
        case (ProprietaryLongSetConfigCommands.CSAFE_PM_SET_SCREENSTATE):
          if (commandData[0] === ScreenTypes.SCREENTYPE_WORKOUT) {
            switch (commandData[1]) {
              case ScreenValue.SCREENVALUEWORKOUT_TERMINATEWORKOUT:
                // we can handle specific commands and communicate back via the controlPointCallback by calling a Command
                // EXR and the PM5 routinely send this at the START of a rowing session. To prevent this from blocking valid sessions, it is mapped to the startOrResume event
                this.#controlPointCallback({ req: { name: 'startOrResume', client: null, data: {} } })
                break
              case ScreenValue.SCREENVALUEWORKOUT_PREPARETOROWWORKOUT:
                // TODO: the ControlPointEvent data interface should be fixed because it is not unified now across the consumers. The peripherals are the only one using the `req: {name: etc.}`format
                if (this.#workoutplan.length() > 0) {
                  // We have a workout plan with defined intervals, let's tell everybody the good news!
                  this.#controlPointCallback({ req: { name: 'updateIntervalSettings', client: null, data: this.#workoutplan.result() } })
                  this.#workoutplan.reset()
                }
                this.#controlPointCallback({ req: { name: 'start', client: null, data: {} } })
                break
              // no default
            }
          }

          log.debug(`command ${i + 1}, CSAFE_PM_SET_SCREENSTATE data: ${swapObjectPropertyValues(ScreenTypes)[commandData[0]]}, ${swapObjectPropertyValues(ScreenValue)[commandData[1]]}`)
          break
        default:
          log.debug(`command ${i + 1}: unhandled command ${swapObjectPropertyValues(ProprietaryShortGetConfigCommands)[commands[i].command]}`)
          response.addCommand(commands[i].command)
      }
      i++
    }

    this.#controlTransmitCharacteristic.notify(response.build())
  }
}
