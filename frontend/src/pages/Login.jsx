import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)
    setLoading(false)

    if (result.success) {
      if (result.user.isAdmin) {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-bg p-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="particle" style={{ 
          left: `${10 + i * 8}%`, 
          top: `${20 + (i % 3) * 25}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${12 + i * 2}s`
        }} />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 mb-8 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="glass-auth p-8 md:p-10"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30"
            >
              <Shield className="text-white" size={30} />
            </motion.div>
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/40 text-sm"
            >
              Sign in to access your Credixa account
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-6 p-3.5 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 rounded-xl text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Email or Phone</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="glass-input"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="glass-input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between text-sm"
            >
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="custom-checkbox" />
                <span className="text-white/40 text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300 transition-colors text-sm font-medium">
                Forgot password?
              </Link>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <Sparkles size={18} />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-white/40 text-sm"
          >
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Create one free
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
