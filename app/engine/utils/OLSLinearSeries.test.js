'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createOLSLinearSeries } from './OLSLinearSeries.js'

test('Correct behaviour of a series after initialisation', () => {
  const dataSeries = createOLSLinearSeries(3)
  testLength(dataSeries, 0)
  testXAtSeriesBegin(dataSeries, 0)
  testYAtSeriesBegin(dataSeries, 0)
  testXAtSeriesEnd(dataSeries, 0)
  testYAtSeriesEnd(dataSeries, 0)
  testNumberOfXValuesAbove(dataSeries, 0, 0)
  testNumberOfYValuesAbove(dataSeries, 0, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 0)
  testXSum(dataSeries, 0)
  testYSum(dataSeries, 0)
  testSlopeEquals(dataSeries, 0)
  testInterceptEquals(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
})

test('Correct behaviour of a series after several puhed values, function y = 3x + 6, noisefree, 1 datapoint', () => {
  const dataSeries = createOLSLinearSeries(3)
  testLength(dataSeries, 0)
  dataSeries.push(5, 9)
  testLength(dataSeries, 1)
  testXAtSeriesBegin(dataSeries, 5)
  testYAtSeriesBegin(dataSeries, 9)
  testXAtSeriesEnd(dataSeries, 5)
  testYAtSeriesEnd(dataSeries, 9)
  testNumberOfXValuesAbove(dataSeries, 0, 1)
  testNumberOfYValuesAbove(dataSeries, 0, 1)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 1)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 1)
  testXSum(dataSeries, 5)
  testYSum(dataSeries, 9)
  testSlopeEquals(dataSeries, 0)
  testInterceptEquals(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
})

test('Correct behaviour of a series after several puhed values, function y = 3x + 6, noisefree, 2 datapoints', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  testLength(dataSeries, 2)
  testXAtSeriesBegin(dataSeries, 5)
  testYAtSeriesBegin(dataSeries, 9)
  testXAtSeriesEnd(dataSeries, 3)
  testYAtSeriesEnd(dataSeries, 3)
  testNumberOfXValuesAbove(dataSeries, 0, 2)
  testNumberOfYValuesAbove(dataSeries, 0, 2)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 2)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
  testXSum(dataSeries, 8)
  testYSum(dataSeries, 12)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Correct behaviour of a series after several puhed values, function y = 3x + 6, noisefree, 3 datapoints', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  testLength(dataSeries, 3)
  testXAtSeriesBegin(dataSeries, 5)
  testYAtSeriesBegin(dataSeries, 9)
  testXAtSeriesEnd(dataSeries, 4)
  testYAtSeriesEnd(dataSeries, 6)
  testNumberOfXValuesAbove(dataSeries, 0, 3)
  testNumberOfYValuesAbove(dataSeries, 0, 3)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 3)
  testXSum(dataSeries, 12)
  testYSum(dataSeries, 18)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Correct behaviour of a series after several puhed values, function y = 3x + 6, noisefree, 4 datapoints', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  testLength(dataSeries, 3)
  testXAtSeriesBegin(dataSeries, 3)
  testYAtSeriesBegin(dataSeries, 3)
  testXAtSeriesEnd(dataSeries, 6)
  testYAtSeriesEnd(dataSeries, 12)
  testNumberOfXValuesAbove(dataSeries, 0, 3)
  testNumberOfYValuesAbove(dataSeries, 0, 3)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 1)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
  testXSum(dataSeries, 13)
  testYSum(dataSeries, 21)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Correct behaviour of a series after several puhed values, function y = 3x + 6, noisefree, 5 datapoints', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  testLength(dataSeries, 3)
  testXAtSeriesBegin(dataSeries, 4)
  testYAtSeriesBegin(dataSeries, 6)
  testXAtSeriesEnd(dataSeries, 1)
  testYAtSeriesEnd(dataSeries, -3)
  testNumberOfXValuesAbove(dataSeries, 0, 3)
  testNumberOfYValuesAbove(dataSeries, 0, 2)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 1)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 1)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
  testXSum(dataSeries, 11)
  testYSum(dataSeries, 15)
  testSlopeEquals(dataSeries, 3)
  testInterceptEquals(dataSeries, -6)
  testGoodnessOfFitEquals(dataSeries, 1)
})

test('Correct behaviour of a series after several puhed values, function y = 3x + 6, noisefree, 4 datapoints and a reset', () => {
  const dataSeries = createOLSLinearSeries(3)
  dataSeries.push(5, 9)
  dataSeries.push(3, 3)
  dataSeries.push(4, 6)
  dataSeries.push(6, 12)
  dataSeries.reset()
  testLength(dataSeries, 0)
  testXAtSeriesBegin(dataSeries, 0)
  testYAtSeriesBegin(dataSeries, 0)
  testXAtSeriesEnd(dataSeries, 0)
  testYAtSeriesEnd(dataSeries, 0)
  testNumberOfXValuesAbove(dataSeries, 0, 0)
  testNumberOfYValuesAbove(dataSeries, 0, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
  testNumberOfXValuesAbove(dataSeries, 10, 0)
  testNumberOfYValuesAbove(dataSeries, 10, 0)
  testNumberOfXValuesEqualOrBelow(dataSeries, 10, 0)
  testNumberOfYValuesEqualOrBelow(dataSeries, 10, 0)
  testXSum(dataSeries, 0)
  testYSum(dataSeries, 0)
  testSlopeEquals(dataSeries, 0)
  testInterceptEquals(dataSeries, 0)
  testGoodnessOfFitEquals(dataSeries, 0)
})

test('Series with 5 elements, with 2 noisy datapoints', () => {
  const dataSeries = createOLSLinearSeries(5)
  dataSeries.push(5, 9)
  dataSeries.push(3, 2)
  dataSeries.push(4, 7)
  dataSeries.push(6, 12)
  dataSeries.push(1, -3)
  testSlopeBetween(dataSeries, 2.9, 3.1)
  testInterceptBetween(dataSeries, -6.3, -5.8)
  testGoodnessOfFitBetween(dataSeries, 0.9, 1.0)
})

function testLength (series, expectedValue) {
  assert.ok(series.length() === expectedValue, `Expected length should be ${expectedValue}, encountered a ${series.length()}`)
}

function testXAtSeriesBegin (series, expectedValue) {
  assert.ok(series.X.atSeriesBegin() === expectedValue, `Expected X.atSeriesBegin to be ${expectedValue}, encountered a ${series.X.atSeriesBegin()}`)
}

function testYAtSeriesBegin (series, expectedValue) {
  assert.ok(series.Y.atSeriesBegin() === expectedValue, `Expected Y.atSeriesBegin to be ${expectedValue}, encountered a ${series.Y.atSeriesBegin()}`)
}

function testXAtSeriesEnd (series, expectedValue) {
  assert.ok(series.X.atSeriesEnd() === expectedValue, `Expected X.atSeriesEnd to be ${expectedValue}, encountered a ${series.X.atSeriesEnd()}`)
}

function testYAtSeriesEnd (series, expectedValue) {
  assert.ok(series.Y.atSeriesEnd() === expectedValue, `Expected Y.atSeriesEnd to be ${expectedValue}, encountered a ${series.Y.atSeriesEnd()}`)
}

function testNumberOfXValuesAbove (series, cutoff, expectedValue) {
  assert.ok(series.X.numberOfValuesAbove(cutoff) === expectedValue, `Expected X.numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered a ${series.X.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfYValuesAbove (series, cutoff, expectedValue) {
  assert.ok(series.Y.numberOfValuesAbove(cutoff) === expectedValue, `Expected Y.numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered a ${series.Y.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfXValuesEqualOrBelow (series, cutoff, expectedValue) {
  assert.ok(series.X.numberOfValuesEqualOrBelow(cutoff) === expectedValue, `Expected X.numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered a ${series.X.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testNumberOfYValuesEqualOrBelow (series, cutoff, expectedValue) {
  assert.ok(series.Y.numberOfValuesEqualOrBelow(cutoff) === expectedValue, `Expected Y.numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered a ${series.Y.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testXSum (series, expectedValue) {
  assert.ok(series.X.sum() === expectedValue, `Expected X.sum to be ${expectedValue}, encountered a ${series.X.sum()}`)
}

function testYSum (series, expectedValue) {
  assert.ok(series.Y.sum() === expectedValue, `Expected y.Sum to be ${expectedValue}, encountered a ${series.Y.sum()}`)
}

function testSlopeEquals (series, expectedValue) {
  assert.ok(series.slope() === expectedValue, `Expected slope to be ${expectedValue}, encountered a ${series.slope()}`)
}

function testSlopeBetween (series, expectedValueAbove, expectedValueBelow) {
  assert.ok(series.slope() > expectedValueAbove, `Expected slope to be above ${expectedValueAbove}, encountered a ${series.slope()}`)
  assert.ok(series.slope() < expectedValueBelow, `Expected slope to be below ${expectedValueBelow}, encountered a ${series.slope()}`)
}

function testInterceptEquals (series, expectedValue) {
  assert.ok(series.intercept() === expectedValue, `Expected intercept to be ${expectedValue}, encountered ${series.intercept()}`)
}

function testInterceptBetween (series, expectedValueAbove, expectedValueBelow) {
  assert.ok(series.intercept() > expectedValueAbove, `Expected intercept to be above ${expectedValueAbove}, encountered ${series.intercept()}`)
  assert.ok(series.intercept() < expectedValueBelow, `Expected intercept to be below ${expectedValueBelow}, encountered ${series.intercept()}`)
}

function testGoodnessOfFitEquals (series, expectedValue) {
  assert.ok(series.goodnessOfFit() === expectedValue, `Expected goodnessOfFit to be ${expectedValue}, encountered ${series.goodnessOfFit()}`)
}

function testGoodnessOfFitBetween (series, expectedValueAbove, expectedValueBelow) {
  assert.ok(series.goodnessOfFit() > expectedValueAbove, `Expected goodnessOfFit to be above ${expectedValueAbove}, encountered ${series.goodnessOfFit()}`)
  assert.ok(series.goodnessOfFit() < expectedValueBelow, `Expected goodnessOfFit to be below ${expectedValueBelow}, encountered ${series.goodnessOfFit()}`)
}

test.run()
