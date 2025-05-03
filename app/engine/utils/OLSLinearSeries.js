'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  The LinearSeries is a datatype that represents a Linear Series. It allows
  values to be retrieved (like a FiFo buffer, or Queue) but it also includes
  a Linear Regressor to determine the slope, intercept and R^2 of this timeseries
  of x any y coordinates through Simple Linear Regression.

  At creation it can be determined that the Time Series is limited (i.e. after it
  is filled, the oldest will be pushed out of the queue) or that the the time series
  is unlimited (will only expand). The latter is activated by calling the creation with
  an empty argument.

  please note that for unlimited series it is up to the calling function to handle resetting
  the Linear Series when needed through the reset() call.

  A key constraint is to prevent heavy calculations at the end (due to large
  array based curve fitting) as this function is also used to calculate
  drag at the end of the recovery phase, which might happen on a Pi zero

  This implementation uses concepts that are described here:
  https://www.colorado.edu/amath/sites/default/files/attached-files/ch12_0.pdf
*/

import { createSeries } from './Series.js'

import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

export function createOLSLinearSeries (maxSeriesLength = 0) {
  const X = createSeries(maxSeriesLength)
  const XX = createSeries(maxSeriesLength)
  const Y = createSeries(maxSeriesLength)
  const YY = createSeries(maxSeriesLength)
  const XY = createSeries(maxSeriesLength)
  let _slope = 0
  let _intercept = 0
  let _goodnessOfFit = 0

  function push (x, y) {
    if (x === undefined || isNaN(x) || y === undefined || isNaN(y)) { return }
    X.push(x)
    XX.push(x * x)
    Y.push(y)
    YY.push(y * y)
    XY.push(x * y)

    // Let's approximate the line through OLS
    if (X.length() >= 2 && X.sum() > 0) {
      _slope = (X.length() * XY.sum() - X.sum() * Y.sum()) / (X.length() * XX.sum() - X.sum() * X.sum())
      _intercept = (Y.sum() - (_slope * X.sum())) / X.length()
      const sse = YY.sum() - (_intercept * Y.sum()) - (_slope * XY.sum())
      const sst = YY.sum() - (Math.pow(Y.sum(), 2) / X.length())
      _goodnessOfFit = 1 - (sse / sst)
    } else {
      _slope = 0
      _intercept = 0
      _goodnessOfFit = 0
    }
  }

  function slope () {
    return _slope
  }

  function intercept () {
    return _intercept
  }

  function length () {
    return X.length()
  }

  function goodnessOfFit () {
    // This function returns the R^2 as a goodness of fit indicator
    if (X.length() >= 2) {
      return _goodnessOfFit
    } else {
      return 0
    }
  }

  function projectX (x) {
    if (X.length() >= 2) {
      return (_slope * x) + _intercept
    } else {
      return 0
    }
  }

  function projectY (y) {
    if (X.length() >= 2 && _slope !== 0) {
      return ((y - _intercept) / _slope)
    } else {
      log.error('OLS Regressor, attempted a Y-projection while slope was zero!')
      return 0
    }
  }

  function reliable () {
    return (X.length() >= 2 && _slope !== 0)
  }

  function reset () {
    X.reset()
    XX.reset()
    Y.reset()
    YY.reset()
    XY.reset()
    _slope = 0
    _intercept = 0
    _goodnessOfFit = 0
  }

  return {
    push,
    X,
    Y,
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
