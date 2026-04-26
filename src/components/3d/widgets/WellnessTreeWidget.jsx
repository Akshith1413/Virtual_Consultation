import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import WellnessTree3D from '../../sections/WellnessTree3D';

/**
 * WellnessTreeWidget: Embedded 3D canvas showing the wellness tree.
 * Tree growth reflects the user's overall health score.
 */
export default function WellnessTreeWidget({ healthScore = 75, className = '' }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ height: '280px' }}>
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-900 rounded-2xl" />

      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.2, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[3, 5, 3]} intensity={0.6} />
          <pointLight position={[-2, 2, 2]} intensity={0.3} color="#6366f1" />

          <WellnessTree3D healthScore={healthScore} />

          <EffectComposer>
            <Bloom luminanceThreshold={0.5} intensity={0.6} mipmapBlur />
          </EffectComposer>

          <Preload all />
        </Suspense>
      </Canvas>

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-bold text-sm">ðŸŒ³ Wellness Tree</h4>
            <p className="text-gray-400 text-xs mt-0.5">
              {healthScore >= 75 ? 'Flourishing!' : healthScore >= 50 ? 'Growing steadily' : 'Needs attention'}
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: healthScore >= 75 ? 'rgba(34,197,94,0.15)' : healthScore >= 50 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
              color: healthScore >= 75 ? '#22c55e' : healthScore >= 50 ? '#eab308' : '#ef4444',
            }}
          >
            Score: {healthScore}
          </div>
        </div>
      </div>
    </div>
  );
}
