// DEV ONLY: patch documentElement.style.setProperty to log stack traces for noisy writers.
// Install from the app root (EnhancedHelixProjectsShowcase) only in dev.
export function installSetPropertyPatch(opts: { sampleEvery?: number } = {}) {
  if (typeof window === 'undefined') return () => {}
  const sampleEvery = Math.max(1, opts.sampleEvery ?? 10)
  const style = document.documentElement.style as any
  if (style.__patchedSetProperty) return () => {}

  const orig = style.setProperty.bind(style)
  let count = 0

  function patched(name: string, value: string, pri?: string) {
    count++
    // Log every Nth call to avoid flooding
    if (count % sampleEvery === 0) {
      // Skip known benign ones if desired (e.g. --t)
      const skip = name === '--t'
      if (!skip) {
        // eslint-disable-next-line no-console
        console.groupCollapsed('[setProperty]', name, '→', value)
        // eslint-disable-next-line no-console
        console.trace()
        // eslint-disable-next-line no-console
        console.groupEnd()
      }
    }
    return orig(name, value, pri)
  }

  style.setProperty = patched
  style.__patchedSetProperty = true

  return () => {
    if (style.__patchedSetProperty) {
      style.setProperty = orig
      delete style.__patchedSetProperty
    }
  }
}