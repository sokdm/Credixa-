import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [chatInfo, setChatInfo] = useState({ problemType: null });
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io(API_URL.replace('/api', ''));
    setSocket(newSocket);
    
    if (user?._id) {
      newSocket.emit('join_user', user._id);
      newSocket.emit('join_chat', user._id);
    }

    newSocket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    fetchMessages();

    return () => newSocket.close();
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/chat/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(res.data.messages || []);
      setChatInfo({ problemType: res.data.problemType });
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      userId: user._id,
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
      read: false
    };

    try {
      await axios.post(`${API_URL}/chat/user`, msg, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      socket.emit('send_message', msg);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      // Fallback to socket only
      socket.emit('send_message', msg);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* WhatsApp-style Header */}
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-4 sticky top-0 z-20">
        <button className="text-white/70 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-pink flex items-center justify-center text-white font-bold">
          C
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white">Credixa Support</h2>
          <p className="text-green-400 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
            Online
          </p>
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <Phone size={20} className="hover:text-white cursor-pointer" />
          <Video size={20} className="hover:text-white cursor-pointer" />
          <MoreVertical size={20} className="hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Chat Background */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundColor: '#0b141a'
        }}
      >
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Date divider */}
          <div className="flex justify-center mb-4">
            <span className="bg-[#1f2c34] text-white/50 text-xs px-3 py-1 rounded-lg">
              Today
            </span>
          </div>

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
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
        </div>
      </div>

      {/* Input Area - WhatsApp Style */}
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(e)}
            placeholder="Type a message"
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default Support;
