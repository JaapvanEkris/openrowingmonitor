'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Defines the global state of the app
*/

export const APP_STATE = {
  // contains all the rowing metrics that are delivered from the backend
  metrics: {},
  config: {
    // currently can be FTMS, FTMSBIKE, PM5, CSC, CPS, OFF
    blePeripheralMode: '',
    // currently can be ANT, BLE, OFF
    hrmPeripheralMode: '',
    // currently can be FE, OFF
    antPeripheralMode: '',
    // true if manual upload to strava, intervals or rowsandall is enabled
    uploadEnabled: false,
    // true if remote device shutdown is enabled
    shutdownEnabled: false,
    guiConfigs: {
      dashboardMetrics: ['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk', 'calories', 'actions'],
      showIcons: true,
      maxNumberOfTiles: 8
    }
  }
}
