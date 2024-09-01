'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This test is a test of the Rower object, that tests wether this object fills all fields correctly, given one validated rower, (the
  Concept2 RowErg) using a validated cycle of strokes. This thoroughly tests the raw physics of the translation of Angular physics
  to Linear physics. The combination with all possible known rowers is tested when testing the above function RowingStatistics, as
  these statistics are dependent on these settings as well.

  ToDo: test the effects of smoothing parameters
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import rowerProfiles from '../../config/rowerProfiles.js'
import { replayRowingSession } from '../recorders/RowingReplayer.js'
import { deepMerge } from '../tools/Helper.js'

import { createSessionManager } from './SessionManager.js'

test('sample data for Sportstech WRX700 should produce plausible results for an unlimited run', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 46.302522627)
  testTotalLinearDistance(sessionManager, 166.29596716416734)
  testTotalNumberOfStrokes(sessionManager, 15)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('sample data for Sportstech WRX700 should produce plausible results for a 150 meter session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    targetDistance: 150,
    targetTime: 0
  }
  sessionManager.setIntervalParameters(intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 41.734896595)
  testTotalLinearDistance(sessionManager, 150.02019165448286)
  testTotalNumberOfStrokes(sessionManager, 15)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('sample data for Sportstech WRX700 should produce plausible results for a 45 seconds session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    targetDistance: 0,
    targetTime: 45
  }
  sessionManager.setIntervalParameters(intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 45.077573161000004)
  testTotalLinearDistance(sessionManager, 163.4653975103091)
  testTotalNumberOfStrokes(sessionManager, 15)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('sample data for DKN R-320 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 21.701535821)
  testTotalLinearDistance(sessionManager, 70.11298001986664)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
})

test('sample data for NordicTrack RX800 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, rowerProfiles.NordicTrack_RX800.dragFactor)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 21.97324892)
  testTotalLinearDistance(sessionManager, 79.2166251462397)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 494.92868774518126)
})

test('A full session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 2340.0100514160117)
  testTotalLinearDistance(sessionManager, 8406.791871958883)
  testTotalNumberOfStrokes(sessionManager, 845)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('A full session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, (rowerProfiles.Concept2_Model_C.dragFactor))

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 181.47141999999985)
  testTotalLinearDistance(sessionManager, 551.8079721452832)
  testTotalNumberOfStrokes(sessionManager, 83)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.82587294279575)
})

test('A full session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, rowerProfiles.Concept2_RowErg.dragFactor)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 590.111937)
  testTotalLinearDistance(sessionManager, 2029.714313667487)
  testTotalNumberOfStrokes(sessionManager, 205)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.79044336920732)
})

function testTotalMovingTime (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalMovingTime === expectedValue, `totalMovingTime should be ${expectedValue} sec at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalMovingTime}`)
}

function testTotalNumberOfStrokes (sessionManager, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(sessionManager.getMetrics().totalNumberOfStrokes === expectedValue, `totalNumberOfStrokes should be ${expectedValue} at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalNumberOfStrokes}`)
}

function testTotalLinearDistance (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalLinearDistance === expectedValue, `totalLinearDistance should be ${expectedValue} meters at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalLinearDistance}`)
}

function testDragFactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().dragFactor === expectedValue, `dragFactor should be ${expectedValue} N*m*s^2 at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().dragFactor}`)
}

function reportAll (sessionManager) { // eslint-disable-line no-unused-vars
  assert.ok(0, `time: ${sessionManager.getMetrics().totalMovingTime}, state ${sessionManager.getMetrics().strokeState}, No Strokes: ${sessionManager.getMetrics().totalNumberOfStrokes}, Lin Distance: ${sessionManager.getMetrics().totalLinearDistance}, cycle dur: ${sessionManager.getMetrics().cycleDuration}, cycle Lin Dist: ${sessionManager.getMetrics().cycleLinearDistance}, Lin Velocity: ${sessionManager.getMetrics().cycleLinearVelocity}, Power: ${sessionManager.getMetrics().cyclePower}, Drive Dur: ${sessionManager.getMetrics().driveDuration}, Drive Lin. Dist. ${sessionManager.driveDistance}, Drive Length: ${sessionManager.getMetrics().driveLength}, Av. Handle Force: ${sessionManager.getMetrics().driveAverageHandleForce}, Peak Handle Force: ${sessionManager.getMetrics().drivePeakHandleForce}, Rec. Dur: ${sessionManager.getMetrics().recoveryDuration}, Dragfactor: ${sessionManager.getMetrics().dragFactor}, Inst Handle Power: ${sessionManager.getMetrics().instantHandlePower}`)
}

test.run()
