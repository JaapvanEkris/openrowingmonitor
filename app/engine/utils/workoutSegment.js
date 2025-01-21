'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This Module supports the creation and use of workoutSegment
*/
export function createWorkoutSegment () {
  let _type = 'justrow'
  let _startTime = 0
  let _startDistance = 0
  let _targetTime = 0
  let _targetDistance = 0
  let _endTime = 0
  let _endDistance = 0
  let _split = {
    type: 'justrow',
    targetDistance: 0,
    targetTime: 0
  }

  function setStart (baseMetrics) {
    _startTime = (baseMetrics.totalMovingTime !== undefined && baseMetrics.totalMovingTime > 0 ? baseMetrics.totalMovingTime : 0)
    _startDistance = (baseMetrics.totalLinearDistance !== undefined && baseMetrics.totalLinearDistance > 0 ? baseMetrics.totalLinearDistance : 0)
    _type = 'justrow'
    _targetTime = 0
    _targetDistance = 0
    _endTime = 0
    _endDistance = 0
    _split = {
      type: 'justrow',
      targetDistance: 0,
      targetTime: 0
    }
  }

  function setEnd (intervalSettings) {
    // Set the primairy parameters
    switch (true) {
      case (intervalSettings.type === 'rest' && intervalSettings.targetTime > 0):
        // A target time is set for a rest interval
        _type = 'rest'
        _targetTime = intervalSettings.targetTime
        _targetDistance = 0
        _endTime = _startTime + intervalSettings.targetTime
        _endDistance = 0
        break
      case (intervalSettings.type === 'distance' && intervalSettings.targetDistance > 0):
        // A target distance is set
        _type = 'distance'
        _targetTime = 0
        _targetDistance = intervalSettings.targetDistance
        _endTime = 0
        _endDistance = _startDistance + intervalSettings.targetDistance
        break
      case (intervalSettings.type === 'time' && intervalSettings.targetTime > 0):
        // A target time is set
        _type = 'time'
        _targetTime = intervalSettings.targetTime
        _targetDistance = 0
        _endTime = _startTime + intervalSettings.targetTime
        _endDistance = 0
        break
      default:
        _type = 'justrow'
        _targetTime = 0
        _targetDistance = 0
        _endTime = 0
        _endDistance = 0
    }

    // Set the split parameters
    switch (true) {
      case (intervalSettings.type === 'rest'):
        // A rest interval has no split defined
        _split = {
          type: 'justrow',
          targetDistance: 0,
          targetTime: 0
        }
        break
      case (intervalSettings.split !== undefined && intervalSettings.split.type === 'distance' && intervalSettings.split.targetDistance > 0):
        // A target distance is set
        _split = {
          type: 'distance',
          targetDistance: intervalSettings.split.targetDistance,
          targetTime: 0
        }
        break
      case (intervalSettings.split !== undefined && intervalSettings.split.type === 'time' && intervalSettings.split.targetTime > 0):
        // A target time is set
        _split = {
          type: 'time',
          targetDistance: 0,
          targetTime: intervalSettings.split.targetTime
        }
        break
      default:
        _split = {
          type: 'justrow',
          targetDistance: 0,
          targetTime: 0
        }
    }
  }

  // Returns the distance from te startpoint
  function distanceFromStart (baseMetrics) {
    if (_startDistance >= 0) {
      // We have exceeded the boundary
      return baseMetrics.totalLinearDistance - _startDistance
    } else {
      return undefined
    }
  }

  // Returns the distance to the endpoint
  function distanceToEnd (baseMetrics) {
    if (_type === 'distance' && _endDistance > 0) {
      // We have exceeded the boundary
      return _endDistance - baseMetrics.totalLinearDistance
    } else {
      return undefined
    }
  }

  // Returns the time from the startpoint
  function timeSinceStart (baseMetrics) {
    if (_startTime >= 0) {
      // We have exceeded the boundary
      return baseMetrics.totalMovingTime - _startTime
    } else {
      return undefined
    }
  }

  // Returns the time to the endpoint
  function timeToEnd (baseMetrics) {
    if ((_type === 'time' || _type === 'rest') && _endTime > 0) {
      // We have exceeded the boundary
      return _endTime - baseMetrics.totalMovingTime
    } else {
      return undefined
    }
  }

  // Checks for reaching a boundary condition
  function isEndReached (baseMetrics) {
    if ((_type === 'distance' && _endDistance > 0 && baseMetrics.totalLinearDistance >= _endDistance) || (_type === 'time' && _endTime > 0 && baseMetrics.totalMovingTime >= _endTime)) {
      // We have exceeded the boundary
      return true
    } else {
      return false
    }
  }

  function interpolateEnd (prevMetrics, currMetrics) {
    const projectedMetrics = { ...prevMetrics }
    let modified = false
    switch (true) {
      case (_type === 'distance' && _endDistance > 0 && currMetrics.totalLinearDistance > _endDistance):
        // We are in a distance based interval, and overshot the targetDistance
        projectedMetrics.totalMovingTime = interpolatedTime(prevMetrics, currMetrics, _endDistance)
        projectedMetrics.totalLinearDistance = _endDistance
        modified = true
        break
      case (_type === 'time' && _endTime > 0 && currMetrics.totalMovingTime > _endTime):
        // We are in a time based interval, and overshot the targetTime
        projectedMetrics.totalLinearDistance = interpolatedDistance(prevMetrics, currMetrics, _endTime)
        projectedMetrics.totalMovingTime = _endTime
        modified = true
        break
      default:
        // Nothing to do
    }
    // Prevent the edge case where we trigger two strokes at milliseconds apart when using the interpolation function
    projectedMetrics.isDriveStart = false
    projectedMetrics.isRecoveryStart = false
    projectedMetrics.modified = modified
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

  function reset () {
    _startTime = 0
    _startDistance = 0
    _type = 'justrow'
    _targetTime = 0
    _targetDistance = 0
    _endTime = 0
    _endDistance = 0
    _split = {
      type: 'justrow',
      targetDistance: 0,
      targetTime: 0
    }
  }

  function endDistance () {
    if (_type === 'distance' && _endDistance > 0) {
      return _endDistance
    } else {
      return undefined
    }
  }

  function endTime () {
    if (_type === 'time' && _endTime > 0) {
      // We have exceeded the boundary
      return _endTime
    } else {
      return undefined
    }
  }

  function getSplit () {
    return _split
  }

  function targetDistance () {
    if (_type === 'distance' && _endDistance > 0) {
      return _targetDistance
    } else {
      return undefined
    }
  }

  function targetTime () {
    if (_type === 'time' && _endTime > 0) {
      // We have exceeded the boundary
      return _targetTime
    } else {
      return undefined
    }
  }

  function splitDistance () {
    return _split.targetDistance
  }

  function splitTime () {
    return _split.targetTime
  }

  function type () {
    return _type
  }

  return {
    setStart,
    setEnd,
    isEndReached,
    interpolateEnd,
    distanceFromStart,
    distanceToEnd,
    timeSinceStart,
    timeToEnd,
    setInterval,
    reset,
    type,
    endTime,
    endDistance,
    getSplit,
    targetTime,
    targetDistance,
    splitTime,
    splitDistance
  }
}
