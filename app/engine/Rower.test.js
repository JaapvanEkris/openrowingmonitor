'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This test is a test of the Rower object, that tests wether this object fills all fields correctly, given one validated rower, (the
  Concept2 RowErg) using a validated cycle of strokes. This thoroughly tests the raw physics of the translation of Angular physics
  to Linear physics. The combination with all possible known rowers is tested when testing the above function RowingStatistics, as
  these statistics are dependent on these settings as well.
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import rowerProfiles from '../../config/rowerProfiles.js'
import { replayRowingSession } from '../recorders/RowingReplayer.js'
import { deepMerge } from '../tools/Helper.js'

import { createRower } from './Rower.js'

const baseConfig = { // Based on Concept 2 settings, as this is the validation system
  numOfImpulsesPerRevolution: 6,
  sprocketRadius: 1.4,
  maximumStrokeTimeBeforePause: 0.3, // Modification to standard settings to shorten test cases
  dragFactor: 110,
  autoAdjustDragFactor: true,
  minimumDragQuality: 0.95,
  dragFactorSmoothing: 3,
  minimumTimeBetweenImpulses: 0.005,
  maximumTimeBetweenImpulses: 0.017,
  flankLength: 12,
  smoothing: 1,
  minimumStrokeQuality: 0.36,
  minimumForceBeforeStroke: 20, // Modification to standard settings to shorten test cases
  minimumRecoverySlope: 0.00070,
  autoAdjustRecoverySlope: false, // Modification to standard settings to shorten test cases
  autoAdjustRecoverySlopeMargin: 0.04,
  minimumDriveTime: 0.04, // Modification to standard settings to shorten test cases
  minimumRecoveryTime: 0.09, // Modification to standard settings to shorten test cases
  flywheelInertia: 0.10138,
  magicConstant: 2.8
}

// Test behaviour for no datapoints
test('Correct rower behaviour at initialisation', () => {
  const rower = createRower(baseConfig)
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testCycleDuration(rower, undefined) // Default value
  testCycleLinearDistance(rower, undefined)
  testCycleLinearVelocity(rower, undefined)
  testCyclePower(rower, undefined)
  testDriveDuration(rower, undefined)
  testDriveLinearDistance(rower, undefined)
  testDriveLength(rower, undefined)
  testDriveAverageHandleForce(rower, undefined)
  testDrivePeakHandleForce(rower, undefined)
  testRecoveryDuration(rower, undefined)
  testRecoveryDragFactor(rower, undefined)
  testInstantHandlePower(rower, 0)
})

// Test behaviour for one datapoint

// Test behaviour for three perfect identical strokes, including settingling behaviour of metrics
test('Test behaviour for three perfect identical strokes, including settingling behaviour of metrics', () => {
  const rower = createRower(baseConfig)
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testCycleDuration(rower, undefined) // Default value
  testCycleLinearDistance(rower, undefined)
  testCycleLinearVelocity(rower, undefined)
  testCyclePower(rower, undefined)
  testDriveDuration(rower, undefined)
  testDriveLinearDistance(rower, undefined)
  testDriveLength(rower, undefined)
  testDriveAverageHandleForce(rower, undefined)
  testDrivePeakHandleForce(rower, undefined)
  testRecoveryDuration(rower, undefined)
  testRecoveryDragFactor(rower, undefined)
  testInstantHandlePower(rower, 0)
  // Drive initial stroke starts here
  rower.handleRotationImpulse(0.011221636)
  rower.handleRotationImpulse(0.011175504)
  rower.handleRotationImpulse(0.01116456)
  rower.handleRotationImpulse(0.011130263)
  rower.handleRotationImpulse(0.011082613)
  rower.handleRotationImpulse(0.011081761)
  rower.handleRotationImpulse(0.011062297)
  rower.handleRotationImpulse(0.011051853)
  rower.handleRotationImpulse(0.010973313)
  rower.handleRotationImpulse(0.010919756)
  rower.handleRotationImpulse(0.01086431)
  rower.handleRotationImpulse(0.010800864)
  rower.handleRotationImpulse(0.010956987)
  rower.handleRotationImpulse(0.010653396)
  rower.handleRotationImpulse(0.010648619)
  rower.handleRotationImpulse(0.010536818)
  rower.handleRotationImpulse(0.010526151)
  rower.handleRotationImpulse(0.010511225)
  rower.handleRotationImpulse(0.010386684)
  testStrokeState(rower, 'Drive')
  testTotalMovingTimeSinceStart(rower, 0.077918634)
  testTotalLinearDistanceSinceStart(rower, 0.2491943602992768)
  testTotalNumberOfStrokes(rower, 1)
  testCycleDuration(rower, undefined) // still default value
  testCycleLinearDistance(rower, undefined)
  testCycleLinearVelocity(rower, undefined) // This isn't filled after the first drive, as we haven't survived a complete cycle yet
  testCyclePower(rower, undefined) // This isn't filled after the first drive, as we haven't survived a complete cycle yet
  testDriveDuration(rower, undefined) // This isn't filled after the first drive as it is too short
  testDriveLinearDistance(rower, undefined)
  testDriveLength(rower, undefined)
  testDriveAverageHandleForce(rower, undefined)
  testDrivePeakHandleForce(rower, undefined)
  testRecoveryDuration(rower, undefined)
  testRecoveryDragFactor(rower, undefined)
  testInstantHandlePower(rower, 372.09477620281604)
  // Recovery initial stroke starts here
  rower.handleRotationImpulse(0.010769)
  rower.handleRotationImpulse(0.010707554)
  rower.handleRotationImpulse(0.010722165)
  rower.handleRotationImpulse(0.01089567)
  rower.handleRotationImpulse(0.010917504)
  rower.handleRotationImpulse(0.010997969)
  rower.handleRotationImpulse(0.011004655)
  rower.handleRotationImpulse(0.011013618)
  rower.handleRotationImpulse(0.011058193)
  rower.handleRotationImpulse(0.010807149)
  rower.handleRotationImpulse(0.0110626)
  rower.handleRotationImpulse(0.011090787)
  rower.handleRotationImpulse(0.011099509)
  rower.handleRotationImpulse(0.011131862)
  rower.handleRotationImpulse(0.011209919)
  testStrokeState(rower, 'Recovery')
  testTotalMovingTimeSinceStart(rower, 0.23894732900000007)
  testTotalLinearDistanceSinceStart(rower, 0.7831822752262985)
  testTotalNumberOfStrokes(rower, 1)
  testCycleDuration(rower, undefined)
  testCycleLinearDistance(rower, undefined)
  testCycleLinearVelocity(rower, undefined)
  testCyclePower(rower, undefined)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.46278952627008546)
  testDriveLength(rower, 0.19058995431778075)
  testDriveAverageHandleForce(rower, 276.20193475035796)
  testDrivePeakHandleForce(rower, 325.1619554833936)
  testRecoveryDuration(rower, undefined)
  testRecoveryDragFactor(rower, undefined)
  testInstantHandlePower(rower, 0)
  // Drive second stroke starts here
  rower.handleRotationImpulse(0.011221636)
  rower.handleRotationImpulse(0.011175504)
  rower.handleRotationImpulse(0.01116456)
  rower.handleRotationImpulse(0.011130263)
  rower.handleRotationImpulse(0.011082613)
  rower.handleRotationImpulse(0.011081761)
  rower.handleRotationImpulse(0.011062297)
  rower.handleRotationImpulse(0.011051853)
  rower.handleRotationImpulse(0.010973313)
  rower.handleRotationImpulse(0.010919756)
  rower.handleRotationImpulse(0.01086431)
  rower.handleRotationImpulse(0.010800864)
  rower.handleRotationImpulse(0.010956987)
  rower.handleRotationImpulse(0.010653396)
  rower.handleRotationImpulse(0.010648619)
  rower.handleRotationImpulse(0.010536818)
  rower.handleRotationImpulse(0.010526151)
  rower.handleRotationImpulse(0.010511225)
  rower.handleRotationImpulse(0.010386684)
  testStrokeState(rower, 'Drive')
  testTotalMovingTimeSinceStart(rower, 0.44915539800000004)
  testTotalLinearDistanceSinceStart(rower, 1.828822466846578)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.34889498300000005)
  testCycleLinearDistance(rower, 1.3660329405764926)
  testCycleLinearVelocity(rower, 4.474643028948317)
  testCyclePower(rower, 250.86103806520188)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.43908201661387253)
  testDriveLength(rower, 0.19058995431778075)
  testDriveAverageHandleForce(rower, 236.59556700196183)
  testDrivePeakHandleForce(rower, 380.1396336099103)
  testRecoveryDuration(rower, 0.20540926600000003)
  testRecoveryDragFactor(rower, 283.12720365097886)
  testInstantHandlePower(rower, 504.63602120716615)
  // Recovery second stroke starts here
  rower.handleRotationImpulse(0.010769)
  rower.handleRotationImpulse(0.010707554)
  rower.handleRotationImpulse(0.010722165)
  rower.handleRotationImpulse(0.01089567)
  rower.handleRotationImpulse(0.010917504)
  rower.handleRotationImpulse(0.010997969)
  rower.handleRotationImpulse(0.011004655)
  rower.handleRotationImpulse(0.011013618)
  rower.handleRotationImpulse(0.011058193)
  rower.handleRotationImpulse(0.010807149)
  rower.handleRotationImpulse(0.0110626)
  rower.handleRotationImpulse(0.011090787)
  rower.handleRotationImpulse(0.011099509)
  rower.handleRotationImpulse(0.011131862)
  rower.handleRotationImpulse(0.011209919)
  testStrokeState(rower, 'Recovery')
  testTotalMovingTimeSinceStart(rower, 0.6101840930000001)
  testTotalLinearDistanceSinceStart(rower, 2.5606258278697)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.44526865700000007)
  testCycleLinearDistance(rower, 1.1708853776369939)
  testCycleLinearVelocity(rower, 4.492259872066099)
  testCyclePower(rower, 253.83566752220193)
  testDriveDuration(rower, 0.23985939100000003)
  testDriveLinearDistance(rower, 1.0733115961672441)
  testDriveLength(rower, 0.322536845768552)
  testDriveAverageHandleForce(rower, 285.0923064376231)
  testDrivePeakHandleForce(rower, 439.7407274840117)
  testRecoveryDuration(rower, 0.20540926600000003)
  testRecoveryDragFactor(rower, 283.12720365097886) // As we decelerate the flywheel quite fast, this is expected
  testInstantHandlePower(rower, 0)
  // Drive third stroke starts here
  rower.handleRotationImpulse(0.011221636)
  rower.handleRotationImpulse(0.011175504)
  rower.handleRotationImpulse(0.01116456)
  rower.handleRotationImpulse(0.011130263)
  rower.handleRotationImpulse(0.011082613)
  rower.handleRotationImpulse(0.011081761)
  rower.handleRotationImpulse(0.011062297)
  rower.handleRotationImpulse(0.011051853)
  rower.handleRotationImpulse(0.010973313)
  rower.handleRotationImpulse(0.010919756)
  rower.handleRotationImpulse(0.01086431)
  rower.handleRotationImpulse(0.010800864)
  rower.handleRotationImpulse(0.010956987)
  rower.handleRotationImpulse(0.010653396)
  rower.handleRotationImpulse(0.010648619)
  rower.handleRotationImpulse(0.010536818)
  rower.handleRotationImpulse(0.010526151)
  rower.handleRotationImpulse(0.010511225)
  rower.handleRotationImpulse(0.010386684)
  testStrokeState(rower, 'Drive')
  testTotalMovingTimeSinceStart(rower, 0.8203921620000004)
  testTotalLinearDistanceSinceStart(rower, 3.4875767518323193)
  testTotalNumberOfStrokes(rower, 3)
  testCycleDuration(rower, 0.3379838680000002)
  testCycleLinearDistance(rower, 1.0245247054323694)
  testCycleLinearVelocity(rower, 4.4747508859834575)
  testCyclePower(rower, 250.8791788061379)
  testDriveDuration(rower, 0.23985939100000003)
  testDriveLinearDistance(rower, 0.5854426888184969)
  testDriveLength(rower, 0.322536845768552)
  testDriveAverageHandleForce(rower, 194.28476369698888)
  testDrivePeakHandleForce(rower, 380.1396336085015)
  testRecoveryDuration(rower, 0.09812447700000015)
  testRecoveryDragFactor(rower, 283.12720365097886)
  testInstantHandlePower(rower, 504.63602120535336)
  // Recovery third stroke starts here
  rower.handleRotationImpulse(0.010769)
  rower.handleRotationImpulse(0.010707554)
  rower.handleRotationImpulse(0.010722165)
  rower.handleRotationImpulse(0.01089567)
  rower.handleRotationImpulse(0.010917504)
  rower.handleRotationImpulse(0.010997969)
  rower.handleRotationImpulse(0.011004655)
  rower.handleRotationImpulse(0.011013618)
  rower.handleRotationImpulse(0.011058193)
  rower.handleRotationImpulse(0.010807149)
  rower.handleRotationImpulse(0.0110626)
  rower.handleRotationImpulse(0.011090787)
  rower.handleRotationImpulse(0.011099509)
  rower.handleRotationImpulse(0.011131862)
  rower.handleRotationImpulse(0.011209919)
  testStrokeState(rower, 'Recovery')
  testTotalMovingTimeSinceStart(rower, 0.9814208570000005)
  testTotalLinearDistanceSinceStart(rower, 4.219380112855441)
  testTotalNumberOfStrokes(rower, 3)
  testCycleDuration(rower, 0.3712367640000004)
  testCycleLinearDistance(rower, 1.3172460498416183)
  testCycleLinearVelocity(rower, 4.46818431211662)
  testCyclePower(rower, 249.77632391313173)
  testDriveDuration(rower, 0.27311228700000023)
  testDriveLinearDistance(rower, 1.2196722683718688)
  testDriveLength(rower, 0.3665191429188092)
  testDriveAverageHandleForce(rower, 254.91449219500532)
  testDrivePeakHandleForce(rower, 439.74072748282515)
  testRecoveryDuration(rower, 0.09812447700000015)
  testRecoveryDragFactor(rower, 283.12720365097886)
  testInstantHandlePower(rower, 0)
  // Dwelling state starts here
  rower.handleRotationImpulse(0.020769)
  rower.handleRotationImpulse(0.020707554)
  rower.handleRotationImpulse(0.020722165)
  rower.handleRotationImpulse(0.02089567)
  rower.handleRotationImpulse(0.020917504)
  rower.handleRotationImpulse(0.020997969)
  rower.handleRotationImpulse(0.021004655)
  rower.handleRotationImpulse(0.021013618)
  rower.handleRotationImpulse(0.021058193)
  rower.handleRotationImpulse(0.020807149)
  rower.handleRotationImpulse(0.0210626)
  rower.handleRotationImpulse(0.021090787)
  rower.handleRotationImpulse(0.021099509)
  rower.handleRotationImpulse(0.021131862)
  rower.handleRotationImpulse(0.021209919)
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 1.1344792920000004)
  testTotalNumberOfStrokes(rower, 3)
  testTotalLinearDistanceSinceStart(rower, 4.8536096924088135)
  testCycleDuration(rower, 0.4476004410000002)
  testCycleLinearDistance(rower, 1.9514756293949902)
  testCycleLinearVelocity(rower, 4.359860828186694)
  testCyclePower(rower, 232.0469744651364)
  testDriveDuration(rower, 0.27311228700000023)
  testDriveLinearDistance(rower, 1.2196722683718688)
  testDriveLength(rower, 0.3665191429188092)
  testDriveAverageHandleForce(rower, 254.91449219500532)
  testDrivePeakHandleForce(rower, 439.74072748282515)
  testRecoveryDuration(rower, 0.17448815399999995)
  testRecoveryDragFactor(rower, 283.12720365097886)
  testInstantHandlePower(rower, 0)
})

// Test behaviour for noisy upgoing flank

// Test behaviour for noisy downgoing flank

// Test behaviour for noisy stroke

// Test behaviour after reset

// Test behaviour for one datapoint

// Test behaviour for noisy stroke

// Test drag factor calculation

// Test Dynamic stroke detection

// Test behaviour after reset

// Test behaviour with real-life data

test('sample data for Sportstech WRX700 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 46.302522627)
  testTotalLinearDistanceSinceStart(rower, 166.29596716416734)
  testTotalNumberOfStrokes(rower, 16)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('sample data for DKN R-320 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  // As dragFactor is static, it should be known at initialisation
  testRecoveryDragFactor(rower, rowerProfiles.DKN_R320.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 21.701535821)
  testTotalLinearDistanceSinceStart(rower, 70.11298001986664)
  testTotalNumberOfStrokes(rower, 10)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.DKN_R320.dragFactor)
})

test('sample data for NordicTrack RX800 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 21.97324892)
  testTotalLinearDistanceSinceStart(rower, 80.42009355207885)
  testTotalNumberOfStrokes(rower, 10)
  // As dragFactor is dynamic, it should have changed
  testRecoveryDragFactor(rower, 494.92868774518126)
})

test('A full session for SportsTech WRX700 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 2340.0100514160117)
  testTotalLinearDistanceSinceStart(rower, 8406.791871958883)
  testTotalNumberOfStrokes(rower, 846)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('A full session for a Concept2 Model C should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 181.47141999999985)
  testTotalLinearDistanceSinceStart(rower, 552.0863658667265)
  testTotalNumberOfStrokes(rower, 84)
  // As dragFactor isn't static, it should have changed
  testRecoveryDragFactor(rower, 123.82587294279575)
})

test('A full session for a Concept2 RowErg should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, undefined)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 590.111937)
  testTotalLinearDistanceSinceStart(rower, 2027.493082238415)
  testTotalNumberOfStrokes(rower, 206)
  // As dragFactor isn't static, it should have changed
  testRecoveryDragFactor(rower, 80.60573080009686)
})

function testStrokeState (rower, expectedValue) {
  assert.ok(rower.strokeState() === expectedValue, `strokeState should be ${expectedValue} at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.strokeState()}`)
}

function testTotalMovingTimeSinceStart (rower, expectedValue) {
  assert.ok(rower.totalMovingTimeSinceStart() === expectedValue, `totalMovingTimeSinceStart should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.totalMovingTimeSinceStart()}`)
}

function testTotalNumberOfStrokes (rower, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(rower.totalNumberOfStrokes() + 1 === expectedValue, `totalNumberOfStrokes should be ${expectedValue} at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.totalNumberOfStrokes() + 1}`)
}

function testTotalLinearDistanceSinceStart (rower, expectedValue) {
  assert.ok(rower.totalLinearDistanceSinceStart() === expectedValue, `totalLinearDistanceSinceStart should be ${expectedValue} meters at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.totalLinearDistanceSinceStart()}`)
}

function testCycleDuration (rower, expectedValue) {
  assert.ok(rower.cycleDuration() === expectedValue, `cycleDuration should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.cycleDuration()}`)
}

function testCycleLinearDistance (rower, expectedValue) {
  assert.ok(rower.cycleLinearDistance() === expectedValue, `cycleLinearDistance should be ${expectedValue} meters at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.cycleLinearDistance()}`)
}

function testCycleLinearVelocity (rower, expectedValue) {
  assert.ok(rower.cycleLinearVelocity() === expectedValue, `cycleLinearVelocity should be ${expectedValue} m/s at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.cycleLinearVelocity()}`)
}

function testCyclePower (rower, expectedValue) {
  assert.ok(rower.cyclePower() === expectedValue, `cyclePower should be ${expectedValue} Watt at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.cyclePower()}`)
}

function testDriveDuration (rower, expectedValue) {
  assert.ok(rower.driveDuration() === expectedValue, `driveDuration should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.driveDuration()}`)
}

function testDriveLinearDistance (rower, expectedValue) {
  assert.ok(rower.driveLinearDistance() === expectedValue, `driveLinearDistance should be ${expectedValue} meters at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.driveLinearDistance()}`)
}

function testDriveLength (rower, expectedValue) {
  assert.ok(rower.driveLength() === expectedValue, `driveLength should be ${expectedValue} meters at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.driveLength()}`)
}

function testDriveAverageHandleForce (rower, expectedValue) {
  assert.ok(rower.driveAverageHandleForce() === expectedValue, `driveAverageHandleForce should be ${expectedValue} N at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.driveAverageHandleForce()}`)
}

function testDrivePeakHandleForce (rower, expectedValue) {
  assert.ok(rower.drivePeakHandleForce() === expectedValue, `drivePeakHandleForce should be ${expectedValue} N at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.drivePeakHandleForce()}`)
}

function testRecoveryDuration (rower, expectedValue) {
  assert.ok(rower.recoveryDuration() === expectedValue, `recoveryDuration should be ${expectedValue} sec at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.recoveryDuration()}`)
}

function testRecoveryDragFactor (rower, expectedValue) {
  assert.ok(rower.recoveryDragFactor() === expectedValue, `recoveryDragFactor should be ${expectedValue} N*m*s^2 at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.recoveryDragFactor()}`)
}

function testInstantHandlePower (rower, expectedValue) {
  assert.ok(rower.instantHandlePower() === expectedValue, `instantHandlePower should be ${expectedValue} Watt at ${rower.totalMovingTimeSinceStart()} sec, is ${rower.instantHandlePower()}`)
}

function reportAll (rower) { // eslint-disable-line no-unused-vars
  assert.ok(0, `time: ${rower.totalMovingTimeSinceStart()}, state ${rower.strokeState()}, No Strokes: ${rower.totalNumberOfStrokes() + 1}, Lin Distance: ${rower.totalLinearDistanceSinceStart()}, cycle dur: ${rower.cycleDuration()}, cycle Lin Dist: ${rower.cycleLinearDistance()}, Lin Velocity: ${rower.cycleLinearVelocity()}, Power: ${rower.cyclePower()}, Drive Dur: ${rower.driveDuration()}, Drive Lin. Dist. ${rower.driveLinearDistance()}, Drive Length: ${rower.driveLength()}, Av. Handle Force: ${rower.driveAverageHandleForce()}, Peak Handle Force: ${rower.drivePeakHandleForce()}, Rec. Dur: ${rower.recoveryDuration()}, Dragfactor: ${rower.recoveryDragFactor()}, Inst Handle Power: ${rower.instantHandlePower()}`)
}

test.run()
