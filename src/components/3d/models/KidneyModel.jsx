import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Procedural Kidney Model using ExtrudeGeometry with bean curve.
 * Features: filtration particle animation, interactive health data.
 */
function createKidneyShape() {
  const shape = new THREE.Shape();

  // Bean/kidney curve
  shape.moveTo(0, 0.5);
  shape.bezierCurveTo(0.15, 0.65, 0.45, 0.7, 0.5, 0.45);
  shape.bezierCurveTo(0.55, 0.2, 0.5, -0.1, 0.45, -0.3);
  shape.bezierCurveTo(0.4, -0.5, 0.2, -0.65, 0, -0.55);
  // Hilum (indentation)
  shape.bezierCurveTo(-0.1, -0.45, -0.15, -0.2, -0.1, 0);
  shape.bezierCurveTo(-0.05, 0.15, -0.1, 0.3, -0.05, 0.4);
  shape.bezierCurveTo(0, 0.5, 0, 0.5, 0, 0.5);

  return shape;
}

function FiltrationParticles() {
  const pointsRef = useRef();
  const count = 25;

  const { positions, data } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const data = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * 0.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 2] = Math.sin(angle) * 0.15;
      data.push({
        angle: angle,
        speed: 0.5 + Math.random() * 1.0,
        radius: 0.15 + Math.random() * 0.15,
        ySpeed: 0.2 + Math.random() * 0.3,
      });
    }
    return { positions, data };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const d = data[i];
      const angle = d.angle + t * d.speed;
      posArray[i * 3] = Math.cos(angle) * d.radius;
      posArray[i * 3 + 1] += d.ySpeed * delta * (i % 2 === 0 ? 1 : -1);
      posArray[i * 3 + 2] = Math.sin(angle) * d.radius;

      if (Math.abs(posArray[i * 3 + 1]) > 0.5) {
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#34d399" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function KidneyModel({
  position = [0, 0, 0],
  scale = 1.5,
  healthData = null,
  onClick,
  interactive = true,
  mirror = false,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const kidneyGeometry = useMemo(() => {
    const shape = createKidneyShape();
    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    if (mirror) geo.scale(-1, 1, 1);
    geo.computeVertexNormals();
    return geo;
  }, [mirror]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.1 + (mirror ? Math.PI : 0);
    meshRef.current.position.y = position[1] + Math.sin(t * 0.4 + (mirror ? 1 : 0)) * 0.06;
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
        geometry={kidneyGeometry}
        onPointerOver={(e) => { e.stopPropagation(); interactive && setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); interactive && setHovered(false); }}
        onClick={interactive ? handleClick : undefined}
        castShadow
      >
        <meshStandardMaterial
          color={hovered ? '#6ee7b7' : '#34d399'}
          emissive="#10b981"
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.25}
          roughness={0.45}
        />
      </mesh>

      <FiltrationParticles />
      <pointLight color="#34d399" intensity={hovered ? 1.5 : 0.5} distance={4} decay={2} />

      <Html distanceFactor={8} position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
        <AnimatePresence>
          {interactive && (hovered || clicked) && healthData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 min-w-[200px]"
              style={{ pointerEvents: 'none' }}
            >
              <h4 className="text-emerald-400 font-bold text-sm mb-2">💧 Kidney Health</h4>
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
