'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This implements a cyclic error filter. This is used to create a profile
 * The filterArray does the calculation, the filterConfig contains the results for easy retrieval
 * the weightCorrection ensures that the sum of corrections will converge to an average of 1 (thus preventing time dilation)
 */
import { createInfiniteAverager } from './InfiniteAverager.js'
import { createSeries } from './Series.js'

export function createCyclicErrorFilter (size, flankSize, agressiveness, deltaTime) {
  const cycle = size
  const flankLength = flankSize
  const raw = createSeries(flankSize)
  const clean = createSeries(flankSize)
  const weight = agressiveness
  const linearRegressor = deltaTime
  let filterArray = []
  let filterConfig = []
  let recordedRelativePosition = []
  let recordedAbsolutePosition = []
  let recordedRawValue = []
  let startPosition
  let cursor
  let filterSum = cycle
  let weightCorrection = 1
  reset()

  function applyFilter (rawValue, position) {
    if (startPosition === undefined) { startPosition = position + flankLength }
    raw.push(rawValue)
    clean.push(rawValue * filterConfig[position % cycle] * weightCorrection)
  }

  function recordRawDatapoint (relativePosition, absolutePosition, rawValue) {
    recordedRelativePosition.push(relativePosition)
    recordedAbsolutePosition.push(absolutePosition)
    recordedRawValue.push(rawValue)
  }

  function processNextRawDatapoint () {
    if (cursor === undefined) { cursor = Math.ceil(recordedRelativePosition.length * 0.25) }
    if (cursor < Math.floor(recordedRelativePosition.length * 0.75)) {
      const perfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[cursor])
      updateFilter(recordedRelativePosition[cursor], recordedRawValue[cursor], perfectCurrentDt)
      cursor++
    }
  }

  function updateFilter (position, rawValue, cleanValue) {
    if (position > startPosition) {
      const correctionFactor = (cleanValue / rawValue)
      const weightCorrectedCorrectionFactor = ((correctionFactor - 1) * weight) + 1
      filterArray[position % cycle].push(weightCorrectedCorrectionFactor)
      filterSum -= filterConfig[position % cycle]
      filterConfig[position % cycle] = filterArray[position % cycle].average()
      filterSum += filterConfig[position % cycle]
      if (filterSum !== 0) { weightCorrection = cycle / filterSum }
    }
  }

  function restart () {
    recordedRelativePosition = []
    recordedAbsolutePosition = []
    recordedRawValue = []
	cursor = undefined
  }

  function reset () {
    restart()
    startPosition = undefined
    let i = 0
    while (i < cycle) {
      filterArray[i] = {}
      filterArray[i] = createInfiniteAverager(100, 100)
      filterConfig[i] = 1
      i++
    }
    filterSum = cycle
    weightCorrection = 1
  }

  return {
    applyFilter,
    recordRawDatapoint,
    processNextRawDatapoint,
    updateFilter,
    raw,
    clean,
    restart,
    reset
  }
}
