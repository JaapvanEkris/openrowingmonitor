'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This test is a test of the SessionManager, that tests wether this object fills all fields correctly,
 * and cuts off a session, interval and split decently
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import rowerProfiles from '../../config/rowerProfiles.js'
import { replayRowingSession } from '../recorders/RowingReplayer.js'
import { deepMerge } from '../tools/Helper.js'

import { createSessionManager } from './SessionManager.js'

/**
 * @todo Add inspections to all tests to inspect whether the 'workout' object contains all correct values as well
 */

/**
 * @todo Add inspections to all tests to inspect whether the 'interval' object contains all correct values
 */

/**
 * @todo Add splits and tests to inspect whether the 'split' object contains all correct values as well
 */

/**
 * @description Test behaviour for the Sportstech WRX700 in a 'Just Row' session
 */
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
  testTotalCalories(sessionManager, 13.142874997261865)
  testTotalNumberOfStrokes(sessionManager, 15)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the Sportstech WRX700 in a single interval session with a Distance target
 */
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
  testTotalCalories(sessionManager, 12.047320967455441)
  testTotalNumberOfStrokes(sessionManager, 14)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the Sportstech WRX700 in a single interval session with a Time target
 */
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
  testTotalCalories(sessionManager, 13.040795875095199)
  testTotalNumberOfStrokes(sessionManager, 15)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a single interval session with a Calorie target
 */
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
  testTotalCalories(sessionManager, 13.007213382511864)
  testTotalNumberOfStrokes(sessionManager, 15)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the DKN R-320 in a 'Just Row' session
 */
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
  testTotalCalories(sessionManager, 6.7615440068583315)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.DKN_R320.dragFactor)
})

/**
 * @description Test behaviour for the NordicTrack RX800 in a 'Just Row' session
 */
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
  testTotalCalories(sessionManager, 4.8487817727235765)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 493.8082148322739)
})

/**
 * @description Test behaviour for the NordicTrack RX800 in a single interval session with a Time target
 */
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
  testTotalCalories(sessionManager, 4.369289275497461)
  testTotalNumberOfStrokes(sessionManager, 8)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 489.6362497474688)
})

/**
 * @description Test behaviour for the NordicTrack RX800 in a single interval session with a Calorie target
 */
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
  testTotalCalories(sessionManager, 4.8487817727235765)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 493.8082148322739)
})

/**
 * @description Test behaviour for the NordicTrack RX800 in a single interval session with a Distance target
 */
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
  testTotalCalories(sessionManager, 4.701450875048449)
  testTotalNumberOfStrokes(sessionManager, 9)
  // As dragFactor is dynamic, it should have changed
  testDragFactor(sessionManager, 493.8082148322739)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a 'Just Row' session
 */
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
  testTotalCalories(sessionManager, 659.4761649276804)
  testTotalNumberOfStrokes(sessionManager, 845)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a single interval session with a Distance target
 */
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
  testTotalCalories(sessionManager, 625.5636651176962)
  testTotalNumberOfStrokes(sessionManager, 804)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a single interval session with a Time target
 */
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
  testTotalCalories(sessionManager, 646.8205257461132)
  testTotalNumberOfStrokes(sessionManager, 830)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the SportsTech WRX700 in a single interval session with a Time target, which will not be reached (test of stopping behaviour)
 */
test('A 2400 sec session with premature stop for SportsTech WRX700 should produce plausible results', async () => {
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
  testTotalCalories(sessionManager, 659.4761649276804)
  testTotalNumberOfStrokes(sessionManager, 845)
  // As dragFactor is static, it should remain in place
  testDragFactor(sessionManager, rowerProfiles.Sportstech_WRX700.dragFactor)
})

/**
 * @description Test behaviour for the C2 Model C in a 'Just Row' session
 */
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
  testTotalCalories(sessionManager, 33.96141888570208)
  testTotalNumberOfStrokes(sessionManager, 82)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.64632740545646)
})

/**
 * @description Test behaviour for the C2 Model C in a single interval session with a Distance target
 */
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
  testTotalCalories(sessionManager, 30.87012556034265)
  testTotalNumberOfStrokes(sessionManager, 73)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.18123281481081)
})

/**
 * @description Test behaviour for the C2 Model C in a single interval session with a Time target
 */
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
  testTotalCalories(sessionManager, 33.91002253445811)
  testTotalNumberOfStrokes(sessionManager, 82)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.64632740545646)
})

/**
 * @description Test behaviour for the C2 Model C in a single interval session with a Calorie target
 */
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
  testTotalCalories(sessionManager, 30.018254924945477)
  testTotalNumberOfStrokes(sessionManager, 72)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 123.18123281481081)
})

/**
 * @description Test behaviour for the C2 RowErg in a 'Just Row' session
 */
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

  testTotalMovingTime(sessionManager, 590.0231672202852)
  testTotalLinearDistance(sessionManager, 2027.8388877679706)
  testTotalCalories(sessionManager, 113.70861696976218)
  testTotalNumberOfStrokes(sessionManager, 205)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.70871681343775)
})

/**
 * @description Test behaviour for the C2 RowErg in a single interval session with a Distance target
 */
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

  testTotalMovingTime(sessionManager, 582.0171075172801)
  testTotalLinearDistance(sessionManager, 2000.029064226818)
  testTotalCalories(sessionManager, 112.3246085748377)
  testTotalNumberOfStrokes(sessionManager, 203)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.67710663511464)
})

/**
 * @description Test behaviour for the C2 RowErg in a single interval session with a Time target
 */
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

  testTotalMovingTime(sessionManager, 580.0043837232224)
  testTotalLinearDistance(sessionManager, 1993.2553343495642)
  testTotalCalories(sessionManager, 111.91364395595929)
  testTotalNumberOfStrokes(sessionManager, 202)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.69990852674464)
})

/**
 * @description Test behaviour for the C2 RowErg in a single interval session with a Calorie target
 */
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

  testTotalMovingTime(sessionManager, 518.7774144765336)
  testTotalLinearDistance(sessionManager, 1780.5168110240045)
  testTotalCalories(sessionManager, 100.00062210488666)
  testTotalNumberOfStrokes(sessionManager, 181)
  // As dragFactor isn't static, it should have changed
  testDragFactor(sessionManager, 80.66540957116986)
})

/**
 * @todo Add tests for multiple planned intervals of the same type
 */

/**
 * @todo Add tests for multiple planned intervals of a different type, including pauses
 */

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
