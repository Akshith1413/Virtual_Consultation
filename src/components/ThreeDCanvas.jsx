import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import DayNightCycle from './effects/DayNightCycle';
import MouseTracker3D from './interactions/MouseTracker3D';

/**
 * Reusable 3D Scene wrapper component.
 * NOT a global wrapper — used per-page or per-widget.
 */
export default function Scene3D({
  children,
  className = '',
  style = {},
  camera = { position: [0, 0, 8], fov: 55 },
  enablePostProcessing = true,
  enableDayNight = false,
  enableMouseTracker = false,
  enableParticleTrail = false,
  background = 'transparent',
  quality = 'high', // 'low', 'medium', 'high'
  fullscreen = false,
  interactive = true,
}) {
  const dpr = quality === 'low' ? [1, 1] : quality === 'medium' ? [1, 1.5] : [1, 2];

  const containerStyle = useMemo(() => ({
    ...(fullscreen ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
    } : {
      width: '100%',
      height: '100%',
    }),
    ...style,
  }), [fullscreen, style]);

  return (
    <div className={className} style={containerStyle}>
      <Canvas
        dpr={dpr}
        camera={camera}
        gl={{
          antialias: quality !== 'low',
          alpha: background === 'transparent',
          powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
        }}
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
        shadows={quality === 'high'}
      >
        {background === 'transparent' ? null : <color attach="background" args={[background]} />}

        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow={quality === 'high'} />
          <pointLight position={[-5, -3, 5]} intensity={0.3} color="#6366f1" />

          {/* Day/Night cycle if enabled */}
          {enableDayNight && <DayNightCycle />}

          {/* Mouse tracker */}
          {enableMouseTracker && <MouseTracker3D />}

          {/* Scene content */}
          {children}

          {/* Post-processing */}
          {enablePostProcessing && quality !== 'low' && (
            <EffectComposer>
              <Bloom
                luminanceThreshold={0.6}
                luminanceSmoothing={0.9}
                intensity={0.8}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.1} darkness={0.4} />
            </EffectComposer>
          )}

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
} 
 
 
 
