'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Tests for SimulationArgs parsing
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { parseSimulationArgs } from './SimulationArgs.js'

test('defaults when no args are passed', () => {
  const result = parseSimulationArgs([])
  assert.is(result.simulate, false)
  assert.is(result.simulateFile, 'recordings/Concept2_RowErg_Session_2000meters.csv')
  assert.is(result.simulateDelay, 30000)
  assert.is(result.realtime, true)
  assert.is(result.loop, true)
})

test('--simulate enables simulation', () => {
  const result = parseSimulationArgs(['--simulate'])
  assert.is(result.simulate, true)
  assert.is(result.simulateFile, 'recordings/Concept2_RowErg_Session_2000meters.csv')
  assert.is(result.simulateDelay, 30000)
  assert.is(result.realtime, true)
  assert.is(result.loop, true)
})

test('--simulateFile overrides default file', () => {
  const result = parseSimulationArgs(['--simulate', '--simulateFile', 'recordings/WRX700_2magnets.csv'])
  assert.is(result.simulate, true)
  assert.is(result.simulateFile, 'recordings/WRX700_2magnets.csv')
})

test('--simulateDelay overrides default delay', () => {
  const result = parseSimulationArgs(['--simulate', '--simulateDelay', '5000'])
  assert.is(result.simulateDelay, 5000)
})

test('--simulateOnce disables looping', () => {
  const result = parseSimulationArgs(['--simulate', '--simulateOnce'])
  assert.is(result.loop, false)
  assert.is(result.realtime, true)
})

test('--simulateFast disables realtime', () => {
  const result = parseSimulationArgs(['--simulate', '--simulateFast'])
  assert.is(result.realtime, false)
  assert.is(result.loop, true)
})

test('all flags combined', () => {
  const result = parseSimulationArgs([
    '--simulate',
    '--simulateFile', 'recordings/RX800.csv',
    '--simulateDelay', '1000',
    '--simulateOnce',
    '--simulateFast'
  ])
  assert.is(result.simulate, true)
  assert.is(result.simulateFile, 'recordings/RX800.csv')
  assert.is(result.simulateDelay, 1000)
  assert.is(result.realtime, false)
  assert.is(result.loop, false)
})

test('non-numeric delay falls back to default', () => {
  const result = parseSimulationArgs(['--simulate', '--simulateDelay', 'abc'])
  assert.is(result.simulateDelay, 30000)
})

test('empty delay falls back to default', () => {
  const result = parseSimulationArgs(['--simulate', '--simulateDelay', ''])
  assert.is(result.simulateDelay, 30000)
})

test('negative delay falls back to default', () => {
  const result = parseSimulationArgs(['--simulate', '--simulateDelay', '-5000'])
  assert.is(result.simulateDelay, 30000)
})

test('unknown flags are ignored', () => {
  const result = parseSimulationArgs(['--simulate', '--unknownFlag'])
  assert.is(result.simulate, true)
  assert.is(result.simulateDelay, 30000)
})

test.run()
