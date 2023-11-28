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
    if (value <= currentTree.value) {
      // The value should be on the left side of currentTree
      if (currentTree.leftNode === null) {
        currentTree.leftNode = newNode(label, value)
      } else {
        pushInTree(currentTree.leftNode, label, value)
      }
    } else {
      // The value should be on the right side of currentTree
      if (currentTree.rightNode === null) {
        currentTree.rightNode = newNode(label, value)
      } else {
        pushInTree(currentTree.rightNode, label, value)
      }
    }
    currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes + 1
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

  function size () {
    if (tree === null) {
      return 0
    } else {
      return tree.numberOfLeafsAndNodes
    }
  }

  function numberOfValuesAbove (testedValue) {
    return countNumberOfValuesAboveInTree(tree, testedValue)
  }

  function countNumberOfValuesAboveInTree (currentTree, testedValue) {
    if (currentTree === null) {
      return 1
    } else {
      // We encounter a filled node
      if (currentTree.value > testedValue) {
        // testedValue < currentTree.value, so we can find the tested value in the left and right branch
        return (countNumberOfValuesAboveInTree(currentTree.leftNode, testedValue) + countNumberOfValuesAboveInTree(currentTree.rightNode, testedValue) + 1)
      } else {
        // currentTree.value < testedValue, so we need to find values from the right branch
        return countNumberOfValuesAboveInTree(currentTree.rightNode, testedValue)
      }
    }
  }

  function numberOfValuesEqualOrBelow (testedValue) {
    return countNumberOfValuesEqualOrBelowInTree(tree, testedValue)
  }

  function countNumberOfValuesEqualOrBelowInTree (currentTree, testedValue) {
    if (currentTree === null) {
      return 0
    } else {
      // We encounter a filled node
      if (currentTree.value <= testedValue) {
        // testedValue <= currentTree.value, so we can only find the tested value in the left branch
        return (countNumberOfValuesEqualOrBelowInTree(currentTree.leftNode, testedValue) + countNumberOfValuesEqualOrBelowInTree(currentTree.rightNode, testedValue) + 1)
      } else {
        // currentTree.value > testedValue, so we only need to look at the left branch
        return countNumberOfValuesEqualOrBelowInTree(currentTree.leftNode, testedValue)
      }
    }
  }

  function median () {
    return 0
  }

  function orderedSeries () {
    return orderedTree(tree)
  }

  function orderedTree (currentTree) {
    if (currentTree === null) {
      return []
    } else {
      // We encounter a filled node
      return [...orderedTree(currentTree.leftNode), currentTree.value, ...orderedTree(currentTree.rightNode)]
    }
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
