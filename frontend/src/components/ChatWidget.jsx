import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ChevronLeft, Headphones, Clock, User, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import io from 'socket.io-client'
import axios from 'axios'

const PROBLEMS = [
  { id: 'transfer', label: 'Transfer issue', icon: '💸' },
  { id: 'locked', label: 'Locked account', icon: '🔒' },
  { id: 'card', label: 'Card request', icon: '💳' },
  { id: 'loan', label: 'Loan issue', icon: '📋' },
  { id: 'other', label: 'Other', icon: '❓' }
]

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [socket, setSocket] = useState(null)
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isOpen && isAuthenticated && user && !hasLoadedHistory) {
      fetchChatHistory()
    }
  }, [isOpen, isAuthenticated, user, hasLoadedHistory])

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get('/api/chat/user')
      if (res.data && res.data.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages)
        setSelectedProblem(res.data.problemType || 'Other')
      }
      setHasLoadedHistory(true)
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setHasLoadedHistory(true)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000')
      newSocket.emit('join_chat', user.id)
      
      newSocket.on('new_message', (msg) => {
        setMessages(prev => [...prev, msg])
        setIsTyping(false)
      })
      
      newSocket.on('admin_typing', () => {
        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 3000)
      })
      
      setSocket(newSocket)
      return () => newSocket.close()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleProblemSelect = async (problem) => {
    setSelectedProblem(problem.label)
    const msg = { 
      sender: 'user', 
      text: `Issue: ${problem.label}`, 
      timestamp: new Date().toISOString() 
    }
    setMessages([msg])
    socket?.emit('send_message', { 
      userId: user.id, 
      sender: 'user', 
      text: `Issue: ${problem.label}` 
    })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const msg = { 
      sender: 'user', 
      text: input, 
      timestamp: new Date().toISOString() 
    }
    setMessages(prev => [...prev, msg])
    socket?.emit('send_message', { 
      userId: user.id, 
      sender: 'user', 
      text: input 
    })
    setInput('')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (!isAuthenticated) return null

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setHasLoadedHistory(false)
          }}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary-600 to-accent-pink text-white rounded-full shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-110"
        >
          <MessageCircle size={28} />
          {messages.filter(m => m.sender === 'admin' && !m.read).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {messages.filter(m => m.sender === 'admin' && !m.read).length}
            </span>
          )}
        </button>
      )}

      {/* Full Screen Chat Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:w-[420px] sm:h-[650px] h-[85vh] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Headphones size={20} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">Credixa Support</h3>
                  <div className="flex items-center gap-1 text-xs text-primary-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Online
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Content */}
              {!selectedProblem && messages.length === 0 ? (
                /* Problem Selection Screen */
                <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                      <Shield className="text-primary-600" size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {getGreeting()}, {user?.fullName?.split(' ')[0]}!
                    </h2>
                    <p className="text-gray-500 text-sm">How can we help you today?</p>
                  </div>

                  <div className="space-y-3">
                    {PROBLEMS.map((problem) => (
                      <button
                        key={problem.id}
                        onClick={() => handleProblemSelect(problem)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
                      >
                        <span className="text-2xl">{problem.icon}</span>
                        <span className="font-medium group-hover:text-primary-600 transition-colors text-gray-900 dark:text-white">
                          {problem.label}
                        </span>
                        <ChevronLeft className="ml-auto rotate-180 text-gray-400 group-hover:text-primary-600" size={18} />
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                    <div className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300">
                      <Clock size={16} />
                      <span>Average response time: 2 minutes</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Chat Messages Screen */
                <>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-950">
                    {/* Welcome Message */}
                    {messages.length > 0 && (
                      <div className="text-center mb-4">
                        <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
                          {new Date(messages[0].timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'admin' && (
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center mr-2 shrink-0 self-end">
                            <User size={14} className="text-white" />
                          </div>
                        )}
                        
                        <div className={`max-w-[75%] ${
                          msg.sender === 'user' 
                            ? 'bg-primary-600 text-white rounded-2xl rounded-br-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-bl-md shadow-sm'
                        } px-4 py-3`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'user' ? 'text-primary-200' : 'text-gray-400'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center mr-2 shrink-0 self-end">
                          <User size={14} className="text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-3 shrink-0">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500 text-sm text-gray-900 dark:text-white"
                    />
                    <button 
                      type="submit" 
                      disabled={!input.trim()}
                      className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatWidget
