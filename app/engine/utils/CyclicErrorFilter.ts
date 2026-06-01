'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This implements a cyclic error filter. This is used to create a profile
 * The filterArray does the calculation, the slope and intercept arrays contain the results for easy retrieval
 * the slopeCorrection and interceptCorrection ensure preventing time dilation due to excessive corrections
 * @see {@link https://github.com/JaapvanEkris/openrowingmonitor/blob/main/docs/Mathematical_Foundations.md|for the underlying math description)
 */
import loglevel from 'loglevel'
import { createSeries } from './Series.ts'
import { createWLSLinearSeries } from './WLSLinearSeries.ts'

const log = loglevel.getLogger('RowingEngine')

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

export interface CECFilteredValue {
  clean: number | undefined
  raw: number | undefined
  goodnessOfFit: number
}

export interface CyclicErrorFilter {
  applyFilter(rawValue: Readonly<number>, position: Readonly<number>): CECFilteredValue
  recordRawDatapoint(relativePosition: Readonly<number>, absolutePosition: Readonly<number>, rawValue: Readonly<number>): void
  processNextRawDatapoint(): void
  atSeriesBegin(): CECFilteredValue
  forceFlushDatapointBuffer(): void
  clearDatapointBuffer(): void
  resetFilterConfiguration(): void
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createCyclicErrorFilter (rowerSettings: Readonly<RowerEngineSettings>, deltaTime: Readonly<TSLinearSeries>): CyclicErrorFilter {
  const CECFilterEnabled: boolean = (rowerSettings.autoAdjustDragFactor && rowerSettings.numOfImpulsesPerRevolution > 1 && rowerSettings.systematicErrorNumberOfDatapoints > 0 && rowerSettings.systematicErrorAgressiveness > 0)
  const _numberOfMagnets: number = Math.max(rowerSettings.numOfImpulsesPerRevolution, 1)
  const _flankLength: number = rowerSettings.flankLength
  const _agressiveness: number = Math.min(Math.max(rowerSettings.systematicErrorAgressiveness, 0), 1.5)
  const _invAgressiveness: number = Math.min(Math.max(1 - _agressiveness, 0), 1)
  const _numberOfFilterSamples: number = Math.max(Math.round((rowerSettings.systematicErrorNumberOfDatapoints / _numberOfMagnets)), 5)
  const _minimumTimeBetweenImpulses: number = rowerSettings.minimumTimeBetweenImpulses
  const _maximumTimeBetweenImpulses: number = rowerSettings.maximumTimeBetweenImpulses
  const raw: ISeries = createSeries(_flankLength)
  const clean: ISeries = createSeries(_flankLength)
  const goodnessOfFit: ISeries = createSeries(_flankLength)
  const linearRegressor: ILinearRegressor = deltaTime
  const domainBorder: number = (_minimumTimeBetweenImpulses > 0 ? _minimumTimeBetweenImpulses : 0.0001)

  let recordedRelativePosition: number[] = []
  let recordedAbsolutePosition: number[] = []
  let recordedRawValue: number[] = []
  let filterArray: WLSLinearSeries[] = []
  let slope: number[] = []
  let intercept: number[] = []
  let startPosition: number | undefined
  let lowerCursor: number | undefined
  let upperCursor: number | undefined
  let slopeSum: number = _numberOfMagnets
  let interceptSum: number = 0
  let slopeCorrection: number = 1
  let interceptCorrection: number = 0

  resetFilterConfiguration()

  /**
   * @param rawValue - the raw recorded value to be cleaned up
   * @param position - the position of the flywheel
   * @returns the clean value and its goodness-of-fit
   */
  function applyFilter (rawValue: Readonly<number>, position: Readonly<number>): CECFilteredValue {
    if (startPosition === undefined) { startPosition = position + _flankLength }
    const magnet: number = position % _numberOfMagnets
    raw.push(rawValue)

    if (CECFilterEnabled && filterArray[magnet].reliable()) {
      const cleanValue: number = projectX(magnet, rawValue)
      clean.push(cleanValue)
      goodnessOfFit.push(filterArray[magnet].goodnessOfFit() * domainFit(rawValue) * domainFit(cleanValue))
    } else {
      clean.push(rawValue)
      goodnessOfFit.push(domainFit(rawValue) * domainFit(rawValue))
    }

    return {
      clean: clean.atSeriesEnd(),
      raw: raw.atSeriesEnd(),
      goodnessOfFit: goodnessOfFit.atSeriesEnd()
    }
  }

  /**
   * @param magnet - the magnet number
   * @param rawValue - the raw value to be projected by the function for that magnet
   * @returns projected result
   */
  function projectX (magnet: Readonly<number>, rawValue: Readonly<number>): number {
    return (rawValue * slope[magnet] * slopeCorrection) + (intercept[magnet] - interceptCorrection)
  }

  /**
   * @param value - the raw value to be mapped onto the domain
   * @returns an indication of the fit with the domain
   */
  function domainFit (value: Readonly<number>): number {
    switch (true) {
      case (value < _minimumTimeBetweenImpulses):
        return Math.min(Math.max(1 - ((_minimumTimeBetweenImpulses - value) / domainBorder), 0.001), 1)
      case (value > _maximumTimeBetweenImpulses):
        return Math.min(Math.max(1 - ((value - _maximumTimeBetweenImpulses) / domainBorder), 0.001), 1)
      default:
        return 1
    }
  }

  /**
   * @returns the oldest object at the head of the FiFo buffer
   */
  function atSeriesBegin (): CECFilteredValue {
    if (clean.length() >= _flankLength) {
      return {
        clean: clean.atSeriesBegin(),
        raw: raw.atSeriesBegin(),
        goodnessOfFit: goodnessOfFit.atSeriesBegin()
      }
    } else {
      return {
        clean: undefined,
        raw: undefined,
        goodnessOfFit: 0
      }
    }
  }

  /**
   * @param relativePosition - sequence number of the datapoint
   * @param absolutePosition - total spinning time of the flywheel
   * @param rawValue - the raw value
   */
  function recordRawDatapoint (relativePosition: Readonly<number>, absolutePosition: Readonly<number>, rawValue: Readonly<number>): void {
    if (CECFilterEnabled && rawValue >= _minimumTimeBetweenImpulses && _maximumTimeBetweenImpulses >= rawValue) {
      recordedRelativePosition.push(relativePosition)
      recordedAbsolutePosition.push(absolutePosition)
      recordedRawValue.push(rawValue)
    }
  }

  /**
   * Processes the next two datapoints from the queue.
   */
  function processNextRawDatapoint (): void {
    let perfectCurrentDt: number
    let weightCorrectedCorrectedDatapoint: number
    let GoF: number

    if (!CECFilterEnabled || recordedRawValue.length < 1 || !linearRegressor.reliable()) { return }

    if (lowerCursor === undefined || upperCursor === undefined) {
      lowerCursor = Math.ceil(recordedRelativePosition.length * 0.1)
      upperCursor = Math.floor(recordedRelativePosition.length * 0.9)
    }

    if (lowerCursor < upperCursor && recordedRelativePosition[lowerCursor] > (startPosition as number)) {
      perfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[lowerCursor])
      weightCorrectedCorrectedDatapoint = (_invAgressiveness * recordedRawValue[lowerCursor]) + (_agressiveness * perfectCurrentDt)
      GoF = linearRegressor.goodnessOfFit() * linearRegressor.localGoodnessOfFit(lowerCursor)
      updateFilter(recordedRelativePosition[lowerCursor] % _numberOfMagnets, recordedRawValue[lowerCursor], weightCorrectedCorrectedDatapoint, GoF)
    }
    lowerCursor++

    if (lowerCursor < upperCursor && recordedRelativePosition[upperCursor] > (startPosition as number)) {
      perfectCurrentDt = linearRegressor.projectX(recordedAbsolutePosition[upperCursor])
      weightCorrectedCorrectedDatapoint = (_invAgressiveness * recordedRawValue[upperCursor]) + (_agressiveness * perfectCurrentDt)
      GoF = linearRegressor.goodnessOfFit() * linearRegressor.localGoodnessOfFit(upperCursor)
      updateFilter(recordedRelativePosition[upperCursor] % _numberOfMagnets, recordedRawValue[upperCursor], weightCorrectedCorrectedDatapoint, GoF)
    }
    upperCursor--
  }

  /**
   * Updates the filter state for a given magnet position.
   */
  function updateFilter (magnet: Readonly<number>, rawDatapoint: Readonly<number>, correctedDatapoint: Readonly<number>, goodnessOfFit: Readonly<number>): void {
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
   * Forcefully clears the datapoint buffer (e.g. when recovery GoF is too weak).
   */
  function forceFlushDatapointBuffer (): void {
    if (recordedRawValue.length > 1) { log.info('*** Cyclic error filter: cleared datapoint buffer before processing its datapoints has started (recovery GoF was too weak)') }
    clearDatapointBuffer()
  }

  /**
   * Clears the datapoint buffer to prepare for a new set of recordings.
   */
  function clearDatapointBuffer (): void {
    if (CECFilterEnabled && recordedRawValue.length > 0) {
      recordedRelativePosition = []
      recordedAbsolutePosition = []
      recordedRawValue = []
      lowerCursor = undefined
      upperCursor = undefined
    }
  }

  /**
   * Resets all filter coefficients and re-initialises each magnet's WLS series
   * with an identity function spanning the valid time range.
   */
  function resetFilterConfiguration (): void {
    if (slopeSum !== _numberOfMagnets || interceptSum !== 0) { log.debug('*** WARNING: cyclic error filter has configuration forcefully been reset') }
    const noIncrements: number = _numberOfFilterSamples
    const increment: number = (_maximumTimeBetweenImpulses - _minimumTimeBetweenImpulses) / noIncrements

    lowerCursor = undefined
    clearDatapointBuffer()

    let i: number = 0
    let j: number = 0
    let datapoint: number = 0
    while (i < _numberOfMagnets) {
      if (i < filterArray.length) {
        filterArray[i]?.reset()
      } else {
        filterArray[i] = createWLSLinearSeries(_numberOfFilterSamples)
      }
      j = 0
      while (j <= noIncrements) {
        datapoint = _maximumTimeBetweenImpulses - (j * increment)
        filterArray[i].push(datapoint, datapoint, 0.5)
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
   * Full reset: clears all buffers including the flank series.
   */
  function reset (): void {
    log.debug('*** WARNING: cyclic error filter is reset')
    slopeSum = _numberOfMagnets
    interceptSum = 0
    resetFilterConfiguration()
    raw.reset()
    clean.reset()
    goodnessOfFit.reset()
  }

  return {
    applyFilter,
    recordRawDatapoint,
    processNextRawDatapoint,
    atSeriesBegin,
    forceFlushDatapointBuffer,
    clearDatapointBuffer,
    resetFilterConfiguration,
    reset
  }
}
