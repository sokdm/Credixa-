import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Moon, Sun, Bell, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)

  const menuItems = [
    { icon: User, label: 'Personal Info', value: user?.fullName },
    { icon: Mail, label: 'Email', value: user?.email },
    { icon: Phone, label: 'Phone', value: user?.phoneNumber },
    { icon: MapPin, label: 'Country', value: user?.country },
    { icon: Shield, label: 'Account Number', value: user?.accountNumber },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="glass sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="ml-4 text-xl font-bold">Profile</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-accent-pink rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.fullName?.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold">{user?.fullName}</h2>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-8"
        >
          {menuItems.map((item, idx) => (
            <div key={idx} className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <item.icon className="text-primary-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={20} className="text-primary-600" /> : <Sun size={20} className="text-primary-600" />}
                <span>Dark Mode</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-primary-600" />
                <span>Notifications</span>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <button className="w-full glass-card p-4 flex items-center gap-4 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
            <Download size={20} className="text-primary-600" />
            <span className="font-medium">Download Mobile App</span>
          </button>
          
          <button
            onClick={logout}
            className="w-full glass-card p-4 flex items-center gap-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
