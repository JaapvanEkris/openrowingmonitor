'use strict'
/*
  This grabs a raw recording and replay it, with different parameters
  Please note: the Oracle data is used to calculate stuff, allowing easy processing in Excel
*/
import os from 'os'
import log from 'loglevel'
import * as fs from 'fs'
import config from './tools/ConfigManager.js'
import { replayRowingSession } from './tools/RowingRecorder.js'
import { createRowingStatistics } from './engine/RowingStatistics.js'

const appVersion = '0_9_0_Mod6b'
const maxTimeBetweenImpulses = [0.020, 0.018, 0.016, 0.015, 0.014, 0.013]
const minumumForcesBeforeStroke = [10, 9]
const minimumStrokeQualities = [0.40, 0.385, 0.38, 0.375, 0.37, 0.365, 0.36, 0.35, 0.34]
const dragfactors = [225, 200, 175, 150, 125, 100]
const minimumDragQualities = [0.95]
const dragFactorSmoothings = [1, 2, 3, 4, 5]
const inertias = [0.101465, 0.101460, 0.101455, 0.10150]

const testCases = []

testCases.push({
  machineName: 'C2 RowErg',
  caseIdentifier: '29-02-2024',
  testConfig: config,
  testInputLocation: 'recordings/2024/02/C2_RowErg_2024-02-29_1801_Rowing_10K_Drag_155.csv',
  distanceTarget: true,
  oracleTimeResult: 2874.4,
  oracleDistanceResult: 10000,
  oracleReportedNoStrokes: 949,
  oracleReportedDragfactor: 155
  })

async function main () {
  // Set the priority for the app
  if (config.appPriority) {
    // setting the (near-real-time?) priority for the process
    const mainPriority = Math.min((config.appPriority), 0)
    console.log(`Setting priority for the main server thread to ${mainPriority}`)
    try {
      // setting priority of current process
      os.setPriority(mainPriority)
    } catch (err) {
      console.log('need root permission to set priority of thread')
    }
  }

  fs.appendFileSync('/home/pi/results.txt', `experimentNo, app-version, maximumTimeBetweenImpulses, initial DF, minimumDragQuality, flywheelInertia, dragFactorSmoothing, minimumStrokeQuality, minumumForceBeforeStroke, caseIdentifier, fileName, DistanceSession?, oracle Time, oracle Distance, oracle noStrokes, oracle dragfactor, ORM-Time, ORM-Distance, ORM-noStrokes, ORM-dragfactor, Projected ORM Time, Projected ORM Distance, Deviation\n`)

  // Turn off all error reporting
  config.loglevel.default = 'silent'
  log.setLevel(config.loglevel.default)
  config.loglevel.RowingEngine = 'silent'
  log.getLogger('RowingEngine').setLevel(config.loglevel.RowingEngine)

  // Set some crucial parameters for extrapolation. As the extrapolation depends on the projected end-time, we need to set numOfPhasesForAveragingScreenData to make it more reliable
  config.rowerSettings.numOfPhasesForAveragingScreenData = 10

  // Loop through all possible combinations of settings, and when a combination is set, loop through all testsets
  let experimentNo = 15
  let p = 0
  while (p < minimumDragQualities.length) {
    config.rowerSettings.minimumDragQuality = minimumDragQualities[p]
    let o = 0
    while (o < dragFactorSmoothings.length) {
      config.rowerSettings.dragFactorSmoothing = dragFactorSmoothings[o]
      let n = 0
      while (n < minimumStrokeQualities.length) {
        config.rowerSettings.minimumStrokeQuality = minimumStrokeQualities[n]
        let m = 0
        while (m < minumumForcesBeforeStroke.length) {
          config.rowerSettings.minumumForceBeforeStroke = minumumForcesBeforeStroke[m]
          let l = 0
          while (l < inertias.length) {
            config.rowerSettings.flywheelInertia = inertias[l]
            let k = 0
            while (k < dragfactors.length) {
              config.rowerSettings.dragFactor = dragfactors[k]
              let j = 0
              while (j < maxTimeBetweenImpulses.length) {
                config.rowerSettings.maximumTimeBetweenImpulses = maxTimeBetweenImpulses[j]
                let i = 0
                while (i < testCases.length) {
                  console.log(`Test case: Inertia: ${inertias[l]}, DF ${dragfactors[k]}, maxTimeBetweenImpulses: ${maxTimeBetweenImpulses[j]}, identifier: ${testCases[i].caseIdentifier}`)
                  await testRecording(experimentNo, testCases[i].machineName, testCases[i].caseIdentifier, config, testCases[i].testInputLocation, testCases[i].distanceTarget, testCases[i].oracleTimeResult, testCases[i].oracleDistanceResult, testCases[i].oracleReportedNoStrokes, testCases[i].oracleReportedDragfactor)
                  i = i + 1
                  }
                experimentNo = experimentNo + 1
                j = j + 1
                }
              k = k + 1
              }
            l = l + 1
            }
          m = m + 1
          }
        n = n + 1
        }
      o = o + 1
      }
    p = p + 1
    }
  console.log('Tests completed')
  }

async function testRecording (experimentNo, machineName, caseIdentifier, rowerConfig, fileName, distancetarget, oracleTimeResult, oracleDistanceResult, oracleReportedNoStrokes, oracleReportedDragfactor) {
  let rowingSession = createRowingStatistics(rowerConfig)

  const intervalSettings = []
  if (distancetarget) {
    intervalSettings[0] = {
      targetDistance: oracleDistanceResult,
      targetTime: 0
    }
  } else {
    intervalSettings[0] = {
      targetDistance: 0,
      targetTime: oracleTimeResult
    }
  }
  rowingSession.setIntervalParameters(intervalSettings)

  await replayRowingSession(rowingSession.handleRotationImpulse, { filename: fileName, realtime: false, loop: false })

  // Log the results
  reportAll(experimentNo, rowingSession, caseIdentifier, fileName, distancetarget, oracleTimeResult, oracleDistanceResult, oracleReportedNoStrokes, oracleReportedDragfactor)

  rowingSession.reset()
  rowingSession = null
}

function reportAll (experimentNo, rowingSession, caseIdentifier, fileName, distancetarget, oracleTimeResult, oracleDistanceResult, oracleReportedNoStrokes, oracleReportedDragfactor) {
  let projectedORMTime
  let projectedORMDistance
  let ORMDeviation

  if (distancetarget) {
    // The target distance is leading
    if (oracleDistanceResult < rowingSession.getMetrics().totalLinearDistance) {
      // ORM interpolated to the targetdistance, but that shouldn't make the time longer
      projectedORMTime = Math.round(Math.min(rowingSession.getMetrics().cycleProjectedEndTime, rowingSession.getMetrics().totalMovingTime) * 10) / 10
    } else {
      // ORM extrapolated the result
      projectedORMTime = Math.round(rowingSession.getMetrics().cycleProjectedEndTime * 10) / 10
    }
    projectedORMDistance = oracleDistanceResult
    ORMDeviation = (projectedORMTime - oracleTimeResult) / oracleTimeResult
  } else {
    projectedORMTime = oracleTimeResult
    if (oracleTimeResult < rowingSession.getMetrics().totalMovingTime) {
      // ORM interpolated the result
      projectedORMDistance = Math.round(rowingSession.getMetrics().cycleProjectedEndLinearDistance)
    } else {
      // ORM extrapolated the result
      projectedORMDistance = Math.round(Math.max(rowingSession.getMetrics().cycleProjectedEndLinearDistance, rowingSession.getMetrics().totalLinearDistance))
    }
    ORMDeviation = (oracleDistanceResult - projectedORMDistance) / oracleDistanceResult
  }

  fs.appendFileSync('/home/pi/results.txt', `${experimentNo}, ${appVersion}, ${config.rowerSettings.maximumTimeBetweenImpulses}, ${config.rowerSettings.dragFactor}, ${config.rowerSettings.minimumDragQuality}, ${config.rowerSettings.flywheelInertia}, ${config.rowerSettings.dragFactorSmoothing}, ${config.rowerSettings.minimumStrokeQuality}, ${config.rowerSettings.minumumForceBeforeStroke}, ${caseIdentifier}, ${fileName}, ${distancetarget}, ${oracleTimeResult}, ${oracleDistanceResult}, ${oracleReportedNoStrokes}, ${oracleReportedDragfactor}, ${rowingSession.getMetrics().totalMovingTime.toFixed(1)}, ${rowingSession.getMetrics().totalLinearDistance.toFixed(1)}, ${rowingSession.getMetrics().totalNumberOfStrokes + 1}, ${rowingSession.getMetrics().dragFactor.toFixed(1)}, ${projectedORMTime.toFixed(1)}, ${projectedORMDistance.toFixed(1)}, ${ORMDeviation.toFixed(8)}\n`);
}

main()
