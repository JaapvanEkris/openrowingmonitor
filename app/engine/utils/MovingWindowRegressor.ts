'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This implements a Moving Regression Algorithm to obtain coefficients, first (angular velocity) and
 * second derivative (angular acceleration) at the front of the flank
 */
import { createTSQuadraticSeries } from './TSQuadraticSeries.ts'
import { createWeighedSeries } from './WeighedSeries.ts'
import { createGaussianWeightFunction } from './Gaussian.ts'

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface MovingRegressor {
  push(x: Readonly<number>, y: Readonly<number>, w?: Readonly<number>): void
  X: { get(position?: Readonly<number>): number | undefined }
  Y: { get(position?: Readonly<number>): number | undefined }
  coefficientA(position?: Readonly<number>): number | undefined
  coefficientB(position?: Readonly<number>): number | undefined
  coefficientC(position?: Readonly<number>): number | undefined
  firstDerivative(position?: Readonly<number>): number | undefined
  secondDerivative(position?: Readonly<number>): number | undefined
  projectX(position: Readonly<number>, x: Readonly<number>): number
  projectY(position: Readonly<number>, y: Readonly<number>): number[]
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * @param bandwidth - the size of the regression interval in datapoints
 */
export function createMovingRegressor (bandwidth: Readonly<number>): MovingRegressor {
  const flankLength: number = bandwidth
  const quadraticTheilSenRegressor: TSQuadraticSeries = createTSQuadraticSeries(flankLength)
  const gaussianWeight: GaussianWeight = createGaussianWeightFunction()
  let aMatrix: Array<WeighedSeries | null> = []
  let bMatrix: Array<WeighedSeries | null> = []
  let cMatrix: Array<WeighedSeries | null> = []

  /**
   * @param {float} x - the x value of the datapoint
   * @param {float} y - the y value of the datapoint
   * @param {float} w - optional weight (default = 1)
   */
  function push (x: Readonly<number>, y: Readonly<number>, w: Readonly<number> = 1): void {
    if (x === undefined || isNaN(x) || y === undefined || isNaN(y) || w === undefined || isNaN(w)) { return }
    quadraticTheilSenRegressor.push(x, y, w)

    // Shift the matrices to make room for a new datapoint
    if (aMatrix.length >= flankLength) {
      aMatrix[0]!.reset()
      aMatrix[0] = null
      aMatrix.shift()
      bMatrix[0]!.reset()
      bMatrix[0] = null
      bMatrix.shift()
      cMatrix[0]!.reset()
      cMatrix[0] = null
      cMatrix.shift()
    }

    // Append a new WeighedSeries slot for this datapoint
    // Note: a weighed median would work here, but results in much less fluid force curves
    aMatrix[aMatrix.length] = createWeighedSeries(flankLength, 0)
    bMatrix[bMatrix.length] = createWeighedSeries(flankLength, 0)
    cMatrix[cMatrix.length] = createWeighedSeries(flankLength, 0)

    gaussianWeight.setWindowWidth(quadraticTheilSenRegressor.X.atSeriesBegin(), quadraticTheilSenRegressor.X.atSeriesEnd())

    // Calculate and store the first and second derivatives for each datapoint
    if (quadraticTheilSenRegressor.reliable()) {
      const coeffA = quadraticTheilSenRegressor.coefficientA()
      const coeffB = quadraticTheilSenRegressor.coefficientB()
      const coeffC = quadraticTheilSenRegressor.coefficientC()
      const GoF = quadraticTheilSenRegressor.goodnessOfFit()
      if (coeffA !== undefined && coeffB !== undefined && coeffC !== undefined && GoF !== undefined) {
        let i: number = 0
        let weight: number = 0
        while (i < aMatrix.length) {
          weight = quadraticTheilSenRegressor.goodnessOfFit() * quadraticTheilSenRegressor.localGoodnessOfFit(i) * gaussianWeight.weight(quadraticTheilSenRegressor.X.get(i))
          aMatrix[i]!.push(coeffA, weight)
          bMatrix[i]!.push(coeffB, weight)
          cMatrix[i]!.push(coeffC, weight)
          i++
        }
      }
    }
  }

  /**
   * @param {integer} position - position in the flank (default = 0)
   * @returns {float} coefficient a of y = axÂ² + bx + c
   */
  function coefficientA (position: Readonly<number> = 0): number | undefined {
    if (aMatrix.length === flankLength && position < aMatrix.length && aMatrix[position].reliableWeighted()) {
      return aMatrix[position]!.weighedAverage()
    }
    return undefined
  }

  /**
   * @param {integer} position - position in the flank (default = 0)
   * @returns {float} coefficient b of y = axÂ² + bx + c
   */
  function coefficientB (position: Readonly<number> = 0): number | undefined {
    if (bMatrix.length === flankLength && position < aMatrix.length && bMatrix[position].reliableWeighted()) {
      return bMatrix[position]!.weighedAverage()
    }
    return undefined
  }

  /**
   * @param {integer} position - position in the flank (default = 0)
   * @returns {float} coefficient c of y = ax^2 + bx + c
   */
  function coefficientC (position: Readonly<number> = 0): number | undefined {
    if (cMatrix.length === flankLength && position < aMatrix.length && cMatrix[position].reliableWeighted()) {
      return cMatrix[position]!.weighedAverage()
    }
    return undefined
  }

  /**
   * @param {integer} position - position in the flank (default = 0)
   * @returns {float} first derivative of y = ax^2 + bx + c at the stored x
   */
  function firstDerivative (position: Readonly<number> = 0): number | undefined {
    if (aMatrix.length === flankLength && position < aMatrix.length && aMatrix[position].reliableWeighted() && bMatrix[position].reliableWeighted()) {
      return (aMatrix[position]!.weighedAverage() * 2 * quadraticTheilSenRegressor.X.get(position)) + bMatrix[position]!.weighedAverage()
    }
    return undefined
  }

  /**
   * @param {integer} position - position in the flank (default = 0)
   * @returns {float} second derivative of y = ax^2 + bx + c (= 2a)
   */
  function secondDerivative (position: Readonly<number> = 0): number | undefined {
    if (aMatrix.length === flankLength && position < aMatrix.length && aMatrix[position].reliableWeighted()) {
      return aMatrix[position]!.weighedAverage() * 2
    }
    return undefined
  }

  /**
   * @param {integer} position - position in the flank
   * @param {float} x - x value to project onto the fitted function
   * @returns {float} y = ax^2 + bx + c evaluated at x
   */
  function projectX (position: Readonly<number>, x: Readonly<number>): number {
    if (aMatrix[position]!.length() >= 3 && aMatrix[position].reliableWeighted() && bMatrix[position].reliableWeighted() && cMatrix[position].reliableWeighted()) {
      return (aMatrix[position]!.weighedAverage() * Math.pow(x, 2)) + (bMatrix[position]!.weighedAverage() * x) + cMatrix[position]!.weighedAverage()
    }
    return undefined
  }

  /**
   * @param {integer} position - position in the flank
   * @param {float} y - y value to project back onto the fitted function
   * @returns {float[]} array of x values satisfying ax^2 + bx + c = y
   */
  function projectY (position: Readonly<number>, y: Readonly<number>): number[] {
    const a: number = aMatrix[position]!.weighedAverage()
    const b: number = bMatrix[position]!.weighedAverage()
    const c: number = cMatrix[position]!.weighedAverage()

    if (a === undefined || b === undefined || c === undefined) { return undefined }

    const discriminant: number = Math.pow(b, 2) - (4 * a * (c - y))

    switch (true) {
      case (a === 0 && b === 0):
        // Horizontal flat line: return the original x observation
        return [quadraticTheilSenRegressor.X.get(position)]
      case (a === 0): {
        // Tilted line: avoid division by zero
        const projection: number = (y - c) / b
        return [projection]
      }
      case (discriminant > 0): {
        const root1: number = (-b + Math.sqrt(discriminant)) / (2 * a)
        const root2: number = (-b - Math.sqrt(discriminant)) / (2 * a)
        return [root1, root2]
      }
      case (discriminant === 0): {
        const root: number = -b / (2 * a)
        return [root]
      }
      default:
        return []
    }
  }

  /**
   * Resets the series to its initial state
   */
  function reset (): void {
    quadraticTheilSenRegressor.reset()

    while (aMatrix.length > 0) {
      aMatrix[0]!.reset()
      aMatrix[0] = null
      aMatrix.shift()
    }
    aMatrix = []

    while (bMatrix.length > 0) {
      bMatrix[0]!.reset()
      bMatrix[0] = null
      bMatrix.shift()
    }
    bMatrix = []

    while (cMatrix.length > 0) {
      cMatrix[0]!.reset()
      cMatrix[0] = null
      cMatrix.shift()
    }
    cMatrix = []
  }

  /**
   * @param {integer} position - position in the series (default = 0)
   * @returns {float} X value at that position
   */
  function Xget (position: Readonly<number> = 0): number | undefined {
    if (position < quadraticTheilSenRegressor.length()) {
      return quadraticTheilSenRegressor.X.get(position)
    }
    return undefined
  }

  /**
   * @param {integer} position - position in the series (default = 0)
   * @returns {float} Y value at that position
   */
  function Yget (position: Readonly<number> = 0): number | undefined {
    if (position < quadraticTheilSenRegressor.length()) {
      return quadraticTheilSenRegressor.Y.get(position)
    }
    return undefined
  }

  return {
    push,
    X: {
      get: Xget
    },
    Y: {
      get: Yget
    },
    coefficientA,
    coefficientB,
    coefficientC,
    firstDerivative,
    secondDerivative,
    projectX,
    projectY,
    reset
  }
}
