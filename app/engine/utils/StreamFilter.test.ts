'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file Tests of the TSLinearSeries module
 */
// @vitest-environment node
import { test, assert, describe } from 'vitest'
import { createStreamFilter } from './StreamFilter.ts'

describe('Initialisation of the StreamFilter object', () => {
/**
 * @description Test behaviour for no datapoints
 */
  test('average should be initValue on empty dataset', () => {
    const datapoints = createStreamFilter(3, 5.5)
    testReliable(datapoints, false)
    testClean(datapoints, 5.5)
  })
})

describe('Initialisation of the StreamFilter object', () => {
  test('an averager of length 1 should return the last added value', () => {
    const datapoints = createStreamFilter(3, 5.5)
    datapoints.push(9)
    testReliable(datapoints, true)
    testClean(datapoints, 9)
  })

  test('a median of length 2 should return average of the 2 added elements', () => {
    const datapoints = createStreamFilter(3, 5.5)
    datapoints.push(9)
    datapoints.push(4)
    testReliable(datapoints, true)
    testClean(datapoints, 6.5)
  })

  test('a median of three values should deliver the middle element', () => {
    const datapoints = createStreamFilter(3, 5.5)
    datapoints.push(9)
    datapoints.push(4)
    datapoints.push(3)
    testReliable(datapoints, true)
    testClean(datapoints, 4)
  })

  test('a median of three values should deliver the middle element, despite order', () => {
    const datapoints = createStreamFilter(3, 5.5)
    datapoints.push(4)
    datapoints.push(9)
    datapoints.push(3)
    testReliable(datapoints, true)
    testClean(datapoints, 4)
  })
})

describe('Push out behaviour of the StreamFilter object', () => {
  test('Pushing out elements of the StreamFilter', () => {
    const datapoints = createStreamFilter(3, 5.5)
    datapoints.push(9)
    datapoints.push(4)
    datapoints.push(3)
    datapoints.push(1)
    testReliable(datapoints, true)
    testClean(datapoints, 3)
  })
})

describe('Reset behaviour of the StreamFilter object', () => {
  test('elements outside of range should not be considered', () => {
    const datapoints = createStreamFilter(3, 5.5)
    datapoints.push(9)
    datapoints.push(4)
    datapoints.push(3)
    datapoints.push(1)
    datapoints.reset()
    testReliable(datapoints, false)
    testClean(datapoints, 5.5)
  })
})

function testClean (series, expectedValue) {
  assert.strictEqual(series.clean(), expectedValue, `Expected clean datapoint should be ${expectedValue}, encountered ${series.clean()}`)
}

function testReliable (series, expectedValue) {
  assert.strictEqual(series.reliable(), expectedValue, `Expected clean datapoint should be ${expectedValue}, encountered ${series.reliable()}`)
}
