'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This creates a weighed series with a maximum number of values. It allows for determining the Average, Weighed Averge, Median, Number of Positive, number of Negative.
 * DO NOT USE MEDIAN ON LARGE SERIES!
 */
import { createSeries } from './Series.ts'

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface WeighedSeries {
  push(value: Readonly<number>, weight: Readonly<number>): void
  length(): number
  atSeriesBegin(): number | undefined
  atSeriesEnd(): number | undefined
  get(position: Readonly<number>): number | undefined
  numberOfValuesAbove(testedValue: Readonly<number>): number | undefined
  numberOfValuesEqualOrBelow(testedValue: Readonly<number>): number | undefined
  sum(): number | undefined
  average(): number | undefined
  weighedAverage(): number | undefined
  minimum(): number | undefined
  maximum(): number | undefined
  median(): number | undefined
  series(): number[]
  reliable(): boolean
  reliableWeighted(): boolean
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Creates a weighed series with a maximum number of values
 * @param {integer} maxSeriesLength - The maximum length of the weighed series, 0 for unlimited
 * @param {float} defaultValue - The default value to return if a function can't calculate a value, can be undefined
 * @returns A weighed series object with methods for statistical calculations
 */
export function createWeighedSeries (maxSeriesLength: Readonly<number> = 0, defaultValue: Readonly<number> | undefined = undefined): WeighedSeries {
  const dataArray: Series = createSeries(maxSeriesLength)
  const weightArray: Series = createSeries(maxSeriesLength)
  const weightedArray: Series = createSeries(maxSeriesLength)

  /**
   * Adds a value and its weight to the series
   * @param {float} value - The value of the datapoint
   * @param {float} weight - The weight of the datapoint
   */
  function push (value: Readonly<number>, weight: Readonly<number>): void {
    if (value === undefined || isNaN(value) || weight === undefined || isNaN(weight)) {
      return
    }
    dataArray.push(value)
    weightArray.push(weight)
    weightedArray.push(value * weight)
  }

  /**
   * Gets the length of the stored series
   * @returns {integer} The length of the series
   */
  function length (): number {
    return dataArray.length()
  }

  /**
   * Gets the oldest value of the series (i.e. the one first added)
   * @returns {float} The oldest value in the series
   */
  function atSeriesBegin (): number | undefined {
    return dataArray.atSeriesBegin()
  }

  /**
   * Gets the youngest value of the series (i.e. the one last added)
   * @returns {float} The youngest value in the series
   */
  function atSeriesEnd (): number | undefined {
    return dataArray.atSeriesEnd()
  }

  /**
   * Gets a value at a specific position in the series
   * @param {integer} position - Position to be retrieved, starting at 0
   * @returns {float} Value at that specific position in the series
   */
  function get (position: Readonly<number>): number | undefined {
    return dataArray.get(position)
  }

  /**
   * Counts values in the series above the tested value
   * @param {float} testedValue - Tested value
   * @returns {integer} Count of values in the series above the tested value
   */
  function numberOfValuesAbove (testedValue: number): number | undefined {
    return dataArray.numberOfValuesAbove(testedValue)
  }

  /**
   * Counts values in the series below or equal to the tested value
   * @param {float} testedValue - Tested value
   * @returns {integer} Number of values in the series below or equal to the tested value
   */
  function numberOfValuesEqualOrBelow (testedValue: number): number | undefined {
    return dataArray.numberOfValuesEqualOrBelow(testedValue)
  }

  /**
   * Calculates the sum of the entire series
   * @returns {float} Sum of the entire series
   */
  function sum (): number | undefined {
    return dataArray.sum()
  }

  /**
   * Calculates the average of the entire series
   * @returns {float} Average of the entire series, or defaultValue if empty
   */
  function average (): number | undefined {
    if (dataArray.length() > 0) {
      // The series contains sufficient values to be valid
      return dataArray.average()
    } else {
      // The array isn't sufficiently filled
      return defaultValue
    }
  }

  /**
   * Calculates the weighed average of the series
   * @returns {float} The weighed average of the series, or defaultValue if empty or invalid
   */
  function weighedAverage (): number | undefined {
    if (dataArray.length() > 0 && weightArray.sum() !== 0) {
      return weightedArray.sum() / weightArray.sum()
    } else {
      return defaultValue
    }
  }

  /**
   * @returns {float} Smallest element in the series
   */
  function minimum (): number | undefined {
    return dataArray.minimum()
  }

  /**
   * @returns {float} Largest value in the series
   */
  function maximum (): number | undefined {
    return dataArray.maximum()
  }

  /**
   * @description Returns the median of the series.
   * As this is a CPU intensive approach, DO NOT USE FOR LARGE SERIES!. For larger series, use the BinarySearchTree.js instead
   * @returns {float} Median of the series
   */
  function median (): number | undefined {
    return dataArray.median()
  }

  /**
   * Checks if the weighed series results are to be considered reliable
   * @returns {boolean} True if the series contains data, false otherwise
   */
  function reliable (): boolean {
    return dataArray.length() > 0
  }

  /**
   * Checks if the weighed series results are to be considered reliable
   * @returns {boolean} True if the weighted series contains data, false otherwise
   */
  function reliableWeighted (): boolean {
    return (dataArray.length() > 0 && weightArray.sum() > 0)
  }

  /**
   * Gets the entire series of datapoints
   * @returns {float[]} Array of all datapoints in the series
   */
  function series (): number[] {
    return dataArray.series()
  }

  /**
   * Resets the series to its initial state
   */
  function reset (): void {
    dataArray.reset()
    weightArray.reset()
    weightedArray.reset()
  }

  return {
    push,
    length,
    atSeriesBegin,
    atSeriesEnd,
    get,
    numberOfValuesAbove,
    numberOfValuesEqualOrBelow,
    sum,
    average,
    weighedAverage,
    minimum,
    maximum,
    median,
    series,
    reliable,
    reliableWeighted,
    reset
  }
}
