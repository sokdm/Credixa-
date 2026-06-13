import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Bell, CheckCircle, Clock, Trash2, 
  Filter, CheckCheck, ArrowUpRight, ArrowDownRight,
  Info, AlertTriangle, X, Inbox
} from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedNotifs, setSelectedNotifs] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API_URL + '/api/user/notifications')
      setNotifications(res.data)
      await axios.put(API_URL + '/api/user/notifications/read')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/user/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
      showToast('Notification deleted')
    } catch (error) {
      console.error(error)
      showToast('Failed to delete', 'error')
    }
  }

  const deleteSelected = async () => {
    try {
      await Promise.all(selectedNotifs.map(id => 
        axios.delete(`${API_URL}/api/user/notifications/${id}`)
      ))
      setNotifications(prev => prev.filter(n => !selectedNotifs.includes(n._id)))
      setSelectedNotifs([])
      setSelectMode(false)
      showToast(`${selectedNotifs.length} notifications deleted`)
    } catch (error) {
      showToast('Failed to delete', 'error')
    }
  }

  const clearAll = async () => {
    try {
      await axios.delete(API_URL + '/api/user/notifications')
      setNotifications([])
      showToast('All notifications cleared')
    } catch (error) {
      showToast('Failed to clear', 'error')
    }
  }

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/user/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error(error)
    }
  }

  const toggleSelect = (id) => {
    setSelectedNotifs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getNotifIcon = (notif) => {
    const title = notif.title?.toLowerCase() || ''
    if (title.includes('transfer') || title.includes('debit') || title.includes('sent')) {
      return <ArrowUpRight size={18} className="text-rose-400" />
    }
    if (title.includes('credit') || title.includes('received') || title.includes('deposit')) {
      return <ArrowDownRight size={18} className="text-emerald-400" />
    }
    if (title.includes('security') || title.includes('alert') || title.includes('warning')) {
      return <AlertTriangle size={18} className="text-amber-400" />
    }
    if (title.includes('welcome') || title.includes('system') || title.includes('update')) {
      return <Info size={18} className="text-sky-400" />
    }
    return <Bell size={18} className="text-violet-400" />
  }

  const getNotifBg = (notif) => {
    const title = notif.title?.toLowerCase() || ''
    if (title.includes('transfer') || title.includes('debit') || title.includes('sent')) {
      return 'bg-rose-500/10 border-rose-500/20'
    }
    if (title.includes('credit') || title.includes('received') || title.includes('deposit')) {
      return 'bg-emerald-500/10 border-emerald-500/20'
    }
    if (title.includes('security') || title.includes('alert') || title.includes('warning')) {
      return 'bg-amber-500/10 border-amber-500/20'
    }
    return 'bg-violet-500/10 border-violet-500/20'
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    if (filter === 'transactions') {
      const t = n.title?.toLowerCase() || ''
      return t.includes('transfer') || t.includes('transaction') || t.includes('debit') || t.includes('credit')
    }
    if (filter === 'system') {
      const t = n.title?.toLowerCase() || ''
      return t.includes('system') || t.includes('welcome') || t.includes('update') || t.includes('security')
    }
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const filters = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'transactions', label: 'Transactions', count: notifications.filter(n => {
      const t = n.title?.toLowerCase() || ''
      return t.includes('transfer') || t.includes('transaction') || t.includes('debit') || t.includes('credit')
    }).length },
    { key: 'system', label: 'System', count: notifications.filter(n => {
      const t = n.title?.toLowerCase() || ''
      return t.includes('system') || t.includes('welcome') || t.includes('update') || t.includes('security')
    }).length }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl ${
              toast.type === 'error' 
                ? 'bg-red-500/20 border border-red-500/30 text-red-300' 
                : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
            } backdrop-blur-md flex items-center gap-2`}
          >
            {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 nav-glass">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button 
              onClick={() => navigate('/dashboard')} 
              className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} className="text-white/60" />
            </motion.button>
            <div>
              <h1 className="text-lg font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="text-xs text-violet-400">{unreadCount} unread</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={deleteSelected}
                  disabled={selectedNotifs.length === 0}
                  className="p-2.5 bg-rose-500/15 text-rose-400 rounded-xl hover:bg-rose-500/25 transition-colors disabled:opacity-30"
                >
                  <Trash2 size={18} />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => { setSelectMode(false); setSelectedNotifs([]) }}
                  className="p-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </>
            ) : (
              <>
                {notifications.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectMode(true)}
                    className="p-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <CheckCheck size={18} />
                  </motion.button>
                )}
                {notifications.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={clearAll}
                    className="p-2.5 bg-white/5 text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f) => (
            <motion.button
              key={f.key}
              onClick={() => setFilter(f.key)}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === f.key
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                filter === f.key ? 'bg-white/20' : 'bg-white/5'
              }`}>
                {f.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-5 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
              <Inbox className="text-white/20" size={36} />
            </div>
            <p className="text-white/40 font-medium text-lg">No notifications</p>
            <p className="text-sm text-white/20 mt-1">You're all caught up!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif, idx) => (
                <motion.div
                  key={notif._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`notif-item ${!notif.read ? 'unread' : ''} flex items-start gap-4`}
                  onClick={() => {
                    if (selectMode) toggleSelect(notif._id)
                    else if (!notif.read) markAsRead(notif._id)
                  }}
                >
                  {selectMode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-1"
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        selectedNotifs.includes(notif._id)
                          ? 'bg-violet-500 border-violet-500'
                          : 'border-white/20'
                      }`}>
                        {selectedNotifs.includes(notif._id) && <CheckCircle size={14} className="text-white" />}
                      </div>
                    </motion.div>
                  )}

                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotifBg(notif)}`}>
                    {getNotifIcon(notif)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm ${!notif.read ? 'text-white' : 'text-white/70'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && !selectMode && (
                        <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse shadow-lg shadow-violet-500/50"/>
                      )}
                    </div>
                    <p className="text-sm text-white/40 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-white/25 flex items-center gap-1.5">
                        <Clock size={11} />
                        {new Date(notif.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                      {!selectMode && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id) }}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-white/20 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
