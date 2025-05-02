'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Contains all mapping functions needed to map the internal ORM state to the externally communicated Concept2 PM5 states
*/
/* eslint-disable no-unreachable -- the breaks after the returns trigger this, but there is a lot to say for being systematic about this */
/* eslint-disable complexity -- There are a lot of decission tables needed to thread this needle */
import { DurationTypes, IntervalTypes, OperationalStates, RowingState, StrokeState, WorkoutState, WorkoutTypes } from './../csafe-service/CsafeCommandsMapping.js'

/**
 * PM5 uses 128bit UUIDs that are always prefixed and suffixed the same way
 * @param {string} uuid
 */
export function toC2128BitUUID (uuid) {
  return `CE06${uuid}-43E5-11E4-916C-0800200C9A66`
}

// Converts the internal workout/interval/split structure to C2's OBJ_WORKOUTTYPE_T
// Is used by characteristics:
// * status-characteristics/GeneralStatusCharacteristic.js (0x0031)
// * session-characteristics/WorkoutSummaryCharacteristic.js (0x0039)
export function toC2WorkoutType (baseMetrics) {
  const splitPresent = (baseMetrics.split.type === 'distance' || baseMetrics.split.type === 'time' || baseMetrics.split.type === 'calories')
  switch (true) {
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'justrow' && baseMetrics.split.type === 'justrow'):
      return WorkoutTypes.WORKOUTTYPE_JUSTROW_NOSPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'justrow' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_JUSTROW_SPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'distance' && baseMetrics.split.type === 'distance' && baseMetrics.interval.distance.target === baseMetrics.split.distance.target):
      // There is just a single split with the same size as the interval
      return WorkoutTypes.WORKOUTTYPE_FIXEDDIST_NOSPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'distance' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDDIST_SPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'time' && baseMetrics.split.type === 'time' && baseMetrics.interval.movingTime.target === baseMetrics.split.movingTime.target):
      // There is just a single split with the same size as the interval
      return WorkoutTypes.WORKOUTTYPE_FIXEDTIME_NOSPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'time' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDTIME_SPLITS
      break
    case (baseMetrics.workout.numberOfIntervals === 1 && baseMetrics.workout.type === 'calories' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDCALORIE_SPLITS
      break
    case (baseMetrics.workout.numberOfIntervals > 1 && baseMetrics.workout.type === 'justrow'):
      return WorkoutTypes.WORKOUTTYPE_VARIABLE_INTERVAL
      break
    case (baseMetrics.workout.numberOfIntervals > 1 && baseMetrics.workout.type === 'distance'):
      return WorkoutTypes.WORKOUTTYPE_FIXEDDIST_INTERVAL
      break
    case (baseMetrics.workout.numberOfIntervals > 1 && baseMetrics.workout.type === 'time'):
      return WorkoutTypes.WORKOUTTYPE_FIXEDTIME_INTERVAL
      break
    default:
      return WorkoutTypes.WORKOUTTYPE_JUSTROW_NOSPLITS
  }
}

// Converts the internal workout/interval/split structure to C2's OBJ_INTERVALTYPE_T
// Is used by characteristics:
// * status-characteristics/GeneralStatusCharacteristic.js (0x0031)
// * session-characteristics/SplitDataCharacteristic.js (0x0037)
// * session-characteristics/AdditionalWorkoutSummaryCharacteristic.js (0x003A)
export function toC2IntervalType (baseMetrics) {
  // ToDo: this is a simplification, as ORM allows to mix different interval types and C2 does not. We might need to adress this based on the overall workout-type (which is a summary of all intervals)
  switch (true) {
    case (baseMetrics.interval.type === 'distance'):
      return IntervalTypes.INTERVALTYPE_DIST
      break
    case (baseMetrics.interval.type === 'time'):
      return IntervalTypes.INTERVALTYPE_TIME
      break
    case (baseMetrics.interval.type === 'calories'):
      return IntervalTypes.INTERVALTYPE_CALORIE
      break
    case (baseMetrics.interval.type === 'rest' && baseMetrics.interval.movingTime.target > 0):
      return IntervalTypes.INTERVALTYPE_REST
      break
    case (baseMetrics.interval.type === 'rest'):
      return IntervalTypes.INTERVALTYPE_RESTUNDEFINED
      break
    default:
      return IntervalTypes.INTERVALTYPE_NONE
  }
}

// Converts the internal workout state to C2's OBJ_WORKOUTSTATE_T
// Is used by characteristics:
// * status-characteristics/GeneralStatusCharacteristic.js (0031)
export function toC2WorkoutState (baseMetrics) {
  // ToDo: this is a simplification, as there are some interval transitions in this state which can be identified based on the state. But we first have to see how intervals behave
  switch (true) {
    case (baseMetrics.sessionState === 'WaitingForStart'):
      return WorkoutState.WORKOUTSTATE_WAITTOBEGIN
      break
    case (baseMetrics.sessionState === 'Rowing' && baseMetrics.metricsContext.isPauseEnd && baseMetrics.split.type === 'distance'):
      return WorkoutState.WORKOUTSTATE_INTERVALRESTENDTOWORKDISTANCE
      break
    case (baseMetrics.sessionState === 'Rowing' && baseMetrics.metricsContext.isPauseEnd && baseMetrics.split.type === 'time'):
      return WorkoutState.WORKOUTSTATE_INTERVALRESTENDTOWORKTIME
      break
    case (baseMetrics.sessionState === 'Rowing'):
      return WorkoutState.WORKOUTSTATE_WORKOUTROW
      break
    case (baseMetrics.sessionState === 'Paused' && baseMetrics.metricsContext.isPauseStart):
      return WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCETOREST
      break
    case (baseMetrics.sessionState === 'Paused'):
      return WorkoutState.WORKOUTSTATE_INTERVALREST
      break
    case (baseMetrics.sessionState === 'Stopped'):
      return WorkoutState.WORKOUTSTATE_WORKOUTEND
      break
    default:
      return WorkoutState.WORKOUTSTATE_WAITTOBEGIN
  }
}

// Converts the internal rowing state to C2's OBJ_ROWINGSTATE_T
// Is used by characteristics:
// * status-characteristics/GeneralStatusCharacteristic.js (0031)
export function toC2RowingState (baseMetrics) {
  switch (true) {
    case (baseMetrics.sessionState === 'WaitingForStart'):
      return RowingState.ROWINGSTATE_INACTIVE
      break
    case (baseMetrics.sessionState === 'Rowing'):
      return RowingState.ROWINGSTATE_ACTIVE
      break
    case (baseMetrics.sessionState === 'Paused'):
      return RowingState.ROWINGSTATE_INACTIVE
      break
    case (baseMetrics.sessionState === 'Stopped'):
      return RowingState.ROWINGSTATE_INACTIVE
      break
    default:
      return RowingState.ROWINGSTATE_INACTIVE
  }
}

// Converts the internal stroke state to C2's OBJ_STROKESTATE_T
// Is used by characteristics:
// * status-characteristics/GeneralStatusCharacteristic.js (0031)
export function toC2StrokeState (baseMetrics) {
  switch (true) {
    case (baseMetrics.strokeState === 'WaitingForDrive'):
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_REACH_MIN_SPEED_STATE
      break
    case (baseMetrics.strokeState === 'Drive' && baseMetrics.metricsContext.isDriveStart):
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_ACCELERATE_STATE
      break
    case (baseMetrics.strokeState === 'Drive'):
      return StrokeState.STROKESTATE_DRIVING_STATE
      break
    case (baseMetrics.strokeState === 'Recovery' && baseMetrics.metricsContext.isRecoveryStart):
      return StrokeState.STROKESTATE_DWELLING_AFTER_DRIVE_STATE
      break
    case (baseMetrics.strokeState === 'Recovery'):
      return StrokeState.STROKESTATE_RECOVERY_STATE
      break
    case (baseMetrics.strokeState === 'Stopped'):
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_REACH_MIN_SPEED_STATE
      break
    default:
      return StrokeState.STROKESTATE_WAITING_FOR_WHEEL_TO_REACH_MIN_SPEED_STATE
  }
}

// Converts the internal rowing state to C2's DurationType
// Is used by characteristics:
// * status-characteristics/GeneralStatusCharacteristic.js (0031)
export function toC2DurationType (baseMetrics) {
  switch (true) {
    case (baseMetrics.workout.type === 'justrow'):
      return DurationTypes.CSAFE_TIME_DURATION
      break
    case (baseMetrics.workout.type === 'time'):
      return DurationTypes.CSAFE_TIME_DURATION
      break
    case (baseMetrics.workout.type === 'distance'):
      return DurationTypes.CSAFE_DISTANCE_DURATION
      break
    case (baseMetrics.workout.type === 'calories'):
      return DurationTypes.CSAFE_CALORIES_DURATION
      break
      break
    default:
      return DurationTypes.CSAFE_TIME_DURATION
  }
}

// Converts the internal rowing state to C2's OBJ_OPERATIONALSTATE_T
// Is used by characteristics:
// * status-characteristics/AdditionalStatus3Characteristic.js (003E)
export function toC2OperationalState (baseMetrics) {
  switch (true) {
    case (baseMetrics.sessionState === 'WaitingForStart'):
      return OperationalStates.OPERATIONALSTATE_READY
      break
    case (baseMetrics.sessionState === 'Rowing'):
      return OperationalStates.OPERATIONALSTATE_WORKOUT
      break
    case (baseMetrics.sessionState === 'Paused'):
      return OperationalStates.OPERATIONALSTATE_PAUSE
      break
    case (baseMetrics.sessionState === 'Stopped'):
      return OperationalStates.OPERATIONALSTATE_IDLE
      break
    default:
      return OperationalStates.OPERATIONALSTATE_READY
  }
}
