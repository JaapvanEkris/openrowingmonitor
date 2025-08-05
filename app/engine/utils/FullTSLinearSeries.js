'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  The TSLinearSeries is a datatype that represents a Linear Series. It allows
  values to be retrieved (like a FiFo buffer, or Queue) but it also includes
  a Theil-Sen estimator Linear Regressor to determine the slope of this timeseries.

  At creation its length is determined. After it is filled, the oldest will be pushed
  out of the queue) automatically. This is a property of the Series object

  A key constraint is to prevent heavy calculations at the end (due to large
  array based curve fitting), which might happen on a Pi zero

  In order to prevent unneccessary calculations, this implementation uses lazy evaluation,
  so it will calculate the intercept and goodnessOfFit only when needed, as many uses only
  (first) need the slope.

  This implementation uses concepts that are described here:
  https://en.wikipedia.org/wiki/Theil%E2%80%93Sen_estimator

  The array is ordered such that x[0] is the oldest, and x[x.length-1] is the youngest
*/

import { createSeries } from './Series.js'
import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

export function createTSLinearSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const A = createLabelledBinarySearchTree()

  let _A = 0
  let _B = 0
  let sst = 1
  let _goodnessOfFit = 0

  function push (x, y) {
    // Invariant: A contains all a's (as in the general formula y = a * x + b)
    // Where the a's are labeled in the Binary Search Tree with their xi when they BEGIN in the point (xi, yi)
    if (x === undefined || isNaN(x) || y === undefined || isNaN(y)) { return }

    if (maxSeriesLength > 0 && X.length() >= maxSeriesLength) {
      // The maximum of the array has been reached, so when pushing the x,y the array gets shifted,
      // thus we have to remove the a's belonging to the current position X0 as well before this value is trashed
      A.remove(X.get(0))
    }

    X.push(x)
    Y.push(y)

    // Calculate all the slopes of the newly added point
    if (X.length() > 1) {
      // There are at least two points in the X and Y arrays, so let's add the new datapoint
      let i = 0
      while (i < X.length() - 1) {
        // Calculate the slope with all preceeding datapoints and X.length() - 1'th datapoint (as the array starts at zero)
        A.push(X.get(i), calculateSlope(i, X.length() - 1))
        i++
      }
    }

    // Calculate the median of the slopes
    if (X.length() > 1) {
      _A = A.median()
    } else {
      _A = 0
    }

    // Invalidate the previously calculated intercept and goodnessOfFit. We'll only calculate them if we need them
    _B = null
    sst = null
    _goodnessOfFit = null
  }

  function slope () {
    return _A
  }

  function intercept () {
    calculateIntercept()
    return _B
  }

  function coefficientA () {
    // For testing purposses only!
    return _A
  }

  function coefficientB () {
    // For testing purposses only!
    calculateIntercept()
    return _B
  }

  function length () {
    return X.length()
  }

  function goodnessOfFit () {
    // This function returns the R^2 as a goodness of fit indicator
    // It will automatically recalculate the _goodnessOfFit when it isn't defined
    // This lazy approach is intended to prevent unneccesary calculations
    let i = 0
    let sse = 0
    sst = 0
    if (_goodnessOfFit === null) {
      if (X.length() >= 2) {
        while (i < X.length()) {
          sse += Math.pow((Y.get(i) - projectX(X.get(i))), 2)
          sst += Math.pow((Y.get(i) - Y.average()), 2)
          i++
        }
        switch (true) {
          case (sse === 0):
            _goodnessOfFit = 1
            break
          case (sse > sst):
            // This is a pretty bad fit as the error is bigger than just using the line for the average y as intercept
            _goodnessOfFit = 0
            break
          case (sst !== 0):
            _goodnessOfFit = 1 - (sse / sst)
            break
          default:
            // When SST = 0, R2 isn't defined
            _goodnessOfFit = 0
        }
      } else {
        _goodnessOfFit = 0
      }
    }
    return _goodnessOfFit
  }

  function normalizedSquareError (position) {
    if (sst === null) {
      // Force the calculation of the sst
      const dummy = goodnessOfFit()
    }
    if (sst > 0 && position < X.length()) {
      const squaredError = Math.pow((Y.get(position) - projectX(X.get(position))), 2)
      return Math.min(Math.max(1 - ((squaredError * X.length())/sst),0),1)
    } else {
      return 0
    }
  }

  function projectX (x) {
    if (X.length() >= 2) {
      calculateIntercept()
      return (_A * x) + _B
    } else {
      return 0
    }
  }

  function projectY (y) {
    if (X.length() >= 2 && _A !== 0) {
      calculateIntercept()
      return ((y - _B) / _A)
    } else {
      log.error('TS Linear Regressor, attempted a Y-projection while slope was zero!')
      return 0
    }
  }

  function calculateSlope (pointOne, pointTwo) {
    if (pointOne !== pointTwo && X.get(pointOne) !== X.get(pointTwo)) {
      return ((Y.get(pointTwo) - Y.get(pointOne)) / (X.get(pointTwo) - X.get(pointOne)))
    } else {
      log.error('TS Linear Regressor, Division by zero prevented!')
      return 0
    }
  }

  function calculateIntercept () {
    // Calculate all the intercepts for the newly added point and the newly calculated A, when needed
    // This function is only called when an intercept is really needed, as this saves a lot of CPU cycles when only a slope suffices
    const B = createLabelledBinarySearchTree()
    if (_B === null) {
      if (X.length() > 1) {
        // There are at least two points in the X and Y arrays, so let's calculate the intercept
        let i = 0
        while (i < X.length()) {
          // Please note , as we need to recreate the B-tree for each newly added datapoint anyway, the label i isn't relevant
          B.push(i, (Y.get(i) - (_A * X.get(i))))
          i++
        }
        _B = B.median()
      } else {
        _B = 0
      }
    }
    B.reset()
  }

  function reliable () {
    return (X.length() >= 2)
  }

  function reset () {
    if (X.length() > 0) {
      // There is something to reset
      X.reset()
      Y.reset()
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
    normalizedSquareError,
    projectX,
    projectY,
    reliable,
    reset
  }
}
