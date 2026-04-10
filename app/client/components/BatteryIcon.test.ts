/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

// The class is exported as DashboardMetric (naming bug in source)
import { DashboardMetric as BatteryIcon } from './BatteryIcon'

describe('battery width calculation', () => {
  test('should compute batteryWidth as batteryLevel * 416 / 100', () => {
    const el = new BatteryIcon()
    el.batteryLevel = 50
    // batteryWidth = 50 * 416 / 100 = 208
    // We verify by checking the rendered SVG contains the computed width
    // Trigger a render manually via the render method
    const result = (el as any).render()
    // The render returns a TemplateResult; we check the values array contains 208
    expect(result.values).toContain(208)
  })

  test('should compute batteryWidth as 0 when batteryLevel is 0', () => {
    const el = new BatteryIcon()
    el.batteryLevel = 0
    const result = (el as any).render()
    expect(result.values).toContain(0)
  })

  test('should compute batteryWidth as 416 when batteryLevel is 100', () => {
    const el = new BatteryIcon()
    el.batteryLevel = 100
    const result = (el as any).render()
    expect(result.values).toContain(416)
  })
})

describe('icon CSS class', () => {
  test('should include low-battery when level is 25 or less', () => {
    const el = new BatteryIcon()
    el.batteryLevel = 25
    const result = (el as any).render()
    expect(result.values).toContain('icon low-battery')
  })

  test('should not include low-battery when level is above 25', () => {
    const el = new BatteryIcon()
    el.batteryLevel = 26
    const result = (el as any).render()
    expect(result.values).toContain('icon')
    expect(result.values).not.toContain('icon low-battery')
  })
})
