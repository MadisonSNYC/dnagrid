import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VisualEffects } from '../VisualEffects'

describe('VisualEffects integrity', () => {
  it('wraps children once and preserves DOM order', () => {
    render(
      <VisualEffects effects={{ ghost: true }}>
        <div data-testid="first">A</div>
        <div data-testid="second">B</div>
      </VisualEffects>
    )
    const first = screen.getByTestId('first')
    const second = screen.getByTestId('second')
    const wrapper = first.parentElement
    expect(wrapper?.className).toContain('visual-effects-wrapper')
    // no double-wrapping
    expect(wrapper?.parentElement?.className ?? '').not.toContain('visual-effects-wrapper')
    // order preserved (accounting for style element that comes first)
    const children = Array.from(wrapper?.children || [])
    const contentChildren = children.filter(child => child.tagName !== 'STYLE')
    expect(contentChildren[0]).toBe(first)
    expect(contentChildren[1]).toBe(second)
  })
})