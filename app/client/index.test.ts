/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe, beforeEach } from 'vitest'

import { App } from './index'
import { APP_STATE } from './store/appState'

beforeEach(() => {
  localStorage.clear()
})

describe('applyTheme', () => {
  test('should set data-theme attribute when trueBlackTheme is true', () => {
    const app = new App()
    app.applyTheme(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('true-black')
  })

  test('should remove data-theme attribute when trueBlackTheme is false', () => {
    document.documentElement.setAttribute('data-theme', 'true-black')
    const app = new App()
    app.applyTheme(false)
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })
})

describe('getState', () => {
  test('should return a deep copy that does not affect internal state', () => {
    const app = new App()
    const state = app.getState()
    state.metrics.totalLinearDistance = 9999

    const freshState = app.getState()
    expect(freshState.metrics.totalLinearDistance).not.toBe(9999)
  })
})

describe('updateState', () => {
  test('should merge partial state into the existing state', () => {
    const app = new App()
    app.updateState({ metrics: { ...APP_STATE.metrics, totalLinearDistance: 500 } })

    const state = app.getState()
    expect(state.metrics.totalLinearDistance).toBe(500)
  })
})

describe('dashboard metrics validation', () => {
  test('should filter out unknown metric keys from localStorage', () => {
    // Store invalid metrics in localStorage
    localStorage.setItem('dashboardMetrics', JSON.stringify(['validPace', 'unknownMetric', 'another']))

    // Create a new App - the constructor reads from localStorage and filters
    const app = new App()
    const state = app.getState()
    // unknownMetric and 'another' should be filtered out if they're not in DASHBOARD_METRICS
    // 'validPace' is also not a real key, so all should be filtered
    const metrics = state.config.guiConfigs.dashboardMetrics
    metrics.forEach((metric: string) => {
      // All remaining metrics should be valid (exist in DASHBOARD_METRICS)
      // rather than the invalid ones we injected
      expect(metric).not.toBe('unknownMetric')
      expect(metric).not.toBe('another')
    })
  })
})
