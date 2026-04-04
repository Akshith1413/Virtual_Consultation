import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Procedural Stomach Model using LatheGeometry with custom profile.
 * Features: digestion animation with internal particle flow.
 */
function createStomachGeometry() {
  const points = [];
  const segments = 30;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * 2.2 - 1.1;

    // Stomach J-shape profile
    let r;
    if (t < 0.1) {
      // Esophageal opening (narrow top)
      r = 0.12 + t * 1.2;
    } else if (t < 0.4) {
      // Fundus (upper bulge)
      r = 0.24 + Math.sin((t - 0.1) / 0.3 * Math.PI) * 0.35;
    } else if (t < 0.7) {
      // Body (middle)
      r = 0.45 + Math.sin((t - 0.4) / 0.3 * Math.PI * 0.5) * 0.12;
    } else if (t < 0.9) {
      // Antrum (narrowing)
      const nt = (t - 0.7) / 0.2;
      r = 0.45 - nt * 0.25;
    } else {
      // Pylorus (narrow exit)
      const nt = (t - 0.9) / 0.1;
      r = 0.2 - nt * 0.08;
    }

    r = Math.max(r, 0.05);
    points.push(new THREE.Vector2(r, y));
  }

  const geometry = new THREE.LatheGeometry(points, 28);
  geometry.computeVertexNormals();
  return geometry;
}

function DigestionParticles() {
  const pointsRef = useRef();
  const count = 30;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.3;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = 0.5 - Math.random() * 1.8;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      speeds.push(0.1 + Math.random() * 0.3);
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] -= speeds[i] * delta;
      // Spiral motion
      const angle = state.clock.elapsedTime * speeds[i] * 2 + i;
      posArray[i * 3] = Math.cos(angle) * 0.2;
      posArray[i * 3 + 2] = Math.sin(angle) * 0.2;

      if (posArray[i * 3 + 1] < -1.1) {
        posArray[i * 3 + 1] = 0.8;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#fbbf24" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function StomachModel({
  position = [0, 0, 0],
  scale = 1.0,
  healthData = null,
  onClick,
  interactive = true,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const stomachGeometry = useMemo(() => createStomachGeometry(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Peristalsis-like subtle contraction
    const squeeze = 1 + Math.sin(t * 0.6) * 0.03;
    meshRef.current.scale.set(scale * squeeze, scale, scale * squeeze);
    meshRef.current.rotation.y = t * 0.12;
    meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(!clicked);
    if (onClick) onClick(healthData);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={stomachGeometry}
        rotation={[0, 0, 0.15]}
        onPointerOver={(e) => { e.stopPropagation(); interactive && setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); interactive && setHovered(false); }}
        onClick={interactive ? handleClick : undefined}
        castShadow
      >
        <meshStandardMaterial
          color={hovered ? '#fde68a' : '#fbbf24'}
          emissive="#f59e0b"
          emissiveIntensity={hovered ? 0.4 : 0.15}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      <DigestionParticles />
      <pointLight color="#fbbf24" intensity={hovered ? 1.5 : 0.5} distance={4} decay={2} />

      <Html distanceFactor={8} position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
        <AnimatePresence>
          {interactive && (hovered || clicked) && healthData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/30 shadow-2xl shadow-amber-500/20 min-w-[200px]"
              style={{ pointerEvents: 'none' }}
            >
              <h4 className="text-amber-400 font-bold text-sm mb-2">ðŸ½ï¸ Digestion</h4>
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
 
 
 
 
 
 
 
 
 


// minor tweak for clarity
