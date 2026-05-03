'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This creates an unlimited series (resetting it is a responsibility of the caller).
 * It allows for determining the Average, Median, Minimum and Maximum
 */

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface InfiniteSeries {
  push(value: Readonly<number>): void
  length(): number
  sum(): number | undefined
  average(): number | undefined
  minimum(): number | undefined
  maximum(): number | undefined
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * @description the creator function, creates and returns an InfiniteSeriesMetrics instance
 */
export function createInfiniteSeriesMetrics (): InfiniteSeriesMetrics {
  let min: number | undefined = undefined
  let max: number | undefined = undefined
  let seriesSum: number = 0
  let seriesCount: number = 0
  /**
   * @param {float} value - value to be added to the series
   */
  function push (value: Readonly<number>): void {
    if (value === undefined || isNaN(value)) { return }

    seriesSum += value
    seriesCount++

    if (min !== undefined) {
      min = Math.min(min, value)
    } else {
      if (!isNaN(value)) {
        min = value
      }
    }

    if (max !== undefined) {
      max = Math.max(max, value)
    } else {
      if (!isNaN(value)) {
        max = value
      }
    }
  }

  /**
   * @returns {number} length of the series
   */
  function length (): number {
    return seriesCount
  }

  /**
   * @description This determines the total sum of the series.
   * @returns {float} sum of the entire series
   */
  function sum (): number {
    if (seriesCount > 0) {
      return seriesSum
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} average of the entire series
   */
  function average (): number {
    if (seriesCount > 0) {
      return seriesSum / seriesCount
    } else {
      return undefined
    }
  }

  /**
   * @returns {float} smallest element in the series
   */
  function minimum (): number {
    if (min !== undefined && seriesCount > 0) {
      return min
    } else {
      return undefined
    }
  }

  /**
   * @returns largest value in the series
   */
  function maximum (): number {
    if (max !== undefined && seriesCount > 0) {
      return max
    } else {
      return undefined
    }
  }

  /**
   * Resets the series to its initial state
   */
  function reset (): void {
    min = undefined
    max = undefined
    seriesSum = 0
    seriesCount = 0
  }

  return {
    push,
    length,
    sum,
    average,
    minimum,
    maximum,
    reset
  }
}
