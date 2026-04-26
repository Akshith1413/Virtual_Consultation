import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TestimonialsIsland: Orbiting glass panels containing testimonial cards.
 */

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Fitness Enthusiast', text: 'Tracking my health has never been this immersive. The 3D visualizations make data feel alive.', avatar: '👩‍⚕️' },
  { name: 'Dr. Patel', role: 'Cardiologist', text: 'I recommend this to my patients. The organ-level insights are remarkably intuitive.', avatar: '👨‍⚕' },
  { name: 'Marcus J.', role: 'Working Professional', text: 'Finally a health app that makes me want to check my metrics every day. Beautiful and functional.', avatar: '👨‍💼' },
  { name: 'Lisa Chen', role: 'Nutritionist', text: 'The meal tracking and nutrition insights are comprehensive. My clients love the visual approach.', avatar: '👩‍🍳' },
];

function TestimonialCard({ testimonial, index, total, isActive }) {
  const groupRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 4;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const currentAngle = angle + t * 0.15;

    groupRef.current.position.x = Math.cos(currentAngle) * radius;
    groupRef.current.position.z = Math.sin(currentAngle) * radius;
    groupRef.current.position.y = Math.sin(t * 0.3 + index) * 0.3;

    // Face outward
    groupRef.current.rotation.y = -currentAngle + Math.PI / 2;
  });

  return (
    <group ref={groupRef}>
      {/* Glass panel */}
      <mesh>
        <planeGeometry args={[2.5, 1.8]} />
        <meshStandardMaterial
          color="#312e81"
          metalness={0.6}
          roughness={0.2}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Content overlay */}
      <Html position={[0, 0, 0.05]} center distanceFactor={8} transform>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-indigo-500/20 shadow-xl"
              style={{ width: '240px', pointerEvents: 'none' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{testimonial.avatar}</span>
                <div>
                  <p className="text-white font-bold text-sm">{testimonial.name}</p>
                  <p className="text-indigo-400 text-[10px]">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed italic">"{testimonial.text}"</p>
              <div className="mt-2 flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className="text-yellow-400 text-xs">★</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  );
}

export default function TestimonialsIsland({ position = [0, 0, 0], isActive }) {
  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, -1.5, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.5, 0.3, 48]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.4} roughness={0.6} transparent opacity={0.2} />
      </mesh>

      {/* Orbiting testimonial cards */}
      <group position={[0, 0.67, 0]}>
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={i} testimonial={t} index={i} total={TESTIMONIALS.length} isActive={isActive} />
        ))}
      </group>

      {/* Title */}
      <Html center position={[0, 4, 0]} distanceFactor={12}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="text-center"
              style={{ pointerEvents: 'none', width: '460px' }}
            >
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                Trusted by <span style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Thousands</span>
              </h2>
              <p className="text-yellow-500/50 text-sm font-medium uppercase tracking-widest">
                Real stories from our wellness community
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>

      <pointLight color="#6366f1" intensity={0.8} distance={10} position={[0, 2, 0]} />
    </group>
  );
}
