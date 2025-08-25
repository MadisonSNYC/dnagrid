// src/debug/helixWatchdog.ts
// Lightweight performance watchdog for dev. No-op in prod.
// - Observes Long Tasks
// - Tracks scroll/wheel counts vs rAF updates
// - Provides an overlay and window.__helixDebug for inspection

type HelixDebug = {
  longTasks: number
  lastLongTask: number
  scrollEvents: number
  wheelEvents: number
  rafUpdates: number
  writes: number
  overlay?: HTMLElement
}

export function installHelixWatchdog() {
  if (typeof window === 'undefined') return () => {}
  if ((window as any).__helixWatchdogInstalled) return () => {}
  ;(window as any).__helixWatchdogInstalled = true

  const state: HelixDebug = {
    longTasks: 0,
    lastLongTask: 0,
    scrollEvents: 0,
    wheelEvents: 0,
    rafUpdates: 0,
    writes: 0,
    overlay: undefined
  }
  ;(window as any).__helixDebug = state

  // Overlay
  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed;top:6px;right:6px;z-index:99999;
    background:rgba(0,0,0,.65);color:#fff;font:12px/1.2 ui-monospace,monospace;
    padding:6px 8px;border-radius:6px;pointer-events:none;white-space:pre;
  `
  document.body.appendChild(el)
  state.overlay = el

  const updateOverlay = () => {
    el.textContent =
`LT: ${state.longTasks} (last ${state.lastLongTask.toFixed(1)}ms)
scroll: ${state.scrollEvents}  wheel: ${state.wheelEvents}
rAF: ${state.rafUpdates}  writes: ${state.writes}`
  }

  // Long task observer
  try {
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if ((e as any).duration) {
          state.longTasks++
          state.lastLongTask = (e as any).duration
        }
      }
      updateOverlay()
    })
    // @ts-ignore
    po.observe({ entryTypes: ['longtask'] })
  } catch {}

  // Count events
  const onScroll = () => { state.scrollEvents++; }
  const onWheel = () => { state.wheelEvents++; }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: true })

  // rAF ticker (increments rafUpdates ~60/s)
  let rafId = 0
  const tick = () => { state.rafUpdates++; updateOverlay(); rafId = requestAnimationFrame(tick) }
  rafId = requestAnimationFrame(tick)

  // expose a counter increment for the scroll writer to call
  ;(window as any).__helixIncWrite = () => { state.writes++; updateOverlay() }

  updateOverlay()

  return () => {
    try {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      if (rafId) cancelAnimationFrame(rafId)
      state.overlay?.remove()
      ;(window as any).__helixWatchdogInstalled = false
    } catch {}
  }
}