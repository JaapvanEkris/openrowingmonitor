'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Measures the time between impulses on the GPIO pin. Started in a
  separate thread, since we want the measured time to be as close as
  possible to real time.
*/
import process from 'process'
import os from 'os'
import config from '../tools/ConfigManager.js'
import log from 'loglevel'

log.setLevel(config.loglevel.default)

export async function createGpioTimerService () {
  if (config.simulateWithoutHardware) {
    log.info('Hardware initialization: simulateWithoutHardware is true. GPIO service is bypassed.')
    return
  }

  let pigpio
  try {
    const pigpioModule = await import('pigpio')
    pigpio = pigpioModule.default

    // The JS wrapper loads even if the C library fails to initialize (e.g. on non-Pi or missing root).
    // When the C library fails, the exported functions exist but wrap undefined C-bindings, causing a 
    // TypeError when called. We catch this explicitly to verify true compatibility before proceeding.
    let hwRev
    try {
      hwRev = pigpio.hardwareRevision()
    } catch (e) {
      if (e instanceof TypeError && e.message.includes('is not a function')) {
        log.info('Hardware initialization: pigpio C library failed to initialize (likely not a supported Raspberry Pi or missing root). GPIO service is bypassed.')
        return
      }
      throw e // re-throw unexpected errors
    }

    if (hwRev === 0) {
      log.info('Hardware initialization: pigpio reports unknown/unsupported hardware revision. GPIO service is bypassed.')
      return
    }

    log.info(`Hardware initialization: pigpio initialized successfully (Hardware Revision: ${hwRev.toString(16)}). Attempting to start GPIO service.`)
  } catch (error) {
    log.info(`Hardware initialization: Failed to load pigpio module (${error.message}). GPIO service is bypassed.`)
    return
  }

  // Import the settings from the settings file
  const triggeredFlank = config.gpioTriggeredFlank
  const pollingInterval = config.gpioPollingInterval
  const minimumPulseLength = config.gpioMinimumPulseLength

  if (config.gpioPriority) {
    // setting top (near-real-time) priority for the Gpio process, as we don't want to miss anything
    log.debug(`Gpio-service: Setting priority to ${config.gpioPriority}`)
    try {
      // setting priority of current process
      os.setPriority(config.gpioPriority)
    } catch (err) {
      log.debug(`Gpio-service: FAILED to set priority of Gpio-Thread, error ${err}, are root permissions granted?`)
    }
  }

  const Gpio = pigpio.Gpio

  // Configure the gpio polling frequency
  pigpio.configureClock(pollingInterval, pigpio.CLOCK_PCM)

  // Configure the sensor readings for one of the Gpio pins of Raspberry Pi
  const sensor = new Gpio(
    config.gpioPin, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_UP,
      alert: true
    })

  // Set a minumum time a level must be stable before an alert event is emitted.
  sensor.glitchFilter(minimumPulseLength)
  log.debug(`Gpio-service: pin number ${config.gpioPin}, polling interval ${pollingInterval} us, triggered on ${triggeredFlank} flank, minimal pulse time ${minimumPulseLength} us`)

  // set the default value
  let previousTick = 0

  // Define the alert handler
  sensor.on('alert', (level, rawCurrentTick) => {
    if ((triggeredFlank === 'Both') || (triggeredFlank === 'Down' && level === 0) || (triggeredFlank === 'Up' && level === 1)) {
      const currentTick = (rawCurrentTick >> 0) / 1e6
      let currentDt
      if (currentTick > previousTick) {
        currentDt = currentTick - previousTick
      } else {
        // We had a rollover of the tick, so the current tick misses 4,294,967,295 us
        log.debug('Gpio-service: tick rollover detected and corrected')
        currentDt = (currentTick + 4294.967295) - previousTick
      }
      previousTick = currentTick
      process.send(currentDt)
    }
  })
}
createGpioTimerService()
