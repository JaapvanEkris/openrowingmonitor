'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  As this object is fundamental for most other utility objects, we must test its behaviour quite thoroughly
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createLabelledBinarySearchTree } from './BinarySearchTree.js'

test('Series behaviour with an empty tree', () => {
  const dataTree = createLabelledBinarySearchTree()
  testSize(dataTree, 0)
  testNumberOfValuesAbove(dataTree, 0, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 0)
  testMedian(dataTree, 0)
})

test('Tree behaviour with a single pushed value. Tree = [9]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(9)
  testSize(dataTree, 1)
  testNumberOfValuesAbove(dataTree, 0, 1)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 1)
  testMedian(dataTree, 9)
})

test('Tree behaviour with a second pushed value. Tree = [9, 3]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(9)
  dataTree.push(3)
  testSize(dataTree, 2)
  testNumberOfValuesAbove(dataTree, 0, 2)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
  testMedian(dataTree, 6)
})

test('Tree behaviour with a third pushed value. Tree = [9, 3, 6]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(9)
  dataTree.push(3)
  dataTree.push(6)
  testSize(dataTree, 3)
  testNumberOfValuesAbove(dataTree, 0, 3)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 3)
  testMedian(dataTree, 6)
})

test('Tree behaviour with a fourth pushed value. Tree = [3, 6, 12]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(9)
  dataTree.push(3)
  dataTree.push(6)
  dataTree.push(12)
  testSize(dataTree, 3)
  testNumberOfValuesAbove(dataTree, 0, 3)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 1)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
  testMedian(dataTree, 6)
})

test('Tree behaviour with a fifth pushed value. Series = [6, 12, -3]', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(9)
  dataTree.push(3)
  dataTree.push(6)
  dataTree.push(12)
  dataTree.push(-3)
  testSize(dataTree, 3)
  testNumberOfValuesAbove(dataTree, 0, 2)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 1)
  testNumberOfValuesAbove(dataTree, 10, 1)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 2)
  testMedian(dataTree, 6)
})

test('Tree behaviour with a five pushed values followed by a reset, Tree = []', () => {
  const dataTree = createLabelledBinarySearchTree()
  dataTree.push(9)
  dataTree.push(3)
  dataTree.push(6)
  dataTree.push(12)
  dataTree.push(-3)
  dataTree.reset()
  testSize(dataTree, 0)
  testNumberOfValuesAbove(dataTree, 0, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 0, 0)
  testNumberOfValuesAbove(dataTree, 10, 0)
  testNumberOfValuesEqualOrBelow(dataTree, 10, 0)
  testMedian(dataTree, 0)
})

function testSize (tree, expectedValue) {
  assert.ok(tree.size() === expectedValue, `Expected size should be ${expectedValue}, encountered ${tree.size()}`)
}

function testNumberOfValuesAbove (tree, cutoff, expectedValue) {
  assert.ok(tree.numberOfValuesAbove(cutoff) === expectedValue, `Expected numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered ${tree.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfValuesEqualOrBelow (tree, cutoff, expectedValue) {
  assert.ok(tree.numberOfValuesEqualOrBelow(cutoff) === expectedValue, `Expected numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered ${tree.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testMedian (tree, expectedValue) {
  assert.ok(tree.median() === expectedValue, `Expected median to be ${expectedValue}, encountered ${tree.median()}`)
}

test.run()
