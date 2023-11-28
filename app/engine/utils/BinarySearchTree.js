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
    } else {
      pushInTree(tree, label, value)
    }
  }

  function pushInTree (currentTree, label, value) {
    if (currentTree === null) {
      currentTree = newNode(label, value)
    } else {
      // We encounter a filled node
      if (currentTree.value >= value) {
        // value <= currentTree.value, so we need the value to the left branch
        pushInTree (currentTree.leftNode, label, value)
      } else {
        // currentTree.value < value, so we need to add the value to the right branch
        pushInTree (currentTree.rightNode, label, value)
      }
      currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes + 1
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
