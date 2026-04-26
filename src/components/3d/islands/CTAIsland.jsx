import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CTAIsland: Final island with a fully grown wellness tree,
 * particle celebration effect, and sign-up CTA with glowing portal.
 */

function WellnessTree() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Recursive branch generation (simplified L-system)
  function Branch({ pos, length, angle, depth, maxDepth }) {
    if (depth > maxDepth) return null;

    const endX = pos[0] + Math.sin(angle) * length;
    const endY = pos[1] + Math.cos(angle) * length;
    const mid = [(pos[0] + endX) / 2, (pos[1] + endY) / 2, pos[2]];
    const rot = -angle;

    const branchColor = depth < 2 ? '#8b4513' : '#228b22';
    const branchRadius = 0.08 * Math.pow(0.6, depth);

    return (
      <group>
        <mesh position={mid} rotation={[0, 0, rot]}>
          <cylinderGeometry args={[branchRadius * 0.7, branchRadius, length, 6]} />
          <meshStandardMaterial
            color={branchColor}
            emissive={branchColor}
            emissiveIntensity={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Leaves at branch tips */}
        {depth >= maxDepth - 1 && (
          <Float speed={3} rotationIntensity={0.3} floatIntensity={0.2}>
            <mesh position={[endX, endY, pos[2] + (Math.random() - 0.5) * 0.3]}>
              <sphereGeometry args={[0.12 + Math.random() * 0.08, 8, 8]} />
              <meshStandardMaterial
                color={Math.random() > 0.3 ? '#22c55e' : '#f472b6'}
                emissive={Math.random() > 0.3 ? '#22c55e' : '#f472b6'}
                emissiveIntensity={0.3}
                transparent
                opacity={0.8}
              />
            </mesh>
          </Float>
        )}

        {/* Child branches */}
        <Branch pos={[endX, endY, pos[2]]} length={length * 0.7} angle={angle - 0.5 + Math.random() * 0.3} depth={depth + 1} maxDepth={maxDepth} />
        <Branch pos={[endX, endY, pos[2]]} length={length * 0.65} angle={angle + 0.5 + Math.random() * 0.3} depth={depth + 1} maxDepth={maxDepth} />
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.15, 1.0, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* Branches */}
      <Branch pos={[0, 1.0, 0]} length={0.8} angle={0} depth={0} maxDepth={4} />
      <Branch pos={[0, 0.8, 0]} length={0.6} angle={0.8} depth={0} maxDepth={3} />
      <Branch pos={[0, 0.8, 0]} length={0.6} angle={-0.8} depth={0} maxDepth={3} />
    </group>
  );
}

function CelebrationParticles() {
  const pointsRef = useRef();
  const count = 100;

  const { positions, data } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const data = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 5 - 1;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      data.push({
        speed: 0.2 + Math.random() * 0.5,
        angle,
        radius,
      });
    }
    return { positions, data };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const d = data[i];
      posArray[i * 3 + 1] += d.speed * 0.005;
      if (posArray[i * 3 + 1] > 5) posArray[i * 3 + 1] = -1;

      const angle = d.angle + t * 0.1;
      posArray[i * 3] = Math.cos(angle) * d.radius;
      posArray[i * 3 + 2] = Math.sin(angle) * d.radius;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#fbbf24"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GlowingPortal() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, -2]} rotation={[0.3, 0, 0]}>
      <torusGeometry args={[1.5, 0.08, 16, 64]} />
      <meshStandardMaterial
        color="#818cf8"
        emissive="#818cf8"
        emissiveIntensity={0.8}
        metalness={0.8}
        roughness={0.1}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

export default function CTAIsland({ position = [0, 0, 0], onNavigate, isActive }) {
  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.5, 0.4, 48]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.4} roughness={0.6} transparent opacity={0.2} />
      </mesh>

      {/* Wellness tree - fully grown */}
      <WellnessTree />

      {/* Glowing portal behind CTA */}
      <GlowingPortal />

      {/* Celebration particles */}
      <CelebrationParticles />

      {/* CTA content */}
      <Html center position={[0, 0.2, 0]} distanceFactor={22}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
              style={{ width: '400px', pointerEvents: 'auto' }}
            >
              <div className="grid grid-cols-2 gap-4 w-full mb-2">
                {/* The Problem Section */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-red-500/5 backdrop-blur-xl rounded-[0.75rem] p-3 border border-red-500/20 text-left"
                >
                  <h3 className="text-[11px] font-black text-red-400 mb-2 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[7px]">âœ•</span>
                    The Problem
                  </h3>
                  <ul className="space-y-1.5">
                    {[
                      "Generic health advice",
                      "Fragmented data",
                      "Static 2D charts",
                      "No predictive insights"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-400 text-[8px]">
                        <span className="text-red-500/50">â€¢</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* How We're Different Section */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-emerald-500/5 backdrop-blur-xl rounded-[0.75rem] p-3 border border-emerald-500/20 text-left"
                >
                  <h3 className="text-[11px] font-black text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[7px]">âœ“</span>
                    Our Solution
                  </h3>
                  <ul className="space-y-1.5">
                    {[
                      "Immersive 3D visualization",
                      "Unified ecosystem",
                      "AI risk analysis",
                      "Direct expert access"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-200 text-[8px]">
                        <span className="text-emerald-500">â€¢</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Main CTA Section */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                  Ready to <span style={{
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>Evolve</span>?
                </h2>
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(129, 140, 248, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate?.('/signup')}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-sm rounded-lg shadow-2xl transition-all duration-500"
                  >
                    ðŸš€ Get Started Free
                  </motion.button>
                </div>
              </motion.div>

              {/* Footer / Contact Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6 pt-3 border-t border-white/10 w-full justify-center"
              >
                <div className="text-left">
                  <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Support</p>
                  <p className="text-gray-400 text-[9px] font-medium leading-none">support@aetherahealth.ai</p>
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Inquiries</p>
                  <p className="text-gray-400 text-[9px] font-medium leading-none">+1 (800) AETHERA-HEALTH</p>
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-gray-400 text-[9px] font-medium leading-none">Silicon Valley, CA</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>

      {/* Ambient lights */}
      <pointLight color="#22c55e" intensity={1} distance={10} position={[0, 3, 0]} />
      <pointLight color="#818cf8" intensity={0.6} distance={8} position={[0, 1, -2]} />
    </group>
  );
}
