import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import HeartModel from '../models/HeartModel';
import BrainModel from '../models/BrainModel';
import LungsModel from '../models/LungsModel';
import StomachModel from '../models/StomachModel';
import KidneyModel from '../models/KidneyModel';

/**
 * OrganViewerWidget: Compact 3D organ viewer for the dashboard.
 * Shows floating organs with health status via glow colors.
 */
export default function OrganViewerWidget({
  healthData = {},
  onOrganClick,
  className = '',
}) {
  const defaultData = {
    heart: { 'Heart Rate': '72 bpm', Status: 'Healthy' },
    brain: { Mood: '8/10', Sleep: '7.5h' },
    lungs: { SpO2: '98%', Status: 'Normal' },
    stomach: { 'Last Meal': '2h ago', Calories: '1,520' },
    kidney: { Hydration: '2.1L / 3L', Status: 'Good' },
    ...healthData,
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ height: '280px' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900 rounded-2xl" />

      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.5, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[3, 5, 3]} intensity={0.5} />

          {/* Organs arranged in a spread layout */}
          <HeartModel position={[0, 0.3, 0]} scale={0.6} healthData={defaultData.heart} onClick={() => onOrganClick?.('heart')} />
          <BrainModel position={[0, 1.5, -0.5]} scale={0.3} healthData={defaultData.brain} onClick={() => onOrganClick?.('brain')} />
          <LungsModel position={[-1.2, 0.3, -0.3]} scale={0.4} healthData={defaultData.lungs} onClick={() => onOrganClick?.('lungs')} />
          <StomachModel position={[1.2, -0.3, -0.2]} scale={0.35} healthData={defaultData.stomach} onClick={() => onOrganClick?.('stomach')} />
          <KidneyModel position={[-0.8, -0.8, 0]} scale={0.4} healthData={defaultData.kidney} onClick={() => onOrganClick?.('kidney')} />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
          />

          <EffectComposer>
            <Bloom luminanceThreshold={0.5} intensity={0.5} mipmapBlur />
          </EffectComposer>

          <Preload all />
        </Suspense>
      </Canvas>

      {/* Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-bold text-sm">🫀 Body Overview</h4>
            <p className="text-gray-400 text-xs mt-0.5">Hover organs for metrics • Drag to rotate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
 
 
 
 
 
 
 
 
 
 
 
 
