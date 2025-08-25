import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VisualEffects } from '@/components/effects/VisualEffects'

describe('constant-size effect gates', () => {
  it('enables fx-constant-size on wrapper when requested', () => {
    const { container } = render(
      <VisualEffects effects={{ constantTileSize: true }}>
        <div data-testid="x">x</div>
      </VisualEffects>
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper?.className).toContain('visual-effects-wrapper')
    // Failing until code wires this class:
    expect(wrapper?.className).toContain('fx-const-size')
  })
})