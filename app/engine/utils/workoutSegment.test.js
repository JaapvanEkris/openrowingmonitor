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

  const testSegment = createWorkoutSegment()
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, undefined)
  testTimeToEnd(testSegment, startingPoint, undefined)
  testTargetTime(testSegment, undefined)
  testTargetDistance(testSegment, undefined)
  testIsEndReached(testSegment, startingPoint, false)
})

test('Test workoutSegment initialisation behaviour without setting an interval, after 2050 meters', () => {
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
  testdistanceToEnd(testSegment, startingPoint, undefined)
  testTimeToEnd(testSegment, startingPoint, undefined)
  testTargetTime(testSegment, undefined)
  testTargetDistance(testSegment, undefined)
  testIsEndReached(testSegment, startingPoint, false)
  testDistanceFromStart(testSegment, endPoint, 2050)
  testTimeSinceStart(testSegment, endPoint, 490)
  testdistanceToEnd(testSegment, endPoint, undefined)
  testTimeToEnd(testSegment, endPoint, undefined)
  testIsEndReached(testSegment, endPoint, false)
})

test('Test workoutSegment behaviour with setting a distance interval', () => {
  const distanceInterval = {
    type: 'distance',
    targetDistance: 2025,
    targetTime: 0,
    split: {
      type: 'distance',
      targetDistance: 500,
      targetTime: 0
    }
  }

  const startingPoint = {
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const middlePoint = {
    totalMovingTime: 480,
    totalLinearDistance: 2000
  }

  const endPoint = {
    totalMovingTime: 490,
    totalLinearDistance: 2050
  }

  const testSegment = createWorkoutSegment()
  testSegment.setStart(startingPoint)
  testSegment.setEnd(distanceInterval)
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, 2025)
  testTimeToEnd(testSegment, startingPoint, undefined)
  testIsEndReached(testSegment, startingPoint, false)
  testDistanceFromStart(testSegment, middlePoint, 2000)
  testTimeSinceStart(testSegment, middlePoint, 480)
  testdistanceToEnd(testSegment, middlePoint, 25)
  testTimeToEnd(testSegment, middlePoint, undefined)
  testIsEndReached(testSegment, middlePoint, false)
  testDistanceFromStart(testSegment, endPoint, 2050)
  testTimeSinceStart(testSegment, endPoint, 490)
  testdistanceToEnd(testSegment, endPoint, -25)
  testTimeToEnd(testSegment, endPoint, undefined)
  testIsEndReached(testSegment, endPoint, true)
  testExtrapolation(testSegment, middlePoint, endPoint, 485, 2025)
})

test('Test workoutSegment behaviour with setting a time interval', () => {
  const distanceInterval = {
    type: 'time',
    targetDistance: 0,
    targetTime: 485,
    split: {
      type: 'time',
      targetDistance: 0,
      targetTime: 60
    }
  }

  const startingPoint = {
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const middlePoint = {
    totalMovingTime: 480,
    totalLinearDistance: 2000
  }

  const endPoint = {
    totalMovingTime: 490,
    totalLinearDistance: 2050
  }

  const testSegment = createWorkoutSegment()
  testSegment.setStart(startingPoint)
  testSegment.setEnd(distanceInterval)
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, undefined)
  testTimeToEnd(testSegment, startingPoint, 485)
  testIsEndReached(testSegment, startingPoint, false)
  testDistanceFromStart(testSegment, middlePoint, 2000)
  testTimeSinceStart(testSegment, middlePoint, 480)
  testdistanceToEnd(testSegment, middlePoint, undefined)
  testTimeToEnd(testSegment, middlePoint, 5)
  testIsEndReached(testSegment, middlePoint, false)
  testDistanceFromStart(testSegment, endPoint, 2050)
  testTimeSinceStart(testSegment, endPoint, 490)
  testdistanceToEnd(testSegment, endPoint, undefined)
  testTimeToEnd(testSegment, endPoint, -5)
  testIsEndReached(testSegment, endPoint, true)
  testExtrapolation(testSegment, middlePoint, endPoint, 485, 2025)
})

test('Test split behaviour when setting a distance interval', () => {
  const distanceInterval = {
    type: 'distance',
    targetDistance: 2025,
    targetTime: 0,
    split: {
      type: 'distance',
      targetDistance: 500,
      targetTime: 0
    }
  }

  const startingPoint = {
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const middlePoint = {
    totalMovingTime: 118,
    totalLinearDistance: 490
  }

  const endPoint = {
    totalMovingTime: 122,
    totalLinearDistance: 510
  }

  const testSegment = createWorkoutSegment()
  const testSplit = createWorkoutSegment()
  testSegment.setStart(startingPoint)
  testSegment.setEnd(distanceInterval)
  testSplit.setStart(startingPoint)
  testSplit.setEnd(testSegment.getSplit())
  testDistanceFromStart(testSplit, startingPoint, 0)
  testTimeSinceStart(testSplit, startingPoint, 0)
  testdistanceToEnd(testSplit, startingPoint, 500)
  testTimeToEnd(testSplit, startingPoint, undefined)
  testIsEndReached(testSplit, startingPoint, false)
  testDistanceFromStart(testSplit, middlePoint, 490)
  testTimeSinceStart(testSplit, middlePoint, 118)
  testdistanceToEnd(testSplit, middlePoint, 10)
  testTimeToEnd(testSplit, middlePoint, undefined)
  testIsEndReached(testSplit, middlePoint, false)
  testDistanceFromStart(testSplit, endPoint, 510)
  testTimeSinceStart(testSplit, endPoint, 122)
  testdistanceToEnd(testSplit, endPoint, -10)
  testTimeToEnd(testSplit, endPoint, undefined)
  testIsEndReached(testSplit, endPoint, true)
  testExtrapolation(testSplit, middlePoint, endPoint, 120, 500)
})

test('Test split behaviour with setting a time interval', () => {
  const distanceInterval = {
    type: 'time',
    targetDistance: 0,
    targetTime: 485,
    split: {
      type: 'time',
      targetDistance: 0,
      targetTime: 120
    }
  }
  const startingPoint = {
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const middlePoint = {
    totalMovingTime: 118,
    totalLinearDistance: 490
  }

  const endPoint = {
    totalMovingTime: 122,
    totalLinearDistance: 510
  }

  const testSegment = createWorkoutSegment()
  const testSplit = createWorkoutSegment()
  testSegment.setStart(startingPoint)
  testSegment.setEnd(distanceInterval)
  testSplit.setStart(startingPoint)
  testSplit.setEnd(testSegment.getSplit())
  testDistanceFromStart(testSplit, startingPoint, 0)
  testTimeSinceStart(testSplit, startingPoint, 0)
  testdistanceToEnd(testSplit, startingPoint, undefined)
  testTimeToEnd(testSplit, startingPoint, 120)
  testIsEndReached(testSplit, startingPoint, false)
  testDistanceFromStart(testSplit, middlePoint, 490)
  testTimeSinceStart(testSplit, middlePoint, 118)
  testdistanceToEnd(testSplit, middlePoint, undefined)
  testTimeToEnd(testSplit, middlePoint, 2)
  testIsEndReached(testSplit, middlePoint, false)
  testDistanceFromStart(testSplit, endPoint, 510)
  testTimeSinceStart(testSplit, endPoint, 122)
  testdistanceToEnd(testSplit, endPoint, undefined)
  testTimeToEnd(testSplit, endPoint, -2)
  testIsEndReached(testSplit, endPoint, true)
  testExtrapolation(testSplit, middlePoint, endPoint, 120, 500)
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

function testTargetTime (testedSegment, expectedValue) {
  assert.ok(testedSegment.targetTime() === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.targetTime()}`)
}

function testTargetDistance (testedSegment, expectedValue) {
  assert.ok(testedSegment.targetDistance() === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.targetDistance()}`)
}

function testExtrapolation (testedSegment, dataPointOne, dataPointTwo, ExpectedTime, ExpectedDistance) {
  assert.ok(testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalMovingTime === ExpectedTime, `Expected extrapolated time be ${ExpectedTime}, encountered ${testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalMovingTime}`)
  assert.ok(testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalLinearDistance === ExpectedDistance, `Expected time to end to be ${ExpectedDistance}, encountered ${testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalLinearDistance}`)
}

test.run()
