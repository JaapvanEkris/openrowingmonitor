'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module maintains the metrics of a workoutSegment
*/
import { createSeries } from '../../engine/utils/Series.js'

export function createSegmentMetrics () {
  const power = createSeries()
  const linearVelocity = createSeries()
  const strokerate = createSeries()
  const strokedistance = createSeries()
  const heartrate = createSeries()

  function push (metrics) {
    if (!!metrics.cyclePower && !isNaN(metrics.cyclePower) && metrics.cyclePower > 0) { power.push(metrics.cyclePower) }
    if (!!metrics.cycleLinearVelocity && !isNaN(metrics.cycleLinearVelocity) && metrics.cycleLinearVelocity > 0) { linearVelocity.push(metrics.cycleLinearVelocity) }
    if (!!metrics.cycleStrokeRate && !isNaN(metrics.cycleStrokeRate) && metrics.cycleStrokeRate > 0) { strokerate.push(metrics.cycleStrokeRate) }
    if (!!metrics.cycleDistance && !isNaN(metrics.cycleDistance) && metrics.cycleDistance > 0) { strokedistance.push(metrics.cycleDistance) }
    if (!!metrics.heartRate && !isNaN(metrics.heartRate) && metrics.heartRate > 0) { heartrate.push(metrics.heartRate) }
  }

  function reset () {
    power.reset()
    linearVelocity.reset()
    strokerate.reset()
    strokedistance.reset()
    heartrate.reset()
  }

  return {
    push,
    power,
    linearVelocity,
    strokerate,
    strokedistance,
    heartrate,
    reset
  }
}
