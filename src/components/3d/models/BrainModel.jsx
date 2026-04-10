import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Procedural Brain Model using deformed sphere with surface detail.
 * Features: neural activity sparks traveling along surface, thought particles.
 */
function createBrainGeometry() {
  const geometry = new THREE.SphereGeometry(1, 48, 48);
  const pos = geometry.attributes.position;

  // Deform sphere into brain-like shape
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Flatten slightly on sides, elongate front-back
    let nx = x * 0.85;
    let ny = y * 1.05;
    let nz = z * 1.0;

    // Central fissure (groove down the middle)
    const fissure = Math.exp(-x * x * 20) * 0.08;
    ny -= fissure;

    // Cortex wrinkles using sine waves
    const wrinkle1 = Math.sin(x * 8 + y * 3) * 0.03;
    const wrinkle2 = Math.sin(y * 6 + z * 4) * 0.025;
    const wrinkle3 = Math.sin(z * 7 + x * 5) * 0.02;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    const scale = 1 + wrinkle1 + wrinkle2 + wrinkle3;

    pos.setXYZ(i, nx * scale, ny * scale, nz * scale);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function NeuralSparks() {
  const pointsRef = useRef();
  const count = 60;

  const { positions, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const offsets = [];

    for (let i = 0; i < count; i++) {
      // Distribute on brain surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.05 + Math.random() * 0.1;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 0.85;
      positions[i * 3 + 1] = r * Math.cos(phi) * 1.05;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      offsets.push({
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        radius: r,
        theta: theta,
        phi: phi,
      });
    }
    return { positions, offsets };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const o = offsets[i];
      const angle = o.theta + t * o.speed * 0.2;
      const r = o.radius + Math.sin(t * o.speed + o.phase) * 0.05;

      posArray[i * 3] = r * Math.sin(o.phi) * Math.cos(angle) * 0.85;
      posArray[i * 3 + 1] = r * Math.cos(o.phi) * 1.05;
      posArray[i * 3 + 2] = r * Math.sin(o.phi) * Math.sin(angle);
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#c084fc"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function BrainModel({
  position = [0, 0, 0],
  scale = 1.0,
  healthData = null,
  onClick,
  interactive = true,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const brainGeometry = useMemo(() => createBrainGeometry(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle floating and rotation
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.08;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(!clicked);
    if (onClick) onClick(healthData);
  };

  return (
    <group position={position} scale={scale}>
      <mesh
        ref={meshRef}
        geometry={brainGeometry}
        onPointerOver={(e) => { e.stopPropagation(); interactive && setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); interactive && setHovered(false); }}
        onClick={interactive ? handleClick : undefined}
        castShadow
      >
        <meshStandardMaterial
          color={hovered ? '#e9d5ff' : '#d8b4fe'}
          emissive="#a855f7"
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.15}
          roughness={0.65}
        />
      </mesh>

      {/* Brain stem */}
      <mesh position={[0, -0.85, 0.15]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.5, 12]} />
        <meshStandardMaterial
          color="#d8b4fe"
          emissive="#a855f7"
          emissiveIntensity={0.15}
          metalness={0.15}
          roughness={0.6}
        />
      </mesh>

      {/* Neural sparks */}
      <NeuralSparks />

      {/* Inner glow */}
      <pointLight color="#a855f7" intensity={hovered ? 2 : 0.6} distance={5} decay={2} />

      <Html distanceFactor={8} position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
        <AnimatePresence>
          {interactive && (hovered || clicked) && healthData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30 shadow-2xl shadow-purple-500/20 min-w-[200px]"
              style={{ pointerEvents: 'none' }}
            >
              <h4 className="text-purple-400 font-bold text-sm mb-2">🧠 Mental Health</h4>
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
 
 
 
 
 
 
