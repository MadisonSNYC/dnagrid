import React from 'react'
import { describe, it, expect } from 'vitest'
import App from '@/App' // same import path main.jsx uses
import { render } from '@testing-library/react'

describe('default effects (stable helix)', () => {
  it('starts Constant Size ON, Outward OFF, no legacy depth', () => {
    const { container } = render(<App />)
    const wrapper = container.querySelector('.visual-effects-wrapper')!
    expect(wrapper.className).toContain('fx-const-size')
    expect(wrapper.className).not.toContain('fx-outward')
    expect(wrapper.className).not.toContain('fx-depth')    // adjust to your token if different
  })
})