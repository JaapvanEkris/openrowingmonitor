'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module captures the raw pulses of a rowing session and persists them.
*/
import log from 'loglevel'

export function createRawRecorder () {
  const type = 'csv'
  const postfix = '_raw'
  const presentationName = 'Raw data'
  let rotationImpulses = []
  let allDataHasBeenWritten

  // This function handles all incomming commands. Here, the recordingmanager will have filtered
  // all unneccessary commands for us, so we only need to react to 'updateIntervalSettings', 'reset' and 'shutdown'
  // eslint-disable-next-line no-unused-vars
  async function handleCommand (commandName, data) {
    switch (commandName) {
      case ('updateIntervalSettings'):
        break
      case ('reset'):
      case ('shutdown'):
        break
      default:
        log.error(`rawRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  async function recordRotationImpulse (impulse) {
    // Please observe: this MUST be doe in memory first, before persisting. Persisting to disk without the
    // intermediate step of persisting to memory can lead to buffering issues that will mix up impulses in the recording !!!!
    await rotationImpulses.push(impulse)
    allDataHasBeenWritten = false
  }

  function recordRowingMetrics (metrics) {
    switch (true) {
      case (metrics.metricsContext.isSessionStop):
        break
      case (metrics.metricsContext.isPauseStart):
        break
    }
  }

  async function fileContent () {
    const rawData = rotationImpulses.join('\n')
    if (rawData === undefined) {
      log.error('error creating raw file content')
      return undefined
    } else {
      return rawData
    }
  }

  function minimumDataAvailable () {
    const minimumRecordingTimeInSeconds = 10
    // We need to make sure that we use the Math.abs(), as a gpio rollover can cause impulse to be negative!
    const rotationImpulseTimeTotal = rotationImpulses.reduce((acc, impulse) => acc + Math.abs(impulse), 0)
    return (rotationImpulseTimeTotal > minimumRecordingTimeInSeconds)
  }

  function totalRecordedDistance () {
    return 0
  }

  function totalRecordedMovingTime () {
    const rotationImpulseTimeTotal = rotationImpulses.reduce((acc, impulse) => acc + Math.abs(impulse), 0)
    if (rotationImpulseTimeTotal > 0) {
      return rotationImpulseTimeTotal
    } else {
      return 0
    }
  }

  function sessionDrag () {
    return 0
  }

  function sessionVO2Max () {
    return undefined
  }

  function sessionHRR () {
    return []
  }

  function reset () {
    rotationImpulses = null
    rotationImpulses = []
    allDataHasBeenWritten = true
  }

  return {
    recordRotationImpulse,
    recordRowingMetrics,
    handleCommand,
    minimumDataAvailable,
    fileContent,
    type,
    postfix,
    presentationName,
    totalRecordedDistance,
    totalRecordedMovingTime,
    sessionDrag,
    sessionVO2Max,
    sessionHRR,
    allDataHasBeenWritten,
    reset
  }
}
