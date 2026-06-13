import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Phone, Lock, MapPin, ArrowLeft, ArrowRight, CheckCircle, Shield, Sparkles, ChevronDown, Globe } from 'lucide-react'
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
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
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
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
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

  const selectCountry = (country) => {
    updateField('country', country)
    setCountryOpen(false)
    setCountrySearch('')
  }

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const stepVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  }

  const stepLabels = ['Personal Info', 'Account Details', 'Security Setup']

  return (
    <div className="auth-bg p-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="particle" style={{ 
          left: `${10 + i * 8}%`, 
          top: `${15 + (i % 4) * 20}%`,
          animationDelay: `${i * 0.6}s`,
          animationDuration: `${14 + i * 2}s`
        }} />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
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
          <div className="text-center mb-6">
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
              Create Account
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/40 text-sm"
            >
              Join Credixa in under 2 minutes
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <motion.div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                      s === step 
                        ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30' 
                        : s < step 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-white/30 border border-white/10'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {s < step ? <CheckCircle size={18} /> : s}
                  </motion.div>
                  {s < 3 && (
                    <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-white/10">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
                        initial={{ width: '0%' }}
                        animate={{ width: s < step ? '100%' : '0%' }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs">
              {stepLabels.map((label, i) => (
                <span key={i} className={`${i + 1 === step ? 'text-violet-400 font-medium' : 'text-white/30'}`}>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-5 p-3.5 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 rounded-xl text-sm text-center"
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
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="glass-input"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => updateField('phoneNumber', e.target.value)}
                        className="glass-input"
                        placeholder="+234 800 000 0000"
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
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="glass-input"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className="glass-input pr-10"
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="flex gap-1 mt-2">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                            formData.password.length >= i * 2 ? 'bg-emerald-500' : 'bg-white/10'
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs font-medium mb-2 ml-1">Country</label>
                    <div className="relative">
                      <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30 z-10" size={18} />
                      <button
                        type="button"
                        onClick={() => setCountryOpen(!countryOpen)}
                        className="w-full glass-input pr-10 text-left flex items-center justify-between"
                      >
                        <span className={formData.country ? 'text-white' : 'text-white/35'}>
                          <span className="flex items-center gap-2">
                            <Globe size={14} className="text-violet-400" />
                            {formData.country}
                          </span>
                        </span>
                        <ChevronDown size={16} className={`text-white/30 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {countryOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                          >
                            <div className="p-3 border-b border-white/5">
                              <input
                                type="text"
                                autoFocus
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder="Search country..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto scrollbar-thin">
                              {filteredCountries.map((country) => (
                                <button
                                  key={country}
                                  type="button"
                                  onClick={() => selectCountry(country)}
                                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                                    formData.country === country 
                                      ? 'bg-violet-500/20 text-violet-300' 
                                      : 'text-white/70 hover:bg-white/5'
                                  }`}
                                >
                                  {formData.country === country && <CheckCircle size={14} className="text-violet-400" />}
                                  {country}
                                </button>
                              ))}
                              {filteredCountries.length === 0 && (
                                <div className="px-4 py-3 text-sm text-white/30 text-center">No countries found</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <div className="w-14 h-14 mx-auto mb-4 bg-violet-500/15 rounded-2xl flex items-center justify-center border border-violet-500/20">
                      <Lock className="text-violet-400" size={24} />
                    </div>
                    <p className="text-sm text-white/50">
                      Create a 4-digit PIN for all transactions
                    </p>
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={formData.transactionPin}
                      onChange={(e) => updateField('transactionPin', e.target.value.replace(/\D/g, ''))}
                      className="glass-input text-center tracking-[1.5em] text-2xl font-bold"
                      placeholder="• • • •"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-violet-500/8 backdrop-blur-md rounded-xl border border-violet-500/15">
                    <CheckCircle className="text-violet-400 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-white/50 leading-relaxed">
                      Your PIN secures all transactions. Never share it with anyone. Credixa will never ask for your PIN.
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
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-4 px-6 rounded-xl border border-white/10 text-white/60 font-medium hover:bg-white/5 transition-all"
                >
                  Back
                </motion.button>
              )}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`py-4 disabled:opacity-50 flex items-center justify-center gap-2 ${step === 1 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all`}
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
                    Create Account
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-center text-white/40 text-sm"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register
