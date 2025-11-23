'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This implements a cyclic error filter. This is used to create a profile
 * The filterArray does the calculation, the filterConfig contains the results for easy retrieval
 * the weightCorrection ensures that the sum of corrections will converge to an average of 1 (thus preventing time dilation)
 */
import loglevel from 'loglevel'
import { createSeries } from './Series.js'
import { createWeighedSeries } from './WeighedSeries.js'

const log = loglevel.getLogger('RowingEngine')

export function createCyclicErrorFilter (numberOfMagnets, flankLength, minimumDragFactorSamples, agressiveness, deltaTime) {
  const _numberOfMagnets = numberOfMagnets
  const _flankLength = flankLength
  const _numberOfFilterSamples = (minimumDragFactorSamples / numberOfMagnets) * 3
  const raw = createSeries(_flankLength)
  const clean = createSeries(_flankLength)
  const weight = agressiveness
  const linearRegressor = deltaTime
  let filterArray = []
  let filterConfig = []
  let recordedRelativePosition = []
  let recordedAbsolutePosition = []
  let recordedRawValue = []
  let startPosition
  let cursor
  let filterSum = _numberOfMagnets
  let weightCorrection = 1
  reset()

  function applyFilter (rawValue, position) {
    if (startPosition === undefined) { startPosition = position + _flankLength }
    raw.push(rawValue)
    clean.push(rawValue * filterConfig[position % _numberOfMagnets] * weightCorrection)
    // if (position % 1000 === 0) { console.log(`CyclicFilter: Appying filter to datapoint ${position}: raw currentDt ${rawValue}, clean currentDt ${clean.atSeriesEnd()}`) }
  }

  function recordRawDatapoint (relativePosition, absolutePosition, rawValue) {
    // if (relativePosition % 1000 === 0) { console.log(`CyclicFilter: Recording raw datapoint ${relativePosition}: raw currentDt ${rawValue}, totalTime ${absolutePosition}`) }
    recordedRelativePosition.push(relativePosition)
    recordedAbsolutePosition.push(absolutePosition)
    recordedRawValue.push(rawValue)
  }

  function processNextRawDatapoint () {
    if (cursor === undefined) { cursor = Math.ceil(recordedRelativePosition.length * 0.25) }
    if (cursor < Math.floor(recordedRelativePosition.length * 0.75)) {
      const perfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[cursor])
      const weight = linearRegressor.goodnessOfFit()
      updateFilter(recordedRelativePosition[cursor], recordedRawValue[cursor], perfectCurrentDt, weight)
      // if (recordedRelativePosition[cursor] % 1000 === 0) { console.log(`CyclicFilter: Processing datapoint ${recordedRelativePosition[cursor]}: raw currentDt ${recordedRawValue[cursor]}, perfect currentDt ${perfectCurrentDt}`) }
      cursor++
    }
  }

  function updateFilter (position, rawValue, cleanValue, weight) {
    if (position > startPosition) {
      const correctionFactor = (cleanValue / rawValue)
      const weightCorrectedCorrectionFactor = ((correctionFactor - 1) * weight) + 1
      switch (true) {
        // Prevent a single measurement to add radical change (measurement error), offsetting the entire filter
        case (weightCorrectedCorrectionFactor >= (filterConfig[position % _numberOfMagnets] * 0.9) && (filterConfig[position % _numberOfMagnets] * 1.1) >= weightCorrectedCorrectionFactor):
          filterArray[position % _numberOfMagnets].push(weightCorrectedCorrectionFactor, weight)
          break
        case (weightCorrectedCorrectionFactor < (filterConfig[position % _numberOfMagnets] * 0.9)):
          log.debug(`*** WARNING: cyclic error filter detected a radical decrease of ${weightCorrectedCorrectionFactor}, where about ${filterConfig[position % _numberOfMagnets]} is expected, clipping`)
          filterArray[position % _numberOfMagnets].push(filterConfig[position % _numberOfMagnets] * 0.9, weight)
          break
        case (weightCorrectedCorrectionFactor > filterConfig[position % _numberOfMagnets] * 1.1):
          log.debug(`*** WARNING: cyclic error filter detected a radical increase of ${weightCorrectedCorrectionFactor}, where about ${filterConfig[position % _numberOfMagnets]} is expected, clipping`)
          filterArray[position % _numberOfMagnets].push(filterConfig[position % _numberOfMagnets] * 1.1, weight)
          break
      }
      filterSum -= filterConfig[position % _numberOfMagnets]
      filterConfig[position % _numberOfMagnets] = filterArray[position % _numberOfMagnets].weighedAverage()
      filterSum += filterConfig[position % _numberOfMagnets]
      if (filterSum !== 0) { weightCorrection = _numberOfMagnets / filterSum }
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
    let j = 0
    while (i < _numberOfMagnets) {
      filterArray[i] = {}
      filterArray[i] = createWeighedSeries(_numberOfFilterSamples, 1)
      j = 0
      while (j < Math.ceil(_numberOfFilterSamples / 5)) {
       filterArray[i].push(1, 1)
       j++
      }
      filterConfig[i] = 1
      i++
    }
    filterSum = _numberOfMagnets
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
