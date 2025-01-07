'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Starts the central manager in a forked thread since noble does not like
  to run in the same thread as bleno
*/
import EventEmitter from 'node:events'
import child_process from 'child_process'

function createBleHrmPeripheral () {
  const emitter = new EventEmitter()
  // The environmental variable below is needed to keep BleNo and NoBle apart, as they both want access to the same hardware but for different roles
  // See https://github.com/stoprocent/noble?tab=readme-ov-file#bleno-compatibility-linux-specific
  const env = {env: {NOBLE_MULTI_ROLE: 1}}

  const bleHrmProcess = child_process.fork('./app/peripherals/ble/hrm/HrmService.js', env)

  bleHrmProcess.on('message', (heartRateMeasurement) => {
    emitter.emit('heartRateMeasurement', heartRateMeasurement)
  })

  function destroy () {
    return new Promise(resolve => {
      bleHrmProcess.kill()
      bleHrmProcess.removeAllListeners()
      resolve()
    })
  }

  return Object.assign(emitter, {
    destroy
  })
}

export { createBleHrmPeripheral }
