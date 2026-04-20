import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

// Pulsating heart geometry (simplified using a sphere for now, we can replace with a heart model later)
function PulsatingHeart() {
  const meshRef = useRef();
  const pulse = useRef(0);

  useFrame((state, delta) => {
    pulse.current += delta * 0.5; // speed of pulse
    const scale = 1 + Math.sin(pulse.current) * 0.1; // pulse between 0.9 and 1.1
    meshRef.current.scale.set(scale, scale, scale);
    // slow rotation
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#ff6b6b" metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// Floating data points (like blood cells or particles)
function DataPoints() {
  const pointsRef = useRef();
  const count = 100;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // positions in a sphere
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    const radius = 2 + Math.random() * 3;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // colors - vary from red to pink
    colors[i * 3] = 0.8 + Math.random() * 0.2; // r
    colors[i * 3 + 1] = 0.2 + Math.random() * 0.4; // g
    colors[i * 3 + 2] = 0.4 + Math.random() * 0.4; // b
  }

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.005;
      pointsRef.current.rotation.x += 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferAttribute attach="position" array={positions} itemSize={3} />
      <bufferAttribute attach="color" array={colors} itemSize={3} />
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} />
    </points>
  );
}

// Gentle ambient light that pulses with the heart
function AmbientHeartLight() {
  const lightRef = useRef();
  const pulse = useRef(0);

  useFrame((state, delta) => {
    pulse.current += delta * 0.5;
    const intensity = 0.5 + Math.sin(pulse.current) * 0.3;
    lightRef.current.intensity = intensity;
  });

  return <pointLight ref={lightRef} position={[0, 1.5, 0]} intensity={0.5} distance={10} decay={2} />;
}

export default function Hero3D() {
  return (
    <>
      <AmbientHeartLight />
      <PulsatingHeart />
      <DataPoints />
      {/* HTML overlay for the hero content (text, buttons) */}
      <Html center>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center text-white text-shadow-lg"
          style={{ pointerEvents: 'auto' }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-red-500">
              VitalPulse
            </span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience your health journey in a new dimension. Track, visualize, and optimize your wellbeing with immersive 3D insights.
          </p>
          {/* We'll keep the buttons from the original Home.jsx for now, but we can make them 3D later */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              className="relative px-10 py-5 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold text-base rounded-xl hover:shadow-xl transition-all group overflow-hidden"
            >
              Get Started
            </button>
            <button
              className="relative px-10 py-5 border-2 border-pink-500/20 text-pink-400 hover:border-pink-500/40 hover:shadow-xl transition-all group overflow-hidden"
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </Html>
    </>
  );
} 
 
 
 
 
 
 
 
 
 
 
 

// minor tweak for clarity

// minor tweak for clarity
