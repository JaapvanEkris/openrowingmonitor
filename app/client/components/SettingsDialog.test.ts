/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

// The class is exported as DashboardActions (naming bug in source)
import { DashboardActions as SettingsDialog } from './SettingsDialog'

function createSettingsDialog (): SettingsDialog {
  const dialog = new SettingsDialog()
  dialog.config = {
    dashboardMetrics: [],
    showIcons: true,
    maxNumberOfTiles: 8,
    trueBlackTheme: false,
    forceCurveDivisionMode: 0
  }
  return dialog
}

describe('isFormValid', () => {
  test('should return true when slot count equals maxNumberOfTiles and no adjacent duplicates', () => {
    const dialog = createSettingsDialog()
    dialog._maxNumberOfTiles = 8
    dialog._sumSelectedSlots = 8
    dialog._selectedMetrics = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

    expect(dialog.isFormValid()).toBe(true)
  })

  test('should return false when slot count does not equal maxNumberOfTiles', () => {
    const dialog = createSettingsDialog()
    dialog._maxNumberOfTiles = 8
    dialog._sumSelectedSlots = 6
    dialog._selectedMetrics = ['a', 'b', 'c', 'd', 'e', 'f']

    expect(dialog.isFormValid()).toBe(false)
  })

  test('should return false when metrics at positions 3 and 4 are identical', () => {
    const dialog = createSettingsDialog()
    dialog._maxNumberOfTiles = 8
    dialog._sumSelectedSlots = 8
    dialog._selectedMetrics = ['a', 'b', 'c', 'same', 'same', 'f', 'g', 'h']

    expect(dialog.isFormValid()).toBe(false)
  })

  test('should return false when metrics at positions 7 and 8 are identical', () => {
    const dialog = createSettingsDialog()
    dialog._maxNumberOfTiles = 12
    dialog._sumSelectedSlots = 12
    dialog._selectedMetrics = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'same', 'same', 'j', 'k', 'l']

    expect(dialog.isFormValid()).toBe(false)
  })

  test('should return true for 12 tiles with no adjacent duplicates at row boundaries', () => {
    const dialog = createSettingsDialog()
    dialog._maxNumberOfTiles = 12
    dialog._sumSelectedSlots = 12
    dialog._selectedMetrics = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']

    expect(dialog.isFormValid()).toBe(true)
  })
})

describe('close', () => {
  test('should dispatch changeGuiSetting with selected settings when confirmed', () => {
    const dialog = createSettingsDialog()
    dialog._selectedMetrics = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    dialog._showIcons = false
    dialog._maxNumberOfTiles = 8
    dialog._trueBlackTheme = true

    let received: CustomEvent | undefined
    dialog.addEventListener('changeGuiSetting', (e) => { received = e as CustomEvent })

    dialog.close(new CustomEvent('close', { detail: 'confirm' }))

    expect(received).toBeDefined()
    expect(received!.detail).toEqual({
      dashboardMetrics: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      showIcons: false,
      maxNumberOfTiles: 8,
      trueBlackTheme: true
    })
  })

  test('should not dispatch changeGuiSetting when cancelled', () => {
    const dialog = createSettingsDialog()
    let received: CustomEvent | undefined
    dialog.addEventListener('changeGuiSetting', (e) => { received = e as CustomEvent })

    dialog.close(new CustomEvent('close', { detail: 'cancel' }))

    expect(received).toBeUndefined()
  })
})
