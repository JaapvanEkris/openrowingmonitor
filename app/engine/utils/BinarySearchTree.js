'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This creates an ordered series with labels
  It allows for efficient determining the Median, Number of Above and Below
*/

function createLabelledBinarySearchTree () {
  const seriesArray = []
  let seriesSum = 0

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

  function sum () {
    return seriesSum
  }

  function median () {
    return 0
  }

  function orderedSeries () {
    return 0
  }

  function reset () {
    seriesSum = 0
  }

  return {
    push,
    size,
    numberOfValuesAbove,
    numberOfValuesEqualOrBelow,
    median,
    createLabelledBinarySearchTree,
    reset
  }
}

export { createLabelledBinarySearchTree }
