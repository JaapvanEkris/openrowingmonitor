'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file The WLSLinearSeries is a datatype that represents a Linear Series. It allows
 * values to be retrieved (like a FiFo buffer, or Queue) but it also includes
 * a Weighted Linear Regressor to determine the slope, intercept and R^2 of this series
 * of x and y coordinates through Weighted Least Squares Regression.
 *
 * At creation it can be determined that the Series is limited (i.e. after it
 * is filled, the oldest will be pushed out of the queue) or that the series
 * is unlimited (will only expand). The latter is activated by calling the creation with
 * an empty argument.
 *
 * please note that for unlimited series it is up to the calling function to handle resetting
 * the Linear Series when needed through the reset() call.
 *
 * This implementation uses concepts that are described here:
 * https://www.colorado.edu/amath/sites/default/files/attached-files/ch12_0.pdf
 *
 * For weighted least squares:
 * https://en.wikipedia.org/wiki/Weighted_least_squares
 */
import { createSeries } from './Series.ts'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface WLSLinearSeries {
  readonly X: Series
  readonly Y: Series
  readonly weight: Series
  push(x: Readonly<number>, y: Readonly<number>, w?: Readonly<number>): void
  slope(): number
  intercept(): number
  length(): number
  goodnessOfFit(): number
  projectX(x: Readonly<number>): number
  projectY(y: Readonly<number>): number
  reliable(): boolean
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * @param maxSeriesLength - the maximum length of the linear series, default = 0 for unlimited
 */
export function createWLSLinearSeries (maxSeriesLength: Readonly<number> = 0): WLSLinearSeries {
  const X: Series = createSeries(maxSeriesLength)
  const weight: Series = createSeries(maxSeriesLength)
  const WX: Series = createSeries(maxSeriesLength)
  const WY: Series = createSeries(maxSeriesLength)
  const WXX: Series = createSeries(maxSeriesLength)
  const WYY: Series = createSeries(maxSeriesLength)
  const WXY: Series = createSeries(maxSeriesLength)
  const Y: Series = createSeries(maxSeriesLength)
  let _denominator: number = 0
  let _slope: number = 0
  let _intercept: number = 0
  let _goodnessOfFit: number = 0

  /**
   * @param {float} x - the x value of the datapoint
   * @param {float} y - the y value of the datapoint
   * @param {float} w - the weight of the datapoint, default = 1
   */
  function push (x: Readonly<number>, y: Readonly<number>, w: Readonly<number> = 1): void {
    if (x === undefined || isNaN(x) || y === undefined || isNaN(y)) { return }

    // Ensure weight is valid and positive
    const _weight: number = (w === undefined || isNaN(w) || w < 0) ? 1 : w

    X.push(x)
    Y.push(y)
    weight.push(_weight)
    WX.push(_weight * x)
    WY.push(_weight * y)
    WXX.push(_weight * x * x)
    WYY.push(_weight * y * y)
    WXY.push(_weight * x * y)

    // Calculate regression parameters using Weighted Least Squares
    _denominator = (weight.sum() * WXX.sum()) - (WX.sum() * WX.sum())
    if (X.length() >= 2 && _denominator !== 0 && weight.sum() > 0) {
      _slope = (weight.sum() * WXY.sum() - WX.sum() * WY.sum()) / _denominator
      _intercept = (WY.sum() - _slope * WX.sum()) / weight.sum()

      // Calculate weighted R^2
      const weighedAverageY: number = WY.sum() / weight.sum()
      const sse: number = WYY.sum() - (2 * _intercept * WY.sum()) - (2 * _slope * WXY.sum()) +
        (_intercept * _intercept * weight.sum()) + (2 * _slope * _intercept * WX.sum()) +
        (_slope * _slope * WXX.sum())
      const sst: number = WYY.sum() - (weighedAverageY * weighedAverageY * weight.sum())

      switch (true) {
        case (sse === 0):
          _goodnessOfFit = 1
          break
        case (sse > sst):
          // This is a pretty bad fit as the error is bigger than just using the line for the average y as intercept
          _goodnessOfFit = 0.01
          break
        case (sst !== 0):
          _goodnessOfFit = 1 - (sse / sst)
          break
        default:
          // When SST = 0, R2 isn't defined
          _goodnessOfFit = 0.01
      }
    } else {
      _slope = 0
      _intercept = 0
      _goodnessOfFit = 0
    }
  }

  /**
   * @returns {float} the slope of the linear function
   */
  function slope (): number {
    if (X.length() >= 2 && _denominator !== 0 && weight.sum() > 0) {
      return _slope
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} the intercept of the linear function
   */
  function intercept (): number {
    if (X.length() >= 2 && _denominator !== 0 && weight.sum() > 0) {
      return _intercept
    } else {
      return undefined
    }
  }

  /**
   * @returns {integer} the length of the stored series
   */
  function length (): number {
    return X.length()
  }

  /**
   * @returns {float} the R^2 as a goodness of fit indicator
   */
  function goodnessOfFit (): number {
    if (X.length() >= 2 && _denominator !== 0 && weight.sum() > 0) {
      return _goodnessOfFit
    } else {
      return undefined
    }
  }

  /**
   * @param {float} x - the x value to be projected
   * @returns {float} the resulting y value when projected via the linear function
   */
  function projectX (x: Readonly<number>): number {
    if (X.length() >= 2 && _denominator !== 0 && weight.sum() > 0) {
      return (_slope * x) + _intercept
    } else {
      return undefined
    }
  }

  /**
   * @param {float} y - the y value to be solved
   * @returns {float} the resulting x value when solved via the linear function
   */
  function projectY (y: Readonly<number>): number {
    if (X.length() >= 2 && _denominator !== 0 && _slope !== 0 && weight.sum() > 0) {
      return ((y - _intercept) / _slope)
    } else {
      log.error('WLS Regressor, attempted a Y-projection while slope was zero!')
      return undefined
    }
  }

  /**
   * @returns {boolean} whether the linear regression should be considered reliable to produce results
   */
  function reliable (): boolean {
    return (X.length() >= 2 && _denominator !== 0 && weight.sum() > 0)
  }

  /**
   * @description Used for clearing all data, typically when flywheel.js is completely reset
   */
  function reset (): void {
    X.reset()
    Y.reset()
    weight.reset()
    WX.reset()
    WY.reset()
    WXX.reset()
    WYY.reset()
    WXY.reset()
    _slope = 0
    _intercept = 0
    _goodnessOfFit = 0
  }

  return {
    push,
    X,
    Y,
    weight,
    slope,
    intercept,
    length,
    goodnessOfFit,
    projectX,
    projectY,
    reliable,
    reset
  }
}
