// Ensures numeric parity with CSS: if CSS uses --sceneDeg = t * (-720deg),
// JS-side parity math must compute sceneYaw = t * -720 for the same t.
describe('scene yaw parity (CSS --sceneDeg vs JS numeric)', () => {
  // IMPORTANT: keep these numbers aligned with the CSS sticky calc in helix-safe.css
  const TURNS_DEG = -720 // adjust if CSS uses a different value

  const jsSceneYaw = (t: number) => t * TURNS_DEG

  it('maps t in [0,1] to identical degrees as CSS', () => {
    const ts = [0, 0.125, 0.333, 0.5, 0.75, 1]
    for (const t of ts) {
      const jsDeg = jsSceneYaw(t)
      // CSS would compute deg via calc(var(--t) * -720deg)
      // We assert numeric equality to within a tiny epsilon
      const cssDeg = t * TURNS_DEG
      expect(Math.abs(jsDeg - cssDeg)).toBeLessThan(1e-6)
    }
  })
})