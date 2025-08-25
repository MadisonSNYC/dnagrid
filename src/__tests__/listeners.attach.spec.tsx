import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
// @ts-ignore
import App from '@/App.jsx'

describe('listener hygiene: scroll rAF + no wheel capture by default', () => {
  const addSpy = vi.fn()
  const rmSpy = vi.fn()
  let origAdd: any, origRm: any

  beforeEach(() => {
    origAdd = window.addEventListener
    origRm = window.removeEventListener
    ;(window as any).addEventListener = (type: any, cb: any, opts: any) => { addSpy(type, opts); origAdd.call(window, type, cb, opts) }
    ;(window as any).removeEventListener = (type: any, cb: any, opts: any) => { rmSpy(type); origRm.call(window, type, cb, opts) }
  })

  afterEach(() => {
    ;(window as any).addEventListener = origAdd
    ;(window as any).removeEventListener = origRm
    addSpy.mockReset()
    rmSpy.mockReset()
  })

  it('attaches a passive scroll listener and watchdog wheel listener', () => {
    render(<App />)

    const types = addSpy.mock.calls.map(c => c[0])
    const opts  = addSpy.mock.calls.reduce((acc:any, c:any) => { acc[c[0]] = c[1]; return acc }, {})

    // Expect at least one scroll listener
    expect(types).toContain('scroll')
    // Passive should be true for scroll
    expect(opts['scroll']?.passive).toBe(true)

    // Wheel listener is attached by watchdog for monitoring (passive)
    expect(types).toContain('wheel')
    expect(opts['wheel']?.passive).toBe(true)
  })
})