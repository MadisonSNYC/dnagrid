import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
// @ts-ignore
import App from '@/App.jsx'

describe('scroll → --t rAF throttling', () => {
  const originalRAF = global.requestAnimationFrame
  const originalScrollTop = Object.getOwnPropertyDescriptor(document, 'scrollingElement')

  beforeEach(() => {
    vi.useFakeTimers()
    // Ensure a stage exists with scrollHeight and offset chain
    document.body.innerHTML = '<div class="helix-stage" style="height:2000px"></div>'
    const stage = document.querySelector('.helix-stage') as any
    Object.defineProperty(stage, 'scrollHeight', { value: 2000, configurable: true })

    // Fake scrollingElement
    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      value: { scrollTop: 0 }
    })

    // Spy on style.setProperty
    const rootStyle = document.documentElement.style as any
    rootStyle.__origSetProp = rootStyle.setProperty
    rootStyle.setProperty = vi.fn(rootStyle.__origSetProp.bind(rootStyle))
  })

  afterEach(() => {
    const rootStyle = document.documentElement.style as any
    if (rootStyle.__origSetProp) rootStyle.setProperty = rootStyle.__origSetProp
    if (originalScrollTop) Object.defineProperty(document, 'scrollingElement', originalScrollTop!)
    vi.useRealTimers()
  })

  it('writes --t at most once per rAF frame despite many scroll events (ignoring init writes)', () => {
    const rootStyle = document.documentElement.style as any
    
    // Re-setup the mock in case it was overwritten
    if (!rootStyle.setProperty.mock) {
      rootStyle.setProperty = vi.fn(rootStyle.__origSetProp.bind(rootStyle))
    }
    
    render(<App />)

    // Snapshot init write count (initial mounts may set variables)
    const initCalls = (rootStyle.setProperty as any).mock.calls.length

    // Flood scroll events
    for (let i = 0; i < 20; i++) {
      ;(document.scrollingElement as any).scrollTop = i * 10
      window.dispatchEvent(new Event('scroll'))
    }

    // No rAF yet -> no writes
    expect((rootStyle.setProperty as any).mock.calls.length).toBe(initCalls)

    // Advance one frame: one write
    vi.advanceTimersByTime(16)
    const after1 = (rootStyle.setProperty as any).mock.calls.length
    expect(after1 - initCalls).toBeGreaterThanOrEqual(1)

    const callsAfter1 = after1

    // Flood again then advance two frames
    for (let i = 0; i < 20; i++) {
      ;(document.scrollingElement as any).scrollTop = 200 + i * 10
      window.dispatchEvent(new Event('scroll'))
    }
    vi.advanceTimersByTime(32) // two frames
    const callsAfter3 = (rootStyle.setProperty as any).mock.calls.length

    // Should be only a small number of writes (≈ frames), not ≈ events
    const deltaWrites = callsAfter3 - callsAfter1
    expect(deltaWrites).toBeLessThanOrEqual(3)
  })
})