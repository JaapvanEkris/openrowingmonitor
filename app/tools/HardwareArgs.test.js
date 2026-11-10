'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Tests for HardwareArgs parsing
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { parseHardwareArgs } from './HardwareArgs.js'

test('hardware is enabled when no args or env are passed', () => {
  assert.is(parseHardwareArgs([], {}).simulateWithoutHardware, false)
})

test('--no-hardware disables hardware', () => {
  assert.is(parseHardwareArgs(['--no-hardware'], {}).simulateWithoutHardware, true)
})

test('ORM_NO_HARDWARE=1 disables hardware', () => {
  assert.is(parseHardwareArgs([], { ORM_NO_HARDWARE: '1' }).simulateWithoutHardware, true)
})

test('ORM_NO_HARDWARE with another value leaves hardware enabled', () => {
  assert.is(parseHardwareArgs([], { ORM_NO_HARDWARE: '0' }).simulateWithoutHardware, false)
})

test('--no-hardware combines with simulation flags', () => {
  assert.is(parseHardwareArgs(['--simulate', '--simulateFile', 'recordings/WRX700_2magnets.csv', '--no-hardware'], {}).simulateWithoutHardware, true)
})

test('unrelated flags leave hardware enabled', () => {
  assert.is(parseHardwareArgs(['--simulate', '--unknownFlag'], {}).simulateWithoutHardware, false)
})

test.run()
