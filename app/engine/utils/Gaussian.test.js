'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This tests the Gaussian Weight Kernel
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createGausianWeightFunction } from './Gausian.js'

/**
 * Test of the weight function in the basic -1 to +1 domain
 */
test('Test of weight function for basic -1 to +1 domain', () => {
  const gausianWeight = createGausianWeightFunction()
  gausianWeight.setWindowWidth(-1 , 1)
  testWeight(gausianWeight, -1.125, 0)
  testWeight(gausianWeight, -1, 0.6065306597126334)
  testWeight(gausianWeight, -0.875, 0.6819407511903481)
  testWeight(gausianWeight, -0.75, 0.7548396019890073)
  testWeight(gausianWeight, -0.625, 0.8225775623986646)
  testWeight(gausianWeight, -0.5, 0.8824969025845955)
  testWeight(gausianWeight, -0.375, 0.9321024923595276)
  testWeight(gausianWeight, -0.25, 0.9692332344763441)
  testWeight(gausianWeight, -0.125, 0.9922179382602435)
  testWeight(gausianWeight, 0, 1)
  testWeight(gausianWeight, 0.125, 0.9922179382602435)
  testWeight(gausianWeight, 0.25, 0.9692332344763441)
  testWeight(gausianWeight, 0.375, 0.9321024923595276)
  testWeight(gausianWeight, 0.5, 0.8824969025845955)
  testWeight(gausianWeight, 0.625, 0.8225775623986646)
  testWeight(gausianWeight, 0.75, 0.7548396019890073)
  testWeight(gausianWeight, 0.875, 0.6819407511903481)
  testWeight(gausianWeight, 1, 0.6065306597126334)
  testWeight(gausianWeight, 1.125, 0)
})

/**
 * Test of the weight function in the -10 to +10 domain
 */
test('Test of weight function for basic -10 to +10 domain', () => {
  const gausianWeight = createGausianWeightFunction()
  gausianWeight.setWindowWidth(-10 , 10)
  testWeight(gausianWeight, -11.25, 0)
  testWeight(gausianWeight, -10, 0.6065306597126334)
  testWeight(gausianWeight, -8.75, 0.6819407511903481)
  testWeight(gausianWeight, -7.5, 0.7548396019890073)
  testWeight(gausianWeight, -6.25, 0.8225775623986646)
  testWeight(gausianWeight, -5, 0.8824969025845955)
  testWeight(gausianWeight, -3.75, 0.9321024923595276)
  testWeight(gausianWeight, -2.5, 0.9692332344763441)
  testWeight(gausianWeight, -1.25, 0.9922179382602435)
  testWeight(gausianWeight, 0, 1)
  testWeight(gausianWeight, 1.25, 0.9922179382602435)
  testWeight(gausianWeight, 2.5, 0.9692332344763441)
  testWeight(gausianWeight, 3.75, 0.9321024923595276)
  testWeight(gausianWeight, 5, 0.8824969025845955)
  testWeight(gausianWeight, 6.25, 0.8225775623986646)
  testWeight(gausianWeight, 7.5, 0.7548396019890073)
  testWeight(gausianWeight, 8.75, 0.6819407511903481)
  testWeight(gausianWeight, 10, 0.6065306597126334)
  testWeight(gausianWeight, 11.25, 0)
})

/**
 * Test of the weight function in the 100 to 120 domain
 */
test('Test of weight function for basic 100 to +120 domain', () => {
  const gausianWeight = createGausianWeightFunction()
  gausianWeight.setWindowWidth(100 , 120)
  testWeight(gausianWeight, 98.75, 0)
  testWeight(gausianWeight, 100, 0.6065306597126334)
  testWeight(gausianWeight, 101.25, 0.6819407511903481)
  testWeight(gausianWeight, 102.5, 0.7548396019890073)
  testWeight(gausianWeight, 103.75, 0.8225775623986646)
  testWeight(gausianWeight, 105, 0.8824969025845955)
  testWeight(gausianWeight, 106.25, 0.9321024923595276)
  testWeight(gausianWeight, 107.5, 0.9692332344763441)
  testWeight(gausianWeight, 108.75, 0.9922179382602435)
  testWeight(gausianWeight, 110, 1)
  testWeight(gausianWeight, 111.25, 0.9922179382602435)
  testWeight(gausianWeight, 112.5, 0.9692332344763441)
  testWeight(gausianWeight, 113.75, 0.9321024923595276)
  testWeight(gausianWeight, 115, 0.8824969025845955)
  testWeight(gausianWeight, 116.25, 0.8225775623986646)
  testWeight(gausianWeight, 117.5, 0.7548396019890073)
  testWeight(gausianWeight, 118.75, 0.6819407511903481)
  testWeight(gausianWeight, 120, 0.6065306597126334)
  testWeight(gausianWeight, 121.25, 0)
})

function testWeight (weightFunction, xValue, expectedValue) {
  assert.ok(weightFunction.weight(xValue) === expectedValue, `Weight should be should be ${expectedValue} at x = ${xValue}, is ${weightFunction.weight(xValue)}`)
}

test.run()
