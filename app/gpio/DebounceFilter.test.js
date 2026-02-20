'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Test suite for the DebounceFilter module. Tests the software debouncing
  logic that filters hardware bounce from magnetic flywheel sensors.
*/
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createDebounceFilter } from './DebounceFilter.js'

test('DebounceFilter initializes with empty buffer', () => {
  const filter = createDebounceFilter()
  assert.is(filter.getBufferCount(), 0)
  assert.is(filter.getBufferSize(), 5)
  assert.equal(filter.getBuffer(), [])
})

test('DebounceFilter accepts first 5 deltas (buffer filling phase)', () => {
  const filter = createDebounceFilter()

  const result1 = filter.processDelta(0.010)
  assert.ok(result1.valid, 'First delta should be valid')
  assert.is(filter.getBufferCount(), 1)

  const result2 = filter.processDelta(0.011)
  assert.ok(result2.valid, 'Second delta should be valid')
  assert.is(filter.getBufferCount(), 2)

  const result3 = filter.processDelta(0.012)
  assert.ok(result3.valid, 'Third delta should be valid')
  assert.is(filter.getBufferCount(), 3)

  const result4 = filter.processDelta(0.013)
  assert.ok(result4.valid, 'Fourth delta should be valid')
  assert.is(filter.getBufferCount(), 4)

  const result5 = filter.processDelta(0.014)
  assert.ok(result5.valid, 'Fifth delta should be valid')
  assert.is(filter.getBufferCount(), 5)
})

test('DebounceFilter rejects 0.5ms bounce when buffer is full', () => {
  const filter = createDebounceFilter()

  filter.processDelta(0.010)
  filter.processDelta(0.011)
  filter.processDelta(0.012)
  filter.processDelta(0.013)
  filter.processDelta(0.014)

  const bounceResult = filter.processDelta(0.0005)
  assert.not.ok(bounceResult.valid, '0.5ms bounce should be rejected')
  assert.is(filter.getBufferCount(), 5, 'Buffer count should remain at 5')
})

test('DebounceFilter rejects delta below absolute minimum threshold', () => {
  const filter = createDebounceFilter()

  filter.processDelta(0.010)
  filter.processDelta(0.011)
  filter.processDelta(0.012)
  filter.processDelta(0.013)
  filter.processDelta(0.014)

  const result = filter.processDelta(0.0008)
  assert.not.ok(result.valid, 'Delta below 1ms should be rejected')
})

test('DebounceFilter accepts valid delta when buffer is full', () => {
  const filter = createDebounceFilter()

  filter.processDelta(0.010)
  filter.processDelta(0.011)
  filter.processDelta(0.012)
  filter.processDelta(0.013)
  filter.processDelta(0.014)

  const validResult = filter.processDelta(0.012)
  assert.ok(validResult.valid, 'Valid delta within threshold should be accepted')
  assert.is(filter.getBufferCount(), 5)
})

test('DebounceFilter calculates median correctly with odd buffer count', () => {
  const filter = createDebounceFilter()

  filter.processDelta(0.010)
  filter.processDelta(0.020)
  filter.processDelta(0.030)

  const median = filter.calculateMedian()
  assert.is(median, 0.020, 'Median of [0.010, 0.020, 0.030] should be 0.020')
})

test('DebounceFilter calculates median correctly with even buffer count', () => {
  const filter = createDebounceFilter()

  filter.processDelta(0.010)
  filter.processDelta(0.020)
  filter.processDelta(0.030)
  filter.processDelta(0.040)

  const median = filter.calculateMedian()
  assert.is(median, 0.025, 'Median of [0.010, 0.020, 0.030, 0.040] should be 0.025')
})

test('DebounceFilter uses circular buffer correctly', () => {
  const filter = createDebounceFilter()

  filter.processDelta(0.010)
  filter.processDelta(0.011)
  filter.processDelta(0.012)
  filter.processDelta(0.013)
  filter.processDelta(0.014)

  filter.processDelta(0.015)
  filter.processDelta(0.016)

  const buffer = filter.getBuffer()
  assert.equal(buffer.length, 5, 'Buffer should maintain size of 5')
  assert.ok(buffer.includes(0.012), 'Buffer should contain 0.012')
  assert.ok(buffer.includes(0.013), 'Buffer should contain 0.013')
  assert.ok(buffer.includes(0.014), 'Buffer should contain 0.014')
  assert.ok(buffer.includes(0.015), 'Buffer should contain 0.015')
  assert.ok(buffer.includes(0.016), 'Buffer should contain 0.016')
  assert.not.ok(buffer.includes(0.010), 'Oldest value 0.010 should be evicted')
  assert.not.ok(buffer.includes(0.011), 'Second oldest value 0.011 should be evicted')
})

test('DebounceFilter resets correctly', () => {
  const filter = createDebounceFilter()

  filter.processDelta(0.010)
  filter.processDelta(0.011)
  filter.processDelta(0.012)

  filter.reset()

  assert.is(filter.getBufferCount(), 0, 'Buffer count should be 0 after reset')
  assert.equal(filter.getBuffer(), [], 'Buffer should be empty after reset')
})

test('DebounceFilter realistic rowing simulation with injected bounces', () => {
  const filter = createDebounceFilter()

  const validDeltas = [
    0.0105, 0.0102, 0.0099, 0.0097, 0.0095,
    0.0093, 0.0090, 0.0088, 0.0085, 0.0083,
    0.0080, 0.0078, 0.0076, 0.0074, 0.0072,
    0.0095, 0.0100, 0.0105, 0.0110, 0.0115,
    0.0120, 0.0125, 0.0130, 0.0135, 0.0140,
    0.0145, 0.0150, 0.0155, 0.0160, 0.0165
  ]

  const bounceIndices = new Set([10, 18, 25])
  const emittedDeltas = []

  for (let i = 0; i < validDeltas.length; i++) {
    const delta = validDeltas[i]

    if (i >= 5 && bounceIndices.has(i)) {
      const bounceResult = filter.processDelta(0.0005)
      assert.not.ok(bounceResult.valid, `Bounce at index ${i} should be rejected`)
    }

    const result = filter.processDelta(delta)
    assert.ok(result.valid, `Valid delta ${delta} at index ${i} should be accepted`)
    emittedDeltas.push(delta)
  }

  assert.is(
    emittedDeltas.length,
    validDeltas.length,
    'All valid deltas should be emitted'
  )

  for (let i = 0; i < validDeltas.length; i++) {
    assert.is(
      emittedDeltas[i],
      validDeltas[i],
      `Emitted delta at index ${i} should match expected clean curve`
    )
  }
})

test('DebounceFilter rejects multiple consecutive bounces', () => {
  const filter = createDebounceFilter()

  filter.processDelta(0.010)
  filter.processDelta(0.011)
  filter.processDelta(0.012)
  filter.processDelta(0.013)
  filter.processDelta(0.014)

  const bounce1 = filter.processDelta(0.0005)
  assert.not.ok(bounce1.valid, 'First bounce should be rejected')

  const bounce2 = filter.processDelta(0.0006)
  assert.not.ok(bounce2.valid, 'Second consecutive bounce should be rejected')

  const bounce3 = filter.processDelta(0.0007)
  assert.not.ok(bounce3.valid, 'Third consecutive bounce should be rejected')

  const validResult = filter.processDelta(0.012)
  assert.ok(validResult.valid, 'Valid delta after bounces should be accepted')
})

test('DebounceFilter handles edge case at threshold boundary', () => {
  const filter = createDebounceFilter({ relativeThreshold: 0.4 })

  filter.processDelta(0.010)
  filter.processDelta(0.010)
  filter.processDelta(0.010)
  filter.processDelta(0.010)
  filter.processDelta(0.010)

  const atThreshold = filter.processDelta(0.004)
  assert.ok(atThreshold.valid, 'Delta at exactly 40% of median should be accepted')

  const belowThreshold = filter.processDelta(0.0039)
  assert.not.ok(belowThreshold.valid, 'Delta below 40% of median should be rejected')
})

test('DebounceFilter handles deceleration curve (drive to recovery transition)', () => {
  const filter = createDebounceFilter()

  const drivePhase = [
    0.0080, 0.0078, 0.0075, 0.0073, 0.0070,
    0.0068, 0.0065, 0.0063, 0.0060, 0.0058
  ]

  const recoveryPhase = [
    0.0065, 0.0070, 0.0075, 0.0080, 0.0085,
    0.0090, 0.0095, 0.0100, 0.0105, 0.0110
  ]

  for (const delta of drivePhase) {
    const result = filter.processDelta(delta)
    assert.ok(result.valid, `Drive phase delta ${delta} should be accepted`)
  }

  const bounceInTransition = filter.processDelta(0.0005)
  assert.not.ok(bounceInTransition.valid, 'Bounce during transition should be rejected')

  for (const delta of recoveryPhase) {
    const result = filter.processDelta(delta)
    assert.ok(result.valid, `Recovery phase delta ${delta} should be accepted`)
  }
})

test('DebounceFilter custom configuration options', () => {
  const filter = createDebounceFilter({
    bufferSize: 3,
    minDelta: 0.002,
    relativeThreshold: 0.3
  })

  assert.is(filter.getBufferSize(), 3, 'Custom buffer size should be applied')

  filter.processDelta(0.010)
  filter.processDelta(0.010)
  filter.processDelta(0.010)

  const belowMinDelta = filter.processDelta(0.0015)
  assert.not.ok(belowMinDelta.valid, 'Delta below custom minDelta should be rejected')

  const atCustomThreshold = filter.processDelta(0.003)
  assert.ok(atCustomThreshold.valid, 'Delta at custom threshold should be accepted')

  const belowCustomThreshold = filter.processDelta(0.0029)
  assert.not.ok(belowCustomThreshold.valid, 'Delta below custom threshold should be rejected')
})

test('DebounceFilter performance - no memory leaks in hot path', () => {
  const filter = createDebounceFilter()

  for (let i = 0; i < 10000; i++) {
    const delta = 0.010 + (Math.sin(i * 0.1) * 0.002)
    filter.processDelta(delta)

    if (i % 100 === 0) {
      filter.processDelta(0.0005)
    }
  }

  assert.is(filter.getBufferCount(), 5, 'Buffer should remain at fixed size after many iterations')

  const buffer = filter.getBuffer()
  assert.is(buffer.length, 5, 'Buffer array should maintain constant size')
})

test.run()
