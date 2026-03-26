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
  test('should use empty class strings when no icon is provided', () => {
    const el = new DashboardMetric()
    el.icon = ''
    const result = (el as any).render()
    // When icon is '', the class is '' and font-size style is 200%
    expect(result.values).toContain('font-size: 200%;')
  })

  test('should use label/icon classes when an icon is provided', () => {
    const el = new DashboardMetric()
    el.icon = 'some-icon'
    const result = (el as any).render()
    expect(result.values).toContain('label')
    expect(result.values).toContain('icon')
    // When icon is not '', there's no inline font-size override
    expect(result.values).not.toContain('font-size: 200%;')
  })
})
