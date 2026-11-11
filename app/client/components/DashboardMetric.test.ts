/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

import { DashboardMetric } from './DashboardMetric'

describe('value display', () => {
  test('should fall back to "--" when value is undefined', () => {
    const el = new DashboardMetric()
    el.value = undefined
    const result = (el as any).render()
    // The template contains: ${this.value !== undefined ? this.value : '--'}
    expect(result.values).toContain('--')
  })

  test('should display the value when it is defined', () => {
    const el = new DashboardMetric()
    el.value = '42'
    const result = (el as any).render()
    expect(result.values).toContain('42')
  })
})

describe('icon rendering', () => {
  test('should use label class when no icon is provided', () => {
    const el = new DashboardMetric()
    el.icon = ''
    const result = (el as any).render()
    // When icon is '', hasIcon is false, so the div class is 'label'
    expect(result.values).toContain('label')
  })

  test('should use icon class when an icon is provided', () => {
    const el = new DashboardMetric()
    el.icon = 'some-icon'
    const result = (el as any).render()
    // When icon is not '', hasIcon is true, so the div class is 'icon'
    expect(result.values).toContain('icon')
    // metric-value gets 'with-icon' added via template interpolation
    expect(result.values).toContain('with-icon')
  })
})
