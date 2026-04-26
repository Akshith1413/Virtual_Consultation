import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LifePulse from '../components/LifePulse';
import WellnessTreeWidget from '../components/3d/widgets/WellnessTreeWidget';
import OrganViewerWidget from '../components/3d/widgets/OrganViewerWidget';
import HydrationWidget from '../components/3d/widgets/HydrationWidget';
import { getHealthRisk } from '../services/aiService';
import { Brain, History } from 'lucide-react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts';
import {
    FiActivity, FiHeart, FiUsers, FiCalendar, FiTrendingUp,
    FiArrowRight, FiSun, FiMoon, FiDroplet, FiZap, FiShield,
    FiAward, FiClock, FiPlusCircle, FiChevronRight, FiChevronLeft, FiX,
    FiMessageSquare, FiVideo, FiPhone, FiEdit3, FiCheck, FiCopy, FiTrash2, FiFileText, FiPlus,
    FiBold, FiItalic, FiType, FiPlusSquare, FiMinusSquare
} from 'react-icons/fi';
import {
    GiMedicines, GiMeal, GiFruitBowl, GiHeartBeats, GiWeightScale, GiMountainRoad
} from 'react-icons/gi';
import {
    MdFamilyRestroom, MdOutlineHealthAndSafety, MdGroups, MdWaterDrop
} from 'react-icons/md';
import { BsLightning } from 'react-icons/bs';

// --- Animated Counter ----------------------------------------------------
const AnimatedCounter = ({ value, duration = 2000, decimals = 0, suffix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (value == null) return;
        let start = 0;
        const end = parseFloat(value);
        if (isNaN(end)) return;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{count.toFixed(decimals)}{suffix}</span>;
};

// --- Floating Particle Background ---------------------------------------
const FloatingParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 10,
    }));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-indigo-400/20 dark:bg-indigo-500/10"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{
                        y: [0, -60, 0],
                        x: [0, Math.random() * 40 - 20, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
};

// --- Glassmorphism Card -------------------------------------------------
const GlassCard = ({ children, className = '', delay = 0, onClick, hoverGlow = true }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={hoverGlow ? { y: -4, scale: 1.01, transition: { duration: 0.25 } } : {}}
        onClick={onClick}
        className={`relative bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/50 shadow-lg dark:shadow-slate-900/30 overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-slate-700/20 pointer-events-none" />
        <div className="relative z-10">{children}</div>
    </motion.div>
);

// ─── BMI Gauge ───────────────────────────────────────────────────
const BMIGauge = ({ bmi }) => {
    const getBMIColor = (val) => {
        if (val < 18.5) return '#60a5fa';
        if (val < 25) return '#34d399';
        if (val < 30) return '#fbbf24';
        return '#f87171';
    };
    const getBMILabel = (val) => {
        if (val < 18.5) return 'Underweight';
        if (val < 25) return 'Normal';
        if (val < 30) return 'Overweight';
        return 'Obese';
    };
    const color = getBMIColor(bmi);
    const percentage = Math.min((bmi / 40) * 100, 100);
    const data = [{ name: 'BMI', value: percentage, fill: color }];

    return (
        <div className="flex flex-col items-center">
            <div className="w-40 h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="value" cornerRadius={15} background={{ fill: 'rgba(148,163,184,0.15)' }} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color }}><AnimatedCounter value={bmi} decimals={1} /></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">BMI</span>
                </div>
            </div>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-2 text-sm font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: `${color}22`, color }}
            >
                {getBMILabel(bmi)}
            </motion.span>
        </div>
    );
};

// --- Quick Action Button -------------------------------------------------
const QuickAction = ({ icon: Icon, label, color, to, delay, navigate }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.08, rotate: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(to)}
        className="flex flex-col items-center gap-2 cursor-pointer group"
    >
        <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:shadow-current/20"
            style={{ background: `linear-gradient(135deg, ${color}18, ${color}35)`, border: `1px solid ${color}30` }}
        >
            <Icon className="text-xl" style={{ color }} />
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {label}
        </span>
    </motion.div>
);

// --- Main Dashboard ------------------------------------------------------
const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme } = useTheme();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const background = useMotionTemplate`radial-gradient(800px at ${mouseX}px ${mouseY}px, rgba(99,102,241,0.08), transparent 70%)`;

    const [healthProfile, setHealthProfile] = useState(null);
    const [supplements, setSupplements] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [groups, setGroups] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [graphType, setGraphType] = useState('Energy');
    const [reminders, setReminders] = useState([]);
    const [activeReminder, setActiveReminder] = useState(null);
    const [waterToday, setWaterToday] = useState({ totalMl: 0, goalMl: 3000, entries: [] });
    const [reminderInput, setReminderInput] = useState('');
    const [mealStatus, setMealStatus] = useState({});
    const [hydrationCountdown, setHydrationCountdown] = useState(null);
    const [aiRiskInfo, setAiRiskInfo] = useState(null);
    const [notes, setNotes] = useState([]);
    const [activeNoteIndex, setActiveNoteIndex] = useState(0);
    const [noteSaving, setNoteSaving] = useState(false);
    const [mealsToday, setMealsToday] = useState([]);

    const handleAddNote = async () => {
        try {
            const res = await axios.post('notes', { title: 'New Note', content: '', color: '#fef3c7' }, { headers });
            setNotes([res.data, ...notes]);
            setActiveNoteIndex(0);
        } catch (err) { console.error(err); }
    };

    const handleUpdateNote = async (id, field, value) => {
        const updatedNotes = notes.map(n => n._id === id ? { ...n, [field]: value } : n);
        setNotes(updatedNotes);
        setNoteSaving(true);
        try {
            await axios.post('notes', { id, [field]: value }, { headers });
            setTimeout(() => setNoteSaving(false), 1000);
        } catch (err) { console.error(err); }
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm('Delete this note?')) return;
        try {
            await axios.delete(`notes/${id}`, { headers });
            setNotes(notes.filter(n => n._id !== id));
            setActiveNoteIndex(0);
        } catch (err) { console.error(err); }
    };

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch all dashboard data
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [hpRes, supRes, metRes, grpRes, appRes, famRes, waterRes, reminderRes, noteRes] = await Promise.allSettled([
                    axios.get('health-profile', { headers }),
                    axios.get('user-supplements', { headers }),
                    axios.get('health-metrics', { headers }),
                    axios.get('groups/my', { headers }),
                    axios.get('appointments', { headers }),
                    axios.get('families', { headers }),
                    axios.get('water-intake/today', { headers }),
                    axios.get('check-reminders', { headers }),
                    axios.get('notes', { headers })
                ]);
                if (hpRes.status === 'fulfilled') setHealthProfile(hpRes.value.data);
                if (supRes.status === 'fulfilled') setSupplements(supRes.value.data || []);
                if (metRes.status === 'fulfilled') setMetrics(metRes.value.data || []);
                if (grpRes.status === 'fulfilled') setGroups(grpRes.value.data || []);
                if (appRes.status === 'fulfilled') setAppointments(appRes.value.data?.appointments || appRes.value.data || []);
                if (famRes.status === 'fulfilled') setFamilies(famRes.value.data || []);
                if (waterRes.status === 'fulfilled') setWaterToday(waterRes.value.data);
                if (noteRes.status === 'fulfilled') setNotes(noteRes.value.data || []);
                if (reminderRes.status === 'fulfilled') {
                    const rems = reminderRes.value.data || [];
                    setReminders(rems);
                    if (rems.length > 0) setActiveReminder(rems[0]);
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();

        // Fetch meal status & hydration countdown & AI risk
        const fetchExtra = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const [mealRes, schedRes, aiRes, detailedMealsRes] = await Promise.allSettled([
                    axios.get('meals/today', { headers }),
                    axios.get('water-intake/smart-schedule', { headers }),
                    getHealthRisk(),
                    axios.get(`meals?date=${today}`, { headers })
                ]);
                if (mealRes.status === 'fulfilled') setMealStatus(mealRes.value.data || {});
                if (detailedMealsRes.status === 'fulfilled') setMealsToday(detailedMealsRes.value.data?.data || []);
                if (schedRes.status === 'fulfilled') setHydrationCountdown(schedRes.value.data);
                if (aiRes.status === 'fulfilled') setAiRiskInfo(aiRes.value);
            } catch (e) { console.error(e); }
        };
        fetchExtra();
    }, []);

    const handleMouseMove = (e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    // Greeting based on time of day
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const greetingIcon = hour < 12 ? <FiSun className="inline text-amber-400" /> : hour < 17 ? <FiSun className="inline text-orange-400" /> : <FiMoon className="inline text-indigo-400" />;

    const quickActions = [
        { icon: Brain, label: 'AI Health', color: '#6366f1', to: '/ai-hub' },
        { icon: History, label: 'History', color: '#a855f7', to: '/chat/demo' },
        { icon: GiMeal, label: 'Nutrition', color: '#10b981', to: '/nutrition' },
        { icon: GiMedicines, label: 'Supplements', color: '#d946ef', to: '/supplements' },
        { icon: MdGroups, label: 'Groups', color: '#0ea5e9', to: '/groups' },
        { icon: FiCalendar, label: 'Appointments', color: '#f59e0b', to: '/appointments' },
        { icon: MdOutlineHealthAndSafety, label: 'Profile', color: '#06b6d4', to: '/healthprofile' },
    ];

    // Dismiss reminder
    const dismissReminder = async (type) => {
        try {
            await axios.post('dismiss-reminder', { reminderType: type }, { headers });
            const remaining = reminders.filter(r => r.type !== type);
            setReminders(remaining);
            setActiveReminder(remaining.length > 0 ? remaining[0] : null);
        } catch (err) {
            console.error(err);
        }
    };

    // Handle quick metric from reminder
    const handleReminderLog = async (type) => {
        if (!reminderInput) return;
        try {
            if (type === 'water') {
                await axios.post('water-intake', { amount: parseInt(reminderInput), drinkType: 'water' }, { headers });
                const [waterRes, schedRes] = await Promise.all([
                    axios.get('water-intake/today', { headers }),
                    axios.get('water-intake/smart-schedule', { headers })
                ]);
                setWaterToday(waterRes.data);
                setHydrationCountdown(schedRes.data);
            } else {
                const metricMap = { weight: 'Weight', sleep: 'Sleep', mood: 'Mood', energy: 'Energy' };
                await axios.post('health-metrics', { type: metricMap[type], value: parseFloat(reminderInput), unit: type === 'weight' ? 'kg' : type === 'sleep' ? 'hrs' : 'rating', recordedAt: new Date().toISOString() }, { headers });
                const metRes = await axios.get('health-metrics', { headers });
                setMetrics(metRes.data || []);
            }
            setReminderInput('');
            dismissReminder(type);
        } catch (err) {
            console.error("Failed to log from reminder", err);
        }
    };

    // Add quick water
    const addQuickWater = async (ml) => {
        try {
            await axios.post('water-intake', { amount: ml, drinkType: 'water' }, { headers });
            const [waterRes, schedRes] = await Promise.all([
                axios.get('water-intake/today', { headers }),
                axios.get('water-intake/smart-schedule', { headers })
            ]);
            setWaterToday(waterRes.data);
            setHydrationCountdown(schedRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Active supplements count
    const activeSups = Array.isArray(supplements) ? supplements.filter(s => s.status === 'Active') : [];

    // Health Score calculation
    const healthScore = useMemo(() => {
        let score = 0;
        let factors = 0;
        if (healthProfile?.bmi) {
            const bmiScore = healthProfile.bmi >= 18.5 && healthProfile.bmi < 25 ? 100 : healthProfile.bmi < 30 ? 70 : 40;
            score += bmiScore; factors++;
        }
        if (waterToday.totalMl > 0) {
            score += Math.min((waterToday.totalMl / waterToday.goalMl) * 100, 100); factors++;
        }
        if (activeSups.length > 0) { score += 80; factors++; }
        const todayMetrics = metrics.filter(m => {
            const d = new Date(m.recordedAt);
            const today = new Date();
            return d.toDateString() === today.toDateString();
        });
        if (todayMetrics.length > 0) { score += 90; factors++; }
        return factors > 0 ? Math.round(score / factors) : 0;
    }, [healthProfile, waterToday, activeSups, metrics]);

    const waterFillPercent = Math.min((waterToday.totalMl / waterToday.goalMl) * 100, 100);

    // Generate chart data from metrics or fallback
    const chartData = useMemo(() => {
        const units = { 'Energy': 'rating', 'Mood': 'rating', 'Sleep': 'hrs', 'Weight': 'kg', 'Water': 'L' };
        const unit = units[graphType] || '';

        const filtered = metrics.filter(m => m.type === graphType);
        if (filtered.length > 0) {
            return filtered.slice().reverse().slice(-7).map((m) => ({
                day: new Date(m.recordedAt || m.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
                value: m.value || 0,
                fullDate: new Date(m.recordedAt || m.createdAt).toLocaleDateString(),
                notes: m.notes,
                isSample: false,
                unit
            }));
        }
        // Fallback/Sample data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const sampleValues = {
            'Energy': [6, 7, 5, 8, 7, 9, 8],
            'Mood': [7, 8, 6, 7, 8, 9, 8],
            'Sleep': [7, 6, 8, 7, 5, 8, 7],
            'Weight': [70.2, 71.1, 70.8, 71.5, 71.2, 70.9, 70.7],
            'Water': [1.5, 2.0, 1.8, 2.2, 2.5, 1.5, 2.0]
        };
        const values = sampleValues[graphType] || [0, 0, 0, 0, 0, 0, 0];
        return days.map((day, i) => ({
            day,
            value: values[i],
            isSample: true,
            unit
        }));
    }, [metrics, graphType]);

    const isUsingSampleData = useMemo(() => chartData.some(d => d.isSample), [chartData]);
    const chartDomain = useMemo(() => {
        if (['Energy', 'Mood', 'Pain', 'Stress'].includes(graphType)) return [0, 10];
        if (graphType === 'Sleep') return [0, 12];
        return ['auto', 'auto'];
    }, [graphType]);


    // Today's date
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Add Metric Modal Component
    const AddMetricModal = ({ isOpen, onClose, onRefresh }) => {
        const [formData, setFormData] = useState({
            type: 'Energy',
            value: '',
            unit: 'rating',
            notes: '',
            recordedAt: new Date().toISOString().slice(0, 16)
        });
        const [submitting, setSubmitting] = useState(false);

        const metricTypes = [
            { id: 'Energy', label: 'Energy', icon: <FiZap />, unit: '1-10', color: 'text-amber-500' },
            { id: 'Mood', label: 'Mood', icon: <FiActivity />, unit: '1-10', color: 'text-pink-500' },
            { id: 'Sleep', label: 'Sleep', icon: <FiClock />, unit: 'hrs', color: 'text-indigo-500' },
            { id: 'Weight', label: 'Weight', icon: <GiWeightScale />, unit: 'kg', color: 'text-emerald-500' },
            { id: 'Water', label: 'Water', icon: <FiDroplet />, unit: 'L', color: 'text-blue-500' },
        ];

        const handleSubmit = async (e) => {
            if (!formData.value) return;
            e.preventDefault();
            setSubmitting(true);
            try {
                await axios.post('health-metrics', formData, { headers });
                onRefresh();
                onClose();
            } catch (err) {
                console.error('Error adding metric:', err);
            } finally {
                setSubmitting(false);
            }
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10"
                >
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                                Record Health Metric
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <FiPlusCircle className="rotate-45 text-2xl text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Select Category</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {metricTypes.map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: t.id, unit: t.unit })}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${formData.type === t.id
                                                ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/30 text-white'
                                                : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500'
                                                }`}
                                        >
                                            <span className={`text-xl ${formData.type === t.id ? 'text-white' : t.color}`}>{t.icon}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Value Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                    {formData.type === 'Weight' || formData.type === 'Water' ? 'Enter Value' : `Rate your ${formData.type}`}
                                </label>

                                {formData.type === 'Weight' || formData.type === 'Water' ? (
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            autoFocus
                                            className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 text-2xl font-bold text-black dark:text-white transition-all outline-none"
                                            placeholder={`0.0 ${formData.unit}`}
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{formData.unit}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, value: v })}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${formData.value === v
                                                    ? 'bg-indigo-500 border-indigo-500 text-white scale-110'
                                                    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400 hover:border-indigo-300'
                                                    }`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Notes (Optional)</label>
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-black dark:text-white transition-all outline-none resize-none"
                                    rows="2"
                                    placeholder="Any specific observations..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !formData.value}
                                className="flex-[2] px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all"
                            >
                                {submitting ? 'Recording...' : 'Save Metric'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30"
            onMouseMove={handleMouseMove}
        >
            {/* Animated mouse-follow gradient */}
            <motion.div
                className="fixed inset-0 opacity-30 dark:opacity-15 pointer-events-none z-0"
                style={{
                    background: background
                }}
            />

            <FloatingParticles />

            <div className="relative z-10">
                <Navbar />

                {/* LifePulse Contextual Greeting Overlay */}
                <LifePulse />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

                    {/* --- Welcome Header ----------------------------------- */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-10"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <motion.h1
                                    className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {greetingIcon}{' '}
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                                        {greeting}, {user?.username || 'User'}!
                                    </span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-2 text-gray-500 dark:text-gray-400 text-sm"
                                >
                                    {today}
                                </motion.p>
                            </div>
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/healthprofile')}
                                className="self-start sm:self-auto px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow flex items-center gap-2"
                            >
                                <FiPlusCircle /> Update Health Profile
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* --- Smart Reminder Popup ----------------------------- */}
                    <AnimatePresence>
                        {activeReminder && (
                            <motion.div
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="mb-8 relative overflow-hidden rounded-2xl border shadow-xl"
                                style={{
                                    background: activeReminder.type === 'weight' ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' :
                                        activeReminder.type === 'water' ? 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.1))' :
                                            activeReminder.type === 'sleep' ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))' :
                                                'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(249,115,22,0.1))',
                                    borderColor: activeReminder.type === 'weight' ? 'rgba(99,102,241,0.3)' :
                                        activeReminder.type === 'water' ? 'rgba(59,130,246,0.3)' :
                                            activeReminder.type === 'sleep' ? 'rgba(99,102,241,0.3)' :
                                                'rgba(236,72,153,0.3)'
                                }}
                            >
                                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <motion.div
                                        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-3xl flex-shrink-0"
                                    >
                                        {activeReminder.type === 'weight' ? '⚖️' : activeReminder.type === 'water' ? '💧' : activeReminder.type === 'sleep' ? '🌙' : '😊'}
                                    </motion.div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{activeReminder.message}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <input
                                                type="number"
                                                step={activeReminder.type === 'weight' ? '0.1' : '1'}
                                                value={reminderInput}
                                                onChange={(e) => setReminderInput(e.target.value)}
                                                placeholder={activeReminder.type === 'weight' ? 'kg' : activeReminder.type === 'water' ? 'ml' : activeReminder.type === 'sleep' ? 'hours' : '1-10'}
                                                className="w-28 bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-black dark:text-white outline-none focus:ring-2 focus:ring-indigo-400"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleReminderLog(activeReminder.type)}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-bold shadow-md"
                                            >
                                                Log Now
                                            </motion.button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dismissReminder(activeReminder.type)}
                                        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <FiX className="text-gray-400 text-lg" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ──────────────── Quick Actions ──────────────── */}
                    <GlassCard className="p-6 mb-8" delay={0.1} hoverGlow={false}>
                        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-5">Quick Actions</h2>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-8">
                            {quickActions.map((action, i) => (
                                <QuickAction key={action.label} {...action} delay={0.2 + i * 0.08} navigate={navigate} />
                            ))}
                        </div>
                    </GlassCard>

                    {/* ──────────────── Meal Status + Hydration Timer ────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                        <GlassCard className="p-5 flex flex-col justify-between" delay={0.11} hoverGlow={false}>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Today's Meals</h3>
                                <div className="flex gap-4 mb-4">
                                    {['breakfast', 'lunch', 'dinner'].map(meal => {
                                        const logged = mealStatus[meal];
                                        const detailedMeal = mealsToday.find(m => m.type === meal);
                                        return (
                                            <div key={meal} className="flex flex-col items-center gap-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${logged || detailedMeal ? (logged?.skipped ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500') : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                                                    {logged || detailedMeal ? (logged?.skipped ? '⌚' : '✅') : '⌛'}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 capitalize">{meal}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                                {mealsToday.length > 0 ? mealsToday.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between text-[11px] bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700">
                                        <span className="font-bold text-gray-700 dark:text-gray-200 capitalize">{m.type}: <span className="font-medium text-gray-500 dark:text-gray-400">{m.items?.map(it => it.foodItem?.name || it.recipe?.name || 'Meal').join(', ')}</span></span>
                                        <span className="text-emerald-500 font-black">{m.totalNutrition?.calories} kcal</span>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-gray-400 italic">No detailed logs for today</p>
                                )}
                            </div>
                        </GlassCard>

                        {/* Multi-Note Widget */}
                        <GlassCard className="p-0 overflow-hidden flex flex-col h-full min-h-[180px]" delay={0.12} hoverGlow={false}>
                            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {notes.length > 0 && notes.map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeNoteIndex ? 'bg-purple-500 w-3' : 'bg-gray-300 dark:bg-gray-600'}`} 
                                            />
                                        ))}
                                    </div>
                                    {noteSaving && <span className="text-[10px] text-purple-500 animate-pulse font-bold ml-2">Saving...</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleAddNote} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-500 transition-all" title="Add Note"><FiPlus size={14}/></button>
                                    {notes.length > 0 && (
                                        <button onClick={() => handleDeleteNote(notes[activeNoteIndex]?._id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-all" title="Delete Note"><FiTrash2 size={14}/></button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="relative flex-1 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 group/notes overflow-hidden">
                                {/* Navigation Arrows */}
                                <AnimatePresence>
                                    {activeNoteIndex > 0 && (
                                        <motion.button 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            onClick={() => setActiveNoteIndex(activeNoteIndex - 1)}
                                            className="absolute left-0 top-0 bottom-0 z-20 px-1 bg-gradient-to-r from-white/80 to-transparent dark:from-slate-800/80 hover:from-white dark:hover:from-slate-800 transition-all opacity-0 group-hover/notes:opacity-100"
                                        >
                                            <FiChevronLeft size={20} className="text-purple-500" />
                                        </motion.button>
                                    )}
                                    {activeNoteIndex < notes.length - 1 && (
                                        <motion.button 
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            onClick={() => setActiveNoteIndex(activeNoteIndex + 1)}
                                            className="absolute right-0 top-0 bottom-0 z-20 px-1 bg-gradient-to-l from-white/80 to-transparent dark:from-slate-800/80 hover:from-white dark:hover:from-slate-800 transition-all opacity-0 group-hover/notes:opacity-100"
                                        >
                                            <FiChevronRight size={20} className="text-purple-500" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                                <div className="p-4 h-full">
                                    <AnimatePresence mode="wait">
                                        {notes.length > 0 ? (
                                            <motion.div
                                                key={notes[activeNoteIndex]?._id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 1.05 }}
                                                className="h-full flex flex-col"
                                            >
                                                <input 
                                                    value={notes[activeNoteIndex]?.title}
                                                    onChange={(e) => handleUpdateNote(notes[activeNoteIndex]._id, 'title', e.target.value)}
                                                    className="bg-transparent border-none outline-none font-black text-gray-800 dark:text-gray-100 text-sm mb-2 placeholder:text-gray-400"
                                                    placeholder="Note title..."
                                                />
                                                <textarea
                                                    value={notes[activeNoteIndex]?.content}
                                                    onChange={(e) => handleUpdateNote(notes[activeNoteIndex]._id, 'content', e.target.value)}
                                                    style={{ 
                                                        fontSize: `${notes[activeNoteIndex]?.fontSize || 14}px`,
                                                        fontWeight: notes[activeNoteIndex]?.isBold ? 'bold' : 'normal',
                                                        fontStyle: notes[activeNoteIndex]?.isItalic ? 'italic' : 'normal'
                                                    }}
                                                    className="flex-1 bg-transparent border-none outline-none resize-none text-gray-600 dark:text-gray-400 placeholder:text-gray-400/50 leading-relaxed font-medium min-h-[80px]"
                                                    placeholder="Start writing..."
                                                />
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                                                    <div className="flex gap-1.5 items-center">
                                                        {['#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff'].map(c => (
                                                            <button 
                                                                key={c} 
                                                                onClick={() => handleUpdateNote(notes[activeNoteIndex]._id, 'color', c)}
                                                                className={`w-3.5 h-3.5 rounded-full border border-gray-200 dark:border-slate-700 ${notes[activeNoteIndex].color === c ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                        <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
                                                        <button 
                                                            onClick={() => handleUpdateNote(notes[activeNoteIndex]._id, 'isBold', !notes[activeNoteIndex].isBold)}
                                                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${notes[activeNoteIndex].isBold ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-400'}`}
                                                            title="Bold"
                                                        >
                                                            <FiBold size={12} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateNote(notes[activeNoteIndex]._id, 'isItalic', !notes[activeNoteIndex].isItalic)}
                                                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${notes[activeNoteIndex].isItalic ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-400'}`}
                                                            title="Italic"
                                                        >
                                                            <FiItalic size={12} />
                                                        </button>
                                                        <div className="flex items-center gap-1 ml-1 bg-gray-100 dark:bg-slate-700 rounded-lg px-1">
                                                            <button 
                                                                onClick={() => handleUpdateNote(notes[activeNoteIndex]._id, 'fontSize', Math.max(10, (notes[activeNoteIndex].fontSize || 14) - 1))}
                                                                className="p-0.5 text-gray-500 hover:text-purple-500"
                                                                title="Decrease Font"
                                                            >
                                                                <FiMinusSquare size={12} />
                                                            </button>
                                                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 min-w-[15px] text-center">{notes[activeNoteIndex].fontSize || 14}</span>
                                                            <button 
                                                                onClick={() => handleUpdateNote(notes[activeNoteIndex]._id, 'fontSize', Math.min(24, (notes[activeNoteIndex].fontSize || 14) + 1))}
                                                                className="p-0.5 text-gray-500 hover:text-purple-500"
                                                                title="Increase Font"
                                                            >
                                                                <FiPlusSquare size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{activeNoteIndex + 1} / {notes.length}</span>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 mb-4">
                                                    <FiFileText size={24} />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Notes Yet</p>
                                                <button 
                                                    onClick={handleAddNote}
                                                    className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20"
                                                >
                                                    Create Note
                                                </button>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Live Water Tracker + Health Score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                        {/* Water Tracker Mini */}
                        <GlassCard className="p-6" delay={0.12}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <FiDroplet className="text-blue-500" /> Today's Water
                                </h3>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Mini bottle */}
                                <div className="relative w-16 h-24 rounded-xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden flex-shrink-0">
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${waterFillPercent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-black text-gray-700 dark:text-white drop-shadow">{Math.round(waterFillPercent)}%</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-2xl font-black text-gray-800 dark:text-white">{(waterToday.totalMl / 1000).toFixed(1)}<span className="text-sm font-normal text-gray-400 ml-1">/ {(waterToday.goalMl / 1000).toFixed(1)}L</span></p>
                                    <div className="flex gap-2 mt-3">
                                        {[250, 500].map(ml => (
                                            <motion.button
                                                key={ml}
                                                whileHover={{ scale: 1.08 }}
                                                whileTap={{ scale: 0.92 }}
                                                onClick={(e) => { e.stopPropagation(); addQuickWater(ml); }}
                                                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all"
                                            >
                                                +{ml}ml
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Health Score */}
                        <GlassCard className="p-6" delay={0.14}>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FiAward className="text-amber-500" /> Health Score
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-slate-700" />
                                        <motion.circle
                                            cx="50" cy="50" r="42" fill="none"
                                            strokeWidth="8" strokeLinecap="round"
                                            stroke={healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#f87171'}
                                            strokeDasharray={`${2 * Math.PI * 42}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - healthScore / 100) }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-black" style={{ color: healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#f87171' }}>{healthScore}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">{healthScore >= 75 ? 'Excellent! 🌟' : healthScore >= 50 ? 'Good progress' : 'Keep going! '}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Based on BMI, hydration, supplements & activity</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* AI Health Insight Widget */}
                    {aiRiskInfo && aiRiskInfo.overall && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            onClick={() => navigate('/ai-hub')}
                            className="mb-8 cursor-pointer overflow-hidden rounded-2xl relative border shadow-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-indigo-500/30 hover:border-indigo-500/60 transition-all group"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                            <div className="p-6 sm:p-8 flex items-center justify-between relative z-10">
                                <div className="flex gap-6 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                        <Brain size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-white">AI Health Assessment</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${aiRiskInfo.overall.level === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                                                aiRiskInfo.overall.level === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {aiRiskInfo.overall.level} Risk
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-indigo-200 mt-2">
                                            {aiRiskInfo.recommendations?.[0]?.message || 'Your health data looks stable. Click to see full AI insights.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex text-indigo-400 group-hover:translate-x-2 transition-transform">
                                    <FiArrowRight size={24} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {/* BMI */}
                        <GlassCard className="p-6" delay={0.15}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
                                    <GiWeightScale className="text-emerald-500 text-lg" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">BMI</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {healthProfile?.bmi ? <AnimatedCounter value={healthProfile.bmi} decimals={1} /> : '—'}
                                    </p>
                                </div>
                            </div>
                            {healthProfile?.bmi && (
                                <div className="mt-2">
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((healthProfile.bmi / 40) * 100, 100)}%` }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: healthProfile.bmi < 25 ? 'linear-gradient(90deg, #34d399, #10b981)' : healthProfile.bmi < 30 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #f87171, #ef4444)' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </GlassCard>

                        {/* Weight */}
                        <GlassCard className="p-6" delay={0.2}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center">
                                    <FiTrendingUp className="text-blue-500 text-lg" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {healthProfile?.weight ? <><AnimatedCounter value={healthProfile.weight} decimals={1} /><span className="text-sm font-normal text-gray-400 ml-1">kg</span></> : '—'}
                                    </p>
                                </div>
                            </div>
                            {healthProfile?.targetWeight && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                                    Target: <span className="text-indigo-500 font-semibold">{healthProfile.targetWeight} kg</span>
                                </p>
                            )}
                        </GlassCard>

                        {/* Height */}
                        <GlassCard className="p-6" delay={0.25}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center">
                                    <FiActivity className="text-purple-500 text-lg" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {healthProfile?.height ? <><AnimatedCounter value={healthProfile.height} decimals={0} /><span className="text-sm font-normal text-gray-400 ml-1">cm</span></> : '—'}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Active Supplements */}
                        <GlassCard className="p-6" delay={0.3} onClick={() => navigate('/supplements')}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400/20 to-violet-600/20 flex items-center justify-center">
                                    <GiMedicines className="text-violet-500 text-lg" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Active Supplements</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        <AnimatedCounter value={activeSups.length} />
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-3 flex items-center gap-1 font-medium">
                                View all <FiChevronRight className="text-xs" />
                            </p>
                        </GlassCard>
                    </div>

                    {/* Bottom Row: Profile Summary + Groups + Supplements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Health Profile Summary */}
                        <GlassCard className="p-6" delay={0.45} onClick={() => navigate('/healthprofile')}>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FiHeart className="text-pink-500" /> Health Profile
                            </h3>
                            {healthProfile ? (
                                <div className="space-y-3">
                                    {[
                                        { label: 'Age', value: `${healthProfile.age} years`, icon: <FiClock className="text-blue-400" /> },
                                        { label: 'Gender', value: healthProfile.gender, icon: <FiShield className="text-purple-400" /> },
                                        { label: 'Blood Group', value: healthProfile.bloodGroup || 'Not set', icon: <FiDroplet className="text-red-400" /> },
                                        { label: 'Activity', value: healthProfile.activityLevel || 'Not set', icon: <FiZap className="text-amber-400" /> },
                                        { label: 'Goal', value: healthProfile.healthGoal || 'Not set', icon: <FiAward className="text-emerald-400" /> },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + i * 0.08 }}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                {item.icon} {item.label}
                                            </span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{item.value}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                                    <MdOutlineHealthAndSafety className="text-4xl mx-auto mb-3 opacity-40" />
                                    <p className="text-sm mb-3">No health profile yet</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-xs px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-lg font-medium"
                                    >
                                        Create Profile <FiArrowRight className="inline ml-1" />
                                    </motion.button>
                                </div>
                            )}
                        </GlassCard>

                        {/* Groups */}
                        <GlassCard className="p-6" delay={0.5} onClick={() => navigate('/groups')}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <MdGroups className="text-blue-500" /> My Communities
                                </h3>
                                <button className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-full font-bold">Discover</button>
                            </div>
                            {Array.isArray(groups) && groups.length > 0 ? (
                                <div className="space-y-3">
                                    {groups.slice(0, 4).map((group, i) => (
                                        <motion.div
                                            key={group._id || i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.65 + i * 0.08 }}
                                            whileHover={{ x: 5 }}
                                            onClick={(e) => { e.stopPropagation(); navigate(`/community/${group._id}`); }}
                                            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 dark:bg-slate-700/20 border border-transparent hover:border-blue-400/30 hover:bg-blue-50/10 dark:hover:bg-blue-900/10 transition-all cursor-pointer group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                                {(group.groupName || 'G').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-500 transition-colors">{group.groupName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                        <FiUsers size={10} /> {group.membersCount || group.members?.length || 0}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Active</span>
                                                </div>
                                            </div>
                                            <FiChevronRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </motion.div>
                                    ))}
                                    {groups.length > 4 && (
                                        <p className="text-xs text-indigo-500 font-bold mt-2 flex items-center gap-1 justify-center py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg cursor-pointer">
                                            View all {groups.length} communities <FiChevronRight />
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                        <MdGroups className="text-3xl opacity-30" />
                                    </div>
                                    <p className="text-sm font-medium mb-4">You haven't joined any communities yet</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-xs px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30"
                                    >
                                        Browse Communities
                                    </motion.button>
                                </div>
                            )}
                        </GlassCard>

                        {/* Active Supplements List */}
                        <GlassCard className="p-6" delay={0.55} onClick={() => navigate('/supplements')}>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <GiMedicines className="text-violet-500" /> Supplements
                            </h3>
                            {activeSups.length > 0 ? (
                                <div className="space-y-3">
                                    {activeSups.slice(0, 4).map((sup, i) => (
                                        <motion.div
                                            key={sup._id || i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 + i * 0.08 }}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-slate-700/30 transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {(sup.customSupplement?.name || sup.supplementId?.name || 'S').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                    {sup.customSupplement?.name || sup.supplementId?.name || 'Supplement'}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{sup.frequency} · {sup.dosage}{sup.customSupplement?.dosageUnit || 'mg'}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
                                                Active
                                            </span>
                                        </motion.div>
                                    ))}
                                    {activeSups.length > 4 && (
                                        <p className="text-xs text-violet-500 font-medium mt-2 flex items-center gap-1">
                                            +{activeSups.length - 4} more <FiChevronRight />
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                                    <GiMedicines className="text-4xl mx-auto mb-3 opacity-40" />
                                    <p className="text-sm mb-3">No active supplements</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-xs px-4 py-2 bg-violet-500/10 text-violet-500 rounded-lg font-medium"
                                    >
                                        Add Supplement <FiArrowRight className="inline ml-1" />
                                    </motion.button>
                                </div>
                            )}
                        </GlassCard>
                    </div>

                    {/* Upcoming Appointments Row */}
                    <GlassCard className="p-6 mb-8" delay={0.6} hoverGlow={false}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiCalendar className="text-amber-500" /> Upcoming Appointments
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.05, x: 3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/appointments')}
                                className="text-xs text-indigo-500 dark:text-indigo-400 font-medium flex items-center gap-1"
                            >
                                View all <FiChevronRight />
                            </motion.button>
                        </div>
                        {Array.isArray(appointments) && appointments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {appointments.slice(0, 3).map((apt, i) => (
                                    <motion.div
                                        key={apt._id || i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 + i * 0.1 }}
                                        className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-700/30"
                                    >
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                            {apt.doctorName || apt.specialization || 'Appointment'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <FiClock className="text-amber-500" />
                                            {apt.date ? new Date(apt.date).toLocaleDateString() : 'TBD'} {apt.time && `at ${apt.time}`}
                                        </p>
                                        {apt.status && (
                                            <span className={`text-xs px-2 py-0.5 mt-2 inline-block rounded-full font-medium ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                apt.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                <FiCalendar className="text-4xl mx-auto mb-3 opacity-40" />
                                <p className="text-sm mb-3">No upcoming appointments</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/appointments')}
                                    className="text-xs px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg font-medium"
                                >
                                    Schedule one <FiArrowRight className="inline ml-1" />
                                </motion.button>
                            </div>
                        )}
                    </GlassCard>

                    {/* --- Health Tips Ribbon -------------------------- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="relative overflow-hidden rounded-2xl p-6 mb-8"
                        style={{
                            background: theme === 'dark'
                                ? 'linear-gradient(135deg, #312e81, #581c87, #831843)'
                                : 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)'
                        }}
                    >
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full bg-white/10"
                                    style={{
                                        width: 60 + Math.random() * 80,
                                        height: 60 + Math.random() * 80,
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                    }}
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.1, 0.25, 0.1],
                                    }}
                                    transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 3 }}
                                />
                            ))}
                        </div>
                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex-shrink-0">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
                                >
                                    <GiHeartBeats className="text-white text-2xl" />
                                </motion.div>
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-white font-bold text-lg">Daily Health Tip</h3>
                                <p className="text-white/80 text-sm mt-1">
                                    {healthProfile?.healthGoal === 'Weight Loss'
                                        ? 'Stay hydrated! Drinking water before meals can help reduce calorie intake by up to 13%.'
                                        : healthProfile?.healthGoal === 'Muscle Building'
                                            ? 'Prioritize protein within 30 minutes after exercise for optimal muscle recovery.'
                                            : 'Aim for 7-9 hours of quality sleep. It is the foundation of good health and recovery.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </main>

                <Footer />
            </div>

            <AddMetricModal
                isOpen={showMetricModal}
                onClose={() => setShowMetricModal(false)}
                onRefresh={async () => {
                    const metRes = await axios.get('health-metrics', { headers });
                    setMetrics(metRes.data || []);
                }}
            />
        </motion.div>
    );
};

export default Dashboard;
