/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file Tests of the TSLinearSeries module
 */
// @vitest-environment node
import { test, assert, describe } from 'vitest'
import { createTSLinearSeries } from './TSLinearSeries.ts'

describe('Initialisation of the TSLinearSeries object', () => {
/**
 * @description Test behaviour for no datapoints
 */
  test('Correct behaviour of a TSLinear series after initialisation', () => {
    const dataSeries = createTSLinearSeries(3)
    testLength(dataSeries, 0)
    testXLength(dataSeries, 0)
    testYLength(dataSeries, 0)
    testReliable(dataSeries, false)
    testGetX(dataSeries, 0, undefined)
    testGetY(dataSeries, 0, undefined)
    testXAtSeriesBegin(dataSeries, undefined)
    testYAtSeriesBegin(dataSeries, undefined)
    testXAtSeriesEnd(dataSeries, undefined)
    testYAtSeriesEnd(dataSeries, undefined)
    testNumberOfXValuesAbove(dataSeries, 0, undefined)
    testNumberOfYValuesAbove(dataSeries, 0, undefined)
    testNumberOfXValuesEqualOrBelow(dataSeries, 0, undefined)
    testNumberOfYValuesEqualOrBelow(dataSeries, 0, undefined)
    testNumberOfXValuesAbove(dataSeries, 10, undefined)
    testNumberOfYValuesAbove(dataSeries, 10, undefined)
    testNumberOfXValuesEqualOrBelow(dataSeries, 10, undefined)
    testNumberOfYValuesEqualOrBelow(dataSeries, 10, undefined)
    testXSum(dataSeries, undefined)
    testYSum(dataSeries, undefined)
    testAverageX(dataSeries, undefined)
    testAverageY(dataSeries, undefined)
    testMinimumX(dataSeries, undefined)
    testMinimumY(dataSeries, undefined)
    testMaximumX(dataSeries, undefined)
    testMaximumY(dataSeries, undefined)
    testMedianX(dataSeries, undefined)
    testMedianY(dataSeries, undefined)
    testXSeries(dataSeries, [])
    testYSeries(dataSeries, [])
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
    testXProjectionEquals(dataSeries, 1, undefined)
    testYProjectionEquals(dataSeries, 1, undefined)
  })
})

describe('Test behaviour of the TSLinearSeries object when data is pushed', () => {
  /**
   * @description Test behaviour for a single datapoint
   */
  test('Correct behaviour of a series after a pushed value, function y = 3x - 6, noisefree, 1 datapoint', () => {
    const dataSeries = createTSLinearSeries(3)
    testLength(dataSeries, 0)
    testReliable(dataSeries, false)
    dataSeries.push(5, 9)
    testLength(dataSeries, 1)
    testXLength(dataSeries, 1)
    testYLength(dataSeries, 1)
    testReliable(dataSeries, false)
    testGetX(dataSeries, 0, 5)
    testGetY(dataSeries, 0, 9)
    testXAtSeriesBegin(dataSeries, 5)
    testYAtSeriesBegin(dataSeries, 9)
    testXAtSeriesEnd(dataSeries, 5)
    testYAtSeriesEnd(dataSeries, 9)
    testNumberOfXValuesAbove(dataSeries, 0, 1)
    testNumberOfYValuesAbove(dataSeries, 0, 1)
    testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfXValuesAbove(dataSeries, 10, 0)
    testNumberOfYValuesAbove(dataSeries, 10, 0)
    testNumberOfXValuesEqualOrBelow(dataSeries, 10, 1)
    testNumberOfYValuesEqualOrBelow(dataSeries, 10, 1)
    testXSum(dataSeries, 5)
    testYSum(dataSeries, 9)
    testAverageX(dataSeries, 5)
    testAverageY(dataSeries, 9)
    testMinimumX(dataSeries, 5)
    testMinimumY(dataSeries, 9)
    testMaximumX(dataSeries, 5)
    testMaximumY(dataSeries, 9)
    testMedianX(dataSeries, 5)
    testMedianY(dataSeries, 9)
    testXSeries(dataSeries, [5])
    testYSeries(dataSeries, [9])
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
    testXProjectionEquals(dataSeries, 1, undefined)
    testYProjectionEquals(dataSeries, 1, undefined)
  })

  test('Correct behaviour of a series after several pushed values, function y = 3x - 6, noisefree, 2 datapoints', () => {
    const dataSeries = createTSLinearSeries(3)
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    testLength(dataSeries, 2)
    testXLength(dataSeries, 2)
    testYLength(dataSeries, 2)
    testReliable(dataSeries, true)
    testGetX(dataSeries, 0, 5)
    testGetY(dataSeries, 0, 9)
    testGetX(dataSeries, 1, 3)
    testGetY(dataSeries, 1, 3)
    testXAtSeriesBegin(dataSeries, 5)
    testYAtSeriesBegin(dataSeries, 9)
    testXAtSeriesEnd(dataSeries, 3)
    testYAtSeriesEnd(dataSeries, 3)
    testNumberOfXValuesAbove(dataSeries, 0, 2)
    testNumberOfYValuesAbove(dataSeries, 0, 2)
    testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfXValuesAbove(dataSeries, 10, 0)
    testNumberOfYValuesAbove(dataSeries, 10, 0)
    testNumberOfXValuesEqualOrBelow(dataSeries, 10, 2)
    testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
    testXSum(dataSeries, 8)
    testYSum(dataSeries, 12)
    testAverageX(dataSeries, 4)
    testAverageY(dataSeries, 6)
    testMinimumX(dataSeries, 3)
    testMinimumY(dataSeries, 3)
    testMaximumX(dataSeries, 5)
    testMaximumY(dataSeries, 9)
    testMedianX(dataSeries, 4)
    testMedianY(dataSeries, 6)
    testXSeries(dataSeries, [5, 3])
    testYSeries(dataSeries, [9, 3])
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
    testGoodnessOfFitEquals(dataSeries, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 0, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 1, 1)
    testXProjectionEquals(dataSeries, 3, 3)
    testXProjectionEquals(dataSeries, 5, 9)
    testYProjectionEquals(dataSeries, 3, 3)
    testYProjectionEquals(dataSeries, 9, 5)
  })

  test('Correct behaviour of a series after several pushed values, function y = 3x - 6, noisefree, 3 datapoints', () => {
    const dataSeries = createTSLinearSeries(3)
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    testLength(dataSeries, 3)
    testXLength(dataSeries, 3)
    testYLength(dataSeries, 3)
    testReliable(dataSeries, true)
    testGetX(dataSeries, 0, 5)
    testGetY(dataSeries, 0, 9)
    testGetX(dataSeries, 1, 3)
    testGetY(dataSeries, 1, 3)
    testGetX(dataSeries, 2, 4)
    testGetY(dataSeries, 2, 6)
    testXAtSeriesBegin(dataSeries, 5)
    testYAtSeriesBegin(dataSeries, 9)
    testXAtSeriesEnd(dataSeries, 4)
    testYAtSeriesEnd(dataSeries, 6)
    testNumberOfXValuesAbove(dataSeries, 0, 3)
    testNumberOfYValuesAbove(dataSeries, 0, 3)
    testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfXValuesAbove(dataSeries, 10, 0)
    testNumberOfYValuesAbove(dataSeries, 10, 0)
    testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
    testNumberOfYValuesEqualOrBelow(dataSeries, 10, 3)
    testXSum(dataSeries, 12)
    testYSum(dataSeries, 18)
    testAverageX(dataSeries, 4)
    testAverageY(dataSeries, 6)
    testMinimumX(dataSeries, 3)
    testMinimumY(dataSeries, 3)
    testMaximumX(dataSeries, 5)
    testMaximumY(dataSeries, 9)
    testMedianX(dataSeries, 4)
    testMedianY(dataSeries, 6)
    testXSeries(dataSeries, [5, 3, 4])
    testYSeries(dataSeries, [9, 3, 6])
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
    testGoodnessOfFitEquals(dataSeries, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 0, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 1, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 2, 1)
    testXProjectionEquals(dataSeries, 3, 3)
    testXProjectionEquals(dataSeries, 5, 9)
    testXProjectionEquals(dataSeries, 4, 6)
    testYProjectionEquals(dataSeries, 3, 3)
    testYProjectionEquals(dataSeries, 9, 5)
    testYProjectionEquals(dataSeries, 6, 4)
    testLocalGoodnessOfFitEquals(dataSeries, 3, undefined) // Overshooting the length of the series
  })

  test('Correct behaviour of a series after several pushed values, function y = 3x - 6, noisefree, 3 datapoints, uniform (halved) weights', () => {
    const dataSeries = createTSLinearSeries(3)
    dataSeries.push(5, 9, 0.5)
    dataSeries.push(3, 3, 0.5)
    dataSeries.push(4, 6, 0.5)
    testLength(dataSeries, 3)
    testXLength(dataSeries, 3)
    testYLength(dataSeries, 3)
    testReliable(dataSeries, true)
    testGetX(dataSeries, 0, 5)
    testGetY(dataSeries, 0, 9)
    testGetX(dataSeries, 1, 3)
    testGetY(dataSeries, 1, 3)
    testGetX(dataSeries, 2, 4)
    testGetY(dataSeries, 2, 6)
    testXAtSeriesBegin(dataSeries, 5)
    testYAtSeriesBegin(dataSeries, 9)
    testXAtSeriesEnd(dataSeries, 4)
    testYAtSeriesEnd(dataSeries, 6)
    testNumberOfXValuesAbove(dataSeries, 0, 3)
    testNumberOfYValuesAbove(dataSeries, 0, 3)
    testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfXValuesAbove(dataSeries, 10, 0)
    testNumberOfYValuesAbove(dataSeries, 10, 0)
    testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
    testNumberOfYValuesEqualOrBelow(dataSeries, 10, 3)
    testXSum(dataSeries, 12)
    testYSum(dataSeries, 18)
    testAverageX(dataSeries, 4)
    testAverageY(dataSeries, 6)
    testMinimumX(dataSeries, 3)
    testMinimumY(dataSeries, 3)
    testMaximumX(dataSeries, 5)
    testMaximumY(dataSeries, 9)
    testMedianX(dataSeries, 4)
    testMedianY(dataSeries, 6)
    testXSeries(dataSeries, [5, 3, 4])
    testYSeries(dataSeries, [9, 3, 6])
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
    testGoodnessOfFitEquals(dataSeries, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 0, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 1, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 2, 1)
  })
})

describe('Test behaviour of the TSLinearSeries object when data is pushed out', () => {
  /**
   * @description Test behaviour for a single datapoint
   */
  test('Correct behaviour of a series after several puhed values, function y = 3x - 6, noisefree, 4 datapoints', () => {
    const dataSeries = createTSLinearSeries(3)
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    testLength(dataSeries, 3)
    testXLength(dataSeries, 3)
    testYLength(dataSeries, 3)
    testReliable(dataSeries, true)
    testGetX(dataSeries, 0, 3)
    testGetY(dataSeries, 0, 3)
    testGetX(dataSeries, 1, 4)
    testGetY(dataSeries, 1, 6)
    testGetX(dataSeries, 2, 6)
    testGetY(dataSeries, 2, 12)
    testXAtSeriesBegin(dataSeries, 3)
    testYAtSeriesBegin(dataSeries, 3)
    testXAtSeriesEnd(dataSeries, 6)
    testYAtSeriesEnd(dataSeries, 12)
    testNumberOfXValuesAbove(dataSeries, 0, 3)
    testNumberOfYValuesAbove(dataSeries, 0, 3)
    testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfYValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfXValuesAbove(dataSeries, 10, 0)
    testNumberOfYValuesAbove(dataSeries, 10, 1)
    testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
    testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
    testXSum(dataSeries, 13)
    testYSum(dataSeries, 21)
    testAverageX(dataSeries, 4.333333333333333)
    testAverageY(dataSeries, 7)
    testMinimumX(dataSeries, 3)
    testMinimumY(dataSeries, 3)
    testMaximumX(dataSeries, 6)
    testMaximumY(dataSeries, 12)
    testMedianX(dataSeries, 4)
    testMedianY(dataSeries, 6)
    testXSeries(dataSeries, [3, 4, 6])
    testYSeries(dataSeries, [3, 6, 12])
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
    testGoodnessOfFitEquals(dataSeries, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 0, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 1, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 2, 1)
  })

  test('Correct behaviour of a series after several puhed values, function y = 3x - 6, noisefree, 5 datapoints', () => {
    const dataSeries = createTSLinearSeries(3)
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 3)
    testReliable(dataSeries, true)
    testXAtSeriesBegin(dataSeries, 4)
    testYAtSeriesBegin(dataSeries, 6)
    testXAtSeriesEnd(dataSeries, 1)
    testYAtSeriesEnd(dataSeries, -3)
    testNumberOfXValuesAbove(dataSeries, 0, 3)
    testNumberOfYValuesAbove(dataSeries, 0, 2)
    testNumberOfXValuesEqualOrBelow(dataSeries, 0, 0)
    testNumberOfYValuesEqualOrBelow(dataSeries, 0, 1)
    testNumberOfXValuesAbove(dataSeries, 10, 0)
    testNumberOfYValuesAbove(dataSeries, 10, 1)
    testNumberOfXValuesEqualOrBelow(dataSeries, 10, 3)
    testNumberOfYValuesEqualOrBelow(dataSeries, 10, 2)
    testXSum(dataSeries, 11)
    testYSum(dataSeries, 15)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
    testGoodnessOfFitEquals(dataSeries, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 0, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 1, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 2, 1)
  })

  test('Series with 5 elements, with 2 noisy datapoints, ideal function y = 3x - 6, uniform weights', () => {
    const dataSeries = createTSLinearSeries(5)
    dataSeries.push(5, 9)
    dataSeries.push(3, 2)
    dataSeries.push(4, 7)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3) // Theoretical noisefree value 3
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6) // Theoretical noisefree value -6
    testCoefficientB(dataSeries, -6)
    testGoodnessOfFitEquals(dataSeries, 0.9858356940509915) // Ideal value 1
    testLocalGoodnessOfFitEquals(dataSeries, 0, 1)
    testXProjectionEquals(dataSeries, 1, -3) // Theoretical noisefree value -3
    testLocalGoodnessOfFitEquals(dataSeries, 1, 0.9645892351274787)
    testXProjectionEquals(dataSeries, 3, 3) // Theoretical noisefree value 3
    testLocalGoodnessOfFitEquals(dataSeries, 2, 0.9645892351274787)
    testXProjectionEquals(dataSeries, 4, 6) // Theoretical noisefree value 6
    testLocalGoodnessOfFitEquals(dataSeries, 3, 1)
    testXProjectionEquals(dataSeries, 5, 9) // Theoretical noisefree value 9
    testLocalGoodnessOfFitEquals(dataSeries, 4, 1)
    testXProjectionEquals(dataSeries, 6, 12) // Theoretical noisefree value 12
  })

  test('Series with 5 elements, with 2 noisy datapoints, ideal function y = 3x - 6, non-uniform weights', () => {
    const dataSeries = createTSLinearSeries(5)
    dataSeries.push(5, 9, 1)
    dataSeries.push(3, 2, 0.5)
    dataSeries.push(4, 7, 0.5)
    dataSeries.push(6, 12, 1)
    dataSeries.push(1, -3, 1)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3) // Theoretical noisefree value 3
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6) // Theoretical noisefree value -6
    testCoefficientB(dataSeries, -6)
    testGoodnessOfFitEquals(dataSeries, 0.9925338310779281) // Ideal value 1
    testLocalGoodnessOfFitEquals(dataSeries, 0, 1)
    testXProjectionEquals(dataSeries, 1, -3) // Theoretical noisefree value -3
    testLocalGoodnessOfFitEquals(dataSeries, 1, 0.9813345776948204)
    testXProjectionEquals(dataSeries, 3, 3) // Theoretical noisefree value 3
    testLocalGoodnessOfFitEquals(dataSeries, 2, 0.9813345776948204)
    testXProjectionEquals(dataSeries, 4, 6) // Theoretical noisefree value 6
    testLocalGoodnessOfFitEquals(dataSeries, 3, 1)
    testXProjectionEquals(dataSeries, 5, 9) // Theoretical noisefree value 9
    testLocalGoodnessOfFitEquals(dataSeries, 4, 1)
    testXProjectionEquals(dataSeries, 6, 12) // Theoretical noisefree value 12
  })
})

/**
 * @description Testing edge cases
 */
describe('Edge-cases', () => {
  test('Edge_01: Series with 5 elements, on the horizontal line y = 6', () => {
    const dataSeries = createTSLinearSeries(5)
    dataSeries.push(1, 6)
    dataSeries.push(2, 6)
    dataSeries.push(3, 6)
    dataSeries.push(4, 6)
    dataSeries.push(5, 6)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 0)
    testCoefficientA(dataSeries, 0)
    testInterceptEquals(dataSeries, 6)
    testCoefficientB(dataSeries, 6)
    testGoodnessOfFitEquals(dataSeries, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 0, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 1, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 2, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 3, 1)
    testLocalGoodnessOfFitEquals(dataSeries, 4, 1)
    testXProjectionEquals(dataSeries, 3.5, 6)
    testYProjectionEquals(dataSeries, 6, undefined)
  })

  test('Edge_02: Series with 5 elements, vertical line x = 6', () => {
    const dataSeries = createTSLinearSeries(5)
    dataSeries.push(6, 1)
    dataSeries.push(6, 2)
    dataSeries.push(6, 3)
    dataSeries.push(6, 4)
    dataSeries.push(6, 5)
    testReliable(dataSeries, false)
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 1, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 2, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 3, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 4, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 5, undefined)
    testXProjectionEquals(dataSeries, 3, undefined)
    testYProjectionEquals(dataSeries, 6, undefined)
    // Recovery afterwards
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
  })

  test('Edge_03: Series with 5 elements, vertical line, x = 6, after pushing out a valid series', () => {
    const dataSeries = createTSLinearSeries(5)
    // Push a valid series
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
    // Inject a bad series
    dataSeries.push(6, 1)
    dataSeries.push(6, 2)
    dataSeries.push(6, 3)
    dataSeries.push(6, 4)
    dataSeries.push(6, 5)
    testReliable(dataSeries, false)
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 1, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 2, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 3, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 4, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 5, undefined)
    testXProjectionEquals(dataSeries, 3, undefined)
    testYProjectionEquals(dataSeries, 6, undefined)
    // Recovery afterwards
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
  })

  test('Edge_04: Series with 5 identical elements (x,y) = (1,1)', () => {
    const dataSeries = createTSLinearSeries(5)
    dataSeries.push(1, 1)
    dataSeries.push(1, 1)
    dataSeries.push(1, 1)
    dataSeries.push(1, 1)
    dataSeries.push(1, 1)
    testReliable(dataSeries, false)
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 1, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 2, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 3, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 4, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 5, undefined)
    testXProjectionEquals(dataSeries, 3, undefined)
    testYProjectionEquals(dataSeries, 6, undefined)
    // Recovery afterwards
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
  })

  test('Edge_05: Series with 5 identical datapoints (x,y) = (1,1), after pushing out a valid series', () => {
    const dataSeries = createTSLinearSeries(5)
    // Push a valid series
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
    // Inject a bad series
    dataSeries.push(1, 1)
    dataSeries.push(1, 1)
    dataSeries.push(1, 1)
    dataSeries.push(1, 1)
    dataSeries.push(1, 1)
    testReliable(dataSeries, false)
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 1, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 2, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 3, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 4, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 5, undefined)
    testXProjectionEquals(dataSeries, 3, undefined)
    testYProjectionEquals(dataSeries, 6, undefined)
    // Recovery afterwards
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
  })

  test('Edge_06: Series with 5 elements, y = x, but no weight', () => {
    const dataSeries = createTSLinearSeries(5)
    dataSeries.push(1, 1, 0)
    dataSeries.push(2, 2, 0)
    dataSeries.push(3, 3, 0)
    dataSeries.push(4, 4, 0)
    dataSeries.push(5, 5, 0)
    testReliable(dataSeries, false)
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 1, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 2, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 3, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 4, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 5, undefined)
    testXProjectionEquals(dataSeries, 3, undefined)
    testYProjectionEquals(dataSeries, 6, undefined)
    // Recovery afterwards
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
  })

  test('Edge_07: Series with 5 elements, y = x, but no weight, after pushing out a valid series', () => {
    const dataSeries = createTSLinearSeries(5)
    // Push a valid series
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
    // Inject a bad series
    dataSeries.push(1, 1, 0)
    dataSeries.push(2, 2, 0)
    dataSeries.push(3, 3, 0)
    dataSeries.push(4, 4, 0)
    dataSeries.push(5, 5, 0)
    testReliable(dataSeries, false)
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 1, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 2, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 3, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 4, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 5, undefined)
    testXProjectionEquals(dataSeries, 3, undefined)
    testYProjectionEquals(dataSeries, 6, undefined)
    // Recovery afterwards
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.push(1, -3)
    testLength(dataSeries, 5)
    testReliable(dataSeries, true)
    testSlopeEquals(dataSeries, 3)
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6)
    testCoefficientB(dataSeries, -6)
  })
})

describe('Test behaviour of the TSLinearSeries object in larger datasets', () => {
  test('STRESS_Theoretical_01: Infinite series with 4000 noisy datapoints, ideal function y = x, uniform weights', () => {
    // Please note: the noise is needed as otherwise the datapoints result to identical slopes. This resulting in a lot of slopes close to each other
    const dataSeries = createTSLinearSeries()

    let j = 0
    let randomvalue
    while (j < 2000) {
      randomvalue = Math.random()
      dataSeries.push(j * 100, (j * 300) - (randomvalue + 6), 1)
      dataSeries.push((j * 100) + randomvalue, (j * 300) - 6, 1)
      j++
    }

    testLength(dataSeries, 4000)
    testSlopeAbove(dataSeries, 0.999999) // Theoretical noisefree value 1
    testGoodnessOfFitAbove(dataSeries, 0.999999) // Theoretical noisefree value 1
  }, 180000) // Timeout in ms

  test('STRESS_Theoretical_02: Infinte series with 4000 noiseless datapoints, ideal function y = 3x - 6, uniform weights', () => {
    // Please note: this noiseless data results in 0.5 * (4000^2) identical slopes. This stress-tests the balancing of the trees (otherwise it will result in a heap overflow)
    const dataSeries = createTSLinearSeries()

    let j = 0
    while (j < 4000) {
      dataSeries.push(j * 100, (j * 300) - 6, 1)
      j++
    }

    testLength(dataSeries, 4000)
    testSlopeEquals(dataSeries, 3) // Theoretical noisefree value 3
    testCoefficientA(dataSeries, 3)
    testInterceptEquals(dataSeries, -6) // Theoretical noisefree value -6
    testCoefficientB(dataSeries, -6)
    testGoodnessOfFitEquals(dataSeries, 1) // Ideal value 1
  }, 180000) // Timeout in ms

  test('STRESS_Theoretical_03: Infinte series with 4000 noisy datapoints, ideal function y = 3x - 6, non-uniform weights', () => {
    // Please note: the noise is needed as otherwise the datapoints result to identical slopes. This resulting in a lot of slopes close to each other
    const dataSeries = createTSLinearSeries()

    let j = 1
    let randomvalue
    let percentage
    while (j < 2001) {
      randomvalue = Math.random()
      percentage = ((j * 100) - randomvalue) / (j * 100)
      dataSeries.push(j * 100, (j * 300) - (randomvalue + 6), percentage)
      dataSeries.push((j * 100) + randomvalue, (j * 300) - 6, percentage)
      j++
    }

    testLength(dataSeries, 4000)
    testSlopeAbove(dataSeries, 0.999999) // Theoretical noisefree value 1
    testGoodnessOfFitAbove(dataSeries, 0.9999999) // Theoretical noisefree value 1
  }, 300000) // Timeout in msx

  /**
   * @description This noiseless data results in 0.5 * (4000^2) identical slopes. This stress-tests the balancing of the trees (otherwise it will result in a heap overflow)
   */
  test('STRESS_Theoretical_04: Limited Series(200) with 4000 noiseless datapoints, ideal function y = 3x - 6, uniform weights', () => {
    const dataSeries = createTSLinearSeries(200)

    let j = 0
    while (j < 4000) {
      dataSeries.push(j * 100, (j * 300) - 6, 1)
      j++
    }

    testLength(dataSeries, 200)
    testSlopeEquals(dataSeries, 3) // Theoretical noisefree value 3
    testInterceptEquals(dataSeries, -6) // Theoretical noisefree value -6
    testGoodnessOfFitEquals(dataSeries, 1) // Ideal value 1
  }, 90000) // Timeout in ms
})

describe('Test behaviour of the TSLinearSeries object after a reset', () => {
  /**
   * @description Test behaviour for a single datapoint
   */
  test('Correct behaviour of a series after several puhed values, function y = 3x - 6, noisefree, 4 datapoints and a reset', () => {
    const dataSeries = createTSLinearSeries(3)
    dataSeries.push(5, 9)
    dataSeries.push(3, 3)
    dataSeries.push(4, 6)
    dataSeries.push(6, 12)
    dataSeries.reset()
    testLength(dataSeries, 0)
    testXAtSeriesBegin(dataSeries, undefined)
    testYAtSeriesBegin(dataSeries, undefined)
    testXAtSeriesEnd(dataSeries, undefined)
    testYAtSeriesEnd(dataSeries, undefined)
    testNumberOfXValuesAbove(dataSeries, 0, undefined)
    testNumberOfYValuesAbove(dataSeries, 0, undefined)
    testNumberOfXValuesEqualOrBelow(dataSeries, 0, undefined)
    testNumberOfYValuesEqualOrBelow(dataSeries, 0, undefined)
    testNumberOfXValuesAbove(dataSeries, 10, undefined)
    testNumberOfYValuesAbove(dataSeries, 10, undefined)
    testNumberOfXValuesEqualOrBelow(dataSeries, 10, undefined)
    testNumberOfYValuesEqualOrBelow(dataSeries, 10, undefined)
    testXSum(dataSeries, undefined)
    testYSum(dataSeries, undefined)
    testSlopeEquals(dataSeries, undefined)
    testCoefficientA(dataSeries, undefined)
    testInterceptEquals(dataSeries, undefined)
    testCoefficientB(dataSeries, undefined)
    testGoodnessOfFitEquals(dataSeries, undefined)
    testLocalGoodnessOfFitEquals(dataSeries, 0, undefined)
  })
})

function testLength (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.length(), expectedValue, `Expected length should be ${expectedValue}, encountered a ${series.length()}`)
}

function testGetX (series: Readonly<TSLinearSeries>, position: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.get(position), expectedValue, `Expected X.get(${position}) to be ${expectedValue}, encountered a ${series.X.get(position)}`)
}

function testGetY (series: Readonly<TSLinearSeries>, position: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.get(position), expectedValue, `Expected X.get(${position}) to be ${expectedValue}, encountered a ${series.Y.get(position)}`)
}

function testXAtSeriesBegin (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.atSeriesBegin(), expectedValue, `Expected X.atSeriesBegin to be ${expectedValue}, encountered a ${series.X.atSeriesBegin()}`)
}

function testYAtSeriesBegin (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.atSeriesBegin(), expectedValue, `Expected Y.atSeriesBegin to be ${expectedValue}, encountered a ${series.Y.atSeriesBegin()}`)
}

function testXAtSeriesEnd (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.atSeriesEnd(), expectedValue, `Expected X.atSeriesEnd to be ${expectedValue}, encountered a ${series.X.atSeriesEnd()}`)
}

function testYAtSeriesEnd (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.atSeriesEnd(), expectedValue, `Expected Y.atSeriesEnd to be ${expectedValue}, encountered a ${series.Y.atSeriesEnd()}`)
}

function testNumberOfXValuesAbove (series: Readonly<TSLinearSeries>, cutoff: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.numberOfValuesAbove(cutoff), expectedValue, `Expected X.numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered a ${series.X.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfYValuesAbove (series: Readonly<TSLinearSeries>, cutoff: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.numberOfValuesAbove(cutoff), expectedValue, `Expected Y.numberOfValuesAbove(${cutoff}) to be ${expectedValue}, encountered a ${series.Y.numberOfValuesAbove(cutoff)}`)
}

function testNumberOfXValuesEqualOrBelow (series: Readonly<TSLinearSeries>, cutoff: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.numberOfValuesEqualOrBelow(cutoff), expectedValue, `Expected X.numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered a ${series.X.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testNumberOfYValuesEqualOrBelow (series: Readonly<TSLinearSeries>, cutoff: Readonly<number>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.numberOfValuesEqualOrBelow(cutoff), expectedValue, `Expected Y.numberOfValuesEqualOrBelow(${cutoff}) to be ${expectedValue}, encountered a ${series.Y.numberOfValuesEqualOrBelow(cutoff)}`)
}

function testXSum (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.sum(), expectedValue, `Expected X.sum to be ${expectedValue}, encountered a ${series.X.sum()}`)
}

function testYSum (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.sum(), expectedValue, `Expected Y.sum to be ${expectedValue}, encountered a ${series.Y.sum()}`)
}

function testAverageX (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.average(), expectedValue, `Expected X.average to be ${expectedValue}, encountered a ${series.X.average()}`)
}

function testAverageY (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.average(), expectedValue, `Expected Y.average to be ${expectedValue}, encountered a ${series.Y.average()}`)
}

function testMinimumX (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.minimum(), expectedValue, `Expected X.minimum to be ${expectedValue}, encountered a ${series.X.minimum()}`)
}

function testMinimumY (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.minimum(), expectedValue, `Expected Y.minimum to be ${expectedValue}, encountered a ${series.Y.minimum()}`)
}

function testMaximumX (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.maximum(), expectedValue, `Expected X.maximum to be ${expectedValue}, encountered a ${series.X.maximum()}`)
}

function testMaximumY (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.maximum(), expectedValue, `Expected Y.maximum to be ${expectedValue}, encountered a ${series.Y.maximum()}`)
}
function testMedianX (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.median(), expectedValue, `Expected X.median to be ${expectedValue}, encountered a ${series.X.median()}`)
}

function testMedianY (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.median(), expectedValue, `Expected Y.median to be ${expectedValue}, encountered a ${series.Y.median()}`)
}
function testXSeries (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number[]>) {
  assert.strictEqual(series.X.series().toString(), expectedValue.toString(), `Expected X.series to be ${expectedValue}, encountered a ${series.X.series()}`)
}

function testYSeries (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number[]>) {
  assert.strictEqual(series.Y.series().toString(), expectedValue.toString(), `Expected Y.series to be ${expectedValue}, encountered a ${series.Y.series()}`)
}
function testXLength (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.X.length(), expectedValue, `Expected X.length to be ${expectedValue}, encountered a ${series.X.length()}`)
}

function testYLength (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.Y.length(), expectedValue, `Expected Y.length to be ${expectedValue}, encountered a ${series.Y.length()}`)
}

function testSlopeAbove (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.isAtLeast(series.slope(), expectedValue, `Expected slope to be ${expectedValue}, encountered a ${series.slope()}`)
}

function testSlopeEquals (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.slope(), expectedValue, `Expected slope to be ${expectedValue}, encountered a ${series.slope()}`)
}

function testInterceptEquals (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.intercept(), expectedValue, `Expected intercept to be ${expectedValue}, encountered ${series.intercept()}`)
}

function testCoefficientA (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.coefficientA(), expectedValue, `Expected coefficientA to be ${expectedValue}, encountered a ${series.coefficientA()}`)
}

function testCoefficientB (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.coefficientB(), expectedValue, `Expected coefficientB to be ${expectedValue}, encountered ${series.coefficientB()}`)
}

function testGoodnessOfFitEquals (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.goodnessOfFit(), expectedValue, `Expected goodnessOfFit to be ${expectedValue}, encountered ${series.goodnessOfFit()}`)
}

function testGoodnessOfFitAbove (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.isAtLeast(series.goodnessOfFit(), expectedValue, `Expected goodnessOfFit to be ${expectedValue}, encountered ${series.goodnessOfFit()}`)
}

function testLocalGoodnessOfFitEquals (series, position, expectedValue) {
  assert.strictEqual(series.localGoodnessOfFit(position), expectedValue, `Expected localGoodnessOfFit at position ${position} to be ${expectedValue}, encountered ${series.localGoodnessOfFit(position)}`)
}

function testXProjectionEquals (series, xValue, expectedValue) {
  assert.strictEqual(series.projectX(xValue), expectedValue, `Expected projectX for x value ${xValue} to be y = ${expectedValue}, encountered ${series.projectX(xValue)}`)
}

function testYProjectionEquals (series, yValue, expectedValue) {
  assert.strictEqual(series.projectY(yValue), expectedValue, `Expected projectY for y value ${yValue} to be x = ${expectedValue}, encountered ${series.projectY(yValue)}`)
}

function testReliable (series: Readonly<TSLinearSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.reliable(), expectedValue, `Expected reliable to be ${expectedValue}, encountered ${series.reliable()}`)
}
