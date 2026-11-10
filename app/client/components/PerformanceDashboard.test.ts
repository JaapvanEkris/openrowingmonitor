/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'

import type { TemplateResult } from 'lit'
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
    expect(dashboard._isPortrait).toBe(false)
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
    expect(dashboard._isPortrait).toBe(true)
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

  test('should not offer the force curve to add when only one cell is free', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk', 'calories']
    const result = dashboard._getAvailableMetrics()
    expect(result).not.toContain('forceCurve')
    expect(result).toContain('heartRate')
  })

  test('should offer the force curve to add when two cells are free', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance', 'timer']
    expect(dashboard._getAvailableMetrics()).toContain('forceCurve')
  })

  test('should offer the force curve as replacement for a last-column tile when the packed layout fits', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk']
    // replacing 'power' (last column of row 1) packs 'stkRate' in front of the force curve
    expect(dashboard._getAvailableMetrics(3)).toContain('forceCurve')
  })

  test('should not offer the force curve as replacement when the result would not fit', () => {
    const dashboard = createDashboard()
    // all 8 cells used: swapping a 1-cell tile for the 2-cell force curve needs 9
    dashboard._localMetrics = ['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk', 'calories', 'heartRate']
    expect(dashboard._getAvailableMetrics(3)).not.toContain('forceCurve')
  })

  test('should never offer the force curve in a 1-column grid', () => {
    const dashboard = createDashboard()
    dashboard._columns = 1
    dashboard._rows = 8
    dashboard._localMetrics = ['distance']
    expect(dashboard._getAvailableMetrics()).not.toContain('forceCurve')
    expect(dashboard._getAvailableMetrics(0)).not.toContain('forceCurve')
  })
})

describe('_getOrientationMetrics', () => {
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

  test('should return landscapeDashboardMetrics when in landscape', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.landscapeDashboardMetrics = ['distance', 'pace']
    dashboard.appState.config.guiConfigs.portraitDashboardMetrics = ['timer', 'power']
    expect(dashboard._getOrientationMetrics()).toEqual(['distance', 'pace'])
  })

  test('should return portraitDashboardMetrics when in portrait', () => {
    mockMatchMedia(true)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.landscapeDashboardMetrics = ['distance', 'pace']
    dashboard.appState.config.guiConfigs.portraitDashboardMetrics = ['timer', 'power']
    expect(dashboard._getOrientationMetrics()).toEqual(['timer', 'power'])
  })
})

describe('_handleRetileModeChanged', () => {
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

  test('should copy orientation metrics into _localMetrics when activated', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.landscapeDashboardMetrics = ['distance', 'pace']
    dashboard._retileMode = false
    dashboard._handleRetileModeChanged(new CustomEvent('retile-mode-changed', { detail: { active: true } }))
    expect(dashboard._localMetrics).toEqual(['distance', 'pace'])
  })

  test('should dispatch changeGuiSetting with landscapeDashboardMetrics key when deactivated in landscape', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = true
    dashboard._localMetrics = ['distance', 'timer', 'pace']

    let received: CustomEvent | undefined
    dashboard.addEventListener('changeGuiSetting', (e) => { received = e as CustomEvent })

    dashboard._handleRetileModeChanged(new CustomEvent('retile-mode-changed', { detail: { active: false } }))

    expect(received!.detail).toEqual({ landscapeDashboardMetrics: ['distance', 'timer', 'pace'] })
    expect(dashboard._localMetrics).toBeNull()
  })

  test('should dispatch changeGuiSetting with portraitDashboardMetrics key when deactivated in portrait', () => {
    mockMatchMedia(true)
    const dashboard = createDashboard()
    dashboard._retileMode = true
    dashboard._localMetrics = ['timer', 'power']

    let received: CustomEvent | undefined
    dashboard.addEventListener('changeGuiSetting', (e) => { received = e as CustomEvent })

    dashboard._handleRetileModeChanged(new CustomEvent('retile-mode-changed', { detail: { active: false } }))

    expect(received!.detail).toEqual({ portraitDashboardMetrics: ['timer', 'power'] })
    expect(dashboard._localMetrics).toBeNull()
  })
})

describe('_handleRevertLayout', () => {
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

  test('should go back to the saved landscape layout when in landscape', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.landscapeDashboardMetrics = ['heartRate', 'pace']
    dashboard.appState.config.guiConfigs.portraitDashboardMetrics = ['timer', 'power']
    dashboard._retileMode = true
    dashboard._localMetrics = ['distance']
    dashboard._handleRevertLayout()
    expect(dashboard._localMetrics).toEqual(['heartRate', 'pace'])
  })

  test('should go back to the saved portrait layout when in portrait', () => {
    mockMatchMedia(true)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.landscapeDashboardMetrics = ['heartRate', 'pace']
    dashboard.appState.config.guiConfigs.portraitDashboardMetrics = ['timer', 'power']
    dashboard._retileMode = true
    dashboard._localMetrics = ['distance']
    dashboard._handleRevertLayout()
    expect(dashboard._localMetrics).toEqual(['timer', 'power'])
  })

  test('should not modify _localMetrics when retile mode is not active', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = false
    dashboard._localMetrics = ['distance']
    dashboard._handleRevertLayout()
    expect(dashboard._localMetrics).toEqual(['distance'])
  })
})

describe('_removeMetric', () => {
  test('should remove the metric at the given index', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance', 'timer', 'pace']
    dashboard._removeMetric(1)
    expect(dashboard._localMetrics).toEqual(['distance', 'pace'])
  })

  test('should not modify state when _localMetrics is null', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = null
    dashboard._removeMetric(0)
    expect(dashboard._localMetrics).toBeNull()
  })
})

describe('_addMetricDirect', () => {
  test('should append the metric to _localMetrics', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance']
    dashboard._addMetricDirect('timer')
    expect(dashboard._localMetrics).toEqual(['distance', 'timer'])
  })

  test('should not modify state when _localMetrics is null', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = null
    dashboard._addMetricDirect('timer')
    expect(dashboard._localMetrics).toBeNull()
  })
})

describe('_replaceMetricDirect', () => {
  test('should replace the metric at the given index', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance', 'timer', 'pace']
    dashboard._replaceMetricDirect(1, 'power')
    expect(dashboard._localMetrics).toEqual(['distance', 'power', 'pace'])
  })

  test('should not modify state when _localMetrics is null', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = null
    dashboard._replaceMetricDirect(0, 'timer')
    expect(dashboard._localMetrics).toBeNull()
  })
})

describe('render', () => {
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

  test('should apply --grid-columns and --grid-rows CSS variables from _columns and _rows', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._columns = 3
    dashboard._rows = 5
    dashboard._localMetrics = []
    const result = dashboard.render()
    expect(result.values).toContain(3)
    expect(result.values).toContain(5)
  })

  test('should render a tile for each metric in _localMetrics when set', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = false
    dashboard._localMetrics = ['distance', 'timer', 'pace']
    const result = dashboard.render()
    const metricConfig = result.values[3] as TemplateResult[]
    expect(metricConfig).toHaveLength(3)
  })

  test('should render tiles from orientation metrics when _localMetrics is null', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = false
    dashboard._localMetrics = null
    const orientationMetrics = dashboard._getOrientationMetrics()
    const result = dashboard.render()
    const metricConfig = result.values[3] as TemplateResult[]
    expect(metricConfig).toHaveLength(orientationMetrics.length)
  })

  test('should append add-tile when in retile mode and grid has available slots', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = true
    dashboard._localMetrics = ['distance']
    const result = dashboard.render()
    const metricConfig = result.values[3] as TemplateResult[]
    // 1 metric tile wrapped with controls + 1 add-tile
    expect(metricConfig).toHaveLength(2)
  })

  test('should not append add-tile when retile mode is off', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = false
    dashboard._localMetrics = ['distance']
    const result = dashboard.render()
    const metricConfig = result.values[3] as TemplateResult[]
    expect(metricConfig).toHaveLength(1)
  })

  test('should not append add-tile when the grid is full', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = true
    dashboard._localMetrics = ['distance', 'timer', 'pace']
    dashboard._columns = 3
    dashboard._rows = 1
    const result = dashboard.render()
    const metricConfig = result.values[3] as TemplateResult[]
    expect(metricConfig).toHaveLength(3)
  })

  test('should not append add-tile when a hole fills the last free cell', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = true
    dashboard._columns = 2
    dashboard._rows = 3
    // 3 tiles + a hole at the end of row 2 + the force curve on row 3 → 6 cells used
    dashboard._localMetrics = ['distance', 'timer', 'pace', 'forceCurve']
    const result = dashboard.render()
    const metricConfig = result.values[3] as TemplateResult[]
    expect(metricConfig).toHaveLength(4)
  })

  test('should only render the tiles that fit the grid', () => {
    mockMatchMedia(false)
    const dashboard = createDashboard()
    dashboard._retileMode = false
    dashboard._columns = 3
    dashboard._rows = 2
    dashboard.appState.config.guiConfigs.landscapeDashboardMetrics = ['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk', 'calories']
    const result = dashboard.render()
    const metricConfig = result.values[3] as TemplateResult[]
    expect(metricConfig).toHaveLength(6)
    // the saved list is not changed
    expect(dashboard.appState.config.guiConfigs.landscapeDashboardMetrics).toHaveLength(7)
  })
})

describe('_renderAddTile', () => {
  test('should render empty message when no metrics fit in available slots', () => {
    const dashboard = createDashboard()
    dashboard._columns = 1
    dashboard._rows = 1
    // a 1x1 grid has room for one tile, so fill it
    dashboard._localMetrics = ['distance']
    const result = dashboard._renderAddTile()
    expect(result.values).toHaveLength(0)
    expect([...result.strings].join('')).toContain('All metrics in use or won\'t fit')
  })

  test('should render one option per available metric', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = []
    const result = dashboard._renderAddTile()
    const options = result.values[0] as TemplateResult[]
    expect(options).toHaveLength(Object.keys(DASHBOARD_METRICS).length)
  })
})

describe('_renderMetricWithControls', () => {
  test('should pass controls slot content to the component factory', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance']
    const factory = vi.fn() as unknown as (slotContent?: TemplateResult | string) => TemplateResult
    dashboard._renderMetricWithControls(factory, 0)
    expect(vi.mocked(factory)).toHaveBeenCalledOnce()
    expect(vi.mocked(factory).mock.calls[0][0]).toBeDefined()
  })
})

describe('retile edits keep _localMetrics in screen order', () => {
  test('should drop legacy duplicates when entering retile mode, so remove hits the tile that was picked', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.landscapeDashboardMetrics = ['distance', 'forceCurve', 'forceCurve', 'pace', 'power']
    dashboard._handleRetileModeChanged(new CustomEvent('retile-mode-changed', { detail: { active: true } }))
    expect(dashboard._localMetrics).toEqual(['distance', 'forceCurve', 'pace', 'power'])
    // 'pace' is the third tile on screen
    dashboard._removeMetric(2)
    expect(dashboard._localMetrics).toEqual(['distance', 'forceCurve', 'power'])
    vi.restoreAllMocks()
  })

  test('should pack the list when the force curve replaces a last-column tile', () => {
    const dashboard = createDashboard()
    dashboard._localMetrics = ['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk']
    dashboard._replaceMetricDirect(3, 'forceCurve')
    expect(dashboard._localMetrics).toEqual(['distance', 'timer', 'pace', 'stkRate', 'forceCurve', 'totalStk'])
  })
})

describe('rotating during retile mode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should save the edits of the orientation that is left, then load the new one', () => {
    const mql = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList)
    const dashboard = createDashboard()
    dashboard.appState.config.guiConfigs.portraitDashboardMetrics = ['timer', 'power']
    dashboard._isPortrait = false
    dashboard._retileMode = true
    dashboard._localMetrics = ['distance', 'pace']

    let received: CustomEvent | undefined
    dashboard.addEventListener('changeGuiSetting', (e) => { received = e as CustomEvent })

    dashboard._handleOrientationChange()

    expect(received!.detail).toEqual({ landscapeDashboardMetrics: ['distance', 'pace'] })
    expect(dashboard._isPortrait).toBe(true)
    expect(dashboard._localMetrics).toEqual(['timer', 'power'])
  })

  test('should not save anything when retile mode is off', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList)
    const dashboard = createDashboard()
    const listener = vi.fn()
    dashboard.addEventListener('changeGuiSetting', listener)
    dashboard._handleOrientationChange()
    expect(listener).not.toHaveBeenCalled()
  })
})
