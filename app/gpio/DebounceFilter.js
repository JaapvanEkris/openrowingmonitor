'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Software debounce filter for GPIO sensor input. Filters out hardware bounce
  from magnetic flywheel sensors by validating delta-times against a rolling
  median buffer.

  Performance optimized: uses fixed-size TypedArray, no allocations in hot path.
*/

const BUFFER_SIZE = 5
const DEBOUNCE_MIN_DELTA = 0.001
const DEBOUNCE_RELATIVE_THRESHOLD = 0.4

export function createDebounceFilter (options = {}) {
  const bufferSize = options.bufferSize ?? BUFFER_SIZE
  const minDelta = options.minDelta ?? DEBOUNCE_MIN_DELTA
  const relativeThreshold = options.relativeThreshold ?? DEBOUNCE_RELATIVE_THRESHOLD

  const deltaBuffer = new Float64Array(bufferSize)
  let bufferIndex = 0
  let bufferCount = 0

  function calculateMedian () {
    if (bufferCount === 0) {
      return 0
    }

    const sorted = new Float64Array(bufferCount)
    for (let i = 0; i < bufferCount; i++) {
      sorted[i] = deltaBuffer[i]
    }

    for (let i = 0; i < bufferCount - 1; i++) {
      for (let j = i + 1; j < bufferCount; j++) {
        if (sorted[j] < sorted[i]) {
          const temp = sorted[i]
          sorted[i] = sorted[j]
          sorted[j] = temp
        }
      }
    }

    const mid = Math.floor(bufferCount / 2)
    if (bufferCount % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    }
    return sorted[mid]
  }

  function isValidDelta (delta) {
    if (bufferCount < bufferSize) {
      return true
    }

    if (delta < minDelta) {
      return false
    }

    const median = calculateMedian()
    const threshold = median * relativeThreshold

    return delta >= threshold
  }

  function addToBuffer (delta) {
    deltaBuffer[bufferIndex] = delta
    bufferIndex = (bufferIndex + 1) % bufferSize
    if (bufferCount < bufferSize) {
      bufferCount++
    }
  }

  function processDelta (delta) {
    if (isValidDelta(delta)) {
      addToBuffer(delta)
      return { valid: true, delta }
    }
    return { valid: false, delta }
  }

  function reset () {
    bufferIndex = 0
    bufferCount = 0
    deltaBuffer.fill(0)
  }

  function getBuffer () {
    return Array.from(deltaBuffer.slice(0, bufferCount))
  }

  return {
    calculateMedian,
    isValidDelta,
    addToBuffer,
    processDelta,
    reset,
    getBufferCount: () => bufferCount,
    getBufferSize: () => bufferSize,
    getBuffer
  }
}
