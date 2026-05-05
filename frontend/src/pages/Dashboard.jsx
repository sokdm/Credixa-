import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ArrowUpRight, ArrowDownLeft, CreditCard,
  Bell, Sun, Moon, LogOut, Send, Receipt, PiggyBank,
  User, History, QrCode, Target, Landmark, PieChart,
  ChevronRight, Sparkles, ArrowRight, Menu, X,
  Headphones, Users, Calendar, Shield, TrendingUp,
  ChevronLeft, Gem, Banknote, Smartphone
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import io from 'socket.io-client'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    fetchDashboard()
    fetchUnreadCount()
  }, [])

  useEffect(() => {
    if (user?.id || user?._id) {
      const userId = user.id || user._id
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')
      newSocket.emit('join_user', userId)
      newSocket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      setSocket(newSocket)
      return () => newSocket.close()
    }
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/user/dashboard')
      setDashboardData(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/api/user/notifications/unread')
      setUnreadCount(res.data.count || 0)
    } catch (error) {
      console.error(error)
    }
  }

  const markNotificationsRead = async () => {
    try {
      await axios.put('/api/user/notifications/read')
      setUnreadCount(0)
    } catch (error) {
      console.error(error)
    }
  }

  const formatMoney = (amount, currency = '$') => {
    const num = Number(amount) || 0
    if (num < 0) return `${currency}0.00`
    return `${currency}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const isNegativeBalance = (dashboardData?.user?.balance || 0) < 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  const navItems = [
    { icon: Wallet, label: 'Dashboard', path: '/dashboard' },
    { icon: Send, label: 'Transfer', path: '/transfer' },
    { icon: QrCode, label: 'QR Pay', path: '/qr-pay' },
    { icon: CreditCard, label: 'Cards', path: '/cards' },
    { icon: PiggyBank, label: 'Loans', path: '/loans' },
    { icon: Receipt, label: 'Bills', path: '/bills' },
    { icon: Users, label: 'Beneficiaries', path: '/beneficiaries' },
    { icon: Calendar, label: 'Scheduled', path: '/scheduled-payments' },
    { icon: Gem, label: 'Savings Goals', path: '/savings-goals' },
    { icon: Target, label: 'Budget', path: '/budget' },
    { icon: Landmark, label: 'Invest', path: '/invest' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
  ]

  const bottomNav = [
    { icon: Headphones, label: 'Support', path: '/support' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  const quickStats = [
    { label: 'Income', value: formatMoney(dashboardData?.stats?.income || 0), icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/20', trend: '+12%' },
    { label: 'Expenses', value: formatMoney(dashboardData?.stats?.expenses || 0), icon: ArrowUpRight, color: 'text-rose-400', bg: 'bg-rose-500/20', trend: '-5%' },
    { label: 'Savings', value: formatMoney(dashboardData?.stats?.savings || 0), icon: PiggyBank, color: 'text-amber-400', bg: 'bg-amber-500/20', trend: '+8%' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-800 border-r border-gray-700 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Credixa</h1>
              <p className="text-xs text-gray-400">Digital Banking</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-2 hover:bg-gray-700 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.label}
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-700 space-y-1">
          {bottomNav.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-xl"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <p className="text-sm text-gray-400">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
                  <span className="text-white font-medium ml-1">{user?.fullName?.split(' ')[0]}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown)
                    if (!showNotifDropdown && unreadCount > 0) markNotificationsRead()
                  }}
                  className="relative p-2.5 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <Bell size={20} className="text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => setNotifications([])}
                            className="text-xs text-violet-400 hover:text-violet-300"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <Bell size={24} className="mx-auto text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((n, i) => (
                            <div key={i} className="p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                              <p className="text-sm font-medium">{n.title || 'Notification'}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-gray-400" />}
              </button>

              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-3xl p-8 shadow-2xl ${
              isNegativeBalance
                ? 'bg-gradient-to-br from-rose-600 via-rose-700 to-red-800'
                : 'bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800'
            }`}
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/70 text-sm font-medium">Total Balance</p>
                {isNegativeBalance && (
                  <span className="px-3 py-1 bg-red-500/30 border border-red-400/30 rounded-full text-xs text-red-200 font-medium flex items-center gap-1">
                    <Shield size={12} /> Overdraft
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  {showBalance ? formatMoney(dashboardData?.user?.balance, '$') : '••••••'}
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl hover:bg-white/25 transition-all text-sm text-white font-medium border border-white/10"
                >
                  {showBalance ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Account Number</p>
                  <p className="font-mono font-semibold text-white text-sm tracking-wider">{dashboardData?.user?.accountNumber || '---- ---- ----'}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Account Type</p>
                  <p className="font-semibold text-white text-sm">Premium Savings</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="font-semibold text-white text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Send, label: 'Send Money', path: '/transfer', color: 'from-violet-500 to-violet-600' },
                { icon: QrCode, label: 'QR Pay', path: '/qr-pay', color: 'from-cyan-500 to-blue-500' },
                { icon: CreditCard, label: 'My Cards', path: '/cards', color: 'from-pink-500 to-rose-500' },
                { icon: PiggyBank, label: 'Apply Loan', path: '/loans', color: 'from-emerald-500 to-teal-500' },
                { icon: Receipt, label: 'Pay Bills', path: '/bills', color: 'from-orange-500 to-amber-500' },
                { icon: Users, label: 'Beneficiaries', path: '/beneficiaries', color: 'from-indigo-500 to-purple-500' },
                { icon: Calendar, label: 'Scheduled', path: '/scheduled-payments', color: 'from-sky-500 to-blue-500' },
                { icon: Gem, label: 'Savings', path: '/savings-goals', color: 'from-amber-500 to-yellow-500' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="group bg-gray-800 rounded-2xl p-5 text-left hover:bg-gray-700/80 transition-all border border-gray-700 hover:border-gray-600"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="text-white" size={22} />
                  </div>
                  <p className="font-semibold text-sm text-white">{action.label}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Financial Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Financial Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Target, label: 'Budget Planner', desc: 'Track & control spending', path: '/budget', color: 'from-violet-500 to-purple-500' },
                { icon: Landmark, label: 'Investments', desc: 'Grow your portfolio', path: '/invest', color: 'from-amber-500 to-orange-500' },
                { icon: PieChart, label: 'Analytics', desc: 'Spending insights', path: '/analytics', color: 'from-rose-500 to-red-500' },
              ].map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(tool.path)}
                  className="group bg-gray-800 rounded-2xl p-5 text-left hover:bg-gray-700/80 transition-all border border-gray-700 hover:border-gray-600 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <tool.icon className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{tool.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
                  </div>
                  <ChevronRight size={18} className="ml-auto text-gray-500 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Recent Transactions</h3>
                <p className="text-xs text-gray-400 mt-0.5">Your latest activity</p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center gap-1 text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
              >
                View All <ArrowRight size={16} />
              </button>
            </div>

            <div className="divide-y divide-gray-700">
              {(!dashboardData?.transactions || dashboardData.transactions.length === 0) ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-2xl flex items-center justify-center">
                    <History size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm">No transactions yet</p>
                  <p className="text-xs text-gray-500 mt-1">Start by making your first transfer</p>
                </div>
              ) : (
                dashboardData.transactions.slice(0, 5).map((tx, idx) => {
                  const currentUserId = user?.id || user?._id?.toString()
                  const senderId = tx.senderId?._id?.toString?.() || tx.senderId?.toString?.() || tx.senderId
                  const isSender = senderId === currentUserId || tx.type === 'debit'
                  const counterpartyName = isSender
                    ? (tx.receiverName || 'Unknown')
                    : (tx.senderName || 'Unknown')

                  return (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => navigate('/history')}>
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isSender ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isSender ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">
                            {isSender ? `Sent to ${counterpartyName}` : `Received from ${counterpartyName}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{tx.narration || tx.type || 'Transfer'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${isSender ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isSender ? '-' : '+'}{formatMoney(tx.amount, tx.currency || '$')}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
