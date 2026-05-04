import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, MoreVertical, Check, CheckCheck, MessageCircle, Wifi, WifiOff, Bot, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = 'https://credixa-api.onrender.com';
const SOCKET_URL = API_URL;

const Support = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const getStorageKey = useCallback(() => {
    return user?._id ? `support_messages_${user._id}` : 'support_messages_guest';
  }, [user?._id]);

  useEffect(() => {
    if (user?._id && !initialized) {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
        } catch (e) {
          console.log('[SUPPORT] Failed to parse saved messages');
        }
      }
      setInitialized(true);
    }
  }, [user?._id, initialized, getStorageKey]);

  useEffect(() => {
    if (user?._id && initialized && messages.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(messages));
    }
  }, [messages, user?._id, initialized, getStorageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      forceNew: true
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log(`[SUPPORT] Socket connected: ${newSocket.id}`);
      setSocketConnected(true);
      setConnectionStatus('connected');
      newSocket.emit('join_user', user._id);
      newSocket.emit('join_chat', user._id);
    });

    newSocket.on('connect_error', (err) => {
      console.log(`[SUPPORT] Socket error: ${err.message}`);
      setSocketConnected(false);
      setConnectionStatus('error');
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`[SUPPORT] Socket disconnected: ${reason}`);
      setSocketConnected(false);
      setConnectionStatus('disconnected');
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`[SUPPORT] Socket reconnected after ${attemptNumber} attempts`);
      setSocketConnected(true);
      setConnectionStatus('connected');
      newSocket.emit('join_user', user._id);
      newSocket.emit('join_chat', user._id);
    });

    newSocket.on('reconnecting', (attemptNumber) => {
      console.log(`[SUPPORT] Socket reconnecting... attempt ${attemptNumber}`);
      setConnectionStatus('connecting');
    });

    newSocket.on('reconnect_error', (err) => {
      console.log(`[SUPPORT] Reconnect error: ${err.message}`);
    });

    newSocket.on('new_message', (msg) => {
      console.log(`[SUPPORT] Received new_message:`, msg);
      setMessages(prev => {
        const exists = prev.some(m =>
          m.timestamp === msg.timestamp && m.text === msg.text
        );
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [user?._id]);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !user?._id) return;

    setNewMessage('');
    setIsSending(true);

    const msg = {
      userId: user._id,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'pending'
    };

    setMessages(prev => [...prev, msg]);

    if (socketRef.current && socketConnected) {
      socketRef.current.emit('send_message', msg);
      setMessages(prev => prev.map(m => 
        m.timestamp === msg.timestamp ? { ...m, status: 'sent' } : m
      ));
    }

    try {
      await axios.post(`${API_URL}/api/chat/user`, msg, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 15000
      });
      setMessages(prev => prev.map(m => 
        m.timestamp === msg.timestamp ? { ...m, status: 'saved' } : m
      ));
    } catch (err) {
      console.log(`[SUPPORT] Message save API failed:`, err.message);
      setMessages(prev => prev.map(m => 
        m.timestamp === msg.timestamp ? { ...m, status: 'offline' } : m
      ));
    } finally {
      setIsSending(false);
    }
  }, [newMessage, user?._id, socketConnected]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const clearChat = () => {
    const key = getStorageKey();
    localStorage.removeItem(key);
    setMessages([]);
  };

  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return { text: 'Online', color: 'text-green-400', dot: 'bg-green-400', icon: Wifi };
      case 'connecting':
        return { text: 'Connecting...', color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse', icon: Clock };
      case 'disconnected':
      case 'error':
        return { text: 'Offline - Messages saved', color: 'text-orange-400', dot: 'bg-orange-400', icon: WifiOff };
      default:
        return { text: 'Connecting...', color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse', icon: Clock };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex items-center justify-center p-4">
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
        <button
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white transition-colors p-1"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
          C
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white truncate text-sm">Credixa Support</h2>
          <p className={`text-xs flex items-center gap-1.5 ${status.color}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            <StatusIcon size={12} />
            {status.text}
          </p>
        </div>
        <div className="flex items-center gap-3 text-white/70">
          <button onClick={clearChat} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all">
            End Chat
          </button>
          <MoreVertical size={20} className="hover:text-white cursor-pointer" />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundColor: '#0b141a'
        }}
      >
        <div className="max-w-2xl mx-auto space-y-1">
          <div className="flex justify-center mb-4">
            <span className="bg-[#1f2c34] text-white/40 text-[11px] px-3 py-1 rounded-lg">
              Today
            </span>
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
                key={`${msg.timestamp}-${idx}`}
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
                  msg.sender === 'user'
                    ? 'bg-[#005c4b] text-white rounded-tr-sm'
                    : 'bg-[#1f2c34] text-white rounded-tl-sm'
                }`}>
                  <p className="text-[13px] leading-relaxed pr-16">{msg.text}</p>
                  <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[10px] ${
                    msg.sender === 'user' ? 'text-white/50' : 'text-white/35'
                  }`}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'user' && (
                      <>
                        {msg.status === 'pending' && <Clock size={12} className="text-yellow-400" />}
                        {msg.status === 'sent' && <Check size={12} />}
                        {msg.status === 'saved' && <CheckCheck size={12} className="text-sky-400" />}
                        {msg.status === 'offline' && <WifiOff size={12} className="text-orange-400" />}
                        {!msg.status && <Check size={12} />}
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

      <form onSubmit={sendMessage} className="bg-[#1f2c34] px-3 py-2.5 flex items-center gap-2 border-t border-white/5">
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2.5 flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-white/35 outline-none text-sm"
            disabled={isSending}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
        >
          <Send size={18} className={isSending ? 'animate-pulse' : ''} />
        </motion.button>
      </form>
    </div>
  );
};

export default Support;
