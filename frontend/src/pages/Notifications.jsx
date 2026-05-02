import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, CheckCircle, Clock, Trash2, Filter } from 'lucide-react'
import axios from 'axios'

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/notifications')
      setNotifications(res.data)
      await axios.put('http://localhost:5000/api/user/notifications/read')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/user/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const clearAll = async () => {
    try {
      await axios.delete('http://localhost:5000/api/user/notifications')
      setNotifications([])
    } catch (error) {
      console.error(error)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    if (filter === 'transactions') return n.title?.includes('Transfer') || n.title?.includes('Transaction')
    if (filter === 'system') return n.title?.includes('System') || n.title?.includes('Welcome')
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-600 font-medium">
              Clear All
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'unread', 'transactions', 'system'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Bell className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-start gap-4 border ${
                  !notif.read ? 'border-violet-500/50 shadow-md shadow-violet-500/10' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.title?.includes('Transfer') || notif.title?.includes('Debited') || notif.title?.includes('Debit')
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
                    : notif.title?.includes('Credit') || notif.title?.includes('Received')
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                    : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
                }`}>
                  {notif.title?.includes('Transfer') || notif.title?.includes('Debited') || notif.title?.includes('Debit')
                    ? <ArrowLeft size={18} className="rotate-45" />
                    : notif.title?.includes('Credit') || notif.title?.includes('Received')
                    ? <CheckCircle size={18} />
                    : <Bell size={18} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{notif.title}</p>
                    {!notif.read && (
                      <div className="w-2.5 h-2.5 bg-violet-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                    <button 
                      onClick={() => deleteNotification(notif._id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
