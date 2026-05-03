import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, Phone, Video, MoreVertical, Check, CheckCheck, HelpCircle, MessageCircle, AlertTriangle, CreditCard, Wallet, Shield, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = API_URL;

const PROBLEM_CATEGORIES = [
  { id: 'transaction', label: 'Transaction Issue', icon: Wallet, desc: 'Failed, pending, or wrong transfer' },
  { id: 'card', label: 'Card Problem', icon: CreditCard, desc: 'Lost, blocked, or not working' },
  { id: 'account', label: 'Account Access', icon: User, desc: 'Login, password, or profile' },
  { id: 'security', label: 'Security Concern', icon: Shield, desc: 'Suspicious activity or fraud' },
  { id: 'loan', label: 'Loan & Credit', icon: AlertTriangle, desc: 'Application or repayment' },
  { id: 'other', label: 'Something Else', icon: MessageCircle, desc: 'Other questions or feedback' },
];

const Support = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [chatInfo, setChatInfo] = useState({ problemType: null, status: 'active' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('category');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('join_user', user._id);
    newSocket.emit('join_chat', user._id);

    newSocket.on('new_message', (msg) => {
      setMessages(prev => {
        const exists = prev.some(m => 
          m.timestamp === msg.timestamp && m.text === msg.text
        );
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    fetchMessages();

    return () => newSocket.close();
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 5000
      });
      const data = res.data;
      setMessages(data.messages || []);
      setChatInfo({ 
        problemType: data.problemType || null, 
        status: data.status || 'active' 
      });
      if (data.problemType) setStep('chat');
    } catch (err) {
      console.log('No chat history or endpoint not available');
    }
  };

  const selectCategory = async (categoryId) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/chat/start`, {
        userId: user._id,
        problemType: categoryId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 5000
      });
    } catch (err) {
      console.log('Chat start API not available, continuing anyway');
    }
    
    setChatInfo(prev => ({ ...prev, problemType: categoryId }));
    setStep('chat');
    setLoading(false);
    
    const welcomeMsg = {
      sender: 'admin',
      text: `Thanks for reaching out about ${PROBLEM_CATEGORIES.find(c => c.id === categoryId)?.label || 'your issue'}. An agent will assist you shortly. How can we help?`,
      timestamp: new Date().toISOString(),
      read: true
    };
    setMessages(prev => [...prev, welcomeMsg]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const msg = {
      userId: user._id,
      sender: 'user',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, msg]);
    setNewMessage('');

    try {
      await axios.post(`${API_URL}/api/chat/user`, msg, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 5000
      });
    } catch (err) {
      console.log('Message save failed, using socket only');
    }
    
    socket.emit('send_message', msg);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const getCategoryLabel = () => {
    return PROBLEM_CATEGORIES.find(c => c.id === chatInfo.problemType)?.label || 'Support';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex items-center justify-center p-4">
        <div className="text-center">
          <HelpCircle size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Please log in to access support</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-full text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-4 sticky top-0 z-20">
        <button 
          onClick={() => step === 'chat' ? setStep('category') : navigate(-1)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-pink flex items-center justify-center text-white font-bold">
          C
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white truncate">Credixa Support</h2>
          <p className="text-green-400 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
            {step === 'category' ? 'Select a topic' : `${getCategoryLabel()} • Online`}
          </p>
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <Phone size={20} className="hover:text-white cursor-pointer" />
          <Video size={20} className="hover:text-white cursor-pointer" />
          <MoreVertical size={20} className="hover:text-white cursor-pointer" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'category' ? (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 bg-[#0b141a] p-4 overflow-y-auto"
          >
            <div className="max-w-lg mx-auto pt-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle size={32} className="text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">How can we help?</h3>
                <p className="text-white/50 text-sm">Choose a topic to get started with support</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {PROBLEM_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectCategory(cat.id)}
                        className="w-full bg-[#1f2c34] hover:bg-[#2a3942] rounded-xl p-4 flex items-center gap-4 transition-colors text-left group"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center group-hover:bg-primary-600/30 transition-colors">
                          <Icon size={24} className="text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{cat.label}</h4>
                          <p className="text-white/50 text-sm">{cat.desc}</p>
                        </div>
                        <ArrowRight size={20} className="text-white/30 group-hover:text-white/60 transition-colors" />
                      </motion.button>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-white/40 text-xs">
                  Average response time: <span className="text-green-400">under 5 minutes</span>
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
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
                <div ref={messagesEndRef} />
              </div>
            </div>

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
                disabled={!newMessage.trim()}
                className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Support;
