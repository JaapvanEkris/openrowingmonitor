'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This file contains tests the collection of artificial curves that are used for testing purposses
 */
import { describe, test } from 'vitest'
import { alps, artificialStroke, camel, cleanSimulatorDrive, cleanSimulatorRecovery, dromedaryLeft, dromedaryRight, parabola, pyramid } from './BasicCurves.ts'

const tolerance = 0.035

/**
 * @description Roundtrip test of the parabola function
 */
describe('parabola round-trip tests', () => {
  test('parabola_01: parabola firstIntegral round-trip', () => {
    const curve = parabola
    for (let x = 0; x < 200; x += 0.5) {
      checkFirstIntegral('parabola', curve, x)
    }
  })

  test('parabola_02: parabola secondIntegral round-trip', () => {
    const curve = parabola
    for (let x = 0; x <= 200; x += 0.5) {
      checkSecondIntegral('parabola', curve, x)
    }
  })
})

/**
 * @description Roundtrip test of the pyramid function
 */
describe('pyramid round-trip tests', () => {
  test('pyramid_01: pyramid firstIntegral round-trip', () => {
    const curve = pyramid
    for (let x = 0; x <= 100; x += 0.5) {
      checkFirstIntegral('pyramid', curve, x)
    }
  })

  test('pyramid_02: pyramid secondIntegral round-trip', () => {
    const curve = pyramid
    for (let x = 0; x <= 100; x += 0.5) {
      checkSecondIntegral('pyramid', curve, x)
    }
  })
})

/**
 * @description Roundtrip test of the camel function
 */
describe('camel round-trip tests', () => {
  test('camel_01: camel firstIntegral round-trip', () => {
    const curve = camel
    for (let x = 0; x <= 200; x += 1) {
      checkFirstIntegral('camel', curve, x)
    }
  })

  test('camel_02: camel secondIntegral round-trip', () => {
    const curve = camel
    for (let x = 0; x <= 200; x += 0.5) {
      checkSecondIntegral('camel', curve, x)
    }
  })
})

/**
 * @description Roundtrip test of the dromedaryLeft function
 */
describe('dromedaryLeft round-trip tests', () => {
  test('dromedaryLeft_01: dromedaryLeft firstIntegral round-trip', () => {
    const curve = dromedaryLeft
    for (let x = 0; x < 200; x += 0.5) {
      checkFirstIntegral('dromedaryLeft', curve, x)
    }
  })

  test('dromedaryLeft_02: dromedaryLeft secondIntegral round-trip', () => {
    const curve = dromedaryLeft
    for (let x = 0; x <= 200; x += 1) {
      checkSecondIntegral('dromedaryLeft', curve, x)
    }
  })
})

/**
 * @description Roundtrip test of the dromedaryRight function
 */
describe('dromedaryRight round-trip tests', () => {
  test('dromedaryRight_01: dromedaryRight firstIntegral round-trip', () => {
    const curve = dromedaryRight
    for (let x = 0; x <= 200; x += 0.5) {
      checkFirstIntegral('dromedaryRight', curve, x)
    }
  })

  test('dromedaryRight_02: dromedaryRight secondIntegral round-trip', () => {
    const curve = dromedaryRight
    for (let x = 0; x <= 200; x += 0.5) {
      checkSecondIntegral('dromedaryRight', curve, x)
    }
  })
})

/**
 * @description Roundtrip test of the alps function
 */
describe('alps round-trip tests', () => {
  test('alps_01: alps firstIntegral round-trip', () => {
    const curve = alps
    for (let x = 0; x <= 200; x += 0.5) {
      checkFirstIntegral('alps', curve, x)
    }
  })

  test('alps_02: alps secondIntegral', () => {
    const curve = alps
    for (let x = 0; x <= 200; x += 0.5) {
      checkSecondIntegral('alps', curve, x)
    }
  })
})

/**
 * @description Roundtrip test of the artificialStroke function
 */
describe('artificialStroke round-trip tests', () => {
  test('artificialStroke_01: artificialStroke firstIntegral round-trip', () => {
    const curve = artificialStroke
    for (let x = 0; x <= 200; x += 0.5) {
      checkFirstIntegral('artificialStroke', curve, x)
    }
  })

  test('artificialStroke_02: artificialStroke secondIntegral round-trip', () => {
    const curve = artificialStroke
    for (let x = 0; x <= 200; x += 0.5) {
      checkSecondIntegral('artificialStroke', curve, x)
    }
  })
})

/**
 * @description Roundtrip test of the cleanSimulator function
 */
describe('cleanSimulatorDrive round-trip tests', () => {
  test('cleanSimulatorDrive_01: cleanSimulatorDrive firstIntegral round-trip', () => {
    const curve = cleanSimulatorDrive
    for (let x = 0.005; x <= 0.75; x += 0.005) {
      checkFirstIntegral('cleanSimulatorDrive', curve, x)
    }
  })

  test('cleanSimulatorDrive_02: cleanSimulatorDrive secondIntegral', () => {
    const curve = cleanSimulatorDrive
    for (let x = 0; x <= 0.75; x += 0.005) {
      checkSecondIntegral('cleanSimulatorDrive', curve, x)
    }
  })
})

/**
 * @description Roundtrip test of the cleanSimulator function
 */
describe('cleanSimulatorRecovery round-trip tests', () => {
  test('cleanSimulatorRecovery_01: cleanSimulatorRecovery firstIntegral round-trip', () => {
    const curve = cleanSimulatorRecovery
    for (let x = 0; x <= 2.2; x += 0.005) {
      checkFirstIntegral('cleanSimulatorRecovery', curve, x)
    }
  })

  test('cleanSimulatorRecovery_02: cleanSimulatorRecovery secondIntegral', () => {
    const curve = cleanSimulatorRecovery
    for (let x = 0; x <= 2.2; x += 0.005) {
      checkSecondIntegral('cleanSimulatorRecovery', curve, x)
    }
  })
})

/**
 * Diagnostic helper functions
 */
function logFailure (info: Record<string, unknown>) {
  / eslint-disable no-console -- Needed for logging issues in roundtrip
  console.error('--- ROUND TRIP FAILURE ---')
  for (const [k, v] of Object.entries(info)) {
    console.error(`${k}:`, v)
  }
  console.error('---------------------------')
}

function checkFirstIntegral (name, curve, x) {
  const f = curve.projectX(x)
  const y = f.firstIntegral.y
  const inv = curve.solveY(y)
  const xr = inv?.firstIntegral?.x

  if (!Number.isFinite(xr) || (x !== 0 && (Math.abs(xr - x) / x) > tolerance)) {
    logFailure({
      curve: name,
      integral: 'firstIntegral',
      originalX: x,
      valueY: y,
      returnedX: xr,
      error: xr === undefined || x === 0 ? 'undefined' : (Math.abs(xr - x) / x),
      tolerance: tolerance
    })
    throw new Error(`${name} firstIntegral round-trip failed`)
  }
}

function checkSecondIntegral (name, curve, x) {
  const f = curve.projectX(x)
  const y = f.secondIntegral.y
  const inv = curve.solveY(y)
  const xr = inv?.secondIntegral?.x

  if (!Number.isFinite(xr) || (x !== 0 && (Math.abs(xr - x) / x) > tolerance)) {
    logFailure({
      curve: name,
      integral: 'secondIntegral',
      originalX: x,
      valueY: y,
      returnedX: xr,
      error: xr === undefined || x === 0 ? 'undefined' : (Math.abs(xr - x) / x),
      tolerance: tolerance
    })
    throw new Error(`${name} secondIntegral round-trip failed`)
  }
}
