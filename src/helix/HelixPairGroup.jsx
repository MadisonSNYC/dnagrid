import React from 'react';
import HelixTile from './HelixTile.jsx';

export default function HelixPairGroup({
  thetaDeg,
  yOffset,
  radius,
  sceneYaw,
  media,
  info,
  nodeVars = {},
  className = '',
  onClick,
  trackTilt
}) {
  // base group transform (rotateY θᵢ then climb)
  const groupStyle = {
    transform: `
      translate(-50%, -50%)
      rotateY(${thetaDeg}deg)
      translateY(${yOffset}px)
    `,
  };

  // yaw cancel uses (angle + sceneYaw); for inner card we pass strings
  const cardYawA = `rotateY(${-(thetaDeg + sceneYaw)}deg)`;
  const cardYawB = `rotateY(${-(thetaDeg + 180 + sceneYaw)}deg)`;

  // Compute camera-space Z (include tilt & y rise)
  const degToRad = d => (d * Math.PI) / 180
  const persp = 1200                     // must match .helix-assembly
  const rxDeg = trackTilt ?? -10         // pass this in if available
  const rx = degToRad(rxDeg)

  // global theta = orbit + scene yaw
  const thetaGlobal = thetaDeg + (sceneYaw || 0)

  // helix local Z from orbit (using translateX after rotateY → equivalent to R*sin(theta))
  const zLocal = radius * Math.sin(degToRad(thetaGlobal))

  // vertical rise already applied in groupStyle: translateY(yOffset)
  // camera-space Z after rotateX(rx): z' = z*cos(rx) + y*sin(rx)
  const zCam = (zLocal * Math.cos(rx)) + (yOffset * Math.sin(rx))

  // normalized signed depth (can be negative on back side)
  const zNormSigned = zCam / persp
  
  // Keep old zNorm for backward compatibility
  const zNorm = Math.max(0, Math.min(1, Math.abs(zCam) / persp))
  
  // Ensure these are always strings for CSS variables
  const zCamStr = String(zCam)
  const perspStr = String(persp)

  return (
    <div className="pair-group absolute left-1/2 top-1/2" style={groupStyle} role="group">
      {/* Strand A (+R) - Media */}
      <div 
        className="pair-node A absolute" 
        data-facing={zCam < 0 ? 'back' : 'front'}
        style={{ 
          transform: `translateX(${radius}px)`, 
          '--zNorm': zNorm,
          '--zCam': zCam,
          '--zNormSigned': zNormSigned,
          '--zCamPx': zCamStr,     // string to ensure not null
          '--perspPx': perspStr    // string to ensure not null
        }}
      >
        <HelixTile
          className={className}
          nodeStyle={nodeVars}
          dataGhost="on"
          cardYaw={cardYawA}
          media={media}
          onClick={onClick}
        />
      </div>

      {/* Connector (base pair) */}
      <div 
        className="pair-connector absolute left-1/2 top-1/2"
        aria-hidden="true"
        style={{
          width: `${radius * 2}px`,
          height: '2px',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Strand B (−R) — info card */}
      <div 
        className="pair-node B absolute" 
        data-facing={zCam < 0 ? 'back' : 'front'}
        style={{ 
          transform: `translateX(${-radius}px)`, 
          '--zNorm': zNorm,
          '--zCam': zCam,
          '--zNormSigned': zNormSigned,
          '--zCamPx': zCamStr,     // string to ensure not null
          '--perspPx': perspStr    // string to ensure not null
        }}
      >
        <HelixTile
          className={className + ' pair-info'}
          nodeStyle={nodeVars}
          dataGhost="off"
          cardYaw={cardYawB}
          media={info}
        />
      </div>
    </div>
  );
}