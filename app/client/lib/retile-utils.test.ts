/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { test, expect, describe } from 'vitest'

import { moveMetric, insertionIndexAt, gapMarkerPosition, type TileRect } from './retile-utils'

describe('moveMetric', () => {
  const metrics = ['a', 'b', 'c', 'd']

  test('should move a metric forwards', () => {
    expect(moveMetric(metrics, 0, 3)).toEqual(['b', 'c', 'a', 'd'])
  })

  test('should move a metric backwards', () => {
    expect(moveMetric(metrics, 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  test('should move a metric to the end', () => {
    expect(moveMetric(metrics, 1, 4)).toEqual(['a', 'c', 'd', 'b'])
  })

  test('should move a metric to the start', () => {
    expect(moveMetric(metrics, 2, 0)).toEqual(['c', 'a', 'b', 'd'])
  })

  test('should return the same list when dropped in the gap before or after itself', () => {
    expect(moveMetric(metrics, 1, 1)).toBe(metrics)
    expect(moveMetric(metrics, 1, 2)).toBe(metrics)
  })

  test('should return the same list for out of range indexes', () => {
    expect(moveMetric(metrics, -1, 2)).toBe(metrics)
    expect(moveMetric(metrics, 4, 0)).toBe(metrics)
    expect(moveMetric(metrics, 0, 5)).toBe(metrics)
  })

  test('should not modify the original list', () => {
    const original = [...metrics]
    moveMetric(metrics, 0, 3)
    expect(metrics).toEqual(original)
  })
})

describe('insertionIndexAt', () => {
  // A 3 column grid of 100x100 tiles with 10px gaps: tiles 0-2 on row 1, tile 3 and the add tile on row 2
  const rect = (column: number, row: number): TileRect => ({ left: column * 110, top: row * 110, right: column * 110 + 100, bottom: row * 110 + 100 })
  const tiles = [rect(0, 0), rect(1, 0), rect(2, 0), rect(0, 1)]
  const addTile = rect(1, 1)

  test('should return the gap before a tile for its left half', () => {
    expect(insertionIndexAt(tiles, addTile, 120, 50)).toBe(1)
  })

  test('should return the gap after a tile for its right half', () => {
    expect(insertionIndexAt(tiles, addTile, 190, 50)).toBe(2)
  })

  test('should handle the second row', () => {
    expect(insertionIndexAt(tiles, addTile, 20, 160)).toBe(3)
    expect(insertionIndexAt(tiles, addTile, 80, 160)).toBe(4)
  })

  test('should return the end of the list over the add tile', () => {
    expect(insertionIndexAt(tiles, addTile, 130, 160)).toBe(4)
  })

  test('should use the nearest tile for a point in a gap between tiles', () => {
    // 2px right of tile 0, in the gap before tile 1: nearest is tile 0's right half
    expect(insertionIndexAt(tiles, addTile, 102, 50)).toBe(1)
    // 2px left of tile 2, in the gap after tile 1: nearest is tile 2's left half
    expect(insertionIndexAt(tiles, addTile, 218, 50)).toBe(2)
  })

  test('should return null outside the grid', () => {
    expect(insertionIndexAt(tiles, addTile, 400, 50)).toBeNull()
    expect(insertionIndexAt(tiles, addTile, 50, -5)).toBeNull()
  })

  test('should work without an add tile', () => {
    expect(insertionIndexAt(tiles, null, 80, 160)).toBe(4)
  })

  test('should return null without any tiles', () => {
    expect(insertionIndexAt([], null, 10, 10)).toBeNull()
  })
})

describe('gapMarkerPosition', () => {
  const rect = (column: number, row: number): TileRect => ({ left: column * 110, top: row * 110, right: column * 110 + 100, bottom: row * 110 + 100 })
  const tiles = [rect(0, 0), rect(1, 0), rect(2, 0), rect(0, 1)]
  const addTile = rect(1, 1)

  test('should centre the marker in the gap between two tiles on a row', () => {
    expect(gapMarkerPosition(tiles, addTile, 1, 50, 5)).toEqual({ x: 105, top: 0, bottom: 100 })
  })

  test('should put the marker after the last tile of a row when the pointer is on that row', () => {
    expect(gapMarkerPosition(tiles, addTile, 3, 50, 5)).toEqual({ x: 325, top: 0, bottom: 100 })
  })

  test('should put the marker before the first tile of the next row when the pointer is on that row', () => {
    expect(gapMarkerPosition(tiles, addTile, 3, 160, 5)).toEqual({ x: -5, top: 110, bottom: 210 })
  })

  test('should put the marker before the add tile for the end of the list', () => {
    expect(gapMarkerPosition(tiles, addTile, 4, 160, 5)).toEqual({ x: 105, top: 110, bottom: 210 })
  })

  test('should put the marker before the first tile for the start of the list', () => {
    expect(gapMarkerPosition(tiles, addTile, 0, 50, 5)).toEqual({ x: -5, top: 0, bottom: 100 })
  })

  test('should return null when there are no tiles', () => {
    expect(gapMarkerPosition([], null, 0, 50, 5)).toBeNull()
  })
})
