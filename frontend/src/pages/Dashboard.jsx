import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ArrowUpRight, ArrowDownLeft, CreditCard,
  Bell, Sun, Moon, LogOut, Send, Receipt, PiggyBank,
  User, History, QrCode, Target, Landmark, PieChart,
  ChevronRight, Sparkles, ArrowRight, Menu, X,
  Headphones, Users, Calendar, Shield, TrendingUp,
  ChevronLeft, Gem, Banknote, Smartphone, Eye, EyeOff,
  Copy, ArrowUpDown, Wallet2, BadgeCheck
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
  const [copied, setCopied] = useState(false)
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

  const copyAccountNumber = () => {
    const accNum = dashboardData?.user?.accountNumber || ''
    navigator.clipboard.writeText(accNum)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatMoney = (amount, currency = '$') => {
    const num = Number(amount) || 0
    if (num < 0) return `${currency}0.00`
    return `${currency}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const isNegativeBalance = (dashboardData?.user?.balance || 0) < 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-violet-500/20 border-t-violet-500 rounded-full"
        />
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
    { icon: Gem, label: 'Savings', path: '/savings-goals' },
    { icon: Target, label: 'Budget', path: '/budget' },
    { icon: Landmark, label: 'Invest', path: '/invest' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
  ]

  const bottomNav = [
    { icon: Headphones, label: 'Support', path: '/support' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  const quickStats = [
    { label: 'Income', value: formatMoney(dashboardData?.stats?.income || 0), icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/15', trend: '+12%', trendColor: 'text-emerald-400', iconBg: 'from-emerald-500/20 to-emerald-600/20' },
    { label: 'Expenses', value: formatMoney(dashboardData?.stats?.expenses || 0), icon: ArrowUpRight, color: 'text-rose-400', bg: 'bg-rose-500/15', trend: '-5%', trendColor: 'text-rose-400', iconBg: 'from-rose-500/20 to-rose-600/20' },
    { label: 'Savings', value: formatMoney(dashboardData?.stats?.savings || 0), icon: PiggyBank, color: 'text-amber-400', bg: 'bg-amber-500/15', trend: '+8%', trendColor: 'text-amber-400', iconBg: 'from-amber-500/20 to-amber-600/20' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] border-r border-white/5 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">Credixa</h1>
              <p className="text-xs text-white/30">Digital Banking</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-2 hover:bg-white/5 rounded-lg">
              <X size={20} className="text-white/60" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
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
                    ? 'bg-gradient-to-r from-violet-600/80 to-purple-600/60 text-white shadow-lg shadow-violet-500/10 border border-violet-500/20'
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.label}
                {isActive && <ChevronRight size={16} className="ml-auto text-violet-400" />}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          {bottomNav.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-violet-600/80 to-purple-600/60 text-white'
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 hover:bg-white/5 rounded-xl transition-colors"
              >
                <Menu size={20} className="text-white/60" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <p className="text-sm text-white/40">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
                  <span className="text-white font-semibold ml-1">{user?.fullName?.split(' ')[0]}</span>
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
                  className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Bell size={20} className="text-white/40" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full animate-pulse shadow-lg shadow-rose-500/30" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-white">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => setNotifications([])}
                            className="text-xs text-violet-400 hover:text-violet-300"
                          >Clear all</button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto scrollbar-thin">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <Bell size={24} className="mx-auto text-white/20 mb-2" />
                            <p className="text-sm text-white/40">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((n, i) => (
                            <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                              <p className="text-sm font-medium text-white">{n.title || 'Notification'}</p>
                              <p className="text-xs text-white/40 mt-1">{n.message}</p>
                              <p className="text-[10px] text-white/20 mt-1">
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
                className="p-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-white/40" />}
              </button>

              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/20">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-3xl p-8 shadow-2xl ${
              isNegativeBalance
                ? 'bg-gradient-to-br from-rose-600/90 via-rose-700/90 to-red-800/90'
                : 'bg-gradient-to-br from-violet-600/90 via-purple-600/90 to-indigo-700/90'
            }`}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
            <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet2 size={18} className="text-white/60" />
                  <p className="text-white/60 text-sm font-medium">Total Balance</p>
                </div>
                <div className="flex items-center gap-2">
                  {isNegativeBalance && (
                    <span className="px-3 py-1 bg-red-500/30 border border-red-400/30 rounded-full text-xs text-red-200 font-medium flex items-center gap-1">
                      <Shield size={12} /> Overdraft
                    </span>
                  )}
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all text-white/80 border border-white/10"
                  >
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  {showBalance ? formatMoney(dashboardData?.user?.balance, '$') : '••••••••'}
                </h2>
                <BadgeCheck size={24} className="text-emerald-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 group hover:bg-white/15 transition-all">
                  <p className="text-xs text-white/50 mb-1 flex items-center gap-1">
                    <Banknote size={12} /> Account Number
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-semibold text-white text-sm tracking-wider">{dashboardData?.user?.accountNumber || '---- ---- ----'}</p>
                    <button
                      onClick={copyAccountNumber}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copied ? <BadgeCheck size={14} className="text-emerald-400" /> : <Copy size={14} className="text-white/40" />}
                    </button>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all">
                  <p className="text-xs text-white/50 mb-1 flex items-center gap-1">
                    <CreditCard size={12} /> Account Type
                  </p>
                  <p className="font-semibold text-white text-sm">Premium Savings</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all">
                  <p className="text-xs text-white/50 mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
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
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass-card p-5 relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.iconBg} rounded-full -translate-y-1/2 translate-x-1/2 blur-xl opacity-50 group-hover:opacity-80 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center border border-white/10`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.bg} ${stat.trendColor}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-xs text-white/30 mb-1 font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Send, label: 'Send Money', path: '/transfer', color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
                { icon: QrCode, label: 'QR Pay', path: '/qr-pay', color: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/20' },
                { icon: CreditCard, label: 'My Cards', path: '/cards', color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
                { icon: PiggyBank, label: 'Apply Loan', path: '/loans', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
                { icon: Receipt, label: 'Pay Bills', path: '/bills', color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
                { icon: Users, label: 'Beneficiaries', path: '/beneficiaries', color: 'from-indigo-500 to-violet-500', shadow: 'shadow-indigo-500/20' },
                { icon: Calendar, label: 'Scheduled', path: '/scheduled-payments', color: 'from-sky-500 to-blue-500', shadow: 'shadow-sky-500/20' },
                { icon: Gem, label: 'Savings', path: '/savings-goals', color: 'from-amber-500 to-yellow-500', shadow: 'shadow-amber-500/20' },
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.path)}
                  className="group glass-card p-5 text-left hover:bg-white/10 transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg ${action.shadow} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <action.icon className="text-white" size={22} />
                  </div>
                  <p className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors">{action.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Financial Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Financial Tools</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Target, label: 'Budget Planner', desc: 'Track & control spending', path: '/budget', color: 'from-violet-500 to-purple-500', iconBg: 'bg-violet-500/15' },
                { icon: Landmark, label: 'Investments', desc: 'Grow your portfolio', path: '/invest', color: 'from-amber-500 to-orange-500', iconBg: 'bg-amber-500/15' },
                { icon: PieChart, label: 'Analytics', desc: 'Spending insights', path: '/analytics', color: 'from-rose-500 to-red-500', iconBg: 'bg-rose-500/15' },
              ].map((tool, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(tool.path)}
                  className="group glass-card p-5 text-left hover:bg-white/10 transition-all flex items-center gap-4"
                >
                  <div className={`w-14 h-14 rounded-2xl ${tool.iconBg} flex items-center justify-center border border-white/5 flex-shrink-0`}>
                    <tool.icon className="text-white" size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{tool.label}</p>
                    <p className="text-xs text-white/30 mt-0.5">{tool.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Recent Transactions</h3>
                <p className="text-xs text-white/30 mt-0.5">Your latest activity</p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center gap-1 text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors group"
              >
                View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {(!dashboardData?.transactions || dashboardData.transactions.length === 0) ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                    <History size={24} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm">No transactions yet</p>
                  <p className="text-xs text-white/20 mt-1">Start by making your first transfer</p>
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
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => navigate('/history')}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isSender ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
                        }`}>
                          {isSender ? <ArrowUpRight size={20} className="text-rose-400" /> : <ArrowDownLeft size={20} className="text-emerald-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors">
                            {isSender ? `Sent to ${counterpartyName}` : `Received from ${counterpartyName}`}
                          </p>
                          <p className="text-xs text-white/30 mt-0.5">{tx.narration || tx.type || 'Transfer'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${isSender ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isSender ? '-' : '+'}{formatMoney(tx.amount, tx.currency || '$')}
                        </p>
                        <p className="text-[11px] text-white/20 mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
