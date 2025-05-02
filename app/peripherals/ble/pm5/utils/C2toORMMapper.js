'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Contains all mapping functions needed to map the internal ORM state to the externally communicated Concept2 PM5 states
*/
/* eslint-disable no-unreachable -- the breaks after the returns trigger this, but there is a lot to say for being systematic about this */
import { DurationTypes, IntervalTypes, WorkoutTypes } from './../csafe-service/CsafeCommandsMapping.js'

export function readUInt16 (msb, lsb) {
  return (msb * 256) + lsb
}

export function readUInt32 (msb, byte2, byte3, lsb) {
  return (msb * 16777216) + (byte2 * 65536) + (byte3 * 256) + lsb
}

export function createWorkoutPlan () {
  let workoutplan = []

  function reset () {
    workoutplan = null
    workoutplan = []
  }

  function addInterval (type, data) {
    let workoutstep
    let targetTime
    switch (true) {
      case (type === 'rest'):
        if (data.length > 1) {
          targetTime = readUInt16(data[0], data[1])
          if (targetTime > 0) {
            workoutplan.push({})
            workoutstep = workoutplan.length - 1
            workoutplan[workoutstep].type = 'rest'
            workoutplan[workoutstep].targetTime = targetTime
          }
        }
        // As ErgData and ErgZone will always send a rest interval (with 0 length), we must ignore that
        break
      case (type === 'justrow'):
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        workoutplan[workoutstep].type = 'justrow'
        break
      case (type === 'distance' && data.length > 4):
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        /* eslint-disable-next-line no-case-declarations -- readable code outweighs rules */
        const targetDistance = readUInt32(data[1], data[2], data[3], data[4])
        if (targetDistance > 0) {
          workoutplan[workoutstep].type = 'distance'
          workoutplan[workoutstep].targetDistance = targetDistance
        } else {
          workoutplan[workoutstep].type = 'justrow'
        }
        break
      case (type === 'time' && data.length > 4):
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        targetTime = readUInt32(data[1], data[2], data[3], data[4]) / 100
        if (targetTime > 0) {
          workoutplan[workoutstep].type = 'time'
          workoutplan[workoutstep].targetTime = targetTime
        } else {
          workoutplan[workoutstep].type = 'justrow'
        }
        break
      default:
        workoutplan.push({})
        workoutstep = workoutplan.length - 1
        workoutplan[workoutstep].type = 'justrow'
    }
  }

  function addPaceTarget (data) {
    if (workoutplan.length < 1) { return }
    const workoutstep = workoutplan.length - 1
    if (data.length > 3) {
      const targetLinearVelocity = 50000 / readUInt32(data[0], data[1], data[2], data[3])
      if (targetLinearVelocity > 0) { workoutplan[workoutstep].targetLinearVelocity = targetLinearVelocity }
    }
  }

  function addSplit (type, data) {
    if (workoutplan.length < 1) { return }
    const workoutstep = workoutplan.length - 1

    workoutplan[workoutstep].split = {}
    switch (true) {
      case (type === 'justrow'):
        workoutplan[workoutstep].split.type = 'justrow'
        break
      case (type === 'distance' && data.length > 4):
        /* eslint-disable-next-line no-case-declarations -- readable code outweighs rules */
        const targetDistance = readUInt32(data[1], data[2], data[3], data[4])
        if (targetDistance > 0) {
          workoutplan[workoutstep].split.type = 'distance'
          workoutplan[workoutstep].split.targetDistance = targetDistance
        } else {
          workoutplan[workoutstep].split.type = workoutplan[workoutstep].type
          workoutplan[workoutstep].split.targetDistance = workoutplan[workoutstep].targetDistance
        }
        break
      case (type === 'time' && data.length > 4):
        /* eslint-disable-next-line no-case-declarations -- readable code outweighs rules */
        const targetTime = readUInt32(data[1], data[2], data[3], data[4]) / 100
        if (targetTime > 0) {
          workoutplan[workoutstep].split.type = 'time'
          workoutplan[workoutstep].split.targetTime = readUInt32(data[1], data[2], data[3], data[4]) / 100
        } else {
          workoutplan[workoutstep].split.type = workoutplan[workoutstep].type
          workoutplan[workoutstep].split.targetTime = workoutplan[workoutstep].targetTime
        }
        break
      default:
        workoutplan[workoutstep].split.type = workoutplan[workoutstep].type
        if (workoutplan[workoutstep].type === 'distance') { workoutplan[workoutstep].split.targetDistance = workoutplan[workoutstep].targetDistance }
        if (workoutplan[workoutstep].type === 'time' || workoutplan[workoutstep].type === 'rest') { workoutplan[workoutstep].split.targetTime = workoutplan[workoutstep].targetTime }
    }
  }

  function length () {
    return workoutplan.length
  }

  function lastInterval () {
    return workoutplan[workoutplan.length - 1]
  }

  function result () {
    if (workoutplan.length > 0) {
      // Make sure we don't end with a rest interval
      if (workoutplan[workoutplan.length - 1].type === 'rest') { workoutplan.pop() }
      return workoutplan
    } else {
      return []
    }
  }

  return {
    reset,
    addInterval,
    addSplit,
    addPaceTarget,
    length,
    lastInterval,
    result
  }
}

/*******************************************************************************************************************************************/
// Converts the internal workout/interval/split structure to C2's OBJ_WORKOUTTYPE_T
// Is used by characteristics:
// * status-characteristics/GeneralStatusCharacteristic.js (0x0031)
// * session-characteristics/WorkoutSummaryCharacteristic.js (0x0039)
export function toC2WorkoutType (baseMetrics) {
  const splitPresent = (baseMetrics.split.type === 'distance' || baseMetrics.split.type === 'time' || baseMetrics.split.type === 'calories')
  switch (true) {
    case (baseMetrics.workout.type === 'justrow' && baseMetrics.split.type === 'justrow'):
      return WorkoutTypes.WORKOUTTYPE_JUSTROW_NOSPLITS
      break
    case (baseMetrics.workout.type === 'justrow' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_JUSTROW_SPLITS
      break
    case (baseMetrics.workout.type === 'distance' && baseMetrics.split.type === 'justrow'):
      return WorkoutTypes.WORKOUTTYPE_FIXEDDIST_NOSPLITS
      break
    case (baseMetrics.workout.type === 'distance' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDDIST_SPLITS
      break
    case (baseMetrics.workout.type === 'time' && baseMetrics.split.type === 'justrow'):
      return WorkoutTypes.WORKOUTTYPE_FIXEDTIME_NOSPLITS
      break
    case (baseMetrics.workout.type === 'time' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDTIME_SPLITS
      break
    case (baseMetrics.workout.type === 'calories' && splitPresent):
      return WorkoutTypes.WORKOUTTYPE_FIXEDCALORIE_SPLITS
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

export class Concept2Date extends Date {
  /**
   * Converts a Date object to a Concept2 date binary format
   * @returns {number} The UTC date as a uint16 parsed as per the Concept2 specs
   */
  toC2DateInt () {
    const yearEpoch = 2000

    return (this.getMonth() + 1) | (this.getDate()) << 4 | (this.getFullYear() - yearEpoch) << 9
  }

  /**
   * Converts a Date object to a Concept2 date byte array format
   * @returns {number[]} The UTC date as a byte array parsed as per the Concept2 specs
   */
  toC2DateByteArray () {
    return [
      this.getHours() % 12 || 12,
      this.getMinutes(),
      this.getHours() > 12 ? 1 : 0,
      this.getMonth() + 1,
      this.getDate(),
      (this.getFullYear() >> 8) & 0xFF,
      this.getFullYear() & 0xFF
    ]
  }

  /**
   * Converts a Date object to a Concept2 time binary format
   * @returns {number} The UTC time as a uint16 parsed as per the Concept2 specs
   */
  toC2TimeInt () {
    return this.getMinutes() | this.getHours() << 8
  }
}
