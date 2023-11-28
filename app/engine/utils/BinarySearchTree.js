'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This creates an ordered series with labels
  It allows for efficient determining the Median, Number of Above and Below
*/

function createLabelledBinarySearchTree () {
  function push (label, value) {
  }

  function size () {
    return 0
  }

  function numberOfValuesAbove (testedValue) {
    return 0
  }

  function numberOfValuesEqualOrBelow (testedValue) {
  }

  function median () {
    return 0
  }

  function orderedSeries () {
    return 0
  }

  function reset () {
  }

  return {
    push,
    size,
    numberOfValuesAbove,
    numberOfValuesEqualOrBelow,
    median,
    orderedSeries,
    reset
  }
}

export { createLabelledBinarySearchTree }
