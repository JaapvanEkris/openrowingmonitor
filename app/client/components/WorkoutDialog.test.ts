/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

import { WorkoutDialog } from './WorkoutDialog'

function createDialog (type = 'distance'): WorkoutDialog {
  const dialog = new WorkoutDialog()
  dialog.type = type
  return dialog
}

describe('render', () => {
  test('should render with distance config by default', () => {
    const dialog = createDialog('distance')
    const result = (dialog as any).render()
    expect(result.values).toContain('Set Distance')
  })

  test('should render with time config', () => {
    const dialog = createDialog('time')
    const result = (dialog as any).render()
    expect(result.values).toContain('Set Time')
  })

  test('should render with calories config', () => {
    const dialog = createDialog('calories')
    const result = (dialog as any).render()
    expect(result.values).toContain('Set Calories')
  })

  test('should display "0" when total is 0', () => {
    const dialog = createDialog()
    const result = (dialog as any).render()
    expect(result.values).toContain('0')
  })

  test('should set isValid to false when total is 0', () => {
    const dialog = createDialog()
    const result = (dialog as any).render()
    expect(result.values).toContain(false)
  })

  test('should set isValid to true when total is greater than 0', () => {
    const dialog = createDialog()
    dialog._total = 500
    const result = (dialog as any).render()
    expect(result.values).toContain(true)
  })

  test('should return a template for unknown workout type', () => {
    const dialog = createDialog('unknown')
    const result = (dialog as any).render()
    expect(result).toBeDefined()
  })
})

describe('_increment', () => {
  test('should increase total by the given value', () => {
    const dialog = createDialog()
    dialog._increment(500)
    expect(dialog._total).toBe(500)
  })

  test('should accumulate multiple increments', () => {
    const dialog = createDialog()
    dialog._increment(100)
    dialog._increment(500)
    dialog._increment(1000)
    expect(dialog._total).toBe(1600)
  })
})

describe('_reset', () => {
  test('should set total back to 0', () => {
    const dialog = createDialog()
    dialog._increment(500)
    dialog._reset()
    expect(dialog._total).toBe(0)
  })
})

describe('_onClose', () => {
  test('should dispatch triggerAction with distance plan on confirm', () => {
    const dialog = createDialog('distance')
    dialog._total = 2000
    const events: CustomEvent[] = []
    dialog.addEventListener('triggerAction', (e) => { events.push(e as CustomEvent) })

    dialog._onClose(new CustomEvent('close', { detail: 'confirm' }))

    expect(events.length).toBe(1)
    expect(events[0].detail).toEqual({
      command: 'updateIntervalSettings',
      data: [{ type: 'distance', targetDistance: '2000', targetTime: '0' }]
    })
  })

  test('should dispatch triggerAction with time plan on confirm', () => {
    const dialog = createDialog('time')
    dialog._total = 600
    const events: CustomEvent[] = []
    dialog.addEventListener('triggerAction', (e) => { events.push(e as CustomEvent) })

    dialog._onClose(new CustomEvent('close', { detail: 'confirm' }))

    expect(events.length).toBe(1)
    expect(events[0].detail).toEqual({
      command: 'updateIntervalSettings',
      data: [{ type: 'time', targetDistance: '0', targetTime: '600' }]
    })
  })

  test('should dispatch triggerAction with calories plan on confirm', () => {
    const dialog = createDialog('calories')
    dialog._total = 500
    const events: CustomEvent[] = []
    dialog.addEventListener('triggerAction', (e) => { events.push(e as CustomEvent) })

    dialog._onClose(new CustomEvent('close', { detail: 'confirm' }))

    expect(events.length).toBe(1)
    expect(events[0].detail).toEqual({
      command: 'updateIntervalSettings',
      data: [{ type: 'calories', targetCalories: '500' }]
    })
  })

  test('should not dispatch triggerAction when total is 0', () => {
    const dialog = createDialog('distance')
    dialog._total = 0
    const events: CustomEvent[] = []
    dialog.addEventListener('triggerAction', (e) => { events.push(e as CustomEvent) })

    dialog._onClose(new CustomEvent('close', { detail: 'confirm' }))

    expect(events.length).toBe(0)
  })

  test('should not dispatch triggerAction on cancel', () => {
    const dialog = createDialog('distance')
    dialog._total = 2000
    const events: CustomEvent[] = []
    dialog.addEventListener('triggerAction', (e) => { events.push(e as CustomEvent) })

    dialog._onClose(new CustomEvent('close', { detail: 'cancel' }))

    expect(events.length).toBe(0)
  })

  test('should always dispatch close event to parent', () => {
    const dialog = createDialog()
    dialog._total = 2000
    const closeEvents: Event[] = []
    dialog.addEventListener('close', (e) => { closeEvents.push(e) })

    dialog._onClose(new CustomEvent('close', { detail: 'cancel' }))

    expect(closeEvents.length).toBe(1)
  })

  test('should dispatch close event on confirm so dialog can be reopened', () => {
    const dialog = createDialog()
    dialog._total = 2000
    const closeEvents: Event[] = []
    dialog.addEventListener('close', (e) => { closeEvents.push(e) })

    dialog._onClose(new CustomEvent('close', { detail: 'confirm' }))

    expect(closeEvents.length).toBe(1)
  })
})
