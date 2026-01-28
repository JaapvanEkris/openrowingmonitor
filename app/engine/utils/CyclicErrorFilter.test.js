'use strict'
/**
 * @copyright [OpenRowingMonitor]{@link https://github.com/JaapvanEkris/openrowingmonitor}
 *
 * @file This tests all functions of the CyclicErrorCorrection filter
 */
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createCyclicErrorFilter } from './CyclicErrorFilter.js'
import { createTSLinearSeries } from './TSLinearSeries.js'

test('Correct behaviour of the filter directly after initialisation, withou filter updates, including domain filter behaviour and sync with flank', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 4,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 20,
    minimumTimeBetweenImpulses: 0.5,
    maximumTimeBetweenImpulses: 1
  }
  const baseRegressionFunction = createTSLinearSeries(20)

  let cleanCurrentDt
  let currentDtAtSeriesBegin
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)
  // As no changes have been made to the filter profiles, one would expect that clean = raw values, and a Goodness of Fit of 1 inside the domain
  cleanCurrentDt = CECFilter.applyFilter(1.6, 5)
  testCleanValueEquals(cleanCurrentDt, 1.6)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.5, 6)
  testCleanValueEquals(cleanCurrentDt, 1.5)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.4, 7)
  testCleanValueEquals(cleanCurrentDt, 1.4)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.04000000000000007)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, undefined)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0)
  cleanCurrentDt = CECFilter.applyFilter(1.3, 8)
  testCleanValueEquals(cleanCurrentDt, 1.3)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.15999999999999992)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.6)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.6)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.000001)
  cleanCurrentDt = CECFilter.applyFilter(1.2, 9)
  testCleanValueEquals(cleanCurrentDt, 1.2)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.3600000000000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.5)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.5)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.000001)
  cleanCurrentDt = CECFilter.applyFilter(1.1, 10)
  testCleanValueEquals(cleanCurrentDt, 1.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.6399999999999997)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.4)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.4)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.04000000000000007)
  cleanCurrentDt = CECFilter.applyFilter(1.0, 11)
  testCleanValueEquals(cleanCurrentDt, 1.0)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.3)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.3)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.15999999999999992)
  cleanCurrentDt = CECFilter.applyFilter(0.9, 12)
  testCleanValueEquals(cleanCurrentDt, 0.9)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.2)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.2)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.3600000000000001)
  cleanCurrentDt = CECFilter.applyFilter(0.8, 13)
  testCleanValueEquals(cleanCurrentDt, 0.8)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.1)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.1)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.6399999999999997)
  cleanCurrentDt = CECFilter.applyFilter(0.7, 14)
  testCleanValueEquals(cleanCurrentDt, 0.7)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.6, 15)
  testCleanValueEquals(cleanCurrentDt, 0.6)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.9)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.9)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.5, 16)
  testCleanValueEquals(cleanCurrentDt, 0.5)
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.8)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.8)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.4, 17)
  testCleanValueEquals(cleanCurrentDt, 0.4)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.6400000000000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.7)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.7)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.3, 18)
  testCleanValueEquals(cleanCurrentDt, 0.3)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.36)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.6)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.6)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.2, 19)
  testCleanValueEquals(cleanCurrentDt, 0.2)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.16000000000000003)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.5)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.5)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 1.0)
  cleanCurrentDt = CECFilter.applyFilter(0.1, 20)
  testCleanValueEquals(cleanCurrentDt, 0.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.03999999999999998)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.4)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.4)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.6400000000000001)
  cleanCurrentDt = CECFilter.applyFilter(0.0, 21)
  testCleanValueEquals(cleanCurrentDt, 0.0)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.3)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.3)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.36)
  cleanCurrentDt = CECFilter.applyFilter(-0.1, 22)
  testCleanValueEquals(cleanCurrentDt, -0.1)
  testGoodnessOfFitEquals(cleanCurrentDt, 0.000001)
  currentDtAtSeriesBegin = CECFilter.atSeriesBegin()
  testRawValueAtBeginEquals(currentDtAtSeriesBegin, 0.2)
  testCleanValueAtBeginEquals(currentDtAtSeriesBegin, 0.2)
  testGoodnessOfFitAtBeginEquals(currentDtAtSeriesBegin, 0.16000000000000003)
})

test('Correct behaviour of the filter after exposing it to an updated filter, agressiveness 1.0', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 20,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries(20)
  let cleanCurrentDt
  let currentDtAtSeriesBegin
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Initialize the Linear regressor to create a function where y = x
  let i = 0
  while (i < 20) {
    baseRegressionFunction.push(i, i)
    i++
  }

  // Inecting the datapoints. In essence,
  // The even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // the odd datapoints are multipied by 0.9 (so correction factor is 1/0.9 = 1.1)
  cleanCurrentDt = CECFilter.applyFilter(0, 0)
  CECFilter.recordRawDatapoint(0, 0, 0)
  CECFilter.recordRawDatapoint(1, 1, 0.9)
  CECFilter.recordRawDatapoint(2, 2, 2.2)
  CECFilter.recordRawDatapoint(3, 3, 2.7)
  CECFilter.recordRawDatapoint(4, 4, 4.4)
  CECFilter.recordRawDatapoint(5, 5, 4.5)
  CECFilter.recordRawDatapoint(6, 6, 6.6)
  CECFilter.recordRawDatapoint(7, 7, 6.3)
  CECFilter.recordRawDatapoint(8, 8, 8.8)
  CECFilter.recordRawDatapoint(9, 9, 8.1)
  CECFilter.recordRawDatapoint(10, 10, 11.0)
  CECFilter.recordRawDatapoint(11, 11, 9.9)
  CECFilter.recordRawDatapoint(12, 12, 13.2)
  CECFilter.recordRawDatapoint(13, 13, 11.7)
  CECFilter.recordRawDatapoint(14, 14, 15.4)
  CECFilter.recordRawDatapoint(15, 15, 13.5)
  CECFilter.recordRawDatapoint(16, 16, 17.6)
  CECFilter.recordRawDatapoint(17, 17, 15.3)
  CECFilter.recordRawDatapoint(18, 18, 19.8)
  CECFilter.recordRawDatapoint(19, 19, 17.1)
  CECFilter.recordRawDatapoint(20, 20, 22.0)
  CECFilter.recordRawDatapoint(21, 21, 18.9)
  CECFilter.recordRawDatapoint(22, 22, 24.2)
  CECFilter.recordRawDatapoint(23, 23, 20.7)

  // Process the 20 datapoints, filling the entire array
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()

  // For even magnets, the correction factor should be 0.9
  // For off magnets, the correction factor should be 1.1
  cleanCurrentDt = CECFilter.applyFilter(0.9, 31)
  testCleanValueEquals(cleanCurrentDt, 0.9698421280169801) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(2.2, 32)
  testCleanValueEquals(cleanCurrentDt, 1.9983559345572512) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(2.7, 33)
  testCleanValueEquals(cleanCurrentDt, 2.952337118298812) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(4.4, 34)
  testCleanValueEquals(cleanCurrentDt, 3.9753065019905667) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(4.5, 35)
  testCleanValueEquals(cleanCurrentDt, 4.934832108580643) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(6.6, 36)
  testCleanValueEquals(cleanCurrentDt, 5.952257069423881) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(6.3, 37)
  testCleanValueEquals(cleanCurrentDt, 6.917327098862476) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(8.8, 38)
  testCleanValueEquals(cleanCurrentDt, 7.929207636857198) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(8.1, 39)
  testCleanValueEquals(cleanCurrentDt, 8.899822089144307) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(11.0, 40)
  testCleanValueEquals(cleanCurrentDt, 9.906158204290513) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(9.9, 41)
  testCleanValueEquals(cleanCurrentDt, 10.882317079426139) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(13.2, 42)
  testCleanValueEquals(cleanCurrentDt, 11.883108771723826) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(11.7, 43)
  testCleanValueEquals(cleanCurrentDt, 12.864812069707972) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(15.4, 44)
  testCleanValueEquals(cleanCurrentDt, 13.860059339157145) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(13.5, 45)
  testCleanValueEquals(cleanCurrentDt, 14.847307059989802) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(17.6, 46)
  testCleanValueEquals(cleanCurrentDt, 15.83700990659046) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(15.3, 47)
  testCleanValueEquals(cleanCurrentDt, 16.829802050271635) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(19.8, 48)
  testCleanValueEquals(cleanCurrentDt, 17.813960474023773) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(17.1, 49)
  testCleanValueEquals(cleanCurrentDt, 18.812297040553467) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(22.0, 50)
  testCleanValueEquals(cleanCurrentDt, 19.79091104145709) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
  cleanCurrentDt = CECFilter.applyFilter(18.9, 51)
  testCleanValueEquals(cleanCurrentDt, 20.794792030835296) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.0000000000000027)
  cleanCurrentDt = CECFilter.applyFilter(24.2, 52)
  testCleanValueEquals(cleanCurrentDt, 21.767861608890403) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt, 0.9999370176071775)
})

test('Correct behaviour of the filter after exposing it to an updated filter, agressiveness 1.1', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.1,
    systematicErrorNumberOfDatapoints: 20,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries(20)
  let cleanCurrentDt
  let currentDtAtSeriesBegin
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Initialize the Linear regressor to create a function where y = x
  let i = 0
  while (i < 20) {
    baseRegressionFunction.push(i, i)
    i++
  }

  // Inecting the datapoints. In essence,
  // The even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // the odd datapoints are multipied by 0.9 (so correction factor is 1/0.9 = 1.1)
  cleanCurrentDt = CECFilter.applyFilter(0, 0)
  CECFilter.recordRawDatapoint(0, 0, 0)
  CECFilter.recordRawDatapoint(1, 1, 0.9)
  CECFilter.recordRawDatapoint(2, 2, 2.2)
  CECFilter.recordRawDatapoint(3, 3, 2.7)
  CECFilter.recordRawDatapoint(4, 4, 4.4)
  CECFilter.recordRawDatapoint(5, 5, 4.5)
  CECFilter.recordRawDatapoint(6, 6, 6.6)
  CECFilter.recordRawDatapoint(7, 7, 6.3)
  CECFilter.recordRawDatapoint(8, 8, 8.8)
  CECFilter.recordRawDatapoint(9, 9, 8.1)
  CECFilter.recordRawDatapoint(10, 10, 11.0)
  CECFilter.recordRawDatapoint(11, 11, 9.9)
  CECFilter.recordRawDatapoint(12, 12, 13.2)
  CECFilter.recordRawDatapoint(13, 13, 11.7)
  CECFilter.recordRawDatapoint(14, 14, 15.4)
  CECFilter.recordRawDatapoint(15, 15, 13.5)
  CECFilter.recordRawDatapoint(16, 16, 17.6)
  CECFilter.recordRawDatapoint(17, 17, 15.3)
  CECFilter.recordRawDatapoint(18, 18, 19.8)
  CECFilter.recordRawDatapoint(19, 19, 17.1)
  CECFilter.recordRawDatapoint(20, 20, 22.0)
  CECFilter.recordRawDatapoint(21, 21, 18.9)
  CECFilter.recordRawDatapoint(22, 22, 24.2)
  CECFilter.recordRawDatapoint(23, 23, 20.7)

  // Process the 20 datapoints, filling the entire array
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()

  // For even magnets, the correction factor should be 0.9
  // For off magnets, the correction factor should be 1.1
  cleanCurrentDt = CECFilter.applyFilter(0.9, 31)
  testCleanValueEquals(cleanCurrentDt, 0.9900000000000041) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(2.2, 32)
  testCleanValueEquals(cleanCurrentDt, 1.9799999999999967) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(2.7, 33)
  testCleanValueEquals(cleanCurrentDt, 2.970000000000004) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(4.4, 34)
  testCleanValueEquals(cleanCurrentDt, 3.9599999999999973) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(4.5, 35)
  testCleanValueEquals(cleanCurrentDt, 4.950000000000004) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(6.6, 36)
  testCleanValueEquals(cleanCurrentDt, 5.939999999999998) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(6.3, 37)
  testCleanValueEquals(cleanCurrentDt, 6.930000000000004) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(8.8, 38)
  testCleanValueEquals(cleanCurrentDt, 7.919999999999999) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(8.1, 39)
  testCleanValueEquals(cleanCurrentDt, 8.910000000000002) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(11.0, 40)
  testCleanValueEquals(cleanCurrentDt, 9.9) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(9.9, 41)
  testCleanValueEquals(cleanCurrentDt, 10.890000000000002) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(13.2, 42)
  testCleanValueEquals(cleanCurrentDt, 11.88) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(11.7, 43)
  testCleanValueEquals(cleanCurrentDt, 12.870000000000001) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(15.4, 44)
  testCleanValueEquals(cleanCurrentDt, 13.860000000000003) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(13.5, 45)
  testCleanValueEquals(cleanCurrentDt, 14.850000000000003) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(17.6, 46)
  testCleanValueEquals(cleanCurrentDt, 15.840000000000003) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(15.3, 47)
  testCleanValueEquals(cleanCurrentDt, 16.830000000000002) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(19.8, 48)
  testCleanValueEquals(cleanCurrentDt, 17.820000000000004) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(17.1, 49)
  testCleanValueEquals(cleanCurrentDt, 18.810000000000002) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(22.0, 50)
  testCleanValueEquals(cleanCurrentDt, 19.800000000000004) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
  cleanCurrentDt = CECFilter.applyFilter(18.9, 51)
  testCleanValueEquals(cleanCurrentDt, 20.79) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1.000000000000001)
  cleanCurrentDt = CECFilter.applyFilter(24.2, 52)
  testCleanValueEquals(cleanCurrentDt, 21.780000000000005) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt, 1)
})

function testCleanValueEquals (object, expectedValue) {
  assert.ok(object.clean === expectedValue, `Expected cleaned currentDt  value to be ${expectedValue}, encountered ${object.clean}`)
}

function testGoodnessOfFitEquals (object, expectedValue) {
  assert.ok(object.goodnessOfFit === expectedValue, `Expected goodnessOfFit to be ${expectedValue}, encountered ${object.goodnessOfFit}`)
}

function testRawValueAtBeginEquals (object, expectedValue) {
  assert.ok(object.raw === expectedValue, `Expected raw value atSeriesBegin() to be ${expectedValue}, encountered ${object.raw}`)
}

function testCleanValueAtBeginEquals (object, expectedValue) {
  assert.ok(object.clean === expectedValue, `Expected clean value atSeriesBegin() to be ${expectedValue}, encountered ${object.clean}`)
}

function testGoodnessOfFitAtBeginEquals (object, expectedValue) {
  assert.ok(object.goodnessOfFit === expectedValue, `Expected goodnessOfFit atSeriesBegin() to be ${expectedValue}, encountered ${object.goodnessOfFit}`)
}

test.run()
