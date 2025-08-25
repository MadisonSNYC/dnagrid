// Conceptual parity: card yaw rotation matches -(theta + sceneDeg)
describe('face-camera parity', () => {
  const cardYaw = (thetaDeg: number, sceneDeg: number) => -(thetaDeg + sceneDeg)

  it('keeps front-facing at multiple poses', () => {
    const cases = [
      { theta: 0,   scene:   0,   expected:   0 },
      { theta: 60,  scene: -60,   expected:   0 },
      { theta: 180, scene: -540,  expected:  360 }, // equivalent to 0 modulo 360
      { theta: -45, scene:  45,   expected:   0 },
    ]
    for (const { theta, scene, expected } of cases) {
      const yaw = cardYaw(theta, scene)
      // compare with modulo 360 tolerance
      const wrap = (x: number) => {
        let y = ((x % 360) + 360) % 360
        return y
      }
      expect(Math.abs(wrap(yaw) - wrap(expected)) <= 1e-6).toBe(true)
    }
  })
})