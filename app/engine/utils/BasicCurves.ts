'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This file contains a collection of artificial curves for testing purposses, shared among the several regression and curve ploting algorithms
 * For each curve they have an algebraicly derived second derivative, first derivative, plain function, first integral and second integral
 * This allows feeding a regression algoirthm the second integral, and test the speed against the first integral and the acceleration against the plain function
 * Aside for testing for mathematical correctness of these regression functions, this also helps in identifying too agressive smoothing effects, etc..
 *
 * It also contains fuzzing functions, to inject artificial noise
 * The clean ('plain') versions are used/stored in CurveMetrics.test.ts, the firstIntegral and secondIntegral are used in MovingWindowRegressor.test.ts
 * secondIntegral and fuzzing are also used in Flywheel.test.ts to test behaviour
 */
/* eslint-disable max-lines -- This sets up quite complex functons for testing, we need a lot of code for it */
export interface curveSimulator {
  projectX (x: Readonly<number>): curveFunctionResult
  solveY (y: Readonly<number>): curveFunctionResult
}

export interface cartesianCoordinates {
  readonly x: number
  readonly y: number
}

export interface curveFunctionResult {
  readonly secondDerivative: cartesianCoordinates
  readonly firstDerivative: cartesianCoordinates
  readonly plain: cartesianCoordinates
  readonly firstIntegral: cartesianCoordinates
  readonly secondIntegral: cartesianCoordinates
}

export interface fuzzingFunctions {
  readonly noNoise: fuzzingFunction
  readonly randomNoise: fuzzingFunction
  readonly systematicNoise: fuzzingFunction
  readonly randomPlusSystematicNoise: fuzzingFunction
}

export interface fuzzingFunction {
  X (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates
  Y (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates
  currentDt (datapointnumber: Readonly<number>, inputValue: Readonly<number>): number
}

/**
 * Basic parabola
 * y = -0.015 x^2 + 3x
 * Peak at x = 100, y = 600
 * Domain: 0 â†’ 200
 */
export function parabola (): curveSimulator {
}

parabola.projectX = function projectXparabola (x: Readonly<number>): curveFunctionResult {
  const secondDerivY: number = project(0, 0, 0, 0, -1 / 500, x)
  const firstDerivY: number = project(0, 0, 0, -1 / 500, 1 / 5, x)
  const y: number = project(0, 0, -1 / 1000, 1 / 5, 0, x)
  const firstIntY: number = project(0, -1 / 3000, 1 / 10, 0, 0, x)
  const secondIntY: number = project(-1 / 12000, 1 / 30, 0, 0, 0, x)

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

parabola.solveY = function solveYparabola (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  const firstIntX: number = solve(0, -1 / 3000, 1 / 10, 0, 0, y, 0, 200)
  const secondIntX: number = solve(-1 / 12000, 1 / 30, 0, 0, 0, y, 0, 200)

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

/**
 * A combination of two lines
 * Curve is defined from x = 0 to x = 100
 * Peak and curve transtion are at x = 50, and y = 600 (peak is a shared datapoints in all curves)
 */

export function pyramid (): curveSimulator {
}

pyramid.projectX = function projectXpyramid (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 51) {
    secondDerivY = project(0, 0, 0, 0, 0, x)
    firstDerivY = project(0, 0, 0, 0, 12, x)
    y = project(0, 0, 0, 12, 0, x)
    firstIntY = project(0, 0, 6, 0, 0, x)
    secondIntY = project(0, 2, 0, 0, 0, x)
  } else {
    secondDerivY = project(0, 0, 0, 0, 0, x)
    firstDerivY = project(0, 0, 0, 0, -12, x)
    y = project(0, 0, 0, -12, 1200, x)
    firstIntY = project(0, 0, -6, 1200, -30000, x)
    secondIntY = project(0, -2, 600, -30000, 500000, x)
  }

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

pyramid.solveY = function solveYpyramid (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  let firstIntX: number
  if (y <= 15000) {
    firstIntX = solve(0, 0, 6, 0, 0, y, 0, 50)
  } else {
    firstIntX = solve(0, 0, -6, 1200, -30000, y, 50, 100)
  }

  let secondIntX: number
  if (y <= 250000) {
    secondIntX = solve(0, 2, 0, 0, 0, y, 0, 50)
  } else {
    secondIntX = solve(0, -2, 600, -30000, 500000, y, 50, 100)
  }

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

/**
 * Two consequtive basic parabolas
 * Curve is defined from x = 0 to x = 200
 * Peaks are at x = 50 and x = 150, with y = 600
 * Shared datapoint is at x = 100, with y = 0
 */
export function camel (): curveSimulator {
}

camel.projectX = function projectXcamel (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 101) {
    secondDerivY = project(0, 0, 0, 0, -12 / 25, x)
    firstDerivY = project(0, 0, 0, -12 / 25, 24, x)
    y = project(0, 0, -6 / 25, 24, 0, x)
    firstIntY = project(0, -2 / 25, 12, 0, 0, x)
    secondIntY = project(-1 / 50, 4, 0, 0, 0, x)
  } else {
    secondDerivY = project(0, 0, 0, 0, -12 / 25, x)
    firstDerivY = project(0, 0, 0, -12 / 25, 72, x)
    y = project(0, 0, -6 / 25, 72, -4800, x)
    firstIntY = project(0, -2 / 25, 36, -4800, 240000, x)
    secondIntY = project(-1 / 50, 12, -2400, 240000, -8000000, x)
  }

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

camel.solveY = function solveYcamel (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  // firstIntegral:
  //  x < 101:  F1(x) = (-2/25)x^3 + 12x^2
  //  x â‰¥ 101:  F2(x) = (-2/25)x^3 + 36x^2 - 4800x + 240000
  //  F1(100) = F2(100) = 40000
  let firstIntX: number
  if (y <= 40000) {
    firstIntX = solve(0, -2 / 25, 12, 0, 0, y, 0, 100)
  } else {
    firstIntX = solve(0, -2 / 25, 36, -4800, 240000, y, 100, 200)
  }

  // secondIntegral:
  //  x < 101:  G1(x) = (-1/50)x^4 + 4x^3
  //  x â‰¥ 101:  G2(x) = (-1/50)x^4 + 12x^3 - 2400x^2 + 240000x - 8000000
  //  G1(100) = G2(100) = 2000000
  let secondIntX: number
  if (y <= 2000000) {
    secondIntX = solve(-1 / 50, 4, 0, 0, 0, y, 0, 100)
  } else {
    secondIntX = solve(-1 / 50, 12, -2400, 240000, -8000000, y, 100, 200)
  }

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

/**
 * Two partially overlapping parabolas
 * Curve is defined from x = 0 to x = 200
 * Peak is at x = 90 with y = 600
 * Shared datapoint is x = 138, y = (1288/3)
 */
export function dromedaryLeft (): curveSimulator {
}

dromedaryLeft.projectX = function projectXdromedaryLeft (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x <= 138) {
    secondDerivY = project(0, 0, 0, 0, -4 / 27, x)
    firstDerivY = project(0, 0, 0, -4 / 27, 40 / 3, x)
    y = project(0, 0, -2 / 27, 40 / 3, 0, x)
    firstIntY = project(0, -2 / 81, 20 / 3, 0, 0, x)
    secondIntY = project(-1 / 162, 20 / 9, 0, 0, 0, x)
  } else {
    secondDerivY = project(0, 0, 0, 0, -2539 / 4092, x)
    firstDerivY = project(0, 0, 0, -2539 / 4092, 133585 / 1364, x)
    y = project(0, 0, -2539 / 8184, 133585 / 1364, -7342750 / 1023, x)
    firstIntY = project(0, -2539 / 24552, 133585 / 2728, -7342750 / 1023, 391815.510752688, x)
    secondIntY = project(-2539 / 98208, 133585 / 8184, -3671375 / 1023, 391815.510752688, -15644317.8958944, x)
  }

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

dromedaryLeft.solveY = function solveYdromedaryLeft (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  // firstIntegral:
  //  x < 139:  F1(x) = (-2/81)x^3 + (20/3)x^2
  //  x â‰¥ 139:  F2(x) = (-2539/24552)x^3 + (133585/2728)x^2 - (7342750/1023)x + 391815.510752688
  //  F1(139) = F2(139)  (use this as the split in Y)
  const ySplitFirst = project(0, -2 / 81, 20 / 3, 0, 0, 139)

  let firstIntX: number
  if (y <= ySplitFirst) {
    // left branch, full domain up to 139
    firstIntX = solve(0, -2 / 81, 20 / 3, 0, 0, y, 0, 139)
  } else {
    // right branch, from 139 upwards
    firstIntX = solve(0, -2539 / 24552, 133585 / 2728, -7342750 / 1023, 391815.510752688, y, 139, 200)
  }

  // secondIntegral:
  //  x < 139:  G1(x) = (-1/162)x^4 + (20/9)x^3
  //  x â‰¥ 139:  G2(x) = (-2539/98208)x^4 + (133585/8184)x^3 - (3671375/1023)x^2
  //                     + 391815.510752688x - 15644317.8958944
  //  G1(139) = G2(139)  (use this as the split in Y)
  const ySplitSecond = project(-1 / 162, 20 / 9, 0, 0, 0, 139)

  let secondIntX: number
  if (y <= ySplitSecond) {
    // left branch, full domain up to 139
    secondIntX = solve(-1 / 162, 20 / 9, 0, 0, 0, y, 0, 139)
  } else {
    // right branch, from 139 upwards
    secondIntX = solve(-2539 / 98208, 133585 / 8184, -3671375 / 1023, 391815.510752688, -15644317.8958944, y, 139, 200)
  }

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

/**
 * Two partially overlapping parabolas
 * Curve is defined from x = 0 to x = 200
 * Peak is at x = 90 with y = 600
 * Shared datapoint is x = 75, y = 375
 */
export function dromedaryRight (): curveSimulator {
}

dromedaryRight.projectX = function projectXdromedaryRight (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 76) {
    secondDerivY = project(0, 0, 0, 0, -2 / 5, x)
    firstDerivY = project(0, 0, 0, -2 / 5, 20, x)
    y = project(0, 0, -1 / 5, 20, 0, x)
    firstIntY = project(0, -1 / 15, 10, 0, 0, x)
    secondIntY = project(-1 / 60, 10 / 3, 0, 0, 0, x)
  } else {
    secondDerivY = project(0, 0, 0, 0, -1 / 5, x)
    firstDerivY = project(0, 0, 0, -1 / 5, 49 / 2, x)
    y = project(0, 0, -1 / 10, 49 / 2, -900, x)
    firstIntY = project(0, -1 / 30, 49 / 4, -900, 163125 / 4, x)
    secondIntY = project(-1 / 120, 49 / 12, -450, 163125 / 4, -8859375 / 8, x)
  }

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

dromedaryRight.solveY = function solveYdromedaryRight (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  // firstIntegral:
  //  x < 76:  F1(x) = (-1/15)x^3 + 10x^2
  //  x â‰¥ 76:  F2(x) = (-1/30)x^3 + (49/4)x^2 - 900x + 163125/4
  //  F1(75) = F2(75) = 28125
  let firstIntX: number
  if (y <= 28125) {
    firstIntX = solve(0, -1 / 15, 10, 0, 0, y, 0, 75)
  } else {
    firstIntX = solve(0, -1 / 30, 49 / 4, -900, 163125 / 4, y, 75, 200)
  }

  // secondIntegral:
  //  x < 76:  G1(x) = (-1/60)x^4 + (10/3)x^3
  //  x â‰¥ 76:  G2(x) = (-1/120)x^4 + (49/12)x^3 - 450x^2 + (163125/4)x - 8859375/8
  //  G1(75) = G2(75) = 3515625/4
  let secondIntX: number
  if (y <= (3515625 / 4)) {
    secondIntX = solve(-1 / 60, 10 / 3, 0, 0, 0, y, 0, 75)
  } else {
    secondIntX = solve(-1 / 120, 49 / 12, -450, 163125 / 4, -8859375 / 8, y, 75, 200)
  }

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

/**
 * Three parabola's stacked on top of each other (essentally extending the Camel)
 * Curve is defined from x = 0 to x = 200
 * Peak is at x = 100, y = 1000
 * - Shared datapoint between curve 1 and 2 is x = 60, y = 576
 * - Shared datapoint between curve 2 and 3 is x = 140, y = 576
 */
export function alps (): curveSimulator {
}

alps.projectX = function projectXalps (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  switch (true) {
    case (x < 61):
      secondDerivY = project(0, 0, 0, 0, -12 / 25, x)
      firstDerivY = project(0, 0, 0, -12 / 25, 24, x)
      y = project(0, 0, -6 / 25, 24, 0, x)
      firstIntY = project(0, -2 / 25, 12, 0, 0, x)
      secondIntY = project(-1 / 50, 4, 0, 0, 0, x)
      break
    case (x < 141):
      secondDerivY = project(0, 0, 0, 0, -53 / 100, x)
      firstDerivY = project(0, 0, 0, -53 / 100, 53, x)
      y = project(0, 0, -53 / 200, 53, -1650, x)
      firstIntY = project(0, -53 / 600, 53 / 2, -1650, 48600, x)
      secondIntY = project(-53 / 2400, 53 / 6, -825, 48600, -963000, x)
      break
    default:
      secondDerivY = project(0, 0, 0, 0, -12 / 25, x)
      firstDerivY = project(0, 0, 0, -12 / 25, 72, x)
      y = project(0, 0, -6 / 25, 72, -4800, x)
      firstIntY = project(0, -2 / 25, 36, -4800, 841600 / 3, x)
      secondIntY = project(-1 / 50, 12, -2400, 841600 / 3, -36160000 / 3, x)
      break
  }

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

alps.solveY = function solveYalps (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  // firstIntegral:
  //  x < 61:   F1(x) = (-2/25)x^3 + 12x^2
  //  61â‰¤x<141: F2(x) = (-53/600)x^3 + (53/2)x^2 - 1650x + 48600
  //  x â‰¥ 141:  F3(x) = (-2/25)x^3 + 36x^2 - 4800x + 841600/3
  //  F1(60) = F2(60) = 25920
  //  F2(140) = F3(140) = 283840/3
  let firstIntX: number
  switch (true) {
    case (y <= 25920):
      firstIntX = solve(0, -2 / 25, 12, 0, 0, y, 0, 60)
      break
    case (y < (283840 / 3)):
      firstIntX = solve(0, -53 / 600, 53 / 2, -1650, 48600, y, 60, 140)
      break
    default:
      firstIntX = solve(0, -2 / 25, 36, -4800, 841600 / 3, y, 140, 200)
  }

  // secondIntegral:
  //  x < 61:   G1(x) = (-1/50)x^4 + 4x^3
  //  61â‰¤x<141: G2(x) = (-53/2400)x^4 + (53/6)x^3 - 825x^2 + 48600x - 963000
  //  x â‰¥ 141:  G3(x) = (-1/50)x^4 + 12x^3 - 2400x^2 + (841600/3)x - 36160000/3
  //  G1(60) = G2(60) = 604800
  //  G2(140) = G3(140) = 5415800
  let secondIntX: number
  switch (true) {
    case (y <= 604800):
      secondIntX = solve(-1 / 50, 4, 0, 0, 0, y, 0, 60)
      break
    case (y < 5415800):
      secondIntX = solve(-53 / 2400, 53 / 6, -825, 48600, -963000, y, 60, 140)
      break
    default:
      secondIntX = solve(-1 / 50, 12, -2400, 841600 / 3, -36160000 / 3, y, 140, 200)
  }

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

/**
 * A half parabola, followed by  straight line
 * Curve is defined from x = 0 to x = 200
 * Peaks is at x = 100, y = 600
 * Shared datapoint is at x = 100, with y = 600
 */
export function artificialStroke (): curveSimulator {
}

artificialStroke.projectX = function projectXartificialStroke (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 101) {
    secondDerivY = project(0, 0, 0, 0, -6 / 50, x)
    firstDerivY = project(0, 0, 0, -6 / 50, 12, x)
    y = project(0, 0, -3 / 50, 12, 0, x)
    firstIntY = project(0, -1 / 50, 6, 0, 0, x)
    secondIntY = project(-1 / 200, 2, 0, 0, 0, x)
  } else {
    secondDerivY = project(0, 0, 0, 0, 0, x)
    firstDerivY = project(0, 0, 0, 0, -6, x)
    y = project(0, 0, 0, -6, 1200, x)
    firstIntY = project(0, 0, -3, 1200, -50000, x)
    secondIntY = project(0, -1, 600, -50000, 1500000, x)
  }

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

artificialStroke.solveY = function solveYartificialStroke (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  // firstIntegral:
  //  x < 101:  F1(x) = (-1/50)x^3 + 6x^2
  //  x â‰¥ 101:  F2(x) = -3x^2 + 1200x - 50000
  //  F1(100) = F2(100) = 40000
  let firstIntX: number
  if (y <= 40000) {
    firstIntX = solve(0, -1 / 50, 6, 0, 0, y, 0, 100)
  } else {
    firstIntX = solve(0, 0, -3, 1200, -50000, y, 100, 200)
  }

  // secondIntegral:
  //  x < 101:  G1(x) = (-1/200)x^4 + 2x^3
  //  x â‰¥ 101:  G2(x) = -x^3 + 600x^2 - 50000x + 1500000
  //  G1(100) = G2(100) = 1500000
  let secondIntX: number
  if (y <= 1500000) {
    secondIntX = solve(-1 / 200, 2, 0, 0, 0, y, 0, 100)
  } else {
    secondIntX = solve(0, -1, 600, -50000, 1500000, y, 100, 200)
  }

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

/**
 * Regression model based on sample of the clean simulator
 * Domain: 0 to 0.73 seconds
 */
export function cleanSimulatorDrive (): curveSimulator {
}

cleanSimulatorDrive.projectX = function projectXcleanSimulator (x: Readonly<number>): curveFunctionResult {
  const secondDerivY: number = project(0, 0, 0, 0, -1032, x)
  const firstDerivY: number = project(0, 0, 0, -1032, 378, x)
  const y: number = project(0, 0, -516, 378, 0, x)
  const firstIntY: number = project(0, -172, 189, 0, 97.5, x)
  const secondIntY: number = project(-43, 63, 0, 97.5, 0, x)

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

cleanSimulatorDrive.solveY = function solveYcleanSimulator (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  //  const firstIntX: number = solve(0, -172, 189, 0, 97.5, y, -0.0049, 0.8)
  const firstIntX: number = solve(0, -172, 189, 0, 97.5, y, -0.0001, 0.8)
  const secondIntX: number = solve(-43, 63, 0, 97.5, 0, y, 0, 1)

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

/**
 * Regression model based on sample of the clean simulator
 * Domain: 0 to 2.2 seconds
 */
export function cleanSimulatorRecovery (): curveSimulator {
}

cleanSimulatorRecovery.projectX = function projectXcleanSimulatorRecovery (x: Readonly<number>): curveFunctionResult {
  const secondDerivY: number = project(0, 0, 0, 0, -1.44, x)
  const firstDerivY: number = project(0, 0, 0, -1.44, 5.52, x)
  const y: number = project(0, 0, -0.72, 5.52, -19.95, x)
  const firstIntY: number = project(0, -0.24, 2.76, -19.95, 129.75, x)
  const secondIntY: number = project(-0.06, 0.92, -9.975, 129.75, 0, x)

  return {
    secondDerivative: { x, y: secondDerivY },
    firstDerivative: { x, y: firstDerivY },
    plain: { x, y },
    firstIntegral: { x, y: firstIntY },
    secondIntegral: { x, y: secondIntY }
  }
}

cleanSimulatorRecovery.solveY = function solveYcleanSimulatorRecovery (y: Readonly<number>): curveFunctionResult {
  if (y === undefined || isNaN(y) || y < 0) { return undefined }

  const firstIntX: number = solve(0, -0.24, 2.76, -19.95, 129.75, y, -0.01, 2.2)
  const secondIntX: number = solve(-0.06, 0.92, -9.975, 129.75, 0, y, 0, 2.2)

  return {
    secondDerivative: { x: undefined, y },
    firstDerivative: { x: undefined, y },
    plain: { x: undefined, y },
    firstIntegral: { x: firstIntX, y },
    secondIntegral: { x: secondIntX, y }
  }
}

export function fuzzing (): fuzzingFunctions {
}

fuzzing.noNoise = function noFuzzing (): fuzzingFunction {
}

fuzzing.randomNoise = function randomFuzzing (): fuzzingFunction {
}

fuzzing.systematicNoise = function systematicFuzzing (): fuzzingFunction {
}

fuzzing.systematicPlusRandomNoise = function systematicPlusRandomFuzzing (): fuzzingFunction {
}

/**
 * None Fuzzing function, adding no noise at all
 */
fuzzing.noNoise.X = function noneXFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  return {
    x: inputTupple.x,
    y: inputTupple.y
  }
}

fuzzing.noNoise.X = function noneYFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  return {
    x: inputTupple.x,
    y: inputTupple.y
  }
}

fuzzing.noNoise.currentDt = function noneCurrentDtFuzzing (datapointnumber: Readonly<number>, inputValue: Readonly<number>): number {
  return inputValue
}

/**
 * Fuzzing function, adding random noise to the x coordinates (typically time)
 * Maximum noise between 0.99975 and 1.00025 (so +/-0.025%), which seems the maximum before stuff starts to misbehave with our basic curves
 */
fuzzing.randomNoise.X = function randomXFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  const maxNoiseLevel: number = 0.0005
  const noiseVector: number[] = [0.362983358, 0.902896489, 0.195344252, 0.191309386, 0.736501025, 0.574923769, 0.678981554, 0.593413437, 0.33778425, 0.614321004, 0.11326172, 0.723371145, 0.43558542, 0.011992049, 0.913996445, 0.374276223, 0.713016154, 0.856803369, 0.344422239, 0.792627396, 0.144031064, 0.000106465, 0.216884612, 0.579060805, 0.707127774, 0.62039499, 0.573938716, 0.118905112, 0.140309774, 0.890857353, 0.3045947, 0.455922878, 0.539650891, 0.696400456, 0.631535821, 0.43863799, 0.716106011, 0.057274705, 0.487315805, 0.543589339, 0.651457884, 0.478043557, 0.673418293, 0.579425411, 0.344787352, 0.637331257, 0.620442629, 0.337341089, 0.127770611, 0.873241783, 0.302428492, 0.618533511, 0.146278373, 0.992357621, 0.021143278, 0.652834146, 0.850446503, 0.96763327, 0.171495787, 0.067086148, 0.126048085, 0.392876801, 0.481635464, 0.496808532, 0.75088968, 0.640720152, 0.252829348, 0.475315871, 0.487929901, 0.878802548, 0.169031209, 0.775708512, 0.782393113, 0.054553823, 0.792227725, 0.298634223, 0.112782097, 0.75732495, 0.852059951, 0.255772567, 0.658055404, 0.687396323, 0.144175617, 0.472735884, 0.792772287, 0.78732956, 0.675745635, 0.984115497, 0.981068176, 0.895400418, 0.976099858, 0.806882916, 0.179217502, 0.644991762, 0.023241968, 0.338141824, 0.764955944, 0.243711021, 0.262124759, 0.275138547, 0.426470026, 0.90353044, 0.938974817, 0.896970947, 0.340240997, 0.193329066, 0.563078515, 0.144400878, 0.596341162, 0.025370292, 0.542794913, 0.724600256, 0.18701935, 0.134240648, 0.460929134, 0.158915534, 0.334504504, 0.131729969, 0.173066402, 0.541094597, 0.011735444, 0.769915639, 0.988328633, 0.192912171, 0.583446718, 0.585939006, 0.779331413, 0.292934888, 0.550694634, 0.967938884, 0.476899836, 0.969116934, 0.312248856, 0.577913356, 0.101094981, 0.253867678, 0.167910262, 0.045804364, 0.286601277, 0.1044386, 0.281578512, 0.552648542, 0.218595901, 0.361034531, 0.386424148, 0.732405762, 0.842441079, 0.808704801, 0.987198908, 0.567754243, 0.58135886, 0.060248792, 0.857424889, 0.262499387, 0.542997437, 0.951833958, 0.213962481, 0.415178053, 0.507222186, 0.675799333, 0.401518955, 0.739986828, 0.821932361, 0.477800077, 0.596611138, 0.284780314, 0.464645421, 0.30989232, 0.253516253, 0.888072303, 0.955062399, 0.328091806, 0.808854395, 0.107733438, 0.993440704, 0.181659007, 0.77047131, 0.832626567, 0.833690049, 0.229227539, 0.367808547, 0.853840116, 0.345695299, 0.16400746, 0.713146352, 0.442394906, 0.768502671, 0.571540503, 0.564692492, 0.863232764, 0.217365739, 0.439635916, 0.619812114, 0.216397699, 0.879572123, 0.585654277, 0.634554473, 0.203350806, 0.943951474, 0.143816024]
  const noise = 0.99975 + (maxNoiseLevel * noiseVector[datapointnumber % 200])

  return {
    x: (inputTupple.x * noise),
    y: inputTupple.y
  }
}

/**
 * Fuzzing function, adding random noise to the y coordinates (typically distance)
 * Maximum noise between 0.99975 and 1.00025 (so +/-0.025%), which seems the maximum before stuff starts to misbehave with our basic curves
 */
fuzzing.randomNoise.Y = function randomYFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  const maxNoiseLevel: number = 0.0005
  const noiseVector: number[] = [0.362983358, 0.902896489, 0.195344252, 0.191309386, 0.736501025, 0.574923769, 0.678981554, 0.593413437, 0.33778425, 0.614321004, 0.11326172, 0.723371145, 0.43558542, 0.011992049, 0.913996445, 0.374276223, 0.713016154, 0.856803369, 0.344422239, 0.792627396, 0.144031064, 0.000106465, 0.216884612, 0.579060805, 0.707127774, 0.62039499, 0.573938716, 0.118905112, 0.140309774, 0.890857353, 0.3045947, 0.455922878, 0.539650891, 0.696400456, 0.631535821, 0.43863799, 0.716106011, 0.057274705, 0.487315805, 0.543589339, 0.651457884, 0.478043557, 0.673418293, 0.579425411, 0.344787352, 0.637331257, 0.620442629, 0.337341089, 0.127770611, 0.873241783, 0.302428492, 0.618533511, 0.146278373, 0.992357621, 0.021143278, 0.652834146, 0.850446503, 0.96763327, 0.171495787, 0.067086148, 0.126048085, 0.392876801, 0.481635464, 0.496808532, 0.75088968, 0.640720152, 0.252829348, 0.475315871, 0.487929901, 0.878802548, 0.169031209, 0.775708512, 0.782393113, 0.054553823, 0.792227725, 0.298634223, 0.112782097, 0.75732495, 0.852059951, 0.255772567, 0.658055404, 0.687396323, 0.144175617, 0.472735884, 0.792772287, 0.78732956, 0.675745635, 0.984115497, 0.981068176, 0.895400418, 0.976099858, 0.806882916, 0.179217502, 0.644991762, 0.023241968, 0.338141824, 0.764955944, 0.243711021, 0.262124759, 0.275138547, 0.426470026, 0.90353044, 0.938974817, 0.896970947, 0.340240997, 0.193329066, 0.563078515, 0.144400878, 0.596341162, 0.025370292, 0.542794913, 0.724600256, 0.18701935, 0.134240648, 0.460929134, 0.158915534, 0.334504504, 0.131729969, 0.173066402, 0.541094597, 0.011735444, 0.769915639, 0.988328633, 0.192912171, 0.583446718, 0.585939006, 0.779331413, 0.292934888, 0.550694634, 0.967938884, 0.476899836, 0.969116934, 0.312248856, 0.577913356, 0.101094981, 0.253867678, 0.167910262, 0.045804364, 0.286601277, 0.1044386, 0.281578512, 0.552648542, 0.218595901, 0.361034531, 0.386424148, 0.732405762, 0.842441079, 0.808704801, 0.987198908, 0.567754243, 0.58135886, 0.060248792, 0.857424889, 0.262499387, 0.542997437, 0.951833958, 0.213962481, 0.415178053, 0.507222186, 0.675799333, 0.401518955, 0.739986828, 0.821932361, 0.477800077, 0.596611138, 0.284780314, 0.464645421, 0.30989232, 0.253516253, 0.888072303, 0.955062399, 0.328091806, 0.808854395, 0.107733438, 0.993440704, 0.181659007, 0.77047131, 0.832626567, 0.833690049, 0.229227539, 0.367808547, 0.853840116, 0.345695299, 0.16400746, 0.713146352, 0.442394906, 0.768502671, 0.571540503, 0.564692492, 0.863232764, 0.217365739, 0.439635916, 0.619812114, 0.216397699, 0.879572123, 0.585654277, 0.634554473, 0.203350806, 0.943951474, 0.143816024]
  const noise = 0.99975 + (maxNoiseLevel * noiseVector[datapointnumber % 200])
  return {
    x: inputTupple.x,
    y: (inputTupple.y * noise)
  }
}

/**
 * Fuzzing function, adding random noise to the x coordinates (typically time)
 * Maximum noise between 0.99975 and 1.00025 (so +/-0.025%), which seems the maximum before stuff starts to misbehave with our basic curves
 */
fuzzing.randomNoise.currentDt = function randomCurrentDtFuzzing (datapointnumber: Readonly<number>, inputValue: Readonly<number>): number {
  const maxNoiseLevel: number = 0.0005
  const noiseVector: number[] = [0.362983358, 0.902896489, 0.195344252, 0.191309386, 0.736501025, 0.574923769, 0.678981554, 0.593413437, 0.33778425, 0.614321004, 0.11326172, 0.723371145, 0.43558542, 0.011992049, 0.913996445, 0.374276223, 0.713016154, 0.856803369, 0.344422239, 0.792627396, 0.144031064, 0.000106465, 0.216884612, 0.579060805, 0.707127774, 0.62039499, 0.573938716, 0.118905112, 0.140309774, 0.890857353, 0.3045947, 0.455922878, 0.539650891, 0.696400456, 0.631535821, 0.43863799, 0.716106011, 0.057274705, 0.487315805, 0.543589339, 0.651457884, 0.478043557, 0.673418293, 0.579425411, 0.344787352, 0.637331257, 0.620442629, 0.337341089, 0.127770611, 0.873241783, 0.302428492, 0.618533511, 0.146278373, 0.992357621, 0.021143278, 0.652834146, 0.850446503, 0.96763327, 0.171495787, 0.067086148, 0.126048085, 0.392876801, 0.481635464, 0.496808532, 0.75088968, 0.640720152, 0.252829348, 0.475315871, 0.487929901, 0.878802548, 0.169031209, 0.775708512, 0.782393113, 0.054553823, 0.792227725, 0.298634223, 0.112782097, 0.75732495, 0.852059951, 0.255772567, 0.658055404, 0.687396323, 0.144175617, 0.472735884, 0.792772287, 0.78732956, 0.675745635, 0.984115497, 0.981068176, 0.895400418, 0.976099858, 0.806882916, 0.179217502, 0.644991762, 0.023241968, 0.338141824, 0.764955944, 0.243711021, 0.262124759, 0.275138547, 0.426470026, 0.90353044, 0.938974817, 0.896970947, 0.340240997, 0.193329066, 0.563078515, 0.144400878, 0.596341162, 0.025370292, 0.542794913, 0.724600256, 0.18701935, 0.134240648, 0.460929134, 0.158915534, 0.334504504, 0.131729969, 0.173066402, 0.541094597, 0.011735444, 0.769915639, 0.988328633, 0.192912171, 0.583446718, 0.585939006, 0.779331413, 0.292934888, 0.550694634, 0.967938884, 0.476899836, 0.969116934, 0.312248856, 0.577913356, 0.101094981, 0.253867678, 0.167910262, 0.045804364, 0.286601277, 0.1044386, 0.281578512, 0.552648542, 0.218595901, 0.361034531, 0.386424148, 0.732405762, 0.842441079, 0.808704801, 0.987198908, 0.567754243, 0.58135886, 0.060248792, 0.857424889, 0.262499387, 0.542997437, 0.951833958, 0.213962481, 0.415178053, 0.507222186, 0.675799333, 0.401518955, 0.739986828, 0.821932361, 0.477800077, 0.596611138, 0.284780314, 0.464645421, 0.30989232, 0.253516253, 0.888072303, 0.955062399, 0.328091806, 0.808854395, 0.107733438, 0.993440704, 0.181659007, 0.77047131, 0.832626567, 0.833690049, 0.229227539, 0.367808547, 0.853840116, 0.345695299, 0.16400746, 0.713146352, 0.442394906, 0.768502671, 0.571540503, 0.564692492, 0.863232764, 0.217365739, 0.439635916, 0.619812114, 0.216397699, 0.879572123, 0.585654277, 0.634554473, 0.203350806, 0.943951474, 0.143816024]
  const noise = 0.99975 + (maxNoiseLevel * noiseVector[datapointnumber % 200])

  return (inputValue * noise)
}

fuzzing.systematicNoise.X = function systematicXFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  let result
  switch (datapointnumber % 6) {
    case 0:
      result = 1.0125 * inputTupple.x
      break
    case 1:
      result = 1.025 * inputTupple.x
      break
    case 2:
      result = 1.0125 * inputTupple.x
      break
    case 3:
      result = 0.9877 * inputTupple.x
      break
    case 4:
      result = 0.9756 * inputTupple.x
      break
    case 5:
      result = 0.9877 * inputTupple.x
      break
    // No default
  }
  return {
    x: result,
    y: inputTupple.y
  }
}

fuzzing.systematicNoise.Y = function systematicYFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  let result
  switch (datapointnumber % 6) {
    case 0:
      result = 1.0125 * inputTupple.y
      break
    case 1:
      result = 1.025 * inputTupple.y
      break
    case 2:
      result = 1.0125 * inputTupple.y
      break
    case 3:
      result = 0.9877 * inputTupple.y
      break
    case 4:
      result = 0.9756 * inputTupple.y
      break
    case 5:
      result = 0.9877 * inputTupple.y
      break
    // No default
  }
  return {
    x: inputTupple.x,
    y: result
  }
}

fuzzing.systematicNoise.currentDt = function systematicCurrentDtFuzzing (datapointnumber: Readonly<number>, inputValue: Readonly<number>): number {
  let result
  switch (datapointnumber % 6) {
    case 0:
      result = 1.0125 * inputValue
      break
    case 1:
      result = 1.025 * inputValue
      break
    case 2:
      result = 1.0125 * inputValue
      break
    case 3:
      result = 0.9877 * inputValue
      break
    case 4:
      result = 0.9756 * inputValue
      break
    case 5:
      result = 0.9877 * inputValue
      break
    // No default
  }
  return result
}

/**
 *  randomPlusSystematic Fuzzing function, adding both Random and systematic noise to the datapoints
 */
fuzzing.systematicPlusRandomNoise.X = function randomPlusSystematicXFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  return fuzzing.randomNoise.X(datapointnumber, fuzzing.systematicNoise.X(datapointnumber, inputTupple))
}

fuzzing.systematicPlusRandomNoise.Y = function randomPlusSystematicYFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  return fuzzing.randomNoise.Y(datapointnumber, fuzzing.systematicNoise.Y(datapointnumber, inputTupple))
}

fuzzing.systematicPlusRandomNoise.currentDt = function randomPlusSystematicCurrentDtFuzzing (datapointnumber: Readonly<number>, inputValue: Readonly<number>): number {
  return fuzzing.randomNoise.currentDt(datapointnumber, fuzzing.systematicNoise.currentDt(datapointnumber, inputValue))
}

/**
 * @description projects x in a * x^4 + b * x^3 + c * x^2 + d * x + e = y
 */
function project (a: Readonly<number>, b: Readonly<number>, c: Readonly<number>, d: Readonly<number>, e: Readonly<number>, x: Readonly<number>): number | null {
  if (a === undefined || b === undefined || c === undefined || d === undefined || e === undefined || x === undefined) { return [] }
  const result = (a * Math.pow(x, 4)) + (b * Math.pow(x, 3)) + (c * Math.pow(x, 2)) + (d * x) + e
  return result
}

/**
 * @description Solver for the general case a * x^4 + b * x^3 + c * x^2 + d * x + e = y
 * @returns the real solution closest to the minimum, within the domain
 */
function solve (a: Readonly<number>, b: Readonly<number>, c: Readonly<number>, d: Readonly<number>, e: Readonly<number>, y: Readonly<number>, xMin: Readonly<number> = 0, xMax: Readonly<number> = Number.POSITIVE_INFINITY): number | null {
  if (a === undefined || b === undefined || c === undefined || d === undefined || e === undefined || y === undefined) { return [] }
  let roots: number[]

  switch (true) {
    case (a !== 0): roots = solveQuartic(a, b, c, d, e, y, xMin, xMax); break
    case (b !== 0): roots = solveCubic(b, c, d, e, y); break
    case (c !== 0): roots = solveQuadratic(c, d, e, y); break
    case (d !== 0): roots = solveLinear(d, e, y); break
    default: roots = []
  }

  const real = roots
    .filter(x => Number.isFinite(x) && x >= xMin && x <= xMax)
    .filter(x => Number.isFinite(x) && x >= xMin && x <= xMax)

  if (real.length === 0) { return null }
  real.sort((u, v) => Math.abs(u) - Math.abs(v))
  return real[0]
}

/**
 * @description Solve linear function a*x + b = y
 * @param {float} a - the linear coefficient a in a*x + b = y
 * @param {float} b - the constant b in a*x + b = y
 * @param {float} y - y value to project back onto the fitted function
 */
function solveLinear (a: Readonly<number>, b: Readonly<number>, y: Readonly<number>): number[] {
  if (a === undefined || b === undefined || y === undefined) { return [] }

  if (a === 0) {
    return []
  } else {
    return [(y - b) / a]
  }
}

/**
 * @description Solves the quadratic function ax^2 + bx + c = y
 * @param {float} a - the quadratic coefficient a in ax^2 + bx + c = y
 * @param {float} b - the linear coefficient b in ax^2 + bx + c = y
 * @param {float} c - the constant c in ax^2 + bx + c = y
 * @param {float} y - y value to project back onto the fitted function
 * @returns {float[]} array of x values satisfying ax^2 + bx + c = y
 */
function solveQuadratic (a: Readonly<number>, b: Readonly<number>, c: Readonly<number>, y: Readonly<number>): number[] {
  if (a === undefined || b === undefined || c === undefined || y === undefined) { return [] }

  const discriminant: number = Math.pow(b, 2) - (4 * a * (c - y))

  // eslint-disable no-case-declarations -- We need to store a varying number of roots we insert in the array
  switch (true) {
    case (a === 0):
      // a line
      return solveLinear(b, c, y)
    case (discriminant > 0):
      const root1: number = (-b + Math.sqrt(discriminant)) / (2 * a)
      const root2: number = (-b - Math.sqrt(discriminant)) / (2 * a)
      return [root1, root2]
    case (discriminant === 0):
      const root: number = -b / (2 * a)
      return [root]
    default:
      return []
    // eslint-enable no-case-declarations
  }
}

/**
 * @description Solves the cubic function ax^3 + bx^2 + cx + d = y based on the Cardano's method
 * @see {@link https://en.wikipedia.org/wiki/Cubic_equation#Cardano's_formula|the description on Wiki
 * @param {float} a - the cubic coefficient a in ax^3 + bx^2 + cx + d = y
 * @param {float} b - the quadratic coefficient b in ax^3 + bx^2 + cx + d = y
 * @param {float} c - the linear coefficient c in ax^3 + bx^2 + cx + d = y
 * @param {float} d - the constant d in ax^3 + bx^2 + cx + d = y
 * @param {float} y - y value to project back onto the fitted function
 * @returns {float[]} array of x values satisfying ax^2 + bx + c = y
 */
function solveCubic (a: Readonly<number>, b: Readonly<number>, c: Readonly<number>, d: Readonly<number>, y: Readonly<number>): number[] {
  if (a === undefined || b === undefined || c === undefined || d === undefined || y === undefined) { return [] }
  if (a === 0) return solveQuadratic(b, c, d, y);

  // Normalize
  const a1 = b / a
  const a2 = c / a
  const a3 = (d - y) / a

  // Depressed cubic: x = t - a1/3
  const p = a2 - (a1 * a1) / 3
  const q = (2 * a1 * a1 * a1) / 27 - (a1 * a2) / 3 + a3

  const disc = (q * q) / 4 + (p * p * p) / 27
  const roots: number[] = []

  // eslint-disable no-case-declarations -- We need to store a varying number of roots we insert in the array
  switch (true) {
    case (disc > 0):
      const s1 = Math.cbrt(-q / 2 + Math.sqrt(disc))
      const s2 = Math.cbrt(-q / 2 - Math.sqrt(disc))
      roots.push(s1 + s2 - a1 / 3)
      break
    case (disc === 0):
      const s = Math.cbrt(-q / 2)
      roots.push(2 * s - a1 / 3)
      roots.push(-s - a1 / 3)
      break
    default:
      const r = Math.sqrt(-p * p * p / 27)
      const phi = Math.acos(-q / (2 * r))
      const m = 2 * Math.sqrt(-p / 3)

      roots.push(m * Math.cos(phi / 3) - a1 / 3)
      roots.push(m * Math.cos((phi + 2 * Math.PI) / 3) - a1 / 3)
      roots.push(m * Math.cos((phi + 4 * Math.PI) / 3) - a1 / 3)
  }
  // eslint-enable no-case-declarations
  return roots
}

/**
 * @description Solves the quartic function a*x^4 + b*x^3 + c*x^2 + d*x + e = y
 * on the domain [xMin, xMax], returning all real roots in that interval.
 * For monotone cases (like the parabola second integral), it uses a single
 * global bisection on [xMin, xMax]. For more complex shapes, it falls back
 * to sign scanning + local bisection.
 * @param {float} a - the cubic coefficient a in ax^4 + bx^3 + cx^2 + dx + e = y
 * @param {float} b - the cubic coefficient a in ax^4 + bx^3 + cx^2 + dx + e = y
 * @param {float} c - the quadratic coefficient b in ax^4 + bx^3 + cx^2 + dx + e = y
 * @param {float} d - the linear coefficient c in ax^4 + bx^3 + cx^2 + dx + e = y
 * @param {float} e - the constant d in ax^4 + bx^3 + cx^2 + dx + e = y
 * @param {float} y - y value to project back onto the fitted function
 * @returns {float[]} array of x values satisfying ax^2 + bx + c = y
 */
function solveQuartic (a: Readonly<number>, b: Readonly<number>, c: Readonly<number>, d: Readonly<number>, e: Readonly<number>, y: Readonly<number>, xMin: Readonly<number>, xMax: Readonly<number>, samples: number = 2000): number[] {
  if (a === undefined || b === undefined || c === undefined || d === undefined || e === undefined || y === undefined) { return [] }

  const EPS = 1e-12

  const f = (x: number): number => (a * x ** 4) + (b * x ** 3) + (c * x ** 2) + (d * x) + e - y

  const df = (x: number): number => (4 * a * x ** 3) + (3 * b * x ** 2) + (2 * c * x) + d

  const roots: number[] = []

  let fMin = f(xMin)
  let fMax = f(xMax)

  // Exact zeros at the boundaries
  if (Math.abs(fMin) < EPS) { roots.push(xMin) }
  if (Math.abs(fMax) < EPS && xMax !== xMin) { roots.push(xMax) }

  // --- 1. Monotone-friendly path: global sign change on [xMin, xMax] ---
  if (fMin * fMax < 0) {
    let lo = xMin
    let hi = xMax
    let flo = fMin
    let fhi = fMax

    // Bisection on the whole interval
    for (let it = 0; it < 80; it++) {
      const mid = 0.5 * (lo + hi)
      const fmid = f(mid)

      if (Math.abs(fmid) < EPS) {
        lo = hi = mid
        break
      }

      if (flo * fmid <= 0) {
        hi = mid
        fhi = fmid
      } else {
        lo = mid
        flo = fmid
      }
    }

    let root = 0.5 * (lo + hi)

    // Newton polish, clamped to [xMin, xMax]
    for (let it = 0; it < 20; it++) {
      const fx = f(root)
      const dfx = df(root)
      if (Math.abs(dfx) < EPS) break
      const stepN = fx / dfx
      root -= stepN
      if (root < xMin || root > xMax) { break }
      if (Math.abs(stepN) <= 1e-12 * (1 + Math.abs(root))) { break }
    }

    if (root >= xMin - 1e-9 && root <= xMax + 1e-9) {
      roots.push(root)
    }

    // In all your second-integral cases there is at most one root in [xMin, xMax],
    // so we can return here. For safety, we still deduplicate below.
  } else {
    // --- 2. Fallback: sign scanning for non-monotone shapes ---
    let xPrev = xMin
    let fPrev = fMin
    const step = (xMax - xMin) / samples

    for (let i = 1; i <= samples; i++) {
      const xCur = (i === samples) ? xMax : xMin + i * step
      const fCur = f(xCur)

      if (Math.abs(fCur) < EPS) {
        roots.push(xCur)
        xPrev = xCur
        fPrev = fCur
        continue
      }

      if (fPrev * fCur < 0) {
        let lo = xPrev
        let hi = xCur
        let flo = fPrev
        let fhi = fCur

        for (let it = 0; it < 60; it++) {
          const mid = 0.5 * (lo + hi)
          const fmid = f(mid)

          if (Math.abs(fmid) < EPS) {
            lo = hi = mid
            flo = fhi = fmid
            break
          }

          if (flo * fmid <= 0) {
            hi = mid
            fhi = fmid
          } else {
            lo = mid
            flo = fmid
          }
        }

        let root = 0.5 * (lo + hi)

        for (let it = 0; it < 20; it++) {
          const fx = f(root)
          const dfx = df(root)
          if (Math.abs(dfx) < EPS) break
          const stepN = fx / dfx
          root -= stepN
          if (root < xMin || root > xMax) { break }
          if (Math.abs(stepN) <= 1e-12 * (1 + Math.abs(root))) { break }
        }

        if (root >= xMin - 1e-9 && root <= xMax + 1e-9) {
          roots.push(root)
        }
      }

      xPrev = xCur
      fPrev = fCur
    }
  }

  // Deduplicate & sort
  roots.sort((u, v) => u - v)
  const uniq: number[] = []
  for (const r of roots) {
    if (uniq.length === 0 || Math.abs(r - uniq[uniq.length - 1]) > 1e-7) {
      uniq.push(r)
    }
  }

  return uniq
}
