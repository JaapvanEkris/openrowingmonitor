/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This implements a Gaussian weight function, which is used in the moving regression filter
 * @see {@link https://en.wikipedia.org/wiki/Kernel_(statistics)#Kernel_functions_in_common_use|the description of the various kernels}
 * Please realize the constant factor 1/Math.Pow(2 * Math.pi(), 0.5) is omitted as it cancels out in the subsequent weight averaging filtering
 */

interface GaussianWeightFunction {
  setWindowWidth: (beginpos: number, endpos: number) => void
  weight: (position: number) => number
}

export function createGaussianWeightFunction (): GaussianWeightFunction {
  let begin: number = 0
  let end: number = 0
  let halfLength: number = 0
  let middle: number = 0

  function setWindowWidth (beginpos: number, endpos: number): void {
    begin = beginpos
    end = endpos
    halfLength = (end - begin) / 2
    middle = halfLength + begin
  }

  function weight (position: number): number {
    if (position >= begin && end >= position) {
      const normalizedDistance: number = Math.abs((middle - position) / halfLength)
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
