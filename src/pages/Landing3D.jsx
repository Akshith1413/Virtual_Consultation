import React, { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';
import SceneManager, { ISLAND_CONFIGS } from '../components/3d/SceneManager';
import HeroIsland from '../components/3d/islands/HeroIsland';
import FeaturesIsland from '../components/3d/islands/FeaturesIsland';
import BodyIsland from '../components/3d/islands/BodyIsland';
import AIIsland from '../components/3d/islands/AIIsland';
import TestimonialsIsland from '../components/3d/islands/TestimonialsIsland';
import CTAIsland from '../components/3d/islands/CTAIsland';
import IslandConnector from '../components/3d/IslandConnector';
import ParticleTrail from '../components/3d/interactions/ParticleTrail';
import MouseTracker3D from '../components/3d/interactions/MouseTracker3D';

/**
 * Landing3D: Full-screen immersive 3D landing page.
 * Scroll-driven camera movement flies between floating islands.
 */

// Scroll progress indicator dots
function ScrollIndicator({ activeIsland, total, onDotClick }) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.4 }}
          onClick={() => onDotClick(i)}
          className="relative group p-1"
        >
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i === activeIsland
            ? 'bg-indigo-400 scale-125 shadow-[0_0_15px_rgba(129,140,248,0.8)]'
            : 'bg-white/20 hover:bg-white/40'
            }`} />
          {i === activeIsland && (
            <motion.div
              layoutId="dot-focus"
              className="absolute inset-0 border border-indigo-400/50 rounded-full scale-[2.5]"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

// Section labels
const SECTION_LABELS = ['Welcome', 'Features', 'Body Insights', 'AI Assistant', 'Testimonials', 'Get Started'];

export default function Landing3D() {
  const navigate = useNavigate();
  const [activeIsland, setActiveIsland] = useState(0);
  const scrollCooldown = useRef(false);
  const touchStartY = useRef(0);

  // Scroll handler — navigate between islands
  const handleWheel = useCallback((e) => {
    if (scrollCooldown.current) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    setActiveIsland((prev) => {
      const next = Math.max(0, Math.min(ISLAND_CONFIGS.length - 1, prev + direction));
      return next;
    });

    scrollCooldown.current = true;
    setTimeout(() => {
      scrollCooldown.current = false;
    }, 1200); // Cooldown to prevent rapid scrolling
  }, []);

  // Touch handler for mobile
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (scrollCooldown.current) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 50) return;

    const direction = dy > 0 ? 1 : -1;
    setActiveIsland((prev) => Math.max(0, Math.min(ISLAND_CONFIGS.length - 1, prev + direction)));

    scrollCooldown.current = true;
    setTimeout(() => { scrollCooldown.current = false; }, 1200);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (scrollCooldown.current) return;

      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setActiveIsland((prev) => Math.min(ISLAND_CONFIGS.length - 1, prev + 1));
        scrollCooldown.current = true;
        setTimeout(() => { scrollCooldown.current = false; }, 1200);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIsland((prev) => Math.max(0, prev - 1));
        scrollCooldown.current = true;
        setTimeout(() => { scrollCooldown.current = false; }, 1200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const bgColor = useMemo(() => {
    const colors = [
      'linear-gradient(135deg, #0f0a1e 0%, #1a1145 50%, #0c0d2e 100%)', // Hero
      'linear-gradient(135deg, #0c0d2e 0%, #1e1b4b 50%, #0f172a 100%)', // Features
      'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #0c0d2e 100%)', // Body
      'linear-gradient(135deg, #0c0d2e 0%, #1e1b4b 50%, #0f0a1e 100%)', // AI
      'linear-gradient(135deg, #0f0a1e 0%, #1a1145 50%, #0c0d2e 100%)', // Testimonials
      'linear-gradient(135deg, #0c0d2e 0%, #1e293b 50%, #0f172a 100%)', // CTA
    ];
    return colors[activeIsland] || colors[0];
  }, [activeIsland]);

  return (
    <motion.div
      initial={false}
      animate={{ background: bgColor }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Canvas */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1, 12], fov: 55 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Scene Manager - handles camera transitions */}
          <SceneManager
            activeIsland={activeIsland}
            islands={ISLAND_CONFIGS}
            transitionSpeed={1.5}
          />

          {/* Global lighting */}
          <ambientLight intensity={0.25} color="#c7d2fe" />
          <directionalLight position={[10, 15, 10]} intensity={0.5} color="#e0e7ff" />

          {/* Starfield background */}
          <Stars radius={100} depth={80} count={3000} factor={3} saturation={0.2} fade speed={0.5} />

          {/* ===== ISLANDS ===== */}
          <HeroIsland
            position={ISLAND_CONFIGS[0].position}
            onNavigate={handleNavigate}
            isActive={activeIsland === 0}
          />

          <FeaturesIsland
            position={ISLAND_CONFIGS[1].position}
            isActive={activeIsland === 1}
          />

          <BodyIsland
            position={ISLAND_CONFIGS[2].position}
            isActive={activeIsland === 2}
          />

          <AIIsland
            position={ISLAND_CONFIGS[3].position}
            isActive={activeIsland === 3}
          />

          <TestimonialsIsland
            position={ISLAND_CONFIGS[4].position}
            isActive={activeIsland === 4}
          />

          <CTAIsland
            position={ISLAND_CONFIGS[5].position}
            onNavigate={handleNavigate}
            isActive={activeIsland === 5}
          />

          {/* ===== ISLAND CONNECTORS ===== */}
          {ISLAND_CONFIGS.slice(0, -1).map((island, i) => (
            <IslandConnector
              key={i}
              from={island.position}
              to={ISLAND_CONFIGS[i + 1].position}
              color="#6366f1"
              particleCount={20}
            />
          ))}

          {/* ===== INTERACTIONS ===== */}
          <ParticleTrail color="#818cf8" maxParticles={80} />
          <MouseTracker3D color="#818cf8" size={0.1} />

          {/* ===== POST-PROCESSING ===== */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
              intensity={1.0}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.15} darkness={0.5} />
          </EffectComposer>

          <Preload all />
        </Suspense>
      </Canvas>

      {/* ===== UI OVERLAYS ===== */}

      {/* Scroll indicator dots */}
      <ScrollIndicator
        activeIsland={activeIsland}
        total={ISLAND_CONFIGS.length}
        onDotClick={setActiveIsland}
      />

      {/* Current section label */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <AnimatePresence mode="wait">
          {activeIsland !== 0 && activeIsland !== 2 && activeIsland !== 5 && (
            <motion.div
              key={activeIsland}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-2xl rounded-full px-8 py-2.5 border border-white/10 shadow-2xl"
            >
              <p className="text-white text-sm font-bold tracking-widest uppercase">
                {SECTION_LABELS[activeIsland]}
                <span className="text-white/30 ml-3 font-medium">
                  0{activeIsland + 1} / 0{ISLAND_CONFIGS.length}
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll hint on first island */}
      <AnimatePresence>
        {activeIsland === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 cursor-pointer"
            onClick={() => setActiveIsland((prev) => Math.min(ISLAND_CONFIGS.length - 1, prev + 1))}
          >
            <div className="flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1"
                style={{ textShadow: '0 0 10px rgba(255,255,255,0.1)' }}
              >
                Scroll
              </motion.span>

              {/* Mouse Outline */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="w-[18px] h-[30px] rounded-full border-[1.5px] border-white/20 flex justify-center pt-[5px] relative bg-white/5 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.05)_inset]"
              >
                {/* Scroll Wheel */}
                <motion.div
                  animate={{
                    y: [0, 10],
                    opacity: [1, 0, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "circOut"
                  }}
                  className="w-[2px] h-[5px] bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"
                />
              </motion.div>

              {/* Chevron Arrows */}
              <div className="mt-2 flex flex-col items-center gap-1 mb-2">
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.1, 1, 0.1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="rgba(129, 140, 248, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top nav bar overlay */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 p-6"
      >
        <div className={`max-w-7xl mx-auto flex justify-between items-center rounded-2xl px-8 py-4 transition-all duration-500 ${(activeIsland === 4 || activeIsland === 5) ? '' : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl'
          }`}>
          <h1
            className="text-2xl font-black cursor-pointer tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            onClick={() => setActiveIsland(0)}
          >
            AETHERA
          </h1>
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/signin')}
              className="text-sm text-gray-400 hover:text-white font-bold tracking-wide transition-all"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-6 py-2.5 text-xs bg-white text-black font-black uppercase tracking-widest rounded-lg transition-all hover:bg-indigo-400 hover:text-white"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
 
 
 
 

