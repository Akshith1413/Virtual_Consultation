import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import HeartModel from '../models/HeartModel';
import LungsModel from '../models/LungsModel';
import BrainModel from '../models/BrainModel';
import StomachModel from '../models/StomachModel';
import KidneyModel from '../models/KidneyModel';

/**
 * BodyIsland: Transparent human body silhouette with floating organs.
 * Each organ is interactive — hover highlights, click shows health data.
 * Particle blood flow connecting all organs.
 */

function BodySilhouette() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    }
  });

  // Simple body outline using a capsule-like shape
  return (
    <group ref={meshRef}>
      {/* Head */}
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.06} wireframe />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 12]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.05} wireframe />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.6, 2.2, 8, 16]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.04} wireframe />
      </mesh>
      {/* Left arm hint */}
      <mesh position={[-1.0, 1.2, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.12, 1.5, 4, 8]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.03} wireframe />
      </mesh>
      {/* Right arm hint */}
      <mesh position={[1.0, 1.2, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.12, 1.5, 4, 8]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.03} wireframe />
      </mesh>
    </group>
  );
}

function BloodFlowConnections() {
  const pointsRef = useRef();
  const count = 80;

  const { positions, data } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const data = [];
    // Blood flow paths between organ positions
    const paths = [
      { from: [0, 1.5, 0], to: [0, 0.5, 0.3] },   // brain → heart
      { from: [0, 0.5, 0.3], to: [-0.4, 0.5, 0.2] }, // heart → left lung
      { from: [0, 0.5, 0.3], to: [0.4, 0.5, 0.2] },  // heart → right lung
      { from: [0, 0.5, 0.3], to: [0, -0.5, 0.2] },   // heart → stomach
      { from: [0, -0.5, 0.2], to: [-0.5, -1.0, 0.1] }, // stomach → left kidney
      { from: [0, -0.5, 0.2], to: [0.5, -1.0, 0.1] },  // stomach → right kidney
    ];

    for (let i = 0; i < count; i++) {
      const pathIndex = i % paths.length;
      const path = paths[pathIndex];
      const t = Math.random();

      positions[i * 3] = path.from[0] + (path.to[0] - path.from[0]) * t;
      positions[i * 3 + 1] = path.from[1] + (path.to[1] - path.from[1]) * t;
      positions[i * 3 + 2] = path.from[2] + (path.to[2] - path.from[2]) * t;

      data.push({ pathIndex, t, speed: 0.3 + Math.random() * 0.5 });
    }
    return { positions, data };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    const paths = [
      { from: [0, 1.5, 0], to: [0, 0.5, 0.3] },
      { from: [0, 0.5, 0.3], to: [-0.4, 0.5, 0.2] },
      { from: [0, 0.5, 0.3], to: [0.4, 0.5, 0.2] },
      { from: [0, 0.5, 0.3], to: [0, -0.5, 0.2] },
      { from: [0, -0.5, 0.2], to: [-0.5, -1.0, 0.1] },
      { from: [0, -0.5, 0.2], to: [0.5, -1.0, 0.1] },
    ];

    for (let i = 0; i < count; i++) {
      const d = data[i];
      d.t += d.speed * delta;
      if (d.t > 1) d.t = 0;

      const path = paths[d.pathIndex];
      posArray[i * 3] = path.from[0] + (path.to[0] - path.from[0]) * d.t;
      posArray[i * 3 + 1] = path.from[1] + (path.to[1] - path.from[1]) * d.t;
      posArray[i * 3 + 2] = path.from[2] + (path.to[2] - path.from[2]) * d.t;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ef4444" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

export default function BodyIsland({ position = [0, 0, 0], isActive }) {
  const sampleData = {
    heart: { 'Heart Rate': '72 bpm', 'Blood Pressure': '120/80', 'Status': 'Healthy' },
    lungs: { 'Respiratory Rate': '16/min', 'SpO2': '98%', 'Status': 'Normal' },
    brain: { 'Mood': '8/10', 'Sleep Quality': '7.5h', 'Stress': 'Low' },
    stomach: { 'Last Meal': '2h ago', 'Calories Today': '1,520', 'Digestion': 'Active' },
    kidney: { 'Hydration': '2.1L / 3L', 'Status': 'Good', 'Filtration': 'Normal' },
  };

  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, -2.5, 0]} receiveShadow>
        <cylinderGeometry args={[5, 5.5, 0.4, 48]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.4} roughness={0.6} transparent opacity={0.2} />
      </mesh>

      {/* Scaled and shifted body container */}
      <group scale={1.6} position={[0, -1.0, 0]}>
        {/* Body silhouette */}
        <BodySilhouette />

        {/* Organs positioned anatomically */}
        <BrainModel position={[0, 2.15, 0.1]} scale={0.4} healthData={sampleData.brain} />
        <HeartModel position={[-0.2, 0.65, 0.5]} scale={0.4} healthData={sampleData.heart} />
        <LungsModel position={[0, 0.9, 0.1]} scale={0.6} healthData={sampleData.lungs} />
        <StomachModel position={[0.1, -0.2, 0.2]} scale={0.8} healthData={sampleData.stomach} />
        <KidneyModel position={[-0.5, -0.7, 0.1]} scale={0.7} healthData={sampleData.kidney} />
        <KidneyModel position={[0.5, -0.7, 0.1]} scale={0.7} healthData={sampleData.kidney} mirror />

        {/* Blood flow connections */}
        <BloodFlowConnections />
      </group>

      {/* Title */}
      <Html center position={[0, 4.8, 0]} distanceFactor={12}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
              style={{ pointerEvents: 'none', width: '600px' }}
            >
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                Your Body, <span style={{
                  background: 'linear-gradient(135deg, #ef4444, #f87171)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Visualized</span>
              </h2>
              <p className="text-red-400/60 text-sm font-medium uppercase tracking-widest">
                Interact with organs to see live health metrics
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>

      {/* Ambient */}
      <pointLight color="#6366f1" intensity={0.6} distance={10} position={[0, 3, 2]} />
    </group>
  );
}
 
 
 
 
 
 
