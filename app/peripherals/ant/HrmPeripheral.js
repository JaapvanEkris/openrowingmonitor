'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Creates a ANT+ peripheral to recieve heartrate data from a HRM belt
*/
import EventEmitter from 'node:events'
import log from 'loglevel'

import { HeartRateSensor } from 'incyclist-ant-plus'

/**
 * @typedef {import('incyclist-ant-plus').IChannel} IChannel
 */

/**
 * @param {import('./AntManager').default} antManager
 */
function createAntHrmPeripheral (antManager) {
  const emitter = new EventEmitter()
  const antStick = antManager.getAntStick()
  const heartRateSensor = new HeartRateSensor(0)
  let batteryLevel = 0
  /** @type {IChannel & EventEmitter | undefined} */
  let channel

  async function attach () {
    if (!antManager.isStickOpen()) { await antManager.openAntStick() }
    channel = /** @type {IChannel & EventEmitter} */(antStick.getChannel())

    channel.on('data', (profile, deviceID, data) => {
      switch (data.BatteryStatus) {
        case 'New':
          batteryLevel = 100
          break
        case 'Good':
          batteryLevel = 80
          break
        case 'Ok':
          batteryLevel = 60
          break
        case 'Low':
          batteryLevel = 40
          break
        case 'Critical':
          batteryLevel = 20
          break
        default:
          batteryLevel = 0
      }

      if (data.BatteryLevel > 0) {
        batteryLevel = data.BatteryLevel
      }

      emitter.emit('heartRateMeasurement', { heartrate: data.ComputedHeartRate, batteryLevel })
    })

    if (!(await channel.startSensor(heartRateSensor))) {
      log.error('Could not start ANT+ heart rate sensor')
    }
  }

  async function destroy () {
    if (!channel) {
      log.debug('Ant Sensor does not seem to be running')
      return
    }
    await channel.stopSensor(heartRateSensor)
  }

  return Object.assign(emitter, {
    destroy,
    attach
  })
}

export { createAntHrmPeripheral }
