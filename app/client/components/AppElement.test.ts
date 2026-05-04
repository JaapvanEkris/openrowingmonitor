/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe } from 'vitest'

import { AppElement } from './AppElement'
import { customElement } from 'lit/decorators.js'

// AppElement has no @customElement decorator, so we register a test subclass
@customElement('test-app-element')
class TestAppElement extends AppElement {}

describe('sendEvent', () => {
  test('should dispatch a CustomEvent with the correct type and detail', () => {
    const el = new TestAppElement()
    let received: CustomEvent | undefined
    el.addEventListener('testEvent', (e) => { received = e as CustomEvent })

    el.sendEvent('testEvent', { foo: 'bar' })

    expect(received).toBeDefined()
    expect(received!.detail).toEqual({ foo: 'bar' })
  })

  test('should set bubbles and composed to true', () => {
    const el = new TestAppElement()
    let received: CustomEvent | undefined
    el.addEventListener('testEvent', (e) => { received = e as CustomEvent })

    el.sendEvent('testEvent', null)

    expect(received!.bubbles).toBe(true)
    expect(received!.composed).toBe(true)
  })
})
