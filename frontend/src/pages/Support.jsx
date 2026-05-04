import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, MessageCircle, CheckCheck, Clock, WifiOff, Bot, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://credixa-api.onrender.com';
const SOCKET_URL = API_URL;

const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!token) return null;
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    return {
      _id: payload.id || payload._id || payload.userId,
      email: payload.email,
      fullName: payload.fullName || payload.name
    };
  } catch (e) {
    return null;
  }
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const Support = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserFromToken);
  const [authChecked, setAuthChecked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [lastError, setLastError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const initializedRef = useRef(false);
  const inputRef = useRef(null);
  // Track processed message IDs to prevent duplicates from socket
  const processedIdsRef = useRef(new Set());

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        setUser(null);
        setAuthChecked(true);
        return;
      }
      try {
        const res = await api.get('/api/user/profile', { timeout: 8000 });
        if (res.data?._id || res.data?.id) {
          setUser(res.data);
          localStorage.setItem('userData', JSON.stringify(res.data));
        }
      } catch (err) {
        console.log('Profile fetch failed, using token user:', err.message);
      }
      setAuthChecked(true);
    };
    verifyAuth();
  }, []);

  const getStorageKey = useCallback(() => {
    return user?._id ? `support_chat_${user._id}` : 'support_chat_guest';
  }, [user?._id]);

  // Load messages — Server is source of truth
  useEffect(() => {
    if (!user?._id || initializedRef.current) return;
    initializedRef.current = true;

    const key = getStorageKey();
    
    api.get('/api/chat/user', { timeout: 10000 })
      .then(res => {
        const serverMessages = res.data?.messages || [];
        // Reset processed IDs with server messages
        processedIdsRef.current = new Set(
          serverMessages.map(m => m._id?.toString()).filter(Boolean)
        );
        setMessages(serverMessages);
        localStorage.setItem(key, JSON.stringify(serverMessages));
      })
      .catch(err => {
        console.error('[LOAD]', err.message);
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              processedIdsRef.current = new Set(
                parsed.map(m => m._id?.toString()).filter(Boolean)
              );
              setMessages(parsed);
            }
          } catch (e) {}
        }
      });
  }, [user?._id, getStorageKey]);

  // Save confirmed messages only
  useEffect(() => {
    if (user?._id && messages.length > 0) {
      const confirmed = messages.filter(m => m._id || m.status === 'saved');
      localStorage.setItem(getStorageKey(), JSON.stringify(confirmed));
    }
  }, [messages, user?._id, getStorageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket — FIXED: Proper cleanup, single listeners, deduplication
  useEffect(() => {
    if (!user?._id) return;

    // Disconnect any existing socket first
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketStatus('connected');
      socket.emit('join_user', user._id);
      socket.emit('join_chat', user._id);
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setSocketStatus('error');
    });

    // FIXED: Deduplicate incoming messages using _id
    socket.on('new_message', (msg) => {
      const msgId = msg._id?.toString() || msg.tempId;
      
      // Skip if we've already processed this message
      if (msgId && processedIdsRef.current.has(msgId)) {
        console.log('[DEDUP] Skipping duplicate message:', msgId);
        return;
      }
      
      // Mark as processed
      if (msgId) processedIdsRef.current.add(msgId);

      setMessages(prev => {
        // Also check if message exists in current state (double safety)
        const exists = prev.some(m => 
          (m._id && msg._id && m._id.toString() === msg._id.toString()) ||
          (m.tempId && msg.tempId && m.tempId === msg.tempId)
        );
        if (exists) return prev;

        // If this was our pending message, replace it
        if (msg.tempId) {
          const hasPending = prev.some(m => m.tempId === msg.tempId);
          if (hasPending) {
            return prev.map(m => m.tempId === msg.tempId ? { ...msg, status: 'saved' } : m);
          }
        }

        return [...prev, { ...msg, status: 'saved' }];
      });
    });

    return () => {
      console.log('[SOCKET] Cleaning up socket');
      socket.disconnect();
      socket.off('new_message');
      socket.off('connect');
      socket.off('disconnect');
      socketRef.current = null;
    };
  }, [user?._id, getStorageKey]);

  const sendMessage = useCallback(async () => {
    const text = newMessage.trim();
    if (!text) {
      setLastError('Type a message first');
      return;
    }
    if (!user?._id) {
      setLastError('Not logged in');
      return;
    }
    if (isSending) return;

    setNewMessage('');
    setIsSending(true);
    setLastError(null);

    const tempId = generateTempId();
    const now = new Date().toISOString();
    const msg = {
      tempId,
      userId: user._id,
      sender: 'user',
      text,
      timestamp: now,
      read: false,
      status: 'sending'
    };

    setMessages(prev => [...prev, msg]);

    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', msg);
    } else {
      try {
        const res = await api.post('/api/chat/user', { text, userId: user._id, tempId });
        const savedMsg = { ...res.data, tempId, status: 'saved' };
        const msgId = savedMsg._id?.toString();
        if (msgId) processedIdsRef.current.add(msgId);
        setMessages(prev => prev.map(m => m.tempId === tempId ? savedMsg : m));
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        const status = err.response?.status || 'network';
        setLastError(`${errorMsg} (${status})`);
        setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, status: 'failed' } : m));
      }
    }

    setIsSending(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [newMessage, user?._id, isSending]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      localStorage.removeItem(getStorageKey());
      processedIdsRef.current.clear();
      setMessages([]);
    }
  };

  const getStatusDisplay = () => {
    switch (socketStatus) {
      case 'connected': return { text: 'Online', color: 'text-green-400' };
      case 'disconnected': return { text: 'Offline', color: 'text-orange-400' };
      case 'error': return { text: 'Error', color: 'text-red-400' };
      default: return { text: 'Connecting...', color: 'text-yellow-400' };
    }
  };

  const status = getStatusDisplay();

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?._id) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Please log in to access support</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-full text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col">
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 sticky top-0 z-20 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white p-1">
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
          C
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white text-sm">Credixa Support</h2>
          <p className={`text-xs flex items-center gap-1.5 ${status.color}`}>
            <span className={`w-2 h-2 rounded-full ${socketStatus === 'connected' ? 'bg-green-400' : socketStatus === 'disconnected' ? 'bg-orange-400' : 'bg-yellow-400 animate-pulse'}`}></span>
            {status.text}
          </p>
        </div>
        <button onClick={clearChat} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10">
          End Chat
        </button>
      </div>

      {lastError && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-red-300 text-xs flex-1">{lastError}</p>
          <button onClick={() => setLastError(null)} className="text-red-400 text-xs">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3" style={{backgroundColor:'#0b141a'}}>
        <div className="max-w-2xl mx-auto space-y-1">
          <div className="flex justify-center mb-4">
            <span className="bg-[#1f2c34] text-white/40 text-[11px] px-3 py-1 rounded-lg">Today</span>
          </div>

          {messages.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle size={48} className="text-white/15 mx-auto mb-4" />
              <p className="text-white/30 text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg._id || msg.tempId || `${msg.timestamp}-${idx}`}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
              >
                {msg.sender === 'admin' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-md">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`relative max-w-[80%] px-3.5 py-2 rounded-2xl shadow-sm ${
                  msg.sender === 'user' ? 'bg-[#005c4b] text-white rounded-tr-sm' : 'bg-[#1f2c34] text-white rounded-tl-sm'
                } ${msg.status === 'sending' ? 'opacity-70' : ''}`}>
                  <p className="text-[13px] leading-relaxed pr-14">{msg.text}</p>
                  <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[10px] ${msg.sender === 'user' ? 'text-white/50' : 'text-white/35'}`}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'user' && (
                      <>
                        {msg.status === 'sending' && <Clock size={10} className="animate-spin" />}
                        {msg.status === 'saved' && <CheckCheck size={10} className="text-sky-400" />}
                        {msg.status === 'failed' && <WifiOff size={10} className="text-red-400" />}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        className="bg-[#1f2c34] px-3 py-2.5 flex items-center gap-2 border-t border-white/5"
      >
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-white/35 outline-none text-sm w-full"
            disabled={isSending}
            onKeyDown={handleKeyDown}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 shadow-lg"
        >
          <Send size={18} />
        </motion.button>
      </form>
    </div>
  );
};

export default Support;
