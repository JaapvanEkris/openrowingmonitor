'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This implements a Moving Regression Algorithm to obtain a first (angular velocity) and
 * second derivative (angular acceleration) at a specific point in our series
 */

import { createTSQuadraticSeries } from './FullTSQuadraticSeries.js'
import { createWeighedSeries } from './WeighedSeries.js'
import { createGausianWeightFunction } from './Gausian.js'

export function createMovingRegressor (bandwith) {
  const flankLength = bandwith
  const movingWindow = createTSQuadraticSeries(flankLength)
  const gausianWeight = createGausianWeightFunction()
  let firstDerivativeMatrix = []
  let secondDerivativeMatrix = []

  function push (x, y) {
    movingWindow.push(x, y)

    // Let's shift the matrix to make room for a new datapoint
    if (firstDerivativeMatrix.length >= flankLength) {
      // The angularVelocityMatrix has reached its maximum length, we need to remove the first element
      firstDerivativeMatrix[0].reset()
      firstDerivativeMatrix[0] = null
      firstDerivativeMatrix.shift()
      secondDerivativeMatrix[0].reset()
      secondDerivativeMatrix[0] = null
      secondDerivativeMatrix.shift()
    }

    // Let's make room for a new set of values for first and second derivatives
    firstDerivativeMatrix[firstDerivativeMatrix.length] = createWeighedSeries(flankLength, 0)
    secondDerivativeMatrix[secondDerivativeMatrix.length] = createWeighedSeries(flankLength, 0)

    let i = 0
	let weight = 0
    gausianWeight.setWindowWidth(movingWindow.X.atSeriesBegin(), movingWindow.X.atSeriesEnd())

    // Let's calculate the first and second derivatives for each datapoint and store them in their matrices
    while (i < firstDerivativeMatrix.length) {
	  weight = movingWindow.goodnessOfFit() * movingWindow.localGoodnessOfFit(i) * gausianWeight.weight(movingWindow.X.get(i))
      firstDerivativeMatrix[i].push(movingWindow.firstDerivativeAtPosition(i), weight)
      secondDerivativeMatrix[i].push(movingWindow.secondDerivativeAtPosition(i), weight)
      i++
    }
  }

  function firstDerivativeAtBeginFlank () {
    if (firstDerivativeMatrix.length === flankLength) {
      return firstDerivativeMatrix[0].weighedAverage()
    } else {
      return undefined
    }
  }

  function secondDerivativeAtBeginFlank () {
    if (firstDerivativeMatrix.length === flankLength) {
      return secondDerivativeMatrix[0].weighedAverage()
    } else {
      return undefined
    }
  }

  function reset () {
    movingWindow.reset()
    let i = firstDerivativeMatrix.length
    while (i > 0) {
      firstDerivativeMatrix[0].reset()
      firstDerivativeMatrix[0] = null
      firstDerivativeMatrix.shift()
      i--
    }
    firstDerivativeMatrix = null
    firstDerivativeMatrix = []
    let j = secondDerivativeMatrix.length
    while (j > 0) {
      secondDerivativeMatrix[0].reset()
      secondDerivativeMatrix[0] = null
      secondDerivativeMatrix.shift()
      j--
    }
    secondDerivativeMatrix = null
    secondDerivativeMatrix = []
  }

  return {
    push,
    firstDerivativeAtBeginFlank,
    secondDerivativeAtBeginFlank,
    reset
  }
}
