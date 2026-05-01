'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This creates a series with a maximum number of values. It allows for determining the Average, Median, Number of Positive, number of Negative
 * BE AWARE: The median function is extremely CPU intensive for larger series. Use the BinarySearchTree for that situation instead!
 * BE AWARE: Accumulators (seriesSum especially) are vulnerable to floating point rounding errors causing drift, thus the use of array.reduce
 */

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface Series {
  push(x: Readonly<number>): void
  length(): number
  get(index: Readonly<number>): number | null
  atSeriesBegin(): number
  atSeriesEnd(): number
  numberOfValuesAbove(testedValue: Readonly<number>): number
  numberOfValuesEqualOrBelow(testedValue: Readonly<number>): number
  average(): number
  minimum(): number
  maximum(): number
  median(): number
  series(): number[]
  length(): number
  sum(): number
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Creates a series object with a maximum number of values
 * @param maxSeriesLength - The maximum length of the series (0 for unlimited)
 * @returns Series object with methods to manipulate and query the series
 */
export function createSeries (maxSeriesLength: Readonly<number> = 0): Series {
  /**
   * 'updateCountCeiling' is added as a future provision. It currently set to 1, forcing a sum recalc every push.
   * Setting it higher reduces CPU load, but also reduces accuracy due to accumulator rounding issues.
   * Special tests are present in the corresponding unit-tests, but testing of dependent modules show small deviations
   */
  const updateCountCeiling: number = maxSeriesLength > 0 ? Math.min(1, maxSeriesLength) : 1
  let seriesArray: number[] = []
  let numPos: number = 0
  let numNeg: number = 0
  let min: number | undefined = undefined
  let max: number | undefined = undefined
  let seriesSum: number | null = null
  let updatecount: number = 0

  /**
   * Adds a value to the series
   * @param {float} value - value to be added to the series
   */
  function push (value: Readonly<number>): void {
    if (value === undefined || isNaN(value)) {
      return
    }

    if (min !== undefined) {
      min = Math.min(min, value)
    }
    if (max !== undefined) {
      max = Math.max(max, value)
    }

    if (maxSeriesLength > 0 && seriesArray.length >= maxSeriesLength) {
      // The maximum of the array has been reached, we have to create room by removing the first value from the array
      if (seriesArray[0] > 0) {
        numPos--
      } else {
        numNeg--
      }
      if (min === seriesArray[0]) {
        min = undefined
      }
      if (max === seriesArray[0]) {
        max = undefined
      }
      if (seriesSum !== null) {
        seriesSum -= seriesArray[0]
      }
      seriesArray.shift()
    }
    seriesArray.push(value)

    updatecount++

    if (updatecount < updateCountCeiling && seriesSum !== null) {
      seriesSum += value
    } else {
      updatecount = 0
      seriesSum = null
    }

    if (value > 0) {
      numPos++
    } else {
      numNeg++
    }
  }

  /**
   * Gets the length of the series
   * @returns {integer} length of the series
   */
  function length (): number {
    return seriesArray.length
  }

  /**
   * Gets the oldest value of the series (i.e. the one first added)
   * @returns {float} the oldest value of the series
   */
  function atSeriesBegin (): number {
    if (seriesArray.length > 0) {
      return seriesArray[0]
    } else {
      return undefined
    }
  }

  /**
   * Gets the youngest value of the series (i.e. the one last added)
   * @returns {float} the youngest value of the series
   */
  function atSeriesEnd (): number {
    if (seriesArray.length > 0) {
      return seriesArray[seriesArray.length - 1]
    } else {
      return undefined
    }
  }

  /**
   * Gets the value at a specific position in the series
   * @param {integer} position - position to be retrieved, starting at 0
   * @returns {float} value at that specific position in the series
   */
  function get (position: Readonly<number>): number | undefined {
    if (position >= 0 && position < seriesArray.length) {
      return seriesArray[position]
    } else {
      return undefined
    }
  }

  /**
   * Counts values in the series above the tested value
   * @param {float} testedValue - tested value
   * @returns {integer} count of values in the series above the tested value
   */
  function numberOfValuesAbove (testedValue: Readonly<number>): number {
    if (!seriesArray.length > 0) { return undefined }
    if (testedValue === 0) {
      return numPos
    } else {
      let i: number = seriesArray.length - 1
      let count: number = 0
      while (i >= 0) {
        if (seriesArray[i] > testedValue) {
          count++
        }
        i--
      }
      return count
    }
  }

  /**
   * Counts values in the series below or equal to the tested value
   * @param {float} testedValue - tested value
   * @returns {integer} number of values in the series below or equal to the tested value
   */
  function numberOfValuesEqualOrBelow (testedValue: Readonly<number>): number {
    if (!seriesArray.length > 0) { return undefined }
    if (testedValue === 0) {
      return numNeg
    } else {
      let i: number = seriesArray.length - 1
      let count: number = 0
      while (i >= 0) {
        if (seriesArray[i] <= testedValue) {
          count++
        }
        i--
      }
      return count
    }
  }

  /**
   * Calculates the sum of the entire series
   * As a running sum becomes unstable after longer running sums, we need to summarise this via a reduce
   * @returns {float} sum of the entire series
   */
  function sum (): number {
    if (!seriesArray.length > 0) { return undefined }
    if (seriesSum === null) {
      seriesSum = seriesArray.reduce((total: number, item: number) => total + item)
    }
    return seriesSum
  }

  /**
   * Calculates the average of the entire series
   * @returns {float} average of the entire series
   */
  function average (): number {
    if (seriesArray.length > 0) {
      return sum() / seriesArray.length
    } else {
      return undefined
    }
  }

  /**
   * Gets the smallest element in the series
   * @returns {float} smallest element in the series
   */
  function minimum (): number {
    if (seriesArray.length > 0) {
      if (isNaN(min as number)) {
        min = Math.min(...seriesArray)
      }
      return min
    } else {
      return undefined
    }
  }

  /**
   * Gets the largest value in the series
   * @returns {float} largest value in the series
   */
  function maximum (): number {
    if (seriesArray.length > 0) {
      if (isNaN(max as number)) {
        max = Math.max(...seriesArray)
      }
      return max
    } else {
      return undefined
    }
  }

  /**
   * Calculates the median of the series
   * CAUTION: This is a CPU intensive approach, DO NOT USE FOR LARGE SERIES!
   * For larger series, use the BinarySearchTree instead
   * @returns {float} median of the series
   */
  function median (): number {
    if (seriesArray.length > 0) {
      const mid: number = Math.floor(seriesArray.length / 2)
      const sortedArray: number[] = [...seriesArray].sort((a: number, b: number) => a - b)
      return seriesArray.length % 2 !== 0 ? sortedArray[mid] : (sortedArray[mid - 1] + sortedArray[mid]) / 2
    } else {
      return undefined
    }
  }

  /**
   * Returns the entire series
   * @returns {float[]} the entire series as an array
   */
  function series (): number[] {
    if (seriesArray.length > 0) {
      return seriesArray
    } else {
      return []
    }
  }

  /**
   * Resets the series to its initial state
   */
  function reset (): void {
    seriesArray = []
    numPos = 0
    numNeg = 0
    min = undefined
    max = undefined
    seriesSum = null
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
    minimum,
    maximum,
    median,
    series,
    reset
  }
}
