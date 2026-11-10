/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

import { DASHBOARD_METRICS, layoutMetricsForGrid } from './dashboardMetrics'
import type { RowingMetrics, AppConfig } from './types'
import { APP_STATE } from './appState'

const defaultMetrics = APP_STATE.metrics as RowingMetrics
const defaultConfig = APP_STATE.config as AppConfig

describe('DASHBOARD_METRICS structure', () => {
  const expectedKeys = [
    'distance', 'pace', 'power', 'stkRate', 'heartRate', 'totalStk',
    'calories', 'timer', 'distancePerStk', 'dragFactor', 'driveLength',
    'driveDuration', 'recoveryDuration', 'forceCurve', 'peakForce', 'strokeRatio'
  ]

  test('should contain all expected metric keys', () => {
    expectedKeys.forEach((key) => {
      expect(DASHBOARD_METRICS[key]).toBeDefined()
    })
  })

  test('should define a displayName, size, and template for every metric', () => {
    Object.values(DASHBOARD_METRICS).forEach((metric) => {
      expect(metric.displayName).toBeTypeOf('string')
      expect(metric.size).toBeTypeOf('number')
      expect(metric.template).toBeTypeOf('function')
    })
  })

  test('should assign size 2 to the forceCurve metric', () => {
    expect(DASHBOARD_METRICS.forceCurve.size).toBe(2)
  })

  test('should assign size 1 to all metrics except forceCurve', () => {
    Object.entries(DASHBOARD_METRICS)
      .filter(([key]) => key !== 'forceCurve')
      .forEach(([, metric]) => {
        expect(metric.size).toBe(1)
      })
  })
})

describe('distance template', () => {
  test('should render with default metrics', () => {
    const result = DASHBOARD_METRICS.distance.template(defaultMetrics, defaultConfig)
    expect(result).toBeDefined()
  })

  test('should render correctly for a rest interval', () => {
    const metrics = { ...defaultMetrics, pauseCountdownTime: 30, interval: { ...defaultMetrics.interval, type: 'rest' } }
    const result = DASHBOARD_METRICS.distance.template(metrics, defaultConfig)
    expect(result).toBeDefined()
  })

  test('should render correctly for a distance interval', () => {
    const metrics = { ...defaultMetrics, interval: { ...defaultMetrics.interval, type: 'distance', distance: { fromStart: 500, toEnd: 1500 } } }
    const result = DASHBOARD_METRICS.distance.template(metrics, defaultConfig)
    expect(result).toBeDefined()
  })
})

describe('timer template', () => {
  test('should render with default metrics', () => {
    const result = DASHBOARD_METRICS.timer.template(defaultMetrics, defaultConfig)
    expect(result).toBeDefined()
  })

  test('should render correctly for a rest interval with a countdown', () => {
    const metrics = { ...defaultMetrics, pauseCountdownTime: 60, interval: { ...defaultMetrics.interval, type: 'rest' } }
    const result = DASHBOARD_METRICS.timer.template(metrics, defaultConfig)
    expect(result).toBeDefined()
  })

  test('should render correctly for a time interval', () => {
    const metrics = { ...defaultMetrics, interval: { ...defaultMetrics.interval, type: 'time', movingTime: { sinceStart: 120, toEnd: 480 } } }
    const result = DASHBOARD_METRICS.timer.template(metrics, defaultConfig)
    expect(result).toBeDefined()
  })
})

describe('calories template', () => {
  test('should render with default metrics', () => {
    const result = DASHBOARD_METRICS.calories.template(defaultMetrics, defaultConfig)
    expect(result).toBeDefined()
  })

  test('should render correctly for a calories interval', () => {
    const metrics = { ...defaultMetrics, interval: { ...defaultMetrics.interval, type: 'calories', calories: { sinceStart: 50, toEnd: 150 } } }
    const result = DASHBOARD_METRICS.calories.template(metrics, defaultConfig)
    expect(result).toBeDefined()
  })
})

describe('strokeRatio template', () => {
  test('should compute the ratio when both durations are present', () => {
    const metrics = { ...defaultMetrics, driveDuration: 1.0, recoveryDuration: 2.0 }
    const result = DASHBOARD_METRICS.strokeRatio.template(metrics)
    // The TemplateResult values array contains the interpolated values
    const values = result.values as unknown[]
    // simpleMetricFactory puts value as second arg, which is the first positional value
    expect(values).toContain('1:2.0')
  })

  test('should fall back to "--" when driveDuration is missing', () => {
    const metrics = { ...defaultMetrics, driveDuration: undefined, recoveryDuration: 2.0 }
    const result = DASHBOARD_METRICS.strokeRatio.template(metrics)
    const values = result.values as unknown[]
    expect(values).toContain('--')
  })

  test('should fall back to "--" when recoveryDuration is missing', () => {
    const metrics = { ...defaultMetrics, driveDuration: 1.0, recoveryDuration: undefined }
    const result = DASHBOARD_METRICS.strokeRatio.template(metrics)
    const values = result.values as unknown[]
    expect(values).toContain('--')
  })
})

describe('all templates', () => {
  Object.entries(DASHBOARD_METRICS).forEach(([key, metric]) => {
    test(`should render the ${key} template with default state`, () => {
      const result = metric.template(defaultMetrics, defaultConfig)
      expect(result).toBeDefined()
    })
  })
})

describe('layoutMetricsForGrid', () => {
  test('should drop duplicates and unknown keys', () => {
    const result = layoutMetricsForGrid(['distance', 'forceCurve', 'forceCurve', 'unknown', 'pace'], 4, 2)
    expect(result.metrics).toEqual(['distance', 'forceCurve', 'pace'])
    expect(result.usedCells).toBe(4)
  })

  test('should drop the force curve from a 1-column grid', () => {
    const result = layoutMetricsForGrid(['distance', 'forceCurve', 'pace'], 1, 4)
    expect(result.metrics).toEqual(['distance', 'pace'])
  })

  test('should move the next 1-slot tile in front of a force curve that would start in the last column', () => {
    const result = layoutMetricsForGrid(['distance', 'timer', 'pace', 'forceCurve', 'stkRate', 'totalStk'], 4, 2)
    expect(result.metrics).toEqual(['distance', 'timer', 'pace', 'stkRate', 'forceCurve', 'totalStk'])
    expect(result.usedCells).toBe(7)
  })

  test('should leave the hole and count it when there is no 1-slot tile to fill it', () => {
    const result = layoutMetricsForGrid(['distance', 'timer', 'pace', 'forceCurve'], 4, 2)
    expect(result.metrics).toEqual(['distance', 'timer', 'pace', 'forceCurve'])
    expect(result.usedCells).toBe(6)
  })

  test('should stop at the grid capacity and keep the order', () => {
    const result = layoutMetricsForGrid(['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk', 'calories'], 3, 2)
    expect(result.metrics).toEqual(['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk'])
    expect(result.usedCells).toBe(6)
  })

  test('should drop a force curve that only fits by wrapping past the last row', () => {
    const result = layoutMetricsForGrid(['distance', 'timer', 'pace', 'forceCurve'], 2, 2)
    expect(result.metrics).toEqual(['distance', 'timer', 'pace'])
    expect(result.usedCells).toBe(3)
  })

  test('should leave a list that already fits unchanged', () => {
    const metrics = ['distance', 'timer', 'pace', 'power', 'stkRate', 'totalStk', 'calories']
    expect(layoutMetricsForGrid(metrics, 4, 2).metrics).toEqual(metrics)
  })

  test('should return the same layout when applied twice', () => {
    const once = layoutMetricsForGrid(['distance', 'timer', 'pace', 'forceCurve', 'stkRate'], 4, 2).metrics
    expect(layoutMetricsForGrid(once, 4, 2).metrics).toEqual(once)
  })
})
