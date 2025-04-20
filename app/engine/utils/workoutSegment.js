'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module supports the creation and use of workoutSegment
*/
/* eslint-disable max-lines -- This contains a lot of defensive programming, so it is long */
import { createOLSLinearSeries } from './OLSLinearSeries.js'
import { createSeries } from './Series.js'
import loglevel from 'loglevel'
const log = loglevel.getLogger('RowingEngine')

export function createWorkoutSegment (config) {
  const numOfDataPointsForAveraging = config.numOfPhasesForAveragingScreenData
  const distanceOverTime = createOLSLinearSeries(Math.min(4, numOfDataPointsForAveraging))
  const _power = createSeries()
  const _linearVelocity = createSeries()
  const _strokerate = createSeries()
  const _strokedistance = createSeries()
  const _caloriesPerHour = createSeries()
  const _dragFactor = createSeries()
  let _type = 'justrow'
  let _startTimestamp
  let _startMovingTime = 0
  let _startLinearDistance = 0
  let _startStrokeNumber = 0
  let _startCalories = 0
  let _targetTime = 0
  let _targetDistance = 0
  let _endMovingTime = 0
  let _endLinearDistance = 0
  let _totalNumberIntervals = 0
  let _split = {
    type: 'justrow',
    targetDistance: 0,
    targetTime: 0
  }

  function setStart (baseMetrics) {
    resetSegmentMetrics()
    _startMovingTime = (baseMetrics.totalMovingTime !== undefined && baseMetrics.totalMovingTime > 0 ? baseMetrics.totalMovingTime : 0)
    _startLinearDistance = (baseMetrics.totalLinearDistance !== undefined && baseMetrics.totalLinearDistance > 0 ? baseMetrics.totalLinearDistance : 0)
    _startTimestamp = baseMetrics.timestamp
    _startCalories = baseMetrics.totalCalories
    _startStrokeNumber = baseMetrics.totalNumberOfStrokes
  }

  function setStartTimestamp (timestamp) {
    _startTimestamp = timestamp
  }

  function getStartTimestamp () {
    return _startTimestamp
  }

  function summarize (intervals) {
    let intervalNumber = 0
    let totalDistance = 0
    let totalTime = 0
    let containsJustRow = false
    _totalNumberIntervals = Math.max(intervals.length, 1)
    switch (true) {
      case (intervals.length === 0):
        setEnd({ type: 'justrow' })
        break
      case (intervals.length === 1):
        setEnd(intervals[0])
        break
      case (intervals.length > 1):
        while (intervalNumber < intervals.length) {
          switch (true) {
            case (intervals[intervalNumber].type === 'rest' && intervals[intervalNumber].targetTime > 0):
              // As a rest has no impact on the (target) total moving time and distance, there is nothing to do here
              break
            case (intervals[intervalNumber].type === 'distance' && intervals[intervalNumber].targetDistance > 0):
              totalDistance = totalDistance + Number(intervals[intervalNumber].targetDistance)
              break
            case (intervals[intervalNumber].type === 'time' && intervals[intervalNumber].targetTime > 0):
              totalTime = totalTime + Number(intervals[intervalNumber].targetTime)
              break
            case (intervals[intervalNumber].type === 'justrow'):
              containsJustRow = true
              break
            default:
              containsJustRow = true
          }
          intervalNumber++
        }
        switch (true) {
          case (containsJustRow):
            setEnd({ type: 'justrow' })
            break
          case (totalDistance > 0 && totalTime === 0):
            setEnd({ type: 'distance', targetDistance: totalDistance })
            break
          case (totalTime > 0 && totalDistance === 0):
            setEnd({ type: 'time', targetTime: totalTime })
            break
          case (totalTime > 0 && totalDistance > 0):
            setEnd({ type: 'justrow' })
            break
          default:
            setEnd({ type: 'justrow' })
        }
        break
      default:
        setEnd({ type: 'justrow' })
    }
  }

  function setEnd (intervalSettings) {
    // Set the primairy parameters
    switch (true) {
      case (intervalSettings.type === 'rest' && intervalSettings.targetTime > 0):
        // A target time is set for a rest interval
        _type = 'rest'
        _targetTime = Number(intervalSettings.targetTime)
        _targetDistance = 0
        _endMovingTime = _startMovingTime + Number(intervalSettings.targetTime)
        _endLinearDistance = 0
        log.debug(`  Workout parser, recognised ${_type} interval/split, ${_targetTime} seconds`)
        break
      case (intervalSettings.type === 'distance' && intervalSettings.targetDistance > 0):
        // A target distance is set
        _type = 'distance'
        _targetTime = 0
        _targetDistance = Number(intervalSettings.targetDistance)
        _endMovingTime = 0
        _endLinearDistance = _startLinearDistance + Number(intervalSettings.targetDistance)
        log.debug(`  Workout parser, recognised ${_type} interval/split, ${_targetDistance} meters`)
        break
      case (intervalSettings.type === 'time' && intervalSettings.targetTime > 0):
        // A target time is set
        _type = 'time'
        _targetTime = Number(intervalSettings.targetTime)
        _targetDistance = 0
        _endMovingTime = _startMovingTime + Number(intervalSettings.targetTime)
        _endLinearDistance = 0
        log.debug(`  Workout parser, recognised ${_type} interval/split, ${_targetTime} seconds`)
        break
      case (intervalSettings.type === 'justrow'):
        _type = 'justrow'
        _targetTime = 0
        _targetDistance = 0
        _endMovingTime = 0
        _endLinearDistance = 0
        log.debug(`  Workout parser, recognised ${_type} interval/split`)
        break
      default:
        log.error(`Workout parser, unknown interval type '${intervalSettings.type}', defaulting to a 'justrow' interval`)
        _type = 'justrow'
        _targetTime = 0
        _targetDistance = 0
        _endMovingTime = 0
        _endLinearDistance = 0
    }

    // Set the split parameters
    switch (true) {
      case (intervalSettings.type === 'rest'):
        // A rest interval has no split defined
        _split = {
          type: 'rest',
          targetDistance: 0,
          targetTime: _targetTime
        }
        break
      case (!!intervalSettings.split && intervalSettings.split !== undefined && intervalSettings.split.type === 'distance' && intervalSettings.split.targetDistance > 0):
        // A target distance is set
        _split = {
          type: 'distance',
          targetDistance: Number(intervalSettings.split.targetDistance),
          targetTime: 0
        }
        break
      case (!!intervalSettings.split && intervalSettings.split !== undefined && intervalSettings.split.type === 'time' && intervalSettings.split.targetTime > 0):
        // A target time is set
        _split = {
          type: 'time',
          targetDistance: 0,
          targetTime: Number(intervalSettings.split.targetTime)
        }
        break
      case (!!intervalSettings.split && intervalSettings.split !== undefined && intervalSettings.split.type === 'justrow'):
        _split = {
          type: _type,
          targetDistance: _targetDistance,
          targetTime: _targetTime
        }
        break
      case (!intervalSettings.split):
        // Split is left empty, we default to the entire interval
        _split = {
          type: _type,
          targetDistance: _targetDistance,
          targetTime: _targetTime
        }
        break
      default:
        log.error(`Workout parser, unknown split type '${intervalSettings.split.type}', defaulting to copying interval type`)
        _split = {
          type: _type,
          targetDistance: _targetDistance,
          targetTime: _targetTime
        }
    }
  }

  // Updates projectiondata and segment metrics
  function push (baseMetrics) {
    distanceOverTime.push(baseMetrics.totalMovingTime, baseMetrics.totalLinearDistance)
    if (!!baseMetrics.cyclePower && !isNaN(baseMetrics.cyclePower) && baseMetrics.cyclePower > 0) { _power.push(baseMetrics.cyclePower) }
    if (!!baseMetrics.cycleLinearVelocity && !isNaN(baseMetrics.cycleLinearVelocity) && baseMetrics.cycleLinearVelocity > 0) { _linearVelocity.push(baseMetrics.cycleLinearVelocity) }
    if (!!baseMetrics.cycleStrokeRate && !isNaN(baseMetrics.cycleStrokeRate) && baseMetrics.cycleStrokeRate > 0) { _strokerate.push(baseMetrics.cycleStrokeRate) }
    if (!!baseMetrics.cycleDistance && !isNaN(baseMetrics.cycleDistance) && baseMetrics.cycleDistance > 0) { _strokedistance.push(baseMetrics.cycleDistance) }
    if (!!baseMetrics.totalCaloriesPerHour && !isNaN(baseMetrics.totalCaloriesPerHour) && baseMetrics.totalCaloriesPerHour > 0) { _caloriesPerHour.push(baseMetrics.totalCaloriesPerHour) }
    if (!!baseMetrics.dragFactor && !isNaN(baseMetrics.dragFactor) && baseMetrics.dragFactor > 0) { _dragFactor.push(baseMetrics.dragFactor) }
  }

  // Returns the distance from te startpoint
  function distanceFromStart (baseMetrics) {
    if (!isNaN(_startLinearDistance) && _startLinearDistance >= 0 && !isNaN(baseMetrics.totalLinearDistance) && baseMetrics.totalLinearDistance > _startLinearDistance) {
      return baseMetrics.totalLinearDistance - _startLinearDistance
    } else {
      return 0
    }
  }

  // Returns the distance to the endpoint
  function distanceToEnd (baseMetrics) {
    if (_type === 'distance' && _endLinearDistance > 0) {
      // We have set a distance boundary
      return _endLinearDistance - baseMetrics.totalLinearDistance
    } else {
      return undefined
    }
  }

  // Returns the moving time from the startpoint
  function timeSinceStart (baseMetrics) {
    if (!isNaN(_startMovingTime) && _startMovingTime >= 0 && !isNaN(baseMetrics.totalMovingTime) && baseMetrics.totalMovingTime > _startMovingTime) {
      return baseMetrics.totalMovingTime - _startMovingTime
    } else {
      return 0
    }
  }

  // Returns the projected time to the workoutsegment endpoint
  function projectedEndTime () {
    switch (true) {
      case (_type === 'distance' && _endLinearDistance > 0 && distanceOverTime.reliable()):
        // We are in a distance based interval, so we need to project
        return distanceOverTime.projectY(_endLinearDistance)
      case (_type === 'time' && _endMovingTime > 0):
        return _endMovingTime
      default:
        return undefined
    }
  }

  // Returns the projected time to the workoutsegment endpoint
  function projectedEndDistance () {
    switch (true) {
      case (_type === 'distance' && _endLinearDistance > 0):
        return _endLinearDistance
      case (_type === 'time' && _endMovingTime > 0 && distanceOverTime.reliable()):
        // We are in a time based interval, so we need to project
        return distanceOverTime.projectX(_endMovingTime)
      default:
        return undefined
    }
  }

  // Returns the time to the endpoint
  function timeToEnd (baseMetrics) {
    if ((_type === 'time' || _type === 'rest') && _endMovingTime > 0) {
      // We are in a time based interval
      return _endMovingTime - baseMetrics.totalMovingTime
    } else {
      return undefined
    }
  }

  function totalTime (baseMetrics) {
    if (!isNaN(_startTimestamp) && _startTimestamp >= 0 && !isNaN(baseMetrics.timestamp) && baseMetrics.timestamp > _startTimestamp) {
      return Math.max((baseMetrics.timestamp.getTime() - _startTimestamp.getTime()) / 1000, (baseMetrics.totalMovingTime - _startMovingTime))
    } else {
      return 0
    }
  }

  function restTime (baseMetrics) {
    if (!isNaN(_startMovingTime) && !isNaN(_startTimestamp) && _startTimestamp >= 0 && !isNaN(baseMetrics.totalMovingTime) && !isNaN(baseMetrics.timestamp) && baseMetrics.timestamp > _startTimestamp) {
      return (Math.max(baseMetrics.timestamp.getTime() - _startTimestamp.getTime(), 0) / 1000) - Math.max(baseMetrics.totalMovingTime - _startMovingTime, 0)
    } else {
      return 0
    }
  }

  function averageLinearVelocity (baseMetrics) {
    if (!isNaN(_startMovingTime) && _startMovingTime >= 0 && !isNaN(_startLinearDistance) && _startLinearDistance >= 0 && !isNaN(baseMetrics.totalMovingTime) && baseMetrics.totalMovingTime > _startMovingTime && !isNaN(baseMetrics.totalLinearDistance) && baseMetrics.totalLinearDistance > _startLinearDistance) {
      return (baseMetrics.totalLinearDistance - _startLinearDistance) / (baseMetrics.totalMovingTime - _startMovingTime)
    } else {
      return _linearVelocity.average()
    }
  }

  /**
   * @param {number} linearVel
   */
  function linearVelocityToPace (linearVel) {
    if (!isNaN(linearVel) && linearVel > 0) {
      return (500.0 / linearVel)
    } else {
      return Infinity
    }
  }

  function numberOfStrokes (baseMetrics) {
    if (!isNaN(_startStrokeNumber) && _startStrokeNumber >= 0 && !isNaN(baseMetrics.totalNumberOfStrokes) && baseMetrics.totalNumberOfStrokes > _startStrokeNumber) {
      return baseMetrics.totalNumberOfStrokes - _startStrokeNumber
    } else {
      return 0
    }
  }

  function spentCalories (baseMetrics) {
    if (!isNaN(_startCalories) && _startCalories >= 0 && !isNaN(baseMetrics.totalCalories) && baseMetrics.totalCalories > _startCalories) {
      return baseMetrics.totalCalories - _startCalories
    } else {
      return 0
    }
  }

  // Checks for reaching a boundary condition
  function isEndReached (baseMetrics) {
    if ((_type === 'distance' && _endLinearDistance > 0 && baseMetrics.totalLinearDistance >= _endLinearDistance) || (_type === 'time' && _endMovingTime > 0 && baseMetrics.totalMovingTime >= _endMovingTime)) {
      // We have exceeded the boundary
      return true
    } else {
      return false
    }
  }

  function interpolateEnd (prevMetrics, currMetrics) {
    const projectedMetrics = { ...prevMetrics }
    projectedMetrics.modified = false
    switch (true) {
      case (_type === 'distance' && _endLinearDistance > 0 && currMetrics.totalLinearDistance > _endLinearDistance):
        // We are in a distance based interval, and overshot the targetDistance
        projectedMetrics.totalMovingTime = interpolatedTime(prevMetrics, currMetrics, _endLinearDistance)
        projectedMetrics.timestamp = new Date(currMetrics.timestamp.getTime() - ((currMetrics.totalMovingTime - projectedMetrics.totalMovingTime) * 1000))
        projectedMetrics.totalLinearDistance = _endLinearDistance
        projectedMetrics.timestamp = currMetrics.timestamp - ((currMetrics.totalMovingTime - projectedMetrics.totalMovingTime) * 1000)
        projectedMetrics.modified = true
        break
      case (_type === 'time' && _endMovingTime > 0 && currMetrics.totalMovingTime > _endMovingTime):
        // We are in a time based interval, and overshot the targetTime
        projectedMetrics.totalLinearDistance = interpolatedDistance(prevMetrics, currMetrics, _endMovingTime)
        projectedMetrics.totalMovingTime = _endMovingTime
        projectedMetrics.timestamp = new Date(_startTimestamp.getTime() + (_targetTime * 1000))
        projectedMetrics.modified = true
        break
      default:
        // Nothing to do
    }
    projectedMetrics.timestamp = new Date(currMetrics.timestamp.getTime() - ((currMetrics.totalMovingTime - projectedMetrics.totalMovingTime) * 1000))
    // Prevent the edge case where we trigger two strokes at milliseconds apart when using the interpolation function
    projectedMetrics.metricsContext.isDriveStart = false
    projectedMetrics.metricsContext.isRecoveryStart = false
    projectedMetrics.metricsContext.isSessionStart = false
    projectedMetrics.metricsContext.isIntervalEnd = false
    projectedMetrics.metricsContext.isSplitEnd = false
    projectedMetrics.metricsContext.isPauseStart = false
    projectedMetrics.metricsContext.isPauseEnd = false
    projectedMetrics.metricsContext.isSessionStop = false
    return projectedMetrics
  }

  function interpolatedTime (prevMetrics, currMetrics, targetDistance) {
    if (prevMetrics.totalLinearDistance < targetDistance && targetDistance < currMetrics.totalLinearDistance) {
      // See https://en.wikipedia.org/wiki/Linear_interpolation
      return (prevMetrics.totalMovingTime + ((currMetrics.totalMovingTime - prevMetrics.totalMovingTime) * ((targetDistance - prevMetrics.totalLinearDistance) / (currMetrics.totalLinearDistance - prevMetrics.totalLinearDistance))))
    } else {
      return currMetrics.totalMovingTime
    }
  }

  function interpolatedDistance (prevMetrics, currMetrics, targetTime) {
    if (prevMetrics.totalMovingTime < targetTime && targetTime < currMetrics.totalMovingTime) {
      // See https://en.wikipedia.org/wiki/Linear_interpolation
      return (prevMetrics.totalLinearDistance + ((currMetrics.totalLinearDistance - prevMetrics.totalLinearDistance) * ((targetTime - prevMetrics.totalMovingTime) / (currMetrics.totalMovingTime - prevMetrics.totalMovingTime))))
    } else {
      return currMetrics.totalLinearDistance
    }
  }

  function getSplit () {
    return _split
  }

  function targetDistance () {
    if (_type === 'distance' && _endLinearDistance > 0) {
      return _targetDistance
    } else {
      return undefined
    }
  }

  function absoluteEndDistance () {
    if (_type === 'distance' && _endLinearDistance > 0) {
      return _endLinearDistance
    } else {
      return undefined
    }
  }

  function targetTime () {
    if (_type === 'time' && _endMovingTime > 0) {
      // We have a distance boundary
      return _targetTime
    } else {
      return undefined
    }
  }

  function absoluteEndTime () {
    if (_type === 'time' && _endMovingTime > 0) {
      // We have a distance boundary
      return _endMovingTime
    } else {
      return undefined
    }
  }

  function type () {
    return _type
  }

  function metrics (baseMetrics) {
    return {
      type: _type,
      ...(_totalNumberIntervals > 0 ? { numberOfIntervals: _totalNumberIntervals } : {}),
      numberOfStrokes: numberOfStrokes(baseMetrics),
      distance: {
        fromStart: distanceFromStart(baseMetrics),
        target: targetDistance(),
        absoluteTarget: absoluteEndDistance(),
        toEnd: distanceToEnd(baseMetrics),
        projectedEnd: projectedEndDistance()
      },
      movingTime: {
        sinceStart: timeSinceStart(baseMetrics),
        target: targetTime(),
        absoluteTarget: absoluteEndTime(),
        toEnd: timeToEnd(baseMetrics),
        projectedEnd: projectedEndTime()
      },
      timeSpent: {
        total: totalTime(baseMetrics),
        moving: timeSinceStart(baseMetrics),
        rest: restTime(baseMetrics)
      },
      linearVelocity: {
        average: averageLinearVelocity(baseMetrics),
        minimum: _linearVelocity.minimum(),
        maximum: _linearVelocity.maximum()
      },
      pace: {
        average: linearVelocityToPace(averageLinearVelocity(baseMetrics)),
        minimum: linearVelocityToPace(_linearVelocity.minimum()),
        maximum: linearVelocityToPace(_linearVelocity.maximum())
      },
      power: {
        average: _power.average(),
        minimum: _power.minimum(),
        maximum: _power.maximum()
      },
      strokeDistance: {
        average: _strokedistance.average(),
        minimum: _strokedistance.minimum(),
        maximum: _strokedistance.maximum()
      },
      strokerate: {
        average: _strokerate.average(),
        minimum: _strokerate.minimum(),
        maximum: _strokerate.maximum()
      },
      dragfactor: {
        average: _dragFactor.average(),
        minimum: _dragFactor.minimum(),
        maximum: _dragFactor.maximum()
      },
      calories: {
        totalSpent: spentCalories(baseMetrics),
        averagePerHour: _caloriesPerHour.average()
      }
    }
  }

  function resetSegmentMetrics () {
    _linearVelocity.reset()
    _strokerate.reset()
    _strokedistance.reset()
    _caloriesPerHour.reset()
    _power.reset()
    _dragFactor.reset()
    _type = 'justrow'
    _startTimestamp = undefined
    _startMovingTime = 0
    _startLinearDistance = 0
    _startStrokeNumber = 0
    _startCalories = 0
    _targetTime = 0
    _targetDistance = 0
    _endMovingTime = 0
    _endLinearDistance = 0
    _split = {
      type: 'justrow',
      targetDistance: 0,
      targetTime: 0
    }
  }

  function reset () {
    resetSegmentMetrics()
    distanceOverTime.reset()
  }

  return {
    setStart,
    setStartTimestamp,
    getStartTimestamp,
    summarize,
    setEnd,
    isEndReached,
    interpolateEnd,
    metrics,
    timeSinceStart,
    timeToEnd,
    setInterval,
    type,
    push,
    getSplit,
    reset
  }
}
