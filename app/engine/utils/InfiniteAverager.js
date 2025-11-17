'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This implements an infinite averager
 */
export function createInfiniteAverager (initValue = 0, initDatapoints = 0) {
  let logValue = initValue * Math.log(initValue / initDatapoints)
  let totalValue = initValue
  let numberOfDatapoints = initDatapoints

  function push (datapoint) {
    if (datapoint > 0) {
      logValue += Math.log(datapoint)
      totalValue += datapoint
      numberOfDatapoints++
    }
  }

  function average () {
    if (numberOfDatapoints > 0) {
      return totalValue / numberOfDatapoints
    } else {
      return undefined
    }
  }

  function logAverage () {
    if (numberOfDatapoints > 0) {
      return Math.exp(logValue / numberOfDatapoints)
    } else {
      return undefined
    }
  }

  return {
    push,
    average, // @ToDo: decide whether average or logAverage will be used for this function
    logAverage
  }
}
