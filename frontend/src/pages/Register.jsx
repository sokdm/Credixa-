import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Phone, Lock, MapPin, ArrowLeft, ArrowRight, CheckCircle, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
  'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
  'Korea North', 'Korea South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
]

const Register = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    country: 'Nigeria',
    transactionPin: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const totalSteps = 3

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!formData.fullName || !formData.phoneNumber) {
        setError('Please fill in all fields')
        return
      }
    } else if (step === 2) {
      if (!formData.email || !formData.password || formData.password.length < 6) {
        setError('Email required and password must be at least 6 characters')
        return
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.transactionPin.length !== 4) {
      setError('Transaction PIN must be 4 digits')
      return
    }

    setLoading(true)
    const result = await register(formData)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  return (
    <div className="auth-bg p-4">
      <div className="auth-bg-overlay" />

      {/* Floating particles */}
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />

      {/* Falling leaves */}
      <div className="falling-leaf" />
      <div className="falling-leaf" />
      <div className="falling-leaf" />
      <div className="falling-leaf" />
      <div className="falling-leaf" />
      <div className="falling-leaf" />
      <div className="falling-leaf" />
      <div className="falling-leaf" />
      <div className="falling-leaf" />
      <div className="falling-leaf" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 mb-6 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back to home
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="glass-auth p-8 md:p-10"
        >
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-400 via-purple-500 to-accent-pink rounded-2xl flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
            >
              <Shield className="text-white" size={32} />
            </motion.div>
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2 tracking-wide"
            >
              CREATE ACCOUNT
            </motion.h1>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/50 text-sm"
            >
              Join Credixa today
            </motion.p>
          </div>

          {/* Step indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <motion.div 
                  className={`step-dot ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
                  whileHover={{ scale: 1.2 }}
                />
                {s < 3 && (
                  <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${s < step ? 'bg-accent-green' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-4"
          >
            <span className="text-xs text-white/40 uppercase tracking-widest">
              Step {step} of {totalSteps}
            </span>
            <p className="text-sm text-white/60 mt-1">
              {step === 1 ? 'Personal Information' : step === 2 ? 'Account Details' : 'Security Setup'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 rounded-lg text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <div className="relative">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="glass-input"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => updateField('phoneNumber', e.target.value)}
                        className="glass-input"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="glass-input"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className="glass-input pr-10"
                        placeholder="Password (min 6 chars)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                      <select
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        className="glass-input appearance-none cursor-pointer"
                      >
                        {COUNTRIES.map(c => <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <div className="w-12 h-12 mx-auto mb-3 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <Lock className="text-primary-400" size={24} />
                    </div>
                    <p className="text-sm text-white/60">
                      Create a 4-digit PIN for transactions
                    </p>
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={formData.transactionPin}
                      onChange={(e) => updateField('transactionPin', e.target.value.replace(/\D/g, ''))}
                      className="glass-input text-center tracking-[1em] text-2xl font-bold"
                      placeholder="• • • •"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-primary-500/10 backdrop-blur-md rounded-xl border border-primary-500/20">
                    <CheckCircle className="text-primary-400 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-white/60">
                      Your PIN secures all transactions. Never share it with anyone.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <motion.button
                  type="button"
                  onClick={handleBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 px-6 rounded-xl border border-white/20 text-white/80 font-semibold hover:bg-white/10 transition-all"
                >
                  Back
                </motion.button>
              )}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`py-4 disabled:opacity-50 flex items-center justify-center gap-2 ${step === 1 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-all`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : step === 3 ? (
                  <>
                    <Sparkles size={18} />
                    CREATE ACCOUNT
                  </>
                ) : (
                  <>
                    NEXT
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center text-white/50 text-sm"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 font-semibold hover:text-sky-300 transition-colors">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register
