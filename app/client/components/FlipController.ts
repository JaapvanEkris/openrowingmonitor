/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Lit controller that animates elements to their new place after a re-render (the FLIP technique: First, Last, Invert,
  Play). Call prepare() right before a state change that moves the elements: it records where each one is (First).
  After the host has rendered, every element that moved starts at its old place and slides to its new one; new elements
  fade in. Only transform and opacity are animated, which the browser can do without layout work.
  Users who ask for reduced motion (prefers-reduced-motion) see the elements jump to their new places.
*/

import type { ReactiveController, ReactiveControllerHost } from 'lit'

export interface FlipRect {
  left: number
  top: number
}

export interface FlipMove {
  key: string
  dx: number
  dy: number
  isNew: boolean
}

/**
 * Works out how far each element moved between two measurements
 * @param first The positions before the change, by key
 * @param last The positions after the change, by key
 * @returns For every element that is still there: how far it moved, or that it is new. Elements that did not move are left out.
 */
export function flipMoves (first: Map<string, FlipRect>, last: Map<string, FlipRect>): FlipMove[] {
  const moves: FlipMove[] = []
  last.forEach((lastRect, key) => {
    const firstRect = first.get(key)
    if (!firstRect) {
      moves.push({ key, dx: 0, dy: 0, isNew: true })
      return
    }
    const dx = firstRect.left - lastRect.left
    const dy = firstRect.top - lastRect.top
    if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) { moves.push({ key, dx, dy, isNew: false }) }
  })
  return moves
}

export class FlipController implements ReactiveController {
  private first: Map<string, FlipRect> | null = null

  /**
   * @param host The element that renders the elements
   * @param getElements Returns the elements as they are rendered at that moment, by a key that follows an element to its new place
   * @param options duration (ms) of the slide
   */
  constructor (
    host: ReactiveControllerHost,
    private readonly getElements: () => Map<string, HTMLElement>,
    private readonly options: { duration: number } = { duration: 200 }
  ) {
    host.addController(this)
  }

  // Records where every element is now; the next render animates the ones that moved
  prepare () {
    this.first = this.measure(true)
  }

  hostUpdated () {
    const first = this.first
    this.first = null
    if (!first || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { return }

    const elements = this.getElements()
    flipMoves(first, this.measure(false)).forEach(({ key, dx, dy, isNew }) => {
      const element = elements.get(key)
      if (isNew) {
        element?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: this.options.duration, easing: 'ease-out' })
      } else {
        element?.animate?.([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: this.options.duration, easing: 'ease-out' })
      }
    })
  }

  private measure (stopRunning: boolean): Map<string, FlipRect> {
    const rects = new Map<string, FlipRect>()
    this.getElements().forEach((element, key) => {
      // Measured including a running slide, so a new one starts where the element is seen now
      const { left, top } = element.getBoundingClientRect()
      rects.set(key, { left, top })
      if (stopRunning) { element.getAnimations?.().forEach((animation) => animation.cancel()) }
    })
    return rects
  }
}
