'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module tests the behaviour of the workout segments
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createWorkoutSegment } from './workoutSegment.js'

const basicConfig = {
  numOfPhasesForAveragingScreenData: 4
}

test('Test workoutSegment initialisation behaviour without setting an interval', () => {
  const startingPoint = {
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const testSegment = createWorkoutSegment(basicConfig)
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, undefined)
  testTimeToEnd(testSegment, startingPoint, undefined)
  testTargetTime(testSegment, startingPoint, undefined)
  testTargetDistance(testSegment, startingPoint, undefined)
  testIsEndReached(testSegment, startingPoint, false)
})

test('Test workoutSegment initialisation behaviour without setting an interval, after 2050 meters', () => {
  const startingPoint = {
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 490 * 1000),
    totalMovingTime: 490,
    totalLinearDistance: 2050
  }

  const testSegment = createWorkoutSegment(basicConfig)
  testDistanceFromStart(testSegment, startingPoint, 0)
  testTimeSinceStart(testSegment, startingPoint, 0)
  testdistanceToEnd(testSegment, startingPoint, undefined)
  testTimeToEnd(testSegment, startingPoint, undefined)
  testTargetTime(testSegment, startingPoint, undefined)
  testTargetDistance(testSegment, startingPoint, undefined)
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
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const middlePoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 480 * 1000),
    totalMovingTime: 480,
    totalLinearDistance: 2000
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 490 * 1000),
    totalMovingTime: 490,
    totalLinearDistance: 2050
  }

  const testSegment = createWorkoutSegment(basicConfig)
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
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const middlePoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 480 * 1000),
    totalMovingTime: 480,
    totalLinearDistance: 2000
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 490 * 1000),
    totalMovingTime: 490,
    totalLinearDistance: 2050
  }

  const testSegment = createWorkoutSegment(basicConfig)
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
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const middlePoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 118 * 1000),
    totalMovingTime: 118,
    totalLinearDistance: 490
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 122 * 1000),
    totalMovingTime: 122,
    totalLinearDistance: 510
  }

  const testSegment = createWorkoutSegment(basicConfig)
  const testSplit = createWorkoutSegment(basicConfig)
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
    timestamp: new Date(),
    totalMovingTime: 0,
    totalLinearDistance: 0
  }

  const middlePoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 118 * 1000),
    totalMovingTime: 118,
    totalLinearDistance: 490
  }

  const endPoint = {
    timestamp: new Date(startingPoint.timestamp.getTime() + 122 * 1000),
    totalMovingTime: 122,
    totalLinearDistance: 510
  }

  const testSegment = createWorkoutSegment(basicConfig)
  const testSplit = createWorkoutSegment(basicConfig)
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

// ToDo: Test the project EndTime and project EndDistance functions

function testDistanceFromStart (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).distance.fromStart === expectedValue, `Expected distance from the start should be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).distance.fromStart}`)
}

function testTimeSinceStart (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).movingTime.sinceStart === expectedValue, `Expected time since start should be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).movingTime.sinceStart}`)
}

function testdistanceToEnd (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).distance.toEnd === expectedValue, `Expected distance from the end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).distance.toEnd}`)
}

function testTimeToEnd (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).movingTime.toEnd === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).movingTime.toEnd}`)
}

function testIsEndReached (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.isEndReached(testedDatapoint) === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.isEndReached(testedDatapoint)}`)
}

function testTargetTime (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).movingTime.target === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).movingTime.target}`)
}

function testTargetDistance (testedSegment, testedDatapoint, expectedValue) {
  assert.ok(testedSegment.metrics(testedDatapoint).distance.target === expectedValue, `Expected time to end to be ${expectedValue}, encountered ${testedSegment.metrics(testedDatapoint).distance.target}`)
}

function testExtrapolation (testedSegment, dataPointOne, dataPointTwo, ExpectedTime, ExpectedDistance) {
  assert.ok(testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalMovingTime === ExpectedTime, `Expected extrapolated time be ${ExpectedTime}, encountered ${testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalMovingTime}`)
  assert.ok(testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalLinearDistance === ExpectedDistance, `Expected time to end to be ${ExpectedDistance}, encountered ${testedSegment.interpolateEnd(dataPointOne, dataPointTwo).totalLinearDistance}`)
}

test.run()
