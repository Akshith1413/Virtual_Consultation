import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Activity, Calendar, LayoutDashboard, ShoppingCart, LogOut, Sparkles, Brain, Phone, Video, MessageSquare, History } from 'lucide-react';

const AnimatedBlob = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={2.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#4287f5"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

const FloatingRing = ({ position, color, scale, speed, rotationIntensity }) => {
  return (
    <Float position={position} speed={speed} rotationIntensity={rotationIntensity} floatIntensity={2}>
      <mesh scale={scale}>
        <torusGeometry args={[1, 0.3, 16, 100]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  );
};

const Portal = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme() || { theme: 'light' };
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const cards = [
    {
      title: 'Body Insights',
      description: 'Explore your 3D health metrics and vitals.',
      icon: Activity,
      color: 'from-blue-500 to-cyan-400',
      path: '/body-insights',
    },
    {
      title: 'Appointments',
      description: 'Manage and schedule your consultations.',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      path: '/appointments',
    },
    {
      title: 'Dashboard',
      description: 'View your personalized daily health overview.',
      icon: LayoutDashboard,
      color: 'from-emerald-500 to-teal-400',
      path: '/dashboard',
    },
    /*{
      title: 'Shopping',
      description: 'Discover tailored health supplements and gear.',
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-400',
      path: '/supplements',
    },*/
    {
      title: 'AI Health Center',
      description: 'AI-powered symptom checker, risk analysis & insights.',
      icon: Brain,
      color: 'from-indigo-500 to-purple-500',
      path: '/ai-hub',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>

      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          {/*<AnimatedBlob />*/}
          <FloatingRing position={[-5, 3, -2]} color="#fff" scale={1.5} speed={1.5} rotationIntensity={1.5} />
          <FloatingRing position={[4, -2, -1]} color="#f43f5e" scale={1} speed={2} rotationIntensity={2} />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen flex flex-col pt-[10vh] pb-12 px-4 sm:px-6 lg:px-8">

        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto w-full flex justify-between items-center mb-12"
        >
          <div>
            <motion.h1
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#000] via-[#f43f5e] to-[#111]"
              style={{ backgroundSize: '200% auto', paddingBottom: '0.1em' }}
            >
              Welcome back, {user?.username || 'Guest'}
            </motion.h1>
            <p className={`mt-4 text-lg md:text-xl flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              <Sparkles className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              What would you like to explore today?
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Communication History Icons */}
            <motion.button
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate('/communication-history?tab=all')}
              title="Chat History"
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 backdrop-blur-md border
                ${isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/25 hover:border-purple-500/50'
                  : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 hover:border-purple-300'}`}
            >
              <History className="h-5 w-5" />
            </motion.button>
            <div className={`w-px h-8 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md border 
                ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400'
                  : 'bg-black/5 border-black/10 text-gray-800 hover:bg-red-50 hover:border-red-200 hover:text-red-600'}`}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 flex-grow content-center"
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5, zIndex: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(card.path)}
                className={`group relative cursor-pointer overflow-hidden rounded-[2rem] p-1 
                  transition-all duration-300 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                  ${isDark ? 'bg-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/40 backdrop-blur-xl border border-white/80'}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10 blur-xl group-hover:opacity-30 transition-opacity duration-500`} />

                <div className={`relative h-full w-full rounded-[1.8rem] p-8 md:p-10 flex flex-col justify-between z-10 
                  ${isDark ? 'bg-gray-900/50' : 'bg-white/60'} backdrop-blur-sm`} style={{ transform: 'translateZ(30px)' }}>

                  <div className="flex justify-between items-start mb-8">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg flex items-center justify-center`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    {/* Decorative element */}
                    <div className={`h-12 w-12 rounded-full border-2 opacity-20 ${isDark ? 'border-white' : 'border-black'}`} />
                  </div>

                  <div>
                    <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ transform: 'translateZ(20px)' }}>
                      {card.title}
                    </h3>
                    <p className={`text-base md:text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`} style={{ transform: 'translateZ(10px)' }}>
                      {card.description}
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0" style={{ transform: 'translateZ(20px)' }}>
                    <div className={`p-3 rounded-full bg-gradient-to-br ${card.color} shadow-md`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile logout button */}
        <div className="mt-12 flex justify-center md:hidden">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all w-full justify-center
              ${isDark ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-600 border border-red-200'}`}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Portal;
 
 
 
 
 
 
 
 

// minor tweak for clarity

// minor tweak for clarity
