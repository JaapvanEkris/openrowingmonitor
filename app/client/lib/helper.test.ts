/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { test, expect } from 'vitest'

import { filterObjectByKeys } from './helper'

test('filterd list should only contain the elements specified', () => {
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
