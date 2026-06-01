/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file Builds and aligns a curve of in-stroke metrics, trimming leading and trailing
 * sub-minimum noise incrementally and at finalization respectively.
 */

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface CurveAndMetrics {
  readonly length: number
  readonly curve: number[]
  readonly peak: number | undefined
  readonly peakNormalizedPosition: number | undefined
  readonly average: number | undefined
}

export interface CurveMetrics {
  push(inputValue: Readonly<number>): void
  completeCurveAndMetrics(): CurveAndMetrics
  reset(): void
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * @description the creator function, creates and returns an InfiniteSeriesMetrics instance
 */
export function createCurveMetrics (minimumValue: number): CurveMetrics {
  let _curve: number[] = []

  /**
   * Adds a value to the series
   * @param {float} value - value to be added to the series
   */
  function push (value: Readonly<number>): void {
    if (value === undefined || isNaN(value)) { return }
    if (_curve.length < 2 && value < minimumValue) {
      reset()
      return
    }

    if (value > 0) {
      _curve.push(value)
    } else {
      _curve.push(0)
    }
  }

  /**
   * Returns the entire curve and associated metrics
   * @returns {object} curveAndMetrics - the entire data package
   * @returns {number} length - The number of valid datapoints in the curve
   * @returns {array} curveAndMetrics.curve - The accumulated curve
   * @returns {float} peak - The peak value found in the curve
   * @returns {float} peakNormalizedPosition - The relative position (0-1) of the position of the curve
   * @returns {float} average - The average value in the curve
   */
  function completeCurveAndMetrics (): CurveAndMetrics {
    const curve: number[] = [..._curve]
    while (curve.length > 5 && (curve[curve.length - 1] < minimumValue || curve[curve.length - 2] < minimumValue)) {
      curve.pop()
    }
    const length: number = curve.length
    const sum: number | undefined = length > 0 ? curve.reduce((total: number, item: number) => total + item) : undefined
    const average: number | undefined = (length > 0 && sum > 0) ? sum / length : undefined
    const peak: number | undefined = (length > 0 && sum > 0) ? curve.reduce((a,b) => { return (a > b) ? a : b }) : undefined
    const peakPosition: number | undefined = (length > 0 && peak > 0) ? curve.indexOf(peak) : undefined
    const peakNormalizedPosition: number | undefined = (length > 1 && peak > 0 && peakPosition >= 0) ? Math.min(1, peakPosition / (length - 1)) : undefined
    return { curve, peak, peakNormalizedPosition, average, length }
  }

  function reset (): void {
    _curve = []
  }

  return {
    push,
    completeCurveAndMetrics,
    reset
  }
}
