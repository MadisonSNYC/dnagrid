import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '@/App'

describe('single perspective owner', () => {
  it('only helix-pin defines perspective', () => {
    const { container } = render(<App />)
    const pin = container.querySelector('.helix-pin')!
    const asm = container.querySelector('.helix-assembly')
    const pinPersp = getComputedStyle(pin).perspective
    const asmPersp = asm ? getComputedStyle(asm).perspective : 'none'
    expect(pinPersp).not.toBe('none')
    expect(asmPersp).toBe('none') // ensure no nested/duplicate perspective
  })
})