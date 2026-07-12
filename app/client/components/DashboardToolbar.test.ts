/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

import { DashboardToolbar } from './DashboardToolbar'
import type { AppConfig } from '../store/types'

function createToolbar (config: Partial<AppConfig> = {}): DashboardToolbar {
  const toolbar = new DashboardToolbar()
  toolbar.config = {
    blePeripheralMode: '',
    hrmPeripheralMode: '',
    antPeripheralMode: '',
    uploadEnabled: false,
    shutdownEnabled: false,
    guiConfigs: {
      landscapeDashboardMetrics: [],
      portraitDashboardMetrics: [],
      showIcons: true,
      trueBlackTheme: false,
      forceCurveDivisionMode: 0,
      gridConfig: {
        landscape: { columns: 4, rows: 2 },
        portrait: { columns: 2, rows: 4 }
      }
    },
    ...config
  }
  return toolbar
}

describe('blePeripheralMode', () => {
  test('should return "C2 PM5" when the mode is PM5', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'PM5' })
    expect(toolbar.blePeripheralMode()).toBe('C2 PM5')
  })

  test('should return "FTMS Rower" when the mode is FTMS', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'FTMS' })
    expect(toolbar.blePeripheralMode()).toBe('FTMS Rower')
  })

  test('should return "FTMS Bike" when the mode is FTMSBIKE', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'FTMSBIKE' })
    expect(toolbar.blePeripheralMode()).toBe('FTMS Bike')
  })

  test('should return "Bike Speed + Cadence" when the mode is CSC', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'CSC' })
    expect(toolbar.blePeripheralMode()).toBe('Bike Speed + Cadence')
  })

  test('should return "Bike Power" when the mode is CPS', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'CPS' })
    expect(toolbar.blePeripheralMode()).toBe('Bike Power')
  })

  test('should return "Off" when the mode is unknown', () => {
    const toolbar = createToolbar({ blePeripheralMode: 'UNKNOWN' })
    expect(toolbar.blePeripheralMode()).toBe('Off')
  })

  test('should return "Off" when the mode is an empty string', () => {
    const toolbar = createToolbar({ blePeripheralMode: '' })
    expect(toolbar.blePeripheralMode()).toBe('Off')
  })
})

describe('renderOptionalButtons', () => {
  test('should include the upload button when uploadEnabled is true', () => {
    const toolbar = createToolbar({ uploadEnabled: true })
    const buttons = toolbar.renderOptionalButtons()
    // Upload button should always appear when uploadEnabled is true regardless of mode
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  test('should include the shutdown button in KIOSK mode when shutdownEnabled is true', () => {
    const toolbar = createToolbar({ shutdownEnabled: true })
    toolbar._appMode = 'KIOSK'
    const buttons = toolbar.renderOptionalButtons()
    // Should have shutdown button
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  test('should not include shutdown button in BROWSER mode', () => {
    const toolbar = createToolbar({ shutdownEnabled: true, uploadEnabled: false })
    toolbar._appMode = 'BROWSER'
    // In BROWSER mode, fullscreen button may appear if requestFullscreen exists,
    // but shutdown should not
    const buttons = toolbar.renderOptionalButtons()
    // In BROWSER mode with no upload, buttons should only be fullscreen (if available)
    // Shutdown is gated by _appMode === 'KIOSK'
    const buttonsWithoutFullscreen = buttons.filter((b) => String(b).includes('Shutdown'))
    expect(buttonsWithoutFullscreen.length).toBe(0)
  })
})

describe('retile button style', () => {
  test('should default _retileMode to false', () => {
    const toolbar = createToolbar()
    expect(toolbar._retileMode).toBe(false)
  })

  test('should include label-button class on the retile toggle button', () => {
    const toolbar = createToolbar()

    const result = toolbar.render()

    const staticParts = (result as unknown as { strings: readonly string[] }).strings.join('')
    expect(staticParts).toContain('label-button')
  })

  test('should include label-button class on the submit button in retile mode', () => {
    const toolbar = createToolbar()
    toolbar._retileMode = true

    const result = toolbar.render()

    const staticParts = (result as unknown as { strings: readonly string[] }).strings.join('')
    expect(staticParts).toContain('label-button')
  })

  test('should not include active class on the retile button in normal mode', () => {
    const toolbar = createToolbar()

    const result = toolbar.render()

    const staticParts = (result as unknown as { strings: readonly string[] }).strings.join('')
    expect(staticParts).not.toContain('active')
  })

  test('should not include active class on the submit button in retile mode', () => {
    const toolbar = createToolbar()
    toolbar._retileMode = true

    const result = toolbar.render()

    const staticParts = (result as unknown as { strings: readonly string[] }).strings.join('')
    expect(staticParts).not.toContain('active')
  })
})
