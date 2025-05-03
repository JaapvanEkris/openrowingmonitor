'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Some PM5 specific constants
*/
export const PeripheralConstants = {
  serial: '431079192',
  model: 'PM5',
  name: 'PM5 431079192',
  hardwareRevision: '634',
  // See https://www.concept2.com/service/monitors/pm5/firmware for available versions
  // please note: hardware versions exclude a software version, and thus might confuse the client
  firmwareRevision: '8200-000372-176.000',
  manufacturer: 'Concept2'
}

export const bleBroadcastInterval = 1000
export const bleMinimumKnowDataUpdateInterval = 4000
