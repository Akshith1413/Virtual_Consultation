import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Phone, Video, MessageSquare, 
  PhoneMissed, Clock, ChevronRight, Calendar, Filter
} from 'lucide-react';
import '../styles/Communication.css';

const DUMMY_HISTORY = [
  { id: 1, type: 'video', doctor: 'Dr. Sarah Mitchell', specialty: 'General Practice', date: '2026-04-21', time: '10:30 AM', duration: '18 min', status: 'completed', direction: 'outgoing' },
  { id: 2, type: 'call', doctor: 'Dr. Raj Patel', specialty: 'Cardiology', date: '2026-04-21', time: '2:15 PM', duration: '12 min', status: 'completed', direction: 'incoming' },
  { id: 3, type: 'chat', doctor: 'Dr. Sarah Mitchell', specialty: 'General Practice', date: '2026-04-20', time: '9:00 AM', duration: '25 messages', status: 'completed', direction: 'outgoing' },
  { id: 4, type: 'call', doctor: 'Dr. Emily Chen', specialty: 'Dermatology', date: '2026-04-20', time: '4:45 PM', duration: '—', status: 'missed', direction: 'incoming' },
  { id: 5, type: 'video', doctor: 'Dr. James Wilson', specialty: 'Orthopedics', date: '2026-04-19', time: '11:00 AM', duration: '22 min', status: 'completed', direction: 'outgoing' },
  { id: 6, type: 'chat', doctor: 'Dr. Raj Patel', specialty: 'Cardiology', date: '2026-04-19', time: '3:30 PM', duration: '14 messages', status: 'completed', direction: 'outgoing' },
  { id: 7, type: 'call', doctor: 'Dr. Sarah Mitchell', specialty: 'General Practice', date: '2026-04-18', time: '10:00 AM', duration: '8 min', status: 'completed', direction: 'outgoing' },
  { id: 8, type: 'video', doctor: 'Dr. Emily Chen', specialty: 'Dermatology', date: '2026-04-18', time: '1:00 PM', duration: '—', status: 'missed', direction: 'incoming' },
  { id: 9, type: 'chat', doctor: 'Dr. James Wilson', specialty: 'Orthopedics', date: '2026-04-17', time: '5:00 PM', duration: '8 messages', status: 'completed', direction: 'outgoing' },
  { id: 10, type: 'call', doctor: 'Dr. Raj Patel', specialty: 'Cardiology', date: '2026-04-16', time: '9:30 AM', duration: '15 min', status: 'completed', direction: 'incoming' },
];

const TYPE_CONFIG = {
  call: { icon: Phone, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'Voice Call' },
  video: { icon: Video, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'Video Call' },
  chat: { icon: MessageSquare, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', label: 'Chat' },
};

const TABS = [
  { id: 'all', label: 'All History' },
  { id: 'call', label: 'Voice Calls' },
  { id: 'video', label: 'Video Calls' },
  { id: 'chat', label: 'Messages' },
];

export default function CommunicationHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return DUMMY_HISTORY.filter(item => {
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      const matchesSearch = !searchTerm ||
        item.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchTerm]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(item => {
      const dateLabel = formatDateLabel(item.date);
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(item);
    });
    return groups;
  }, [filtered]);

  const handleItemClick = (item) => {
    if (item.type === 'chat') navigate('/chat/demo');
    else if (item.type === 'video') navigate('/video-call/demo');
    else navigate('/voice-call/demo');
  };

  const stats = useMemo(() => ({
    total: DUMMY_HISTORY.length,
    calls: DUMMY_HISTORY.filter(h => h.type === 'call').length,
    videos: DUMMY_HISTORY.filter(h => h.type === 'video').length,
    chats: DUMMY_HISTORY.filter(h => h.type === 'chat').length,
  }), []);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Custom Header (Replaces Navbar to fix duplicate back arrows) */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/portal')}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-md group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Communication Hub
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Your medical consultation history</p>
            </div>
          </div>

          <div className="hidden md:flex gap-3">
             <button onClick={() => navigate('/chat/demo')} className="px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold text-sm hover:bg-purple-500/20 transition-all flex items-center gap-2">
                <MessageSquare size={16} /> New Chat
             </button>
             <button onClick={() => navigate('/video-call/demo')} className="px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm hover:bg-blue-500/20 transition-all flex items-center gap-2">
                <Video size={16} /> Video Consult
             </button>
          </div>
        </header>

        {/* Top Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Logs', value: stats.total, color: 'from-gray-400 to-gray-600', icon: Calendar },
            { label: 'Voice Calls', value: stats.calls, color: 'from-emerald-400 to-emerald-600', icon: Phone },
            { label: 'Video Calls', value: stats.videos, color: 'from-blue-400 to-blue-600', icon: Video },
            { label: 'Messages', value: stats.chats, color: 'from-purple-400 to-purple-600', icon: MessageSquare },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm group hover:border-white/20 transition-colors"
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 blur-xl transition-opacity`} />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 font-medium text-sm">{stat.label}</span>
                  <Icon size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-4xl font-bold text-white tracking-tight">{stat.value}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-2xl">
          
          {/* Sidebar / Filters */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 p-6 flex flex-col">
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <div className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
              <Filter size={12} /> Filters
            </div>
            
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group ${
                    activeTab === tab.id 
                      ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <AnimatePresence mode="popLayout">
              {Object.entries(grouped).length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No records found</h3>
                  <p className="text-gray-500 max-w-sm">Try adjusting your filters or search term to find what you're looking for.</p>
                </motion.div>
              ) : (
                Object.entries(grouped).map(([dateLabel, items]) => (
                  <div key={dateLabel} className="mb-8 last:mb-0">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">{dateLabel}</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {items.map((item, idx) => {
                        const config = TYPE_CONFIG[item.type];
                        const Icon = config.icon;
                        const isMissed = item.status === 'missed';
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => handleItemClick(item)}
                            className="group relative bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{ backgroundColor: isMissed ? 'rgba(239, 68, 68, 0.1)' : config.bg }}>
                                {isMissed ? <PhoneMissed size={20} color="#ef4444" /> : <Icon size={20} color={config.color} />}
                              </div>
                              <div>
                                <h4 className={`text-base font-bold mb-1 ${isMissed ? 'text-red-400' : 'text-gray-100'}`}>
                                  {item.doctor}
                                </h4>
                                <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
                                  <span>{item.specialty}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                                  <span>{config.label}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="hidden sm:flex flex-col items-end">
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 mb-1">
                                  <Clock size={14} className="text-gray-500" />
                                  {item.time}
                                </div>
                                <span className="text-xs text-gray-500 font-medium">
                                  {item.duration}
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-white" />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
 
 
 
