import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mail, Lock, Shield, Eye, EyeOff, Sparkles, KeyRound, CheckCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_URL}/api/otp/forgot-password`, { email })
      setSuccess(res.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit OTP'); return }
    setLoading(true)
    setError('')
    try {
      await axios.post(`${API_URL}/api/otp/verify-password-otp`, { email, otp })
      setSuccess('OTP verified! Create your new password.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_URL}/api/otp/reset-password`, { email, otp, newPassword })
      setSuccess(res.data.message)
      setTimeout(() => { window.location.href = '/login' }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-bg p-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${10 + i * 8}%`, top: `${20 + (i % 3) * 25}%`,
          animationDelay: `${i * 0.5}s`, animationDuration: `${12 + i * 2}s`
        }} />
      ))}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Link to="/login" className="inline-flex items-center gap-2 text-white/40 mb-8 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to login
          </Link>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.6 }} className="glass-auth p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.03, 1] }} transition={{ duration: 5, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Shield className="text-white" size={30} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'New Password'}
            </h1>
            <p className="text-white/40 text-sm">
              {step === 1 ? 'Enter your email to receive a reset code' : step === 2 ? 'Enter the 6-digit code sent to your email' : 'Create a strong new password'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 rounded-xl text-sm text-center">{error}</motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-300 rounded-xl text-sm text-center">{success}</motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="glass-input" placeholder="you@example.com" />
                </div>
              </motion.div>
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound size={18} /> Send OTP</>}
              </motion.button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <label className="block text-white/40 text-xs font-medium mb-2 ml-1">6-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input type="text" inputMode="numeric" maxLength={6} required value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="glass-input text-center text-2xl tracking-[0.5em] font-bold" placeholder="••••••" />
                </div>
                <p className="text-xs text-white/30 mt-2 text-center">Code sent to {email}</p>
              </motion.div>
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={18} /> Verify OTP</>}
              </motion.button>
              <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors">
                Didn't receive it? Resend
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <label className="block text-white/40 text-xs font-medium mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input type={showPassword ? 'text' : 'password'} required value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} className="glass-input pr-10" placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input type={showPassword ? 'text' : 'password'} required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} className="glass-input pr-10" placeholder="Repeat password" />
                </div>
              </motion.div>
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles size={18} /> Reset Password</>}
              </motion.button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
