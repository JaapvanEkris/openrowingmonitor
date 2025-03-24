'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module maintains the metrics of a workoutSegment
*/
import { createSeries } from '../../engine/utils/Series.js'

export function createSegmentMetrics () {
  const power = createSeries()
  const _linearVelocity = createSeries()
  const strokerate = createSeries()
  const strokedistance = createSeries()
  const dragFactor = createSeries()
  const heartrate = createSeries()
  const linearVelocity = {
    average () { return averageLinearVelocity() },
    minimum () { return _linearVelocity.minimum() },
    maximum () { return _linearVelocity.maximum() },
    median () { return _linearVelocity.median() }
  }
  let startTimestamp
  let startMovingTime
  let startLinearDistance
  let startCalories
  let startStrokeNumber
  let endTimestamp
  let endMovingTime
  let endLinearDistance
  let endCalories
  let endStrokeNumber

  function setStart (metrics) {
    reset()
    push(metrics)
    startTimestamp = metrics.timestamp
    startMovingTime = metrics.totalMovingTime
    startLinearDistance = metrics.totalLinearDistance
    startCalories = metrics.totalCalories
    startStrokeNumber = metrics.totalNumberOfStrokes
  }

  function push (metrics) {
    if (!!metrics.cyclePower && !isNaN(metrics.cyclePower) && metrics.cyclePower > 0) { power.push(metrics.cyclePower) }
    if (!!metrics.cycleLinearVelocity && !isNaN(metrics.cycleLinearVelocity) && metrics.cycleLinearVelocity > 0) { _linearVelocity.push(metrics.cycleLinearVelocity) }
    if (!!metrics.cycleStrokeRate && !isNaN(metrics.cycleStrokeRate) && metrics.cycleStrokeRate > 0) { strokerate.push(metrics.cycleStrokeRate) }
    if (!!metrics.cycleDistance && !isNaN(metrics.cycleDistance) && metrics.cycleDistance > 0) { strokedistance.push(metrics.cycleDistance) }
    if (!!metrics.dragFactor && !isNaN(metrics.dragFactor) && metrics.dragFactor > 0) { dragFactor.push(metrics.dragFactor) }
    if (!!metrics.heartRate && !isNaN(metrics.heartRate) && metrics.heartRate > 0) { heartrate.push(metrics.heartRate) }
    endTimestamp = metrics.timestamp
    endMovingTime = metrics.totalMovingTime
    endLinearDistance = metrics.totalLinearDistance
    endCalories = metrics.totalCalories
    endStrokeNumber = metrics.totalNumberOfStrokes
  }

  function travelledLinearDistance () {
    if (!isNaN(startLinearDistance) && startLinearDistance >= 0 && !isNaN(endLinearDistance) && endLinearDistance > startLinearDistance) {
      return endLinearDistance - startLinearDistance
    } else {
      return 0
    }
  }

  function movingTime () {
    if (!isNaN(startMovingTime) && startMovingTime >= 0 && !isNaN(endMovingTime) && endMovingTime > startMovingTime) {
      return endMovingTime - startMovingTime
    } else {
      return 0
    }
  }

  function averageLinearVelocity () {
    if (!isNaN(startMovingTime) && startMovingTime >= 0 && !isNaN(startLinearDistance) && startLinearDistance >= 0 && !isNaN(endMovingTime) && endMovingTime > startMovingTime && !isNaN(endLinearDistance) && endLinearDistance > startLinearDistance) {
      return (endLinearDistance - startLinearDistance) / (endMovingTime - startMovingTime)
    } else {
      return _linearVelocity.average()
    }
  }

  function restTime () {
    if (!isNaN(startMovingTime) && !isNaN(startTimestamp) && startTimestamp >= 0 && !isNaN(endMovingTime) && !isNaN(endTimestamp) && endTimestamp > startTimestamp) {
      return Math.max(endTimestamp - startTimestamp, 0) - Math.max(endMovingTime - startMovingTime, 0)
    } else {
      return 0
    }
  }

  function numberOfStrokes () {
    if (!isNaN(startStrokeNumber) && startStrokeNumber >= 0 && !isNaN(endStrokeNumber) && endStrokeNumber > startStrokeNumber) {
      return endStrokeNumber - startStrokeNumber
    } else {
      return 0
    }
  }

  function spentCalories () {
    if (!isNaN(startCalories) && startCalories >= 0 && !isNaN(endCalories) && endCalories > startCalories) {
      return endCalories - startCalories
    } else {
      return 0
    }
  }

  function reset () {
    power.reset()
    _linearVelocity.reset()
    strokerate.reset()
    strokedistance.reset()
    heartrate.reset()
  }

  return {
    setStart,
    push,
    travelledLinearDistance,
    numberOfStrokes,
    spentCalories,
    movingTime,
    restTime,
    power,
    linearVelocity,
    strokerate,
    strokedistance,
    dragFactor,
    heartrate,
    reset
  }
}
