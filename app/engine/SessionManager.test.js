'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This test is a test of the SessionManager, that tests wether this object fills all fields correctly,
 * and cuts off a session, interval and split decently
 */
// @ToDo: test the effects of smoothing parameters
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
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 46.302522627)
  testTotalLinearDistance(sessionManager, 165.58832475070278)
  testTotalCalories(sessionManager, 13.14287499723497)
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
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 150,
    targetTime: 0
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 41.876875768000005)
  testTotalLinearDistance(sessionManager, 150.02019165448286)
  testTotalCalories(sessionManager, 12.047320967434432)
  testTotalNumberOfStrokes(sessionManager, 14)
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
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 45
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 45.077573161000004)
  testTotalLinearDistance(sessionManager, 162.75775509684462)
  testTotalCalories(sessionManager, 13.040795875068302)
  testTotalNumberOfStrokes(sessionManager, 15)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('sample data for Sportstech WRX700 should produce plausible results for a 13 calories session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'calories',
    targetCalories: 13
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 44.674583250000005)
  testTotalLinearDistance(sessionManager, 161.3424702699155)
  testTotalCalories(sessionManager, 13.00721338248497)
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
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 21.701535821)
  testTotalLinearDistance(sessionManager, 69.20242183779045)
  testTotalCalories(sessionManager, 6.761544006859074)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
})

test('sample data for NordicTrack RX800 should produce plausible results without intervalsettings', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 22.368358745999995)
  testTotalLinearDistance(sessionManager, 80.8365747440095)
  testTotalCalories(sessionManager, 4.848781772500018)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 493.8082148322739)
})

test('sample data for NordicTrack RX800 should produce plausible results for a 20 seconds session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 20
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 20.02496380499998)
  testTotalLinearDistance(sessionManager, 72.36563503912126)
  testTotalCalories(sessionManager, 4.369289275331837)
  testTotalNumberOfStrokes(sessionManager, 8)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 489.6362497474688)
})

test('sample data for NordicTrack RX800 should produce plausible results for a 20 calories session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'calories',
    targetCalories: 20
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 22.368358745999995)
  testTotalLinearDistance(sessionManager, 80.8365747440095)
  testTotalCalories(sessionManager, 4.848781772500018)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 493.8082148322739)
})

test('sample data for NordicTrack RX800 should produce plausible results for a 75 meter session', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.NordicTrack_RX800)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 75,
    targetTime: 0
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 20.78640177499998)
  testTotalLinearDistance(sessionManager, 75.02272363260582)
  testTotalCalories(sessionManager, 4.7014508748360155)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 493.8082148322739)
})

test('A full unlimited session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 2340.0100514160117)
  testTotalLinearDistance(sessionManager, 8406.084229545408)
  testTotalCalories(sessionManager, 659.4761650968578)
  testTotalNumberOfStrokes(sessionManager, 845)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('A 8000 meter session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 8000,
    targetTime: 0
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 2236.631120457007)
  testTotalLinearDistance(sessionManager, 8000.605126630226)
  testTotalCalories(sessionManager, 625.5636651284267)
  testTotalNumberOfStrokes(sessionManager, 804)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('A 2300 sec session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 2300
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 2300.00695516701)
  testTotalLinearDistance(sessionManager, 8251.818183410143)
  testTotalCalories(sessionManager, 646.8205259437337)
  testTotalNumberOfStrokes(sessionManager, 830)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

test('A 2400 sec session for SportsTech WRX700 should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Sportstech_WRX700)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 2400
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 2340.0100514160117)
  testTotalLinearDistance(sessionManager, 8406.084229545408)
  testTotalCalories(sessionManager, 659.4761650968578)
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
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 181.47141999999985)
  testTotalLinearDistance(sessionManager, 552.2056895088467)
  testTotalCalories(sessionManager, 33.961418860794744)
  testTotalNumberOfStrokes(sessionManager, 82)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.64632740545652)
})

test('A 500 meter session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 500,
    targetTime: 0
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 156.83075199999985)
  testTotalLinearDistance(sessionManager, 500.0178754492436)
  testTotalCalories(sessionManager, 30.87012555729047)
  testTotalNumberOfStrokes(sessionManager, 73)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.18123281481081)
})

test('A 3 minute session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 180
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 180.96533299999987)
  testTotalLinearDistance(sessionManager, 551.9836036368948)
  testTotalCalories(sessionManager, 33.91002250954926)
  testTotalNumberOfStrokes(sessionManager, 82)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.64632740545652)
})

test('A 30 calorie session for a Concept2 Model C should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_Model_C)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'calories',
    targetCalories: 30
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 153.93554999999992)
  testTotalLinearDistance(sessionManager, 490.5541073829962)
  testTotalCalories(sessionManager, 30.018254906974597)
  testTotalNumberOfStrokes(sessionManager, 72)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.18123281481081)
})

test('A full session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)
  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 590.0294331572366)
  testTotalLinearDistance(sessionManager, 2027.8951016561075)
  testTotalCalories(sessionManager, 113.55660950119214)
  testTotalNumberOfStrokes(sessionManager, 205)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.68166392487412)
})

test('A 2000 meter session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'distance',
    targetDistance: 2000,
    targetTime: 0
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 582.0058299961318)
  testTotalLinearDistance(sessionManager, 2000.0206027129661)
  testTotalCalories(sessionManager, 112.16536746119625)
  testTotalNumberOfStrokes(sessionManager, 203)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.64401882558202)
})

test('A 580 seconds session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'time',
    targetDistance: 0,
    targetTime: 580
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 580.0016078988951)
  testTotalLinearDistance(sessionManager, 1993.2788181883743)
  testTotalCalories(sessionManager, 111.76461106588519)
  testTotalNumberOfStrokes(sessionManager, 202)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.67823666359594)
})

test('A 100 calories session for a Concept2 RowErg should produce plausible results', async () => {
  const rowerProfile = deepMerge(rowerProfiles.DEFAULT, rowerProfiles.Concept2_RowErg)
  const testConfig = {
    loglevel: {
      default: 'silent',
      RowingEngine: 'silent'
    },
    numOfPhasesForAveragingScreenData: 2,
    userSettings: {
      sex: 'male'
    },
    rowerSettings: rowerProfile
  }
  const sessionManager = createSessionManager(testConfig)

  const intervalSettings = []
  intervalSettings[0] = {
    type: 'calories',
    targetCalories: 100
  }
  sessionManager.handleCommand('updateIntervalSettings', intervalSettings)

  testTotalMovingTime(sessionManager, 0)
  testTotalLinearDistance(sessionManager, 0)
  testTotalCalories(sessionManager, 0)
  testTotalNumberOfStrokes(sessionManager, 0)
  testDragFactor(sessionManager, undefined)

  await replayRowingSession(sessionManager.handleRotationImpulse, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

  testTotalMovingTime(sessionManager, 520.3824691827283)
  testTotalLinearDistance(sessionManager, 1786.2212497568994)
  testTotalCalories(sessionManager, 100.00025111255141)
  testTotalNumberOfStrokes(sessionManager, 181)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.66801954484566)
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

function testTotalCalories (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().totalCalories === expectedValue, `totalCalories should be ${expectedValue} kCal at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().totalCalories}`)
}

function testDragFactor (sessionManager, expectedValue) {
  assert.ok(sessionManager.getMetrics().dragFactor === expectedValue, `dragFactor should be ${expectedValue} N*m*s^2 at ${sessionManager.getMetrics().totalMovingTime} sec, is ${sessionManager.getMetrics().dragFactor}`)
}

function reportAll (sessionManager) { // eslint-disable-line no-unused-vars
  assert.ok(0, `time: ${sessionManager.getMetrics().totalMovingTime}, state ${sessionManager.getMetrics().strokeState}, No Strokes: ${sessionManager.getMetrics().totalNumberOfStrokes}, Lin Distance: ${sessionManager.getMetrics().totalLinearDistance}, cycle dur: ${sessionManager.getMetrics().cycleDuration}, cycle Lin Dist: ${sessionManager.getMetrics().cycleLinearDistance}, Lin Velocity: ${sessionManager.getMetrics().cycleLinearVelocity}, Power: ${sessionManager.getMetrics().cyclePower}, Drive Dur: ${sessionManager.getMetrics().driveDuration}, Drive Lin. Dist. ${sessionManager.driveDistance}, Drive Length: ${sessionManager.getMetrics().driveLength}, Av. Handle Force: ${sessionManager.getMetrics().driveAverageHandleForce}, Peak Handle Force: ${sessionManager.getMetrics().drivePeakHandleForce}, Rec. Dur: ${sessionManager.getMetrics().recoveryDuration}, Dragfactor: ${sessionManager.getMetrics().dragFactor}, Inst Handle Power: ${sessionManager.getMetrics().instantHandlePower}`)
}

test.run()
