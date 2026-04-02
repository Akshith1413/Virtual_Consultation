import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const greetingConfig = {
    morning: {
        title: 'Good Morning',
        gradient: 'from-amber-400 via-orange-400 to-rose-400',
        bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
        particles: ['☀️', '🌤️', '🌅', '✨'],
        darkGlow: 'rgba(251,191,36,0.15)',
    },
    midday: {
        title: 'Hey There',
        gradient: 'from-indigo-400 via-emerald-400 to-purple-400',
        bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
        particles: ['🍱', '🥗', '🍲', '☀️'],
        darkGlow: 'rgba(52,211,153,0.15)',
    },
    afternoon: {
        title: 'Good Afternoon',
        gradient: 'from-blue-400 via-cyan-400 to-purple-400',
        bgGradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
        particles: ['☕', '💧', '🌤️', '⚡'],
        darkGlow: 'rgba(59,130,246,0.15)',
    },
    evening: {
        title: 'Good Evening',
        gradient: 'from-purple-400 via-violet-400 to-indigo-400',
        bgGradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
        particles: ['🌇', '🌆', '🍱', '🌟'],
        darkGlow: 'rgba(139,92,246,0.15)',
    },
    night: {
        title: 'Still Up?',
        gradient: 'from-indigo-400 via-blue-400 to-slate-400',
        bgGradient: 'from-indigo-500/10 via-blue-500/5 to-transparent',
        particles: ['🌙', '💤', '⭐', '🌌'],
        darkGlow: 'rgba(99,102,241,0.15)',
    }
};

const FloatingEmoji = ({ emoji, delay, x }) => (
    <motion.span
        className="absolute text-2xl pointer-events-none select-none"
        style={{ left: `${x}%` }}
        initial={{ opacity: 0, y: 100, rotate: -20 }}
        animate={{
            opacity: [0, 1, 1, 0],
            y: [100, -20, -80, -120],
            rotate: [-20, 10, -10, 20],
            x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30]
        }}
        transition={{ duration: 4, delay, repeat: Infinity, repeatDelay: 2 }}
    >
        {emoji}
    </motion.span>
);

const LifePulse = ({ onComplete }) => {
    const { user } = useAuth();
    const [context, setContext] = useState(null);
    const [show, setShow] = useState(false);
    const [mealLogged, setMealLogged] = useState(false);
    const [dismissing, setDismissing] = useState(false);

    useEffect(() => {
        // Only show once per session
        if (sessionStorage.getItem('lifepulse_shown')) return;

        const fetchContext = async () => {
            try {
                // Check in session
                await axios.post('sessions/checkin', { device: 'web' });
                // Get context
                const res = await axios.get('sessions/context');
                setContext(res.data);
                setShow(true);
                sessionStorage.setItem('lifepulse_shown', 'true');
            } catch (err) {
                console.error('LifePulse error:', err);
            }
        };
        fetchContext();
    }, []);

    // Auto-dismiss after 12s
    useEffect(() => {
        if (!show) return;
        const timer = setTimeout(() => handleDismiss(), 12000);
        return () => clearTimeout(timer);
    }, [show]);

    const handleDismiss = useCallback(() => {
        setDismissing(true);
        setTimeout(() => {
            setShow(false);
            onComplete?.();
        }, 500);
    }, [onComplete]);

    const handleMealLog = async (skipped = false) => {
        if (!context?.expectedMeal) return;
        try {
            await axios.post('meals/log', {
                mealType: context.expectedMeal,
                skipped
            });
            setMealLogged(true);
            setTimeout(handleDismiss, 1500);
        } catch (err) {
            console.error(err);
        }
    };

    if (!show || !context) return null;

    const config = greetingConfig[context.greetingType] || greetingConfig.morning;
    const userName = user?.username || 'there';

    return (
        <AnimatePresence>
            {!dismissing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center"
                    onClick={handleDismiss}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />

                    {/* Floating emojis */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {config.particles.map((emoji, i) => (
                            <FloatingEmoji
                                key={i}
                                emoji={emoji}
                                delay={i * 0.8}
                                x={15 + i * 20}
                            />
                        ))}
                    </div>

                    {/* Main card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
                        className="relative w-[90vw] max-w-md mx-4 rounded-3xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        style={{ boxShadow: `0 0 80px ${config.darkGlow}` }}
                    >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient}`} />
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl" />

                        <div className="relative p-8 text-center">
                            {/* Greeting emoji */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                                className="text-5xl mb-4"
                            >
                                {context.greetingEmoji}
                            </motion.div>

                            {/* Greeting text */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}
                            >
                                {config.title}, {userName}!
                            </motion.h1>

                            {/* Welcome back message */}
                            {context.hoursSinceLastVisit && context.hoursSinceLastVisit > 8 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Welcome back! It's been {context.hoursSinceLastVisit}h since your last visit 👋
                                </motion.p>
                            )}

                            {/* Meal question */}
                            {context.expectedMeal && !context.mealAlreadyLogged && !mealLogged && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="mt-6"
                                >
                                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                                        {context.mealQuestion}
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleMealLog(false)}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                                        >
                                            Yes! ✅
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleMealLog(true)}
                                            className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Not yet ⏰
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Meal already logged / just logged */}
                            {(context.mealAlreadyLogged || mealLogged) && context.expectedMeal && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 text-sm text-emerald-500 font-semibold"
                                >
                                    {mealLogged ? '✅ Noted! Stay healthy!' : `✅ ${context.expectedMeal.charAt(0).toUpperCase() + context.expectedMeal.slice(1)} already logged!`}
                                </motion.p>
                            )}

                            {/* No meal to ask (afternoon/night) — show hydration or wind-down */}
                            {!context.expectedMeal && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-4 text-base text-gray-600 dark:text-gray-300 font-medium"
                                >
                                    {context.mealQuestion}
                                </motion.p>
                            )}

                            {/* Water status */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30"
                            >
                                <span className="text-base">💧</span>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                    {(context.waterTotalMl / 1000).toFixed(1)}L logged today
                                </span>
                            </motion.div>

                            {/* Dismiss hint */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="mt-6 text-xs text-gray-400"
                            >
                                Tap anywhere to continue →
                            </motion.p>

                            {/* Progress bar auto-dismiss */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 12, ease: 'linear' }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LifePulse;
 
 
 
 
 
 
