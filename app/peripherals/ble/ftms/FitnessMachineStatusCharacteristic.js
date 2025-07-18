'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Implements the Status Characteristics, that can be used to notify the central about the current
  training machine settings. Currently only used to notify the central about training resets.

  From the specs:
  If the Server supports the Fitness Machine Control Point, the Fitness Machine Status characteristic
  shall be exposed by the Server. Otherwise, supporting the Fitness Machine Status characteristic is optional.
*/
import loglevel from 'loglevel'

import { GattNotifyCharacteristic } from '../BleManager.js'

const log = loglevel.getLogger('Peripherals')

// see page 67 https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0
const StatusOpCode = {
  reservedForFutureUse: 0x00,
  reset: 0x01,
  stoppedOrPausedByUser: 0x02,
  stoppedBySafetyKey: 0x03,
  startedOrResumedByUser: 0x04,
  targetSpeedChanged: 0x05,
  targetInclineChanged: 0x06,
  targetResistanceLevelChanged: 0x07,
  targetPowerChanged: 0x08,
  targetHeartRateChanged: 0x09,
  targetExpendedEnergyChanged: 0x0a,
  targetNumberOfStepsChanged: 0x0b,
  targetNumberOfStridesChanged: 0x0c,
  targetDistanceChanged: 0x0d,
  targetTrainingTimeChanged: 0x0e,
  targetedTimeInTwoHeartRateZonesChanged: 0x0f,
  targetedTimeInThreeHeartRateZonesChanged: 0x10,
  targetedTimeInFiveHeartRateZonesChanged: 0x11,
  indoorBikeSimulationParametersChanged: 0x12,
  wheelCircumferenceChanged: 0x13,
  spinDownStatus: 0x14,
  targetedCadenceChanged: 0x15
}

export class FitnessMachineStatusCharacteristic extends GattNotifyCharacteristic {
  constructor () {
    super({
      name: 'Fitness Machine Status',
      uuid: 0x2ADA,
      properties: ['notify']
    })
  }

  /**
   * Present current rowing status to FTMS central
   * @param {{name: string}} status
   */
  // @ts-ignore: Type is not assignable to type
  notify (status) {
    if (!(status && status.name)) {
      return
    }

    const buffer = Buffer.alloc(2)
    switch (status.name) {
      case 'reset':
        buffer.writeUInt8(StatusOpCode.reset, 0)
        break
      case 'stoppedOrPausedByUser':
        buffer.writeUInt8(StatusOpCode.stoppedOrPausedByUser, 0)
        break
      case 'startedOrResumedByUser':
        buffer.writeUInt8(StatusOpCode.startedOrResumedByUser, 0)
        break
      default:
        log.error(`status ${status.name} is not supported`)
    }
    super.notify(buffer)
  }
}
