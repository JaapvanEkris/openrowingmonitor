'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file The TSLinearSeries is a datatype that represents a Weighted Linear Series. It allows
 * values to be retrieved (like a FiFo buffer, or Queue) but it also includes
 * a Weighted Theil-Sen estimator Linear Regressor to determine the slope of this timeseries.
 *
 * At creation its length is determined. After it is filled, the oldest will be pushed
 * out of the queue) automatically. This is a property of the Series object
 *
 * A key constraint is to prevent heavy calculations at the end (due to large
 * array based curve fitting), which might happen on a Pi zero
 *
 * In order to prevent unneccessary calculations, this implementation uses lazy evaluation,
 * so it will calculate the intercept and goodnessOfFit only when needed, as many uses only
 * (first) need the slope.
 *
 * This implementation uses concepts that are described here:
 * https://en.wikipedia.org/wiki/Theil%E2%80%93Sen_estimator
 *
 * The array is ordered such that x[0] is the oldest, and x[x.length-1] is the youngest
 */

import { createSeries } from './Series.ts'
import { createLabelledBinarySearchTree } from './BinarySearchTree.ts'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface TSLinearSeries {
  push: (x: Readonly<number>, y: Readonly<number>, w?: Readonly<number>) => void
  readonly X: Series
  readonly Y: Series
  slope(): number | null
  intercept(): number | null
  coefficientA(): number | null
  coefficientB(): number | null
  length(): number
  goodnessOfFit(): number | null
  localGoodnessOfFit(position: Readonly<number>): number | null
  projectX(x: Readonly<number>): number | null
  projectY(y: Readonly<number>): number | null
  reliable(): boolean
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * @param {integer} maxSeriesLength - the maximum length of the quadratic series, default = 0 for unlimited
 */
export function createTSLinearSeries (maxSeriesLength: Readonly<number> = 0): TSLinearSeries {
  const X: SeriesInterface = createSeries(maxSeriesLength)
  const Y: SeriesInterface = createSeries(maxSeriesLength)
  const weight: SeriesInterface = createSeries(maxSeriesLength)
  const WY: SeriesInterface = createSeries(maxSeriesLength)
  const A: BinarySearchTree = createLabelledBinarySearchTree()

  let _A: number = 0
  let _B: number | null = 0
  let _sst: number | null = 0
  let _goodnessOfFit: number | null = 0

  /**
   * @param {float} x - the x value of the datapoint
   * @param {float} y - the y value of the datapoint
   * @param {float} w - the optional weight of the datapoint (optional, defaults to 1 for unweighted regression)
   * Invariant: BinarySearchTree A contains all calculated a's (as in the general formula y = a * x + b),
   * where the a's are labeled in the BinarySearchTree with their Xi when they BEGIN in the point (Xi, Yi)
   */
  function push (x: Readonly<number>, y: Readonly<number>, w: Readonly<number> = 1): void {
    if (x === undefined || isNaN(x) || y === undefined || isNaN(y)) { return }
    if (isNaN(w)) { w = 0.01 }

    if (maxSeriesLength > 0 && X.length() >= maxSeriesLength) {
      // The maximum of the array has been reached, so when pushing the x,y the array gets shifted,
      // thus we have to remove the a's belonging to the current position X[0] as well before this value is trashed
      A.remove(X.get(0))
    }

    X.push(x)
    Y.push(y)
    weight.push(w)
    WY.push(w * y)

    // Calculate all the slopes of the newly added point
    if (X.length() > 1) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i: number = 0
      let slope: number
      let combinedweight: number
      while (i < X.length() - 1) {
        // Calculate the slope with all preceeding datapoints and X.length() - 1'th datapoint (as the array starts at zero)
        slope = calculateSlope(i, X.length() - 1)
        combinedweight = weight.get(i) * w
        A.push(X.get(i), slope, combinedweight)
        i++
      }
    }

    // Calculate the median of the slopes
    if (A.reliableWeighted()) {
      _A = A.weightedMedian() ?? 0
    } else {
      _A = 0
    }

    // Invalidate the previously calculated intercept and goodnessOfFit. We'll only calculate them if we need them
    _B = null
    _sst = null
    _goodnessOfFit = null
  }

  /**
   * @returns {float} the slope of the linear function
   */
  function slope (): number {
    if (X.length() >= 2 && A.reliableWeighted()) {
      return _A
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the intercept of the linear function
   */
  function intercept (): number {
    if (X.length() >= 2 && A.reliableWeighted()) {
      calculateIntercept()
      return _B
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the coefficient a of the linear function y = a * x + b
   */
  function coefficientA (): number {
    if (X.length() >= 2 && A.reliableWeighted()) {
      return _A
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the coefficient b of the linear function y = a * x + b
   */
  function coefficientB (): number {
    if (X.length() >= 2 && A.reliableWeighted()) {
      calculateIntercept()
      return _B
    } else {
      return undefined
    }
  }

  /**
   * @returns {integer} the lenght of the stored series
   */
  function length (): number {
    return X.length()
  }

  /**
   * @returns {float} the R^2 as a global goodness of fit indicator
   * It will automatically recalculate the _goodnessOfFit when it isn't defined
   * This lazy approach is intended to prevent unneccesary calculations, especially when there is a batch of datapoints
   * pushes from the TSQuadratic regressor processing its linear residu
   * @see {@link https://web.maths.unsw.edu.au/~adelle/Garvan/Assays/GoodnessOfFit.html|Goodness-of-Fit Statistics}
   */
  function goodnessOfFit (): number {
    if (X.length() < 2 || !A.reliableWeighted()) { return undefined }
    let i: number = 0
    let sse: number = 0
    calculateIntercept()
    if (_goodnessOfFit === null) {
      _sst = 0

      // Calculate weighted R^2
      const weightedAverageY: number = WY.sum() / weight.sum()

      while (i < X.length()) {
        const xVal: number | undefined = X.get(i)
        const yVal: number | undefined = Y.get(i)
        const weightVal: number | undefined = weight.get(i)
        if (xVal !== undefined && yVal !== undefined && weightVal !== undefined) {
          sse += weightVal * Math.pow(yVal - projectX(xVal), 2)
          _sst += weightVal * Math.pow(yVal - weightedAverageY, 2)
        }
        i++
      }

      switch (true) {
        case (sse === 0):
          _goodnessOfFit = 1
          break
        case (sse > _sst):
          // This is a pretty bad fit as the error is bigger than just using the line for the average y as intercept
          _goodnessOfFit = 0.01
          break
        case (_sst !== 0):
          _goodnessOfFit = 1 - (sse / _sst)
          break
        default:
          // When SST = 0, R2 isn't defined
          _goodnessOfFit = 0.01
      }
    }
    return _goodnessOfFit
  }

  /**
   * @param {integer} position - The position in the series for which the Local Goodness Of Fit has to be calcuated
   * @returns {float} the local R^2 as a local goodness of fit indicator
   */
  function localGoodnessOfFit (position: Readonly<number>): number {
    if (_sst === null) {
      // Force the recalculation of the _sst
      goodnessOfFit()
    }
    if (X.length() >= 2 && A.reliableWeighted() && position < X.length()) {
      const posXVal: number | undefined = X.get(position)
      const posYVal: number | undefined = Y.get(position)
      const posWeightVal: number | undefined = weight.get(position)
      if (posXVal !== undefined && posYVal !== undefined && posWeightVal !== undefined) {
        const weightedSquaredError: number = posWeightVal * Math.pow((posYVal - projectX(posXVal)), 2)
        /* eslint-disable no-unreachable -- rather be systematic and add a break in all case statements */
        switch (true) {
          case (weightedSquaredError === 0):
            return 1
            break
          case (weightedSquaredError > _sst):
            // This is a pretty bad fit as the error is bigger than just using the line for the average y as intercept
            return 0.01
            break
          case (_sst !== 0):
            return Math.min(Math.max(1 - ((weightedSquaredError * X.length()) / _sst), 0), 1)
            break
          default:
            // When _SST = 0, localGoodnessOfFit isn't defined
            return 0.01
        }
        /* eslint-enable no-unreachable */
      }
    }
    return undefined
  }

  /**
   * @param {float} x - the x value to be projected
   * @returns {float} the resulting y value when projected via the linear function
   */
  function projectX (x: Readonly<number>): number {
    if (X.length() >= 2 && A.reliableWeighted()) {
      calculateIntercept()
      return (_A * x) + _B
    } else {
      return undefined
    }
  }

  /**
   * @param {float} y - the y value to be solved
   * @returns {float} the resulting x value when solved via the linear function
   */
  function projectY (y: Readonly<number>): number {
    if (X.length() >= 2 && A.reliableWeighted() && _A !== 0) {
      calculateIntercept()
      return ((y - _B) / _A)
    } else {
      log.error('TS Linear Regressor, attempted a Y-projection while slope was zero!')
      return undefined
    }
  }

  /**
   * @param {integer} pointOne - The position in the series of the first datapoint used for the slope calculation
   * @param {integer} pointTwo - The position in the series of the second datapoint used for the slope calculation
   * @returns {float} the slope of the linear function
   */
  function calculateSlope (pointOne: Readonly<number>, pointTwo: Readonly<number>): number {
    const xOne: number | undefined = X.get(pointOne)
    const xTwo: number | undefined = X.get(pointTwo)
    const yOne: number | undefined = Y.get(pointOne)
    const yTwo: number | undefined = Y.get(pointTwo)

    if (pointOne !== pointTwo && xOne !== undefined && xTwo !== undefined && xOne !== xTwo && yOne !== undefined && yTwo !== undefined) {
      return ((yTwo - yOne) / (xTwo - xOne))
    } else {
      log.error('TS Linear Regressor, Division by zero prevented!')
      return undefined
    }
  }

  /**
   * @description This helper function calculates the intercept and stores it in _B
   */
  function calculateIntercept (): void {
    // Calculate all the intercepts for the newly added point and the newly calculated A, when needed
    // This function is only called when an intercept is really needed, as this saves a lot of CPU cycles when only a slope suffices
    const B: BinarySearchTree = createLabelledBinarySearchTree()
    if (_B === null) {
      if (X.length() >= 2 && A.reliableWeighted()) {
        // There are at least two points in the X and Y arrays, so let's calculate the intercept
        let i: number = 0
        while (i < X.length()) {
          // Please note, we recreate the B-tree for each newly added datapoint anyway, so the label i isn't relevant
          B.push(i, (Y.get(i) - (_A * X.get(i))), weight.get(i))
          i++
        }
        _B = B.weightedMedian() ?? 0
      } else {
        _B = 0
      }
    }
    B.reset()
  }

  /**
   * @returns {boolean} whether the linear regression should be considered reliable to produce results
   */
  function reliable (): boolean {
    return (X.length() >= 2 && A.reliableWeighted() && weight.sum() > 0)
  }

  /**
   * @description This function is used for clearing data and state, bringing it back to its original state
   */
  function reset (): void {
    if (X.length() > 0) {
      // There is something to reset
      X.reset()
      Y.reset()
      weight.reset()
      WY.reset()
      A.reset()
      _A = 0
      _B = 0
      _goodnessOfFit = 0
    }
  }

  return {
    push,
    X,
    Y,
    slope,
    intercept,
    coefficientA,
    coefficientB,
    length,
    goodnessOfFit,
    localGoodnessOfFit,
    projectX,
    projectY,
    reliable,
    reset
  }
}
