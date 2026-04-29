/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file Tests of the InfiniteSeriesMetrics object.
 * Please note: this file contains a stress tests of the length(), sum() and average() functions, to detect any issues with numerical stability due to accumulator behaviour
 */
// @vitest-environment node
import { test, assert, describe } from 'vitest'
import { replayRowingSession } from '../../recorders/RowingReplayer.js'
import { createInfiniteSeriesMetrics } from './InfiniteSeriesMetrics.ts'

/**
 * @description Test behaviour for no datapoints
 */
describe('Test behaviour of the InfiniteSeries startup behaviour', () => {
  test('Series behaviour with an empty series', () => {
    const dataSeries = createInfiniteSeriesMetrics()
    testLength(dataSeries, 0)
    testSum(dataSeries, undefined)
    testAverage(dataSeries, undefined)
    testMinimum(dataSeries, undefined)
    testMaximum(dataSeries, undefined)
  })
})

describe('Test behaviour of the TSQuadraticSeries object when data is pushed', () => {
  /**
   * @description Test behaviour for a single datapoint
   */
  test('Series behaviour with a single pushed value. Series = [9]', () => {
    const dataSeries = createInfiniteSeriesMetrics()
    dataSeries.push(9)
    testLength(dataSeries, 1)
    testSum(dataSeries, 9)
    testAverage(dataSeries, 9)
    testMinimum(dataSeries, 9)
    testMaximum(dataSeries, 9)
  })

  /**
   * @description Test behaviour for two datapoints
   */
  test('Series behaviour with a second pushed value. Series = [9, 3]', () => {
    const dataSeries = createInfiniteSeriesMetrics()
    dataSeries.push(9)
    dataSeries.push(3)
    testLength(dataSeries, 2)
    testSum(dataSeries, 12)
    testAverage(dataSeries, 6)
    testMinimum(dataSeries, 3)
    testMaximum(dataSeries, 9)
  })

  /**
   * @description Test behaviour for three datapoints
   */
  test('Series behaviour with a third pushed value. Series = [9, 3, 6]', () => {
    const dataSeries = createInfiniteSeriesMetrics()
    dataSeries.push(9)
    dataSeries.push(3)
    dataSeries.push(6)
    testLength(dataSeries, 3)
    testSum(dataSeries, 18)
    testAverage(dataSeries, 6)
    testMinimum(dataSeries, 3)
    testMaximum(dataSeries, 9)
  })

  /**
   * @description Test behaviour for four datapoints
   */
  test('Series behaviour with a fourth pushed value. Series = [9, 3, 6, 12]', () => {
    const dataSeries = createInfiniteSeriesMetrics()
    dataSeries.push(9)
    dataSeries.push(3)
    dataSeries.push(6)
    dataSeries.push(12)
    testLength(dataSeries, 4)
    testSum(dataSeries, 30)
    testAverage(dataSeries, 7.5)
    testMinimum(dataSeries, 3)
    testMaximum(dataSeries, 12)
  })

  /**
   * @description Test behaviour for five datapoints
   */
  test('Series behaviour with a fifth pushed value. Series = [9, 3, 6, 12, -5]', () => {
    const dataSeries = createInfiniteSeriesMetrics()
    dataSeries.push(9)
    dataSeries.push(3)
    dataSeries.push(6)
    dataSeries.push(12)
    dataSeries.push(-5)
    testSum(dataSeries, 25)
    testAverage(dataSeries, 5)
    testMinimum(dataSeries, -5)
    testMaximum(dataSeries, 12)
  })
})

describe('Test behaviour of the InfiniteSeries object after a reset', () => {
  /**
    * @description Test behaviour after a reset()
    */
  test('Series behaviour with a five pushed values followed by a reset, Series = []', () => {
    const dataSeries = createInfiniteSeriesMetrics()
    dataSeries.push(9)
    dataSeries.push(3)
    dataSeries.push(6)
    dataSeries.push(12)
    dataSeries.push(-5)
    dataSeries.reset()
    testLength(dataSeries, 0)
    testSum(dataSeries, undefined)
    testAverage(dataSeries, undefined)
    testMinimum(dataSeries, undefined)
    testMaximum(dataSeries, undefined)
  })
})

/**
 * These stress tests test the reliability of the sum(), average() and length() function after a huge number of updates/
 * Javascript maximum array length is 4294967295, as heap memory is limited, we stay with 2^25 datapoints
 * This test takes several seconds due to the many large array shifts, so only run them manually when changing the series module
 */
describe('Test behaviour of the Series object accumulator in heavy update scenarios', () => {
  test('STRESS_RAND_01: Stress test of the series object, 67.108.864 datapoints, with a maxLength of 33.554.432 (2^25)', () => {
    const dataSeries = createInfiniteSeriesMetrics()
    let j = 0
    let randomvalue
    while (j < 33554432) {
      randomvalue = Math.random()
      dataSeries.push(randomvalue)
      dataSeries.push(1 - randomvalue)
      j++
    }
    testLength(dataSeries, 67108864)
    testSum(dataSeries, 33554432)
    testAverage(dataSeries, 0.5)
  }, 60000) // Timeout value in ms

  test('STRESS_Theoretical_01: Stress test of the series object with synthetic clean data', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Theoretical_Simulation_Clean.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 7625)
    testSum(dataSeries, 99.69316763863324)
    testAverage(dataSeries, 0.013074513788673211)
    testMinimum(dataSeries, 0.008003880727756041)
    testMaximum(dataSeries, 0.09902315934278767)
  })

  test('STRESS_Theoretical_02: Stress test of the series object with synthetic random noisy data', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Theoretical_Simulation_Random_Noise.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 20855)
    testSum(dataSeries, 249.71006725348755)
    testAverage(dataSeries, 0.011973630652289022)
    testMinimum(dataSeries, 0.008031826768808814)
    testMaximum(dataSeries, 0.09945491613002025)
  })

  test('STRESS_Theoretical_03: Stress test of the series object with synthetic systematic noisy data', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Theoretical_Simulation_Systematic_Noise.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 20855)
    testSum(dataSeries, 249.70942736205166)
    testAverage(dataSeries, 0.011973599969410293)
    testMinimum(dataSeries, 0.007986950731716291)
    testMaximum(dataSeries, 0.09963998201929716)
  })

  test('STRESS_C2_ModelC_01: Stress test of the series object with recorded data from a C2 Model C', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Concept2_Model_C.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 7471)
    testSum(dataSeries, 182.11881100000005)
    testAverage(dataSeries, 0.024376764957836975)
    testMinimum(dataSeries, 0.017295000000103755)
    testMaximum(dataSeries, 2.3263909999998305)
  })

  test('STRESS_C2_RowErg_01: Stress test of the series object with recorded data from a C2 RowErg', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Concept2_RowErg_Session_2000meters.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 63000)
    testSum(dataSeries, 591.1652090000008)
    testAverage(dataSeries, 0.00938357474603176)
    testMinimum(dataSeries, 0.008152)
    testMaximum(dataSeries, 0.080654)
  })

  test('STRESS_DKN_R320_01: Stress test of the series object with recorded data from a DKN R-320', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/DKNR320.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 81)
    testSum(dataSeries, 23.977433208000004)
    testAverage(dataSeries, 0.296017693925926)
    testMinimum(dataSeries, 0.158435164)
    testMaximum(dataSeries, 0.822650475)
  })

  test('STRESS_Merarch_R50_01: Stress test of the series object with recorded data from a Merarch R-50', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Merach_R50_510m.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 2408)
    testSum(dataSeries, 167.43930899999987)
    testAverage(dataSeries, 0.06953459676079729)
    testMinimum(dataSeries, 0.04789000000005217)
    testMaximum(dataSeries, 0.7071060000000671)
  })

  test('STRESS_NordicT_RX800_01: Stress test of the series object with recorded data from a NordicTrack RX800', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/RX800.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 931)
    testSum(dataSeries, 146.5437243100002)
    testAverage(dataSeries, 0.15740464480128913)
    testMinimum(dataSeries, 0.020203137)
    testMaximum(dataSeries, 115.678730412)
  })

  test('STRESS_Oartec_Slider_01: Stress test of the series object with recorded data from a Oartec Slider', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Oartec_Slider.csv', realtime: false, loop: false })

    // Test if the accumulators do not contain any residu
    testLength(dataSeries, 2474)
    testSum(dataSeries, 67.8354139999999)
    testAverage(dataSeries, 0.02741932659660465)
    testMinimum(dataSeries, 0.017505000000028303)
    testMaximum(dataSeries, 0.9358429999999771)
  })

  test('STRESS_Schwinn_Wndrggr_01: Stress test of the series object with recorded data from a Schwinn Windrigger', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Schwinn_Windrigger.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 1626)
    testSum(dataSeries, 126.66266099999996)
    testAverage(dataSeries, 0.07789831549815496)
    testMinimum(dataSeries, 0.047105)
    testMaximum(dataSeries, 0.84465)
  })

  test('STRESS_Sportstech_WRX700_01: Stress test of the series object with recorded data from a SportsTech WRX700', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/WRX700_2magnets.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 238)
    testSum(dataSeries, 48.124197322)
    testAverage(dataSeries, 0.20220250975630252)
    testMinimum(dataSeries, 0.094474655)
    testMaximum(dataSeries, 0.792073624)
  })

  test('STRESS_Sportstech_WRX700_02: Stress test of the series object with recorded data of a complete session from a SportsTech WRX700', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/WRX700_2magnets_session.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 11887)
    testSum(dataSeries, 2445.128421582004)
    testAverage(dataSeries, 0.20569768836392732)
    testMinimum(dataSeries, 0.09661396)
    testMaximum(dataSeries, 75.470463061)
  })

  test('STRESS_TopiomV2_01: Stress test of the series object with recorded data from a Topiom V2', async () => {
    const dataSeries = createInfiniteSeriesMetrics()

    // Inject the recorded datapoints
    await replayRowingSession(dataSeries.push, { filename: 'recordings/Topiom_V2_1magnet.csv', realtime: false, loop: false })

    // Test if the accumulator data
    testLength(dataSeries, 7732)
    testSum(dataSeries, 2460.304010999993)
    testAverage(dataSeries, 0.31819762170201665)
    testMinimum(dataSeries, 0.2231650000001082)
    testMaximum(dataSeries, 3.2078840000000355)
  })
})

function testLength (series: Readonly<InfiniteSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.length(), expectedValue, `Expected length should be ${expectedValue}, encountered ${series.length()}`)
}

function testSum (series: Readonly<InfiniteSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.sum(), expectedValue, `Expected sum to be ${expectedValue}, encountered ${series.sum()}`)
}

function testAverage (series: Readonly<InfiniteSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.average(), expectedValue, `Expected average to be ${expectedValue}, encountered ${series.average()}`)
}

function testMinimum (series: Readonly<InfiniteSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.minimum(), expectedValue, `Expected minimum to be ${expectedValue}, encountered ${series.minimum()}`)
}

function testMaximum (series: Readonly<InfiniteSeries>, expectedValue: Readonly<number>) {
  assert.strictEqual(series.maximum(), expectedValue, `Expected maximum to be ${expectedValue}, encountered ${series.maximum()}`)
}
