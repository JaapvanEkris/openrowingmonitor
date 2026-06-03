/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This keeps a series of specified length, which we can ask for a moving median.
 * This is used by RowingStatistics.js to aggregate over multiple stroke phases.
 */
import { createLabelledBinarySearchTree } from './BinarySearchTree.ts'

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface StreamFilter {
  push(dataPoint: Readonly<number>): void
  raw(): number
  clean(): number
  reliable(): boolean
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createStreamFilter (maxLength: Readonly<number>, defaultValue: Readonly<number>): StreamFilter {
  let lastRawDatapoint: number = defaultValue
  let cleanDatapoint: number = defaultValue
  let position: number = 0
  const bst: LabelledBinarySearchTree = createLabelledBinarySearchTree()

  /**
   * Insert a datapoint in the buffer (and removes older datapoints if the filter is limited)
   */
  function push (dataPoint: Readonly<number>): void {
    if (dataPoint !== undefined && !isNaN(dataPoint)) {
      lastRawDatapoint = dataPoint
      if (maxLength > 0) {
        position = (position + 1) % maxLength
        bst.remove(position)
        bst.push(position, dataPoint, 1)
      } else {
        bst.push(position, dataPoint, 1)
      }
      cleanDatapoint = bst.median()
    }
  }

  /**
   * @returns {float} the last raw value
   */
  function raw (): number {
    return lastRawDatapoint
  }

  /**
   * @returns {float} the latest clean value, or defaultvalue if empty
   */
  function clean (): number {
    if (bst.size() > 0) {
      return cleanDatapoint
    } else {
      return defaultValue
    }
  }

  /**
   * @returns {boolean} if the filter had some values inserted
   */
  function reliable (): boolean {
    return bst.size() > 0
  }

  /**
   * @description resets the filter to default values
   */
  function reset (): void {
    bst.reset()
    lastRawDatapoint = defaultValue
    cleanDatapoint = defaultValue
  }

  return {
    push,
    raw,
    clean,
    reliable,
    reset
  }
}
