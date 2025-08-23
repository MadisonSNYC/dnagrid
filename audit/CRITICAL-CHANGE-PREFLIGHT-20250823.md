# CRITICAL CHANGE — PRE-FLIGHT AUDIT & TASK PLAN  
**Date:** 08/23/25  
**Owner:** Madison / Helix App  
**Status:** 🟢 SAFETY GREEN

---

## 1) Summary

We verified all **critical invariants** for the Helix scene before making changes. The **Madison preset** (old, known-good) is restored and running cleanly.

### Invariants Confirmed
- **Assembly yaw (global):** `rotateY(var(--sceneDeg))` ✅  
- **Node orbit (local):** `rotateY(θ) translateZ(R)` ✅  
- **Card face-camera:** `rotateY(-(θ + sceneYaw))` ✅  
- **3D context:** multiple `transform-style: preserve-3d` ✅  
- **Yaw source:** `--sceneDeg` present and driven (sticky/wheel) ✅  
- **Effects wrapper:** `visual-effects-wrapper` + `fx-depth-placement` + Lab gates ✅

### Current Preset
- Single-strand helix (no double-helix)
- **DoF ON**, **Ghost ON**, **Wireframe ON**, **Center Logo (billboard)** ON
- Track Tilt **-10°** desktop / **-3°** mobile
- RGB Edge (desktop-only) with intensity 15% / offset 0
- Spacing & motion: *calm, readable* baseline (radius/pitch/gap controls available)

---

## 2) Safety Branch

```bash
git checkout -b safe/critical-change-20250823-1603
```
This branch captures a snapshot prior to any critical edits.

## 3) Scope & Caution
**Critical path:** transforms, spacing, scroll physics, or effect gates.

**Out-of-scope:** unrelated components, shared utilities not tied to this change.

**If uncertain at any point:** pause and document thought process before proceeding.

## 4) Change Protocol (Always Follow)
1. **Pre-flight audit (read-only)** — confirm invariants above (done).
2. **Feature flag** — add a boolean gate (OFF by default).
3. **Surgical patch** — only in the files directly involved.
4. **No transform order changes** unless explicitly intended.
5. **Local verification** — console tests + visual inspection.
6. **Instant rollback** — disable flag or `git reset --hard HEAD~1`.
7. **Post-flight audit** — re-run invariant checks.

## 5) Read-Only Audit Commands (for future runs)
```bash
# Transform chain
grep -R --line-number --color -E \
"rotateY\\(var\\(--sceneDeg\\)|rotateY\\(\\$\\{-(angle \\+ sceneYaw)\\}|translateZ\\(\\$\\{radius\\}|pair-connector|transform-style: preserve-3d" \
src/components/EnhancedHelixProjectsShowcase.jsx src/helix/HelixPairGroup.tsx src/styles/helix-safe.css || true

# Yaw sources (single-source routing)
grep -R --line-number --color -E "useWheelSceneYaw|--sceneDeg|rotateY\\(var\\(--sceneDeg\\)" src || true

# Effect gates
grep -R --line-number --color -E "visual-effects-wrapper|fx-depth-placement|fx-lab|data-depth-blur" \
src/components/effects/VisualEffects.jsx src || true
```

## 6) Console Smoke (quick invariants)
Paste one line at a time in DevTools:

```javascript
// Assembly yaw (matrix3d expected)
getComputedStyle(document.querySelector('.helix-assembly')).transform

// Card face-camera (look for negative rotateY)
document.querySelector('.tile-card')?.getAttribute('style')

// Wrapper gates
(() => {
  const w = document.querySelector('.visual-effects-wrapper');
  return w ? w.className : '(no wrapper)';
})()
```

## 7) Feature Flag Template (for the upcoming change)
**State (effects):**

```javascript
// src/hooks/useEffects.js
const defaultEffects = {
  // …existing…
  criticalChange: false,   // OFF by default
};
```

**DevPanel (isolated toggle):**

```jsx
// src/components/DevPanel.jsx
<section>
  <h3>Critical Mode</h3>
  <label className="row">
    <input
      type="checkbox"
      checked={effects.criticalChange}
      onChange={() => onEffectToggle('criticalChange', !effects.criticalChange)}
    />
    Enable Critical Change
  </label>
</section>
```

**Apply the change behind the flag:**

```javascript
if (effects.criticalChange) {
  // do the minimal, surgical change here
  // leave transform hierarchy / yaw routing untouched
}
```

## 8) Rollback Plan
**Disable flag** in DevPanel to revert behavior immediately, or

**Local revert:**
```bash
git reset --hard HEAD~1
pnpm dev || npm run dev
```

## 9) Next Step — Define the Critical Change
Please specify the exact change to apply (e.g., "adjust helical pitch formula," "swap spacing source to card-driven," "refine wheel physics," "alter billboard logic," etc.).

We will:
1. Confirm scope & impacted files.
2. Add a feature flag (OFF by default).
3. Implement minimal change.
4. Re-run invariants and console smoke.
5. Leave a one-click rollback.

## 10) Sign-off Checklist (per change)
- [ ] Feature flag defaults OFF
- [ ] No transform-order regressions
- [ ] Assembly still rotates via `rotateY(var(--sceneDeg))`
- [ ] Nodes still orbit via `rotateY(θ) translateZ(R)`
- [ ] Cards still face via `rotateY(-(θ + sceneYaw))`
- [ ] Effects wrapper classes present; DoF/Ghost unchanged
- [ ] Local tests pass; console shows no new warnings/errors
- [ ] Rollback verified (`git reset --hard HEAD~1` works)

---

**Prepared by:** Madison / Helix App  
**Date:** 08/23/25  
**Branch:** safe/critical-change-20250823-1603