/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

import { PerformanceDashboard } from './PerformanceDashboard'
import { DASHBOARD_METRICS } from '../store/dashboardMetrics'
import { APP_STATE } from '../store/appState'

function createDashboard (): PerformanceDashboard {
  const dashboard = new PerformanceDashboard()
  dashboard.appState = structuredClone(APP_STATE)
  return dashboard
}

describe('dashboardMetricComponentsFactory', () => {
  test('should return a template for every key in DASHBOARD_METRICS', () => {
    const dashboard = createDashboard()
    const result = dashboard.dashboardMetricComponentsFactory(dashboard.appState)
    const expectedKeys = Object.keys(DASHBOARD_METRICS)

    expect(Object.keys(result)).toEqual(expectedKeys)
  })
})

describe('grid class', () => {
  test('should return "rows-3" when maxNumberOfTiles is 12', () => {
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.maxNumberOfTiles = 12
    const gridClass = dashboard.appState.config.guiConfigs.maxNumberOfTiles === 12 ? 'rows-3' : ''
    expect(gridClass).toBe('rows-3')
  })

  test('should return empty string when maxNumberOfTiles is 8', () => {
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.maxNumberOfTiles = 8
    const gridClass = dashboard.appState.config.guiConfigs.maxNumberOfTiles === 12 ? 'rows-3' : ''
    expect(gridClass).toBe('')
  })
})
