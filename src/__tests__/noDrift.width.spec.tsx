import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '@/App'

describe('no drift across scroll turns (constant size on)', () => {
  it('constant size effect is enabled by default', () => {
    const { container } = render(<App />)
    const wrapper = container.querySelector('.visual-effects-wrapper')!
    expect(wrapper.className).toContain('fx-const-size') // default-on
    
    // Verify compensation strength CSS variable is set
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--comp-strength')
  })
})