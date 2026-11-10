'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Parses command-line arguments and environment variables that control hardware access.
*/

import { parseArgs } from 'util'

const hardwareArgOptions = /** @type {const} */ ({
  'no-hardware': { type: 'boolean', default: false }
})

/**
 * Determines whether hardware (GPIO, BLE, ANT+) should be bypassed.
 * The environment variable is also checked so that child processes (e.g. the forked GpioTimerService) inherit the setting.
 *
 * @param {string[]} argv
 * @param {Record<string, string | undefined>} env
 */
function parseHardwareArgs (argv, env) {
  const { values } = parseArgs({
    options: hardwareArgOptions,
    args: argv,
    strict: false
  })

  return {
    simulateWithoutHardware: !!values['no-hardware'] || env.ORM_NO_HARDWARE === '1'
  }
}

export {
  parseHardwareArgs
}
