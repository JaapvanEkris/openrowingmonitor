'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module captures the metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import zlib from 'zlib'
import fs from 'fs/promises'
import { promisify } from 'util'
const gzip = promisify(zlib.gzip)

function createRawRecorder (config) {
  const rotationImpulses = []
  let filename
  let allDataHasBeenWritten

  function setBaseFileName (baseFileName) {
    filename = `${baseFileName}_raw.csv${config.gzipRawDataFiles ? '.gz' : ''}`
    log.info(`Raw data file will be saved as ${filename} (after the session)`)
  }

  async function recordRotationImpulse (impulse) {
    // Please observe: this MUST be doe in memory first, before persisting. Persisting to disk without the
    // intermediate step of persisting to memory can lead to buffering issues that will mix up impulses in the recording !!!!
    await rotationImpulses.push(impulse)
    allDataHasBeenWritten = false
  }

  async function createRawDataFile () {
    // Do not write again if not needed
    if (allDataHasBeenWritten) return

    // we need at least two strokes and ten seconds to generate a valid tcx file
    if (!minimumRecordingTimeHasPassed()) {
      log.info('raw file has not been written, as there was not enough data recorded (minimum 10 seconds)')
      return
    }

    await createFile(rotationImpulses.join('\n'), filename, config.gzipRawDataFiles)

    allDataHasBeenWritten = true
    log.info(`Raw data has been written as ${filename}`)
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

  function minimumRecordingTimeHasPassed () {
    const minimumRecordingTimeInSeconds = 10
    // We need to make sure that we use the Math.abs(), as a gpio rollover can cause impulse to be negative!
    const rotationImpulseTimeTotal = rotationImpulses.reduce((acc, impulse) => acc + Math.abs(impulse), 0)
    return (rotationImpulseTimeTotal > minimumRecordingTimeInSeconds)
  }

  return {
    setBaseFileName,
    recordRotationImpulse,
    createRawDataFile
  }
}

export { createRawRecorder }
