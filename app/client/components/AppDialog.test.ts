/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe, vi } from 'vitest'

import { AppDialog } from './AppDialog'

describe('confirm', () => {
  test('should close the dialog with "confirm" when isValid is true', () => {
    const dialog = new AppDialog()
    dialog.isValid = true
    const closeFn = vi.fn()
    dialog.dialog = { value: { close: closeFn } } as any

    dialog.confirm()

    expect(closeFn).toHaveBeenCalledWith('confirm')
  })

  test('should not close the dialog when isValid is false', () => {
    const dialog = new AppDialog()
    dialog.isValid = false
    const closeFn = vi.fn()
    dialog.dialog = { value: { close: closeFn } } as any

    dialog.confirm()

    expect(closeFn).not.toHaveBeenCalled()
  })
})

describe('close', () => {
  test('should dispatch a CustomEvent with detail "cancel" when not confirmed', () => {
    const dialog = new AppDialog()
    let received: CustomEvent | undefined
    dialog.addEventListener('close', (e) => { received = e as CustomEvent })

    dialog.close({ target: { returnValue: 'cancel' } } as any)

    expect(received!.detail).toBe('cancel')
  })

  test('should dispatch a CustomEvent with detail "confirm" when confirmed', () => {
    const dialog = new AppDialog()
    let received: CustomEvent | undefined
    dialog.addEventListener('close', (e) => { received = e as CustomEvent })

    dialog.close({ target: { returnValue: 'confirm' } } as any)

    expect(received!.detail).toBe('confirm')
  })
})
