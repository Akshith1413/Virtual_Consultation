import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Procedural Lungs Model using LatheGeometry with mirrored profiles.
 * Features: breathing expand/contract animation, oxygen particle streams.
 */
function createLungGeometry(mirror = false) {
  const points = [];
  const segments = 20;
  
  // Lung profile curve — organic lobe shape
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * 2.0 - 1.0; // -1 to 1
    
    // Organic lung profile with lobes
    let r = 0.4 + 0.25 * Math.sin(t * Math.PI);
    r += 0.08 * Math.sin(t * Math.PI * 3); // Upper lobe bump
    r += 0.05 * Math.sin(t * Math.PI * 5); // Lower lobe detail
    
    // Taper at top and bottom
    r *= Math.sin(t * Math.PI);
    r = Math.max(r, 0.02);
    
    points.push(new THREE.Vector2(r, y));
  }
  
  const geometry = new THREE.LatheGeometry(points, 24);
  if (mirror) {
    geometry.scale(-1, 1, 1);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function OxygenParticles({ side = 'left' }) {
  const pointsRef = useRef();
  const count = 40;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const offsetX = side === 'left' ? -0.5 : 0.5;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = offsetX + (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      velocities.push({
        y: 0.3 + Math.random() * 0.5,
        x: (Math.random() - 0.5) * 0.1,
      });
    }
    return { positions, velocities };
  }, [side]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    const offsetX = side === 'left' ? -0.5 : 0.5;

    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] += velocities[i].y * delta;
      posArray[i * 3] += velocities[i].x * delta;

      // Reset particles that go too high
      if (posArray[i * 3 + 1] > 1.0) {
        posArray[i * 3] = offsetX + (Math.random() - 0.5) * 0.6;
        posArray[i * 3 + 1] = -1.0;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#60a5fa" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function LungsModel({
  position = [0, 0, 0],
  scale = 1.2,
  healthData = null,
  onClick,
  interactive = true,
}) {
  const groupRef = useRef();
  const leftRef = useRef();
  const rightRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const leftLung = useMemo(() => createLungGeometry(false), []);
  const rightLung = useMemo(() => createLungGeometry(true), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Breathing animation
    const breath = Math.sin(t * 0.8) * 0.06;
    if (leftRef.current) {
      leftRef.current.scale.set(1 + breath, 1 + breath * 0.3, 1 + breath);
    }
    if (rightRef.current) {
      rightRef.current.scale.set(1 + breath, 1 + breath * 0.3, 1 + breath);
    }

    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(!clicked);
    if (onClick) onClick(healthData);
  };

  const lungMaterial = (
    <meshStandardMaterial
      color={hovered ? '#93c5fd' : '#60a5fa'}
      emissive="#3b82f6"
      emissiveIntensity={hovered ? 0.4 : 0.15}
      metalness={0.2}
      roughness={0.5}
      transparent
      opacity={0.85}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); interactive && setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); interactive && setHovered(false); }}
      onClick={interactive ? handleClick : undefined}
    >
      {/* Left lung */}
      <mesh ref={leftRef} geometry={leftLung} position={[-0.55, 0, 0]}>
        {lungMaterial}
      </mesh>

      {/* Right lung */}
      <mesh ref={rightRef} geometry={rightLung} position={[0.55, 0, 0]}>
        <meshStandardMaterial
          color={hovered ? '#93c5fd' : '#60a5fa'}
          emissive="#3b82f6"
          emissiveIntensity={hovered ? 0.4 : 0.15}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Trachea */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.6, 12]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.2} metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Bronchi */}
      <mesh position={[-0.2, 0.55, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.03, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.2, 0.55, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.03, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.2} />
      </mesh>

      {/* Oxygen particles */}
      <OxygenParticles side="left" />
      <OxygenParticles side="right" />

      <pointLight color="#60a5fa" intensity={hovered ? 1.5 : 0.5} distance={5} decay={2} />

      <Html distanceFactor={8} position={[0, 1.8, 0]} center zIndexRange={[100, 0]}>
        <AnimatePresence>
          {interactive && (hovered || clicked) && healthData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30 shadow-2xl shadow-blue-500/20 min-w-[200px]"
              style={{ pointerEvents: 'none' }}
            >
              <h4 className="text-blue-400 font-bold text-sm mb-2">🫁 Respiratory</h4>
              {Object.entries(healthData).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs py-1 border-b border-slate-700/50 last:border-0">
                  <span className="text-gray-400 capitalize">{key}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  );
}
 
 
