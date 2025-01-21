'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Merges the different config files and presents the configuration to the application
  Checks the config for plausibility, fixes the errors when needed
*/
import defaultConfig from '../../config/default.config.js'
import { checkRangeValue, checkIntegerValue, checkBooleanValue, checkFloatValue } from './ConfigValidations.js'
import { deepMerge } from './Helper.js'
import log from 'loglevel'

async function getConfig () {
  let customConfig
  try {
    customConfig = await import('../../config/config.js')
  } catch (exception) {}
  return customConfig !== undefined ? deepMerge(defaultConfig, customConfig.default) : defaultConfig
}

function runConfigMigration (configToCheck) {
  if (Object.keys(configToCheck).includes('peripheralUpdateInterval')) {
    log.error('WARNING: An old version of the config file was detected, peripheralUpdateInterval is now deprecated please use ftmsUpdateInterval and pm5UpdateInterval')
    configToCheck.ftmsUpdateInterval = configToCheck.peripheralUpdateInterval
    configToCheck.pm5UpdateInterval = configToCheck.peripheralUpdateInterval
  }

  if (Object.keys(configToCheck).includes('antplusMode')) {
    log.error('WARNING: An old version of the config file was detected, please update the name of the following setting in the config.js file: antplusMode into antPlusMode')
    configToCheck.antPlusMode = configToCheck.antplusMode
  }

  if (Object.keys(configToCheck.rowerSettings).includes('minumumForceBeforeStroke')) {
    log.error('WARNING: An old version of the config file was detected, please update the name of the following setting in the config.js file: minumumForceBeforeStroke into minimumForceBeforeStroke')
    configToCheck.rowerSettings.minimumForceBeforeStroke = configToCheck.rowerSettings.minumumForceBeforeStroke
  }

  if (Object.keys(configToCheck.rowerSettings).includes('minumumRecoverySlope')) {
    log.error('WARNING: An old version of the config file was detected, please update the name of the following setting in the config.js file: minumumRecoverySlope into minimumRecoverySlope')
    configToCheck.rowerSettings.minimumRecoverySlope = configToCheck.rowerSettings.minumumRecoverySlope
  }
}

function checkConfig (configToCheck) {
  checkRangeValue(configToCheck.loglevel, 'default', ['trace', 'debug', 'info', 'warn', 'error', 'silent'], true, 'error')
  checkRangeValue(configToCheck.loglevel, 'RowingEngine', ['trace', 'debug', 'info', 'warn', 'error', 'silent'], true, 'error')
  checkIntegerValue(configToCheck, 'gpioPin', 1, 27, false, false, null)
  checkIntegerValue(configToCheck, 'gpioPriority', -7, 0, true, true, 0)
  checkIntegerValue(configToCheck, 'gpioMinimumPulseLength', 1, null, false, true, 0)
  checkIntegerValue(configToCheck, 'gpioPollingInterval', 1, 10, false, true, 10)
  checkRangeValue(configToCheck, 'gpioPollingInterval', [1, 2, 5, 10], true, 10)
  checkRangeValue(configToCheck, 'gpioTriggeredFlank', ['Up', 'Down', 'Both'], true, 'Up')
  checkIntegerValue(configToCheck, 'appPriority', configToCheck.gpioPriority, 0, true, true, 0)
  checkIntegerValue(configToCheck, 'webUpdateInterval', 80, 1000, false, true, 1000)
  checkIntegerValue(configToCheck, 'ftmsUpdateInterval', 150, 1000, false, true, 1000) // Please note: the minimum update interval for iOS is 30ms, for android 7.5ms (see https://stackoverflow.com/questions/37776536/bluetooth-low-energy-on-different-platforms), and some PM5 messages send 5 telegrams
  checkIntegerValue(configToCheck, 'pm5UpdateInterval', 150, 1000, false, true, 1000) // Please note: the minimum update interval for iOS is 30ms, for android 7.5ms (see https://stackoverflow.com/questions/37776536/bluetooth-low-energy-on-different-platforms), and some PM5 messages send 5 telegrams
  checkRangeValue(configToCheck, 'bluetoothMode', ['OFF', 'PM5', 'FTMS', 'FTMSBIKE', 'CPS', 'CSC'], true, 'OFF')
  checkRangeValue(configToCheck, 'antPlusMode', ['OFF', 'FE'], true, 'OFF')
  checkRangeValue(configToCheck, 'heartRateMode', ['OFF', 'ANT', 'BLE'], true, 'OFF')
  checkIntegerValue(configToCheck, 'numOfPhasesForAveragingScreenData', 2, null, false, true, 4)
  checkBooleanValue(configToCheck, 'createRowingDataFiles', true, true)
  checkBooleanValue(configToCheck, 'createRawDataFiles', true, true)
  checkBooleanValue(configToCheck, 'gzipRawDataFiles', true, false)
  checkBooleanValue(configToCheck, 'createTcxFiles', true, true)
  checkBooleanValue(configToCheck, 'gzipTcxFiles', true, false)
  checkBooleanValue(configToCheck, 'createFitFiles', true, true)
  checkBooleanValue(configToCheck, 'gzipFitFiles', true, false)
  checkFloatValue(configToCheck.userSettings, 'restingHR', 30, 220, false, true, 40)
  checkFloatValue(configToCheck.userSettings, 'maxHR', configToCheck.userSettings.restingHR, 220, false, true, 220)
  if (configToCheck.createTcxFiles || configToCheck.createFitFiles) {
    checkFloatValue(configToCheck.userSettings, 'minPower', 1, 500, false, true, 50)
    checkFloatValue(configToCheck.userSettings, 'maxPower', 100, 6000, false, true, 500)
    checkFloatValue(configToCheck.userSettings, 'distanceCorrectionFactor', 0, 50, false, true, 5)
    checkFloatValue(configToCheck.userSettings, 'weight', 25, 500, false, true, 80)
    checkRangeValue(configToCheck.userSettings, 'sex', ['male', 'female'], true, 'male')
    checkBooleanValue(configToCheck.userSettings, 'highlyTrained', true, false)
  }
  checkIntegerValue(configToCheck.rowerSettings, 'numOfImpulsesPerRevolution', 1, null, false, false, null)
  checkIntegerValue(configToCheck.rowerSettings, 'flankLength', 3, null, false, false, null)
  checkFloatValue(configToCheck.rowerSettings, 'sprocketRadius', 0, 20, false, true, 3)
  checkFloatValue(configToCheck.rowerSettings, 'minimumTimeBetweenImpulses', 0, 3, false, false, null)
  checkFloatValue(configToCheck.rowerSettings, 'maximumTimeBetweenImpulses', configToCheck.rowerSettings.minimumTimeBetweenImpulses, 3, false, false, null)
  checkFloatValue(configToCheck.rowerSettings, 'smoothing', 1, null, false, true, 1)
  checkFloatValue(configToCheck.rowerSettings, 'dragFactor', 1, null, false, false, null)
  checkBooleanValue(configToCheck.rowerSettings, 'autoAdjustDragFactor', true, false)
  checkIntegerValue(configToCheck.rowerSettings, 'dragFactorSmoothing', 1, null, false, true, 1)
  if (configToCheck.rowerSettings.autoAdjustDragFactor) {
    checkFloatValue(configToCheck.rowerSettings, 'minimumDragQuality', 0, 1, true, true, 0)
  }
  checkFloatValue(configToCheck.rowerSettings, 'flywheelInertia', 0, null, false, false, null)

  checkFloatValue(configToCheck.rowerSettings, 'minimumForceBeforeStroke', 0, 500, true, true, 0)

  checkFloatValue(configToCheck.rowerSettings, 'minimumRecoverySlope', 0, null, true, true, 0)
  checkFloatValue(configToCheck.rowerSettings, 'minimumStrokeQuality', 0, 1, true, true, 0)
  checkBooleanValue(configToCheck.rowerSettings, 'autoAdjustRecoverySlope', true, false)
  if (!configToCheck.rowerSettings.autoAdjustDragFactor && configToCheck.rowerSettings.autoAdjustRecoverySlope) {
    log.error('Configuration Error: rowerSettings.autoAdjustRecoverySlope can not be true when rowerSettings.autoAdjustDragFactor is false, ignoring request')
  }
  if (configToCheck.rowerSettings.autoAdjustDragFactor && configToCheck.rowerSettings.autoAdjustRecoverySlope) {
    checkFloatValue(configToCheck.rowerSettings, 'autoAdjustRecoverySlopeMargin', 0, 1, false, true, 1)
  }
  checkFloatValue(configToCheck.rowerSettings, 'minimumDriveTime', 0, null, false, true, 0.001)
  checkFloatValue(configToCheck.rowerSettings, 'minimumRecoveryTime', 0, null, false, true, 0.001)
  checkFloatValue(configToCheck.rowerSettings, 'maximumStrokeTimeBeforePause', 3, 60, false, true, 6)
  checkFloatValue(configToCheck.rowerSettings, 'magicConstant', 0, null, false, true, 2.8)
}

const config = await getConfig()

runConfigMigration(config)
checkConfig(config)

export default config
