# Critical Change Audit - August 23, 2025

## Safety Snapshot
- Branch: `safe/critical-change-20250823-1603`
- Previous state: Madison preset restored from `f2c588f4`
- Dev server: http://localhost:5173

## Pre-Flight Audit Results ✅

### Transform Chain Invariants (VERIFIED)
```bash
# Assembly rotation
src/components/EnhancedHelixProjectsShowcase.jsx:439
rotateY(${scrollOffset * (360 / projects.length)}deg)

# Node orbit  
src/components/EnhancedHelixProjectsShowcase.jsx:158
translateZ(${radius}px)

# Card face-camera
src/components/EnhancedHelixProjectsShowcase.jsx:177
transform: rotateY(${-angle}deg)

# 3D context preservation (multiple locations)
transform-style: preserve-3d
```

### Yaw Sources - Single Source Control (VERIFIED)
```bash
# CSS variable on assembly
src/components/EnhancedHelixProjectsShowcase.jsx:443
'--sceneDeg': ${scrollOffset * (360 / projects.length)}deg

# Wheel hook
src/hooks/useWheelSceneYaw.ts:32
export const useWheelSceneYaw

# Sticky CSS calc
src/styles/helix.css:68
rotateY(var(--sceneDeg))
```

### Effects Wrapper Gates (VERIFIED)
```bash
# Main wrapper with depth placement
src/components/effects/VisualEffects.jsx:16
className={`visual-effects-wrapper lab-compat fx-depth-placement...`}

# Lab effect gates (conditional)
fx-lab-dof (line 21)
fx-lab-ghost (line 22)
fx-lab-bias (line 23)
fx-lab-monitor (line 24)
fx-lab-glow (line 25)
fx-lab-scan (line 26)
fx-lab-chroma (line 27)
fx-lab-grain (line 28)
fx-lab-film (line 29)
fx-lab-light (line 30)

# Depth blur attribute gate
src/components/effects/VisualEffects.jsx:37
data-depth-blur={effects.depthBlur}
```

## Critical Change Protocol

### 0. Snapshot ✅
```bash
git checkout -b safe/critical-change-$(date +%Y%m%d-%H%M)
# Created: safe/critical-change-20250823-1603
```

### 1. Read-Only Pre-Flight Audit ✅
All invariants confirmed intact:
- Assembly yaw → `rotateY(var(--sceneDeg))` 
- Nodes orbit → `rotateY(θ) translateZ(R)`
- Cards yaw-cancel → `rotateY(${-angle}deg)`
- Wrapper gates present

### 2. Scope & Impact Map
**Files allowed to change:** (To be determined based on critical change request)
- Feature implementation files only
- No drive-by edits
- Gate with feature flag

### 3. Feature Flag Template
```javascript
// src/hooks/useEffects.js
const defaultEffects = {
  // ...existing...
  criticalChange: false,   // OFF by default
};

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

### 4. Implementation
(Awaiting critical change specification)

### 5. Test Checklist
```javascript
// Console tests - Copy/paste one at a time
getComputedStyle(document.querySelector('.helix-assembly')).transform           // matrix3d(...)
document.querySelector('.tile-card')?.getAttribute('style')                     // rotateY(-...)
(() => document.querySelectorAll('.helix-tile').length)()                      // expected count
getComputedStyle(document.querySelector('.helix-scene')).getPropertyValue('--sceneDeg')

// Visual checks
- [ ] No diagonal "rail" - nodes in proper ring
- [ ] DoF effect working
- [ ] Ghost effect working  
- [ ] Wireframe/Logo working
- [ ] RGB edge working
- [ ] No console errors
```

### 6. Rollback Options
```bash
# Option 1: Disable gate in DevPanel
# Uncheck "Critical Change"

# Option 2: Git reset
git reset --hard HEAD~1

# Option 3: Restore branch
git checkout main
git checkout f2c588f4 -- [affected files]
```

### 7. Post-Change Verification
Re-run all pre-flight audits to confirm invariants unchanged.

## Status

**Current State:** Ready for critical change implementation
**Safety Branch:** Created and active
**All Invariants:** Verified and intact
**Next Step:** Awaiting critical change specification

---

*Generated: August 23, 2025 - 16:03 PST*