/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

import { DashboardToolbar } from './DashboardToolbar'
import type { AppConfig } from '../store/types'

function createToolbar (config: Partial<AppConfig> = {}): DashboardToolbar {
  const toolbar = new DashboardToolbar()
  toolbar.config = {
    blePeripheralMode: '',
    hrmPeripheralMode: '',
    antPeripheralMode: '',
    uploadEnabled: false,
    shutdownEnabled: false,
    guiConfigs: {
      dashboardMetrics: [],
      showIcons: true,
      maxNumberOfTiles: 8,
      trueBlackTheme: false,
      forceCurveDivisionMode: 0
    },
    ...config
  }
  return toolbar
}

describe('blePeripheralMode', () => {
  test('should return "C2 PM5" when the mode is PM5', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'PM5' })
    expect(toolbar.blePeripheralMode()).toBe('C2 PM5')
  })

  test('should return "FTMS Rower" when the mode is FTMS', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'FTMS' })
    expect(toolbar.blePeripheralMode()).toBe('FTMS Rower')
  })

  test('should return "FTMS Bike" when the mode is FTMSBIKE', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'FTMSBIKE' })
    expect(toolbar.blePeripheralMode()).toBe('FTMS Bike')
  })

  test('should return "Bike Speed + Cadence" when the mode is CSC', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'CSC' })
    expect(toolbar.blePeripheralMode()).toBe('Bike Speed + Cadence')
  })

  test('should return "Bike Power" when the mode is CPS', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'CPS' })
    expect(toolbar.blePeripheralMode()).toBe('Bike Power')
  })

  test('should return "Off" when the mode is unknown', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'UNKNOWN' })
    expect(toolbar.blePeripheralMode()).toBe('Off')
  })

  test('should return "Off" when the mode is an empty string', () => {
    const toolbar = createToolbar({ blePeripheralMode: '' })
    expect(toolbar.blePeripheralMode()).toBe('Off')
  })
})
