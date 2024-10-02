'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  This models the flywheel with all of its attributes, which we can also test for being powered

  All times and distances are defined as being before the beginning of the flank, as RowingEngine's metrics
  solely depend on times and angular positions before the flank (as they are to be certain to belong to a specific
  drive or recovery phase).

  Please note: The array contains a buffer of flankLenght measured currentDt's, BEFORE they are actually processed

  Please note2: This implements Linear regression to obtain the drag factor. We deliberatly DO NOT include the flank data
  as we don't know wether they will belong to a Drive or Recovery phase. So we include things which we know for certain that
  are part of a specific phase, i.e. dirtyDataPoints[flankLength], which will be eliminated from the flank

  The calculation of angular velocity and acceleration is based on Quadratic Regression, as the second derivative tends to be
  quite fragile when small errors are thrown in the mix. The math behind this approach can be found in https://physics.info/motion-equations/
  which is intended for simple linear motion, but the formula are identical when applied to angular distances, velocities and
  accelerations.
*/

import loglevel from 'loglevel'
import { createStreamFilter } from './utils/StreamFilter.js'
import { createTSLinearSeries } from './utils/FullTSLinearSeries.js'
import { createTSQuadraticSeries } from './utils/FullTSQuadraticSeries.js'
import { createWeighedSeries } from './utils/WeighedSeries.js'

const log = loglevel.getLogger('RowingEngine')

export function createFlywheel (rowerSettings) {
  const angularDisplacementPerImpulse = (2.0 * Math.PI) / rowerSettings.numOfImpulsesPerRevolution
  const flankLength = rowerSettings.flankLength
  const minimumDragFactorSamples = Math.floor(rowerSettings.minimumRecoveryTime / rowerSettings.maximumTimeBetweenImpulses)
  const minimumAngularVelocity = angularDisplacementPerImpulse / rowerSettings.maximumTimeBetweenImpulses
  const minimumTorqueBeforeStroke = rowerSettings.minimumForceBeforeStroke * (rowerSettings.sprocketRadius / 100)
  const currentDt = createStreamFilter(rowerSettings.smoothing, rowerSettings.maximumTimeBetweenImpulses)
  const _deltaTime = createTSLinearSeries(flankLength)
  const _angularDistance = createTSQuadraticSeries(flankLength)
  const drag = createWeighedSeries(rowerSettings.dragFactorSmoothing, (rowerSettings.dragFactor / 1000000))
  const recoveryDeltaTime = createTSLinearSeries()
  const strokedetectionMinimalGoodnessOfFit = rowerSettings.minimumStrokeQuality
  const minimumRecoverySlope = createWeighedSeries(rowerSettings.dragFactorSmoothing, rowerSettings.minimumRecoverySlope)
  let _angularVelocityMatrix = []
  let _angularAccelerationMatrix = []
  let _deltaTimeBeforeFlank
  let _angularVelocityAtBeginFlank
  let _angularVelocityBeforeFlank
  let _angularAccelerationAtBeginFlank
  let _angularAccelerationBeforeFlank
  let _torqueAtBeginFlank
  let _torqueBeforeFlank
  let inRecoveryPhase
  let maintainMetrics
  let totalNumberOfImpulses
  let totalTimeSpinning
  let currentCleanTime
  let currentRawTime
  let currentAngularDistance
  reset()

  function pushValue (dataPoint) {
    if (isNaN(dataPoint) || dataPoint < 0 || dataPoint > rowerSettings.maximumStrokeTimeBeforePause) {
      // This typicaly happends after a pause, we need to fix this as it throws off all time calculations
      log.debug(`*** WARNING: currentDt of ${dataPoint} sec isn't between 0 and maximumStrokeTimeBeforePause (${rowerSettings.maximumStrokeTimeBeforePause} sec), value skipped`)
      return
    }

    if (dataPoint > rowerSettings.maximumTimeBetweenImpulses && maintainMetrics) {
      // This shouldn't happen, but let's log it to clarify there is some issue going on here
      log.debug(`*** WARNING: currentDt of ${dataPoint} sec is above maximumTimeBetweenImpulses (${rowerSettings.maximumTimeBetweenImpulses} sec)`)
    }

    if (dataPoint < rowerSettings.minimumTimeBetweenImpulses) {
      if (_deltaTime.length() >= flankLength && maintainMetrics) {
        // We are in a normal operational mode, so this shouldn't happen, but let's log it to clarify there is some issue going on here, but accept the value as the TS estimator can handle it
        log.debug(`*** WARNING: currentDt of ${dataPoint} sec is below minimumTimeBetweenImpulses (${rowerSettings.minimumTimeBetweenImpulses} sec)`)
      } else {
        // This is probably due to the start-up noise of a slow but accelerating flywheel as the flink isn't filled or we aren't maintaining metrics
        log.debug(`*** WARNING: currentDt of ${dataPoint} sec is below minimumTimeBetweenImpulses (${rowerSettings.minimumTimeBetweenImpulses} sec) in a startup phase, value skipped, consider udjusting the gpio debounce filter`)
        return
      }
    }

    currentDt.push(dataPoint)

    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      // If we maintain metrics, update the angular position, spinning time of the flywheel and the associated metrics,
      // Also we nend feed the Drag calculation. We need to do this, BEFORE the array shifts, as the valueAtSeriesBeginvalue
      // value before the shift is certain to be part of a specific rowing phase (i.e. Drive or Recovery), once the buffer is filled completely
      totalNumberOfImpulses += 1
      _deltaTimeBeforeFlank = _deltaTime.Y.atSeriesBegin()
      totalTimeSpinning += _deltaTimeBeforeFlank
      _angularVelocityBeforeFlank = _angularVelocityAtBeginFlank
      _angularAccelerationBeforeFlank = _angularAccelerationAtBeginFlank
      _torqueBeforeFlank = _torqueAtBeginFlank

      // Feed the drag calculation,  as we didn't reset the Semaphore in the previous cycle based on the current flank
      if (inRecoveryPhase) {
        recoveryDeltaTime.push(totalTimeSpinning, _deltaTimeBeforeFlank)
      }
    } else {
      _deltaTimeBeforeFlank = 0
      _angularVelocityBeforeFlank = 0
      _angularAccelerationBeforeFlank = 0
      _torqueBeforeFlank = 0
    }

    // Let's feed the stroke detection algorithm
    // Please note that deltaTime MUST use dirty data to be ale to use the regression algorithms effictively (Otherwise the Goodness of Fit can't be used as a filter!)
    currentRawTime += currentDt.raw()
    currentAngularDistance += angularDisplacementPerImpulse
    _deltaTime.push(currentRawTime, currentDt.raw())

    // Next are the metrics that are needed for more advanced metrics, like the foce curve
    currentCleanTime += currentDt.clean()
    _angularDistance.push(currentCleanTime, currentAngularDistance)

    // Let's update the matrix and  calculate the angular velocity and acceleration
    if (_angularVelocityMatrix.length >= flankLength) {
      // The angularVelocityMatrix has reached its maximum length
      _angularVelocityMatrix.shift()
      _angularAccelerationMatrix.shift()
    }

    // Let's make room for a new set of values for angular velocity and acceleration
    _angularVelocityMatrix[_angularVelocityMatrix.length] = createWeighedSeries(flankLength, 0)
    _angularAccelerationMatrix[_angularAccelerationMatrix.length] = createWeighedSeries(flankLength, 0)

    let i = 0

    while (i < _angularVelocityMatrix.length) {
      _angularVelocityMatrix[i].push(_angularDistance.firstDerivativeAtPosition(i), _angularDistance.goodnessOfFit())
      _angularAccelerationMatrix[i].push(_angularDistance.secondDerivativeAtPosition(i), _angularDistance.goodnessOfFit())
      i++
    }

    _angularVelocityAtBeginFlank = _angularVelocityMatrix[0].weighedAverage()
    _angularAccelerationAtBeginFlank = _angularAccelerationMatrix[0].weighedAverage()

    // And finally calculate the torque
    _torqueAtBeginFlank = (rowerSettings.flywheelInertia * _angularAccelerationAtBeginFlank + drag.weighedAverage() * Math.pow(_angularVelocityAtBeginFlank, 2))
  }

  function maintainStateOnly () {
    maintainMetrics = false
  }

  function maintainStateAndMetrics () {
    maintainMetrics = true
  }

  function markRecoveryPhaseStart () {
    inRecoveryPhase = true
    recoveryDeltaTime.reset()
  }

  function markRecoveryPhaseCompleted () {
    // Completion of the recovery phase
    inRecoveryPhase = false

    // Calculation of the drag-factor
    if (rowerSettings.autoAdjustDragFactor && recoveryDeltaTime.length() > minimumDragFactorSamples && recoveryDeltaTime.slope() > 0 && (!drag.reliable() || recoveryDeltaTime.goodnessOfFit() >= rowerSettings.minimumDragQuality)) {
      drag.push(slopeToDrag(recoveryDeltaTime.slope()), recoveryDeltaTime.goodnessOfFit())

      log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, no. samples: ${recoveryDeltaTime.length()}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
      if (rowerSettings.autoAdjustRecoverySlope) {
        // We are allowed to autoadjust stroke detection slope as well, so let's do that
        minimumRecoverySlope.push((1 - rowerSettings.autoAdjustRecoverySlopeMargin) * recoveryDeltaTime.slope(), recoveryDeltaTime.goodnessOfFit())
        log.debug(`*** Calculated recovery slope: ${recoveryDeltaTime.slope().toFixed(6)}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
      } else {
        // We aren't allowed to adjust the slope, let's report the slope to help help the user configure it
        log.debug(`*** Calculated recovery slope: ${recoveryDeltaTime.slope().toFixed(6)}, Goodness of Fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}, not used as autoAdjustRecoverySlope isn't set to true`)
      }
    } else {
      if (!rowerSettings.autoAdjustDragFactor) {
        // autoAdjustDampingConstant = false, thus the update is skipped, but let's log the dragfactor anyway
        log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, slope: ${recoveryDeltaTime.slope().toFixed(8)}, not used because autoAdjustDragFactor is not true`)
      } else {
        log.debug(`*** Calculated drag factor: ${(slopeToDrag(recoveryDeltaTime.slope()) * 1000000).toFixed(4)}, not used because reliability was too low. no. samples: ${recoveryDeltaTime.length()}, fit: ${recoveryDeltaTime.goodnessOfFit().toFixed(4)}`)
      }
    }
  }

  function spinningTime () {
    // This function returns the time the flywheel is spinning in seconds BEFORE the beginning of the flank
    return totalTimeSpinning
  }

  function deltaTime () {
    return _deltaTimeBeforeFlank
  }

  function angularPosition () {
    // This function returns the absolute angular position of the flywheel in Radians BEFORE the beginning of the flank
    return totalNumberOfImpulses * angularDisplacementPerImpulse
  }

  function angularVelocity () {
    // This function returns the angular velocity of the flywheel in Radians/sec BEFORE the flank
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return Math.max(0, _angularVelocityBeforeFlank)
    } else {
      return 0
    }
  }

  function angularAcceleration () {
    // This function returns the angular acceleration of the flywheel in Radians/sec^2 BEFORE the flanl
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return _angularAccelerationBeforeFlank
    } else {
      return 0
    }
  }

  function torque () {
    if (maintainMetrics && (_deltaTime.length() >= flankLength)) {
      return _torqueBeforeFlank
    } else {
      return 0
    }
  }

  function dragFactor () {
    // This function returns the current dragfactor of the flywheel
    return drag.weighedAverage()
  }

  function dragFactorIsReliable () {
    // This returns whether the dragfactor is considered reliable, based on measurements instead of a default value
    // We can't use reliable() as a filter on the dragFactor() function as Rower.js always needs some dragfactor for most calculations
    if (rowerSettings.autoAdjustDragFactor) {
      return drag.reliable()
    } else {
      return true
    }
  }

  function isDwelling () {
    // Check if the flywheel is spinning down beyond a recovery phase indicating that the rower has stopped rowing
    // We conclude this based on
    // * The angular velocity at the begin of the flank is above the minimum angular velocity (dependent on maximumTimeBetweenImpulses)
    // * The entire flank has a positive trend, i.e. the flywheel is decelerating consistent with the dragforce being present
    if (_angularVelocityAtBeginFlank < minimumAngularVelocity && deltaTimeSlopeAbove(minimumRecoverySlope.weighedAverage())) {
      return true
    } else {
      return false
    }
  }

  function isAboveMinimumSpeed () {
    // Check if the flywheel has reached its minimum speed, and that it isn't flywheel noise. We conclude this based on the first element in the flank
    // as this angular velocity is created by all curves that are in that flank and having an acceleration in the rest of the flank
    if ((_angularVelocityAtBeginFlank >= minimumAngularVelocity) && (_deltaTime.Y.atSeriesBegin() <= rowerSettings.maximumTimeBetweenImpulses) && (_deltaTime.Y.atSeriesBegin() > rowerSettings.minimumTimeBetweenImpulses)) {
      return true
    } else {
      return false
    }
  }

  function isUnpowered () {
    // We consider the flywheel unpowered when there is an acceleration consistent with the drag being the only forces AND no torque being seen
    // As in the first stroke drag is unreliable for automatic drag updating machines, torque can't be used when drag indicates it is unreliable for these machines
    if (deltaTimeSlopeAbove(minimumRecoverySlope.weighedAverage()) && (torqueAbsent() || (rowerSettings.autoAdjustDragFactor && !drag.reliable()))) {
      return true
    } else {
      return false
    }
  }

  function isPowered () {
    if (deltaTimeSlopeBelow(minimumRecoverySlope.weighedAverage()) && torquePresent()) {
      return true
    } else {
      return false
    }
  }

  function deltaTimeSlopeBelow (threshold) {
    // This is a typical indication that the flywheel is accelerating. We use the slope of successive currentDt's
    // A (more) negative slope indicates a powered flywheel. When set to 0, it determines whether the DeltaT's are decreasing
    // When set to a value below 0, it will become more stringent. In automatic, a percentage of the current slope (i.e. dragfactor) is used
    // Please note, as this acceleration isn't linear, _deltaTime.goodnessOfFit() will not be good by definition, so we need omit it
    if (_deltaTime.slope() < threshold && _deltaTime.length() >= flankLength) {
      return true
    } else {
      return false
    }
  }

  function deltaTimeSlopeAbove (threshold) {
    // This is a typical indication that the flywheel is deccelerating. We use the slope of successive currentDt's
    // A (more) positive slope indicates a unpowered flywheel. When set to 0,  it determines whether the DeltaT's are increasing
    // When set to a value below 0, it will become more stringent as it will detect a power inconsistent with the drag
    // Typically, a percentage of the current slope (i.e. dragfactor) is use
    if (_deltaTime.slope() >= threshold && _deltaTime.goodnessOfFit() >= strokedetectionMinimalGoodnessOfFit && _deltaTime.length() >= flankLength) {
      return true
    } else {
      return false
    }
  }

  function torquePresent () {
    // This is a typical indication that the flywheel is accelerating: the torque is above a certain threshold (so a force is present on the handle)
    if (_torqueAtBeginFlank >= minimumTorqueBeforeStroke) {
      return true
    } else {
      return false
    }
  }

  function torqueAbsent () {
    // This is a typical indication that the flywheel is decelerating: the torque is below a certain threshold (so a force is absent on the handle)
    // We need to consider the situation rowerSettings.autoAdjustDragFactor && !drag.reliable() as a high default dragfactor (as set via config) blocks the
    // detection of the first recovery based on Torque, and thus the calculation of the true dragfactor in that setting.
    // This let the recovery detection fall back onto slope-based stroke detection only for the first stroke (until drag is calculated reliably)
    if (_torqueAtBeginFlank < minimumTorqueBeforeStroke) {
      return true
    } else {
      return false
    }
  }

  function slopeToDrag (slope) {
    return ((slope * rowerSettings.flywheelInertia) / angularDisplacementPerImpulse)
  }

  function reset () {
    maintainMetrics = false
    inRecoveryPhase = false
    drag.reset()
    recoveryDeltaTime.reset()
    _deltaTime.reset()
    _angularDistance.reset()
    totalNumberOfImpulses = 0
    totalTimeSpinning = 0
    currentCleanTime = 0
    currentRawTime = 0
    currentAngularDistance = 0
    _angularVelocityMatrix = null
    _angularVelocityMatrix = []
    _angularAccelerationMatrix = null
    _angularAccelerationMatrix = []
    _deltaTime.push(0, 0)
    _angularDistance.push(0, 0)
    _deltaTimeBeforeFlank = 0
    _angularVelocityBeforeFlank = 0
    _angularAccelerationBeforeFlank = 0
    _torqueAtBeginFlank = 0
    _torqueBeforeFlank = 0
  }

  return {
    pushValue,
    maintainStateOnly,
    maintainStateAndMetrics,
    markRecoveryPhaseStart,
    markRecoveryPhaseCompleted,
    spinningTime,
    deltaTime,
    angularPosition,
    angularVelocity,
    angularAcceleration,
    torque,
    dragFactor,
    dragFactorIsReliable,
    isDwelling,
    isAboveMinimumSpeed,
    isUnpowered,
    isPowered,
    reset
  }
}
