import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import HeartModel from '../models/HeartModel';
import DNAHelix from '../models/DNAHelix';

/**
 * HeroIsland: Central floating island with pulsating heart, DNA helix,
 * orbiting blood cell particles, and the main hero text overlay.
 */

function FloatingPlatform({ position = [0, 0, 0], radius = 5, color = '#1e1b4b' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-0.1, 0, 0]} receiveShadow>
      <cylinderGeometry args={[radius, radius * 1.2, 0.5, 48]} />
      <meshStandardMaterial
        color={color}
        metalness={0.4}
        roughness={0.6}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function BloodCellParticles({ count = 200 }) {
  const pointsRef = useRef();

  const { positions, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const offsets = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 4;
      const y = (Math.random() - 0.5) * 4;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      offsets.push({
        angle,
        radius,
        y,
        speed: 0.2 + Math.random() * 0.5,
        ySpeed: (Math.random() - 0.5) * 0.2,
      });
    }
    return { positions, offsets };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const o = offsets[i];
      const angle = o.angle + t * o.speed;
      posArray[i * 3] = Math.cos(angle) * o.radius;
      posArray[i * 3 + 1] = o.y + Math.sin(t * o.ySpeed + i) * 0.5;
      posArray[i * 3 + 2] = Math.sin(angle) * o.radius;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ff6b6b"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroIsland({ position = [0, 0, 0], onNavigate, isActive }) {
  return (
    <group position={position}>
      {/* Floating platform base */}
      <FloatingPlatform position={[0, -2.5, 0]} radius={6} />

      {/* Pulsating Heart at center */}
      <HeartModel
        position={[0, 0.5, 0]}
        scale={1.2}
        interactive={false}
      />

      {/* DNA Helix spiraling beside heart */}
      <DNAHelix position={[3, 0, -1]} scale={0.7} rotationSpeed={0.2} />
      <DNAHelix position={[-3, 0, -1]} scale={0.5} rotationSpeed={-0.15} />

      {/* Orbiting blood cell particles */}
      <BloodCellParticles count={300} />

      {/* Ambient lights */}
      <pointLight color="#ff6b6b" intensity={1} distance={12} decay={2} position={[0, 2, 0]} />
      <pointLight color="#818cf8" intensity={0.6} distance={8} decay={2} position={[3, 1, 2]} />

      {/* Hero text overlay */}
      <Html center position={[0, 0, 4]} distanceFactor={10}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center select-none"
              style={{ width: '800px', pointerEvents: 'auto' }}
            >

              <h1
                className="text-6xl sm:text-7xl font-black mb-8 leading-[1.1] tracking-tight"
                style={{
                  background: 'linear-gradient(to bottom right, #ffffff 30%, #a5b4fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(129,140,248,0.2))',
                }}
              >
                Master Your <br />
                <span style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Wellness Journey
                </span>
              </h1>

              <p className="text-gray-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed font-medium">
                Track, visualize, and optimize your wellbeing with immersive 3D insights powered by AI.
              </p>

              <div className="flex justify-center gap-6 mb-16">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('/signup')}
                  className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-lg rounded-2xl transition-all duration-300 overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">Get Started Free</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('/signin')}
                  className="px-10 py-5 border-2 border-white/10 text-white font-bold text-lg rounded-2xl backdrop-blur-xl transition-all duration-300"
                >
                  Sign In
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  );
}
 
 
