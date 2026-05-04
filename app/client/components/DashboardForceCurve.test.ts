/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

import { DashboardForceCurve } from './DashboardForceCurve'

function createForceCurve (): DashboardForceCurve {
  const el = new DashboardForceCurve()
  return el
}

describe('_handleClick', () => {
  test('should cycle division modes in order: 0 → 2 → 3 → 0', () => {
    const el = createForceCurve()
    const received: unknown[] = []
    el.addEventListener('changeGuiSetting', (e) => {
      received.push((e as CustomEvent).detail)
    })

    el.divisionMode = 0
    el._handleClick()

    el.divisionMode = 2
    el._handleClick()

    el.divisionMode = 3
    el._handleClick()

    expect(received).toEqual([
      { forceCurveDivisionMode: 2 },
      { forceCurveDivisionMode: 3 },
      { forceCurveDivisionMode: 0 }
    ])
  })
})

describe('_updateDivisionLines', () => {
  test('should compute correct positions for 2-way division', () => {
    const el = createForceCurve()
    el.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    el.divisionMode = 2
    // Mock chart with plugins
    el._chart = {
      options: { plugins: { divisionLines: { positions: [] } } }
    } as any

    el._updateDivisionLines()

    // @ts-ignore
    expect(el._chart!.options!.plugins!.divisionLines.positions).toEqual([5])
  })

  test('should compute correct positions for 3-way division', () => {
    const el = createForceCurve()
    el.value = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    el.divisionMode = 3
    el._chart = {
      options: { plugins: { divisionLines: { positions: [] } } }
    } as any

    el._updateDivisionLines()

    // @ts-ignore
    expect(el._chart!.options!.plugins!.divisionLines.positions).toEqual([3, 6])
  })

  test('should return an empty array for mode 0', () => {
    const el = createForceCurve()
    el.value = [1, 2, 3, 4, 5]
    el.divisionMode = 0
    el._chart = {
      options: { plugins: { divisionLines: { positions: [] } } }
    } as any

    el._updateDivisionLines()

    // @ts-ignore
    expect(el._chart!.options!.plugins!.divisionLines.positions).toEqual([])
  })
})

describe('shouldUpdate', () => {
  test('should return true when updateForceCurve is true', () => {
    const el = createForceCurve()
    el.updateForceCurve = true
    const changedProperties = new Map()

    expect(el.shouldUpdate(changedProperties)).toBe(true)
  })

  test('should return true when divisionMode has changed', () => {
    const el = createForceCurve()
    el.updateForceCurve = false
    el._chart = {} as any // chart exists, so that condition is false
    const changedProperties = new Map([['divisionMode', 0]])

    expect(el.shouldUpdate(changedProperties)).toBe(true)
  })

  test('should return false when nothing relevant has changed and chart exists', () => {
    const el = createForceCurve()
    el.updateForceCurve = false
    el._chart = {} as any
    const changedProperties = new Map()

    expect(el.shouldUpdate(changedProperties)).toBe(false)
  })
})
