/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { test, expect, describe } from 'vitest'

import { filterObjectByKeys, secondsToTimeString, formatDistance, formatNumber } from './helper'

describe('filterObjectByKeys', () => {
  test('should only contain the specified keys', () => {
    const object1 = {
      a: ['a1', 'a2'],
      b: 'b'
    }

    const object2 = {
      a: ['a1', 'a2']
    }

    const filteredObject = filterObjectByKeys(object1, ['a'])
    expect(filterObjectByKeys(filteredObject, ['a'])).toEqual(object2)
  })

  test('should return an empty object when no keys match', () => {
    expect(filterObjectByKeys({ a: 1, b: 2 }, ['c'])).toEqual({})
  })

  test('should return an empty object when the input is empty', () => {
    expect(filterObjectByKeys({}, ['a'])).toEqual({})
  })
})

describe('secondsToTimeString', () => {
  test('should return "--" when the value is undefined', () => {
    expect(secondsToTimeString(undefined)).toBe('--')
  })

  test('should return "--" when the value is null', () => {
    expect(secondsToTimeString(null)).toBe('--')
  })

  test('should return "--" when the value is NaN', () => {
    expect(secondsToTimeString(NaN)).toBe('--')
  })

  test('should return the infinity symbol when the value is Infinity', () => {
    expect(secondsToTimeString(Infinity)).toBe('\u221e')
  })

  test('should format 0 seconds as "0:00"', () => {
    expect(secondsToTimeString(0)).toBe('0:00')
  })

  test('should format seconds under a minute as "0:SS"', () => {
    expect(secondsToTimeString(45)).toBe('0:45')
  })

  test('should format exactly one minute as "1:00"', () => {
    expect(secondsToTimeString(60)).toBe('1:00')
  })

  test('should zero-pad seconds in "M:SS" format', () => {
    expect(secondsToTimeString(125)).toBe('2:05')
  })

  test('should include hours when the value is >= 3600', () => {
    expect(secondsToTimeString(3661)).toBe('1:01:01')
  })

  test('should zero-pad minutes and seconds in "H:MM:SS" format', () => {
    expect(secondsToTimeString(3600)).toBe('1:00:00')
  })

  test('should round fractional seconds to the nearest integer', () => {
    expect(secondsToTimeString(59.7)).toBe('1:00')
  })
})

describe('formatDistance', () => {
  test('should return metres when the distance is under 99999.5', () => {
    const result = formatDistance(5000)
    expect(result.unit).toBe('m')
    expect(result.distance).toBe(5000)
  })

  test('should return kilometres when the distance is >= 99999.5', () => {
    const result = formatDistance(100000)
    expect(result.unit).toBe('km')
    expect(result.distance).toBe(100)
  })

  test('should format kilometres with 2 decimal places', () => {
    const result = formatDistance(123456)
    expect(result.unit).toBe('km')
    expect(result.distance).toBe(123.46)
  })

  test('should return "--" when the distance is zero', () => {
    const result = formatDistance(0)
    expect(result.unit).toBe('m')
    expect(result.distance).toBe('--')
  })
})

describe('formatNumber', () => {
  test('should return "--" when the value is undefined', () => {
    expect(formatNumber(undefined)).toBe('--')
  })

  test('should return "--" when the value is null', () => {
    expect(formatNumber(null)).toBe('--')
  })

  test('should return "--" when the value is Infinity', () => {
    expect(formatNumber(Infinity)).toBe('--')
  })

  test('should return "--" when the value is NaN', () => {
    expect(formatNumber(NaN)).toBe('--')
  })

  test('should return "--" when the value is zero', () => {
    expect(formatNumber(0)).toBe('--')
  })

  test('should format an integer with no decimal places by default', () => {
    expect(formatNumber(42)).toBe(42)
  })

  test('should format a number with the specified number of decimal places', () => {
    expect(formatNumber(3.14159, 2)).toBe(3.14)
  })

  test('should round to the specified number of decimal places', () => {
    expect(formatNumber(3.456, 1)).toBe(3.5)
  })

  test('should handle negative numbers correctly', () => {
    expect(formatNumber(-5)).toBe(-5)
  })
})
