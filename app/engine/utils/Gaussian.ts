'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This implements a Gaussian weight function, which is used in the moving regression filter
 * @see {@link https://en.wikipedia.org/wiki/Kernel_(statistics)#Kernel_functions_in_common_use|the description of the various kernels}
 * Please realize the constant factor 1/Math.Pow(2 * Math.pi(), 0.5) is omitted as it cancels out in the subsequent weight averaging filtering
 */

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface GaussianWeight {
  setWindowWidth(xBegin: Readonly<number>, xEnd: Readonly<number>): void
  weight(x: Readonly<number>): number | undefined
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createGaussianWeightFunction (): GaussianWeight {
  let begin: number = 0
  let end: number = 0
  let halfLength: number = 0
  let middle: number = 0

  /**
   * @description This sets the window for the Gaussian weight calculation
   * @param {float} xBbegin - the minimum x value of the window
   * @param {float} xEnd - the maximum x value of the window
   */
  function setWindowWidth (xBegin: Readonly<number>, xEnd: Readonly<number>): void {
    if (xBegin < xEnd) {
      begin = xBegin
      end = xEnd
      halfLength = (end - begin) / 2
      middle = halfLength + begin
    } else {
      begin = undefined
      end = undefined
      halfLength = undefined
      middle = undefined
    }
  }

  /**
   * @param {float} x - the x value of the datapoint
   * @returns The calculated Gaussian weight
   */
  function weight (x: Readonly<number>): number | undefined {
    if (!halfLength > 0) { return undefined }
    if (x >= begin && end >= x) {
      const normalizedDistance: number = Math.abs((middle - x) / halfLength)
      return Math.exp(-0.5 * Math.pow(normalizedDistance, 2))
    } else {
      return 0
    }
  }

  return {
    setWindowWidth,
    weight
  }
}
