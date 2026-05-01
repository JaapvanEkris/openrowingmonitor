/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This tests the Binary Search Tree. As this object is fundamental for the Theil-Sen regressors, it must be tested thoroughly
 */
// @vitest-environment node
import { test, assert, describe } from 'vitest'
import { createLabelledBinarySearchTree } from './BinarySearchTree.ts'

describe('Initialisation of the BinarySearchTree', () => {
/**
 * Test of the response on an empty tree
 */
  test('Series behaviour with an empty tree', () => {
    const dataTree = createLabelledBinarySearchTree()
    testSize(dataTree, 0)
    testReliable(dataTree, false)
    testNumberOfValuesAbove(dataTree, 0, undefined)
    testNumberOfValuesEqualOrBelow(dataTree, 0, undefined)
    testNumberOfValuesAbove(dataTree, 10, undefined)
    testNumberOfValuesEqualOrBelow(dataTree, 10, undefined)
    testMinimum(dataTree, undefined)
    testMaximum(dataTree, undefined)
    testMedian(dataTree, undefined)
    testTotalWeight(dataTree, 0)
    testReliableWeighted(dataTree, false)
    testWeightedMedian(dataTree, undefined)
  })
})

describe('Test behaviour of the BinarySearchTree when data is pushed', () => {
/**
 * Test of the response on a tree with just pushes
 */
  test('Tree behaviour with a single pushed value. Tree = [9]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 1)
    testOrderedSeries(dataTree, [9])
    testSize(dataTree, 1)
    testReliable(dataTree, true)
    testValueAtInorderPos(dataTree, 1, 9)
    testNumberOfValuesAbove(dataTree, 0, 1)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 0)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 1)
    testMinimum(dataTree, 9)
    testMaximum(dataTree, 9)
    testMedian(dataTree, 9)
    testTotalWeight(dataTree, 1)
    testReliableWeighted(dataTree, true)
    testWeightedMedian(dataTree, 9)
  })

  test('Tree behaviour with a second pushed value. Tree = [9, 3]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 1)
    dataTree.push(2, 3, 1)
    testOrderedSeries(dataTree, [3, 9])
    testSize(dataTree, 2)
    testReliable(dataTree, true)
    testTotalWeight(dataTree, 2)
    testReliableWeighted(dataTree, true)
    testValueAtInorderPos(dataTree, 1, 3)
    testValueAtInorderPos(dataTree, 2, 9)
    testNumberOfValuesAbove(dataTree, 0, 2)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 0)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
    testMinimum(dataTree, 3)
    testMaximum(dataTree, 9)
    testMedian(dataTree, 6)
    testWeightedMedian(dataTree, 6)
  })

  test('Tree behaviour with a third pushed value. Tree = [9, 3, 6]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 1)
    dataTree.push(2, 3, 1)
    dataTree.push(3, 6, 1)
    testOrderedSeries(dataTree, [3, 6, 9])
    testSize(dataTree, 3)
    testReliable(dataTree, true)
    testValueAtInorderPos(dataTree, 1, 3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 9)
    testNumberOfValuesAbove(dataTree, 0, 3)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 0)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 3)
    testMinimum(dataTree, 3)
    testMaximum(dataTree, 9)
    testMedian(dataTree, 6)
    testTotalWeight(dataTree, 3)
    testReliableWeighted(dataTree, true)
    testWeightedMedian(dataTree, 6)
  })

  test('Tree behaviour with three pushed value, with varying weights. Tree = [3, 6, 12]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 12, 1)
    dataTree.push(2, 3, 0)
    dataTree.push(3, 6, 1)
    testOrderedSeries(dataTree, [3, 6, 12])
    testSize(dataTree, 3)
    testReliable(dataTree, true)
    testValueAtInorderPos(dataTree, 1, 3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 12)
    testNumberOfValuesAbove(dataTree, 0, 3)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 1)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
    testMedian(dataTree, 6)
    testTotalWeight(dataTree, 2)
    testReliableWeighted(dataTree, true)
    testWeightedMedian(dataTree, 9)
  })
})

describe('Test behaviour of the BinarySearchTree when data is pushed and simple (leaf) removals', () => {
/**
 * Test of the response on a tree with inserts and removals
 */
  test('Tree behaviour with a fourth pushed value, with varying weights. Tree = [3, 6, 12]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 0.5)
    dataTree.push(2, 3, 0)
    dataTree.push(3, 6, 1)
    testSize(dataTree, 3)
    testReliable(dataTree, true)
    testTotalWeight(dataTree, 1.5)
    dataTree.remove(1)
    testSize(dataTree, 2)
    testReliable(dataTree, true)
    testTotalWeight(dataTree, 1)
    testReliableWeighted(dataTree, true)
    dataTree.push(4, 12, 1)
    testOrderedSeries(dataTree, [3, 6, 12])
    testSize(dataTree, 3)
    testReliable(dataTree, true)
    testTotalWeight(dataTree, 2)
    testValueAtInorderPos(dataTree, 1, 3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 12)
    testNumberOfValuesAbove(dataTree, 0, 3)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 1)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
    testMedian(dataTree, 6)
    testWeightedMedian(dataTree, 9)
  })

  test('Tree behaviour with a fifth pushed value. Series = [6, 12, -3]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 0)
    dataTree.push(2, 3, 0)
    dataTree.push(3, 6, 0)
    testOrderedSeries(dataTree, [3, 6, 9])
    testSize(dataTree, 3)
    testReliable(dataTree, true)
    testValueAtInorderPos(dataTree, 1, 3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 9)
    testNumberOfValuesAbove(dataTree, 0, 3)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 0)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 3)
    testMedian(dataTree, 6)
    testTotalWeight(dataTree, 0)
    testReliableWeighted(dataTree, false)
    testWeightedMedian(dataTree, undefined)
    dataTree.remove(1)
    testOrderedSeries(dataTree, [3, 6])
    dataTree.push(4, 12, 1)
    testOrderedSeries(dataTree, [3, 6, 12])
    dataTree.remove(2)
    testOrderedSeries(dataTree, [6, 12])
    dataTree.push(5, -3, 0)
    testOrderedSeries(dataTree, [-3, 6, 12])
    testSize(dataTree, 3)
    testReliable(dataTree, true)
    testValueAtInorderPos(dataTree, 1, -3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 12)
    testNumberOfValuesAbove(dataTree, 0, 2)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 1)
    testNumberOfValuesAbove(dataTree, 10, 1)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
    testMedian(dataTree, 6)
    testTotalWeight(dataTree, 1)
    testReliableWeighted(dataTree, true)
    testWeightedMedian(dataTree, 12)
  })
})

describe('Test behaviour of the BinarySearchTree when data is pushed and complex (node) removals', () => {
/**
 * Test of the response during complex removals (with subtrees being moved around)
 */
  test('Tree behaviour with complex removals. Series = [9, 6, 5, 8, 7, 9, 12, 10, 11]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 0.5)
    dataTree.push(2, 6, 0.5)
    dataTree.push(3, 5, 1)
    dataTree.push(4, 8, 0.5)
    dataTree.push(5, 7, 1)
    dataTree.push(6, 9, 1)
    dataTree.push(7, 12, 1)
    dataTree.push(8, 10, 1)
    dataTree.push(9, 11, 1)
    testOrderedSeries(dataTree, [5, 6, 7, 8, 9, 9, 10, 11, 12])
    testSize(dataTree, 9)
    testReliable(dataTree, true)
    testTotalWeight(dataTree, 7.5)
    testReliableWeighted(dataTree, true)
    testValueAtInorderPos(dataTree, 5, 9)
    testMinimum(dataTree, 5)
    testMaximum(dataTree, 12)
    testMedian(dataTree, 9)
    testMedian(dataTree, 9)
    dataTree.remove(1)
    testOrderedSeries(dataTree, [5, 6, 7, 8, 9, 10, 11, 12])
    testSize(dataTree, 8)
    testReliable(dataTree, true)
    testTotalWeight(dataTree, 7)
    testReliableWeighted(dataTree, true)
    testValueAtInorderPos(dataTree, 4, 8)
    testValueAtInorderPos(dataTree, 5, 9)
    testMedian(dataTree, 8.5)
    testWeightedMedian(dataTree, 9)
    dataTree.remove(3)
    testOrderedSeries(dataTree, [6, 7, 8, 9, 10, 11, 12])
    testSize(dataTree, 7)
    testReliable(dataTree, true)
    testTotalWeight(dataTree, 6)
    testValueAtInorderPos(dataTree, 4, 9)
    testMedian(dataTree, 9)
    testWeightedMedian(dataTree, 9.5)
  })

  // Test based on https://levelup.gitconnected.com/deletion-in-binary-search-tree-with-javascript-fded82e1791c
  test('Tree behaviour with complex removals. Series = [50, 30, 70, 20, 40, 60, 80]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 50, 1)
    dataTree.push(2, 30, 1)
    dataTree.push(3, 70, 0.5)
    dataTree.push(4, 20, 1)
    dataTree.push(5, 40, 1)
    dataTree.push(6, 60, 1)
    dataTree.push(7, 80, 0.5)
    testOrderedSeries(dataTree, [20, 30, 40, 50, 60, 70, 80])
    testSize(dataTree, 7)
    testReliable(dataTree, true)
    testTotalWeight(dataTree, 6)
    testReliableWeighted(dataTree, true)
    testValueAtInorderPos(dataTree, 4, 50)
    dataTree.remove(4)
    testOrderedSeries(dataTree, [30, 40, 50, 60, 70, 80])
    testSize(dataTree, 6)
    testReliable(dataTree, true)
    testValueAtInorderPos(dataTree, 3, 50)
    testValueAtInorderPos(dataTree, 4, 60)
    testMedian(dataTree, 55)
    testTotalWeight(dataTree, 5)
    testReliableWeighted(dataTree, true)
    testWeightedMedian(dataTree, 50)
    dataTree.remove(2)
    testOrderedSeries(dataTree, [40, 50, 60, 70, 80])
    testSize(dataTree, 5)
    testReliable(dataTree, true)
    testValueAtInorderPos(dataTree, 3, 60)
    testMedian(dataTree, 60)
    testReliableWeighted(dataTree, true)
    testWeightedMedian(dataTree, 55)
    dataTree.remove(1)
    testOrderedSeries(dataTree, [40, 60, 70, 80])
    testSize(dataTree, 4)
    testTotalWeight(dataTree, 3)
    testValueAtInorderPos(dataTree, 2, 60)
    testValueAtInorderPos(dataTree, 3, 70)
    testMedian(dataTree, 65)
    testReliableWeighted(dataTree, true)
    testWeightedMedian(dataTree, 60)
  })
})

describe('Test behaviour of the BinarySearchTree in edge cases', () => {
  test('Edge_01: Tree behaviour with three pushed values, with NO weights. Tree = [3, 6, 12]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 12, 0)
    dataTree.push(2, 3, 0)
    dataTree.push(3, 6, 0)
    testOrderedSeries(dataTree, [3, 6, 12])
    testSize(dataTree, 3)
    testReliable(dataTree, true)
    testValueAtInorderPos(dataTree, 1, 3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 12)
    testNumberOfValuesAbove(dataTree, 0, 3)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 1)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
    testMedian(dataTree, 6)
    testTotalWeight(dataTree, 0)
    testReliableWeighted(dataTree, false)
    testWeightedMedian(dataTree, undefined)
  })

  test('Edge_02: Tree behaviour with a four pushed values and a removal, resulting in a weightless tree. Series = [3, 6, 9]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 1)
    dataTree.push(2, 9, 0)
    dataTree.push(3, 3, 0)
    dataTree.push(4, 6, 0)
    testOrderedSeries(dataTree, [3, 6, 9, 9])
    testSize(dataTree, 4)
    testReliable(dataTree, true)
    testMedian(dataTree, 7.5)
    testTotalWeight(dataTree, 1)
    testReliableWeighted(dataTree, true)
    testWeightedMedian(dataTree, 9)
    dataTree.remove(1)
    testOrderedSeries(dataTree, [3, 6, 9])
    testSize(dataTree, 3)
    testReliable(dataTree, true)
    testMedian(dataTree, 6)
    testTotalWeight(dataTree, 0)
    testReliableWeighted(dataTree, false)
    testWeightedMedian(dataTree, undefined)
  })
})

describe('Test behaviour of the BinarySearchTree in heavy update scenarios', () => {
// These stress tests test the reliability of the binary search tree storage and balancing properties after a huge number of updates
  test('STRESS_Theoretical_01: Stress test of the BinarySearchTree with 6,400,000 random inserts', () => {
    const dataTree = createLabelledBinarySearchTree()

    dataTree.push(0.50, 0.50, 1)
    dataTree.push(0.25, 0.25, 1)
    dataTree.push(0.125, 0.125, 1)
    dataTree.push(0.375, 0.375, 1)
    dataTree.push(0.75, 0.75, 1)
    dataTree.push(0.625, 0.625, 1)
    dataTree.push(0.875, 0.875, 1)

    let j = 0
    let randomvalue
    while (j < 3200000) {
      randomvalue = Math.random()
      dataTree.push(randomvalue, randomvalue, 1)
      dataTree.push(randomvalue, 1 - randomvalue, 1)
      j++
    }
    testSize(dataTree, 6400007)
    testTotalWeight(dataTree, 6400007)
  }, 120000) // Timeout value in ms

  test('STRESS_Theoretical_02: Stress test of the BinarySearchTree with 6,400,000 identical inserts (balancing test)', () => {
    const dataTree = createLabelledBinarySearchTree()

    let j = 0
    while (j < 6400000) {
      dataTree.push(j, 1, 1)
      j++
    }
    testSize(dataTree, 6400000)
    testTotalWeight(dataTree, 6400000)
    testMinimum(dataTree, 1)
    testMaximum(dataTree, 1)
    testMedian(dataTree, 1)
  }, 90000) // Timeout value in ms

  test('STRESS_Theoretical_03: Stress test of the BinarySearchTree with 6,400,000 reverse ordered datapoints (balancing test)', () => {
    const dataTree = createLabelledBinarySearchTree()

    let j = 0
    while (j < 6400000) {
      dataTree.push(j, 6400000 - j, 1)
      j++
    }
    dataTree.push(6400000, 0, 1)
    testSize(dataTree, 6400001)
    testTotalWeight(dataTree, 6400001)
    testMinimum(dataTree, 0)
    testMaximum(dataTree, 6400000)
    testMedian(dataTree, 3200000)
  }, 90000) // Timeout value in ms

  test('STRESS_Theoretical_04: Stress test of the BinarySearchTree with 64,000 reverse ordered datapoints, with removals and readditon of 32,000 (balancing test)', () => {
    const dataTree = createLabelledBinarySearchTree()

    // Let's create the initial tree
    let j = 0
    while (j < 64000) {
      dataTree.push(j, 64000 - j, 1)
      j++
    }
    dataTree.push(64000, 0, 1)
    testSize(dataTree, 64001)
    testTotalWeight(dataTree, 64001)
    testMinimum(dataTree, 0)
    testMaximum(dataTree, 64000)
    testMedian(dataTree, 32000)

    // Let's remove the first 3200000 datapoints (cutting of the head of the tree)
    j = 0
    while (j < 32000) {
      dataTree.remove(j)
      j++
    }

    // Let's insert the datapoints again
    j = 0
    while (j < 32000) {
      dataTree.push(j, 64000 - j, 1)
      j++
    }
    testSize(dataTree, 64001)
    testTotalWeight(dataTree, 64001)
    testMinimum(dataTree, 0)
    testMaximum(dataTree, 64000)
    testMedian(dataTree, 32000)
  }, 240000) // Timeout value in ms
})

describe('Reset behaviour of the BinarySearchTree', () => {
/**
 * Test of the response on an empty tree
 */
  test('Tree behaviour with a five pushed values followed by a reset, Tree = []', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9)
    dataTree.push(2, 3)
    dataTree.push(3, 6)
    dataTree.push(4, 12)
    dataTree.push(5, -3)
    testOrderedSeries(dataTree, [-3, 3, 6, 9, 12])
    dataTree.reset()
    testSize(dataTree, 0)
    testTotalWeight(dataTree, 0)
    testNumberOfValuesAbove(dataTree, 0, undefined)
    testNumberOfValuesEqualOrBelow(dataTree, 0, undefined)
    testNumberOfValuesAbove(dataTree, 10, undefined)
    testNumberOfValuesEqualOrBelow(dataTree, 10, undefined)
    testMinimum(dataTree, undefined)
    testMaximum(dataTree, undefined)
    testMedian(dataTree, undefined)
    testWeightedMedian(dataTree, undefined)
  })
})

function testSize (tree: Readonly<TreeNode>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.size(), expectedValue, `Expected size should be ${expectedValue}, encountered ${tree.size()}`)
}

function testTotalWeight (tree: Readonly<TreeNode>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.totalWeight(), expectedValue, `Expected weight should be ${expectedValue}, encountered ${tree.totalWeight()}`)
}

function testNumberOfValuesAbove (tree: Readonly<TreeNode>, cutoff: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.numberOfValuesAbove(cutoff), expectedValue, `Expected numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered ${tree.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfValuesEqualOrBelow (tree: Readonly<TreeNode>, cutoff: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.numberOfValuesEqualOrBelow(cutoff), expectedValue, `Expected numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered ${tree.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testOrderedSeries (tree: Readonly<TreeNode>, expectedValue: Readonly<number[]>) {
  assert.strictEqual(tree.orderedSeries().toString(), expectedValue.toString(), `Expected ordered series to be ${expectedValue}, encountered ${tree.orderedSeries()}`)
}

function testValueAtInorderPos (tree: Readonly<TreeNode>, position: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.valueAtInorderPos(position), expectedValue, `Expected valueAtInorderPos(${position}) to be ${expectedValue}, encountered ${tree.valueAtInorderPos(position)}`)
}

function testMinimum (tree: Readonly<TreeNode>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.minimum(), expectedValue, `Expected minimum to be ${expectedValue}, encountered ${tree.minimum()}`)
}

function testMaximum (tree: Readonly<TreeNode>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.maximum(), expectedValue, `Expected maximum to be ${expectedValue}, encountered ${tree.maximum()}`)
}

function testMedian (tree: Readonly<TreeNode>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.median(), expectedValue, `Expected median to be ${expectedValue}, encountered ${tree.median()}`)
}

function testWeightedMedian (tree: Readonly<TreeNode>, expectedValue: Readonly<number>) {
  assert.strictEqual(tree.weightedMedian(), expectedValue, `Expected weighted median to be ${expectedValue}, encountered ${tree.weightedMedian()}`)
}

function testReliable (tree: Readonly<TreeNode>, expectedValue: Readonly<boolean>) {
  assert.strictEqual(tree.reliable(), expectedValue, `Expected reliable to be ${expectedValue}, encountered ${tree.reliable()}`)
}

function testReliableWeighted (tree: Readonly<TreeNode>, expectedValue: Readonly<boolean>) {
  assert.strictEqual(tree.reliableWeighted(), expectedValue, `Expected reliable to be ${expectedValue}, encountered ${tree.reliableWeighted()}`)
}
