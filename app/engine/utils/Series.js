'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This creates a series with a maximum number of values. It allows for determining the Average, Median, Number of Positive, number of Negative
 * @remark BE AWARE: The median function is extremely CPU intensive for larger series. Use the BinarySearchTree for that situation instead!
 *
 * @param {number} [maxSeriesLength] The maximum length of the series (0 for unlimited)
 */
export function createSeries (maxSeriesLength = 0) {
  /**
   * @type {Array<number>}
   */
  let seriesArray = []
  let seriesSum = 0
  let numPos = 0
  let numNeg = 0
  let min = undefined
  let max = undefined

  /**
   * @param {float} value to be added to the series
   */
  function push (value) {
    if (value === undefined || isNaN(value)) { return }

    if (!isNaN(min)) { min = Math.min(min, value) }
    if (!isNaN(max)) { max = Math.max(max, value) }

    if (maxSeriesLength > 0 && seriesArray.length >= maxSeriesLength) {
      // The maximum of the array has been reached, we have to create room by removing the first
      // value from the array
      seriesSum -= seriesArray[0]
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
      seriesArray.shift()
    }
    seriesArray.push(value)
    seriesSum += value
    if (value > 0) {
      numPos++
    } else {
      numNeg++
    }
  }

  /**
   * @output {number} length of the series
   */
  function length () {
    return seriesArray.length
  }

  /**
   * @output {float} value at the head of the series (i.e. the one first added)
   */
  function atSeriesBegin () {
    if (seriesArray.length > 0) {
      return seriesArray[0]
    } else {
      return 0
    }
  }

  /**
   * @output {float} value at the tail of the series (i.e. the one last added)
   */
  function atSeriesEnd () {
    if (seriesArray.length > 0) {
      return seriesArray[seriesArray.length - 1]
    } else {
      return 0
    }
  }

  /**
   * @param {number} position
   * @output {float} value at a specific postion, starting at 0
   */
  function get (position) {
    if (position >= 0 && position < seriesArray.length) {
      return seriesArray[position]
    } else {
      return undefined
    }
  }

  /**
   * @param {number} testedValue
   * @output {number} number of values in the series above the tested value
   */
  function numberOfValuesAbove (testedValue) {
    if (testedValue === 0) {
      return numPos
    } else {
      let i = seriesArray.length - 1
      let count = 0
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
   * @param {number} testedValue
   * @output {number} number of values in the series below or equal to the tested value
   */
  function numberOfValuesEqualOrBelow (testedValue) {
    if (testedValue === 0) {
      return numNeg
    } else {
      let i = seriesArray.length - 1
      let count = 0
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
   * @output {float} sum of the entire series
   */
  function sum () {
    return seriesSum
  }

  /**
   * @output {float} average of the entire series
   */
  function average () {
    if (seriesArray.length > 0) {
      return seriesSum / seriesArray.length
    } else {
      return 0
    }
  }

  /**
   * @output {float} smallest element in the series
   */
  function minimum () {
    if (seriesArray.length > 0) {
      if (isNaN(min)) { min = Math.min(...seriesArray) }
      return min
    } else {
      return 0
    }
  }

  /**
   * @output {float} largest value in the series
   */
  function maximum () {
    if (seriesArray.length > 0) {
      if (isNaN(max)) { max = Math.max(...seriesArray) }
      return max
    } else {
      return 0
    }
  }

  /**
   * @output {float} median of the series (DO NOT USE FOR LARGE SERIES!)
   */
  function median () {
    if (seriesArray.length > 0) {
      const mid = Math.floor(seriesArray.length / 2)
      const sortedArray = [...seriesArray].sort((a, b) => a - b)
      return seriesArray.length % 2 !== 0 ? sortedArray[mid] : (sortedArray[mid - 1] + sortedArray[mid]) / 2
    } else {
      return 0
    }
  }

  /**
   * @output {array} returns the entire series
   */
  function series () {
    if (seriesArray.length > 0) {
      return seriesArray
    } else {
      return []
    }
  }

  /**
   * Resets the series to its initial state
   */
  function reset () {
    seriesArray = /** @type {Array<number>} */(/** @type {unknown} */(null))
    seriesArray = []
    seriesSum = 0
    numPos = 0
    numNeg = 0
    min = null
    max = null
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
