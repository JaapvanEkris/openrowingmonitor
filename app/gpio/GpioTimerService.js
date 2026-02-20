'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Measures the time between impulses on the GPIO pin. Started in a
  separate thread, since we want the measured time to be as close as
  possible to real time.
*/
import process from 'process'
import pigpio from 'pigpio'
import os from 'os'
import config from '../tools/ConfigManager.js'
import log from 'loglevel'

log.setLevel(config.loglevel.default)

export function createGpioTimerService () {
  const triggeredFlank = config.gpioTriggeredFlank
  const pollingInterval = config.gpioPollingInterval
  const minimumPulseLength = config.gpioMinimumPulseLength

  if (config.gpioPriority) {
    log.debug(`Gpio-service: Setting priority to ${config.gpioPriority}`)
    try {
      os.setPriority(config.gpioPriority)
    } catch (err) {
      log.debug(`Gpio-service: FAILED to set priority of Gpio-Thread, error ${err}, are root permissions granted?`)
    }
  }

  const Gpio = pigpio.Gpio

  pigpio.configureClock(pollingInterval, pigpio.CLOCK_PCM)

  const sensor = new Gpio(
    config.gpioPin, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_UP,
      alert: true
    })

  sensor.glitchFilter(minimumPulseLength)
  log.debug(`Gpio-service: pin number ${config.gpioPin}, polling interval ${pollingInterval} us, triggered on ${triggeredFlank} flank, minimal pulse time ${minimumPulseLength} us`)

  let previousTick = 0

  sensor.on('alert', (level, rawCurrentTick) => {
    if ((triggeredFlank === 'Both') || (triggeredFlank === 'Down' && level === 0) || (triggeredFlank === 'Up' && level === 1)) {
      const currentTick = (rawCurrentTick >> 0) / 1e6
      let currentDt
      if (currentTick > previousTick) {
        currentDt = currentTick - previousTick
      } else {
        log.debug('Gpio-service: tick rollover detected and corrected')
        currentDt = (currentTick + 4294.967295) - previousTick
      }
      previousTick = currentTick
      process.send(currentDt)
    }
  })
}
createGpioTimerService()
