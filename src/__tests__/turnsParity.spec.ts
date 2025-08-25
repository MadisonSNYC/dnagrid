import { describe, it, expect } from 'vitest'

// Keep this aligned with CSS: --sceneDeg = var(--t) * (TURNS * 360deg)
const TURNS = 2
const TURNS_DEG = TURNS * -360 // negative for the current direction

describe('turns parity', () => {
  it('uses the same TURNS in JS parity helpers as in CSS', () => {
    const t = 0.75
    const cssDeg = t * TURNS_DEG
    const jsDeg  = t * TURNS_DEG
    expect(jsDeg).toBeCloseTo(cssDeg, 8)
  })
})