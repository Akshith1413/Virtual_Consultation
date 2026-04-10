import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  { id: 'ai-hub', title: 'AI Health Center', desc: 'Symptom checker, risk analysis & predictive health insights.', color: '#6366f1', icon: '🧠' },
  { id: 'body-insights', title: '3D Body Insights', desc: 'Interactive anatomical explorer & organ-specific vitals.', color: '#06b6d4', icon: '👤' },
  { id: 'nutrition', title: 'Nutrition Engine', desc: 'USDA food search, macro tracking & smart meal planning.', color: '#10b981', icon: '🥗' },
  { id: 'consult', title: 'Virtual Consultation', desc: 'Secure chat, video & voice calls with medical experts.', color: '#a855f7', icon: '📹' },
  { id: 'supplements', title: 'Smart Supplements', desc: 'Intake logging, interaction checks & supplement management.', color: '#d946ef', icon: '💊' },
  { id: 'dashboard', title: 'Health Dashboard', desc: 'Comprehensive daily overview with live fitness metrics.', color: '#3b82f6', icon: '📊' },
  { id: 'community', title: 'Community Hub', desc: 'Expert-led health groups, daily tips & peer support.', color: '#14b8a6', icon: '👥' },
  { id: 'records', title: 'Medical Records', desc: 'Secure storage for reports, history & digital prescriptions.', color: '#f59e0b', icon: '📂' },
];

const CRYSTAL_POSITIONS = [
  [-5.6, -0.2, 5.8],  // Left near foreground
  [5.6, -0.2, 5.8],   // Right near foreground
  [-2.2, -0.2, 7.2],  // Bottom left-center 
  [2.2, -0.2, 7.2],   // Bottom right-center
];

function CrystalPedestal({ feature, index, position, onSelect, persistent }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Float up when hovered
    const targetY = hovered ? 1.0 : 0;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.08;

    // Gentle spin
    meshRef.current.rotation.y = t * 0.3 + index;
  });

  return (
    <group position={position}>
      {/* Crystal pedestal */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect?.(feature); }}
        castShadow
      >
        {/* Base */}
        <cylinderGeometry args={[0.5, 0.7, 0.3, 6]} />
        <meshStandardMaterial
          color={feature.color}
          emissive={feature.color}
          emissiveIntensity={hovered ? 0.6 : 0.2}
          metalness={0.6}
          roughness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Floating icon crystal above */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 1.2, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={feature.color}
            emissive={feature.color}
            emissiveIntensity={hovered ? 0.8 : 0.3}
            metalness={0.8}
            roughness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
      </Float>

      {/* Glow light */}
      <pointLight
        color={feature.color}
        intensity={hovered ? 2 : 0.4}
        distance={4}
        decay={2}
        position={[0, 1, 0]}
      />

      {/* Label */}
      <Html position={[0, 2.5, 0]} center distanceFactor={12}>
        <div
          className={`text-center transition-all duration-500 ${(hovered || persistent) ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}
          style={{ pointerEvents: 'none', width: '160px' }}
        >
          <div className="text-2xl mb-1">{feature.icon}</div>
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl px-3 py-2 border border-white/10 shadow-lg shadow-black/50">
            <p className="text-white font-bold text-xs">{feature.title}</p>
            <p className="text-gray-400 text-[10px] mt-1">{feature.desc}</p>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function FeaturesIsland({ position = [0, 0, 0], onFeatureSelect, isActive }) {
  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[9.5, 10.5, 0.4, 48]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.4} roughness={0.6} transparent opacity={0.25} />
      </mesh>

      {/* Side Crystals for optional features */}
      {FEATURES.slice(4).map((feature, i) => (
        <CrystalPedestal
          key={feature.id}
          feature={feature}
          index={i}
          position={CRYSTAL_POSITIONS[i]}
          onSelect={onFeatureSelect}
          persistent={false}
        />
      ))}

      {/* Center title and 4 Default Feature Cards */}
      <Html center position={[0, 1.5, 0]} distanceFactor={12}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
              style={{ pointerEvents: 'none', width: '920px' }}
            >
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                Core <span style={{
                  background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Features</span>
              </h2>
              <p className="text-indigo-300/60 text-sm font-medium uppercase tracking-widest mb-10">
                Hover over side crystals to explore more
              </p>

              <div className="grid grid-cols-4 gap-4 w-full">
                {FEATURES.slice(0, 4).map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={(e) => { e.stopPropagation(); onFeatureSelect?.(feature); }}
                    className="bg-slate-900/90 backdrop-blur-2xl rounded-[1.25rem] p-5 border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 text-left flex flex-col justify-between"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <div>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-inner"
                        style={{ backgroundColor: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}30` }}
                      >
                        <span className="text-2xl">{feature.icon}</span>
                      </div>
                      <h3 className="text-white font-bold text-[15px] leading-tight mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
                    </div>

                    <div className="mt-5 flex items-center text-[11px] font-bold uppercase tracking-wider" style={{ color: feature.color }}>
                      Learn more
                      <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>

      {/* Ambient light */}
      <pointLight color="#6366f1" intensity={0.8} distance={12} position={[0, 4, 0]} />
    </group>
  );
}
 
 
 
 
 
 

// minor tweak for clarity
