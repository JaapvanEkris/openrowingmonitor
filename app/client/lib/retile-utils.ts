/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Pure logic for reordering dashboard tiles in retile mode, extracted for testability
*/

export interface TileRect {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * Moves the metric at index 'from' to the gap before 'insertBefore'
 * @param metrics The metrics in screen order
 * @param from The index of the metric to move
 * @param insertBefore The gap to move it to, counted in the original list (0 is before the first tile, metrics.length after the last)
 * @returns A new list, or the same list when the move changes nothing
 */
export function moveMetric (metrics: string[], from: number, insertBefore: number): string[] {
  if (from < 0 || from >= metrics.length || insertBefore < 0 || insertBefore > metrics.length) { return metrics }
  // The gaps directly before and after a tile both leave it where it is
  if (insertBefore === from || insertBefore === from + 1) { return metrics }

  const result = [...metrics]
  const [moved] = result.splice(from, 1)
  result.splice(insertBefore > from ? insertBefore - 1 : insertBefore, 0, moved)
  return result
}

function distanceToRect (rect: TileRect, x: number, y: number) {
  const dx = Math.max(rect.left - x, 0, x - rect.right)
  const dy = Math.max(rect.top - y, 0, y - rect.bottom)
  return Math.hypot(dx, dy)
}

/**
 * Finds the gap a dragged tile would be inserted into when released at (x, y)
 * The left half of a tile means the gap before it, the right half the gap after it. A point between tiles counts for the nearest tile.
 * @param tileRects The rectangles of the tiles, in screen order
 * @param addTileRect The rectangle of the add tile (dropping there means: move to the end), if shown
 * @param x The horizontal position of the pointer
 * @param y The vertical position of the pointer
 * @returns The gap index (0 to tileRects.length), or null when the point is outside the grid
 */
export function insertionIndexAt (tileRects: TileRect[], addTileRect: TileRect | null, x: number, y: number): number | null {
  const allRects = addTileRect ? [...tileRects, addTileRect] : tileRects
  if (allRects.length === 0) { return null }

  const outsideGrid = x < Math.min(...allRects.map((rect) => rect.left)) ||
    x > Math.max(...allRects.map((rect) => rect.right)) ||
    y < Math.min(...allRects.map((rect) => rect.top)) ||
    y > Math.max(...allRects.map((rect) => rect.bottom))
  if (outsideGrid) { return null }

  let nearest = 0
  allRects.forEach((rect, index) => {
    if (distanceToRect(rect, x, y) < distanceToRect(allRects[nearest], x, y)) { nearest = index }
  })

  if (nearest === tileRects.length) { return tileRects.length }
  const rect = tileRects[nearest]
  return x < (rect.left + rect.right) / 2 ? nearest : nearest + 1
}

/**
 * Works out where to draw the marker for a gap: on the right edge of the tile before it, or the left edge of the tile
 * (or add tile) after it, preferring the one on the row the pointer is on, so the marker stays next to the pointer
 * @param tileRects The rectangles of the tiles, in screen order
 * @param addTileRect The rectangle of the add tile, if shown
 * @param gap The gap index (0 to tileRects.length)
 * @param y The vertical position of the pointer
 * @param halfGapWidth Half the space between two tiles, to centre the marker in it
 * @returns The horizontal position and vertical extent of the marker, or null when there is no tile next to the gap
 */
export function gapMarkerPosition (tileRects: TileRect[], addTileRect: TileRect | null, gap: number, y: number, halfGapWidth: number): { x: number, top: number, bottom: number } | null {
  const before = gap > 0 ? tileRects[gap - 1] : undefined
  const after = gap < tileRects.length ? tileRects[gap] : (addTileRect ?? undefined)
  const candidates = [
    ...(before ? [{ x: before.right + halfGapWidth, top: before.top, bottom: before.bottom }] : []),
    ...(after ? [{ x: after.left - halfGapWidth, top: after.top, bottom: after.bottom }] : [])
  ]
  return candidates.find((candidate) => y >= candidate.top && y <= candidate.bottom) ?? candidates[0] ?? null
}
