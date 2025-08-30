'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This implements a Moving Regression Algorithm to obtain a coefficients, first (angular velocity) and
 * second derivative (angular acceleration) at the front of the flank
 */

import { createTSQuadraticSeries } from './FullTSQuadraticSeries.js'
import { createWeighedSeries } from './WeighedSeries.js'
import { createGausianWeightFunction } from './Gausian.js'

export function createMovingRegressor (bandwith) {
  const flankLength = bandwith
  const quadraticTheilSenRegressor = createTSQuadraticSeries(flankLength)
  const gausianWeight = createGausianWeightFunction()
  let aMatrix = []
  let bMatrix = []
  let cMatrix = []

  function push (x, y) {
    quadraticTheilSenRegressor.push(x, y)

    // Let's shift the matrix to make room for a new datapoint
    if (aMatrix.length >= flankLength) {
      // The angularVelocityMatrix has reached its maximum length, we need to remove the first element
      aMatrix[0].reset()
      aMatrix[0] = null
      aMatrix.shift()
      bMatrix[0].reset()
      bMatrix[0] = null
      bMatrix.shift()
      cMatrix[0].reset()
      cMatrix[0] = null
      cMatrix.shift()
    }

    // Let's make room for a new set of values for first and second derivatives
    aMatrix[aMatrix.length] = createWeighedSeries(flankLength, 0)
    bMatrix[bMatrix.length] = createWeighedSeries(flankLength, 0)
    cMatrix[cMatrix.length] = createWeighedSeries(flankLength, 0)

    let i = 0
    let weight = 0
    gausianWeight.setWindowWidth(quadraticTheilSenRegressor.X.atSeriesBegin(), quadraticTheilSenRegressor.X.atSeriesEnd())

    // Let's calculate the first and second derivatives for each datapoint and store them in their matrices
    while (i < aMatrix.length  && quadraticTheilSenRegressor.reliable()) {
      weight = quadraticTheilSenRegressor.goodnessOfFit() * quadraticTheilSenRegressor.localGoodnessOfFit(i) * gausianWeight.weight(quadraticTheilSenRegressor.X.get(i))
      aMatrix[i].push(quadraticTheilSenRegressor.coefficientA(), weight)
      bMatrix[i].push(quadraticTheilSenRegressor.coefficientB(), weight)
      cMatrix[i].push(quadraticTheilSenRegressor.coefficientC(), weight)
      i++
    }
  }

  function coefficientA (position = 0) {
    if (aMatrix.length === flankLength && position < aMatrix.length) {
      return aMatrix[position].weighedAverage()
    } else {
      return undefined
    }
  }

  function coefficientB (position = 0) {
    if (bMatrix.length === flankLength && position < aMatrix.length) {
      return bMatrix[position].weighedAverage()
    } else {
      return undefined
    }
  }

  function coefficientC (position = 0) {
    if (cMatrix.length === flankLength && position < aMatrix.length) {
      return cMatrix[position].weighedAverage()
    } else {
      return undefined
    }
  }

  function firstDerivative (position = 0) {
    if (aMatrix.length === flankLength && position < aMatrix.length) {
      return ((aMatrix[position].weighedAverage() * 2 * quadraticTheilSenRegressor.X.get(position)) + bMatrix[position].weighedAverage())
    } else {
      return undefined
    }
  }

  function secondDerivative (position = 0) {
    if (aMatrix.length === flankLength && position < aMatrix.length) {
      return (aMatrix[position].weighedAverage() * 2)
    } else {
      return undefined
    }
  }

  function reset () {
    quadraticTheilSenRegressor.reset()
    let i = aMatrix.length
    while (i > 0) {
      aMatrix[0].reset()
      aMatrix[0] = null
      aMatrix.shift()
      i--
    }
    aMatrix = null
    aMatrix = []

    let j = bMatrix.length
    while (j > 0) {
      bMatrix[0].reset()
      bMatrix[0] = null
      bMatrix.shift()
      j--
    }
    bMatrix = null
    bMatrix = []

    let k = cMatrix.length
    while (k > 0) {
      cMatrix[0].reset()
      cMatrix[0] = null
      cMatrix.shift()
      k--
    }
    cMatrix = null
    cMatrix = []
  }

  return {
    push,
    coefficientA,
    coefficientB,
    coefficientC,
    firstDerivative,
    secondDerivative,
    reset
  }
}
