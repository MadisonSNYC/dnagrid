import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button.jsx';
import { Pause, Play, SkipForward, Square } from 'lucide-react';
import { projects } from '../data/projects.js';
import HelixPairGroup from '../helix/HelixPairGroup.jsx';
import { suggestTilesPerTurn, getLabVars } from '../helix/useHelixAngles.js';

// Effect components
import { ColorSchemeEffects } from './effects/ColorSchemeEffects.jsx';
import { VisualEffects } from './effects/VisualEffects.jsx';
import { CardDesignEffects } from './effects/CardDesignEffects.jsx';
import { StructureEffects } from './effects/StructureEffects.jsx';
import { NavigationEffects } from './effects/NavigationEffects.jsx';
import { TypographyEffects } from './effects/TypographyEffects.jsx';

// dev-only watchdog
let __installWatchdog = null;
if (import.meta && import.meta.env && import.meta.env.DEV) {
  try {
    // Dynamic import for dev-only watchdog
    import('@/debug/helixWatchdog.ts').then(module => {
      __installWatchdog = module.installHelixWatchdog;
    });
  } catch {}
}

// dev-only patches
let __installSetPropertyPatch = null;
if (import.meta?.env?.DEV) {
  try {
    import('@/debug/patchSetProperty.ts').then(module => {
      __installSetPropertyPatch = module.installSetPropertyPatch;
    });
  } catch {}
}

// HelixNode component removed - using HelixPairGroup directly now
// This component was replaced with HelixPairGroup for better double-helix structure

const ProjectsGrid = ({ projects, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 ${className}`}>
    {projects.map(project => (
      <div key={project.id} className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white text-lg font-semibold mb-2">{project.title}</h3>
        <p className="text-gray-400">{project.description}</p>
      </div>
    ))}
  </div>
);

const MotionControls = ({ isPaused, onPause, onResume, onEmergencyStop, onSkipIntro, onDevReadout, effects }) => {
  return (
    <div 
      className="motion-controls fixed top-4 right-4 z-50 flex gap-2"
      role="group"
      aria-label="Motion controls"
    >
      {!isPaused ? (
        <Button
          onClick={onPause}
          size="sm"
          variant="outline"
          aria-label="Pause motion"
        >
          <Pause className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={onResume}
          size="sm"
          variant="outline"
          aria-label="Resume motion"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        onClick={onEmergencyStop}
        size="sm"
        variant="destructive"
        aria-label="Emergency stop - disable all motion"
      >
        <Square className="h-4 w-4" />
      </Button>
      
      <Button
        onClick={onSkipIntro}
        size="sm"
        variant="ghost"
        aria-label="Skip intro animation"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDevReadout}
        aria-label="Dev Readout"
        title="Log widths & zCam for front/side/back"
      >
        DEV
      </Button>
    </div>
  );
};

export const EnhancedHelixProjectsShowcase = ({ effects = {} }) => {
  // ==== SAFE MODE (crash-proof profile) ====
  const SAFE_MODE = true;                        // default ON
  const SAFE = {
    MAX_PAIRS:        10,                        // ~20 tiles total (double-helix)
    BATCH_SIZE:       4,                         // tiny batch size to avoid main-thread spikes
    SCENE_TURNS_DEG:  -180,                      // minimal rotation budget while testing
    TRACK_TILT_DEG:   -4,                        // gentle tilt to reduce perspective work
    BASE_TILES_TURN:  10,                        // paired with MAX_PAIRS to keep density low
    VISIBLE_TURNS:    1.0,
    BUFFER_TURNS:     0.2,
    REPEAT_TURNS:     1.0,
    CONSTANT_SIZE_ON: true,                      // anti-breathing
    OUTWARD_OFF:      true,                      // outward disabled
    DEV_PANEL_MINIMAL:true                       // hide risky layout knobs
  };
  
  const [enhanced, setEnhanced] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentProject, setCurrentProject] = useState(0);
  const [pairCount, setPairCount] = useState(0);  // For batched rendering
  const helixRef = useRef(null);
  
  // Check for motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Install dev watchdog
  useEffect(() => {
    if (__installWatchdog) {
      const uninstall = __installWatchdog();
      return () => { uninstall && uninstall(); };
    }
    return;
  }, []);

  // Install dev setProperty patch
  useEffect(() => {
    if (__installSetPropertyPatch) {
      const uninstall = __installSetPropertyPatch({ sampleEvery: 20 });
      return () => { uninstall && uninstall(); };
    }
    return;
  }, []);

  // Feature detection and enhancement
  useEffect(() => {
    const supports3D = CSS.supports('transform-style', 'preserve-3d');
    if (supports3D && !prefersReducedMotion) {
      setEnhanced(true);
    }
  }, [prefersReducedMotion]);

  // Mouse wheel / trackpad scroll support
  useEffect(() => {
    const wheelMode = false; // OFF by default so the page scroll works
    if (!enhanced || !wheelMode) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      setScrollOffset(prev => prev + delta * 0.2); // Slower scroll increment
    };

    const pin = document.querySelector('.helix-pin');
    pin?.addEventListener('wheel', handleWheel, { passive: false });
    return () => pin?.removeEventListener('wheel', handleWheel);
  }, [enhanced]);

  // Auto-rotation logic - DISABLED by default
  useEffect(() => {
    // Disabled auto-rotation
    return;
    
    if (!autoRotate || isPaused || prefersReducedMotion || !enhanced) return;
    
    const rotationSpeed = effects.smoothRotation ? 6000 : 4000;
    const interval = setInterval(() => {
      setScrollOffset(prev => prev + 0.05); // Much slower auto-rotation
    }, 100);
    
    return () => clearInterval(interval);
  }, [autoRotate, isPaused, prefersReducedMotion, enhanced, effects.smoothRotation]);

  // Keyboard navigation
  useEffect(() => {
    if (!enhanced) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setScrollOffset(prev => prev + 0.5); // Slower keyboard navigation
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setScrollOffset(prev => prev - 0.5); // Slower keyboard navigation
          break;
        case 'Home':
          e.preventDefault();
          setScrollOffset(0);
          break;
        case 'Escape':
          e.preventDefault();
          setEnhanced(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enhanced]);

  const handleProjectClick = (index) => {
    const targetOffset = index;
    setScrollOffset(targetOffset);
  };

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);
  const handleEmergencyStop = () => {
    setEnhanced(false);
    setIsPaused(true);
  };
  const handleSkipIntro = () => setEnhanced(false);

  const handleDevReadout = () => {
    // perspective & camera tilt
    const pin = document.querySelector('.helix-pin')
    const persp = pin ? getComputedStyle(pin).perspective : '(none)'
    const tilt = getComputedStyle(document.querySelector('.helix-camera'))?.transform || '(no camera transform)'

    // widths at front/side/back
    const cards = [...document.querySelectorAll('.pair-node.A .tile-card')]
    let widthReport = 'no cards'
    if (cards.length) {
      const w = el => Math.round(el.getBoundingClientRect().width)
      const n = cards.length, q = Math.max(1, Math.floor(n/4))
      widthReport = { front: w(cards[0]), side: w(cards[q]), back: w(cards[q*2]), count: n }
    }

    // camera-space Z var
    const nodes = [...document.querySelectorAll('.pair-node.A')]
    let zReport = 'no nodes'
    if (nodes.length) {
      const readZ = el => {
        const z = getComputedStyle(el).getPropertyValue('--zCamPx')?.trim()
        return z ? Number(z) : null
      }
      const n = nodes.length, q = Math.max(1, Math.floor(n/4))
      zReport = { front: readZ(nodes[0]), side: readZ(nodes[q]), back: readZ(nodes[q*2]), count: n }
    }

    const world = document.querySelector('.helix-world')
    const sceneDeg = world ? getComputedStyle(world).getPropertyValue('--sceneDeg') : '(no --sceneDeg)'

    console.group('[Helix Dev Readout]')
    console.log('perspective:', persp)
    console.log('camera transform (tilt):', tilt)
    console.log('sceneDeg:', sceneDeg)
    console.log('widths (A strand):', JSON.stringify(widthReport))
    console.log('zCamPx (A strand):', JSON.stringify(zReport))
    console.groupEnd()
  }

  // Robust Scroll v3: rAF-throttled, document-based mapping to --t ∈ [0..1]
  useEffect(() => {
    const root = document.documentElement
    const docEl = document.scrollingElement || document.documentElement
    let frame = 0
    let lastT = -1

    const computeT = () => {
      const scrollY = docEl.scrollTop || window.pageYOffset || 0
      const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      )
      const total = Math.max(docHeight - window.innerHeight, 1)
      const t = Math.min(Math.max(scrollY / total, 0), 1)
      return t
    }

    const writeT = () => {
      frame = 0
      const t = computeT()
      if (Math.abs(t - lastT) > 0.001) {
        lastT = t
        root.style.setProperty('--t', String(t))
        window.__helixIncWrite && window.__helixIncWrite()
      }
    }

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(writeT) }
    const onResize = () => { if (!frame) frame = requestAnimationFrame(writeT) }

    // initialize with t=0 so CSS calc() gets a numeric value immediately
    root.style.setProperty('--t', '0')
    writeT()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // Guarantee tilt var is set at boot (and whenever effect value changes)
  useEffect(() => {
    const tilt = SAFE_MODE ? SAFE.TRACK_TILT_DEG : (effects.trackTiltDeg ?? -10)
    const turns = SAFE_MODE ? SAFE.SCENE_TURNS_DEG : -720
    const root = document.documentElement
    root.style.setProperty('--track-tilt-deg', `${tilt}deg`)   // <- with units
    root.style.setProperty('--sceneTurns', `${turns}deg`)       // <- with units
  }, [effects.trackTiltDeg])

  // DEV: keyboard stepper for yaw (left/right change --t by ±0.02) — helps when scroll feels glitchy
  useEffect(() => {
    const root = document.documentElement
    const onKey = (e) => {
      if (!e || e.repeat) return
      const cur = parseFloat(getComputedStyle(root).getPropertyValue('--t')) || 0
      if (e.key === 'ArrowRight') root.style.setProperty('--t', String(Math.min(cur + 0.02, 1)))
      if (e.key === 'ArrowLeft')  root.style.setProperty('--t', String(Math.max(cur - 0.02, 0)))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Update CSS sizing variables and section height - MUST be before any conditional returns
  useEffect(() => {
    const root = document.documentElement;
    const next = {
      '--tile-w': `${effects.tileW}px`,
      '--tile-h': `${effects.tileH}px`,
      '--section-svh': `${effects.sectionSVH}svh`,
    };
    // Only write changed values, and batch in one rAF
    let frame = requestAnimationFrame(() => {
      for (const [k, v] of Object.entries(next)) {
        const cur = getComputedStyle(root).getPropertyValue(k).trim();
        if (cur !== v) {
          root.style.setProperty(k, v);
          window.__helixIncWrite && window.__helixIncWrite();
        }
      }
    });
    return () => { if (frame) cancelAnimationFrame(frame); };
  }, [effects.tileW, effects.tileH, effects.sectionSVH]);

  // SAFE_MODE: compute bounded target count, then build in small batches
  useEffect(() => {
    const radius = effects.radiusPx ?? 250;
    const baseTilesTurn = SAFE_MODE ? SAFE.BASE_TILES_TURN : (effects.autoSpacing ? suggestTilesPerTurn(radius, effects.tileW, effects.gutterPx, 24) : (effects.tilesPerTurn ?? 16));
    const visibleTurns = SAFE_MODE ? SAFE.VISIBLE_TURNS : (effects.readabilityMode ? (effects.visibleTurns ?? 2.8) : (window.innerWidth <= 768 ? 1.5 : 2.0));
    const bufferTurns = SAFE_MODE ? SAFE.BUFFER_TURNS : (effects.readabilityMode ? (effects.bufferTurns ?? 0.7) : 0.5);
    const repeatTurns = SAFE_MODE ? SAFE.REPEAT_TURNS : (effects.repeatTurns ?? 2.0);
    const neededPairsCalc = Math.ceil((visibleTurns + bufferTurns + repeatTurns) * baseTilesTurn);
    const target = SAFE_MODE ? Math.min(neededPairsCalc, SAFE.MAX_PAIRS) : neededPairsCalc;

    setPairCount(0); // reset before re-building
    let cancelled = false;
    const enqueue = () => {
      if (cancelled) return;
      setPairCount(prev => {
        const next = Math.min(prev + (SAFE_MODE ? SAFE.BATCH_SIZE : neededPairsCalc), target);
        if (next < target) {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(enqueue, { timeout: 50 });
          } else {
            setTimeout(enqueue, 0);
          }
        }
        return next;
      });
    };
    enqueue();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effects.radiusPx, effects.tilesPerTurn, effects.autoSpacing, effects.readabilityMode, effects.visibleTurns, effects.bufferTurns, effects.repeatTurns, effects.tileW, effects.gutterPx]);

  // Fallback to 2D grid for reduced motion or unsupported browsers
  if (prefersReducedMotion || !enhanced) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Featured Projects
          </h1>
          <ProjectsGrid projects={projects} />
        </div>
      </div>
    );
  }

  // Apply safe effects profile if SAFE_MODE is on
  const safeFx = { ...effects };
  if (SAFE_MODE) {
    safeFx.constantTileSize = SAFE.CONSTANT_SIZE_ON;
    safeFx.outwardTurn = !SAFE.OUTWARD_OFF;
    safeFx.depth = false;              // disable any legacy depth scaling
    safeFx.rgbEdge = false;            // turn off heavy FX
    safeFx.depthBlur = false;
    safeFx.chromatic = false;
    safeFx.minimalistControls = SAFE.DEV_PANEL_MINIMAL;
  }

  return (
    <ColorSchemeEffects effects={safeFx}>
      <VisualEffects effects={safeFx}>
        <CardDesignEffects effects={safeFx}>
          <StructureEffects effects={safeFx}>
            <NavigationEffects 
              effects={safeFx} 
              currentProject={currentProject}
              totalProjects={projects.length}
              onProjectSelect={handleProjectClick}
            >
              <TypographyEffects effects={safeFx}>
                <section className="projects-showcase relative" data-enhanced={enhanced}>
                  {/* Skip link for accessibility */}
                  <a 
                    href="#projects-list" 
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
                  >
                    Skip 3D animation and view projects list
                  </a>

                  {/* Motion controls */}
                  <MotionControls 
                    isPaused={isPaused}
                    onPause={handlePause}
                    onResume={handleResume}
                    onEmergencyStop={handleEmergencyStop}
                    onSkipIntro={handleSkipIntro}
                    onDevReadout={handleDevReadout}
                    effects={effects}
                  />

                  {/* 3D Helix Scene - Encapsulated */}
                  <section className="helix-stage">
                    <div className="helix-pin">
                      <div className="helix-camera">
                        <div className="helix-world">
                          <div className="helix-scene relative h-screen overflow-hidden flex items-center justify-center">
                            <div 
                              className="helix-assembly"
                              ref={helixRef}
                              style={{
                                transformStyle: 'preserve-3d',
                                // Remove perspective and rotateX - now handled by parent layers
                                // No global Y push - vertical climb comes only from each pair's yOffset
                                transform: 'none',
                        transition: effects.smoothRotation 
                          ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
                          : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        width: '600px',
                        height: '600px',
                        position: 'relative'
                      }}
                    >
                      {(() => {
                        // Double-helix calculation
                        const radius = safeFx.radiusPx ?? 250;
                        const pitchPerTurn = safeFx.pitchPerTurnPx ?? 800;
                        const baseTilesPerTurn = SAFE_MODE ? SAFE.BASE_TILES_TURN : (safeFx.autoSpacing
                          ? suggestTilesPerTurn(radius, safeFx.tileW, safeFx.gutterPx, 24)
                          : (safeFx.tilesPerTurn ?? 16));

                        const deltaDeg = 360 / baseTilesPerTurn;
                        
                        // Readability mode overrides with SAFE_MODE checks
                        const visibleTurns = SAFE_MODE ? SAFE.VISIBLE_TURNS : (safeFx.readabilityMode 
                          ? (safeFx.visibleTurns ?? 2.8) 
                          : (window.innerWidth <= 768 ? 1.5 : 2.0));
                        const bufferTurns = SAFE_MODE ? SAFE.BUFFER_TURNS : (safeFx.readabilityMode 
                          ? (safeFx.bufferTurns ?? 0.7) 
                          : 0.5);
                        const repeatTurns = SAFE_MODE ? SAFE.REPEAT_TURNS : (safeFx.readabilityMode 
                          ? (safeFx.repeatTurns ?? 3.0) 
                          : (safeFx.repeatTurns ?? 2.0));
                        const neededPairs = Math.ceil((visibleTurns + bufferTurns + repeatTurns) * baseTilesPerTurn);
                        const cappedPairs = SAFE_MODE ? Math.min(neededPairs, SAFE.MAX_PAIRS) : neededPairs;

                        const sceneDeg = scrollOffset * (360 / projects.length);

                        return Array.from({ length: Math.min(pairCount, cappedPairs) }, (_, i) => {
                          const thetaDeg = i * deltaDeg;
                          const yOffset = (pitchPerTurn / 360) * thetaDeg;
                          const projectIndex = i % projects.length;
                          const project = projects[projectIndex];

                          // Lab variables for this tile
                          const nodeVars = getLabVars(thetaDeg, sceneDeg, project, window);

                          // Pass through node vars without size compensation
                          // (constant-size CSS already uses exact inverse projection with --zCamPx/--perspPx)
                          const enhancedNodeVars = {
                            ...(nodeVars || {}),
                          };

                          // Placeholder label for Safe Mode
                          const label = `P${(i + 1).toString().padStart(2, '0')}`;

                          // Info card content
                          const infoNode = SAFE_MODE
                            ? <div className="media-3d flex items-center justify-center text-white text-[10px] opacity-80">{label} Info Card</div>
                            : (
                              <div className="media-3d flex flex-col justify-between p-2 text-white">
                                <div className="text-xs opacity-80">{project?.title || 'Project'}</div>
                                <div className="text-[10px] opacity-60">Click to view details</div>
                              </div>
                            );

                          // Media node (existing BowedCard logic)
                          const mediaNode = SAFE_MODE
                            ? <div className="media-3d flex items-center justify-center text-white text-xs">{label} Media</div>
                            : (
                              <div className="media-3d">
                                <div 
                                  className="tile-media-wrapper"
                                  style={{
                                    background: project?.thumbnail ? `url(${project.thumbnail})` : 'rgba(255,255,255,0.1)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '8px'
                                  }}
                                >
                                  {project?.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );

                          return (
                            <HelixPairGroup
                              key={`pair-${i}`}
                              thetaDeg={thetaDeg}
                              yOffset={yOffset}
                              radius={radius}
                              sceneYaw={sceneDeg}
                              trackTilt={SAFE_MODE ? SAFE.TRACK_TILT_DEG : (safeFx.trackTiltDeg ?? -10)}
                              media={mediaNode}
                              info={infoNode}
                              nodeVars={enhancedNodeVars}
                              className={`depth-${i % 3 === 0 ? 'near' : i % 3 === 1 ? 'mid' : 'far'}`}
                              onClick={() => handleProjectClick(projectIndex)}
                            />
                          );
                        });
                      })()}
                      
                      {/* Center Logo (when enabled, replaces wireframe) */}
                      {safeFx.centerLogo && (
                        <img
                          src="/Ravielogo1.png"
                          alt="Ravie logo"
                          className={`center-logo no-select ${safeFx.centerLogoMode || 'billboard'}`}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Navigation instructions - moved outside helix-world so it doesn't rotate */}
                <div className="navigation-instructions fixed top-8 left-8 text-white text-sm">
                  <div className="bg-gray-900/80 rounded-lg p-4 backdrop-blur-sm">
                    <h3 className="font-semibold mb-2">Navigation</h3>
                    <ul className="space-y-1 text-xs">
                      <li>← → Arrow keys to navigate</li>
                      <li>Page scroll to rotate helix</li>
                      <li>Click projects to select</li>
                      <li>Esc to exit 3D view</li>
                      <li>Infinite scroll - cards repeat endlessly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

                  {/* Accessible fallback (hidden but present for screen readers) */}
                  <div id="projects-list" className="sr-only">
                    <h2>Projects List</h2>
                    <ProjectsGrid projects={projects} />
                  </div>
                </section>
              </TypographyEffects>
            </NavigationEffects>
          </StructureEffects>
        </CardDesignEffects>
      </VisualEffects>
    </ColorSchemeEffects>
  );
};

export default EnhancedHelixProjectsShowcase;