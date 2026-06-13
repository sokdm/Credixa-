import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, MessageSquare, ArrowLeftRight,
  Lock, Unlock, Send, Search, ChevronLeft, LogOut,
  TrendingUp, DollarSign, UserCheck, Menu, CheckCircle,
  Download, AlertCircle, Bot, Wifi, WifiOff, Image as ImageIcon,
  X, Check, Copy, Phone, Mail, CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl ${className}`}>
    {children}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active
        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
        : 'text-white/60 hover:text-white hover:bg-white/10'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-rose-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
        {badge}
      </span>
    )}
  </motion.button>
);

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5"
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="text-white" size={20} />
    </div>
    <p className="text-white/50 text-xs">{label}</p>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [transferData, setTransferData] = useState({ userId: '', amount: '', description: '', senderName: '' });
  const [transferReceipt, setTransferReceipt] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const processedIdsRef = useRef(new Set());

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/admin/login'); return; }

    const newSocket = io(API_URL, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: true
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Admin socket connected');
      setSocketConnected(true);
      newSocket.emit('join_admin');
    });

    newSocket.on('connect_error', (err) => {
      console.log('Admin socket error:', err.message);
      setSocketConnected(false);
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
    });

    newSocket.on('reconnect', () => {
      console.log('Admin socket reconnected');
      setSocketConnected(true);
      newSocket.emit('join_admin');
    });

    newSocket.on('new_chat', (data) => {
      console.log('Admin received new_chat:', data);
      fetchChats();
    });

    newSocket.on('new_message', (msg) => {
      console.log('Admin received new_message:', msg);
      const msgId = msg._id?.toString();
      if (msgId && processedIdsRef.current.has(msgId)) {
        console.log('[DEDUP] Skipping duplicate message:', msgId);
        return;
      }
      if (msgId) processedIdsRef.current.add(msgId);

      if (selectedChat) {
        const chatUserId = selectedChat.userId?._id || selectedChat.userId;
        if (msg.sender === 'user') {
          setMessages(prev => {
            const exists = prev.some(m => m.timestamp === msg.timestamp && m.text === msg.text);
            if (exists) return prev;
            return [...prev, msg];
          });
        }
      }
      fetchChats();
    });

    return () => newSocket.close();
  }, [navigate, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'support') fetchChats();
    if (activeTab === 'transfers') fetchUsers();
  }, [activeTab]);

  const handleApiError = (err, context) => {
    console.error(`${context} error:`, err);
    const msg = err.response?.data?.error || err.message || 'Request failed';
    setApiError(`${context}: ${msg}`);
    setTimeout(() => setApiError(''), 5000);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setStats(res.data);
    } catch (err) { handleApiError(err, 'Stats'); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(res.data);
    } catch (err) { handleApiError(err, 'Users'); }
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/all`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setChats(res.data);
      const unread = res.data.reduce((acc, chat) =>
        acc + chat.messages.filter(m => m.sender === 'user' && !m.read).length, 0
      );
      setUnreadCount(unread);
    } catch (err) { handleApiError(err, 'Chats'); }
  };

  const handleLockUser = async (userId) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/lock`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchUsers();
    } catch (err) { handleApiError(err, 'Lock user'); }
  };

  const handleUnlockUser = async (userId) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/unlock`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchUsers();
    } catch (err) { handleApiError(err, 'Unlock user'); }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.userId || !transferData.amount) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/admin/transfer`, transferData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTransferReceipt(res.data.transaction);
      fetchStats();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const resetTransfer = () => {
    setTransferData({ userId: '', amount: '', description: '', senderName: '' });
    setTransferReceipt(null);
    setError('');
  };

  const openChat = async (chat) => {
    setSelectedChat(chat);
    setChatOpen(true);
    setMessages([]);
    processedIdsRef.current.clear();
    try {
      const userId = chat.userId?._id || chat.userId;
      const res = await axios.get(`${API_URL}/api/chat/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const serverMessages = res.data.messages || [];
      serverMessages.forEach(m => {
        if (m._id) processedIdsRef.current.add(m._id.toString());
      });
      setMessages(serverMessages);
      await axios.put(`${API_URL}/api/chat/read/${userId}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchChats();
    } catch (err) { handleApiError(err, 'Open chat'); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setApiError('Please select an image file');
      setTimeout(() => setApiError(''), 3000);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setApiError('Image must be under 10MB');
      setTimeout(() => setApiError(''), 3000);
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', selectedChat.userId?._id || selectedChat.userId);

    const res = await axios.post(`${API_URL}/api/chat/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getToken()}`
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      }
    });
    return res.data?.imageUrl;
  };

  const copyMessage = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      setApiError('Failed to copy message');
      setTimeout(() => setApiError(''), 3000);
    }
  };

  const handleTouchStart = (text, id) => {
    const timer = setTimeout(() => {
      copyMessage(text, id);
    }, 600);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };


  const sendReply = async (e) => {
    e.preventDefault();
    if ((!replyText.trim() && !selectedImage) || !selectedChat) return;

    const text = replyText.trim();
    setReplyText('');

    let imageUrl = null;
    if (selectedImage) {
      try {
        imageUrl = await uploadImage(selectedImage);
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        setApiError(`Image upload failed: ${errorMsg}`);
        setTimeout(() => setApiError(''), 5000);
        return;
      } finally {
        clearImageSelection();
      }
    }

    const userId = selectedChat.userId?._id || selectedChat.userId;
    const tempId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const optimisticMsg = {
      tempId,
      sender: 'admin',
      text: text || (imageUrl ? '📷 Image' : ''),
      imageUrl,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sending'
    };
    setMessages(prev => [...prev, optimisticMsg]);

    if (socketRef.current && socketConnected) {
      socketRef.current.emit('admin_reply', { userId, text, tempId, imageUrl });
      setMessages(prev => prev.map(m =>
        m.tempId === tempId ? { ...m, status: 'saved' } : m
      ));
    } else {
      try {
        const res = await axios.post(`${API_URL}/api/chat/reply/${userId}`,
          { text, tempId, imageUrl },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const savedMsg = res.data.messages[res.data.messages.length - 1];
        if (savedMsg._id) processedIdsRef.current.add(savedMsg._id.toString());
        setMessages(prev => prev.map(m =>
          m.tempId === tempId ? { ...savedMsg, status: 'saved' } : m
        ));
      } catch (err) {
        handleApiError(err, 'Send reply');
        setMessages(prev => prev.map(m =>
          m.tempId === tempId ? { ...m, status: 'failed' } : m
        ));
      }
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phoneNumber?.includes(searchQuery)
  );

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const downloadReceipt = () => {
    if (!transferReceipt) return;
    const content = `
╔══════════════════════════════════════════════════════════════╗
║                    CREDIXA BANKING                           ║
║                     OFFICIAL RECEIPT                         ║
╠══════════════════════════════════════════════════════════════╣
║  REFERENCE: ${transferReceipt.reference.padEnd(51)} ║
╠══════════════════════════════════════════════════════════════╣
║  Status:    ${'SUCCESSFUL'.padEnd(51)} ║
║  Type:      ${'Admin Transfer'.padEnd(51)} ║
║  Date:      ${formatDate(transferReceipt.date).padEnd(51)} ║
║  Time:      ${formatTime(transferReceipt.date).padEnd(51)} ║
╠══════════════════════════════════════════════════════════════╣
║  FROM: ${transferReceipt.senderName.padEnd(54)} ║
║  TO:   ${transferReceipt.receiverName.padEnd(54)} ║
║  ACCT: ${(transferReceipt.receiverAccountNumber || 'N/A').padEnd(54)} ║
╠══════════════════════════════════════════════════════════════╣
║  AMOUNT: ${transferReceipt.currency}${transferReceipt.amount.toLocaleString()}                                      ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Credixa-Receipt-${transferReceipt.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeSidebar = () => setSidebarOpen(false);

  const getLastMessagePreview = (chat) => {
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (!lastMsg) return 'No messages';
    if (lastMsg.imageUrl) return '📷 Image';
    return lastMsg.text?.substring(0, 40) + (lastMsg.text?.length > 40 ? '...' : '') || 'No text';
  };

  const getUnreadCount = (chat) => {
    return chat.messages.filter(m => m.sender === 'user' && !m.read).length;
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] text-white flex relative overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#0f0f1a] border-r border-white/10 z-50 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Credixa</h1>
              <p className="text-xs text-white/50">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); closeSidebar(); }} />
            <SidebarItem icon={Users} label="Users" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); closeSidebar(); }} />
            <SidebarItem icon={MessageSquare} label="Support" active={activeTab === 'support'} onClick={() => { setActiveTab('support'); closeSidebar(); }} badge={unreadCount} />
            <SidebarItem icon={ArrowLeftRight} label="Transfers" active={activeTab === 'transfers'} onClick={() => { setActiveTab('transfers'); closeSidebar(); }} />
          </nav>

          <div className="pt-4 border-t border-white/10">
            <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 min-w-0 flex flex-col min-h-[100dvh]">
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-lg sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Menu size={24} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-sm">Credixa Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {socketConnected ? (
              <Wifi size={14} className="text-emerald-400" />
            ) : (
              <WifiOff size={14} className="text-rose-400" />
            )}
            <span className={`text-xs ${socketConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {socketConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-rose-500/15 border border-rose-500/25 rounded-xl flex items-center gap-3"
            >
              <AlertCircle size={20} className="text-rose-400 flex-shrink-0" />
              <p className="text-rose-400 text-sm flex-1">{apiError}</p>
              <button onClick={() => setApiError('')} className="text-rose-400 p-1">
                <X size={16} />
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold">Dashboard Overview</h2>
                  <div className="hidden lg:flex items-center gap-1.5">
                    {socketConnected ? (
                      <Wifi size={14} className="text-emerald-400" />
                    ) : (
                      <WifiOff size={14} className="text-rose-400" />
                    )}
                    <span className={`text-xs ${socketConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {socketConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                  <StatCard icon={Users} label="Total Users" value={stats.totalUsers || 0} color="bg-blue-500" delay={0} />
                  <StatCard icon={TrendingUp} label="Transfers" value={stats.totalTransfers || 0} color="bg-emerald-500" delay={0.1} />
                  <StatCard icon={DollarSign} label="Volume" value={`$${(stats.totalVolume || 0).toLocaleString()}`} color="bg-violet-500" delay={0.2} />
                  <StatCard icon={UserCheck} label="Active" value={stats.activeUsers || 0} color="bg-sky-500" delay={0.3} />
                </div>
                <div className="mt-4 lg:mt-8 grid grid-cols-2 gap-3 lg:gap-6">
                  <GlassCard className="p-5">
                    <h3 className="text-sm font-semibold text-white/70 mb-2">Locked Accounts</h3>
                    <p className="text-3xl font-bold text-rose-400">{stats.lockedUsers || 0}</p>
                  </GlassCard>
                  <GlassCard className="p-5">
                    <h3 className="text-sm font-semibold text-white/70 mb-2">Unread Messages</h3>
                    <p className="text-3xl font-bold text-amber-400">{unreadCount || 0}</p>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold">User Management</h2>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 w-full sm:w-64"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredUsers.length === 0 && !apiError && (
                    <div className="text-center py-12 text-white/30">
                      <Users size={48} className="mx-auto mb-4" />
                      <p>No users found</p>
                    </div>
                  )}
                  {filteredUsers.map((u, idx) => (
                    <motion.div
                      key={u._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-base lg:text-lg font-bold flex-shrink-0 ${u.isLocked ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {u.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm lg:text-base truncate">{u.fullName}</h3>
                          <p className="text-white/50 text-xs truncate">{u.email}</p>
                          <p className="text-white/30 text-xs">{u.phoneNumber}</p>
                          <p className="text-white/50 text-xs mt-0.5">Bal: ${(u.balance || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => u.isLocked ? handleUnlockUser(u._id) : handleLockUser(u._id)}
                          className={`p-2.5 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                            u.isLocked
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                          }`}
                        >
                          {u.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}


            {activeTab === 'support' && (
              <motion.div key="support" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col">
                <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">Support Chat</h2>

                {!chatOpen ? (
                  <div className="space-y-3">
                    {chats.length === 0 && !apiError && (
                      <div className="text-center py-12 text-white/30">
                        <MessageSquare size={48} className="mx-auto mb-4" />
                        <p>No active chats</p>
                      </div>
                    )}
                    {chats.map((chat, idx) => {
                      const unread = getUnreadCount(chat);
                      const lastMsg = getLastMessagePreview(chat);
                      const user = chat.userId;
                      return (
                        <motion.div
                          key={chat._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => openChat(chat)}
                          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 active:bg-white/5 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">{user?.fullName?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm truncate">{user?.fullName}</h3>
                              {unread > 0 && (
                                <span className="bg-rose-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                  {unread}
                                </span>
                              )}
                            </div>
                            <p className="text-white/50 text-xs truncate">{user?.email}</p>
                            <p className="text-white/40 text-xs mt-1 truncate">{lastMsg}</p>
                          </div>
                          <ChevronLeft size={18} className="text-white/30 rotate-180 flex-shrink-0" />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="fixed inset-0 lg:static lg:inset-auto bg-[#0a0a0f] z-30 flex flex-col"
                  >
                    {/* Chat Header */}
                    <div className="bg-[#0f0f1a] px-3 lg:px-4 py-3 flex items-center gap-3 sticky top-0 z-20 border-b border-white/10">
                      <button
                        onClick={() => { setChatOpen(false); setSelectedChat(null); }}
                        className="text-white/70 hover:text-white p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {selectedChat?.userId?.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{selectedChat?.userId?.fullName}</h3>
                        <p className="text-white/50 text-xs truncate">{selectedChat?.userId?.email}</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3">
                      {messages.map((msg, idx) => {
                        const msgKey = msg._id || msg.tempId || `${msg.timestamp}-${idx}`;
                        const isAdmin = msg.sender === 'admin';
                        const displayText = msg.text || (msg.imageUrl ? '📷 Image' : '');

                        return (
                          <motion.div
                            key={msgKey}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-1`}
                          >
                            {!isAdmin && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                  {selectedChat?.userId?.fullName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}

                            <div
                              className={`relative max-w-[85%] lg:max-w-[70%] px-3.5 py-2.5 rounded-2xl shadow-sm select-text cursor-pointer active:scale-[0.98] transition-transform ${
                                isAdmin
                                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-sm'
                                  : 'bg-white/10 text-white rounded-bl-sm'
                              }`}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                copyMessage(displayText, msgKey);
                              }}
                              onTouchStart={() => handleTouchStart(displayText, msgKey)}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchEnd}
                            >
                              {/* Copy feedback */}
                              {copiedId === msgKey && (
                                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center z-10 backdrop-blur-[1px]">
                                  <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full">
                                    <Check size={12} className="text-emerald-400" />
                                    <span className="text-white text-xs font-medium">Copied</span>
                                  </div>
                                </div>
                              )}

                              {/* Image */}
                              {msg.imageUrl && (
                                <div className="mb-2 rounded-xl overflow-hidden bg-black/20">
                                  <img
                                    src={msg.imageUrl}
                                    alt="Shared image"
                                    className="max-w-full max-h-[280px] lg:max-h-[320px] object-cover cursor-pointer"
                                    loading="lazy"
                                    onClick={() => window.open(msg.imageUrl, '_blank')}
                                  />
                                </div>
                              )}

                              {/* Text */}
                              {msg.text && msg.text !== '📷 Image' && (
                                <p className="text-[13px] lg:text-sm leading-relaxed pr-14 whitespace-pre-wrap break-words">{msg.text}</p>
                              )}

                              {/* Meta */}
                              <div className={`absolute bottom-1.5 right-2 flex items-center gap-1 text-[10px] ${isAdmin ? 'text-white/50' : 'text-white/35'}`}>
                                <span>{formatTime(msg.timestamp)}</span>
                                {isAdmin && (
                                  <div className="flex items-center gap-0.5 ml-1">
                                    <Bot size={10} />
                                    <span>{msg.read ? '✓✓' : '✓'}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {isAdmin && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center ml-2 mt-1 flex-shrink-0 shadow-md">
                                <Bot size={14} className="text-white" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Image Preview Bar */}
                    {imagePreview && (
                      <div className="bg-[#0f0f1a] border-t border-white/10 px-3 py-2 flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                          <button
                            onClick={clearImageSelection}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-md"
                          >
                            <X size={10} />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-xs truncate">{selectedImage?.name}</p>
                          <p className="text-white/40 text-[10px]">{(selectedImage?.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Input */}
                    <form onSubmit={sendReply} className="p-3 lg:p-4 border-t border-white/10 flex items-end gap-2 bg-[#0f0f1a]/80 backdrop-blur-lg">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 lg:w-11 lg:h-11 flex-shrink-0 rounded-full bg-white/10 hover:bg-white/15 active:bg-white/5 flex items-center justify-center text-white/50 hover:text-white/70 transition-colors min-w-[44px] min-h-[44px]"
                      >
                        <ImageIcon size={20} />
                      </button>
                      <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 min-h-[44px] flex items-center">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm lg:text-base w-full"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        type="submit"
                        disabled={(!replyText.trim() && !selectedImage)}
                        className="w-10 h-10 lg:w-11 lg:h-11 flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white disabled:opacity-30 shadow-lg min-w-[44px] min-h-[44px]"
                      >
                        <Send size={18} />
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'transfers' && (
              <motion.div key="transfers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-lg mx-auto lg:mx-0">
                <h2 className="text-2xl lg:text-3xl font-bold mb-6">Admin Transfer</h2>

                {error && (
                  <div className="mb-4 p-4 bg-rose-500/15 border border-rose-500/25 text-rose-400 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {!transferReceipt ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <form onSubmit={handleTransfer} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 lg:p-8 space-y-4 lg:space-y-6">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Select User</label>
                        <select
                          value={transferData.userId}
                          onChange={(e) => setTransferData({...transferData, userId: e.target.value})}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-violet-500 appearance-none"
                        >
                          <option value="" className="bg-gray-900 text-white">Select a user</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id} className="bg-gray-900 text-white">
                              {u.fullName} - {u.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Amount</label>
                        <input
                          type="number"
                          value={transferData.amount}
                          onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                          required
                          min="1"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Sender Name (shown to user)</label>
                        <input
                          type="text"
                          value={transferData.senderName}
                          onChange={(e) => setTransferData({...transferData, senderName: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                          placeholder="e.g. Credixa Bonus"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Description</label>
                        <input
                          type="text"
                          value={transferData.description}
                          onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                          placeholder="Optional"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold text-base shadow-lg disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send'}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-emerald-400" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-emerald-400">Transfer Successful!</h3>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg border-2 border-violet-500/30 rounded-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-4 lg:p-6 text-center border-b border-white/10">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <h3 className="font-bold text-lg">CREDIXA BANKING</h3>
                        <p className="text-white/50 text-xs">Official Transaction Receipt</p>
                      </div>

                      <div className="p-4 lg:p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-white/50 text-xs">Reference Number</span>
                          <span className="font-mono font-semibold text-sm">{transferReceipt.reference}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-white/50 text-xs">Status</span>
                          <span className="text-emerald-400 font-bold text-sm uppercase">{transferReceipt.status}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-white/50 text-xs">Date</span>
                          <span className="text-sm">{formatDate(transferReceipt.date)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-white/50 text-xs">Time</span>
                          <span className="text-sm">{formatTime(transferReceipt.date)}</span>
                        </div>
                        <div className="py-3 border-b border-white/5">
                          <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">From</p>
                          <p className="font-semibold text-sm">{transferReceipt.senderName}</p>
                          <p className="text-xs text-white/50">System Administrator</p>
                          <p className="text-xs text-white/50">Credixa Banking</p>
                        </div>
                        <div className="py-3 border-b border-white/5">
                          <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">To</p>
                          <p className="font-semibold text-sm">{transferReceipt.receiverName}</p>
                          <p className="text-xs text-white/50">{transferReceipt.receiverAccountNumber || 'N/A'}</p>
                          <p className="text-xs text-white/50">{transferReceipt.bankName || 'Credixa Banking'}</p>
                        </div>
                        <div className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-xl p-4 text-center">
                          <p className="text-white/50 text-xs mb-1">Amount Transferred</p>
                          <p className="text-3xl font-bold text-white">{transferReceipt.currency}{transferReceipt.amount.toLocaleString()}</p>
                        </div>

                        {transferReceipt.narration && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-white/50 text-xs">Narration</span>
                            <span className="text-sm text-right">{transferReceipt.narration}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t border-white/10 flex gap-3">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={resetTransfer}
                          className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium text-sm"
                        >
                          New Transfer
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={downloadReceipt}
                          className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
