'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Parses command-line arguments for session simulation.
*/

import { parseArgs } from 'util'

const simulationArgOptions = /** @type {const} */ ({
  simulate: { type: 'boolean', default: false },
  simulateFile: { type: 'string', default: 'recordings/Concept2_RowErg_Session_2000meters.csv' },
  simulateDelay: { type: 'string', default: '30000' },
  simulateOnce: { type: 'boolean', default: false },
  simulateFast: { type: 'boolean', default: false }
})

/**
 * @param {string[]} argv
 */
function parseSimulationArgs (argv) {
  const { values } = parseArgs({
    options: simulationArgOptions,
    args: argv,
    strict: false
  })

  const parsedDelay = parseInt(String(values.simulateDelay ?? '30000'), 10)

  return {
    simulate: !!values.simulate,
    simulateFile: String(values.simulateFile ?? 'recordings/Concept2_RowErg_Session_2000meters.csv'),
    simulateDelay: Number.isFinite(parsedDelay) && parsedDelay >= 0 ? parsedDelay : 30000,
    realtime: !values.simulateFast,
    loop: !values.simulateOnce
  }
}

export {
  parseSimulationArgs
}
