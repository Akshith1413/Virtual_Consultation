import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Procedural Heart Model using ExtrudeGeometry with a heart-shaped curve.
 * Features: pulsating heartbeat animation (lub-dub), emissive glow on hover,
 * click to reveal health metrics.
 */
function HeartShape() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;

    shape.moveTo(x, y + 0.5);
    
    // Left side of heart
    shape.bezierCurveTo(x, y + 0.7, x - 0.12, y + 1.0, x - 0.35, y + 1.0);
    shape.bezierCurveTo(x - 0.7, y + 1.0, x - 0.7, y + 0.6, x - 0.7, y + 0.6);
    shape.bezierCurveTo(x - 0.7, y + 0.35, x - 0.5, y + 0.05, x, y - 0.5);
    
    // Right side of heart
    shape.bezierCurveTo(x + 0.5, y + 0.05, x + 0.7, y + 0.35, x + 0.7, y + 0.6);
    shape.bezierCurveTo(x + 0.7, y + 0.6, x + 0.7, y + 1.0, x + 0.35, y + 1.0);
    shape.bezierCurveTo(x + 0.12, y + 1.0, x, y + 0.7, x, y + 0.5);

    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

export default function HeartModel({ 
  position = [0, 0, 0], 
  scale = 1.5,
  healthData = null, 
  onClick,
  interactive = true 
}) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const heartGeometry = HeartShape();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Heartbeat pattern: two quick beats then pause (lub-dub)
    const cycle = t * 1.2;
    const beat1 = Math.pow(Math.max(Math.sin(cycle * 4), 0), 12);
    const beat2 = Math.pow(Math.max(Math.sin(cycle * 4 - 0.8), 0), 12);
    const pulse = 1 + (beat1 * 0.12 + beat2 * 0.07);

    meshRef.current.scale.setScalar(scale * pulse);
    meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;

    // Glow effect
    if (glowRef.current) {
      glowRef.current.scale.setScalar(scale * pulse * 1.15);
      glowRef.current.material.opacity = 0.08 + beat1 * 0.12 + (hovered ? 0.1 : 0);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(!clicked);
    if (onClick) onClick(healthData);
  };

  return (
    <group position={position}>
      {/* Main heart mesh */}
      <mesh
        ref={meshRef}
        geometry={heartGeometry}
        onPointerOver={(e) => { e.stopPropagation(); interactive && setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); interactive && setHovered(false); }}
        onClick={interactive ? handleClick : undefined}
        castShadow
      >
        <meshStandardMaterial
          color={hovered ? '#ff4757' : '#e74c3c'}
          emissive="#ff6b6b"
          emissiveIntensity={hovered ? 0.6 : 0.3}
          metalness={0.3}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer glow mesh */}
      <mesh ref={glowRef} geometry={heartGeometry}>
        <meshBasicMaterial
          color="#ff6b6b"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Pulsating point light */}
      <pointLight color="#ff6b6b" intensity={hovered ? 2 : 0.8} distance={6} decay={2} />

      {/* Health data tooltip */}
      <Html distanceFactor={8} position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
        <AnimatePresence>
          {interactive && (hovered || clicked) && healthData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-red-500/30 shadow-2xl shadow-red-500/20 min-w-[200px]"
              style={{ pointerEvents: 'none' }}
            >
              <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                ❤️ Heart Health
              </h4>
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
 
 
 
 
 
 
 
