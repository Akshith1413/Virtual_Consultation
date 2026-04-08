import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/**
 * HydrationWidget: 3D water container with fluid simulation visual.
 * Water level reflects daily intake, pouring animation when logging.
 */

function WaterContainer({ fillPercent = 50 }) {
  const waterRef = useRef();
  const containerRef = useRef();
  const bubblesRef = useRef();
  const bubbleCount = 20;

  const fillHeight = (fillPercent / 100) * 2.0; // Max height 2.0

  // Bubbles
  const { bubblePositions, bubbleData } = useMemo(() => {
    const positions = new Float32Array(bubbleCount * 3);
    const data = [];
    for (let i = 0; i < bubbleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = -1 + Math.random() * fillHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      data.push({ speed: 0.2 + Math.random() * 0.4, sway: Math.random() * Math.PI * 2 });
    }
    return { bubblePositions: positions, bubbleData: data };
  }, [fillHeight]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Water surface wave
    if (waterRef.current) {
      waterRef.current.position.y = -1 + fillHeight / 2;
      waterRef.current.scale.y = Math.max(fillHeight, 0.01);

      // Shimmer
      waterRef.current.material.emissiveIntensity = 0.15 + Math.sin(t * 2) * 0.05;
    }

    // Animate bubbles
    if (bubblesRef.current) {
      const posArray = bubblesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < bubbleCount; i++) {
        const d = bubbleData[i];
        posArray[i * 3 + 1] += d.speed * 0.008;
        posArray[i * 3] += Math.sin(t * d.speed + d.sway) * 0.002;

        if (posArray[i * 3 + 1] > -1 + fillHeight) {
          posArray[i * 3 + 1] = -1;
          posArray[i * 3] = (Math.random() - 0.5) * 0.5;
        }
      }
      bubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Gentle container rotation
    if (containerRef.current) {
      containerRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={containerRef}>
      {/* Glass container */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.5, 2.2, 24, 1, true]} />
        <meshStandardMaterial
          color="#94a3b8"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Water level */}
      <mesh ref={waterRef} position={[0, -1 + fillHeight / 2, 0]}>
        <cylinderGeometry args={[0.55, 0.45, 1, 24]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#0ea5e9"
          emissiveIntensity={0.15}
          transparent
          opacity={0.6}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Water surface (top cap) */}
      <mesh position={[0, -1 + fillHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#3b82f6"
          emissiveIntensity={0.2}
          transparent
          opacity={0.5}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Bubbles */}
      <points ref={bubblesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={bubblePositions} count={bubbleCount} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#93c5fd"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Bottom cap */}
      <mesh position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Measurement lines */}
      {[25, 50, 75].map((pct) => (
        <mesh key={pct} position={[0.6, -1 + (pct / 100) * 2, 0]}>
          <boxGeometry args={[0.08, 0.005, 0.005]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Ambient water glow */}
      <pointLight color="#3b82f6" intensity={0.5 + fillPercent * 0.01} distance={4} decay={2} position={[0, 0, 0.5]} />
    </group>
  );
}

export default function HydrationWidget({
  totalMl = 0,
  goalMl = 3000,
  onAddWater,
  className = '',
}) {
  const fillPercent = Math.min((totalMl / goalMl) * 100, 100);

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ height: '280px' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950/50 to-slate-900 rounded-2xl" />

      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[2, 4, 3]} intensity={0.5} />

          <WaterContainer fillPercent={fillPercent} />

          <EffectComposer>
            <Bloom luminanceThreshold={0.5} intensity={0.4} mipmapBlur />
          </EffectComposer>

          <Preload all />
        </Suspense>
      </Canvas>

      {/* Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-bold text-sm">💧 Hydration</h4>
            <p className="text-blue-400 text-xs font-medium mt-0.5">
              {(totalMl / 1000).toFixed(1)}L / {(goalMl / 1000).toFixed(1)}L
            </p>
          </div>
          {onAddWater && (
            <div className="flex gap-2">
              {[250, 500].map((ml) => (
                <button
                  key={ml}
                  onClick={() => onAddWater(ml)}
                  className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/20 hover:bg-blue-600/30 transition-all"
                >
                  +{ml}ml
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
 
