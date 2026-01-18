'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This tests all functions of the CyclicErrorCorrection filter
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createCyclicErrorFilter } from './CyclicErrorFilter.js'

const baseRowerConfig = {
 numOfImpulsesPerRevolution: 2,
 flankLength: 4,
 autoAdjustDragFactor: true,
 systematicErrorAgressiveness: 1.0,
 systematicErrorNumberOfDatapoints: 20,
 minimumTimeBetweenImpulses: 0.5,
 maximumTimeBetweenImpulses: 1
}

function baseRegressionFunction () {
  /**
   * @todo Implement a basic regression function to measure the noise residu
   */
}

/**
 * @descrition This test to verify filter initial behaviour. 
 * As no changes have been made to the filter profiles, one would expect that clean = raw values, and a Goodness of Fit of 1 inside the domain
 */
test('Correct behaviour of the filter directly after initialisation, withou filter updates, including domain filter behaviour and sync with flank', () => {
  let cleanCurrentDt
  let currentDtAtSeriesBegin
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)
  cleanCurrentDt = CECFilter.applyFilter(1.6, 5)
  testCleanValueEquals(cleanCurrentDt, 1.6)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.5, 6)
  testCleanValueEquals(cleanCurrentDt, 1.5)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.4, 7)
  testCleanValueEquals(cleanCurrentDt, 1.4)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.04000000000000007)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.3, 8)
  testCleanValueEquals(cleanCurrentDt, 1.3)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.15999999999999992)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.6)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.6)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.000001)
  cleanCurrentDt = CECFilter.applyFilter(1.2, 9)
  testCleanValueEquals(cleanCurrentDt, 1.2)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.3600000000000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.5)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.5)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.000001)
  cleanCurrentDt = CECFilter.applyFilter(1.1, 10)
  testCleanValueEquals(cleanCurrentDt, 1.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.6399999999999997)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.4)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.4)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.04000000000000007)
  cleanCurrentDt = CECFilter.applyFilter(1.0, 11)
  testCleanValueEquals(cleanCurrentDt, 1.0)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.3)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.3)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.15999999999999992)
  cleanCurrentDt = CECFilter.applyFilter(0.9, 12)
  testCleanValueEquals(cleanCurrentDt, 0.9)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.2)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.2)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.3600000000000001)
  cleanCurrentDt = CECFilter.applyFilter(0.8, 13)
  testCleanValueEquals(cleanCurrentDt, 0.8)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.1)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.1)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.6399999999999997)
  cleanCurrentDt = CECFilter.applyFilter(0.7, 14)
  testCleanValueEquals(cleanCurrentDt, 0.7)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.6, 15)
  testCleanValueEquals(cleanCurrentDt, 0.6)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.9)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.9)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.5, 16)
  testCleanValueEquals(cleanCurrentDt, 0.5)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.8)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.8)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.4, 17)
  testCleanValueEquals(cleanCurrentDt, 0.4)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.6400000000000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.7)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.7)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.3, 18)
  testCleanValueEquals(cleanCurrentDt, 0.3)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.36)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.6)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.6)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.2, 19)
  testCleanValueEquals(cleanCurrentDt, 0.2)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.16000000000000003)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.5)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.5)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.1, 20)
  testCleanValueEquals(cleanCurrentDt, 0.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.03999999999999998)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.4)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.4)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.6400000000000001)
  cleanCurrentDt = CECFilter.applyFilter(0.0, 21)
  testCleanValueEquals(cleanCurrentDt, 0.0)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.3)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.3)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.36)
  cleanCurrentDt = CECFilter.applyFilter(-0.1, 22)
  testCleanValueEquals(cleanCurrentDt, -0.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.2)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.2)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.16000000000000003)
})

/**
 * @todo Add test to verify correct updates of the filters due to known noise
 */

/**
 * @todo Add test to verify good application of non-identity filters
 */

function testCleanValueEquals (object, expectedValue) {
  assert.ok(object.clean === expectedValue, `Expected cleaned currentDt  value to be ${expectedValue}, encountered ${object.clean}`)
}

function testGoodnessOfFitEquals (object, expectedValue) {
  assert.ok(object.goodnessOfFit === expectedValue, `Expected goodnessOfFit to be ${expectedValue}, encountered ${object.goodnessOfFit}`)
}

function testRawValueAtBeginEquals (object, expectedValue) {
  assert.ok(object.raw === expectedValue, `Expected raw value atSeriesBegin() to be ${expectedValue}, encountered ${object.raw}`)
}

function testCleanValueAtBeginEquals (object, expectedValue) {
  assert.ok(object.clean === expectedValue, `Expected clean value atSeriesBegin() to be ${expectedValue}, encountered ${object.clean}`)
}

function testGoodnessOfFitAtBeginEquals (object, expectedValue) {
  assert.ok(object.goodnessOfFit === expectedValue, `Expected goodnessOfFit atSeriesBegin() to be ${expectedValue}, encountered ${object.goodnessOfFit}`)
}

test.run()
