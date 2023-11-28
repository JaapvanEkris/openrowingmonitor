'use strict'
/*
  Open Rowing Monitor, https://github.com/jaapvanekris/openrowingmonitor

  This creates an ordered series with labels
  It allows for efficient determining the Median, Number of Above and Below
*/

function createLabelledBinarySearchTree () {
  let tree = null

  function push (label, value) {
    if (tree === null) {
      tree = newNode(label, value)
    }
  }

  function size () {
    if (tree === null) {
      return 0
    } else {
      return tree.numberOfLeafsAndNodes
    }
  }

  function numberOfValuesAbove (testedValue) {
    return 0
  }

  function numberOfValuesEqualOrBelow (testedValue) {
    return 0
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

function newNode (label, value) {
  return {
    label,
    value,
    leftNode: null,
    rightNode: null,
    numberOfLeafsAndNodes: 1
  }
}

export { createLabelledBinarySearchTree }
