'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  This Module captures the raw metrics of a rowing session and persists them.
*/
import log from 'loglevel'
import zlib from 'zlib'
import fs from 'fs/promises'
import { promisify } from 'util'
const gzip = promisify(zlib.gzip)

function createRawRecorder (config) {
  let rotationImpulses = []
  let filename

  // This function handles all incomming commands. As all commands are broadasted to all application parts,
  // we need to filter here what the WorkoutRecorder will react to and what it will ignore
  async function handleCommand (commandName) {
    switch (commandName) {
      case ('start'):
        break
      case ('startOrResume'):
        break
      case ('pause'):
        await createRawDataFile()
        break
      case ('stop'):
        await createRawDataFile()
        break
      case ('reset'):
        await createRawDataFile()
        rotationImpulses = []
        filename = undefined
        break
      case 'shutdown':
        await createRawDataFile()
        break
      default:
        log.error(`rawRecorder: Recieved unknown command: ${commandName}`)
    }
  }

  function setBaseFileName (baseFileName) {
    filename = `${baseFileName}_raw.csv${config.gzipRawDataFiles ? '.gz' : ''}`
    log.info(`Raw data will be saved as ${filename}...`)
  }

  async function recordRotationImpulse (impulse) {
    // Please observe: this MUST be doe in memory first, before persisting. Persisting to disk without the
    // intermediate step of persisting to memory can lead to buffering issues that will mix up impulses in the recording !!!!
    await rotationImpulses.push(impulse)
  }

  async function createRawDataFile () {
    log.info(`saving session as raw data file ${filename}...`)
    await createFile(rotationImpulses.join('\n'), filename, config.gzipRawDataFiles)
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

  return {
    setBaseFileName,
    recordRotationImpulse,
    handleCommand
  }
}

export { createRawRecorder }
