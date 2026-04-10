/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { test, expect, describe } from 'vitest'

import { workoutConfig, buildWorkoutPlan } from './workout-utils'

describe('workoutConfig.distance.format', () => {
  const format = workoutConfig.distance.format

  test('should return raw number for small values', () => {
    expect(format(100)).toBe(100)
  })

  test('should return raw number when under the threshold', () => {
    expect(format(5000)).toBe(5000)
  })

  test('should switch to K when the distance is >= 99999.5', () => {
    expect(format(100000)).toBe('100K')
  })

  test('should include a decimal for non-round kilometre values', () => {
    expect(format(100500)).toBe('100.5K')
  })

  test('should omit the decimal for round kilometre values', () => {
    expect(format(200000)).toBe('200K')
  })
})

describe('workoutConfig.time.format', () => {
  const format = workoutConfig.time.format

  test('should format whole minutes as integer string', () => {
    expect(format(60)).toBe('1')
  })

  test('should include decimals when not a whole minute', () => {
    expect(format(330)).toBe('5.50')
  })

  test('should format large minute values correctly', () => {
    expect(format(1200)).toBe('20')
  })
})

describe('workoutConfig.calories.format', () => {
  const format = workoutConfig.calories.format

  test('should return the raw calorie value', () => {
    expect(format(100)).toBe(100)
  })

  test('should return raw value for large calorie values', () => {
    expect(format(500)).toBe(500)
  })
})

describe('buildWorkoutPlan', () => {
  test('should build a distance-based interval plan', () => {
    expect(buildWorkoutPlan('distance', 2000)).toEqual([
      { type: 'distance', targetDistance: '2000', targetTime: '0' }
    ])
  })

  test('should build a time-based interval plan', () => {
    expect(buildWorkoutPlan('time', 600)).toEqual([
      { type: 'time', targetDistance: '0', targetTime: '600' }
    ])
  })

  test('should build a calorie-based interval plan', () => {
    expect(buildWorkoutPlan('calories', 500)).toEqual([
      { type: 'calories', targetCalories: '500' }
    ])
  })
})
