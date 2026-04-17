import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getGroupRecommendations } from '../services/aiService';
import { FiSearch, FiPlus, FiUsers, FiFilter, FiTrendingUp, FiCheck, FiArrowRight, FiInfo } from 'react-icons/fi';
import { MdGroups, MdOutlineExplore, MdStars, MdVerified } from 'react-icons/md';

const Groups = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: 'chronic_diseases', label: 'Chronic Diseases', icon: '🏥' },
    { value: 'mental_health', label: 'Mental Health', icon: '🧠' },
    { value: 'fitness_goals', label: 'Fitness Goals', icon: '💪' },
    { value: 'diet_nutrition', label: 'Diet & Nutrition', icon: '🥗' },
    { value: 'recovery_support', label: 'Recovery Support', icon: '🌱' },
    { value: 'preventive_care', label: 'Preventive Care', icon: '🛡️' },
    { value: 'family_health', icon: '👨‍👩‍👧‍👦', label: 'Family Health' },
    { value: 'other', label: 'Other', icon: '🔗' }
  ];

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await axios.get(`groups/discover?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGroups(response.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const fetchMyGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('groups/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyGroups(response.data);
    } catch (err) {
      console.error('Failed to fetch my groups:', err);
      setError('Failed to load your groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestedGroups = useCallback(async () => {
    try {
      setLoading(true);
      const aiData = await getGroupRecommendations();
      if (aiData && aiData.success) {
        const mappedGroups = (aiData.recommendations || []).map(r => ({
           ...r.group,
           _aiMatchScore: r.matchScore,
           _aiMatchReasons: r.matchReasons
        }));
        setSuggestedGroups(mappedGroups);
      } else {
        const response = await axios.get('groups/suggested', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuggestedGroups(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch suggested groups:', err);
      setError('Failed to load suggested groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'discover') fetchGroups();
    else if (activeTab === 'my-groups') fetchMyGroups();
    else if (activeTab === 'suggested') fetchSuggestedGroups();
  }, [activeTab, fetchGroups, fetchMyGroups, fetchSuggestedGroups]);

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await axios.post(`/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(response.data.message);
      if (activeTab === 'discover') fetchGroups();
      else if (activeTab === 'suggested') fetchSuggestedGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join group');
    }
  };

  const CommunityCard = ({ group, isJoined = false }) => {
    const cat = categories.find(c => c.value === group.category);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -8 }}
        className="relative group bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all transform group-hover:scale-125 group-hover:rotate-12">
            <span className="text-7xl">{cat?.icon || '🤝'}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30">
                <MdVerified className="text-sm" /> Verified Channel
            </div>
            {group._aiMatchScore && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30">
                    <MdStars className="text-sm" /> {group._aiMatchScore}% AI Match
                </div>
            )}
        </div>

        <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                {group.groupName.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-1">{group.groupName}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {cat?.label || 'General'}
                    </span>
                </div>
            </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 line-clamp-3 min-h-[4.5rem]">
            {group.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-slate-700/50">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <FiUsers className="text-gray-400" />
                    <span className="text-sm font-black text-gray-900 dark:text-white">{group.membersCount || 0}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Members</span>
            </div>
            
            {isJoined ? (
                <button 
                    onClick={() => navigate(`/community/${group._id}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                >
                    Open Hub <FiArrowRight className="text-base" />
                </button>
            ) : (
                <button 
                    onClick={() => handleJoinGroup(group._id)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                    Join <FiPlus className="text-base" />
                </button>
            )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="flex-1">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-4"
                >
                    <div className="w-14 h-14 rounded-[2rem] bg-indigo-600 shadow-xl shadow-indigo-600/20 flex items-center justify-center text-white">
                        <MdGroups className="text-4xl" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Official Communities</h1>
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg font-medium leading-relaxed">
                    Access verified health insights, daily medical tips, and expert-led broadcast channels tailored to your health profile.
                </p>
            </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-[2rem] border border-white dark:border-slate-700 shadow-sm">
            <div className="flex p-1 bg-gray-100/50 dark:bg-slate-900/50 rounded-2xl w-full lg:w-auto">
                {[
                    { id: 'discover', label: 'Discover', icon: <MdOutlineExplore /> },
                    { id: 'suggested', label: 'AI Recommended', icon: <MdStars /> },
                    { id: 'my-groups', label: 'My Communities', icon: <FiCheck /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all flex-1 lg:flex-none ${activeTab === tab.id 
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xl shadow-black/5' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto px-4">
                <div className="relative flex-1 lg:w-80">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search by condition..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium transition-all outline-none dark:text-white"
                    />
                </div>
                <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 transition-colors">
                    <FiFilter className="text-gray-500" />
                </button>
            </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
            <button 
                onClick={() => setSelectedCategory('')}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === '' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}
            >
                All Categories
            </button>
            {categories.map(cat => (
                <button 
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${selectedCategory === cat.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}
                >
                    {cat.icon} {cat.label}
                </button>
            ))}
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
                {activeTab === 'discover' && groups.map(g => <CommunityCard key={g._id} group={g} />)}
                {activeTab === 'suggested' && suggestedGroups.map(g => <CommunityCard key={g._id} group={g} />)}
                {activeTab === 'my-groups' && myGroups.map(g => <CommunityCard key={g._id} group={g} isJoined={true} />)}
            </AnimatePresence>
        </div>

        {/* Empty States */}
        {!loading && (
            (activeTab === 'discover' && groups.length === 0) ||
            (activeTab === 'suggested' && suggestedGroups.length === 0) ||
            (activeTab === 'my-groups' && myGroups.length === 0)
        ) && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-4xl mb-6">
                    🏝️
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Communities Found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    We couldn't find any communities matching your criteria. Try adjusting your filters or search terms.
                </p>
            </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Groups;
 
 
 
 
 
 
 

// minor tweak for clarity
