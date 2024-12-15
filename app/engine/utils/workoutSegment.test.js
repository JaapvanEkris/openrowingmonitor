'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module tests the behaviour of the workout segments
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createWorkoutSegment } from './workoutSegment.js'

test('Test workoutSegment initialisation behaviour without setting an interval', () => {
  const startingPoint = {
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const endPoint = {
    totalMovingTime: 490,
    totalLinearDistance: 2050
  }

  const testSegment = createWorkoutSegment()
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, 0)
  testTimeToEnd(testSegment, startingPoint, 0)
  testIsEndReached(testSegment, endPoint, false)
})

function testDistanceFromStart (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.distanceFromStart(testedDatapoint) === expectedValue, `Expected distance from the start should be ${expectedValue}, encountered ${testedSegment.distanceFromStart(testedDatapoint)}`)
}

function testTimeSinceStart (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.timeSinceStart(testedDatapoint) === expectedValue, `Expected time since start should be ${expectedValue}, encountered ${testedSegment.timeSinceStart(testedDatapoint)}`)
}

function testdistanceToEnd (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.distanceToEnd(testedDatapoint) === expectedValue, `Expected distance from the end to be ${expectedValue}, encountered ${testedSegment.distanceToEnd(testedDatapoint)}`)
}

function testTimeToEnd (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.timeToEnd(testedDatapoint) === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.timeToEnd(testedDatapoint)}`)
}

function testIsEndReached (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.isEndReached(testedDatapoint) === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.isEndReached(testedDatapoint)}`)
}

test.run()
