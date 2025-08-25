import { render, screen } from '@testing-library/react'
import React from 'react'
import { VisualEffects } from '../VisualEffects'

describe('VisualEffects gates', () => {
  it('applies fx- classes when toggles are true', () => {
    const effects = {
      ghostBack: true,
      depthOfField: true,
      rgbEdge: true
    }
    render(
      <VisualEffects effects={effects}>
        <div data-testid="child">X</div>
      </VisualEffects>
    )
    const wrapper = screen.getByTestId('child').parentElement
    expect(wrapper?.className).toContain('visual-effects-wrapper')
    expect(wrapper?.className).toContain('fx-lab-ghost')
    expect(wrapper?.className).toContain('fx-lab-dof')
    expect(wrapper?.className).toContain('fx-rgb-edge')
  })
})