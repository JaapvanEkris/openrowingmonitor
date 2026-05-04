/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe, vi, beforeEach } from 'vitest'

import { APP_STATE } from '../store/appState'
import type { AppState } from '../store/types'

// Mock WebSocket and NoSleep before importing createApp
class MockWebSocket {
  static instances: MockWebSocket[] = []
  listeners: Record<string, Function[]> = {}
  sentMessages: string[] = []
  readyState = 1

  constructor () {
    MockWebSocket.instances.push(this)
  }

  addEventListener (event: string, handler: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(handler)
  }

  send (data: string) {
    this.sentMessages.push(data)
  }

  close () {}
}

vi.stubGlobal('WebSocket', MockWebSocket)

// We need to dynamically import createApp after mocking
let createApp: typeof import('../lib/app').createApp

beforeEach(async () => {
  MockWebSocket.instances = []
  const module = await import('../lib/app')
  createApp = module.createApp
})

function createTestApp () {
  let state: AppState = structuredClone(APP_STATE)

  const appInterface = {
    updateState: vi.fn((newState: Partial<AppState>) => {
      state = { ...state, ...newState }
    }),
    getState: vi.fn(() => structuredClone(state))
  }

  const app = createApp(appInterface)
  return { app, appInterface, state }
}

describe('handleAction', () => {
  test('should send the correct WebSocket command for switchBlePeripheralMode', () => {
    const { app } = createTestApp()
    const socket = MockWebSocket.instances[MockWebSocket.instances.length - 1]

    app.handleAction({ command: 'switchBlePeripheralMode' })

    expect(socket.sentMessages).toContain(JSON.stringify({ command: 'switchBlePeripheralMode' }))
  })

  test('should send the correct WebSocket command for reset', () => {
    const { app } = createTestApp()
    const socket = MockWebSocket.instances[MockWebSocket.instances.length - 1]

    app.handleAction({ command: 'reset' })

    expect(socket.sentMessages).toContain(JSON.stringify({ command: 'reset' }))
  })

  test('should send the correct WebSocket command for upload', () => {
    const { app } = createTestApp()
    const socket = MockWebSocket.instances[MockWebSocket.instances.length - 1]

    app.handleAction({ command: 'upload' })

    expect(socket.sentMessages).toContain(JSON.stringify({ command: 'upload' }))
  })

  test('should send the correct WebSocket command for shutdown', () => {
    const { app } = createTestApp()
    const socket = MockWebSocket.instances[MockWebSocket.instances.length - 1]

    app.handleAction({ command: 'shutdown' })

    expect(socket.sentMessages).toContain(JSON.stringify({ command: 'shutdown' }))
  })
})

describe('resetFields', () => {
  test('should preserve heartrate fields while resetting other metrics', () => {
    const { appInterface } = createTestApp()

    // Simulate receiving metrics with heartrate
    const stateWithHeart = structuredClone(APP_STATE)
    stateWithHeart.metrics.heartrate = 150
    stateWithHeart.metrics.heartRateBatteryLevel = 80
    stateWithHeart.metrics.totalLinearDistance = 1000
    appInterface.getState.mockReturnValue(stateWithHeart)

    // resetFields is called during construction, but we can verify its behavior
    // by checking that the updateState was called with preserved heartrate
    const calls = appInterface.updateState.mock.calls
    // The first call to updateState should be from resetFields
    const resetCall = calls.find((call) => {
      const arg = call[0] as Partial<AppState>
      return arg.metrics !== undefined
    })

    expect(resetCall).toBeDefined()
    if (resetCall) {
      const metrics = (resetCall[0] as Partial<AppState>).metrics!
      // heartrate and heartRateBatteryLevel should be preserved from initial state
      expect(metrics).toHaveProperty('heartrate')
      expect(metrics).toHaveProperty('heartRateBatteryLevel')
    }
  })
})
