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

import { createRowingStatistics } from './RowingStatistics.js'

const baseConfig = {
  loglevel: {
    default: 'silent',
    RowingEngine: 'silent'
  },
  numOfPhasesForAveragingScreenData: 2,
  rowerSettings: { // Based on Concept 2 settings, as this is the validation system
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
}

// Test behaviour for no datapoints
test('Correct rower behaviour at initialisation', () => {
  const rowingStatistics = createRowingStatistics(baseConfig)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testTotalMovingTime(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, 0.13) // Default value
  testCycleDistance(rowingStatistics, 0)
  testCycleLinearVelocity(rowingStatistics, 0)
  testCyclePower(rowingStatistics, 0)
  testDriveDuration(rowingStatistics, 0)
  testDriveDistance(rowingStatistics, 0)
  testDriveLength(rowingStatistics, 0)
  testDriveAverageHandleForce(rowingStatistics, 0)
  testDrivePeakHandleForce(rowingStatistics, 0)
  testRecoveryDuration(rowingStatistics, 0)
  testDragFactor(rowingStatistics, 110)
  testInstantHandlePower(rowingStatistics, 0)
})

// Test behaviour for one datapoint

// Test behaviour for three perfect identical strokes, including settingling behaviour of metrics
test('Test behaviour for three perfect identical strokes, including settingling behaviour of metrics', () => {
  const rowingStatistics = createRowingStatistics(baseConfig)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testCycleDuration(rowingStatistics, 0.13) // Default value
  testCycleDistance(rowingStatistics, 0)
  testCycleLinearVelocity(rowingStatistics, 0)
  testCyclePower(rowingStatistics, 0)
  testDriveDuration(rowingStatistics, 0)
  testDriveDistance(rowingStatistics, 0)
  testDriveLength(rowingStatistics, 0)
  testDriveAverageHandleForce(rowingStatistics, 0)
  testDrivePeakHandleForce(rowingStatistics, 0)
  testRecoveryDuration(rowingStatistics, 0)
  testDragFactor(rowingStatistics, 110)
  testInstantHandlePower(rowingStatistics, 0)
  // Drive initial stroke starts here
  rowingStatistics.handleRotationImpulse(0.011221636)
  rowingStatistics.handleRotationImpulse(0.011175504)
  rowingStatistics.handleRotationImpulse(0.01116456)
  rowingStatistics.handleRotationImpulse(0.011130263)
  rowingStatistics.handleRotationImpulse(0.011082613)
  rowingStatistics.handleRotationImpulse(0.011081761)
  rowingStatistics.handleRotationImpulse(0.011062297)
  rowingStatistics.handleRotationImpulse(0.011051853)
  rowingStatistics.handleRotationImpulse(0.010973313)
  rowingStatistics.handleRotationImpulse(0.010919756)
  rowingStatistics.handleRotationImpulse(0.01086431)
  rowingStatistics.handleRotationImpulse(0.010800864)
  rowingStatistics.handleRotationImpulse(0.010956987)
  rowingStatistics.handleRotationImpulse(0.010653396)
  rowingStatistics.handleRotationImpulse(0.010648619)
  rowingStatistics.handleRotationImpulse(0.010536818)
  rowingStatistics.handleRotationImpulse(0.010526151)
  rowingStatistics.handleRotationImpulse(0.010511225)
  rowingStatistics.handleRotationImpulse(0.010386684)
  testStrokeState(rowingStatistics, 'Drive')
  testTotalMovingTime(rowingStatistics, 0.077918634)
  testTotalLinearDistance(rowingStatistics, 0.2847935546277449)
  testTotalNumberOfStrokes(rowingStatistics, 1)
  testCycleDuration(rowingStatistics, 0.13) // still default value
  testCycleDistance(rowingStatistics, 0.2847935546277449)
  testCycleLinearVelocity(rowingStatistics, 0) // This isn't filled after the first drive, as we haven't survived a complete cycle yet
  testCyclePower(rowingStatistics, 0) // This isn't filled after the first drive, as we haven't survived a complete cycle yet
  testDriveDuration(rowingStatistics, 0) // Shouldn't this one be filled after the first drive?
  testDriveDistance(rowingStatistics, 0.2847935546277449)
  testDriveLength(rowingStatistics, 0) // Shouldn't this one be filled after the first drive?
  testDriveAverageHandleForce(rowingStatistics, 249.91096328436572)
  testDrivePeakHandleForce(rowingStatistics, 280.43473478416803)
  testRecoveryDuration(rowingStatistics, 0)
  testDragFactor(rowingStatistics, 110)
  testInstantHandlePower(rowingStatistics, 372.09477620281604)
  // Recovery initial stroke starts here
  rowingStatistics.handleRotationImpulse(0.010769)
  rowingStatistics.handleRotationImpulse(0.010707554)
  rowingStatistics.handleRotationImpulse(0.010722165)
  rowingStatistics.handleRotationImpulse(0.01089567)
  rowingStatistics.handleRotationImpulse(0.010917504)
  rowingStatistics.handleRotationImpulse(0.010997969)
  rowingStatistics.handleRotationImpulse(0.011004655)
  rowingStatistics.handleRotationImpulse(0.011013618)
  rowingStatistics.handleRotationImpulse(0.011058193)
  rowingStatistics.handleRotationImpulse(0.010807149)
  rowingStatistics.handleRotationImpulse(0.0110626)
  rowingStatistics.handleRotationImpulse(0.011090787)
  rowingStatistics.handleRotationImpulse(0.011099509)
  rowingStatistics.handleRotationImpulse(0.011131862)
  rowingStatistics.handleRotationImpulse(0.011209919)
  testStrokeState(rowingStatistics, 'Recovery')
  testTotalMovingTime(rowingStatistics, 0.23894732900000007)
  testTotalLinearDistance(rowingStatistics, 0.8187814695547666)
  testTotalNumberOfStrokes(rowingStatistics, 1)
  testCycleDuration(rowingStatistics, 0.143485717)
  testCycleDistance(rowingStatistics, 0.8187814695547666)
  testCycleLinearVelocity(rowingStatistics, 3.4734378516473075)
  testCyclePower(rowingStatistics, 117.33744556320872)
  testDriveDuration(rowingStatistics, 0.143485717)
  testDriveDistance(rowingStatistics, 0.4983887205985536)
  testDriveLength(rowingStatistics, 0.20525072003453312)
  testDriveAverageHandleForce(rowingStatistics, 276.20193475035796)
  testDrivePeakHandleForce(rowingStatistics, 325.1619554833936)
  testRecoveryDuration(rowingStatistics, 0)
  testDragFactor(rowingStatistics, 110)
  testInstantHandlePower(rowingStatistics, 0)
  // Drive seconds stroke starts here
  rowingStatistics.handleRotationImpulse(0.011221636)
  rowingStatistics.handleRotationImpulse(0.011175504)
  rowingStatistics.handleRotationImpulse(0.01116456)
  rowingStatistics.handleRotationImpulse(0.011130263)
  rowingStatistics.handleRotationImpulse(0.011082613)
  rowingStatistics.handleRotationImpulse(0.011081761)
  rowingStatistics.handleRotationImpulse(0.011062297)
  rowingStatistics.handleRotationImpulse(0.011051853)
  rowingStatistics.handleRotationImpulse(0.010973313)
  rowingStatistics.handleRotationImpulse(0.010919756)
  rowingStatistics.handleRotationImpulse(0.01086431)
  rowingStatistics.handleRotationImpulse(0.010800864)
  rowingStatistics.handleRotationImpulse(0.010956987)
  rowingStatistics.handleRotationImpulse(0.010653396)
  rowingStatistics.handleRotationImpulse(0.010648619)
  rowingStatistics.handleRotationImpulse(0.010536818)
  rowingStatistics.handleRotationImpulse(0.010526151)
  rowingStatistics.handleRotationImpulse(0.010511225)
  rowingStatistics.handleRotationImpulse(0.010386684)
  testStrokeState(rowingStatistics, 'Drive')
  testTotalMovingTime(rowingStatistics, 0.44915539800000004)
  testTotalLinearDistance(rowingStatistics, 1.6138554294533207)
  testTotalNumberOfStrokes(rowingStatistics, 2)
  testCycleDuration(rowingStatistics, 0.34889498300000005)
  testCycleDistance(rowingStatistics, 1.115466708854767)
  testCycleLinearVelocity(rowingStatistics, 3.3671261270026562)
  testCyclePower(rowingStatistics, 106.8897805121993)
  testDriveDuration(rowingStatistics, 0.143485717)
  testDriveDistance(rowingStatistics, 0.43908201661387286)
  testDriveLength(rowingStatistics, 0.20525072003453312)
  testDriveAverageHandleForce(rowingStatistics, 236.59556700196183)
  testDrivePeakHandleForce(rowingStatistics, 380.1396336099103)
  testRecoveryDuration(rowingStatistics, 0.20540926600000003)
  testDragFactor(rowingStatistics, 283.12720365097886)
  testInstantHandlePower(rowingStatistics, 504.63602120716615)
  // Recovery second stroke starts here
  rowingStatistics.handleRotationImpulse(0.010769)
  rowingStatistics.handleRotationImpulse(0.010707554)
  rowingStatistics.handleRotationImpulse(0.010722165)
  rowingStatistics.handleRotationImpulse(0.01089567)
  rowingStatistics.handleRotationImpulse(0.010917504)
  rowingStatistics.handleRotationImpulse(0.010997969)
  rowingStatistics.handleRotationImpulse(0.011004655)
  rowingStatistics.handleRotationImpulse(0.011013618)
  rowingStatistics.handleRotationImpulse(0.011058193)
  rowingStatistics.handleRotationImpulse(0.010807149)
  rowingStatistics.handleRotationImpulse(0.0110626)
  rowingStatistics.handleRotationImpulse(0.011090787)
  rowingStatistics.handleRotationImpulse(0.011099509)
  rowingStatistics.handleRotationImpulse(0.011131862)
  rowingStatistics.handleRotationImpulse(0.011209919)
  testStrokeState(rowingStatistics, 'Recovery')
  testTotalMovingTime(rowingStatistics, 0.6101840930000001)
  testTotalLinearDistance(rowingStatistics, 2.345658790476442)
  testTotalNumberOfStrokes(rowingStatistics, 2)
  testCycleDuration(rowingStatistics, 0.44526865700000007)
  testCycleDistance(rowingStatistics, 1.1708853776369939)
  testCycleLinearVelocity(rowingStatistics, 4.4922598720661)
  testCyclePower(rowingStatistics, 253.83566752220202)
  testDriveDuration(rowingStatistics, 0.23985939100000003)
  testDriveDistance(rowingStatistics, 1.0733115961672446)
  testDriveLength(rowingStatistics, 0.32253684576855207)
  testDriveAverageHandleForce(rowingStatistics, 285.0923064376231)
  testDrivePeakHandleForce(rowingStatistics, 439.7407274840117)
  testRecoveryDuration(rowingStatistics, 0.20540926600000003)
  testDragFactor(rowingStatistics, 283.12720365097886) // As we decelerate the flywheel quite fast, this is expected
  testInstantHandlePower(rowingStatistics, 0)
  // Drive third stroke starts here
  rowingStatistics.handleRotationImpulse(0.011221636)
  rowingStatistics.handleRotationImpulse(0.011175504)
  rowingStatistics.handleRotationImpulse(0.01116456)
  rowingStatistics.handleRotationImpulse(0.011130263)
  rowingStatistics.handleRotationImpulse(0.011082613)
  rowingStatistics.handleRotationImpulse(0.011081761)
  rowingStatistics.handleRotationImpulse(0.011062297)
  rowingStatistics.handleRotationImpulse(0.011051853)
  rowingStatistics.handleRotationImpulse(0.010973313)
  rowingStatistics.handleRotationImpulse(0.010919756)
  rowingStatistics.handleRotationImpulse(0.01086431)
  rowingStatistics.handleRotationImpulse(0.010800864)
  rowingStatistics.handleRotationImpulse(0.010956987)
  rowingStatistics.handleRotationImpulse(0.010653396)
  rowingStatistics.handleRotationImpulse(0.010648619)
  rowingStatistics.handleRotationImpulse(0.010536818)
  rowingStatistics.handleRotationImpulse(0.010526151)
  rowingStatistics.handleRotationImpulse(0.010511225)
  rowingStatistics.handleRotationImpulse(0.010386684)
  testStrokeState(rowingStatistics, 'Drive')
  testTotalMovingTime(rowingStatistics, 0.8203921620000004)
  testTotalLinearDistance(rowingStatistics, 3.272609714439062)
  testTotalNumberOfStrokes(rowingStatistics, 3)
  testCycleDuration(rowingStatistics, 0.3379838680000002)
  testCycleDistance(rowingStatistics, 1.0245247054323694)
  testCycleLinearVelocity(rowingStatistics, 4.474750885983458)
  testCyclePower(rowingStatistics, 250.879178806138)
  testDriveDuration(rowingStatistics, 0.23985939100000003)
  testDriveDistance(rowingStatistics, 0.5854426888184969)
  testDriveLength(rowingStatistics, 0.32253684576855207)
  testDriveAverageHandleForce(rowingStatistics, 194.28476369698888)
  testDrivePeakHandleForce(rowingStatistics, 380.1396336085015)
  testRecoveryDuration(rowingStatistics, 0.09812447700000015)
  testDragFactor(rowingStatistics, 283.12720365097886)
  testInstantHandlePower(rowingStatistics, 504.63602120535336)
  // Recovery third stroke starts here
  rowingStatistics.handleRotationImpulse(0.010769)
  rowingStatistics.handleRotationImpulse(0.010707554)
  rowingStatistics.handleRotationImpulse(0.010722165)
  rowingStatistics.handleRotationImpulse(0.01089567)
  rowingStatistics.handleRotationImpulse(0.010917504)
  rowingStatistics.handleRotationImpulse(0.010997969)
  rowingStatistics.handleRotationImpulse(0.011004655)
  rowingStatistics.handleRotationImpulse(0.011013618)
  rowingStatistics.handleRotationImpulse(0.011058193)
  rowingStatistics.handleRotationImpulse(0.010807149)
  rowingStatistics.handleRotationImpulse(0.0110626)
  rowingStatistics.handleRotationImpulse(0.011090787)
  rowingStatistics.handleRotationImpulse(0.011099509)
  rowingStatistics.handleRotationImpulse(0.011131862)
  rowingStatistics.handleRotationImpulse(0.011209919)
  testStrokeState(rowingStatistics, 'Recovery')
  testTotalMovingTime(rowingStatistics, 0.9814208570000005)
  testTotalLinearDistance(rowingStatistics, 4.004413075462183)
  testTotalNumberOfStrokes(rowingStatistics, 3)
  testCycleDuration(rowingStatistics, 0.3712367640000004)
  testCycleDistance(rowingStatistics, 1.3172460498416183)
  testCycleLinearVelocity(rowingStatistics, 4.468184312116618)
  testCyclePower(rowingStatistics, 249.7763239131314)
  testDriveDuration(rowingStatistics, 0.27311228700000023)
  testDriveDistance(rowingStatistics, 1.2196722683718682)
  testDriveLength(rowingStatistics, 0.36651914291880905)
  testDriveAverageHandleForce(rowingStatistics, 254.91449219500532)
  testDrivePeakHandleForce(rowingStatistics, 439.74072748282515)
  testRecoveryDuration(rowingStatistics, 0.09812447700000015)
  testDragFactor(rowingStatistics, 283.12720365097886)
  testInstantHandlePower(rowingStatistics, 0)
  // Dwelling state starts here
  rowingStatistics.handleRotationImpulse(0.020769)
  rowingStatistics.handleRotationImpulse(0.020707554)
  rowingStatistics.handleRotationImpulse(0.020722165)
  rowingStatistics.handleRotationImpulse(0.02089567)
  rowingStatistics.handleRotationImpulse(0.020917504)
  rowingStatistics.handleRotationImpulse(0.020997969)
  rowingStatistics.handleRotationImpulse(0.021004655)
  rowingStatistics.handleRotationImpulse(0.021013618)
  rowingStatistics.handleRotationImpulse(0.021058193)
  rowingStatistics.handleRotationImpulse(0.020807149)
  rowingStatistics.handleRotationImpulse(0.0210626)
  rowingStatistics.handleRotationImpulse(0.021090787)
  rowingStatistics.handleRotationImpulse(0.021099509)
  rowingStatistics.handleRotationImpulse(0.021131862)
  rowingStatistics.handleRotationImpulse(0.021209919)
  testStrokeState(rowingStatistics, 'WaitingForDrive')
  testTotalMovingTime(rowingStatistics, 1.1344792920000004)
  testTotalNumberOfStrokes(rowingStatistics, 3)
  testTotalLinearDistance(rowingStatistics, 4.638642655015554)
  testCycleDuration(rowingStatistics, 0.4476004410000002)
  testCycleDistance(rowingStatistics, 1.9514756293949895)
  testCycleLinearVelocity(rowingStatistics, 4.359860828186693)
  testCyclePower(rowingStatistics, 232.04697446513617)
  testDriveDuration(rowingStatistics, 0.27311228700000023)
  testDriveDistance(rowingStatistics, 1.2196722683718682)
  testDriveLength(rowingStatistics, 0.36651914291880905)
  testDriveAverageHandleForce(rowingStatistics, 254.91449219500532)
  testDrivePeakHandleForce(rowingStatistics, 439.74072748282515)
  testRecoveryDuration(rowingStatistics, 0.17448815399999995)
  testDragFactor(rowingStatistics, 283.12720365097886)
  testInstantHandlePower(rowingStatistics, 0)
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
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    rowerSettings: rowerProfile
  }
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 46.302522627)
  testTotalLinearDistance(rowingStatistics, 166.29596716416734)
  testTotalNumberOfStrokes(rowingStatistics, 16)
  // As dragFactor is static, it should remain in place
  testDragFactor(rowingStatistics, rowerProfiles.Sportstech_WRX700.dragFactor)
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
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, rowerProfiles.DKN_R320.dragFactor)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 21.701535821)
  testTotalLinearDistance(rowingStatistics, 70.11298001986664)
  testTotalNumberOfStrokes(rowingStatistics, 10)
  // As dragFactor is static, it should remain in place
  testDragFactor(rowingStatistics, rowerProfiles.DKN_R320.dragFactor)
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
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, rowerProfiles.NordicTrack_RX800.dragFactor)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 22.00348755)
  testTotalLinearDistance(rowingStatistics, 79.28440927826468)
  testTotalNumberOfStrokes(rowingStatistics, 10)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(rowingStatistics, 494.92868774518126)
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
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, rowerProfiles.Sportstech_WRX700.dragFactor)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 2340.0100514160117)
  testTotalLinearDistance(rowingStatistics, 8407.499514372348)
  testTotalNumberOfStrokes(rowingStatistics, 846)
  // As dragFactor is static, it should remain in place
  testDragFactor(rowingStatistics, rowerProfiles.Sportstech_WRX700.dragFactor)
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
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, (rowerProfiles.Concept2_Model_C.dragFactor))

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 181.47141999999985)
  testTotalLinearDistance(rowingStatistics, 551.8791705339402)
  testTotalNumberOfStrokes(rowingStatistics, 84)
  // As dragFactor isn't static, it should have changed
  testDragFactor(rowingStatistics, 123.82587294279575)
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
  const rowingStatistics = createRowingStatistics(testConfig)
  testTotalMovingTime(rowingStatistics, 0)
  testTotalLinearDistance(rowingStatistics, 0)
  testTotalNumberOfStrokes(rowingStatistics, 0)
  testDragFactor(rowingStatistics, rowerProfiles.Concept2_RowErg.dragFactor)

  await replayRowingSession(rowingStatistics.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTime(rowingStatistics, 590.1412610000001)
  testTotalLinearDistance(rowingStatistics, 2029.785512056144)
  testTotalNumberOfStrokes(rowingStatistics, 206)
  // As dragFactor isn't static, it should have changed
  testDragFactor(rowingStatistics, 80.79044336920735)
})

function testStrokeState (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().strokeState === expectedValue, `strokeState should be ${expectedValue} at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().strokeState}`)
}

function testTotalMovingTime (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().totalMovingTime === expectedValue, `totalMovingTime should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalMovingTime}`)
}

function testTotalNumberOfStrokes (rowingStatistics, expectedValue) {
  // Please note there is a stroke 0
  assert.ok(rowingStatistics.getMetrics().totalNumberOfStrokes === expectedValue, `totalNumberOfStrokes should be ${expectedValue} at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalNumberOfStrokes}`)
}

function testTotalLinearDistance (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().totalLinearDistance === expectedValue, `totalLinearDistance should be ${expectedValue} meters at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().totalLinearDistance}`)
}

function testCycleDuration (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cycleDuration === expectedValue, `cycleDuration should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cycleDuration}`)
}

function testCycleDistance (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cycleDistance === expectedValue, `cycleDistance should be ${expectedValue} meters at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cycleDistance}`)
}

function testCycleLinearVelocity (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cycleLinearVelocity === expectedValue, `cycleLinearVelocity should be ${expectedValue} m/s at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cycleLinearVelocity}`)
}

function testCyclePower (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().cyclePower === expectedValue, `cyclePower should be ${expectedValue} Watt at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().cyclePower}`)
}

function testDriveDuration (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveDuration === expectedValue, `driveDuration should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveDuration}`)
}

function testDriveDistance (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveDistance === expectedValue, `DriveDistance should be ${expectedValue} meters at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveDistance}`)
}

function testDriveLength (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveLength === expectedValue, `driveLength should be ${expectedValue} meters at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveLength}`)
}

function testDriveAverageHandleForce (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().driveAverageHandleForce === expectedValue, `driveAverageHandleForce should be ${expectedValue} N at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().driveAverageHandleForce}`)
}

function testDrivePeakHandleForce (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().drivePeakHandleForce === expectedValue, `drivePeakHandleForce should be ${expectedValue} N at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().drivePeakHandleForce}`)
}

function testRecoveryDuration (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().recoveryDuration === expectedValue, `recoveryDuration should be ${expectedValue} sec at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().recoveryDuration}`)
}

function testDragFactor (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().dragFactor === expectedValue, `dragFactor should be ${expectedValue} N*m*s^2 at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().dragFactor}`)
}

function testInstantHandlePower (rowingStatistics, expectedValue) {
  assert.ok(rowingStatistics.getMetrics().instantHandlePower === expectedValue, `instantHandlePower should be ${expectedValue} Watt at ${rowingStatistics.getMetrics().totalMovingTime} sec, is ${rowingStatistics.getMetrics().instantHandlePower}`)
}

function reportAll (rowingStatistics) { // eslint-disable-line no-unused-vars
  assert.ok(0, `time: ${rowingStatistics.getMetrics().totalMovingTime}, state ${rowingStatistics.getMetrics().strokeState}, No Strokes: ${rowingStatistics.getMetrics().totalNumberOfStrokes + 1}, Lin Distance: ${rowingStatistics.getMetrics().totalLinearDistance}, cycle dur: ${rowingStatistics.getMetrics().cycleDuration}, cycle Lin Dist: ${rowingStatistics.getMetrics().cycleLinearDistance}, Lin Velocity: ${rowingStatistics.getMetrics().cycleLinearVelocity}, Power: ${rowingStatistics.getMetrics().cyclePower}, Drive Dur: ${rowingStatistics.getMetrics().driveDuration}, Drive Lin. Dist. ${rowingStatistics.driveDistance}, Drive Length: ${rowingStatistics.getMetrics().driveLength}, Av. Handle Force: ${rowingStatistics.getMetrics().driveAverageHandleForce}, Peak Handle Force: ${rowingStatistics.getMetrics().drivePeakHandleForce}, Rec. Dur: ${rowingStatistics.getMetrics().recoveryDuration}, Dragfactor: ${rowingStatistics.getMetrics().dragFactor}, Inst Handle Power: ${rowingStatistics.getMetrics().instantHandlePower}`)
}

test.run()
