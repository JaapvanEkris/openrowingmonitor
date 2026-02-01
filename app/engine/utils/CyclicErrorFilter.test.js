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

test('Correct behaviour of the filter after exposing it to an updated filter with noisy linear regressor, agressiveness 1.0', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 20,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries()
  let cleanCurrentDt = []
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Inecting the datapoints. In essence,
  // The even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // the odd datapoints are multipied by 0.9 (so correction factor is 1/0.9 = 1.1)
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 0)
  baseRegressionFunction.push(0, 0, 1)
  CECFilter.recordRawDatapoint(0, 0, 0)
  baseRegressionFunction.push(1, 0.9, 1)
  CECFilter.recordRawDatapoint(1, 1, 0.9)
  baseRegressionFunction.push(2, 2.2, 1)
  CECFilter.recordRawDatapoint(2, 2, 2.2)
  baseRegressionFunction.push(3, 2.7, 1)
  CECFilter.recordRawDatapoint(3, 3, 2.7)
  baseRegressionFunction.push(4, 4.4, 1)
  CECFilter.recordRawDatapoint(4, 4, 4.4)
  baseRegressionFunction.push(5, 4.5, 1)
  CECFilter.recordRawDatapoint(5, 5, 4.5)
  baseRegressionFunction.push(6, 6.6, 1)
  CECFilter.recordRawDatapoint(6, 6, 6.6)
  baseRegressionFunction.push(7, 6.3, 1)
  CECFilter.recordRawDatapoint(7, 7, 6.3)
  baseRegressionFunction.push(8, 8.8, 1)
  CECFilter.recordRawDatapoint(8, 8, 8.8)
  baseRegressionFunction.push(9, 8.1, 1)
  CECFilter.recordRawDatapoint(9, 9, 8.1)
  baseRegressionFunction.push(10, 11.0, 1)
  CECFilter.recordRawDatapoint(10, 10, 11.0)
  baseRegressionFunction.push(11, 9.9, 1)
  CECFilter.recordRawDatapoint(11, 11, 9.9)
  baseRegressionFunction.push(12, 13.2, 1)
  CECFilter.recordRawDatapoint(12, 12, 13.2)
  baseRegressionFunction.push(13, 11.7, 1)
  CECFilter.recordRawDatapoint(13, 13, 11.7)
  baseRegressionFunction.push(14, 15.4, 1)
  CECFilter.recordRawDatapoint(14, 14, 15.4)
  baseRegressionFunction.push(15, 13.5, 1)
  CECFilter.recordRawDatapoint(15, 15, 13.5)
  baseRegressionFunction.push(16, 17.6, 1)
  CECFilter.recordRawDatapoint(16, 16, 17.6)
  baseRegressionFunction.push(17, 15.3, 1)
  CECFilter.recordRawDatapoint(17, 17, 15.3)
  baseRegressionFunction.push(18, 19.8, 1)
  CECFilter.recordRawDatapoint(18, 18, 19.8)
  baseRegressionFunction.push(19, 17.1, 1)
  CECFilter.recordRawDatapoint(19, 19, 17.1)
  baseRegressionFunction.push(20, 22.0, 1)
  CECFilter.recordRawDatapoint(20, 20, 22.0)
  baseRegressionFunction.push(21, 18.9, 1)
  CECFilter.recordRawDatapoint(21, 21, 18.9)
  baseRegressionFunction.push(22, 24.2, 1)
  CECFilter.recordRawDatapoint(22, 22, 24.2)
  baseRegressionFunction.push(23, 20.7, 1)
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
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 30)
  testCleanValueEquals(cleanCurrentDt[0], 0.04672198397237463) // Ideal value 0.0
  testGoodnessOfFitEquals(cleanCurrentDt[0], 0.9996128305851867)
  cleanCurrentDt[1] = CECFilter.applyFilter(0.9, 31)
  testCleanValueEquals(cleanCurrentDt[1], 0.9464106093514552) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt[1], 0.9999999999999972)
  cleanCurrentDt[2] = CECFilter.applyFilter(2.2, 32)
  testCleanValueEquals(cleanCurrentDt[2], 2.019064533625233) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt[2], 0.9996128305851867)
  cleanCurrentDt[3] = CECFilter.applyFilter(2.7, 33)
  testCleanValueEquals(cleanCurrentDt[3], 2.9326757959991148) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt[3], 0.9999999999999972)
  cleanCurrentDt[4] = CECFilter.applyFilter(4.4, 34)
  testCleanValueEquals(cleanCurrentDt[4], 3.9914070832780917) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt[4], 0.9996128305851867)
  cleanCurrentDt[5] = CECFilter.applyFilter(4.5, 35)
  testCleanValueEquals(cleanCurrentDt[5], 4.918940982646774) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt[5], 0.9999999999999972)
  cleanCurrentDt[6] = CECFilter.applyFilter(6.6, 36)
  testCleanValueEquals(cleanCurrentDt[6], 5.96374963293095) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt[6], 0.9996128305851867)
  cleanCurrentDt[7] = CECFilter.applyFilter(6.3, 37)
  testCleanValueEquals(cleanCurrentDt[7], 6.905206169294433) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt[7], 0.9999999999999972)
  cleanCurrentDt[8] = CECFilter.applyFilter(8.8, 38)
  testCleanValueEquals(cleanCurrentDt[8], 7.936092182583809) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt[8], 0.9996128305851867)
  cleanCurrentDt[9] = CECFilter.applyFilter(8.1, 39)
  testCleanValueEquals(cleanCurrentDt[9], 8.891471355942093) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt[9], 0.9999999999999972)
  cleanCurrentDt[10] = CECFilter.applyFilter(11.0, 40)
  testCleanValueEquals(cleanCurrentDt[10], 9.90843473223667) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt[10], 0.9996128305851867)
  cleanCurrentDt[11] = CECFilter.applyFilter(9.9, 41)
  testCleanValueEquals(cleanCurrentDt[11], 10.877736542589753) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt[11], 0.9999999999999972)
  cleanCurrentDt[12] = CECFilter.applyFilter(13.2, 42)
  testCleanValueEquals(cleanCurrentDt[12], 11.880777281889527) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt[12], 0.9996128305851867)
  cleanCurrentDt[13] = CECFilter.applyFilter(11.7, 43)
  testCleanValueEquals(cleanCurrentDt[13], 12.864001729237412) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt[13], 0.9999999999999972)
  cleanCurrentDt[14] = CECFilter.applyFilter(15.4, 44)
  testCleanValueEquals(cleanCurrentDt[14], 13.853119831542385) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt[14], 0.9996128305851867)
  cleanCurrentDt[15] = CECFilter.applyFilter(13.5, 45)
  testCleanValueEquals(cleanCurrentDt[15], 14.850266915885072) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt[15], 0.9999999999999972)
  cleanCurrentDt[16] = CECFilter.applyFilter(17.6, 46)
  testCleanValueEquals(cleanCurrentDt[16], 15.825462381195244) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt[16], 0.9996128305851867)
  cleanCurrentDt[17] = CECFilter.applyFilter(15.3, 47)
  testCleanValueEquals(cleanCurrentDt[17], 16.836532102532733) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt[17], 0.9999999999999972)
  cleanCurrentDt[18] = CECFilter.applyFilter(19.8, 48)
  testCleanValueEquals(cleanCurrentDt[18], 17.797804930848105) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt[18], 0.9996128305851867)
  cleanCurrentDt[19] = CECFilter.applyFilter(17.1, 49)
  testCleanValueEquals(cleanCurrentDt[19], 18.82279728918039) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt[19], 0.9999999999999972)
  cleanCurrentDt[20] = CECFilter.applyFilter(22.0, 50)
  testCleanValueEquals(cleanCurrentDt[20], 19.770147480500963) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt[20], 0.9996128305851867)
  cleanCurrentDt[21] = CECFilter.applyFilter(18.9, 51)
  testCleanValueEquals(cleanCurrentDt[21], 20.80906247582805) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt[21], 0.9999999999999972)
  cleanCurrentDt[22] = CECFilter.applyFilter(24.2, 52)
  testCleanValueEquals(cleanCurrentDt[22], 21.74249003015382) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt[22], 0.9996128305851867)

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  baseRegressionFunction.push(30, cleanCurrentDt[0].clean, cleanCurrentDt[0].goodnessOfFit)
  CECFilter.recordRawDatapoint(30, 30, cleanCurrentDt[0].clean)
  baseRegressionFunction.push(31, cleanCurrentDt[1].clean, cleanCurrentDt[1].goodnessOfFit)
  CECFilter.recordRawDatapoint(31, 31, cleanCurrentDt[1].clean)
  baseRegressionFunction.push(32, cleanCurrentDt[2].clean, cleanCurrentDt[2].goodnessOfFit)
  CECFilter.recordRawDatapoint(32, 32, cleanCurrentDt[2].clean)
  baseRegressionFunction.push(33, cleanCurrentDt[3].clean, cleanCurrentDt[3].goodnessOfFit)
  CECFilter.recordRawDatapoint(33, 33, cleanCurrentDt[3].clean)
  baseRegressionFunction.push(34, cleanCurrentDt[4].clean, cleanCurrentDt[4].goodnessOfFit)
  CECFilter.recordRawDatapoint(34, 34, cleanCurrentDt[4].clean)
  baseRegressionFunction.push(35, cleanCurrentDt[5].clean, cleanCurrentDt[5].goodnessOfFit)
  CECFilter.recordRawDatapoint(35, 35, cleanCurrentDt[5].clean)
  baseRegressionFunction.push(36, cleanCurrentDt[6].clean, cleanCurrentDt[6].goodnessOfFit)
  CECFilter.recordRawDatapoint(36, 36, cleanCurrentDt[6].clean)
  baseRegressionFunction.push(37, cleanCurrentDt[7].clean, cleanCurrentDt[7].goodnessOfFit)
  CECFilter.recordRawDatapoint(37, 37, cleanCurrentDt[7].clean)
  baseRegressionFunction.push(38, cleanCurrentDt[8].clean, cleanCurrentDt[8].goodnessOfFit)
  CECFilter.recordRawDatapoint(38, 38, cleanCurrentDt[8].clean)
  baseRegressionFunction.push(39, cleanCurrentDt[9].clean, cleanCurrentDt[9].goodnessOfFit)
  CECFilter.recordRawDatapoint(39, 39, cleanCurrentDt[9].clean)
  baseRegressionFunction.push(40, cleanCurrentDt[10].clean, cleanCurrentDt[10].goodnessOfFit)
  CECFilter.recordRawDatapoint(40, 40, cleanCurrentDt[10].clean)
  baseRegressionFunction.push(41, cleanCurrentDt[11].clean, cleanCurrentDt[11].goodnessOfFit)
  CECFilter.recordRawDatapoint(41, 41, cleanCurrentDt[11].clean)
  baseRegressionFunction.push(42, cleanCurrentDt[12].clean, cleanCurrentDt[12].goodnessOfFit)
  CECFilter.recordRawDatapoint(42, 42, cleanCurrentDt[12].clean)
  baseRegressionFunction.push(43, cleanCurrentDt[13].clean, cleanCurrentDt[13].goodnessOfFit)
  CECFilter.recordRawDatapoint(43, 43, cleanCurrentDt[13].clean)
  baseRegressionFunction.push(44, cleanCurrentDt[14].clean, cleanCurrentDt[14].goodnessOfFit)
  CECFilter.recordRawDatapoint(44, 44, cleanCurrentDt[14].clean)
  baseRegressionFunction.push(45, cleanCurrentDt[15].clean, cleanCurrentDt[15].goodnessOfFit)
  CECFilter.recordRawDatapoint(45, 45, cleanCurrentDt[15].clean)
  baseRegressionFunction.push(46, cleanCurrentDt[16].clean, cleanCurrentDt[16].goodnessOfFit)
  CECFilter.recordRawDatapoint(46, 46, cleanCurrentDt[16].clean)
  baseRegressionFunction.push(47, cleanCurrentDt[17].clean, cleanCurrentDt[17].goodnessOfFit)
  CECFilter.recordRawDatapoint(47, 47, cleanCurrentDt[17].clean)
  baseRegressionFunction.push(48, cleanCurrentDt[18].clean, cleanCurrentDt[18].goodnessOfFit)
  CECFilter.recordRawDatapoint(48, 48, cleanCurrentDt[18].clean)
  baseRegressionFunction.push(49, cleanCurrentDt[19].clean, cleanCurrentDt[19].goodnessOfFit)
  CECFilter.recordRawDatapoint(49, 49, cleanCurrentDt[19].clean)
  baseRegressionFunction.push(50, cleanCurrentDt[20].clean, cleanCurrentDt[20].goodnessOfFit)
  CECFilter.recordRawDatapoint(50, 50, cleanCurrentDt[20].clean)
  baseRegressionFunction.push(51, cleanCurrentDt[21].clean, cleanCurrentDt[21].goodnessOfFit)
  CECFilter.recordRawDatapoint(51, 51, cleanCurrentDt[21].clean)
  baseRegressionFunction.push(52, cleanCurrentDt[22].clean, cleanCurrentDt[22].goodnessOfFit)
  CECFilter.recordRawDatapoint(52, 52, cleanCurrentDt[22].clean)

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
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()

  cleanCurrentDt = []

  // For even magnets, the correction factor should be 0.9
  // For off magnets, the correction factor should be 1.1
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 60)
  testCleanValueEquals(cleanCurrentDt[0], -0.1143002312236518) // Ideal value 0.0
  testGoodnessOfFitEquals(cleanCurrentDt[0], 0.0009675980854773926)
  cleanCurrentDt[1] = CECFilter.applyFilter(0.9, 61)
  testCleanValueEquals(cleanCurrentDt[1], 1.0211948691942312) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt[1], 0.9999999071028796)
  cleanCurrentDt[2] = CECFilter.applyFilter(2.2, 62)
  testCleanValueEquals(cleanCurrentDt[2], 2.0688462092927073) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt[2], 0.9675980854773926)
  cleanCurrentDt[3] = CECFilter.applyFilter(2.7, 63)
  testCleanValueEquals(cleanCurrentDt[3], 2.8349841451353903) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt[3], 0.9999999071028796)
  cleanCurrentDt[4] = CECFilter.applyFilter(4.4, 64)
  testCleanValueEquals(cleanCurrentDt[4], 4.2519926498090665) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt[4], 0.9675980854773926)
  cleanCurrentDt[5] = CECFilter.applyFilter(4.5, 65)
  testCleanValueEquals(cleanCurrentDt[5], 4.648773421076549) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt[5], 0.9999999071028796)
  cleanCurrentDt[6] = CECFilter.applyFilter(6.6, 66)
  testCleanValueEquals(cleanCurrentDt[6], 6.435139090325426) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt[6], 0.9675980854773926)
  cleanCurrentDt[7] = CECFilter.applyFilter(6.3, 67)
  testCleanValueEquals(cleanCurrentDt[7], 6.462562697017708) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt[7], 0.9999999071028796)
  cleanCurrentDt[8] = CECFilter.applyFilter(8.8, 68)
  testCleanValueEquals(cleanCurrentDt[8], 8.618285530841785) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt[8], 0.9675980854773926)
  cleanCurrentDt[9] = CECFilter.applyFilter(8.1, 69)
  testCleanValueEquals(cleanCurrentDt[9], 8.276351972958867) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt[9], 0.9999999071028796)
  cleanCurrentDt[10] = CECFilter.applyFilter(11.0, 70)
  testCleanValueEquals(cleanCurrentDt[10], 10.801431971358145) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt[10], 0.9675980854773926)
  cleanCurrentDt[11] = CECFilter.applyFilter(9.9, 71)
  testCleanValueEquals(cleanCurrentDt[11], 10.090141248900027) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt[11], 0.9999999071028796)
  cleanCurrentDt[12] = CECFilter.applyFilter(13.2, 72)
  testCleanValueEquals(cleanCurrentDt[12], 12.984578411874503) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt[12], 0.9675980854773926)
  cleanCurrentDt[13] = CECFilter.applyFilter(11.7, 73)
  testCleanValueEquals(cleanCurrentDt[13], 11.903930524841185) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt[13], 0.9999999071028796)
  cleanCurrentDt[14] = CECFilter.applyFilter(15.4, 74)
  testCleanValueEquals(cleanCurrentDt[14], 15.167724852390863) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt[14], 0.9675980854773926)
  cleanCurrentDt[15] = CECFilter.applyFilter(13.5, 75)
  testCleanValueEquals(cleanCurrentDt[15], 13.717719800782344) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt[15], 0.9999999071028796)
  cleanCurrentDt[16] = CECFilter.applyFilter(17.6, 76)
  testCleanValueEquals(cleanCurrentDt[16], 17.35087129290722) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt[16], 0.9675980854773926)
  cleanCurrentDt[17] = CECFilter.applyFilter(15.3, 77)
  testCleanValueEquals(cleanCurrentDt[17], 15.531509076723504) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt[17], 0.9999999071028796)
  cleanCurrentDt[18] = CECFilter.applyFilter(19.8, 78)
  testCleanValueEquals(cleanCurrentDt[18], 19.534017733423585) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt[18], 0.9675980854773926)
  cleanCurrentDt[19] = CECFilter.applyFilter(17.1, 79)
  testCleanValueEquals(cleanCurrentDt[19], 17.345298352664663) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt[19], 0.9999999071028796)
  cleanCurrentDt[20] = CECFilter.applyFilter(22.0, 80)
  testCleanValueEquals(cleanCurrentDt[20], 21.717164173939942) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt[20], 0.9675980854773926)
  cleanCurrentDt[21] = CECFilter.applyFilter(18.9, 81)
  testCleanValueEquals(cleanCurrentDt[21], 19.15908762860582) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt[21], 0.9999999071028796)
  cleanCurrentDt[22] = CECFilter.applyFilter(24.2, 82)
  testCleanValueEquals(cleanCurrentDt[22], 23.9003106144563) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt[22], 0.9675980854773926)

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  baseRegressionFunction.push(60, cleanCurrentDt[0].clean, cleanCurrentDt[0].goodnessOfFit)
  CECFilter.recordRawDatapoint(60, 60, cleanCurrentDt[0].clean)
  baseRegressionFunction.push(61, cleanCurrentDt[1].clean, cleanCurrentDt[1].goodnessOfFit)
  CECFilter.recordRawDatapoint(61, 61, cleanCurrentDt[1].clean)
  baseRegressionFunction.push(62, cleanCurrentDt[2].clean, cleanCurrentDt[2].goodnessOfFit)
  CECFilter.recordRawDatapoint(62, 62, cleanCurrentDt[2].clean)
  baseRegressionFunction.push(63, cleanCurrentDt[3].clean, cleanCurrentDt[3].goodnessOfFit)
  CECFilter.recordRawDatapoint(63, 63, cleanCurrentDt[3].clean)
  baseRegressionFunction.push(64, cleanCurrentDt[4].clean, cleanCurrentDt[4].goodnessOfFit)
  CECFilter.recordRawDatapoint(64, 64, cleanCurrentDt[4].clean)
  baseRegressionFunction.push(65, cleanCurrentDt[5].clean, cleanCurrentDt[5].goodnessOfFit)
  CECFilter.recordRawDatapoint(65, 65, cleanCurrentDt[5].clean)
  baseRegressionFunction.push(66, cleanCurrentDt[6].clean, cleanCurrentDt[6].goodnessOfFit)
  CECFilter.recordRawDatapoint(66, 66, cleanCurrentDt[6].clean)
  baseRegressionFunction.push(67, cleanCurrentDt[7].clean, cleanCurrentDt[7].goodnessOfFit)
  CECFilter.recordRawDatapoint(67, 67, cleanCurrentDt[7].clean)
  baseRegressionFunction.push(68, cleanCurrentDt[8].clean, cleanCurrentDt[8].goodnessOfFit)
  CECFilter.recordRawDatapoint(68, 68, cleanCurrentDt[8].clean)
  baseRegressionFunction.push(69, cleanCurrentDt[9].clean, cleanCurrentDt[9].goodnessOfFit)
  CECFilter.recordRawDatapoint(69, 69, cleanCurrentDt[9].clean)
  baseRegressionFunction.push(70, cleanCurrentDt[10].clean, cleanCurrentDt[10].goodnessOfFit)
  CECFilter.recordRawDatapoint(70, 70, cleanCurrentDt[10].clean)
  baseRegressionFunction.push(71, cleanCurrentDt[11].clean, cleanCurrentDt[11].goodnessOfFit)
  CECFilter.recordRawDatapoint(71, 71, cleanCurrentDt[11].clean)
  baseRegressionFunction.push(72, cleanCurrentDt[12].clean, cleanCurrentDt[12].goodnessOfFit)
  CECFilter.recordRawDatapoint(72, 72, cleanCurrentDt[12].clean)
  baseRegressionFunction.push(73, cleanCurrentDt[13].clean, cleanCurrentDt[13].goodnessOfFit)
  CECFilter.recordRawDatapoint(73, 73, cleanCurrentDt[13].clean)
  baseRegressionFunction.push(74, cleanCurrentDt[14].clean, cleanCurrentDt[14].goodnessOfFit)
  CECFilter.recordRawDatapoint(74, 74, cleanCurrentDt[14].clean)
  baseRegressionFunction.push(75, cleanCurrentDt[15].clean, cleanCurrentDt[15].goodnessOfFit)
  CECFilter.recordRawDatapoint(75, 75, cleanCurrentDt[15].clean)
  baseRegressionFunction.push(76, cleanCurrentDt[16].clean, cleanCurrentDt[16].goodnessOfFit)
  CECFilter.recordRawDatapoint(76, 76, cleanCurrentDt[16].clean)
  baseRegressionFunction.push(77, cleanCurrentDt[17].clean, cleanCurrentDt[17].goodnessOfFit)
  CECFilter.recordRawDatapoint(77, 77, cleanCurrentDt[17].clean)
  baseRegressionFunction.push(78, cleanCurrentDt[18].clean, cleanCurrentDt[18].goodnessOfFit)
  CECFilter.recordRawDatapoint(78, 78, cleanCurrentDt[18].clean)
  baseRegressionFunction.push(79, cleanCurrentDt[19].clean, cleanCurrentDt[19].goodnessOfFit)
  CECFilter.recordRawDatapoint(79, 79, cleanCurrentDt[19].clean)
  baseRegressionFunction.push(80, cleanCurrentDt[20].clean, cleanCurrentDt[20].goodnessOfFit)
  CECFilter.recordRawDatapoint(80, 70, cleanCurrentDt[20].clean)
  baseRegressionFunction.push(81, cleanCurrentDt[21].clean, cleanCurrentDt[21].goodnessOfFit)
  CECFilter.recordRawDatapoint(81, 71, cleanCurrentDt[21].clean)
  baseRegressionFunction.push(82, cleanCurrentDt[22].clean, cleanCurrentDt[22].goodnessOfFit)
  CECFilter.recordRawDatapoint(82, 72, cleanCurrentDt[22].clean)

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
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()

  cleanCurrentDt = []

  // For even magnets, the correction factor should be 0.9
  // For off magnets, the correction factor should be 1.1
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 90)
  testCleanValueEquals(cleanCurrentDt[0], 1.5846517410765475) // Ideal value 0.0
  testGoodnessOfFitEquals(cleanCurrentDt[0], 0.6845380699401993)
  cleanCurrentDt[1] = CECFilter.applyFilter(0.9, 91)
  testCleanValueEquals(cleanCurrentDt[1], -0.45772578929499796) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt[1], 0.0009637796037303405)
  cleanCurrentDt[2] = CECFilter.applyFilter(2.2, 92)
  testCleanValueEquals(cleanCurrentDt[2], 3.229943858943868) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt[2], 0.6845380699401993)
  cleanCurrentDt[3] = CECFilter.applyFilter(2.7, 93)
  testCleanValueEquals(cleanCurrentDt[3], 1.7961261142681018) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt[3], 0.9637796037303404)
  cleanCurrentDt[4] = CECFilter.applyFilter(4.4, 94)
  testCleanValueEquals(cleanCurrentDt[4], 4.875235976811188) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt[4], 0.6845380699401993)
  cleanCurrentDt[5] = CECFilter.applyFilter(4.5, 95)
  testCleanValueEquals(cleanCurrentDt[5], 4.049978017831201) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt[5], 0.9637796037303404)
  cleanCurrentDt[6] = CECFilter.applyFilter(6.6, 96)
  testCleanValueEquals(cleanCurrentDt[6], 6.520528094678508) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt[6], 0.6845380699401993)
  cleanCurrentDt[7] = CECFilter.applyFilter(6.3, 97)
  testCleanValueEquals(cleanCurrentDt[7], 6.3038299213943) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt[7], 0.9637796037303404)
  cleanCurrentDt[8] = CECFilter.applyFilter(8.8, 98)
  testCleanValueEquals(cleanCurrentDt[8], 8.16582021254583) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt[8], 0.6845380699401993)
  cleanCurrentDt[9] = CECFilter.applyFilter(8.1, 99)
  testCleanValueEquals(cleanCurrentDt[9], 8.557681824957399) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt[9], 0.9637796037303404)
  cleanCurrentDt[10] = CECFilter.applyFilter(11.0, 100)
  testCleanValueEquals(cleanCurrentDt[10], 9.811112330413149) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt[10], 0.6845380699401993)
  cleanCurrentDt[11] = CECFilter.applyFilter(9.9, 101)
  testCleanValueEquals(cleanCurrentDt[11], 10.811533728520498) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt[11], 0.9637796037303404)
  cleanCurrentDt[12] = CECFilter.applyFilter(13.2, 102)
  testCleanValueEquals(cleanCurrentDt[12], 11.456404448280468) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt[12], 0.6845380699401993)
  cleanCurrentDt[13] = CECFilter.applyFilter(11.7, 103)
  testCleanValueEquals(cleanCurrentDt[13], 13.065385632083597) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt[13], 0.9637796037303404)
  cleanCurrentDt[14] = CECFilter.applyFilter(15.4, 104)
  testCleanValueEquals(cleanCurrentDt[14], 13.10169656614779) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt[14], 0.6845380699401993)
  cleanCurrentDt[15] = CECFilter.applyFilter(13.5, 105)
  testCleanValueEquals(cleanCurrentDt[15], 15.319237535646696) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt[15], 0.9637796037303404)
  cleanCurrentDt[16] = CECFilter.applyFilter(17.6, 106)
  testCleanValueEquals(cleanCurrentDt[16], 14.746988684015111) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt[16], 0.6845380699401993)
  cleanCurrentDt[17] = CECFilter.applyFilter(15.3, 107)
  testCleanValueEquals(cleanCurrentDt[17], 17.573089439209795) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt[17], 0.9637796037303404)
  cleanCurrentDt[18] = CECFilter.applyFilter(19.8, 108)
  testCleanValueEquals(cleanCurrentDt[18], 16.392280801882432) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt[18], 0.6845380699401993)
  cleanCurrentDt[19] = CECFilter.applyFilter(17.1, 109)
  testCleanValueEquals(cleanCurrentDt[19], 19.826941342772898) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt[19], 0.9637796037303404)
  cleanCurrentDt[20] = CECFilter.applyFilter(22.0, 110)
  testCleanValueEquals(cleanCurrentDt[20], 18.037572919749753) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt[20], 0.6845380699401993)
  cleanCurrentDt[21] = CECFilter.applyFilter(18.9, 111)
  testCleanValueEquals(cleanCurrentDt[21], 22.080793246335993) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt[21], 0.9637796037303404)
  cleanCurrentDt[22] = CECFilter.applyFilter(24.2, 112)
  testCleanValueEquals(cleanCurrentDt[22], 19.68286503761707) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt[22], 0.6845380699401993)
})

test('Correct behaviour of the filter after exposing it to an updated filter with noisy linear regressor, agressiveness 1.0, size two recoveries', () => {
  const baseRowerConfig = {
    numOfImpulsesPerRevolution: 2,
    flankLength: 2,
    autoAdjustDragFactor: true,
    systematicErrorAgressiveness: 1.0,
    systematicErrorNumberOfDatapoints: 44,
    minimumTimeBetweenImpulses: 0,
    maximumTimeBetweenImpulses: 25
  }

  const baseRegressionFunction = createTSLinearSeries()
  let cleanCurrentDt = []
  const CECFilter = createCyclicErrorFilter(baseRowerConfig, baseRegressionFunction)

  // Inecting the datapoints. In essence,
  // The even datapoints are multipied by 1.1 (so correction factor should become 1/1.1 = 0.9)
  // the odd datapoints are multipied by 0.9 (so correction factor is 1/0.9 = 1.1)
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 0)
  baseRegressionFunction.push(0, 0, 1)
  CECFilter.recordRawDatapoint(0, 0, 0)
  baseRegressionFunction.push(1, 0.9, 1)
  CECFilter.recordRawDatapoint(1, 1, 0.9)
  baseRegressionFunction.push(2, 2.2, 1)
  CECFilter.recordRawDatapoint(2, 2, 2.2)
  baseRegressionFunction.push(3, 2.7, 1)
  CECFilter.recordRawDatapoint(3, 3, 2.7)
  baseRegressionFunction.push(4, 4.4, 1)
  CECFilter.recordRawDatapoint(4, 4, 4.4)
  baseRegressionFunction.push(5, 4.5, 1)
  CECFilter.recordRawDatapoint(5, 5, 4.5)
  baseRegressionFunction.push(6, 6.6, 1)
  CECFilter.recordRawDatapoint(6, 6, 6.6)
  baseRegressionFunction.push(7, 6.3, 1)
  CECFilter.recordRawDatapoint(7, 7, 6.3)
  baseRegressionFunction.push(8, 8.8, 1)
  CECFilter.recordRawDatapoint(8, 8, 8.8)
  baseRegressionFunction.push(9, 8.1, 1)
  CECFilter.recordRawDatapoint(9, 9, 8.1)
  baseRegressionFunction.push(10, 11.0, 1)
  CECFilter.recordRawDatapoint(10, 10, 11.0)
  baseRegressionFunction.push(11, 9.9, 1)
  CECFilter.recordRawDatapoint(11, 11, 9.9)
  baseRegressionFunction.push(12, 13.2, 1)
  CECFilter.recordRawDatapoint(12, 12, 13.2)
  baseRegressionFunction.push(13, 11.7, 1)
  CECFilter.recordRawDatapoint(13, 13, 11.7)
  baseRegressionFunction.push(14, 15.4, 1)
  CECFilter.recordRawDatapoint(14, 14, 15.4)
  baseRegressionFunction.push(15, 13.5, 1)
  CECFilter.recordRawDatapoint(15, 15, 13.5)
  baseRegressionFunction.push(16, 17.6, 1)
  CECFilter.recordRawDatapoint(16, 16, 17.6)
  baseRegressionFunction.push(17, 15.3, 1)
  CECFilter.recordRawDatapoint(17, 17, 15.3)
  baseRegressionFunction.push(18, 19.8, 1)
  CECFilter.recordRawDatapoint(18, 18, 19.8)
  baseRegressionFunction.push(19, 17.1, 1)
  CECFilter.recordRawDatapoint(19, 19, 17.1)
  baseRegressionFunction.push(20, 22.0, 1)
  CECFilter.recordRawDatapoint(20, 20, 22.0)
  baseRegressionFunction.push(21, 18.9, 1)
  CECFilter.recordRawDatapoint(21, 21, 18.9)
  baseRegressionFunction.push(22, 24.2, 1)
  CECFilter.recordRawDatapoint(22, 22, 24.2)
  baseRegressionFunction.push(23, 20.7, 1)
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
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 30)
  testCleanValueEquals(cleanCurrentDt[0], 0.3077186553798185) // Ideal value 0.0
  testGoodnessOfFitEquals(cleanCurrentDt[0], 0.9664251040857723)
  cleanCurrentDt[1] = CECFilter.applyFilter(0.9, 31)
  testCleanValueEquals(cleanCurrentDt[1], 0.6774521098766918) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt[1], 1)
  cleanCurrentDt[2] = CECFilter.applyFilter(2.2, 32)
  testCleanValueEquals(cleanCurrentDt[2], 2.2995234514194602) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt[2], 0.9664251040857723)
  cleanCurrentDt[3] = CECFilter.applyFilter(2.7, 33)
  testCleanValueEquals(cleanCurrentDt[3], 2.6477936403897124) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt[3], 1)
  cleanCurrentDt[4] = CECFilter.applyFilter(4.4, 34)
  testCleanValueEquals(cleanCurrentDt[4], 4.291328247459102) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt[4], 0.9664251040857723)
  cleanCurrentDt[5] = CECFilter.applyFilter(4.5, 35)
  testCleanValueEquals(cleanCurrentDt[5], 4.6181351709027325) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt[5], 1)
  cleanCurrentDt[6] = CECFilter.applyFilter(6.6, 36)
  testCleanValueEquals(cleanCurrentDt[6], 6.283133043498744) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt[6], 0.9664251040857723)
  cleanCurrentDt[7] = CECFilter.applyFilter(6.3, 37)
  testCleanValueEquals(cleanCurrentDt[7], 6.588476701415753) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt[7], 1)
  cleanCurrentDt[8] = CECFilter.applyFilter(8.8, 38)
  testCleanValueEquals(cleanCurrentDt[8], 8.274937839538387) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt[8], 0.9664251040857723)
  cleanCurrentDt[9] = CECFilter.applyFilter(8.1, 39)
  testCleanValueEquals(cleanCurrentDt[9], 8.558818231928772) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt[9], 1)
  cleanCurrentDt[10] = CECFilter.applyFilter(11.0, 40)
  testCleanValueEquals(cleanCurrentDt[10], 10.266742635578028) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt[10], 0.9664251040857723)
  cleanCurrentDt[11] = CECFilter.applyFilter(9.9, 41)
  testCleanValueEquals(cleanCurrentDt[11], 10.529159762441793) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt[11], 1)
  cleanCurrentDt[12] = CECFilter.applyFilter(13.2, 42)
  testCleanValueEquals(cleanCurrentDt[12], 12.25854743161767) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt[12], 0.9664251040857723)
  cleanCurrentDt[13] = CECFilter.applyFilter(11.7, 43)
  testCleanValueEquals(cleanCurrentDt[13], 12.499501292954815) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt[13], 1)
  cleanCurrentDt[14] = CECFilter.applyFilter(15.4, 44)
  testCleanValueEquals(cleanCurrentDt[14], 14.250352227657311) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt[14], 0.9664251040857723)
  cleanCurrentDt[15] = CECFilter.applyFilter(13.5, 45)
  testCleanValueEquals(cleanCurrentDt[15], 14.469842823467832) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt[15], 1)
  cleanCurrentDt[16] = CECFilter.applyFilter(17.6, 46)
  testCleanValueEquals(cleanCurrentDt[16], 16.242157023696954) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt[16], 0.9664251040857723)
  cleanCurrentDt[17] = CECFilter.applyFilter(15.3, 47)
  testCleanValueEquals(cleanCurrentDt[17], 16.440184353980854) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt[17], 1)
  cleanCurrentDt[18] = CECFilter.applyFilter(19.8, 48)
  testCleanValueEquals(cleanCurrentDt[18], 18.233961819736592) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt[18], 0.9664251040857723)
  cleanCurrentDt[19] = CECFilter.applyFilter(17.1, 49)
  testCleanValueEquals(cleanCurrentDt[19], 18.410525884493875) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt[19], 1)
  cleanCurrentDt[20] = CECFilter.applyFilter(22.0, 50)
  testCleanValueEquals(cleanCurrentDt[20], 20.225766615776237) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt[20], 0.9664251040857723)
  cleanCurrentDt[21] = CECFilter.applyFilter(18.9, 51)
  testCleanValueEquals(cleanCurrentDt[21], 20.380867415006893) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt[21], 1)
  cleanCurrentDt[22] = CECFilter.applyFilter(24.2, 52)
  testCleanValueEquals(cleanCurrentDt[22], 22.217571411815875) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt[22], 0.9664251040857723)

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  baseRegressionFunction.push(30, cleanCurrentDt[0].clean, cleanCurrentDt[0].goodnessOfFit)
  CECFilter.recordRawDatapoint(30, 30, cleanCurrentDt[0].clean)
  baseRegressionFunction.push(31, cleanCurrentDt[1].clean, cleanCurrentDt[1].goodnessOfFit)
  CECFilter.recordRawDatapoint(31, 31, cleanCurrentDt[1].clean)
  baseRegressionFunction.push(32, cleanCurrentDt[2].clean, cleanCurrentDt[2].goodnessOfFit)
  CECFilter.recordRawDatapoint(32, 32, cleanCurrentDt[2].clean)
  baseRegressionFunction.push(33, cleanCurrentDt[3].clean, cleanCurrentDt[3].goodnessOfFit)
  CECFilter.recordRawDatapoint(33, 33, cleanCurrentDt[3].clean)
  baseRegressionFunction.push(34, cleanCurrentDt[4].clean, cleanCurrentDt[4].goodnessOfFit)
  CECFilter.recordRawDatapoint(34, 34, cleanCurrentDt[4].clean)
  baseRegressionFunction.push(35, cleanCurrentDt[5].clean, cleanCurrentDt[5].goodnessOfFit)
  CECFilter.recordRawDatapoint(35, 35, cleanCurrentDt[5].clean)
  baseRegressionFunction.push(36, cleanCurrentDt[6].clean, cleanCurrentDt[6].goodnessOfFit)
  CECFilter.recordRawDatapoint(36, 36, cleanCurrentDt[6].clean)
  baseRegressionFunction.push(37, cleanCurrentDt[7].clean, cleanCurrentDt[7].goodnessOfFit)
  CECFilter.recordRawDatapoint(37, 37, cleanCurrentDt[7].clean)
  baseRegressionFunction.push(38, cleanCurrentDt[8].clean, cleanCurrentDt[8].goodnessOfFit)
  CECFilter.recordRawDatapoint(38, 38, cleanCurrentDt[8].clean)
  baseRegressionFunction.push(39, cleanCurrentDt[9].clean, cleanCurrentDt[9].goodnessOfFit)
  CECFilter.recordRawDatapoint(39, 39, cleanCurrentDt[9].clean)
  baseRegressionFunction.push(40, cleanCurrentDt[10].clean, cleanCurrentDt[10].goodnessOfFit)
  CECFilter.recordRawDatapoint(40, 40, cleanCurrentDt[10].clean)
  baseRegressionFunction.push(41, cleanCurrentDt[11].clean, cleanCurrentDt[11].goodnessOfFit)
  CECFilter.recordRawDatapoint(41, 41, cleanCurrentDt[11].clean)
  baseRegressionFunction.push(42, cleanCurrentDt[12].clean, cleanCurrentDt[12].goodnessOfFit)
  CECFilter.recordRawDatapoint(42, 42, cleanCurrentDt[12].clean)
  baseRegressionFunction.push(43, cleanCurrentDt[13].clean, cleanCurrentDt[13].goodnessOfFit)
  CECFilter.recordRawDatapoint(43, 43, cleanCurrentDt[13].clean)
  baseRegressionFunction.push(44, cleanCurrentDt[14].clean, cleanCurrentDt[14].goodnessOfFit)
  CECFilter.recordRawDatapoint(44, 44, cleanCurrentDt[14].clean)
  baseRegressionFunction.push(45, cleanCurrentDt[15].clean, cleanCurrentDt[15].goodnessOfFit)
  CECFilter.recordRawDatapoint(45, 45, cleanCurrentDt[15].clean)
  baseRegressionFunction.push(46, cleanCurrentDt[16].clean, cleanCurrentDt[16].goodnessOfFit)
  CECFilter.recordRawDatapoint(46, 46, cleanCurrentDt[16].clean)
  baseRegressionFunction.push(47, cleanCurrentDt[17].clean, cleanCurrentDt[17].goodnessOfFit)
  CECFilter.recordRawDatapoint(47, 47, cleanCurrentDt[17].clean)
  baseRegressionFunction.push(48, cleanCurrentDt[18].clean, cleanCurrentDt[18].goodnessOfFit)
  CECFilter.recordRawDatapoint(48, 48, cleanCurrentDt[18].clean)
  baseRegressionFunction.push(49, cleanCurrentDt[19].clean, cleanCurrentDt[19].goodnessOfFit)
  CECFilter.recordRawDatapoint(49, 49, cleanCurrentDt[19].clean)
  baseRegressionFunction.push(50, cleanCurrentDt[20].clean, cleanCurrentDt[20].goodnessOfFit)
  CECFilter.recordRawDatapoint(50, 50, cleanCurrentDt[20].clean)
  baseRegressionFunction.push(51, cleanCurrentDt[21].clean, cleanCurrentDt[21].goodnessOfFit)
  CECFilter.recordRawDatapoint(51, 51, cleanCurrentDt[21].clean)
  baseRegressionFunction.push(52, cleanCurrentDt[22].clean, cleanCurrentDt[22].goodnessOfFit)
  CECFilter.recordRawDatapoint(52, 52, cleanCurrentDt[22].clean)

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
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()

  cleanCurrentDt = []

  // For even magnets, the correction factor should be 0.9
  // For off magnets, the correction factor should be 1.1
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 60)
  testCleanValueEquals(cleanCurrentDt[0], -0.023240294710937998) // Ideal value 0.0
  testGoodnessOfFitEquals(cleanCurrentDt[0], 0.0009632097345185597)
  cleanCurrentDt[1] = CECFilter.applyFilter(0.9, 61)
  testCleanValueEquals(cleanCurrentDt[1], 0.9725974586949829) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt[1], 0.9958445912927004)
  cleanCurrentDt[2] = CECFilter.applyFilter(2.2, 62)
  testCleanValueEquals(cleanCurrentDt[2], 2.0561088599947306) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt[2], 0.9632097345185597)
  cleanCurrentDt[3] = CECFilter.applyFilter(2.7, 63)
  testCleanValueEquals(cleanCurrentDt[3], 2.871311786663073) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt[3], 0.9958445912927004)
  cleanCurrentDt[4] = CECFilter.applyFilter(4.4, 64)
  testCleanValueEquals(cleanCurrentDt[4], 4.135458014700399) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt[4], 0.9632097345185597)
  cleanCurrentDt[5] = CECFilter.applyFilter(4.5, 65)
  testCleanValueEquals(cleanCurrentDt[5], 4.770026114631162) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt[5], 0.9958445912927004)
  cleanCurrentDt[6] = CECFilter.applyFilter(6.6, 66)
  testCleanValueEquals(cleanCurrentDt[6], 6.214807169406066) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt[6], 0.9632097345185597)
  cleanCurrentDt[7] = CECFilter.applyFilter(6.3, 67)
  testCleanValueEquals(cleanCurrentDt[7], 6.668740442599252) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt[7], 0.9958445912927004)
  cleanCurrentDt[8] = CECFilter.applyFilter(8.8, 68)
  testCleanValueEquals(cleanCurrentDt[8], 8.294156324111736) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt[8], 0.9632097345185597)
  cleanCurrentDt[9] = CECFilter.applyFilter(8.1, 69)
  testCleanValueEquals(cleanCurrentDt[9], 8.56745477056734) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt[9], 0.9958445912927004)
  cleanCurrentDt[10] = CECFilter.applyFilter(11.0, 70)
  testCleanValueEquals(cleanCurrentDt[10], 10.373505478817403) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt[10], 0.9632097345185597)
  cleanCurrentDt[11] = CECFilter.applyFilter(9.9, 71)
  testCleanValueEquals(cleanCurrentDt[11], 10.466169098535431) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt[11], 0.9958445912927004)
  cleanCurrentDt[12] = CECFilter.applyFilter(13.2, 72)
  testCleanValueEquals(cleanCurrentDt[12], 12.452854633523069) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt[12], 0.9632097345185597)
  cleanCurrentDt[13] = CECFilter.applyFilter(11.7, 73)
  testCleanValueEquals(cleanCurrentDt[13], 12.36488342650352) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt[13], 0.9958445912927004)
  cleanCurrentDt[14] = CECFilter.applyFilter(15.4, 74)
  testCleanValueEquals(cleanCurrentDt[14], 14.53220378822874) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt[14], 0.9632097345185597)
  cleanCurrentDt[15] = CECFilter.applyFilter(13.5, 75)
  testCleanValueEquals(cleanCurrentDt[15], 14.26359775447161) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt[15], 0.9958445912927004)
  cleanCurrentDt[16] = CECFilter.applyFilter(17.6, 76)
  testCleanValueEquals(cleanCurrentDt[16], 16.61155294293441) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt[16], 0.9632097345185597)
  cleanCurrentDt[17] = CECFilter.applyFilter(15.3, 77)
  testCleanValueEquals(cleanCurrentDt[17], 16.1623120824397) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt[17], 0.9958445912927004)
  cleanCurrentDt[18] = CECFilter.applyFilter(19.8, 78)
  testCleanValueEquals(cleanCurrentDt[18], 18.690902097640077) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt[18], 0.9632097345185597)
  cleanCurrentDt[19] = CECFilter.applyFilter(17.1, 79)
  testCleanValueEquals(cleanCurrentDt[19], 18.06102641040779) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt[19], 0.9958445912927004)
  cleanCurrentDt[20] = CECFilter.applyFilter(22.0, 80)
  testCleanValueEquals(cleanCurrentDt[20], 20.770251252345744) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt[20], 0.9632097345185597)
  cleanCurrentDt[21] = CECFilter.applyFilter(18.9, 81)
  testCleanValueEquals(cleanCurrentDt[21], 19.959740738375878) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt[21], 0.9958445912927004)
  cleanCurrentDt[22] = CECFilter.applyFilter(24.2, 82)
  testCleanValueEquals(cleanCurrentDt[22], 22.849600407051412) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt[22], 0.9632097345185597)

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  baseRegressionFunction.push(60, cleanCurrentDt[0].clean, cleanCurrentDt[0].goodnessOfFit)
  CECFilter.recordRawDatapoint(60, 60, cleanCurrentDt[0].clean)
  baseRegressionFunction.push(61, cleanCurrentDt[1].clean, cleanCurrentDt[1].goodnessOfFit)
  CECFilter.recordRawDatapoint(61, 61, cleanCurrentDt[1].clean)
  baseRegressionFunction.push(62, cleanCurrentDt[2].clean, cleanCurrentDt[2].goodnessOfFit)
  CECFilter.recordRawDatapoint(62, 62, cleanCurrentDt[2].clean)
  baseRegressionFunction.push(63, cleanCurrentDt[3].clean, cleanCurrentDt[3].goodnessOfFit)
  CECFilter.recordRawDatapoint(63, 63, cleanCurrentDt[3].clean)
  baseRegressionFunction.push(64, cleanCurrentDt[4].clean, cleanCurrentDt[4].goodnessOfFit)
  CECFilter.recordRawDatapoint(64, 64, cleanCurrentDt[4].clean)
  baseRegressionFunction.push(65, cleanCurrentDt[5].clean, cleanCurrentDt[5].goodnessOfFit)
  CECFilter.recordRawDatapoint(65, 65, cleanCurrentDt[5].clean)
  baseRegressionFunction.push(66, cleanCurrentDt[6].clean, cleanCurrentDt[6].goodnessOfFit)
  CECFilter.recordRawDatapoint(66, 66, cleanCurrentDt[6].clean)
  baseRegressionFunction.push(67, cleanCurrentDt[7].clean, cleanCurrentDt[7].goodnessOfFit)
  CECFilter.recordRawDatapoint(67, 67, cleanCurrentDt[7].clean)
  baseRegressionFunction.push(68, cleanCurrentDt[8].clean, cleanCurrentDt[8].goodnessOfFit)
  CECFilter.recordRawDatapoint(68, 68, cleanCurrentDt[8].clean)
  baseRegressionFunction.push(69, cleanCurrentDt[9].clean, cleanCurrentDt[9].goodnessOfFit)
  CECFilter.recordRawDatapoint(69, 69, cleanCurrentDt[9].clean)
  baseRegressionFunction.push(70, cleanCurrentDt[10].clean, cleanCurrentDt[10].goodnessOfFit)
  CECFilter.recordRawDatapoint(70, 70, cleanCurrentDt[10].clean)
  baseRegressionFunction.push(71, cleanCurrentDt[11].clean, cleanCurrentDt[11].goodnessOfFit)
  CECFilter.recordRawDatapoint(71, 71, cleanCurrentDt[11].clean)
  baseRegressionFunction.push(72, cleanCurrentDt[12].clean, cleanCurrentDt[12].goodnessOfFit)
  CECFilter.recordRawDatapoint(72, 72, cleanCurrentDt[12].clean)
  baseRegressionFunction.push(73, cleanCurrentDt[13].clean, cleanCurrentDt[13].goodnessOfFit)
  CECFilter.recordRawDatapoint(73, 73, cleanCurrentDt[13].clean)
  baseRegressionFunction.push(74, cleanCurrentDt[14].clean, cleanCurrentDt[14].goodnessOfFit)
  CECFilter.recordRawDatapoint(74, 74, cleanCurrentDt[14].clean)
  baseRegressionFunction.push(75, cleanCurrentDt[15].clean, cleanCurrentDt[15].goodnessOfFit)
  CECFilter.recordRawDatapoint(75, 75, cleanCurrentDt[15].clean)
  baseRegressionFunction.push(76, cleanCurrentDt[16].clean, cleanCurrentDt[16].goodnessOfFit)
  CECFilter.recordRawDatapoint(76, 76, cleanCurrentDt[16].clean)
  baseRegressionFunction.push(77, cleanCurrentDt[17].clean, cleanCurrentDt[17].goodnessOfFit)
  CECFilter.recordRawDatapoint(77, 77, cleanCurrentDt[17].clean)
  baseRegressionFunction.push(78, cleanCurrentDt[18].clean, cleanCurrentDt[18].goodnessOfFit)
  CECFilter.recordRawDatapoint(78, 78, cleanCurrentDt[18].clean)
  baseRegressionFunction.push(79, cleanCurrentDt[19].clean, cleanCurrentDt[19].goodnessOfFit)
  CECFilter.recordRawDatapoint(79, 79, cleanCurrentDt[19].clean)
  baseRegressionFunction.push(80, cleanCurrentDt[20].clean, cleanCurrentDt[20].goodnessOfFit)
  CECFilter.recordRawDatapoint(80, 80, cleanCurrentDt[20].clean)
  baseRegressionFunction.push(81, cleanCurrentDt[21].clean, cleanCurrentDt[21].goodnessOfFit)
  CECFilter.recordRawDatapoint(81, 81, cleanCurrentDt[21].clean)
  baseRegressionFunction.push(82, cleanCurrentDt[22].clean, cleanCurrentDt[22].goodnessOfFit)
  CECFilter.recordRawDatapoint(82, 82, cleanCurrentDt[22].clean)

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
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()

  cleanCurrentDt = []

  // For even magnets, the correction factor should be 0.9
  // For off magnets, the correction factor should be 1.1
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 90)
  testCleanValueEquals(cleanCurrentDt[0], -0.1677133380577741) // Ideal value 0.0
  testGoodnessOfFitEquals(cleanCurrentDt[0], 0.0009612048785350442)
  cleanCurrentDt[1] = CECFilter.applyFilter(0.9, 91)
  testCleanValueEquals(cleanCurrentDt[1], 1.1020865133856843) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt[1], 0.9916105720109293)
  cleanCurrentDt[2] = CECFilter.applyFilter(2.2, 92)
  testCleanValueEquals(cleanCurrentDt[2], 1.9482633444740012) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt[2], 0.9612048785350442)
  cleanCurrentDt[3] = CECFilter.applyFilter(2.7, 93)
  testCleanValueEquals(cleanCurrentDt[3], 2.9708328640415043) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt[3], 0.9916105720109293)
  cleanCurrentDt[4] = CECFilter.applyFilter(4.4, 94)
  testCleanValueEquals(cleanCurrentDt[4], 4.064240027005777) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt[4], 0.9612048785350442)
  cleanCurrentDt[5] = CECFilter.applyFilter(4.5, 95)
  testCleanValueEquals(cleanCurrentDt[5], 4.839579214697325) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt[5], 0.9916105720109293)
  cleanCurrentDt[6] = CECFilter.applyFilter(6.6, 96)
  testCleanValueEquals(cleanCurrentDt[6], 6.180216709537552) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt[6], 0.9612048785350442)
  cleanCurrentDt[7] = CECFilter.applyFilter(6.3, 97)
  testCleanValueEquals(cleanCurrentDt[7], 6.708325565353145) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt[7], 0.9916105720109293)
  cleanCurrentDt[8] = CECFilter.applyFilter(8.8, 98)
  testCleanValueEquals(cleanCurrentDt[8], 8.296193392069327) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt[8], 0.9612048785350442)
  cleanCurrentDt[9] = CECFilter.applyFilter(8.1, 99)
  testCleanValueEquals(cleanCurrentDt[9], 8.577071916008963) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt[9], 0.9916105720109293)
  cleanCurrentDt[10] = CECFilter.applyFilter(11.0, 100)
  testCleanValueEquals(cleanCurrentDt[10], 10.412170074601102) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt[10], 0.9612048785350442)
  cleanCurrentDt[11] = CECFilter.applyFilter(9.9, 101)
  testCleanValueEquals(cleanCurrentDt[11], 10.445818266664785) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt[11], 0.9916105720109293)
  cleanCurrentDt[12] = CECFilter.applyFilter(13.2, 102)
  testCleanValueEquals(cleanCurrentDt[12], 12.528146757132877) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt[12], 0.9612048785350442)
  cleanCurrentDt[13] = CECFilter.applyFilter(11.7, 103)
  testCleanValueEquals(cleanCurrentDt[13], 12.314564617320604) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt[13], 0.9916105720109293)
  cleanCurrentDt[14] = CECFilter.applyFilter(15.4, 104)
  testCleanValueEquals(cleanCurrentDt[14], 14.644123439664654) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt[14], 0.9612048785350442)
  cleanCurrentDt[15] = CECFilter.applyFilter(13.5, 105)
  testCleanValueEquals(cleanCurrentDt[15], 14.183310967976425) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt[15], 0.9916105720109293)
  cleanCurrentDt[16] = CECFilter.applyFilter(17.6, 106)
  testCleanValueEquals(cleanCurrentDt[16], 16.76010012219643) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt[16], 0.9612048785350442)
  cleanCurrentDt[17] = CECFilter.applyFilter(15.3, 107)
  testCleanValueEquals(cleanCurrentDt[17], 16.052057318632244) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt[17], 0.9916105720109293)
  cleanCurrentDt[18] = CECFilter.applyFilter(19.8, 108)
  testCleanValueEquals(cleanCurrentDt[18], 18.876076804728207) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt[18], 0.9612048785350442)
  cleanCurrentDt[19] = CECFilter.applyFilter(17.1, 109)
  testCleanValueEquals(cleanCurrentDt[19], 17.920803669288066) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt[19], 0.9916105720109293)
  cleanCurrentDt[20] = CECFilter.applyFilter(22.0, 110)
  testCleanValueEquals(cleanCurrentDt[20], 20.99205348725998) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt[20], 0.9612048785350442)
  cleanCurrentDt[21] = CECFilter.applyFilter(18.9, 111)
  testCleanValueEquals(cleanCurrentDt[21], 19.78955001994388) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt[21], 0.9916105720109293)
  cleanCurrentDt[22] = CECFilter.applyFilter(24.2, 112)
  testCleanValueEquals(cleanCurrentDt[22], 23.108030169791757) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt[22], 0.9612048785350442)

  baseRegressionFunction.reset()
  CECFilter.clearDatapointBuffer()

  // Here we feed the cleaned data back in, simulating an active filter for the second round
  baseRegressionFunction.push(90, cleanCurrentDt[0].clean, cleanCurrentDt[0].goodnessOfFit)
  CECFilter.recordRawDatapoint(90, 90, cleanCurrentDt[0].clean)
  baseRegressionFunction.push(91, cleanCurrentDt[1].clean, cleanCurrentDt[1].goodnessOfFit)
  CECFilter.recordRawDatapoint(91, 91, cleanCurrentDt[1].clean)
  baseRegressionFunction.push(92, cleanCurrentDt[2].clean, cleanCurrentDt[2].goodnessOfFit)
  CECFilter.recordRawDatapoint(92, 92, cleanCurrentDt[2].clean)
  baseRegressionFunction.push(93, cleanCurrentDt[3].clean, cleanCurrentDt[3].goodnessOfFit)
  CECFilter.recordRawDatapoint(93, 93, cleanCurrentDt[3].clean)
  baseRegressionFunction.push(94, cleanCurrentDt[4].clean, cleanCurrentDt[4].goodnessOfFit)
  CECFilter.recordRawDatapoint(94, 94, cleanCurrentDt[4].clean)
  baseRegressionFunction.push(95, cleanCurrentDt[5].clean, cleanCurrentDt[5].goodnessOfFit)
  CECFilter.recordRawDatapoint(95, 95, cleanCurrentDt[5].clean)
  baseRegressionFunction.push(96, cleanCurrentDt[6].clean, cleanCurrentDt[6].goodnessOfFit)
  CECFilter.recordRawDatapoint(96, 96, cleanCurrentDt[6].clean)
  baseRegressionFunction.push(97, cleanCurrentDt[7].clean, cleanCurrentDt[7].goodnessOfFit)
  CECFilter.recordRawDatapoint(97, 97, cleanCurrentDt[7].clean)
  baseRegressionFunction.push(98, cleanCurrentDt[8].clean, cleanCurrentDt[8].goodnessOfFit)
  CECFilter.recordRawDatapoint(98, 98, cleanCurrentDt[8].clean)
  baseRegressionFunction.push(99, cleanCurrentDt[9].clean, cleanCurrentDt[9].goodnessOfFit)
  CECFilter.recordRawDatapoint(99, 99, cleanCurrentDt[9].clean)
  baseRegressionFunction.push(100, cleanCurrentDt[10].clean, cleanCurrentDt[10].goodnessOfFit)
  CECFilter.recordRawDatapoint(100, 100, cleanCurrentDt[10].clean)
  baseRegressionFunction.push(101, cleanCurrentDt[11].clean, cleanCurrentDt[11].goodnessOfFit)
  CECFilter.recordRawDatapoint(101, 101, cleanCurrentDt[11].clean)
  baseRegressionFunction.push(102, cleanCurrentDt[12].clean, cleanCurrentDt[12].goodnessOfFit)
  CECFilter.recordRawDatapoint(102, 102, cleanCurrentDt[12].clean)
  baseRegressionFunction.push(103, cleanCurrentDt[13].clean, cleanCurrentDt[13].goodnessOfFit)
  CECFilter.recordRawDatapoint(103, 103, cleanCurrentDt[13].clean)
  baseRegressionFunction.push(104, cleanCurrentDt[14].clean, cleanCurrentDt[14].goodnessOfFit)
  CECFilter.recordRawDatapoint(104, 104, cleanCurrentDt[14].clean)
  baseRegressionFunction.push(105, cleanCurrentDt[15].clean, cleanCurrentDt[15].goodnessOfFit)
  CECFilter.recordRawDatapoint(105, 105, cleanCurrentDt[15].clean)
  baseRegressionFunction.push(106, cleanCurrentDt[16].clean, cleanCurrentDt[16].goodnessOfFit)
  CECFilter.recordRawDatapoint(106, 106, cleanCurrentDt[16].clean)
  baseRegressionFunction.push(107, cleanCurrentDt[17].clean, cleanCurrentDt[17].goodnessOfFit)
  CECFilter.recordRawDatapoint(107, 107, cleanCurrentDt[17].clean)
  baseRegressionFunction.push(108, cleanCurrentDt[18].clean, cleanCurrentDt[18].goodnessOfFit)
  CECFilter.recordRawDatapoint(108, 108, cleanCurrentDt[18].clean)
  baseRegressionFunction.push(109, cleanCurrentDt[19].clean, cleanCurrentDt[19].goodnessOfFit)
  CECFilter.recordRawDatapoint(109, 109, cleanCurrentDt[19].clean)
  baseRegressionFunction.push(110, cleanCurrentDt[20].clean, cleanCurrentDt[20].goodnessOfFit)
  CECFilter.recordRawDatapoint(110, 110, cleanCurrentDt[20].clean)
  baseRegressionFunction.push(111, cleanCurrentDt[21].clean, cleanCurrentDt[21].goodnessOfFit)
  CECFilter.recordRawDatapoint(111, 111, cleanCurrentDt[21].clean)
  baseRegressionFunction.push(112, cleanCurrentDt[22].clean, cleanCurrentDt[22].goodnessOfFit)
  CECFilter.recordRawDatapoint(112, 112, cleanCurrentDt[22].clean)

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
  CECFilter.processNextRawDatapoint()
  CECFilter.processNextRawDatapoint()

  cleanCurrentDt = []

  // For even magnets, the correction factor should be 0.9
  // For off magnets, the correction factor should be 1.1
  cleanCurrentDt[0] = CECFilter.applyFilter(0, 120)
  testCleanValueEquals(cleanCurrentDt[0], 0.04221095978474863) // Ideal value 0.0
  testGoodnessOfFitEquals(cleanCurrentDt[0], 0.9991745311715157)
  cleanCurrentDt[1] = CECFilter.applyFilter(0.9, 121)
  testCleanValueEquals(cleanCurrentDt[1], 0.8984798543331978) // Ideal value 1.0
  testGoodnessOfFitEquals(cleanCurrentDt[1], 0.9984882007344251)
  cleanCurrentDt[2] = CECFilter.applyFilter(2.2, 122)
  testCleanValueEquals(cleanCurrentDt[2], 2.142744525274211) // Ideal value 2.0
  testGoodnessOfFitEquals(cleanCurrentDt[2], 0.9991745311715157)
  cleanCurrentDt[3] = CECFilter.applyFilter(2.7, 123)
  testCleanValueEquals(cleanCurrentDt[3], 2.77986148256909) // Ideal Value 3.0
  testGoodnessOfFitEquals(cleanCurrentDt[3], 0.9984882007344251)
  cleanCurrentDt[4] = CECFilter.applyFilter(4.4, 124)
  testCleanValueEquals(cleanCurrentDt[4], 4.243278090763674) // Ideal value 4.0
  testGoodnessOfFitEquals(cleanCurrentDt[4], 0.9991745311715157)
  cleanCurrentDt[5] = CECFilter.applyFilter(4.5, 125)
  testCleanValueEquals(cleanCurrentDt[5], 4.661243110804982) // Ideal value 5.0
  testGoodnessOfFitEquals(cleanCurrentDt[5], 0.9984882007344251)
  cleanCurrentDt[6] = CECFilter.applyFilter(6.6, 126)
  testCleanValueEquals(cleanCurrentDt[6], 6.343811656253137) // Ideal value 6.0
  testGoodnessOfFitEquals(cleanCurrentDt[6], 0.9991745311715157)
  cleanCurrentDt[7] = CECFilter.applyFilter(6.3, 127)
  testCleanValueEquals(cleanCurrentDt[7], 6.542624739040875) // Ideal Value 7.0
  testGoodnessOfFitEquals(cleanCurrentDt[7], 0.9984882007344251)
  cleanCurrentDt[8] = CECFilter.applyFilter(8.8, 128)
  testCleanValueEquals(cleanCurrentDt[8], 8.4443452217426) // Ideal value 8.0
  testGoodnessOfFitEquals(cleanCurrentDt[8], 0.9991745311715157)
  cleanCurrentDt[9] = CECFilter.applyFilter(8.1, 129)
  testCleanValueEquals(cleanCurrentDt[9], 8.424006367276768) // Ideal value 9.0
  testGoodnessOfFitEquals(cleanCurrentDt[9], 0.9984882007344251)
  cleanCurrentDt[10] = CECFilter.applyFilter(11.0, 130)
  testCleanValueEquals(cleanCurrentDt[10], 10.544878787232062) // Ideal value 10.0
  testGoodnessOfFitEquals(cleanCurrentDt[10], 0.9991745311715157)
  cleanCurrentDt[11] = CECFilter.applyFilter(9.9, 131)
  testCleanValueEquals(cleanCurrentDt[11], 10.30538799551266) // Ideal Value 11.0
  testGoodnessOfFitEquals(cleanCurrentDt[11], 0.9984882007344251)
  cleanCurrentDt[12] = CECFilter.applyFilter(13.2, 132)
  testCleanValueEquals(cleanCurrentDt[12], 12.645412352721525) // Ideal value 12.0
  testGoodnessOfFitEquals(cleanCurrentDt[12], 0.9991745311715157)
  cleanCurrentDt[13] = CECFilter.applyFilter(11.7, 133)
  testCleanValueEquals(cleanCurrentDt[13], 12.186769623748551) // Ideal Value 13.0
  testGoodnessOfFitEquals(cleanCurrentDt[13], 0.9984882007344251)
  cleanCurrentDt[14] = CECFilter.applyFilter(15.4, 134)
  testCleanValueEquals(cleanCurrentDt[14], 14.745945918210987) // Ideal value 14.0
  testGoodnessOfFitEquals(cleanCurrentDt[14], 0.9991745311715157)
  cleanCurrentDt[15] = CECFilter.applyFilter(13.5, 135)
  testCleanValueEquals(cleanCurrentDt[15], 14.068151251984444) // Ideal value 15.0
  testGoodnessOfFitEquals(cleanCurrentDt[15], 0.9984882007344251)
  cleanCurrentDt[16] = CECFilter.applyFilter(17.6, 136)
  testCleanValueEquals(cleanCurrentDt[16], 16.846479483700453) // Ideal value 16.0
  testGoodnessOfFitEquals(cleanCurrentDt[16], 0.9991745311715157)
  cleanCurrentDt[17] = CECFilter.applyFilter(15.3, 137)
  testCleanValueEquals(cleanCurrentDt[17], 15.949532880220337) // Ideal Value 17.0
  testGoodnessOfFitEquals(cleanCurrentDt[17], 0.9984882007344251)
  cleanCurrentDt[18] = CECFilter.applyFilter(19.8, 138)
  testCleanValueEquals(cleanCurrentDt[18], 18.947013049189916) // Ideal value 18.0
  testGoodnessOfFitEquals(cleanCurrentDt[18], 0.9991745311715157)
  cleanCurrentDt[19] = CECFilter.applyFilter(17.1, 139)
  testCleanValueEquals(cleanCurrentDt[19], 17.830914508456228) // Ideal Value 19.0
  testGoodnessOfFitEquals(cleanCurrentDt[19], 0.9984882007344251)
  cleanCurrentDt[20] = CECFilter.applyFilter(22.0, 140)
  testCleanValueEquals(cleanCurrentDt[20], 21.047546614679376) // Ideal value 20.0
  testGoodnessOfFitEquals(cleanCurrentDt[20], 0.9991745311715157)
  cleanCurrentDt[21] = CECFilter.applyFilter(18.9, 141)
  testCleanValueEquals(cleanCurrentDt[21], 19.712296136692117) // Ideal Value 21.0
  testGoodnessOfFitEquals(cleanCurrentDt[21], 0.9984882007344251)
  cleanCurrentDt[22] = CECFilter.applyFilter(24.2, 142)
  testCleanValueEquals(cleanCurrentDt[22], 23.14808018016884) // Ideal value 22.0
  testGoodnessOfFitEquals(cleanCurrentDt[22], 0.9991745311715157)
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
