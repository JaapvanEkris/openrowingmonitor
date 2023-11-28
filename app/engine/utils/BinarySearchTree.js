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
      // pushInTree(tree, label, value)
      tree = pushInTree(tree, label, value)
    }
  }

  function pushInTree (currentTree, label, value) {
    if (value <= currentTree.value) {
      // The value should be on the left side of currentTree
      if (currentTree.leftNode === null) {
        currentTree.leftNode = newNode(label, value)
      } else {
        currentTree.leftNode = pushInTree(currentTree.leftNode, label, value)
      }
    } else {
      // The value should be on the right side of currentTree
      if (currentTree.rightNode === null) {
        currentTree.rightNode = newNode(label, value)
      } else {
        currentTree.rightNode = pushInTree(currentTree.rightNode, label, value)
      }
    }
    currentTree.numberOfLeafsAndNodes = currentTree.numberOfLeafsAndNodes + 1
    return currentTree
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
      return 0
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

  function remove (label) {
    if (tree !== null) {
      tree = removeFromTree(tree, label)
    }
  }

  function removeFromTree (currentTree, label) {
    // Clean up the underlying sub-trees first
    /* if (currentTree === null) {
      // Deze code zou hier overbodig moeten zijn!!!
      return null
    } */
    if (currentTree.leftNode !== null) {
      currentTree.leftNode = removeFromTree(currentTree.leftNode, label)
    }
    if (currentTree.rightNode !== null) {
      currentTree.rightNode = removeFromTree(currentTree.rightNode, label)
    }

    // Handle the situation when we need to remove the node itself
    if (currentTree.label === label) {
      // We need to remove the current node, the underlying sub-trees determin how it is resolved
      switch (true) {
        case (currentTree.leftNode === null && currentTree.rightNode === null):
          // As the underlying sub-trees are empty as well, we return an empty tree
          currentTree = null
          break
        case (currentTree.leftNode !== null && currentTree.rightNode === null):
          // As only the left node contains data, we can simply replace the removed node with the left sub-tree
          currentTree = currentTree.leftNode
          break
        case (currentTree.leftNode === null && currentTree.rightNode !== null):
          // As only the right node contains data, we can simply replace the removed node with the right sub-tree
          currentTree = currentTree.rightNode
          break
        case (currentTree.leftNode !== null && currentTree.rightNode !== null):
          // As all underlying sub-trees are filled, we need to be a bit smarter
          // As there are two potential nodes to use, we grasp the opportunity to try to balance the tree a bit more as it increases performance
          // ToDo
          break
      }
    }

    // Recalculate the tree size
    switch (true) {
      case (currentTree === null):
        // We are now an empty leaf, nothing to do here
        break
      case (currentTree.leftNode === null && currentTree.rightNode === null):
        // This is a filled leaf
        currentTree.numberOfLeafsAndNodes = 1
        break
      case (currentTree.leftNode !== null && currentTree.rightNode === null):
        currentTree.numberOfLeafsAndNodes = currentTree.leftNode.numberOfLeafsAndNodes + 1
        break
      case (currentTree.leftNode === null && currentTree.rightNode !== null):
        currentTree.numberOfLeafsAndNodes = currentTree.rightNode.numberOfLeafsAndNodes + 1
        break
      case (currentTree.leftNode !== null && currentTree.rightNode !== null):
        currentTree.numberOfLeafsAndNodes = currentTree.leftNode.numberOfLeafsAndNodes + currentTree.rightNode.numberOfLeafsAndNodes + 1
        break
    }
    return currentTree
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
    remove,
    size,
    numberOfValuesAbove,
    numberOfValuesEqualOrBelow,
    median,
    orderedSeries,
    reset
  }
}

export { createLabelledBinarySearchTree }
