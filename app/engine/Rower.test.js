'use strict'
/*

  This test is a test of the Rower object, that tests wether this object fills all fields correctly, given one validated rower, (the
  Concept2 RowErg) using a validated cycle of strokes. This thoroughly tests the raw physics of the translation of Angfular physics
  to Linear physics. The combination with all possible known rowers is tested when testing the above function RowingStatistics, as
  these statistics are dependent on these settings as well.
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import rowerProfiles from '../../config/rowerProfiles.js'
import { replayRowingSession } from '../tools/RowingRecorder.js'
import { deepMerge } from '../tools/Helper.js'

import { createRower } from './Rower.js'

const baseConfig = { // Based on Concept 2 settings, as this is the validation system
  numOfImpulsesPerRevolution: 6,
  sprocketRadius: 1.4,
  maximumStrokeTimeBeforePause: 6.0,
  dragFactor: 110,
  autoAdjustDragFactor: true,
  minimumDragQuality: 0.95,
  dragFactorSmoothing: 3,
  minimumTimeBetweenImpulses: 0.005,
  maximumTimeBetweenImpulses: 0.020,
  flankLength: 12,
  smoothing: 1,
  minimumStrokeQuality: 0.36,
  minumumForceBeforeStroke: 10,
  minumumRecoverySlope: 0.00070,
  autoAdjustRecoverySlope: true,
  autoAdjustRecoverySlopeMargin: 0.15,
  minimumDriveTime: 0.40,
  minimumRecoveryTime: 0.90,
  flywheelInertia: 0.1031,
  magicConstant: 2.8
}

// Test behaviour for no datapoints
test('Correct rower behaviour at initialisation', () => {
  const rower = createRower(baseConfig)
  testStrokeState(rower, 'WaitingForDrive')
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testCycleDuration(rower, 1.3)
  testCycleLinearDistance(rower, 0)
  testCycleLinearVelocity(rower, 0)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0)
  testDriveLinearDistance(rower, 0)
  testDriveLength(rower, 0)
  testDriveAverageHandleForce(rower, 0)
  testDrivePeakHandleForce(rower, 0)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
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
  testCycleDuration(rower, 0.30000000000000004)
  testCycleLinearDistance(rower, 0)
  testCycleLinearVelocity(rower, 0)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0)
  testDriveLinearDistance(rower, 0)
  testDriveLength(rower, 0)
  testDriveAverageHandleForce(rower, 0)
  testDrivePeakHandleForce(rower, 0)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
  testInstantHandlePower(rower, 0)
  // Drive initial stroke starts here
  rower.handleRotationImpulse(0.011221636)
  testStrokeState(rower, 'Drive')
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
  testTotalMovingTimeSinceStart(rower, 0.088970487)
  testTotalLinearDistanceSinceStart(rower, 0.31037384539231255)
  testTotalNumberOfStrokes(rower, 1)
  testCycleDuration(rower, 0.30000000000000004)
  testCycleLinearDistance(rower, 0.31037384539231255)
  testCycleLinearVelocity(rower, 0) // Shouldn't this one be filled after the first drive?
  testCyclePower(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveDuration(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveLinearDistance(rower, 0.31037384539231255)
  testDriveLength(rower, 0) // Shouldn't this one be filled after the first drive?
  testDriveAverageHandleForce(rower, 162.11461597250118)
  testDrivePeakHandleForce(rower, 186.47478805821592)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
  testInstantHandlePower(rower, 354.69564711401205)
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
  testTotalMovingTimeSinceStart(rower, 0.24984299900000007)
  testTotalLinearDistanceSinceStart(rower, 0.8276635877128334)
  testTotalNumberOfStrokes(rower, 1)
  testCycleDuration(rower, 0.18585070100000003)
  testCycleLinearDistance(rower, 0.8276635877128334)
  testCycleLinearVelocity(rower, 3.3400341642220925)
  testCyclePower(rower, 0)
  testDriveDuration(rower, 0.18585070100000003)
  testDriveLinearDistance(rower, 0.6207476907846251)
  testDriveLength(rower, 0.3769911184307752)
  testDriveAverageHandleForce(rower, 194.60800086428492)
  testDrivePeakHandleForce(rower, 232.12437866422357)
  testRecoveryDuration(rower, 0)
  testRecoveryDragFactor(rower, 100)
  testInstantHandlePower(rower, 0)
  // Drive seconds stroke starts here
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
  testTotalMovingTimeSinceStart(rower, 0.46020725100000004)
  testTotalLinearDistanceSinceStart(rower, 1.6062393665262986)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.37123676400000005)
  testCycleLinearDistance(rower, 1.1234356070271458)
  testCycleLinearVelocity(rower, 3.2513196854282507)
  testCyclePower(rower, 96.23588664090768)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.3992299677784167)
  testDriveLength(rower, 0.29321531433504733)
  testDriveAverageHandleForce(rower, 196.08956399075205)
  testDrivePeakHandleForce(rower, 278.3304945969936)
  testRecoveryDuration(rower, 0.22775104700000004)
  testRecoveryDragFactor(rower, 303.0202258405183)
  testInstantHandlePower(rower, 529.4910496125467)
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
  testTotalMovingTimeSinceStart(rower, 0.6210797630000001)
  testTotalLinearDistanceSinceStart(rower, 2.3547955561108296)
  testTotalNumberOfStrokes(rower, 2)
  testCycleDuration(rower, 0.37123676400000005)
  testCycleLinearDistance(rower, 1.1477861573629475)
  testCycleLinearVelocity(rower, 4.570472344323823)
  testCyclePower(rower, 267.3260538223458)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.648748697639927)
  testDriveLength(rower, 0.2722713633111155)
  testDriveAverageHandleForce(rower, 233.64041405549378)
  testDrivePeakHandleForce(rower, 327.5241022306036)
  testRecoveryDuration(rower, 0.22775104700000004)
  testRecoveryDragFactor(rower, 303.0202258405183)
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
  testTotalMovingTimeSinceStart(rower, 0.8314440150000004)
  testTotalLinearDistanceSinceStart(rower, 3.3029667295845693)
  testTotalNumberOfStrokes(rower, 3)
  testCycleDuration(rower, 0.3488949830000002)
  testCycleLinearDistance(rower, 1.4472086331967597)
  testCycleLinearVelocity(rower, 4.577078917508151)
  testCyclePower(rower, 268.486981924958)
  testDriveDuration(rower, 0.143485717)
  testDriveLinearDistance(rower, 0.4990374597230207)
  testDriveLength(rower, 0.2722713633111155)
  testDriveAverageHandleForce(rower, 186.25689234608708)
  testDrivePeakHandleForce(rower, 278.33049460146106)
  testRecoveryDuration(rower, 0.2054092660000002)
  testRecoveryDragFactor(rower, 303.0202258405183)
  testInstantHandlePower(rower, 529.4910496211132)
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
  testTotalMovingTimeSinceStart(rower, 0.9923165270000005)
  testTotalLinearDistanceSinceStart(rower, 4.051522919169099)
  testTotalNumberOfStrokes(rower, 3)
  testCycleDuration(rower, 0.3712367640000004)
  testCycleLinearDistance(rower, 1.247593649307551)
  testCycleLinearVelocity(rower, 4.570472344323817)
  testCyclePower(rower, 267.3260538223447)
  testDriveDuration(rower, 0.16582749800000018)
  testDriveLinearDistance(rower, 0.7485561895845304)
  testDriveLength(rower, 0.3141592653589791)
  testDriveAverageHandleForce(rower, 221.35842669540312)
  testDrivePeakHandleForce(rower, 327.52410223150326)
  testRecoveryDuration(rower, 0.2054092660000002)
  testRecoveryDragFactor(rower, 303.0202258405183)
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
  testTotalMovingTimeSinceStart(rower, 1.1025003730000005)
  testTotalNumberOfStrokes(rower, 3)
  testTotalLinearDistanceSinceStart(rower, 4.55056037889212)
  testCycleDuration(rower, 0.3823686260000002)
  testCycleLinearDistance(rower, 1.746631109030572)
  testCycleLinearVelocity(rower, 4.567924746604526)
  testCyclePower(rower, 266.8792774387098)
  testDriveDuration(rower, 0.16582749800000018)
  testDriveLinearDistance(rower, 0.7485561895845304)
  testDriveLength(rower, 0.3141592653589791)
  testDriveAverageHandleForce(rower, 221.35842669540312)
  testDrivePeakHandleForce(rower, 327.52410223150326)
  testRecoveryDuration(rower, 0.21654112800000003)
  testRecoveryDragFactor(rower, 303.0202258405183)
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
  testTotalLinearDistanceSinceStart(rower, 167.0036095776319)
  testTotalNumberOfStrokes(rower, 16)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('sample data for DKN R-320 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.DKN_R320.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 22.249536391000003)
  testTotalLinearDistanceSinceStart(rower, 71.93409638401903)
  testTotalNumberOfStrokes(rower, 10)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.DKN_R320.dragFactor)
})

test('sample data for NordicTrack RX800 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.NordicTrack_RX800.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 22.65622640199999)
  testTotalLinearDistanceSinceStart(rower, 79.82415337755886)
  testTotalNumberOfStrokes(rower, 10)
  // As dragFactor is dynamic, it should have changed
  testRecoveryDragFactor(rower, 495.2214113398)
})

test('A full session for SportsTech WRX700 should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 2342.741183077012)
  testTotalLinearDistanceSinceStart(rower, 8410.330084026098)
  testTotalNumberOfStrokes(rower, 846)
  // As dragFactor is static, it should remain in place
  testRecoveryDragFactor(rower, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('A full session for a Concept2 RowErg should produce plausible results', async () => {
  const rower = createRower(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg))
  testTotalMovingTimeSinceStart(rower, 0)
  testTotalLinearDistanceSinceStart(rower, 0)
  testTotalNumberOfStrokes(rower, 0)
  testRecoveryDragFactor(rower, rowerProfiles.Concept2_RowErg.dragFactor)

  await replayRowingSession(rower.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTimeSinceStart(rower, 476.2153029599991)
  testTotalLinearDistanceSinceStart(rower, 2011.5383813537474)
  testTotalNumberOfStrokes(rower, 246)
  // As dragFactor isn't static, it should have changed
  testRecoveryDragFactor(rower, 131.53051234393723)
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

/*
function reportAll (rower) {
  assert.ok(0, `time: ${rower.totalMovingTimeSinceStart()}, state ${rower.strokeState()}, No Strokes: ${rower.totalNumberOfStrokes()}, Lin Distance: ${rower.totalLinearDistanceSinceStart()}, cycle dur: ${rower.cycleDuration()}, cycle Lin Dist: ${rower.cycleLinearDistance()}, Lin Velocity: ${rower.cycleLinearVelocity()}, Power: ${rower.cyclePower()}, Drive Dur: ${rower.driveDuration()}, Drive Lin. Dist. ${rower.driveLinearDistance()}, Drive Length: ${rower.driveLength()}, Av. Handle Force: ${rower.driveAverageHandleForce()}, Peak Handle Force: ${rower.drivePeakHandleForce()}, Rec. Dur: ${rower.recoveryDuration()}, Dragfactor: ${rower.recoveryDragFactor()}, Inst Handle Power: ${rower.instantHandlePower()}`)
}
*/

test.run()
