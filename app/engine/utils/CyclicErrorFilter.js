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

export function createCyclicErrorFilter (size, flankSize, agressiveness) {
  const cycle = size
  const flankLength = flankSize
  const raw = createSeries(flankSize)
  const clean = createSeries(flankSize)
  const weight = agressiveness
  let filterArray = []
  let filterConfig = []
  let filterSum = cycle
  let weightCorrection = 1
  let i = 0
  let startPosition
  while (i < cycle) {
    filterArray[i] = createInfiniteAverager(1000, 1000)
    filterConfig[i] = 1
    i++
  }

  function applyFilter (rawValue, position) {
    if (startPosition === undefined) { startPosition = position + flankLength }
    raw.push(rawValue)
    clean.push(rawValue * filterConfig[position % cycle] * weightCorrection)
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

  function reset () { // @ToDo: connect this to the appropriate Flywheel.js situations where the flywheel is stopped (and thus tracking of flywheel position breaks!
    startPosition = undefined
    i = 0
    while (i < cycle) {
      filterArray[i] = {}
      filterArray[i] = createInfiniteAverager(1000, 1000)
      filterConfig[i] = 1
      i++
    }
    filterSum = cycle
    weightCorrection = 1
  }

  return {
    applyFilter,
    updateFilter,
    raw,
    clean,
    reset
  }
}
