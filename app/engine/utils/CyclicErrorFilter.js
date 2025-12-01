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
import { createWeighedMedianSeries } from './WeighedMedianSeries.js'

const log = loglevel.getLogger('RowingEngine')

export function createCyclicErrorFilter (numberOfMagnets, flankLength, minimumDragFactorSamples, agressiveness, deltaTime) {
  const upperBound = 1.01
  const lowerBound = 0.99
  const _numberOfMagnets = numberOfMagnets
  const _flankLength = flankLength
  const _numberOfFilterSamples = (minimumDragFactorSamples / numberOfMagnets) * 2
  const raw = createSeries(_flankLength)
  const magnet = createSeries(_flankLength)
  const clean = createSeries(_flankLength)
  const _agressiveness = agressiveness
  const linearRegressor = deltaTime
  let filterArray = []
  let filterConfig = []
  let recordedRelativePosition = []
  let recordedAbsolutePosition = []
  let recordedRawValue = []
  let startPosition
  let cursor
  let totalNumberOfDatapointsProcessed
  let filterSum = _numberOfMagnets
  let weightCorrection = 1
  let offset = 0
  reset()

  function applyFilter (rawValue, position) {
    if (startPosition === undefined) { startPosition = position + _flankLength }
    raw.push(rawValue)
    magnet.push(position % _numberOfMagnets)
    clean.push(rawValue * filterConfig[position % _numberOfMagnets] * weightCorrection)
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
      const correctionFactor = (perfectCurrentDt / recordedRawValue[cursor])
      const weightCorrectedCorrectionFactor = ((correctionFactor - 1) * _agressiveness) + 1
      const nextPerfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[cursor + 1])
      const nextCorrectionFactor = (perfectCurrentDt / recordedRawValue[cursor + 1])
      const nextWeightCorrectedCorrectionFactor = ((correctionFactor - 1) * _agressiveness) + 1
      const GoF = linearRegressor.goodnessOfFit() * linearRegressor.localGoodnessOfFit(cursor)
      updateFilter(recordedRelativePosition[cursor], weightCorrectedCorrectionFactor, nextWeightCorrectedCorrectionFactor, GoF)
      cursor++
    }
  }

  function updateFilter (position, weightCorrectedCorrectionFactor, nextWeightCorrectedCorrectionFactor, goodnessOfFit) {
    if (position > startPosition) {
      let workPosition = (position + offset) % _numberOfMagnets
      const leftDistance = Math.abs(filterConfig[(workPosition - 1) % _numberOfMagnets] - weightCorrectedCorrectionFactor)
      const middleDistance = Math.abs(filterConfig[workPosition] - weightCorrectedCorrectionFactor)
      const rightDistance = Math.abs(filterConfig[(workPosition + 1) % _numberOfMagnets] - weightCorrectedCorrectionFactor)
      const nextLeftDistance = Math.abs(filterConfig[(workPosition) % _numberOfMagnets] - nextWeightCorrectedCorrectionFactor)
      const nextMiddleDistance = Math.abs(filterConfig[workPosition + 1] - nextWeightCorrectedCorrectionFactor)
      const nextRightDistance = Math.abs(filterConfig[(workPosition + 2) % _numberOfMagnets] - nextWeightCorrectedCorrectionFactor)
      const aboveUpperBound = (weightCorrectedCorrectionFactor > (filterConfig[workPosition] * upperBound))
      const belowLowerBound = (weightCorrectedCorrectionFactor < (filterConfig[workPosition] * lowerBound))
      const outsideBounds = (aboveUpperBound || belowLowerBound)
      switch (true) {
        // Prevent a single measurement to add radical change (measurement error), offsetting the entire filter
        case (totalNumberOfDatapointsProcessed < (_numberOfFilterSamples * _numberOfMagnets)):
          // We are still at filter startup
          filterArray[position % _numberOfMagnets].push(position, weightCorrectedCorrectionFactor, goodnessOfFit)
          break
        case (!outsideBounds):
          filterArray[workPosition].push(position, weightCorrectedCorrectionFactor, goodnessOfFit)
          break
        case (outsideBounds && leftDistance < middleDistance && leftDistance < rightDistance && nextLeftDistance < nextMiddleDistance && nextLeftDistance < nextRightDistance):
          // We're outside the usual boundaries, and it seems that the previous point is a better match than the current one, potentially due to a missing datapoint
          log.debug(`*** WARNING: cyclic error filter detected a positive shift at magnet ${workPosition}, most likely due to an unhandled switch bounce`)
          offset--
          workPosition = (position + offset) % _numberOfMagnets
          filterArray[workPosition].push(position, weightCorrectedCorrectionFactor, goodnessOfFit)
          break
        case (outsideBounds && rightDistance < middleDistance && rightDistance < leftDistance && nextRightDistance < nextMiddleDistance && nextRightDistance < nextLeftDistance):
          // We're outside the usual boundaries, and it seems that the next datapoint is a better match than the current one, potentially due to a switch bounce
          log.debug(`*** WARNING: cyclic error filter detected a negative shift at magnet ${workPosition}, most likely due to a missing datapoint`)
          offset++
          workPosition = (position + offset) % _numberOfMagnets
          filterArray[workPosition].push(position, weightCorrectedCorrectionFactor, goodnessOfFit)
          break
        case (belowLowerBound):
          log.debug(`*** WARNING: cyclic error filter detected a radical decrease of ${weightCorrectedCorrectionFactor} at magnet ${workPosition}, where about ${filterConfig[workPosition]} is expected, clipping`)
          filterArray[workPosition].push(position, filterConfig[workPosition] * lowerBound, goodnessOfFit)
          break
        case (aboveUpperBound):
          log.debug(`*** WARNING: cyclic error filter detected a radical increase of ${weightCorrectedCorrectionFactor} at magnet ${workPosition}, where about ${filterConfig[workPosition]} is expected, clipping`)
          filterArray[workPosition].push(position, filterConfig[workPosition] * upperBound, goodnessOfFit)
          break
        default:
          filterArray[workPosition].push(position, weightCorrectedCorrectionFactor, goodnessOfFit)
      }
      filterSum -= filterConfig[position % _numberOfMagnets]
      filterConfig[position % _numberOfMagnets] = filterArray[position % _numberOfMagnets].weighedMedian()
      filterSum += filterConfig[position % _numberOfMagnets]
      if (filterSum !== 0) { weightCorrection = _numberOfMagnets / filterSum }
      totalNumberOfDatapointsProcessed++
    }
  }

  function restart () {
    recordedRelativePosition = []
    recordedAbsolutePosition = []
    recordedRawValue = []
    cursor = undefined
  }

  function reset () {
    if (totalNumberOfDatapointsProcessed > 0) { log.debug('*** WARNING: cyclic error filter is reset') }
    restart()
    startPosition = undefined
    let i = 0
    while (i < _numberOfMagnets) {
      filterArray[i] = {}
      filterArray[i] = createWeighedMedianSeries(_numberOfFilterSamples)
      filterArray[i].push(1, 1, 0.5)
      filterArray[i].push(2, 0.90, 0.5)
      filterArray[i].push(3, 0.95, 0.5)
      filterArray[i].push(4, 1.05, 0.5)
      filterArray[i].push(5, 1.10, 0.5)
      filterConfig[i] = 1
      i++
    }
    filterSum = _numberOfMagnets
    weightCorrection = 1
    totalNumberOfDatapointsProcessed = 0
    offset = 0
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
