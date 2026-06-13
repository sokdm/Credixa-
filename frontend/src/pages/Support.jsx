import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, MessageCircle, CheckCheck, Clock, WifiOff, Bot, AlertCircle, Image as ImageIcon, X, Check } from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const initializedRef = useRef(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
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

  useEffect(() => {
    if (!user?._id || initializedRef.current) return;
    initializedRef.current = true;

    const key = getStorageKey();

    api.get('/api/chat/user', { timeout: 10000 })
      .then(res => {
        const serverMessages = res.data?.messages || [];
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

  useEffect(() => {
    if (user?._id && messages.length > 0) {
      const confirmed = messages.filter(m => m._id || m.status === 'saved');
      localStorage.setItem(getStorageKey(), JSON.stringify(confirmed));
    }
  }, [messages, user?._id, getStorageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user?._id) return;

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

    socket.on('new_message', (msg) => {
      const msgId = msg._id?.toString() || msg.tempId;
      if (msgId && processedIdsRef.current.has(msgId)) {
        console.log('[DEDUP] Skipping duplicate message:', msgId);
        return;
      }
      if (msgId) processedIdsRef.current.add(msgId);

      setMessages(prev => {
        const exists = prev.some(m =>
          (m._id && msg._id && m._id.toString() === msg._id.toString()) ||
          (m.tempId && msg.tempId && m.tempId === msg.tempId)
        );
        if (exists) return prev;

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLastError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLastError('Image must be under 10MB');
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setLastError(null);
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
    formData.append('userId', user._id);

    const res = await api.post('/api/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      }
    });
    return res.data?.imageUrl;
  };

  const sendMessage = useCallback(async () => {
    const text = newMessage.trim();
    const hasImage = !!selectedImage;

    if (!text && !hasImage) {
      setLastError('Type a message or attach an image');
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

    let imageUrl = null;
    if (hasImage) {
      try {
        imageUrl = await uploadImage(selectedImage);
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        setLastError(`Image upload failed: ${errorMsg}`);
        setIsSending(false);
        return;
      } finally {
        clearImageSelection();
      }
    }

    const tempId = generateTempId();
    const now = new Date().toISOString();
    const msg = {
      tempId,
      userId: user._id,
      sender: 'user',
      text: text || (imageUrl ? '📷 Image' : ''),
      imageUrl,
      timestamp: now,
      read: false,
      status: 'sending'
    };

    setMessages(prev => [...prev, msg]);

    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', msg);
      setTimeout(() => setIsSending(false), 300);
    } else {
      try {
        const res = await api.post('/api/chat/user', { text: msg.text, userId: user._id, tempId, imageUrl });
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
      setIsSending(false);
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [newMessage, user?._id, isSending, selectedImage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const copyMessage = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      setLastError('Failed to copy message');
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
      case 'connected': return { text: 'Online', color: 'text-emerald-400', dot: 'bg-emerald-400' };
      case 'disconnected': return { text: 'Offline', color: 'text-amber-400', dot: 'bg-amber-400' };
      case 'error': return { text: 'Error', color: 'text-rose-400', dot: 'bg-rose-400' };
      default: return { text: 'Connecting...', color: 'text-sky-400', dot: 'bg-sky-400 animate-pulse' };
    }
  };

  const status = getStatusDisplay();

  if (!authChecked) {
    return (
      <div className="min-h-[100dvh] bg-[#0b141a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?._id) {
    return (
      <div className="min-h-[100dvh] bg-[#0b141a] flex items-center justify-center px-4">
        <div className="text-center">
          <MessageCircle size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm">Please log in to access support</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
return (
    <div className="min-h-[100dvh] bg-[#0b141a] flex flex-col">
      {/* Header */}
      <div className="bg-[#1f2c34] px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 sticky top-0 z-20 border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white active:text-white/90 p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
          C
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white text-sm sm:text-base leading-tight">Credixa Support</h2>
          <p className={`text-xs flex items-center gap-1.5 mt-0.5 ${status.color}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            {status.text}
          </p>
        </div>

        <button
          onClick={clearChat}
          className="text-xs text-rose-400 hover:text-rose-300 active:text-rose-500 px-3 py-2 rounded-xl hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors font-medium min-h-[36px]"
        >
          End Chat
        </button>
      </div>

      {/* Error Banner */}
      {lastError && (
        <div className="bg-rose-500/15 border-b border-rose-500/25 px-4 py-2.5 flex items-center gap-2.5">
          <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
          <p className="text-rose-300 text-xs flex-1">{lastError}</p>
          <button
            onClick={() => setLastError(null)}
            className="text-rose-400 hover:text-rose-300 text-xs p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-rose-500/10 transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ backgroundColor: '#0b141a' }}>
        <div className="max-w-2xl mx-auto space-y-1">
          <div className="flex justify-center mb-4">
            <span className="bg-[#1f2c34] text-white/40 text-[11px] px-4 py-1.5 rounded-full font-medium">Today</span>
          </div>

          {messages.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <MessageCircle size={48} className="text-white/15 mx-auto mb-4" />
              <p className="text-white/30 text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => {
              const msgKey = msg._id || msg.tempId || `${msg.timestamp}-${idx}`;
              const isUser = msg.sender === 'user';
              const displayText = msg.text || (msg.imageUrl ? '📷 Image' : '');

              return (
                <motion.div
                  key={msgKey}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1.5`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-md">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] sm:max-w-[75%] px-3.5 py-2 rounded-2xl shadow-sm select-text cursor-pointer active:scale-[0.98] transition-transform ${
                      isUser
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm'
                        : 'bg-[#1f2c34] text-white rounded-tl-sm'
                    } ${msg.status === 'sending' ? 'opacity-60' : ''}`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      copyMessage(displayText, msgKey);
                    }}
                    onTouchStart={() => handleTouchStart(displayText, msgKey)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                  >
                    {/* Copy feedback overlay */}
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
                          className="max-w-full max-h-[280px] sm:max-h-[320px] object-cover cursor-zoom-in"
                          loading="lazy"
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                      </div>
                    )}

                    {/* Text */}
                    {msg.text && (
                      <p className="text-[13px] sm:text-[14px] leading-relaxed pr-14 whitespace-pre-wrap break-words">{msg.text}</p>
                    )}

                    {/* Meta */}
                    <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[10px] ${isUser ? 'text-white/50' : 'text-white/35'}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isUser && (
                        <>
                          {msg.status === 'sending' && <Clock size={10} className="animate-spin" />}
                          {msg.status === 'saved' && <CheckCheck size={10} className="text-sky-400" />}
                          {msg.status === 'failed' && <WifiOff size={10} className="text-rose-400" />}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image Preview Bar */}
      {imagePreview && (
        <div className="bg-[#1f2c34] border-t border-white/5 px-3 py-2 flex items-center gap-3">
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
            <p className="text-white/40 text-[10px]">
              {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        className="bg-[#1f2c34] px-3 sm:px-4 py-2.5 sm:py-3 flex items-end gap-2 border-t border-white/5"
      >
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
          disabled={isSending}
          className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 rounded-full bg-[#2a3942] hover:bg-[#374955] active:bg-[#1f2c34] flex items-center justify-center text-white/50 hover:text-white/70 transition-colors disabled:opacity-40 min-w-[44px] min-h-[44px]"
          aria-label="Attach image"
        >
          <ImageIcon size={20} />
        </button>

        <div className="flex-1 bg-[#2a3942] rounded-2xl px-4 py-2.5 min-h-[44px] flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-white/35 outline-none text-sm sm:text-base w-full"
            disabled={isSending}
            onKeyDown={handleKeyDown}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.88 }}
          type="submit"
          disabled={(!newMessage.trim() && !selectedImage) || isSending}
          className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-full flex items-center justify-center text-white disabled:opacity-30 shadow-lg shadow-violet-600/20 min-w-[44px] min-h-[44px] transition-colors"
          aria-label="Send message"
        >
          <Send size={18} />
        </motion.button>
      </form>
    </div>
  );
};

export default Support;
