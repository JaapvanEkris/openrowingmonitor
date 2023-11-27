'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  The TSLinearSeries is a datatype that represents a Quadratic Series. It allows
  values to be retrieved (like a FiFo buffer, or Queue) but it also includes
  a Theil-Sen Quadratic Regressor to determine the coefficients of this dataseries.

  At creation its length is determined. After it is filled, the oldest will be pushed
  out of the queue) automatically.

  A key constraint is to prevent heavy calculations at the end (due to large
  array based curve fitting), which might be performed on a Pi zero

  The Theil-Senn implementation uses concepts that are described here:
  https://stats.stackexchange.com/questions/317777/theil-sen-estimator-for-polynomial,

  The determination of the coefficients is based on the math descirbed here:
  https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson,
  https://www.physicsforums.com/threads/quadratic-equation-from-3-points.404174/
*/

import { createSeries } from './Series.js'
import { createTSLinearSeries } from './FullTSLinearSeries.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

function createTSQuadraticSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const A = []
  let _A = 0
  let _B = 0
  let _C = 0

  function push (x, y) {
    const linearResidu = createTSLinearSeries(maxSeriesLength)

    // Invariant: A[i] contains all a's (as in the general formula y = a * x^2 + b * x + c)
    // belonging to the curves ENDING in the point (xi, yi)

    X.push(x)
    Y.push(y)

    if (maxSeriesLength > 0 && A.length >= maxSeriesLength) {
      // The maximum of the array has been reached, we have to create room
      // in the 2D array by removing the first row from the A-table
      A.shift()
    }

    // Add an empty array at the end to store futurs results for the most recent points
    A.push([])

    // Calculate the coefficients of this new point
    if (X.length() > 2) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      let j = 0
      while (i < X.length() - 2) {
        j = i + 1
        while (j < X.length() - 1) {
          A[i].push(calculateA(i, j, X.length() - 1))
          j++
        }
        i++
      }
      _A = matrixMedian(A)

      i = 0
      linearResidu.reset()
      while (i < X.length() - 1) {
        linearResidu.push(X.get(i), Y.get(i) - (_A * Math.pow(X.get(i), 2)))
        i++
      }
      _B = linearResidu.coefficientA()
      _C = linearResidu.coefficientB()
    } else {
      _A = 0
      _B = 0
      _C = 0
    }
  }

  function firstDerivativeAtPosition (position) {
    if (X.length() > 2 && position < X.length()) {
      return ((_A * 2 * X.get(position)) + _B)
    } else {
      return 0
    }
  }

  function secondDerivativeAtPosition (position) {
    if (X.length() > 2 && position < X.length()) {
      return (_A * 2)
    } else {
      return 0
    }
  }

  function slope (x) {
    if (X.length() > 2) {
      return ((_A * 2 * x) + _B)
    } else {
      return 0
    }
  }

  function coefficientA () {
    // For testing purposses only!
    return _A
  }

  function coefficientB () {
    // For testing purposses only!
    return _B
  }

  function coefficientC () {
    // For testing purposses only!
    return _C
  }

  function intercept () {
    return coefficientC()
  }

  function length () {
    return X.length()
  }

  function goodnessOfFit () {
    // This function returns the R^2 as a goodness of fit indicator
    // ToDo: calculate the goodness of fit when called
    if (X.length() >= 2) {
      // return _goodnessOfFit
      return 1
    } else {
      return 0
    }
  }

  function projectX (x) {
    const _C = coefficientC()
    if (X.length() > 2) {
      return ((_A * x * x) + (_B * x) + _C)
    } else {
      return 0
    }
  }

  function numberOfXValuesAbove (testedValue) {
    return X.numberOfValuesAbove(testedValue)
  }

  function numberOfXValuesEqualOrBelow (testedValue) {
    return X.numberOfValuesEqualOrBelow(testedValue)
  }

  function numberOfYValuesAbove (testedValue) {
    return Y.numberOfValuesAbove(testedValue)
  }

  function numberOfYValuesEqualOrBelow (testedValue) {
    return Y.numberOfValuesEqualOrBelow(testedValue)
  }

  function xAtSeriesBegin () {
    return X.atSeriesBegin()
  }

  function xAtSeriesEnd () {
    return X.atSeriesEnd()
  }

  function xAtPosition (position) {
    return X.get(position)
  }

  function yAtSeriesBegin () {
    return Y.atSeriesBegin()
  }

  function yAtSeriesEnd () {
    return Y.atSeriesEnd()
  }

  function yAtPosition (position) {
    return Y.get(position)
  }

  function xSum () {
    return X.sum()
  }

  function ySum () {
    return Y.sum()
  }

  function minimumX () {
    return X.minimum()
  }

  function minimumY () {
    return Y.minimum()
  }

  function maximumX () {
    return X.maximum()
  }

  function maximumY () {
    return Y.maximum()
  }

  function xSeries () {
    return X.series()
  }

  function ySeries () {
    return Y.series()
  }

  function calculateA (pointOne, pointTwo, pointThree) {
    let result = 0
    if (X.get(pointOne) !== X.get(pointTwo) && X.get(pointOne) !== X.get(pointThree) && X.get(pointTwo) !== X.get(pointThree)) {
      // For the underlying math, see https://www.quora.com/How-do-I-find-a-quadratic-equation-from-points/answer/Robert-Paxson
      result = (X.get(pointOne) * (Y.get(pointThree) - Y.get(pointTwo)) + Y.get(pointOne) * (X.get(pointTwo) - X.get(pointThree)) + (X.get(pointThree) * Y.get(pointTwo) - X.get(pointTwo) * Y.get(pointThree))) / ((X.get(pointOne) - X.get(pointTwo)) * (X.get(pointOne) - X.get(pointThree)) * (X.get(pointTwo) - X.get(pointThree)))
      return result
    } else {
      log.error('TS Quadratic Regressor, Division by zero prevented in CalculateA!')
      return 0
    }
  }

  function matrixMedian (inputMatrix) {
    if (inputMatrix.length > 1) {
      const sortedArray = [...inputMatrix.flat()].sort((a, b) => a - b)
      const mid = Math.floor(sortedArray.length / 2)
      return (sortedArray.length % 2 !== 0 ? sortedArray[mid] : ((sortedArray[mid - 1] + sortedArray[mid]) / 2))
    } else {
      log.error('TS Quadratic Regressor, Median calculation on empty matrix attempted!')
      return 0
    }
  }

  function reset () {
    X.reset()
    Y.reset()
    A.splice(0, A.length)
    _A = 0
    _B = 0
    _C = 0
  }

  return {
    push,
    firstDerivativeAtPosition,
    secondDerivativeAtPosition,
    slope,
    coefficientA,
    coefficientB,
    coefficientC,
    intercept,
    length,
    goodnessOfFit,
    projectX,
    numberOfXValuesAbove,
    numberOfXValuesEqualOrBelow,
    numberOfYValuesAbove,
    numberOfYValuesEqualOrBelow,
    xAtSeriesBegin,
    xAtSeriesEnd,
    xAtPosition,
    yAtSeriesBegin,
    yAtSeriesEnd,
    yAtPosition,
    minimumX,
    minimumY,
    maximumX,
    maximumY,
    xSum,
    ySum,
    xSeries,
    ySeries,
    reset
  }
}

export { createTSQuadraticSeries }
