import { describe, it, expect } from 'vitest'

// Reference behavior we want to lock in at the math/vars level.
const dampBias = (base: number) => base * 0.25 // per handoff doc

describe('bias damping under constant-size', () => {
  it('reduces bias to 25% of base when constant-size is active', () => {
    expect(dampBias(1)).toBeCloseTo(0.25, 5)
    expect(dampBias(0.8)).toBeCloseTo(0.2, 5)
  })
})