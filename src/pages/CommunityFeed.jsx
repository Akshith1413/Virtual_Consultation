import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiArrowLeft, FiSend, FiHeart, FiMessageCircle, FiUsers, FiClock, FiShield, FiAlertTriangle, FiPlus, FiMoreVertical, FiCheckCircle } from 'react-icons/fi';
import { MdStars, MdVerified, MdOutlineSpeakerNotes } from 'react-icons/md';

const CommunityFeed = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [queryMessage, setQueryMessage] = useState('');
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [selectedPostForReport, setSelectedPostForReport] = useState(null);

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchCommunityData = useCallback(async () => {
        try {
            setLoading(true);
            const [groupRes, postsRes] = await Promise.all([
                axios.get(`groups/discover`, { params: { search: id }, headers }),
                axios.get(`groups/${id}/posts`, { headers })
            ]);
            
            const foundGroup = Array.isArray(groupRes.data) ? groupRes.data.find(g => g._id === id) : groupRes.data;
            setGroup(foundGroup);
            setPosts(postsRes.data);
        } catch (err) {
            console.error("Failed to fetch community data", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCommunityData();
    }, [fetchCommunityData]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        setSubmitting(true);
        try {
            const response = await axios.post(`groups/${id}/posts`, { content: newPostContent }, { headers });
            setPosts([response.data, ...posts]);
            setNewPostContent('');
        } catch (err) {
            alert(err.response?.data?.message || "Only admins can post daily tips.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendQuery = async (type = 'query') => {
        if (!queryMessage.trim()) return;
        setSubmitting(true);
        try {
            await axios.post(`groups/${id}/queries`, { 
                message: queryMessage, 
                type, 
                postId: selectedPostForReport?._id 
            }, { headers });
            alert("Your inquiry has been sent to the community admin. They will reach out soon.");
            setQueryMessage('');
            setShowQueryModal(false);
            setSelectedPostForReport(null);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const response = await axios.post(`groups/posts/${postId}/like`, {}, { headers });
            setPosts(posts.map(p => p._id === postId ? response.data : p));
        } catch (err) {
            console.error("Failed to like post", err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!group) return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold dark:text-white mb-4">Community Not Found</h1>
            <button onClick={() => navigate('/groups')} className="bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold">Back to Communities</button>
        </div>
    );

    const isAdmin = group.creator === user?._id;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors pb-20">
            <Navbar />
            
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/groups')}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-500 font-black text-xs uppercase tracking-widest mb-8 transition-colors"
                >
                    <FiArrowLeft /> Back to Communities
                </button>

                {/* Enhanced Community Header */}
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-2xl shadow-indigo-500/5 border border-white dark:border-slate-700 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
                    
                    <div className="relative flex flex-col md:flex-row gap-10 items-center md:items-start">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-600/30 ring-8 ring-indigo-50 dark:ring-indigo-900/20">
                            {group.groupName.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-4">
                                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                    {group.groupName} <MdVerified className="text-blue-500 text-3xl" />
                                </h1>
                                <span className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                    Official Broadcast Channel
                                </span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-xl leading-relaxed mb-8 max-w-3xl">
                                {group.description}
                            </p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-8 text-sm">
                                <div className="flex items-center gap-2 font-black text-gray-800 dark:text-gray-200">
                                    <FiUsers className="text-indigo-500" /> {group.membersCount || 0} Members
                                </div>
                                <div className="flex items-center gap-2 font-black text-gray-800 dark:text-gray-200">
                                    <FiShield className="text-emerald-500" /> Medical Verified
                                </div>
                                <div className="flex items-center gap-2 font-black text-gray-800 dark:text-gray-200">
                                    <FiClock className="text-amber-500" /> Daily Updates
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Left Side: Feed */}
                    <div className="lg:col-span-3 space-y-8">
                        
                        {/* Broadcast Input (Only for Admin) */}
                        {isAdmin && (
                            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl shadow-black/5 border-2 border-indigo-500/20">
                                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MdOutlineSpeakerNotes /> Post Official Daily Tip
                                </h3>
                                <form onSubmit={handleCreatePost}>
                                    <textarea 
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="Write today's medical insight..."
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-6 text-base font-medium outline-none transition-all dark:text-white resize-none"
                                        rows={4}
                                    />
                                    <div className="flex justify-end mt-4">
                                        <button 
                                            disabled={submitting || !newPostContent.trim()}
                                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 disabled:bg-gray-400 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Broadcast Tip <FiSend />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Posts List */}
                        <div className="space-y-8">
                            <AnimatePresence mode="popLayout">
                                {posts.length > 0 ? (
                                    posts.map(post => (
                                        <motion.div 
                                            key={post._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-white dark:border-slate-700 relative group"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
                                                        {post.authorName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                                                            {post.authorName} <MdVerified className="text-blue-500" />
                                                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[8px] rounded-full uppercase">Admin</span>
                                                        </h4>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="text-gray-300 hover:text-indigo-500 transition-colors">
                                                    <FiMoreVertical size={20} />
                                                </button>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-3xl p-6 mb-8 border border-gray-100 dark:border-slate-700/50">
                                                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-medium">
                                                    {post.content}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-700/50">
                                                <div className="flex items-center gap-8">
                                                    <button 
                                                        onClick={() => handleLikePost(post._id)}
                                                        className={`flex items-center gap-2 text-sm font-black transition-all ${post.likes?.includes(user?._id) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                                                    >
                                                        <FiHeart className={post.likes?.includes(user?._id) ? 'fill-current' : ''} /> {post.likes?.length || 0}
                                                    </button>
                                                    <button className="flex items-center gap-2 text-sm text-gray-400 font-black hover:text-indigo-500 transition-all">
                                                        <FiMessageCircle /> Replies
                                                    </button>
                                                </div>
                                                
                                                <div className="flex gap-4">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedPostForReport(post);
                                                            setShowQueryModal(true);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-900/20"
                                                    >
                                                        <FiAlertTriangle /> Report Concern
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-700">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <FiClock className="text-3xl text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm">Waiting for today's tip...</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side: Sidebar */}
                    <div className="space-y-8">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setSelectedPostForReport(null);
                                setShowQueryModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-[2rem] font-black uppercase tracking-[0.1em] text-sm shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
                        >
                            <FiPlus className="text-xl" /> Private Reach Out
                        </motion.button>

                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-white dark:border-slate-700">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FiShield className="text-indigo-500" /> Community Trust
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shrink-0">
                                        <FiCheckCircle />
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                                        All posts are verified by our medical board before broadcasting.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                                        <FiMessageCircle />
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Admin reach-outs are monitored for safety and response quality.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                             <h3 className="text-base font-black mb-4 flex items-center gap-2">
                                 <MdStars className="text-amber-400" /> Member Hub
                             </h3>
                             <p className="text-xs font-medium text-indigo-200 leading-relaxed italic mb-6">
                                 "You are part of a verified medical circle. Your privacy and health safety are our top priorities."
                             </p>
                             <div className="pt-6 border-t border-white/10">
                                 <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Your Role</p>
                                 <p className="text-sm font-bold">Verified Member</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Query / Report Modal */}
            <AnimatePresence>
                {showQueryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowQueryModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl border border-white dark:border-slate-700"
                        >
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                {selectedPostForReport ? 'Report Medical Concern' : 'Private Inquiry'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                                {selectedPostForReport 
                                    ? "Explain your concern regarding this specific tip. Our admins will investigate immediately."
                                    : "Send a private message to the community admin for help or clarification."}
                            </p>

                            <textarea 
                                value={queryMessage}
                                onChange={(e) => setQueryMessage(e.target.value)}
                                placeholder="Describe your concern or query in detail..."
                                className="w-full bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-6 text-sm font-medium outline-none transition-all dark:text-white resize-none"
                                rows={5}
                            />

                            <div className="flex gap-4 mt-8">
                                <button 
                                    onClick={() => setShowQueryModal(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleSendQuery(selectedPostForReport ? 'report' : 'reach_out')}
                                    disabled={submitting || !queryMessage.trim()}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
                                >
                                    Send to Admin
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default CommunityFeed;
