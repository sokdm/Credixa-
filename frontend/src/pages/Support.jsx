import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, MoreVertical, Check, CheckCheck, MessageCircle } from 'lucide-react';
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
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  // Get storage key based on user ID
  const getStorageKey = useCallback(() => {
    return user?._id ? `support_messages_${user._id}` : 'support_messages_guest';
  }, [user?._id]);

  // Load messages from localStorage when user is available
  useEffect(() => {
    if (user?._id && !initialized) {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
          console.log(`[SUPPORT] Loaded ${parsed.length} messages from storage`);
        } catch (e) {
          console.log('[SUPPORT] Failed to parse saved messages');
        }
      }
      setInitialized(true);
    }
  }, [user?._id, initialized, getStorageKey]);

  // Persist messages to localStorage
  useEffect(() => {
    if (user?._id && initialized && messages.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(messages));
      console.log(`[SUPPORT] Saved ${messages.length} messages to storage`);
    }
  }, [messages, user?._id, initialized, getStorageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket setup
  useEffect(() => {
    if (!user?._id) return;

    console.log(`[SUPPORT] Setting up socket for user: ${user._id}`);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log(`[SUPPORT] Socket connected: ${newSocket.id}`);
      setSocketConnected(true);
      newSocket.emit('join_user', user._id);
      newSocket.emit('join_chat', user._id);
      console.log(`[SUPPORT] Emitted join_user and join_chat for: ${user._id}`);
    });

    newSocket.on('connect_error', (err) => {
      console.log(`[SUPPORT] Socket error: ${err.message}`);
      setSocketConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log(`[SUPPORT] Socket disconnected`);
      setSocketConnected(false);
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

    const msg = {
      userId: user._id,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      read: false
    };

    console.log(`[SUPPORT] Sending message:`, msg);

    // Optimistic update
    setMessages(prev => [...prev, msg]);

    // Emit via socket
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('send_message', msg);
      console.log(`[SUPPORT] Message emitted via socket`);
    } else {
      console.log(`[SUPPORT] Socket not connected, skipping socket emit`);
    }

    // Persist via API
    try {
      await axios.post(`${API_URL}/api/chat/user`, msg, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 5000
      });
      console.log(`[SUPPORT] Message saved via API`);
    } catch (err) {
      console.log(`[SUPPORT] Message save API failed:`, err.message);
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
    console.log(`[SUPPORT] Chat cleared`);
  };

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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold">
          C
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white truncate">Credixa Support</h2>
          <p className="text-green-400 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
            {socketConnected ? 'Online' : 'Connecting...'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <button onClick={clearChat} className="text-xs text-red-400 hover:text-red-300">
            End Chat
          </button>
          <MoreVertical size={20} className="hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundColor: '#0b141a'
        }}
      >
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex justify-center mb-4">
            <span className="bg-[#1f2c34] text-white/50 text-xs px-3 py-1 rounded-lg">
              Today
            </span>
          </div>

          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={`${msg.timestamp}-${idx}`}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative max-w-[75%] px-3 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-[#005c4b] text-white rounded-tr-none'
                    : 'bg-[#1f2c34] text-white rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed pr-16">{msg.text}</p>
                  <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[10px] ${
                    msg.sender === 'user' ? 'text-white/60' : 'text-white/40'
                  }`}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'user' && (
                      msg.read
                        ? <CheckCheck size={14} className="text-sky-400" />
                        : <Check size={14} />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!newMessage.trim()}
          className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </motion.button>
      </form>
    </div>
  );
};

export default Support;
