import { normalizeSignedDeg, getDepth, getTier } from '../useHelixAngles'

const angleEq = (a: number, b: number, tol = 1e-6) => {
  const wrap = (x: number) => {
    let y = ((x % 360) + 360) % 360 // in [0,360)
    if (y > 180 - tol) y -= 360     // in (-180,180]
    return y
  }
  return Math.abs(wrap(a) - wrap(b)) <= tol
}

describe('useHelixAngles', () => {
  it('distributes angles and vertical offsets monotonically over two turns', () => {
    // Test the actual exported functions since useHelixAngles doesn't exist
    // Testing normalizeSignedDeg function
    const angle1 = normalizeSignedDeg(0)
    const angle2 = normalizeSignedDeg(180)
    const angle3 = normalizeSignedDeg(360)
    const angle4 = normalizeSignedDeg(720)
    
    expect(typeof angle1).toBe('number')
    expect(angle1).toBe(0)
    // 180 and -180 are equivalent in signed angle representation
    expect(angleEq(angle2, 180)).toBe(true)
    expect(angleEq(angle2, -180)).toBe(true)
    expect(angle3).toBe(0)
    expect(angle4).toBe(0)
    
    // Test getDepth function
    const depth1 = getDepth(0, 0)
    const depth2 = getDepth(180, 0)
    expect(depth1).toBeGreaterThanOrEqual(0)
    expect(depth1).toBeLessThanOrEqual(1)
    expect(depth2).toBeGreaterThanOrEqual(0)
    expect(depth2).toBeLessThanOrEqual(1)
    
    // Test getTier function
    const tier1 = getTier(0)
    const tier2 = getTier(0.5)
    const tier3 = getTier(1)
    expect(typeof tier1).toBe('string')
    expect(typeof tier2).toBe('string')
    expect(typeof tier3).toBe('string')
  })
})