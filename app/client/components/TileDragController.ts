/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Lit controller for dragging a dashboard tile to another place in retile mode, with Pointer Events (mouse, touch and pen).
  While dragging, the tile follows the pointer through a CSS transform and a marker shows the gap it will be dropped into;
  the other tiles stay where they are. Only releasing the tile changes the order, through the onDrop callback.
*/

import { html, type ReactiveController, type ReactiveControllerHost, type TemplateResult } from 'lit'
import { insertionIndexAt, gapMarkerPosition, type TileRect } from '../lib/retile-utils'

interface TileDrag {
  index: number
  pointerId: number
  startX: number
  startY: number
  lastY: number
  tile: HTMLElement
  gridRect: DOMRect
  tileRects: TileRect[]
  addTileRect: TileRect | null
  halfGapWidth: number
}

function toTileRect (element: Element): TileRect {
  const { left, top, right, bottom } = element.getBoundingClientRect()
  return { left, top, right, bottom }
}

export class TileDragController implements ReactiveController {
  // Not reactive: moving the pointer only updates the transform, the host re-renders only when the target gap changes
  drag: TileDrag | null = null
  dropIndex: number | null = null

  /**
   * @param host The element showing the tiles
   * @param getGrid Returns the grid element, whose first tileCount children are the tiles, optionally followed by an '.add-tile'
   * @param onDrop Called on release with the index of the dragged tile and the gap (0 to tileCount) it was dropped into
   */
  constructor (
    private readonly host: ReactiveControllerHost,
    private readonly getGrid: () => HTMLElement | null,
    private readonly onDrop: (from: number, insertBefore: number) => void
  ) {
    host.addController(this)
  }

  hostDisconnected () {
    this.cancel()
  }

  start (event: PointerEvent, index: number, tileCount: number) {
    if (!event.isPrimary || event.button !== 0 || this.drag) { return }
    const grid = this.getGrid()
    const tile = grid?.children[index] as HTMLElement | undefined
    if (!grid || !tile) { return }
    event.preventDefault()
    ;(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId)

    const addTile = grid.querySelector('.add-tile')
    this.drag = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastY: event.clientY,
      tile,
      gridRect: grid.getBoundingClientRect(),
      // A snapshot: nothing reflows while dragging, so these stay valid until the drop
      tileRects: [...grid.children].slice(0, tileCount).map(toTileRect),
      addTileRect: addTile ? toTileRect(addTile) : null,
      halfGapWidth: (parseFloat(getComputedStyle(grid).columnGap) || 0) / 2
    }
    tile.classList.add('dragging')
    window.addEventListener('keydown', this.handleKeydown)
  }

  move (event: PointerEvent) {
    const drag = this.drag
    if (!drag || event.pointerId !== drag.pointerId) { return }
    drag.tile.style.transform = `translate(${event.clientX - drag.startX}px, ${event.clientY - drag.startY}px)`
    drag.lastY = event.clientY
    const dropIndex = insertionIndexAt(drag.tileRects, drag.addTileRect, event.clientX, event.clientY)
    if (dropIndex !== this.dropIndex) {
      this.dropIndex = dropIndex
      this.host.requestUpdate()
    }
  }

  finish (event: PointerEvent) {
    const drag = this.drag
    if (!drag || event.pointerId !== drag.pointerId) { return }
    const dropIndex = insertionIndexAt(drag.tileRects, drag.addTileRect, event.clientX, event.clientY)
    // Report the drop while the tile is still at the pointer, so an animation can start from where it was released
    if (dropIndex !== null) {
      this.onDrop(drag.index, dropIndex)
    }
    this.cancel()
  }

  // Ends a drag without changing the order (also used after a release, once the drop is known)
  cancel = () => {
    if (!this.drag) { return }
    this.drag.tile.style.transform = ''
    this.drag.tile.classList.remove('dragging')
    this.drag = null
    this.dropIndex = null
    window.removeEventListener('keydown', this.handleKeydown)
    this.host.requestUpdate()
  }

  private readonly handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { this.cancel() }
  }

  renderDropIndicator (): TemplateResult | string {
    const drag = this.drag
    if (!drag || this.dropIndex === null) { return '' }
    const marker = gapMarkerPosition(drag.tileRects, drag.addTileRect, this.dropIndex, drag.lastY, drag.halfGapWidth)
    if (!marker) { return '' }
    return html`<div
      class="drop-indicator"
      style="left: ${marker.x - drag.gridRect.left}px; top: ${marker.top - drag.gridRect.top}px; height: ${marker.bottom - marker.top}px;"
    ></div>`
  }
}
