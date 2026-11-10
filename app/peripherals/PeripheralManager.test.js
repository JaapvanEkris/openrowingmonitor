'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Tests for the PeripheralManager without hardware (--no-hardware)
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import log from 'loglevel'

import { createPeripheralManager } from './PeripheralManager.js'

log.setLevel('silent')

function noHardwareConfig () {
  return {
    simulateWithoutHardware: true,
    bluetoothMode: 'PM5',
    antPlusMode: 'FE',
    heartRateMode: 'BLE',
    mqtt: { mqttBroker: '', machineName: '' },
    userSettings: { restingHR: 40, maxHR: 220 }
  }
}

// Without hardware nothing waits on I/O, so all pending peripheral changes are done after the microtask queue drains
const settle = () => new Promise((resolve) => { setImmediate(resolve) })

test('without hardware, the config reports every peripheral mode as OFF', async () => {
  const config = noHardwareConfig()
  createPeripheralManager(config)
  await settle()

  assert.is(config.bluetoothMode, 'OFF')
  assert.is(config.antPlusMode, 'OFF')
  assert.is(config.heartRateMode, 'OFF')
})

test('without hardware, switching a peripheral mode keeps the config at OFF', async () => {
  const config = noHardwareConfig()
  const manager = createPeripheralManager(config)
  await settle()

  // One at a time: a switch requested while another is in progress is ignored
  const switchMode = async (command) => {
    await manager.handleCommand(command)
    await settle()
  }
  await switchMode('switchBlePeripheralMode')
  await switchMode('switchAntPeripheralMode')
  await switchMode('switchHrmMode')

  assert.is(config.bluetoothMode, 'OFF')
  assert.is(config.antPlusMode, 'OFF')
  assert.is(config.heartRateMode, 'OFF')
})

test.run()
