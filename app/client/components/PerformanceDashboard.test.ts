/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'

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

describe('_computeGridConfig', () => {
  function mockMatchMedia (isPortrait: boolean) {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: isPortrait,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as MediaQueryList)
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should set columns and rows from landscape config when not in portrait', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.gridConfig = {
      landscape: { columns: 5, rows: 3 },
      portrait: { columns: 2, rows: 6 }
    }
    dashboard._computeGridConfig()
    expect(dashboard._columns).toBe(5)
    expect(dashboard._rows).toBe(3)
    expect(dashboard._maxGridSlots).toBe(15)
  })

  test('should set columns and rows from portrait config when in portrait', () => {
    mockMatchMedia(true)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.gridConfig = {
      landscape: { columns: 5, rows: 3 },
      portrait: { columns: 2, rows: 6 }
    }
    dashboard._computeGridConfig()
    expect(dashboard._columns).toBe(2)
    expect(dashboard._rows).toBe(6)
    expect(dashboard._maxGridSlots).toBe(12)
  })
})

describe('orientation change listener', () => {
  let addListenerSpy: ReturnType<typeof vi.fn>
  let removeListenerSpy: ReturnType<typeof vi.fn>
  let mockMql: MediaQueryList

  beforeEach(() => {
    addListenerSpy = vi.fn()
    removeListenerSpy = vi.fn()
    mockMql = {
      matches: false,
      addEventListener: addListenerSpy,
      removeEventListener: removeListenerSpy
    } as unknown as MediaQueryList
    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMql)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should register an orientation change listener on connectedCallback', () => {
    const dashboard = createDashboard()
    dashboard.connectedCallback()
    expect(addListenerSpy).toHaveBeenCalledWith('change', dashboard._handleOrientationChange)
  })

  test('should remove the orientation change listener on disconnectedCallback', () => {
    const dashboard = createDashboard()
    dashboard.connectedCallback()
    dashboard.disconnectedCallback()
    expect(removeListenerSpy).toHaveBeenCalledWith('change', dashboard._handleOrientationChange)
  })
})

describe('_getAvailableMetrics', () => {
  test('should exclude metrics already in the list', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance']
    const result = dashboard._getAvailableMetrics()
    expect(result).not.toContain('distance')
  })

  test('should exclude metrics whose size exceeds available slots', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance']
    // availableSlots = 1, forceCurve has size 2 → should be excluded
    const result = dashboard._getAvailableMetrics(1)
    expect(result).not.toContain('forceCurve')
  })

  test('should include size-2 metrics when enough slots are available', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance', 'timer']
    const result = dashboard._getAvailableMetrics(2)
    expect(result).toContain('forceCurve')
  })
})
