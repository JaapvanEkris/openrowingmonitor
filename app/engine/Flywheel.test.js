'use strict'
/**
 * Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
 */
/**
 * Tests of the Flywheel object
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { deepMerge } from '../tools/Helper.js'
import { replayRowingSession } from '../recorders/RowingReplayer.js'
import rowerProfiles from '../../config/rowerProfiles.js'

import { createFlywheel } from './Flywheel.js'

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
  minimumForceBeforeStroke: 10,
  minimumRecoverySlope: 0.00070,
  autoAdjustRecoverySlope: true,
  autoAdjustRecoverySlopeMargin: 0.15,
  minimumDriveTime: 0.40,
  minimumRecoveryTime: 0.90,
  flywheelInertia: 0.1031,
  magicConstant: 2.8
}

// Test behaviour for no datapoints
test('Correct Flywheel behaviour at initialisation', () => {
  const flywheel = createFlywheel(baseConfig)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, false)
})

// Test behaviour for one datapoint

// Test behaviour for perfect upgoing flank

// Test behaviour for perfect downgoing flank

/**
 * Test of the integration of the underlying FullTSQuadraticEstimator object
 * This uses the same data as the function y = 2 x^2 + 4 * x
 */
test('Test of correct algorithmic integration of FullTSQuadraticEstimator and Flywheel object for quadratic function f(x) = 2 * x^2 + 4 * x', () => {
  const testConfig = {
    numOfImpulsesPerRevolution: 6,
    sprocketRadius: 1,
    maximumStrokeTimeBeforePause: 6.0,
    dragFactor: 10,
    autoAdjustDragFactor: false,
    minimumDragQuality: 0.95,
    dragFactorSmoothing: 3,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 1,
    flankLength: 12,
    smoothing: 1,
    minimumStrokeQuality: 0.36,
    minimumForceBeforeStroke: 0,
    minimumRecoverySlope: 0.00070,
    autoAdjustRecoverySlope: false,
    autoAdjustRecoverySlopeMargin: 0.15,
    minimumDriveTime: 0.40,
    minimumRecoveryTime: 0.90,
    flywheelInertia: 0.1031,
    magicConstant: 2.8
  }
  const flywheel = createFlywheel(testConfig) // Please note, Datapoint 0 is automatically added by this initialisation
  flywheel.maintainStateAndMetrics()
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.234341433963188) // Datapoint 1
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.196461680094298) // Datapoint 2
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.172567188397595) // Datapoint 3
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.155718979643243) // Datapoint 4
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.143013206725950) // Datapoint 5
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.132987841748253) // Datapoint 6
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.124815090780014) // Datapoint 7
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.117986192571703) // Datapoint 8
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.112168841458569) // Datapoint 9
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.107135523306685) // Datapoint 10
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.102724506937187) // Datapoint 11
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.098817239158663) // Datapoint 12
  testDeltaTime(flywheel, 0) // Values from Datapoint 0 are now passsing through
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 4.000000000000002)
  testAngularAcceleration(flywheel, 3.9999999999999813)
  flywheel.pushValue(0.095324565640171) // Datapoint 13
  testDeltaTime(flywheel, 0.234341433963188) // Values from Datapoint 1 are now passsing through
  testSpinningTime(flywheel, 0.234341433963188)
  testAngularPosition(flywheel, 1.0471975511965976)
  testAngularVelocity(flywheel, 4.93736573585275)
  testAngularAcceleration(flywheel, 3.9999999999999813)
  flywheel.pushValue(0.092177973027300) // Datapoint 14
  testDeltaTime(flywheel, 0.196461680094298) // Values from Datapoint 2 are now passsing through
  testSpinningTime(flywheel, 0.430803114057486)
  testAngularPosition(flywheel, 2.0943951023931953)
  testAngularVelocity(flywheel, 5.723212456229937)
  testAngularAcceleration(flywheel, 3.999999999999982)
  flywheel.pushValue(0.089323823233014) // Datapoint 15
  testDeltaTime(flywheel, 0.172567188397595) // Values from Datapoint 3 are now passsing through
  testSpinningTime(flywheel, 0.6033703024550809)
  testAngularPosition(flywheel, 3.141592653589793)
  testAngularVelocity(flywheel, 6.413481209820316)
  testAngularAcceleration(flywheel, 3.9999999999999853)
  flywheel.pushValue(0.086719441920360) // Datapoint 16
  testDeltaTime(flywheel, 0.155718979643243) // Values from Datapoint 4 are now passsing through
  testSpinningTime(flywheel, 0.7590892820983239)
  testAngularPosition(flywheel, 4.1887902047863905)
  testAngularVelocity(flywheel, 7.0363571283932815)
  testAngularAcceleration(flywheel, 3.9999999999999853)
  flywheel.pushValue(0.084330395149166) // Datapoint 17
  testDeltaTime(flywheel, 0.143013206725950) // Values from Datapoint 5 are now passsing through
  testSpinningTime(flywheel, 0.9021024888242739)
  testAngularPosition(flywheel, 5.235987755982988)
  testAngularVelocity(flywheel, 7.608409955297077)
  testAngularAcceleration(flywheel, 3.9999999999999845)
  flywheel.pushValue(0.082128549835466) // Datapoint 18
  testDeltaTime(flywheel, 0.132987841748253) // Values from Datapoint 6 are now passsing through
  testSpinningTime(flywheel, 1.035090330572527)
  testAngularPosition(flywheel, 6.283185307179586)
  testAngularVelocity(flywheel, 8.140361322290088)
  testAngularAcceleration(flywheel, 3.9999999999999862)
  flywheel.pushValue(0.080090664596669) // Datapoint 19
  testDeltaTime(flywheel, 0.124815090780014) // Values from Datapoint 7 are now passsing through
  testSpinningTime(flywheel, 1.159905421352541)
  testAngularPosition(flywheel, 7.330382858376184)
  testAngularVelocity(flywheel, 8.639621685410143)
  testAngularAcceleration(flywheel, 3.999999999999988)
  flywheel.pushValue(0.078197347646078) // Datapoint 20
  testDeltaTime(flywheel, 0.117986192571703) // Values from Datapoint 8 are now passsing through
  testSpinningTime(flywheel, 1.277891613924244)
  testAngularPosition(flywheel, 8.377580409572781)
  testAngularVelocity(flywheel, 9.111566455696956)
  testAngularAcceleration(flywheel, 3.999999999999988)
  flywheel.pushValue(0.076432273828253) // Datapoint 21
  testDeltaTime(flywheel, 0.112168841458569) // Values from Datapoint 9 are now passsing through
  testSpinningTime(flywheel, 1.390060455382813)
  testAngularPosition(flywheel, 9.42477796076938)
  testAngularVelocity(flywheel, 9.560241821531234)
  testAngularAcceleration(flywheel, 3.999999999999984)
  flywheel.pushValue(0.074781587915460) // Datapoint 22
  testDeltaTime(flywheel, 0.107135523306685) // Values from Datapoint 10 are now passsing through
  testSpinningTime(flywheel, 1.4971959786894982)
  testAngularPosition(flywheel, 10.471975511965976)
  testAngularVelocity(flywheel, 9.988783914757978)
  testAngularAcceleration(flywheel, 3.9999999999999756)
  flywheel.pushValue(0.073233443959153) // Datapoint 23
  testDeltaTime(flywheel, 0.102724506937187) // Values from Datapoint 11 are now passsing through
  testSpinningTime(flywheel, 1.599920485626685)
  testAngularPosition(flywheel, 11.519173063162574)
  testAngularVelocity(flywheel, 10.39968194250673)
  testAngularAcceleration(flywheel, 3.999999999999965)
  flywheel.pushValue(0.071777645486524) // Datapoint 24
  testDeltaTime(flywheel, 0.098817239158663) // Values from Datapoint 12 are now passsing through
  testSpinningTime(flywheel, 1.6987377247853481)
  testAngularPosition(flywheel, 12.566370614359172)
  testAngularVelocity(flywheel, 10.794950899141384)
  testAngularAcceleration(flywheel, 3.9999999999999525)
  flywheel.pushValue(0.070405361445316) // Datapoint 25
  testDeltaTime(flywheel, 0.095324565640171) // Values from Datapoint 13 are now passsing through
  testSpinningTime(flywheel, 1.794062290425519)
  testAngularPosition(flywheel, 13.613568165555769)
  testAngularVelocity(flywheel, 11.176249161702065)
  testAngularAcceleration(flywheel, 3.9999999999999396)
  flywheel.pushValue(0.069108899742145) // Datapoint 26
  testDeltaTime(flywheel, 0.092177973027300) // Values from Datapoint 14 are now passsing through
  testSpinningTime(flywheel, 1.886240263452819)
  testAngularPosition(flywheel, 14.660765716752367)
  testAngularVelocity(flywheel, 11.544961053811258)
  testAngularAcceleration(flywheel, 3.9999999999999285)
  flywheel.pushValue(0.067881525062373) // Datapoint 27
  testDeltaTime(flywheel, 0.089323823233014) // Values from Datapoint 15 are now passsing through
  testSpinningTime(flywheel, 1.975564086685833)
  testAngularPosition(flywheel, 15.707963267948964)
  testAngularVelocity(flywheel, 11.902256346743307)
  testAngularAcceleration(flywheel, 3.9999999999999214)
  flywheel.pushValue(0.066717311088441) // Datapoint 28
  testDeltaTime(flywheel, 0.086719441920360) // Values from Datapoint 16 are now passsing through
  testSpinningTime(flywheel, 2.062283528606193)
  testAngularPosition(flywheel, 16.755160819145562)
  testAngularVelocity(flywheel, 12.249134114424734)
  testAngularAcceleration(flywheel, 3.999999999999916)
  flywheel.pushValue(0.065611019694526) // Datapoint 29
  testDeltaTime(flywheel, 0.084330395149166) // Values from Datapoint 17 are now passsing through
  testSpinningTime(flywheel, 2.1466139237553588)
  testAngularPosition(flywheel, 17.80235837034216)
  testAngularVelocity(flywheel, 12.586455695021384)
  testAngularAcceleration(flywheel, 3.99999999999992)
  flywheel.pushValue(0.064558001484125) // Datapoint 30
  testDeltaTime(flywheel, 0.082128549835466) // Values from Datapoint 18 are now passsing through
  testSpinningTime(flywheel, 2.228742473590825)
  testAngularPosition(flywheel, 18.84955592153876)
  testAngularVelocity(flywheel, 12.91496989436323)
  testAngularAcceleration(flywheel, 3.9999999999999303)
  flywheel.pushValue(0.063554113352442) // Datapoint 31
  testDeltaTime(flywheel, 0.080090664596669) // Values from Datapoint 19 are now passsing through
  testSpinningTime(flywheel, 2.308833138187494)
  testAngularPosition(flywheel, 19.896753472735355)
  testAngularVelocity(flywheel, 13.235332552749888)
  testAngularAcceleration(flywheel, 3.9999999999999445)
})

/**
 * Test of the integration of the underlying FullTSQuadraticEstimator object
 * The data follows the function y = X^3 + 2 * x^2 + 4 * x
 * To test if multiple quadratic regressions can decently approximate a cubic function
 */
test('Test of correct algorithmic integration of FullTSQuadraticEstimator and Flywheel object for cubic function f(x) = X^3 + 2 * x^2 + 4 * x', () => {
  const testConfig = {
    numOfImpulsesPerRevolution: 6,
    sprocketRadius: 1,
    maximumStrokeTimeBeforePause: 6.0,
    dragFactor: 10,
    autoAdjustDragFactor: false,
    minimumDragQuality: 0.95,
    dragFactorSmoothing: 3,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 1,
    flankLength: 12,
    smoothing: 1,
    minimumStrokeQuality: 0.36,
    minimumForceBeforeStroke: 0,
    minimumRecoverySlope: 0.00070,
    autoAdjustRecoverySlope: false,
    autoAdjustRecoverySlopeMargin: 0.15,
    minimumDriveTime: 0.40,
    minimumRecoveryTime: 0.90,
    flywheelInertia: 0.1031,
    magicConstant: 2.8
  }
  const flywheel = createFlywheel(testConfig) // Please note, Datapoint 0 is automatically added by this initialisation
  flywheel.maintainStateAndMetrics()
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.23182) // Datapoint 1
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.18617) // Datapoint 2
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.15567) // Datapoint 3
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.13426) // Datapoint 4
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.11849) // Datapoint 5
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.10640) // Datapoint 6
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.09682) // Datapoint 7
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.08905) // Datapoint 8
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.08260) // Datapoint 9
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.07715) // Datapoint 10
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.07250) // Datapoint 11
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  flywheel.pushValue(0.06845) // Datapoint 12
  testDeltaTime(flywheel, 0) // Values from Datapoint 0 are now passsing through
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 4.000000000000002)
  testAngularAcceleration(flywheel, 3.9999999999999813)
  flywheel.pushValue(0.06492) // Datapoint 13
  testDeltaTime(flywheel, 0.23182) // Values from Datapoint 1 are now passsing through
  testSpinningTime(flywheel, 0.23182)
  testAngularPosition(flywheel, 1.0471975511965976)
  testAngularVelocity(flywheel, 4.93736573585275)
  testAngularAcceleration(flywheel, 3.9999999999999813)
  flywheel.pushValue(0.06178) // Datapoint 14
  testDeltaTime(flywheel, 0.18617) // Values from Datapoint 2 are now passsing through
  testSpinningTime(flywheel, 0.41799)
  testAngularPosition(flywheel, 2.0943951023931953)
  testAngularVelocity(flywheel, 5.723212456229937)
  testAngularAcceleration(flywheel, 3.999999999999982)
  flywheel.pushValue(0.059) // Datapoint 15
  testDeltaTime(flywheel, 0.15567) // Values from Datapoint 3 are now passsing through
  testSpinningTime(flywheel, 0.57366)
  testAngularPosition(flywheel, 3.141592653589793)
  testAngularVelocity(flywheel, 6.413481209820316)
  testAngularAcceleration(flywheel, 3.9999999999999853)
  flywheel.pushValue(0.05649) // Datapoint 16
  testDeltaTime(flywheel, 0.13426) // Values from Datapoint 4 are now passsing through
  testSpinningTime(flywheel, 0.70792)
  testAngularPosition(flywheel, 4.1887902047863905)
  testAngularVelocity(flywheel, 7.0363571283932815)
  testAngularAcceleration(flywheel, 3.9999999999999853)
  flywheel.pushValue(0.05423) // Datapoint 17
  testDeltaTime(flywheel, 0.11849) // Values from Datapoint 5 are now passsing through
  testSpinningTime(flywheel, 0.82641)
  testAngularPosition(flywheel, 5.235987755982988)
  testAngularVelocity(flywheel, 7.608409955297077)
  testAngularAcceleration(flywheel, 3.9999999999999845)
  flywheel.pushValue(0.05217) // Datapoint 18
  testDeltaTime(flywheel, 0.1064) // Values from Datapoint 6 are now passsing through
  testSpinningTime(flywheel, 0.93281)
  testAngularPosition(flywheel, 6.283185307179586)
  testAngularVelocity(flywheel, 8.140361322290088)
  testAngularAcceleration(flywheel, 3.9999999999999862)
  flywheel.pushValue(0.0503) // Datapoint 19
  testDeltaTime(flywheel, 0.09682) // Values from Datapoint 7 are now passsing through
  testSpinningTime(flywheel, 1.02963)
  testAngularPosition(flywheel, 7.330382858376184)
  testAngularVelocity(flywheel, 8.639621685410143)
  testAngularAcceleration(flywheel, 3.999999999999988)
  flywheel.pushValue(0.04858) // Datapoint 20
  testDeltaTime(flywheel, 0.08905) // Values from Datapoint 8 are now passsing through
  testSpinningTime(flywheel, 1.11868)
  testAngularPosition(flywheel, 8.377580409572781)
  testAngularVelocity(flywheel, 9.111566455696956)
  testAngularAcceleration(flywheel, 3.999999999999988)
  flywheel.pushValue(0.047) // Datapoint 21
  testDeltaTime(flywheel, 0.0826) // Values from Datapoint 9 are now passsing through
  testSpinningTime(flywheel, 1.20128)
  testAngularPosition(flywheel, 9.42477796076938)
  testAngularVelocity(flywheel, 9.560241821531234)
  testAngularAcceleration(flywheel, 3.999999999999984)
  flywheel.pushValue(0.04553) // Datapoint 22
  testDeltaTime(flywheel, 0.07715) // Values from Datapoint 10 are now passsing through
  testSpinningTime(flywheel, 1.27843)
  testAngularPosition(flywheel, 10.471975511965976)
  testAngularVelocity(flywheel, 9.988783914757978)
  testAngularAcceleration(flywheel, 3.9999999999999756)
  flywheel.pushValue(0.04418) // Datapoint 23
  testDeltaTime(flywheel, 0.0725) // Values from Datapoint 11 are now passsing through
  testSpinningTime(flywheel, 1.35093)
  testAngularPosition(flywheel, 11.519173063162574)
  testAngularVelocity(flywheel, 10.39968194250673)
  testAngularAcceleration(flywheel, 3.999999999999965)
  flywheel.pushValue(0.04291) // Datapoint 24
  testDeltaTime(flywheel, 0.06845) // Values from Datapoint 12 are now passsing through
  testSpinningTime(flywheel, 1.41938)
  testAngularPosition(flywheel, 12.566370614359172)
  testAngularVelocity(flywheel, 10.794950899141384)
  testAngularAcceleration(flywheel, 3.9999999999999525)
  flywheel.pushValue(0.04174) // Datapoint 25
  testDeltaTime(flywheel, 0.06492) // Values from Datapoint 13 are now passsing through
  testSpinningTime(flywheel, 1.4843)
  testAngularPosition(flywheel, 13.613568165555769)
  testAngularVelocity(flywheel, 11.176249161702065)
  testAngularAcceleration(flywheel, 3.9999999999999396)
  flywheel.pushValue(0.04063) // Datapoint 26
  testDeltaTime(flywheel, 0.06178) // Values from Datapoint 14 are now passsing through
  testSpinningTime(flywheel, 1.54608)
  testAngularPosition(flywheel, 14.660765716752367)
  testAngularVelocity(flywheel, 11.544961053811258)
  testAngularAcceleration(flywheel, 3.9999999999999285)
  flywheel.pushValue(0.0396) // Datapoint 27
  testDeltaTime(flywheel, 0.059) // Values from Datapoint 15 are now passsing through
  testSpinningTime(flywheel, 1.60508)
  testAngularPosition(flywheel, 15.707963267948964)
  testAngularVelocity(flywheel, 11.902256346743307)
  testAngularAcceleration(flywheel, 3.9999999999999214)
  flywheel.pushValue(0.03863) // Datapoint 28
  testDeltaTime(flywheel, 0.05649) // Values from Datapoint 16 are now passsing through
  testSpinningTime(flywheel, 1.66157)
  testAngularPosition(flywheel, 16.755160819145562)
  testAngularVelocity(flywheel, 12.249134114424734)
  testAngularAcceleration(flywheel, 3.999999999999916)
  flywheel.pushValue(0.03771) // Datapoint 29
  testDeltaTime(flywheel, 0.05423) // Values from Datapoint 17 are now passsing through
  testSpinningTime(flywheel, 1.7158)
  testAngularPosition(flywheel, 17.80235837034216)
  testAngularVelocity(flywheel, 12.586455695021384)
  testAngularAcceleration(flywheel, 3.99999999999992)
  flywheel.pushValue(0.03685) // Datapoint 30
  testDeltaTime(flywheel, 0.05217) // Values from Datapoint 18 are now passsing through
  testSpinningTime(flywheel, 1.76797)
  testAngularPosition(flywheel, 18.84955592153876)
  testAngularVelocity(flywheel, 12.91496989436323)
  testAngularAcceleration(flywheel, 3.9999999999999303)
  flywheel.pushValue(0.03603) // Datapoint 31
  testDeltaTime(flywheel, 0.0503) // Values from Datapoint 19 are now passsing through
  testSpinningTime(flywheel, 1.81827)
  testAngularPosition(flywheel, 19.896753472735355)
  testAngularVelocity(flywheel, 13.235332552749888)
  testAngularAcceleration(flywheel, 3.9999999999999445)
})

// Test behaviour for perfect stroke
test('Correct Flywheel behaviour for a noisefree stroke', () => {
  const flywheel = createFlywheel(baseConfig)
  flywheel.maintainStateAndMetrics()
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, false)
  flywheel.pushValue(0.011221636)
  flywheel.pushValue(0.011175504)
  flywheel.pushValue(0.01116456)
  flywheel.pushValue(0.011130263)
  flywheel.pushValue(0.011082613)
  flywheel.pushValue(0.011081761)
  flywheel.pushValue(0.011062297)
  flywheel.pushValue(0.011051853)
  flywheel.pushValue(0.010973313)
  flywheel.pushValue(0.010919756)
  flywheel.pushValue(0.01086431)
  flywheel.pushValue(0.010800864)
  flywheel.pushValue(0.010956987)
  flywheel.pushValue(0.010653396)
  flywheel.pushValue(0.010648619)
  flywheel.pushValue(0.010536818)
  flywheel.pushValue(0.010526151)
  flywheel.pushValue(0.010511225)
  flywheel.pushValue(0.010386684)
  testDeltaTime(flywheel, 0.011062297)
  testSpinningTime(flywheel, 0.077918634)
  testAngularPosition(flywheel, 7.330382858376184)
  testAngularVelocity(flywheel, 94.87010488347391)
  testAngularAcceleration(flywheel, 28.980405331480235)
  testTorque(flywheel, 3.9779168377417595)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, true)
  flywheel.pushValue(0.010769)
  flywheel.pushValue(0.010707554)
  flywheel.pushValue(0.010722165)
  flywheel.pushValue(0.01089567)
  flywheel.pushValue(0.010917504)
  flywheel.pushValue(0.010997969)
  flywheel.pushValue(0.011004655)
  flywheel.pushValue(0.011013618)
  flywheel.pushValue(0.011058193)
  flywheel.pushValue(0.010807149)
  flywheel.pushValue(0.0110626)
  flywheel.pushValue(0.011090787)
  flywheel.pushValue(0.011099509)
  flywheel.pushValue(0.011131862)
  flywheel.pushValue(0.011209919)
  testDeltaTime(flywheel, 0.010722165)
  testSpinningTime(flywheel, 0.23894732900000007)
  testAngularPosition(flywheel, 23.03834612632515)
  testAngularVelocity(flywheel, 97.12541571421204)
  testAngularAcceleration(flywheel, -29.657604177526746)
  testTorque(flywheel, -2.0200308891605716)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
  flywheel.pushValue(0.020769)
  flywheel.pushValue(0.020707554)
  flywheel.pushValue(0.020722165)
  flywheel.pushValue(0.02089567)
  flywheel.pushValue(0.020917504)
  flywheel.pushValue(0.020997969)
  flywheel.pushValue(0.021004655)
  flywheel.pushValue(0.021013618)
  flywheel.pushValue(0.021058193)
  flywheel.pushValue(0.020807149)
  flywheel.pushValue(0.0210626)
  flywheel.pushValue(0.021090787)
  flywheel.pushValue(0.021099509)
  flywheel.pushValue(0.021131862)
  flywheel.pushValue(0.021209919)
  testDeltaTime(flywheel, 0.020722165)
  testSpinningTime(flywheel, 0.43343548300000007)
  testAngularPosition(flywheel, 38.746309394274114)
  testAngularVelocity(flywheel, 50.85265548983507)
  testAngularAcceleration(flywheel, -159.89027501034317)
  testTorque(flywheel, -16.20022817082592)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, true)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
})

// Test behaviour for noisy upgoing flank

// Test behaviour for noisy downgoing flank

// Test behaviour for noisy stroke

// Test drag factor calculation

// Test Dynamic stroke detection

// Test behaviour for not maintaining metrics
test('Correct Flywheel behaviour at maintainStateOnly', () => {
  const flywheel = createFlywheel(baseConfig)
  flywheel.maintainStateAndMetrics()
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, false)
  flywheel.maintainStateOnly()
  flywheel.pushValue(0.011221636)
  flywheel.pushValue(0.011175504)
  flywheel.pushValue(0.01116456)
  flywheel.pushValue(0.011130263)
  flywheel.pushValue(0.011082613)
  flywheel.pushValue(0.011081761)
  flywheel.pushValue(0.011062297)
  flywheel.pushValue(0.011051853)
  flywheel.pushValue(0.010973313)
  flywheel.pushValue(0.010919756)
  flywheel.pushValue(0.01086431)
  flywheel.pushValue(0.010800864)
  flywheel.pushValue(0.010956987)
  flywheel.pushValue(0.010653396)
  flywheel.pushValue(0.010648619)
  flywheel.pushValue(0.010536818)
  flywheel.pushValue(0.010526151)
  flywheel.pushValue(0.010511225)
  flywheel.pushValue(0.010386684)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, false)
  testIsPowered(flywheel, true)
  flywheel.pushValue(0.010769)
  flywheel.pushValue(0.010707554)
  flywheel.pushValue(0.010722165)
  flywheel.pushValue(0.01089567)
  flywheel.pushValue(0.010917504)
  flywheel.pushValue(0.010997969)
  flywheel.pushValue(0.011004655)
  flywheel.pushValue(0.011013618)
  flywheel.pushValue(0.011058193)
  flywheel.pushValue(0.010807149)
  flywheel.pushValue(0.0110626)
  flywheel.pushValue(0.011090787)
  flywheel.pushValue(0.011099509)
  flywheel.pushValue(0.011131862)
  flywheel.pushValue(0.011209919)
  testDeltaTime(flywheel, 0)
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testAngularVelocity(flywheel, 0)
  testAngularAcceleration(flywheel, 0)
  testTorque(flywheel, 0)
  testDragFactor(flywheel, 0.00011)
  testIsDwelling(flywheel, false)
  testIsUnpowered(flywheel, true)
  testIsPowered(flywheel, false)
})

test('Correct Flywheel behaviour with a SportsTech WRX700', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject 16 strokes
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })
  testSpinningTime(flywheel, 46.302522627)
  testAngularPosition(flywheel, 738.2742735936014)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
})

test('Correct Flywheel behaviour with a DKN R-320', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.DKN_R320))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.DKN_R320.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject 10 strokes
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 22.249536391000003)
  testAngularPosition(flywheel, 490.0884539600077)
  // As dragfactor is static, it should remain the same
  testDragFactor(flywheel, (rowerProfiles.DKN_R320.dragFactor / 1000000))
})

test('Correct Flywheel behaviour with a NordicTrack RX800', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.NordicTrack_RX800.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject 10 strokes
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 22.612226401999987)
  testAngularPosition(flywheel, 1441.991027997715)
  // As we don't detect strokes here (this is a function of Rower.js, the dragcalculation shouldn't be triggered
  testDragFactor(flywheel, (rowerProfiles.NordicTrack_RX800.dragFactor / 1000000))
})

test('Correct Flywheel behaviour with a full session on a SportsTech WRX700', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  // Inject 846 strokes
  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })
  testSpinningTime(flywheel, 2340.0100514160117)
  testAngularPosition(flywheel, 37322.120724646746)
  // The dragfactor should remain static
  testDragFactor(flywheel, (rowerProfiles.Sportstech_WRX700.dragFactor / 1000000))
})

test('A full session for a Concept2 Model C should produce plausible results', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Concept2_Model_C.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 181.47141999999985)
  testAngularPosition(flywheel, 15634.659439365203)
  // As we don't detect strokes here (this is a function of Rower.js, the dragcalculation shouldn't be triggered
  testDragFactor(flywheel, (rowerProfiles.Concept2_Model_C.dragFactor / 1000000))
})

test('A full session for a Concept2 RowErg should produce plausible results', async () => {
  const flywheel = createFlywheel(deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg))
  testSpinningTime(flywheel, 0)
  testAngularPosition(flywheel, 0)
  testDragFactor(flywheel, (rowerProfiles.Concept2_RowErg.dragFactor / 1000000))
  flywheel.maintainStateAndMetrics()

  await replayRowingSession(flywheel.pushValue, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testSpinningTime(flywheel, 591.0432650000008)
  testAngularPosition(flywheel, 65960.87935477128)
  // As we don't detect strokes here (this is a function of Rower.js, the dragcalculation shouldn't be triggered
  testDragFactor(flywheel, (rowerProfiles.Concept2_RowErg.dragFactor / 1000000))
})

// Test behaviour after reset

function testDeltaTime (flywheel, expectedValue) {
  assert.ok(flywheel.deltaTime() === expectedValue, `deltaTime should be ${expectedValue} sec at ${flywheel.spinningTime()} sec, is ${flywheel.deltaTime()}`)
}

function testSpinningTime (flywheel, expectedValue) {
  assert.ok(flywheel.spinningTime() === expectedValue, `spinningTime should be ${expectedValue} sec at ${flywheel.spinningTime()} sec, is ${flywheel.spinningTime()}`)
}

function testAngularPosition (flywheel, expectedValue) {
  assert.ok(flywheel.angularPosition() === expectedValue, `angularPosition should be ${expectedValue} Radians at ${flywheel.spinningTime()} sec, is ${flywheel.angularPosition()}`)
}

function testAngularVelocity (flywheel, expectedValue) {
  assert.ok(flywheel.angularVelocity() === expectedValue, `angularVelocity should be ${expectedValue} Radians/sec at ${flywheel.spinningTime()} sec, is ${flywheel.angularVelocity()}`)
}

function testAngularAcceleration (flywheel, expectedValue) {
  assert.ok(flywheel.angularAcceleration() === expectedValue, `angularAcceleration should be ${expectedValue} Radians/sec^2 at ${flywheel.spinningTime()} sec, is ${flywheel.angularAcceleration()}`)
}

function testTorque (flywheel, expectedValue) {
  assert.ok(flywheel.torque() === expectedValue, `Torque should be ${expectedValue} N/M at ${flywheel.spinningTime()} sec, is ${flywheel.torque()}`)
}

function testDragFactor (flywheel, expectedValue) {
  assert.ok(flywheel.dragFactor() === expectedValue, `Drag Factor should be ${expectedValue} N*m*s^2 at ${flywheel.spinningTime()} sec, is ${flywheel.dragFactor()}`)
}

function testIsDwelling (flywheel, expectedValue) {
  assert.ok(flywheel.isDwelling() === expectedValue, `isDwelling should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isDwelling()}`)
}

function testIsUnpowered (flywheel, expectedValue) {
  assert.ok(flywheel.isUnpowered() === expectedValue, `isUnpowered should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isUnpowered()}`)
}

function testIsPowered (flywheel, expectedValue) {
  assert.ok(flywheel.isPowered() === expectedValue, `isPowered should be ${expectedValue} at ${flywheel.spinningTime()} sec, is ${flywheel.isPowered()}`)
}

function reportAll (flywheel) { // eslint-disable-line no-unused-vars
  assert.ok(0, `deltaTime: ${flywheel.deltaTime()}, spinningTime: ${flywheel.spinningTime()}, ang. pos: ${flywheel.angularPosition()}, ang. vel: ${flywheel.angularVelocity()}, Ang. acc: ${flywheel.angularAcceleration()}, Torque: ${flywheel.torque()}, DF: ${flywheel.dragFactor()}`)
}

test.run()
