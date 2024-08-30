'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import zlib from 'zlib'
import fs from 'fs/promises'
import xml2js from 'xml2js'
import { createVO2max } from './VO2max.js'
import { promisify } from 'util'
const gzip = promisify(zlib.gzip)

function createTCXRecorder (config) {
  let filename
  let heartRate = 0
  let strokes = []
  let postExerciseHR = []
  let lastMetrics
  let startTime
  let allDataHasBeenWritten

  // This function handles all incomming commands. Here, the recordingmanager will have filtered
  // all unneccessary commands for us, so we only need to react to 'reset' and 'shutdown'
  async function handleCommand (commandName) {
    switch (commandName) {
      case ('reset'):
        if (lastMetrics.length > 0 && lastMetrics.totalMovingTime > strokes[strokes.length - 1].totalMovingTime) {
          addMetricsToStrokesArray(lastMetrics)
        }
        await createTcxFile()
        heartRate = 0
        strokes = null
        strokes = []
        postExerciseHR = null
        postExerciseHR = []
        startTime = undefined
        break
      case 'shutdown':
        if (lastMetrics.length > 0 && lastMetrics.totalMovingTime > strokes[strokes.length - 1].totalMovingTime) {
          addMetricsToStrokesArray(lastMetrics)
        }
        await createTcxFile()
        break
      default:
        log.error(`tcxRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function setBaseFileName (baseFileName) {
    filename = `${baseFileName}_rowing.tcx`
    log.info(`Garmin tcx-file will be saved as ${filename} (after the session)`)
  }

  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStart):
        if (startTime === undefined) {
          startTime = new Date()
        }
        addMetricsToStrokesArray(metrics)
        break
      case (metrics.metricsContext.isSessionStop):
        addMetricsToStrokesArray(metrics)
        postExerciseHR = null
        postExerciseHR = []
        createTcxFile()
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isPauseStart):
        addMetricsToStrokesArray(metrics)
        postExerciseHR = null
        postExerciseHR = []
        createTcxFile()
        measureRecoveryHR()
        break
      case (metrics.metricsContext.isDriveStart):
        addMetricsToStrokesArray(metrics)
        break
    }
    lastMetrics = metrics
  }

  function addMetricsToStrokesArray (metrics) {
    addHeartRateToMetrics(metrics)
    strokes.push(metrics)
    allDataHasBeenWritten = false
  }

  function addHeartRateToMetrics (metrics) {
    if (heartRate !== undefined) {
      metrics.heartrate = heartRate
    } else {
      metrics.heartrate = undefined
    }
  }

  // initiated when a new heart rate value is received from heart rate sensor
  async function recordHeartRate (value) {
    heartRate = value.heartrate
  }

  async function createTcxFile () {
    // Do not write again if not needed
    if (allDataHasBeenWritten) return

    // we need at least two strokes and ten seconds to generate a valid tcx file
    if (strokes.length < 2 || !minimumRecordingTimeHasPassed()) {
      log.info('tcx file has not been written, as there were not enough strokes recorded (minimum 10 seconds and two strokes)')
      return
    }

    const tcxRecord = await activeWorkoutToTcx()
    if (tcxRecord === undefined) {
      log.error('error creating tcx file')
      return
    }
    await createFile(tcxRecord.tcx, `${filename}`, config.gzipTcxFiles)
    allDataHasBeenWritten = true
    log.info(`Garmin tcx data has been written as ${filename}`)
  }

  async function activeWorkoutToTcx () {
    // Be aware! This function is also exposed to the Strava recorder!
    const tcx = await workoutToTcx({
      id: startTime.toISOString(),
      startTime,
      strokes
    })

    return {
      tcx,
      filename
    }
  }

  async function workoutToTcx (workout) {
    let versionArray = process.env.npm_package_version.split('.')
    if (versionArray.length < 3) versionArray = ['0', '0', '0']
    const lastStroke = workout.strokes[strokes.length - 1]
    const drag = workout.strokes.reduce((sum, s) => sum + s.dragFactor, 0) / strokes.length

    // VO2Max calculation for the remarks section
    let VO2maxoutput = 'UNDEFINED'
    const VO2max = createVO2max(config)
    const VO2maxResult = VO2max.calculateVO2max(strokes)
    if (VO2maxResult > 10 && VO2maxResult < 60) {
      VO2maxoutput = `${VO2maxResult.toFixed(1)} mL/(kg*min)`
    }

    // Addition of HRR data
    let hrrAdittion = ''
    if (postExerciseHR.length > 1 && (postExerciseHR[0] > (0.7 * config.userSettings.maxHR))) {
      // Recovery Heartrate is only defined when the last excercise HR is above 70% of the maximum Heartrate
      if (postExerciseHR.length === 2) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM)`
      }
      if (postExerciseHR.length === 3) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM), HRR2: ${postExerciseHR[2] - postExerciseHR[0]} (${postExerciseHR[2]} BPM)`
      }
      if (postExerciseHR.length >= 4) {
        hrrAdittion = `, HRR1: ${postExerciseHR[1] - postExerciseHR[0]} (${postExerciseHR[1]} BPM), HRR2: ${postExerciseHR[2] - postExerciseHR[0]} (${postExerciseHR[2]} BPM), HRR3: ${postExerciseHR[3] - postExerciseHR[0]} (${postExerciseHR[3]} BPM)`
      }
    }

    const tcxObject = {
      TrainingCenterDatabase: {
        $: { xmlns: 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2', 'xmlns:ns2': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2' },
        Activities: {
          Activity: {
            $: { Sport: 'Other' },
            Id: workout.id,
            Lap: [
              {
                $: { StartTime: workout.startTime.toISOString() },
                TotalTimeSeconds: lastStroke.totalMovingTime.toFixed(1),
                DistanceMeters: lastStroke.totalLinearDistance.toFixed(1),
                MaximumSpeed: (workout.strokes.map((stroke) => stroke.cycleLinearVelocity).reduce((acc, cycleLinearVelocity) => Math.max(acc, cycleLinearVelocity))).toFixed(2),
                Calories: Math.round(lastStroke.totalCalories),
                /* ToDo Fix issue with IF-statement not being accepted here?
                if (lastStroke.heartrate !== undefined) {
                  AverageHeartRateBpm: VO2max.averageObservedHR(),
                  MaximumHeartRateBpm: VO2max.maxObservedHR,
                  //AverageHeartRateBpm: { Value: (workout.strokes.reduce((sum, s) => sum + s.heartrate, 0) / workout.strokes.length).toFixed(2) },
                  //MaximumHeartRateBpm: { Value: Math.round(workout.strokes.map((stroke) => stroke.power).reduce((acc, heartrate) => Math.max(acc, heartrate))) },
                }
                */
                Intensity: 'Active',
                Cadence: Math.round(workout.strokes.reduce((sum, s) => sum + s.cycleStrokeRate, 0) / (workout.strokes.length - 1)),
                TriggerMethod: 'Manual',
                Track: {
                  Trackpoint: (() => {
                    return workout.strokes.map((stroke) => {
                      const trackPointTime = new Date(workout.startTime.getTime() + stroke.totalMovingTime * 1000)
                      const trackpoint = {
                        Time: trackPointTime.toISOString(),
                        DistanceMeters: stroke.totalLinearDistance.toFixed(2),
                        Cadence: Math.round(stroke.cycleStrokeRate),
                        Extensions: {
                          'ns2:TPX': {
                            'ns2:Speed': stroke.cycleLinearVelocity.toFixed(2),
                            'ns2:Watts': Math.round(stroke.cyclePower)
                          }
                        }
                      }
                      if (stroke.heartrate !== undefined) {
                        trackpoint.HeartRateBpm = { Value: stroke.heartrate }
                      }
                      return trackpoint
                    })
                  })()
                },
                Extensions: {
                  'ns2:LX': {
                    'ns2:Steps': lastStroke.totalNumberOfStrokes.toFixed(0),
                    // please note, the -1 is needed as we have a stroke 0, with a speed and power of 0. The - 1 corrects this.
                    'ns2:AvgSpeed': (workout.strokes.reduce((sum, s) => sum + s.cycleLinearVelocity, 0) / (workout.strokes.length - 1)).toFixed(2),
                    'ns2:AvgWatts': (workout.strokes.reduce((sum, s) => sum + s.cyclePower, 0) / (workout.strokes.length - 1)).toFixed(0),
                    'ns2:MaxWatts': Math.round(workout.strokes.map((stroke) => stroke.cyclePower).reduce((acc, cyclePower) => Math.max(acc, cyclePower)))
                  }
                }
              }
            ],
            Notes: `Indoor Rowing, Drag factor: ${drag.toFixed(1)} 10-6 N*m*s2, Estimated VO2Max: ${VO2maxoutput}${hrrAdittion}`
          }
        },
        Author: {
          $: { 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance', 'xsi:type': 'Application_t' },
          Name: 'Open Rowing Monitor',
          Build: {
            Version: {
              VersionMajor: versionArray[0],
              VersionMinor: versionArray[1],
              BuildMajor: versionArray[2],
              BuildMinor: 0
            },
            LangID: 'en',
            PartNumber: 'OPE-NROWI-NG'
          }
        }
      }
    }

    const builder = new xml2js.Builder()
    return builder.buildObject(tcxObject)
  }

  async function createFile (content, filename, compress = false) {
    if (compress) {
      const gzipContent = await gzip(content)
      try {
        await fs.writeFile(filename, gzipContent)
      } catch (err) {
        log.error(err)
      }
    } else {
      try {
        await fs.writeFile(filename, content)
      } catch (err) {
        log.error(err)
      }
    }
  }

  function measureRecoveryHR () {
    // This function is called when the rowing session is stopped. postExerciseHR[0] is the last measured excercise HR
    // Thus postExerciseHR[1] is Recovery HR after 1 min, etc..
    if (heartRate !== undefined && config.userSettings.restingHR <= heartRate && heartRate <= config.userSettings.maxHR) {
      log.debug(`*** HRR-${postExerciseHR.length}: ${heartRate}`)
      postExerciseHR.push(heartRate)
      if ((postExerciseHR.length > 1) && (postExerciseHR.length <= 4)) {
        // We skip reporting postExerciseHR[0] and only report measuring postExerciseHR[1], postExerciseHR[2], postExerciseHR[3]
        allDataHasBeenWritten = false
        createTcxFile()
      }
      if (postExerciseHR.length < 4) {
        // We haven't got three post-exercise HR measurements yet, let's schedule the next measurement
        setTimeout(measureRecoveryHR, 60000)
      } else {
        log.debug('*** Skipped HRR measurement')
      }
    }
  }

  function minimumRecordingTimeHasPassed () {
    const minimumRecordingTimeInSeconds = 10
    if (strokes.length > 0) {
      const strokeTimeTotal = strokes[strokes.length - 1].totalMovingTime
      return (strokeTimeTotal > minimumRecordingTimeInSeconds)
    } else {
      return (false)
    }
  }

  return {
    handleCommand,
    setBaseFileName,
    recordRowingMetrics,
    recordHeartRate,
    activeWorkoutToTcx
  }
}

export { createTCXRecorder }
