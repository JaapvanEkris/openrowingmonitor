/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe, vi, afterEach } from 'vitest'

// The class is exported as DashboardActions (naming bug in source)
import { DashboardActions as SettingsDialog } from './SettingsDialog'

function mockMatchMedia (isPortrait: boolean) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: isPortrait,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  } as unknown as MediaQueryList)
}

function createSettingsDialog (): SettingsDialog {
  const dialog = new SettingsDialog()
  dialog.config = {
    landscapeDashboardMetrics: [],
    portraitDashboardMetrics: [],
    showIcons: true,
    trueBlackTheme: false,
    forceCurveDivisionMode: 0,
    gridConfig: {
      landscape: { columns: 4, rows: 2 },
      portrait: { columns: 2, rows: 4 }
    }
  }
  return dialog
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('grid sliders', () => {
  test('should initialise _columns and _rows from landscape config when in landscape', () => {
    mockMatchMedia(false)
    const dialog = createSettingsDialog()
    dialog._columns = 4
    dialog._rows = 2
    expect(dialog._columns).toBe(4)
    expect(dialog._rows).toBe(2)
  })

  test('should initialise _columns and _rows from portrait config when in portrait', () => {
    mockMatchMedia(true)
    const dialog = createSettingsDialog()
    dialog._columns = 2
    dialog._rows = 4
    expect(dialog._columns).toBe(2)
    expect(dialog._rows).toBe(4)
  })

  test('should swap _columns and _rows and update _isPortrait on orientation change', () => {
    const dialog = createSettingsDialog()
    dialog._columns = 4
    dialog._rows = 2
    dialog._isPortrait = false

    const event = new Event('change') as unknown as MediaQueryListEvent
    Object.defineProperty(event, 'matches', { value: true })
    dialog._handleOrientationChange(event)

    expect(dialog._columns).toBe(2)
    expect(dialog._rows).toBe(4)
    expect(dialog._isPortrait).toBe(true)
  })
})

describe('close', () => {
  test('should save landscape and transposed portrait when confirmed in landscape', () => {
    mockMatchMedia(false)
    const dialog = createSettingsDialog()
    dialog._isPortrait = false
    dialog._columns = 3
    dialog._rows = 5
    dialog._showIcons = false
    dialog._trueBlackTheme = true

    let received: CustomEvent | undefined
    dialog.addEventListener('changeGuiSetting', (e) => { received = e as CustomEvent })

    dialog.close(new CustomEvent('close', { detail: 'confirm' }))

    expect(received!.detail).toEqual({
      gridConfig: {
        landscape: { columns: 3, rows: 5 },
        portrait: { columns: 5, rows: 3 }
      },
      showIcons: false,
      trueBlackTheme: true
    })
  })

  test('should save portrait and transposed landscape when confirmed in portrait', () => {
    mockMatchMedia(true)
    const dialog = createSettingsDialog()
    dialog._isPortrait = true
    dialog._columns = 2
    dialog._rows = 4
    dialog._showIcons = true
    dialog._trueBlackTheme = false

    let received: CustomEvent | undefined
    dialog.addEventListener('changeGuiSetting', (e) => { received = e as CustomEvent })

    dialog.close(new CustomEvent('close', { detail: 'confirm' }))

    expect(received!.detail).toEqual({
      gridConfig: {
        landscape: { columns: 4, rows: 2 },
        portrait: { columns: 2, rows: 4 }
      },
      showIcons: true,
      trueBlackTheme: false
    })
  })

  test('should not dispatch changeGuiSetting when cancelled', () => {
    mockMatchMedia(false)
    const dialog = createSettingsDialog()
    let received: CustomEvent | undefined
    dialog.addEventListener('changeGuiSetting', (e) => { received = e as CustomEvent })

    dialog.close(new CustomEvent('close', { detail: 'cancel' }))

    expect(received).toBeUndefined()
  })
})

describe('toggleIcons', () => {
  test('should set _showIcons to the checkbox checked state', () => {
    const dialog = createSettingsDialog()
    dialog._showIcons = true
    const event = new Event('change')
    Object.defineProperty(event, 'target', { value: { checked: false } })
    dialog.toggleIcons(event)
    expect(dialog._showIcons).toBe(false)
  })
})

describe('toggleTrueBlackTheme', () => {
  test('should set _trueBlackTheme to the checkbox checked state', () => {
    const dialog = createSettingsDialog()
    dialog._trueBlackTheme = false
    const event = new Event('change')
    Object.defineProperty(event, 'target', { value: { checked: true } })
    dialog.toggleTrueBlackTheme(event)
    expect(dialog._trueBlackTheme).toBe(true)
  })
})

describe('render', () => {
  test('should show landscape in legend when _isPortrait is false', () => {
    const dialog = createSettingsDialog()
    dialog._isPortrait = false
    const result = dialog.render()
    expect(result.values[3]).toBe('landscape')
  })

  test('should show portrait in legend when _isPortrait is true', () => {
    const dialog = createSettingsDialog()
    dialog._isPortrait = true
    const result = dialog.render()
    expect(result.values[3]).toBe('portrait')
  })

  test('should set columns max to 8 and rows max to 4 in landscape', () => {
    const dialog = createSettingsDialog()
    dialog._isPortrait = false
    const result = dialog.render()
    expect(result.values[5]).toBe('8')
    expect(result.values[9]).toBe('4')
  })

  test('should set columns max to 4 and rows max to 8 in portrait', () => {
    const dialog = createSettingsDialog()
    dialog._isPortrait = true
    const result = dialog.render()
    expect(result.values[5]).toBe('4')
    expect(result.values[9]).toBe('8')
  })
})

describe('orientation change listener', () => {
  test('should register orientation change listener in connectedCallback', () => {
    mockMatchMedia(false)
    const dialog = createSettingsDialog()
    const mqList = window.matchMedia('(orientation: portrait)')
    dialog.connectedCallback()
    expect(mqList.addEventListener).toHaveBeenCalledWith('change', dialog._handleOrientationChange)
  })

  test('should remove orientation change listener in disconnectedCallback', () => {
    mockMatchMedia(false)
    const dialog = createSettingsDialog()
    dialog.connectedCallback()
    const mqList = window.matchMedia('(orientation: portrait)')
    dialog.disconnectedCallback()
    expect(mqList.removeEventListener).toHaveBeenCalledWith('change', dialog._handleOrientationChange)
  })
})
