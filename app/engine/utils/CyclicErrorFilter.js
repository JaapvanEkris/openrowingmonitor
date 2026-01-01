'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This implements a cyclic error filter. This is used to create a profile
 * The filterArray does the calculation, the slope and intercept arrays contain the results for easy retrieval
 * the slopeCorrection and interceptCorrection ensure preventing time dilation due to excessive corrections
 */
import loglevel from 'loglevel'
import { createSeries } from './Series.js'
import { createWLSLinearSeries } from './WLSLinearSeries.js'

const log = loglevel.getLogger('RowingEngine')

/**
 * @param {{numOfImpulsesPerRevolution: integer, flankLength: integer, systematicErrorAgressiveness: float, minimumTimeBetweenImpulses: float, maximumTimeBetweenImpulses: float}}the rower settings configuration object
 * @param {integer} the number of expected dragfactor samples
 * @param the linear regression function for the drag calculation
 */
export function createCyclicErrorFilter (rowerSettings, minimumDragFactorSamples, deltaTime) {
  const _numberOfMagnets = rowerSettings.numOfImpulsesPerRevolution
  const _flankLength = rowerSettings.flankLength
  const _agressiveness = Math.min(Math.max(rowerSettings.systematicErrorAgressiveness, 0), 1)
  const _invAgressiveness = Math.min(Math.max(1 - _agressiveness, 0), 1)
  const _numberOfFilterSamples = Math.max((minimumDragFactorSamples / _numberOfMagnets) * 2.5, 5)
  const _minimumTimeBetweenImpulses = rowerSettings.minimumTimeBetweenImpulses
  const _maximumTimeBetweenImpulses = rowerSettings.maximumTimeBetweenImpulses
  const raw = createSeries(_flankLength)
  const clean = createSeries(_flankLength)
  const goodnessOfFit = createSeries(_flankLength)
  const linearRegressor = deltaTime
  let recordedRelativePosition = []
  let recordedAbsolutePosition = []
  let recordedRawValue = []
  let filterArray = []
  let slope = []
  let intercept = []
  let startPosition
  let lowerCursor
  let upperCursor
  let slopeSum = _numberOfMagnets
  let interceptSum = 0
  let slopeCorrection = 1
  let interceptCorrection = 0
  coldRestart()

  /**
   * @param {float} the raw recorded value to be cleaned up
   * @param {integer} the position of the flywheel
   * @returns {{value: float, goodnessOfFit: float}} clean value and goodness of fit indication
   * @description Applies the filter on the raw value for the given position (i.e. magnet). Please note: this function is NOT stateless, it also fills a hystoric buffer of raw and clean values
   */
  function applyFilter (rawValue, position) {
    if (startPosition === undefined) { startPosition = position + _flankLength }
    const magnet = position % _numberOfMagnets
    raw.push(rawValue)
    clean.push(projectX(magnet, rawValue))
    goodnessOfFit.push(filterArray[magnet].goodnessOfFit())
    return {
      value: clean.atSeriesEnd(),
      goodnessOfFit: goodnessOfFit.atSeriesEnd()
    }
  }

  /**
   * @param {integer} the magnet number
   * @param {float} the raw value to be projected by the function for that magnet
   * @returns {float} projected result
   */
  function projectX (magnet, rawValue) {
    return (rawValue * slope[magnet] * slopeCorrection) + (intercept[magnet] - interceptCorrection)
  }

  /**
   * @param {integer} the position of the recorded datapoint (i.e the sequence number of the datapoint)
   * @param {float} the total spinning time of the flywheel
   * @param {float} the raw value
   */
  function recordRawDatapoint (relativePosition, absolutePosition, rawValue) {
    if (_agressiveness > 0 && rawValue >= _minimumTimeBetweenImpulses && _maximumTimeBetweenImpulses >= rawValue) {
      recordedRelativePosition.push(relativePosition)
      recordedAbsolutePosition.push(absolutePosition)
      recordedRawValue.push(rawValue)
    }
  }

  /**
   * This processes a next datapoint from the queue
   */
  function processNextRawDatapoint () {
    let perfectCurrentDt
    let weightCorrectedCorrectedDatapoint
    let GoF
    if (lowerCursor === undefined || upperCursor === undefined) {
      lowerCursor = Math.ceil(recordedRelativePosition.length * 0.1)
      upperCursor = Math.floor(recordedRelativePosition.length * 0.9)
    }

    if (lowerCursor < upperCursor && recordedRelativePosition[lowerCursor] > startPosition) {
      perfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[lowerCursor])
      weightCorrectedCorrectedDatapoint = (_invAgressiveness * recordedRawValue[lowerCursor]) + (_agressiveness * perfectCurrentDt)
      GoF = linearRegressor.goodnessOfFit() * linearRegressor.localGoodnessOfFit(lowerCursor)
      updateFilter(recordedRelativePosition[lowerCursor] % _numberOfMagnets, recordedRawValue[lowerCursor], weightCorrectedCorrectedDatapoint, GoF)
    }
    lowerCursor++

    if (lowerCursor < upperCursor && recordedRelativePosition[upperCursor] > startPosition) {
      perfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[upperCursor])
      weightCorrectedCorrectedDatapoint = (_invAgressiveness * recordedRawValue[upperCursor]) + (_agressiveness * perfectCurrentDt)
      GoF = linearRegressor.goodnessOfFit() * linearRegressor.localGoodnessOfFit(upperCursor)
      updateFilter(recordedRelativePosition[upperCursor] % _numberOfMagnets, recordedRawValue[upperCursor], weightCorrectedCorrectedDatapoint, GoF)
    }
    upperCursor--
  }

  function updateFilter (magnet, rawDatapoint, correctedDatapoint, goodnessOfFit) {
    slopeSum -= slope[magnet]
    interceptSum -= intercept[magnet]
    filterArray[magnet].push(rawDatapoint, correctedDatapoint, goodnessOfFit)
    slope[magnet] = filterArray[magnet].slope()
    slopeSum += slope[magnet]
    if (slopeSum !== 0) { slopeCorrection = _numberOfMagnets / slopeSum }
    intercept[magnet] = filterArray[magnet].intercept()
    interceptSum += intercept[magnet]
    interceptCorrection = interceptSum / _numberOfMagnets
  }

  /**
   * @description This is used for clearing the buffers in order to prepare to record for a new set of datapoints, or clear it when the buffer is filled with a recovery with too weak GoF
   */
  function warmRestart () {
    if (!isNaN(lowerCursor)) { log.debug('*** WARNING: cyclic error filter has forcefully been restarted (warm)') }
    recordedRelativePosition = []
    recordedAbsolutePosition = []
    recordedRawValue = []
    lowerCursor = undefined
    upperCursor = undefined
  }

  /**
   * @description This is used for clearing the predictive buffers as the flywheel seems to have stopped
   */
  function coldRestart () {
    if (slopeSum !== _numberOfMagnets || interceptSum !== 0) { log.debug('*** WARNING: cyclic error filter has forcefully been restarted (cold)') }
    const noIncrements = Math.max(Math.ceil(_numberOfFilterSamples / 4), 5)
    const increment = (_maximumTimeBetweenImpulses - _minimumTimeBetweenImpulses) / noIncrements

    lowerCursor = undefined
    warmRestart()

    let i = 0
    let j = 0
    let datapoint = 0
    while (i < _numberOfMagnets) {
      if (!!filterArray[i].slope()) {filterArray[i].reset()}
      filterArray[i] = {}
      filterArray[i] = createWLSLinearSeries(_numberOfFilterSamples)
      j = 0
      while (j <= noIncrements) {
        datapoint = _maximumTimeBetweenImpulses - (j * increment)
        filterArray[i].push(datapoint, datapoint, 0.8)
        j++
      }
      slope[i] = 1
      intercept[i] = 0
      i++
    }
    slopeSum = _numberOfMagnets
    interceptSum = 0
    slopeCorrection = 1
    interceptCorrection = 0
    startPosition = undefined
  }

  /**
   * @description This is used for clearing all buffers (i.e. the currentDt's maintained in the flank and the predictive buffers) when the flywheel is completely reset
   */
  function reset () {
    log.debug('*** WARNING: cyclic error filter is reset')
    slopeSum = _numberOfMagnets
    interceptSum = 0
    coldRestart()
    raw.reset()
    clean.reset()
    goodnessOfFit.reset()
  }

  return {
    applyFilter,
    recordRawDatapoint,
    processNextRawDatapoint,
    updateFilter,
    raw,
    clean,
    warmRestart,
    coldRestart,
    reset
  }
}
