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

describe('Test behaviour of the BinarySearchTree when data is pushed', () => {
/**
 * Test of the response on a tree with just pushes
 */
  test('Tree behaviour with a single pushed value. Tree = [9]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 1)
    testOrderedSeries(dataTree, [9])
    testSize(dataTree, 1)
    testTotalWeight(dataTree, 1)
    testValueAtInorderPos(dataTree, 1, 9)
    testNumberOfValuesAbove(dataTree, 0, 1)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 0)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 1)
    testMinimum(dataTree, 9)
    testMaximum(dataTree, 9)
    testMedian(dataTree, 9)
    testWeightedMedian(dataTree, 9)
  })

  test('Tree behaviour with a second pushed value. Tree = [9, 3]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 1)
    dataTree.push(2, 3, 1)
    testOrderedSeries(dataTree, [3, 9])
    testSize(dataTree, 2)
    testTotalWeight(dataTree, 2)
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
    testTotalWeight(dataTree, 3)
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
    testWeightedMedian(dataTree, 6)
  })

  test('Tree behaviour with three pushed value, with varying weights. Tree = [3, 6, 12]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 12, 1)
    dataTree.push(2, 3, 0)
    dataTree.push(3, 6, 1)
    testOrderedSeries(dataTree, [3, 6, 12])
    testSize(dataTree, 3)
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

  test('Tree behaviour with a three pushed values without weight (edge case). Series = [3, 6, 9]', () => {
    const dataTree = createLabelledBinarySearchTree()
    dataTree.push(1, 9, 0)
    dataTree.push(2, 3, 0)
    dataTree.push(3, 6, 0)
    testOrderedSeries(dataTree, [3, 6, 9])
    testSize(dataTree, 3)
    testTotalWeight(dataTree, 0)
    testValueAtInorderPos(dataTree, 1, 3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 9)
    testNumberOfValuesAbove(dataTree, 0, 3)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 0)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 3)
    testMedian(dataTree, 6)
    testWeightedMedian(dataTree, undefined)
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
    testTotalWeight(dataTree, 1.5)
    dataTree.remove(1)
    testSize(dataTree, 2)
    testTotalWeight(dataTree, 1)
    dataTree.push(4, 12, 1)
    testOrderedSeries(dataTree, [3, 6, 12])
    testSize(dataTree, 3)
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
    testTotalWeight(dataTree, 0)
    testValueAtInorderPos(dataTree, 1, 3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 9)
    testNumberOfValuesAbove(dataTree, 0, 3)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
    testNumberOfValuesAbove(dataTree, 10, 0)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 3)
    testMedian(dataTree, 6)
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
    testTotalWeight(dataTree, 1)
    testValueAtInorderPos(dataTree, 1, -3)
    testValueAtInorderPos(dataTree, 2, 6)
    testValueAtInorderPos(dataTree, 3, 12)
    testNumberOfValuesAbove(dataTree, 0, 2)
    testNumberOfValuesEqualOrBelow(dataTree, 0, 1)
    testNumberOfValuesAbove(dataTree, 10, 1)
    testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
    testMedian(dataTree, 6)
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
    testTotalWeight(dataTree, 7.5)
    testValueAtInorderPos(dataTree, 5, 9)
    testMinimum(dataTree, 5)
    testMaximum(dataTree, 12)
    testMedian(dataTree, 9)
    testMedian(dataTree, 9)
    dataTree.remove(1)
    testOrderedSeries(dataTree, [5, 6, 7, 8, 9, 10, 11, 12])
    testSize(dataTree, 8)
    testTotalWeight(dataTree, 7)
    testValueAtInorderPos(dataTree, 4, 8)
    testValueAtInorderPos(dataTree, 5, 9)
    testMedian(dataTree, 8.5)
    testWeightedMedian(dataTree, 9)
    dataTree.remove(3)
    testOrderedSeries(dataTree, [6, 7, 8, 9, 10, 11, 12])
    testSize(dataTree, 7)
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
    testTotalWeight(dataTree, 6)
    testValueAtInorderPos(dataTree, 4, 50)
    dataTree.remove(4)
    testOrderedSeries(dataTree, [30, 40, 50, 60, 70, 80])
    testSize(dataTree, 6)
    testTotalWeight(dataTree, 5)
    testValueAtInorderPos(dataTree, 3, 50)
    testValueAtInorderPos(dataTree, 4, 60)
    testMedian(dataTree, 55)
    testWeightedMedian(dataTree, 50)
    dataTree.remove(2)
    testOrderedSeries(dataTree, [40, 50, 60, 70, 80])
    testSize(dataTree, 5)
    testValueAtInorderPos(dataTree, 3, 60)
    testMedian(dataTree, 60)
    testWeightedMedian(dataTree, 55)
    dataTree.remove(1)
    testOrderedSeries(dataTree, [40, 60, 70, 80])
    testSize(dataTree, 4)
    testTotalWeight(dataTree, 3)
    testValueAtInorderPos(dataTree, 2, 60)
    testValueAtInorderPos(dataTree, 3, 70)
    testMedian(dataTree, 65)
    testWeightedMedian(dataTree, 60)
  })
})

describe('Reset bhaviour of the BinarySearchTree', () => {
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

function testSize (tree: TreeNode, expectedValue: number) {
  assert.strictEqual(tree.size(), expectedValue, `Expected size should be ${expectedValue}, encountered ${tree.size()}`)
}

function testTotalWeight (tree: TreeNode, expectedValue: number) {
  assert.strictEqual(tree.totalWeight(), expectedValue, `Expected weight should be ${expectedValue}, encountered ${tree.totalWeight()}`)
}

function testNumberOfValuesAbove (tree: TreeNode, cutoff: number, expectedValue: number) {
  assert.strictEqual(tree.numberOfValuesAbove(cutoff), expectedValue, `Expected numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered ${tree.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfValuesEqualOrBelow (tree: TreeNode, cutoff: number, expectedValue: number) {
  assert.strictEqual(tree.numberOfValuesEqualOrBelow(cutoff), expectedValue, `Expected numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered ${tree.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testOrderedSeries (tree: TreeNode, expectedValue: number[]) {
  assert.strictEqual(tree.orderedSeries().toString(), expectedValue.toString(), `Expected ordered series to be ${expectedValue}, encountered ${tree.orderedSeries()}`)
}

function testValueAtInorderPos (tree: TreeNode, position: number, expectedValue: number) {
  assert.strictEqual(tree.valueAtInorderPos(position), expectedValue, `Expected valueAtInorderPos(${position}) to be ${expectedValue}, encountered ${tree.valueAtInorderPos(position)}`)
}

function testMinimum (tree: TreeNode, expectedValue: number) {
  assert.strictEqual(tree.minimum(), expectedValue, `Expected minimum to be ${expectedValue}, encountered ${tree.minimum()}`)
}

function testMaximum (tree: TreeNode, expectedValue: number) {
  assert.strictEqual(tree.maximum(), expectedValue, `Expected maximum to be ${expectedValue}, encountered ${tree.maximum()}`)
}

function testMedian (tree: TreeNode, expectedValue: number) {
  assert.strictEqual(tree.median(), expectedValue, `Expected median to be ${expectedValue}, encountered ${tree.median()}`)
}

function testWeightedMedian (tree: TreeNode, expectedValue: number) {
  assert.strictEqual(tree.weightedMedian(), expectedValue, `Expected weighted median to be ${expectedValue}, encountered ${tree.weightedMedian()}`)
}
