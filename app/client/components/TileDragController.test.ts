/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe, vi, beforeEach } from 'vitest'

import type { ReactiveControllerHost } from 'lit'
import { TileDragController } from './TileDragController'

// A 3 column grid of 100x100 tiles with 10px gaps: 3 tiles on row 1, 1 tile and the add tile on row 2
function createGrid () {
  const grid = document.createElement('section')
  const place = (element: HTMLElement, column: number, row: number) => {
    element.getBoundingClientRect = () => ({ left: column * 110, top: row * 110, right: column * 110 + 100, bottom: row * 110 + 100, width: 100, height: 100, x: column * 110, y: row * 110, toJSON: () => ({}) })
    grid.appendChild(element)
  }
  ;[[0, 0], [1, 0], [2, 0], [0, 1]].forEach(([column, row]) => place(document.createElement('div'), column, row))
  const addTile = document.createElement('div')
  addTile.className = 'add-tile'
  place(addTile, 1, 1)
  grid.getBoundingClientRect = () => ({ left: 0, top: 0, right: 320, bottom: 210, width: 320, height: 210, x: 0, y: 0, toJSON: () => ({}) })
  document.body.appendChild(grid)
  return grid
}

function pointer (type: string, clientX: number, clientY: number) {
  return new PointerEvent(type, { clientX, clientY, pointerId: 1, isPrimary: true, button: 0, cancelable: true })
}

describe('TileDragController', () => {
  let grid: HTMLElement
  let host: { addController: ReturnType<typeof vi.fn>, requestUpdate: ReturnType<typeof vi.fn>, removeController: ReturnType<typeof vi.fn>, updateComplete: Promise<boolean> }
  let onDrop: ReturnType<typeof vi.fn<(from: number, insertBefore: number) => void>>
  let controller: TileDragController

  beforeEach(() => {
    document.body.innerHTML = ''
    grid = createGrid()
    host = { addController: vi.fn(), requestUpdate: vi.fn(), removeController: vi.fn(), updateComplete: Promise.resolve(true) }
    onDrop = vi.fn<(from: number, insertBefore: number) => void>()
    controller = new TileDragController(host as unknown as ReactiveControllerHost, () => grid, onDrop)
  })

  test('should register itself with the host', () => {
    expect(host.addController).toHaveBeenCalledWith(controller)
  })

  test('should lift the tile and let it follow the pointer', () => {
    controller.start(pointer('pointerdown', 50, 50), 0, 4)
    const tile = grid.children[0] as HTMLElement
    expect(tile.classList.contains('dragging')).toBe(true)

    controller.move(pointer('pointermove', 80, 70))
    expect(tile.style.transform).toBe('translate(30px, 20px)')
  })

  test('should track the gap under the pointer and render the marker there', () => {
    controller.start(pointer('pointerdown', 50, 50), 0, 4)
    controller.move(pointer('pointermove', 290, 50))
    expect(controller.dropIndex).toBe(3)
    expect(controller.renderDropIndicator()).not.toBe('')
  })

  test('should only ask the host to re-render when the gap changes', () => {
    controller.start(pointer('pointerdown', 50, 50), 0, 4)
    controller.move(pointer('pointermove', 130, 50))
    controller.move(pointer('pointermove', 135, 55))
    expect(host.requestUpdate).toHaveBeenCalledTimes(1)
  })

  test('should report the drop on release and put the tile back', () => {
    controller.start(pointer('pointerdown', 50, 50), 0, 4)
    controller.move(pointer('pointermove', 290, 50))
    controller.finish(pointer('pointerup', 290, 50))
    expect(onDrop).toHaveBeenCalledWith(0, 3)
    const tile = grid.children[0] as HTMLElement
    expect(tile.style.transform).toBe('')
    expect(tile.classList.contains('dragging')).toBe(false)
    expect(controller.drag).toBeNull()
  })

  test('should move to the end when released on the add tile', () => {
    controller.start(pointer('pointerdown', 50, 50), 1, 4)
    controller.finish(pointer('pointerup', 160, 160))
    expect(onDrop).toHaveBeenCalledWith(1, 4)
  })

  test('should not report a drop when released outside the grid', () => {
    controller.start(pointer('pointerdown', 50, 50), 0, 4)
    controller.finish(pointer('pointerup', 500, 500))
    expect(onDrop).not.toHaveBeenCalled()
    expect(controller.drag).toBeNull()
  })

  test('should cancel on Escape without reporting a drop', () => {
    controller.start(pointer('pointerdown', 50, 50), 0, 4)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(controller.drag).toBeNull()
    controller.finish(pointer('pointerup', 290, 50))
    expect(onDrop).not.toHaveBeenCalled()
  })

  test('should ignore secondary pointers and buttons', () => {
    controller.start(new PointerEvent('pointerdown', { clientX: 50, clientY: 50, pointerId: 2, isPrimary: false, button: 0 }), 0, 4)
    controller.start(new PointerEvent('pointerdown', { clientX: 50, clientY: 50, pointerId: 1, isPrimary: true, button: 2 }), 0, 4)
    expect(controller.drag).toBeNull()
  })

  test('should cancel when the host is disconnected', () => {
    controller.start(pointer('pointerdown', 50, 50), 0, 4)
    controller.hostDisconnected()
    expect(controller.drag).toBeNull()
  })
})
