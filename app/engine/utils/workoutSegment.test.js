'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module tests the behaviour of the workout segments
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createWorkoutSegment } from './utils/workoutSegment.js'

test('Test workoutSegment initialisation behaviour without setting an interval', () => {
  let startingPoint = {
    totalMovingTime: 0,
    totalMovingTime: 0
  }

  let endPoint = {
    totalMovingTime: 490,
    totalMovingTime: 2050
  }

  const testSegment = createWorkoutSegment()
  testSegment.testDistanceFromStart(startingPoint, NaN)
  testSegment.testTimeSinceStart(startingPoint, NaN)
  testSegment.testdistanceToEnd(startingPoint, NaN)
  testSegment.testTimeToEnd(startingPoint, NaN)
  testSegment.testIsEndReached(endPoint, false)
})

function testDistanceFromStart (testedSegment, expectedValue) {
  assert.ok(testedSegment.distanceFromStart() === expectedValue, `Expected distance from the start should be ${expectedValue}, encountered ${testedSegment.distanceFromStart()}`)
}

function testTimeSinceStart (testedSegment, expectedValue) {
  assert.ok(testedSegment.timeSinceStart() === expectedValue, `Expected time since start should be ${expectedValue}, encountered ${testedSegment.timeSinceStart()}`)
}

function testdistanceToEnd (testedSegment, expectedValue) {
  assert.ok(testedSegment.distanceToEnd() === expectedValue, `Expected distance from the end to be ${expectedValue}, encountered ${testedSegment.distanceToEnd()}`)
}

function testTimeToEnd (testedSegment, expectedValue) {
  assert.ok(testedSegment.timeToEnd() === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.timeToEnd()}`)
}

function testIsEndReached (testedSegment, expectedValue) {
  assert.ok(testedSegment.isEndReached() === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.isEndReached()}`)
}

test.run()
