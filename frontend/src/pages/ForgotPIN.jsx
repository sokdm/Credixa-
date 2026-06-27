import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mail, Lock, Shield, KeyRound, CheckCircle, Sparkles } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ForgotPIN = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_URL}/api/otp/forgot-pin`, { email })
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
      await axios.post(`${API_URL}/api/otp/verify-pin-otp`, { email, otp })
      setSuccess('OTP verified! Create your new PIN.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleResetPIN = async (e) => {
    e.preventDefault()
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setError('PIN must be exactly 4 digits'); return }
    if (newPin !== confirmPin) { setError('PINs do not match'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_URL}/api/otp/reset-pin`, { email, otp, newPin })
      setSuccess(res.data.message)
      setTimeout(() => { window.location.href = '/login' }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset PIN')
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
              className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Lock className="text-white" size={30} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? 'Forgot PIN?' : step === 2 ? 'Verify OTP' : 'New PIN'}
            </h1>
            <p className="text-white/40 text-sm">
              {step === 1 ? 'Enter your email to receive a reset code' : step === 2 ? 'Enter the 6-digit code sent to your email' : 'Create a new 4-digit PIN'}
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
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={18} /> Verify OTP</>}
              </motion.button>
              <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors">
                Didn't receive it? Resend
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPIN} className="space-y-5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <label className="block text-white/40 text-xs font-medium mb-2 ml-1">New 4-Digit PIN</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input type="password" inputMode="numeric" maxLength={4} required value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="glass-input text-center text-2xl tracking-[1em] font-bold" placeholder="••••" />
                </div>
              </motion.div>
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Confirm PIN</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input type="password" inputMode="numeric" maxLength={4} required value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="glass-input text-center text-2xl tracking-[1em] font-bold" placeholder="••••" />
                </div>
              </motion.div>
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles size={18} /> Reset PIN</>}
              </motion.button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPIN
