import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, MessageCircle, CheckCheck, Clock, WifiOff, Bot, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://credixa-api.onrender.com';
const SOCKET_URL = API_URL;

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth header to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Support = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [lastError, setLastError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const initializedRef = useRef(false);
  const inputRef = useRef(null);

  const getStorageKey = useCallback(() => {
    return user?._id ? `support_chat_${user._id}` : 'support_chat_guest';
  }, [user?._id]);

  // Load messages
  useEffect(() => {
    if (!user?._id || initializedRef.current) return;
    initializedRef.current = true;

    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      } catch (e) {}
    }

    api.get('/api/chat/user', { timeout: 10000 })
      .then(res => {
        if (res.data?.messages?.length > 0) {
          setMessages(prev => {
            const combined = [...prev, ...res.data.messages];
            const unique = combined.filter((m, i, a) =>
              i === a.findIndex(t => t.timestamp === m.timestamp && t.text === m.text)
            );
            localStorage.setItem(key, JSON.stringify(unique));
            return unique;
          });
        }
      })
      .catch(err => {
        console.error('[LOAD ERROR]', err.message);
      });
  }, [user?._id, getStorageKey]);

  // Save messages
  useEffect(() => {
    if (user?._id && messages.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(messages));
    }
  }, [messages, user?._id, getStorageKey]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket
  useEffect(() => {
    if (!user?._id) return;

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SOCKET] Connected:', socket.id);
      setSocketStatus('connected');
      socket.emit('join_user', user._id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
      setSocketStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.log('[SOCKET] Error:', err.message);
      setSocketStatus('error');
    });

    socket.on('new_message', (msg) => {
      if (msg.sender === 'admin') {
        setMessages(prev => {
          const exists = prev.some(m => m.timestamp === msg.timestamp && m.text === msg.text);
          if (exists) return prev;
          const updated = [...prev, msg];
          localStorage.setItem(getStorageKey(), JSON.stringify(updated));
          return updated;
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, getStorageKey]);

  // SEND MESSAGE
  const sendMessage = useCallback(async () => {
    const text = newMessage.trim();
    
    console.log('[SEND] Start. Text:', text, 'User:', user?._id);
    setDebugInfo(`Sending: "${text}"...`);
    
    if (!text) {
      setLastError('Please type a message');
      setDebugInfo('Error: No text');
      return;
    }
    if (!user?._id) {
      setLastError('Not logged in');
      setDebugInfo('Error: No user');
      return;
    }
    if (isSending) {
      setDebugInfo('Error: Already sending');
      return;
    }

    setNewMessage('');
    setIsSending(true);
    setLastError(null);

    const now = new Date().toISOString();
    const msg = {
      userId: user._id,
      sender: 'user',
      text,
      timestamp: now,
      read: false,
      status: 'sending'
    };

    // Add to UI immediately
    setMessages(prev => {
      const updated = [...prev, msg];
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      return updated;
    });

    // Socket attempt
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', msg);
    }

    // REST API
    try {
      console.log('[SEND] POST /api/chat/user');
      setDebugInfo('POST /api/chat/user...');
      
      const res = await api.post('/api/chat/user', {
        text: text,
        userId: user._id
      });

      console.log('[SEND] Success:', res.data);
      setDebugInfo(`Success! Status: ${res.status}`);

      setMessages(prev => {
        const updated = prev.map(m =>
          m.timestamp === msg.timestamp
            ? { ...m, status: 'saved', _id: res.data._id || res.data.timestamp || m._id }
            : m
        );
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      console.error('[SEND] FAILED:', err);
      const errorMsg = err.response?.data?.error || err.message;
      const status = err.response?.status || 'network';
      setLastError(`Send failed: ${errorMsg} (${status})`);
      setDebugInfo(`Failed: ${errorMsg} (${status})`);
      
      setMessages(prev => {
        const updated = prev.map(m =>
          m.timestamp === msg.timestamp ? { ...m, status: 'failed' } : m
        );
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        return updated;
      });
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [newMessage, user?._id, isSending, getStorageKey]);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Please log in</p>
          <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-full text-sm">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col">
      {/* Header */}
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

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-1">
          <p className="text-blue-300 text-[10px] font-mono">{debugInfo}</p>
        </div>
      )}

      {/* Error Banner */}
      {lastError && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-red-300 text-xs flex-1">{lastError}</p>
          <button onClick={() => setLastError(null)} className="text-red-400 text-xs">✕</button>
        </div>
      )}

      {/* Chat Area */}
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
                key={`${msg._id || msg.timestamp}-${idx}`}
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

      {/* Input */}
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
