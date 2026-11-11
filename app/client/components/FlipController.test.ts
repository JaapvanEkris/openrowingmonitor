/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
// @vitest-environment happy-dom
import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'

import type { ReactiveControllerHost } from 'lit'
import { FlipController, flipMoves, type FlipRect } from './FlipController'

describe('flipMoves', () => {
  const at = (left: number, top: number): FlipRect => ({ left, top })

  test('should give the offset from the new place back to the old one', () => {
    const moves = flipMoves(new Map([['a', at(0, 0)]]), new Map([['a', at(110, 0)]]))
    expect(moves).toEqual([{ key: 'a', dx: -110, dy: 0, isNew: false }])
  })

  test('should leave out elements that did not move', () => {
    expect(flipMoves(new Map([['a', at(10, 10)]]), new Map([['a', at(10.4, 10)]]))).toEqual([])
  })

  test('should mark elements that were not there before as new', () => {
    expect(flipMoves(new Map(), new Map([['b', at(0, 0)]]))).toEqual([{ key: 'b', dx: 0, dy: 0, isNew: true }])
  })

  test('should ignore elements that are gone', () => {
    expect(flipMoves(new Map([['gone', at(0, 0)]]), new Map())).toEqual([])
  })
})

describe('FlipController', () => {
  let elements: Map<string, HTMLElement>
  let positions: Record<string, FlipRect>
  let controller: FlipController
  const host = { addController: vi.fn(), removeController: vi.fn(), requestUpdate: vi.fn(), updateComplete: Promise.resolve(true) }

  function element (key: string) {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ ...positions[key], right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) })
    el.animate = vi.fn() as unknown as typeof el.animate
    el.getAnimations = vi.fn(() => []) as unknown as typeof el.getAnimations
    return el
  }

  function mockReducedMotion (reduce: boolean) {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList)
  }

  beforeEach(() => {
    positions = { a: { left: 0, top: 0 }, b: { left: 110, top: 0 } }
    elements = new Map([['a', element('a')], ['b', element('b')]])
    controller = new FlipController(host as unknown as ReactiveControllerHost, () => elements)
    mockReducedMotion(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should slide a moved element from its old place to its new one', () => {
    controller.prepare()
    positions = { a: { left: 110, top: 0 }, b: { left: 0, top: 0 } }
    controller.hostUpdated()
    expect(elements.get('a')!.animate).toHaveBeenCalledWith(
      [{ transform: 'translate(-110px, 0px)' }, { transform: 'none' }],
      expect.objectContaining({ duration: 200 })
    )
    expect(elements.get('b')!.animate).toHaveBeenCalledWith(
      [{ transform: 'translate(110px, 0px)' }, { transform: 'none' }],
      expect.anything()
    )
  })

  test('should fade in an element that is new', () => {
    controller.prepare()
    positions.c = { left: 220, top: 0 }
    elements.set('c', element('c'))
    controller.hostUpdated()
    expect(elements.get('c')!.animate).toHaveBeenCalledWith([{ opacity: 0 }, { opacity: 1 }], expect.anything())
  })

  test('should not animate a render that was not prepared', () => {
    positions = { a: { left: 110, top: 0 }, b: { left: 0, top: 0 } }
    controller.hostUpdated()
    expect(elements.get('a')!.animate).not.toHaveBeenCalled()
  })

  test('should only animate the render right after prepare', () => {
    controller.prepare()
    controller.hostUpdated()
    positions = { a: { left: 110, top: 0 }, b: { left: 0, top: 0 } }
    controller.hostUpdated()
    expect(elements.get('a')!.animate).not.toHaveBeenCalled()
  })

  test('should not animate when the user asks for reduced motion', () => {
    mockReducedMotion(true)
    controller.prepare()
    positions = { a: { left: 110, top: 0 }, b: { left: 0, top: 0 } }
    controller.hostUpdated()
    expect(elements.get('a')!.animate).not.toHaveBeenCalled()
  })
})
