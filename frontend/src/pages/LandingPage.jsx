import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, CreditCard, PiggyBank, Clock, Receipt, Shield,
  CheckCircle, Users, TrendingUp, Activity,
  ChevronDown, Menu, X, ArrowRight,
  Wallet, ArrowUpRight, ArrowDownRight, BarChart3,
  Smartphone, Globe, Lock, Sparkles, Sun, Moon
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const features = [
  { icon: Zap, title: 'Credixa transfers', desc: 'Send money to another Credixa account with a secure, PIN-protected flow.' },
  { icon: CreditCard, title: 'Card management', desc: 'Review your card details and manage available card controls in one place.' },
  { icon: PiggyBank, title: 'Savings goals', desc: 'Create personal goals and keep your progress organized.' },
  { icon: Clock, title: 'Account access', desc: 'Review your balance and account activity from desktop, tablet, or mobile.' },
  { icon: Receipt, title: 'Everyday payments', desc: 'Explore the bill-payment options available in your account.' },
  { icon: Shield, title: 'Layered Account Security', desc: 'PIN protection, OTP verification, authenticated sessions, and server-side checks help protect every transaction.' }
]

const whyChoose = [
  'Review account activity and transfer records in one place',
  'Set up an account with guided registration',
  'Intuitive, user-friendly dashboard',
  'PIN-protected transfer flow',
  'Get help through the in-app support conversation',
  'Saved indicative currency quotes on transfer records'
]

const stats = [
  { icon: Wallet, value: 'One', label: 'Connected account overview', suffix: '' },
  { icon: TrendingUp, value: 'Clear', label: 'Spending and activity views', suffix: '' },
  { icon: Activity, value: 'Secure', label: 'PIN-protected transfer flow', suffix: '' }
]

const testimonials = [
  { name: 'Talk to support', role: 'In-app support conversation', text: 'Send a message to the Credixa support team and continue the conversation from your account.', avatar: '01' },
  { name: 'Review a transfer', role: 'Transaction history and receipts', text: 'Find transaction details, check recorded statuses, and download receipts from your history.', avatar: '02' },
  { name: 'Protect your account', role: 'Security and account settings', text: 'Use account settings and your transaction PIN to help keep access and transfers protected.', avatar: '03' }
]

const faqs = [
  { q: 'How does Credixa protect my account?', a: 'Credixa uses authenticated sessions, PIN protection for transfers, OTP flows, and server-side validation for account activity. Review the security details in your account and contact support with any concerns.' },
  { q: 'How long does it take to open an account?', a: 'Less than 2 minutes. Just fill the form, verify your identity, and start banking immediately.' },
  { q: 'Can I get both virtual and physical cards?', a: 'Absolutely. Request a virtual card instantly for online shopping, or order a physical card delivered to your address.' },
  { q: 'How do transfers work?', a: 'Internal Credixa-to-Credixa transfers update both account balances. External transfers debit and record the amount in Credixa, but are not settled through an outside bank.' },
  { q: 'Are currency conversions guaranteed?', a: 'Currency conversions are indicative estimates. Rates may be unavailable or change; an estimate is not a promise of external bank settlement.' }
]

const bankingImages = [
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'
]

const HeroIllustration = () => (
  <svg viewBox="0 0 500 400" className="fintech-illustration" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="250" cy="200" r="180" fill="url(#glow1)" opacity="0.3"/>
    <circle cx="350" cy="150" r="100" fill="url(#glow2)" opacity="0.2"/>
    <rect x="120" y="80" width="260" height="160" rx="20" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
    <rect x="140" y="100" width="80" height="12" rx="6" fill="rgba(255,255,255,0.3)"/>
    <rect x="140" y="125" width="140" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
    <rect x="140" y="145" width="100" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
    <circle cx="340" cy="130" r="25" fill="rgba(255,255,255,0.1)"/>
    <text x="340" y="135" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="bold">VISA</text>
    <motion.rect 
      x="320" y="40" width="140" height="90" rx="14" 
      fill="url(#cardGrad2)" 
      stroke="rgba(255,255,255,0.08)" 
      strokeWidth="1"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.rect 
      x="340" y="58" width="50" height="8" rx="4" 
      fill="rgba(255,255,255,0.3)"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.rect 
      x="340" y="75" width="80" height="6" rx="3" 
      fill="rgba(255,255,255,0.15)"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.rect 
      x="40" y="200" width="130" height="80" rx="12" 
      fill="url(#cardGrad3)" 
      stroke="rgba(255,255,255,0.08)" 
      strokeWidth="1"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    <motion.circle 
      cx="70" cy="230" r="15" 
      fill="rgba(16,185,129,0.3)"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    <motion.rect 
      x="95" y="222" width="50" height="6" rx="3" 
      fill="rgba(255,255,255,0.2)"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    <motion.rect 
      x="95" y="235" width="35" height="6" rx="3" 
      fill="rgba(255,255,255,0.1)"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    <motion.path 
      d="M 120 280 Q 180 260 220 270 T 300 250 T 380 240" 
      stroke="url(#lineGrad)" 
      strokeWidth="2" 
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.circle cx="380" cy="240" r="5" fill="#a78bfa"
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <circle cx="250" cy="320" r="4" fill="rgba(167,139,250,0.5)"/>
    <circle cx="280" cy="310" r="3" fill="rgba(236,72,153,0.4)"/>
    <circle cx="220" cy="330" r="3" fill="rgba(56,189,248,0.4)"/>
    <defs>
      <radialGradient id="glow1" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#ec4899" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(124,58,237,0.4)"/>
        <stop offset="50%" stopColor="rgba(236,72,153,0.2)"/>
        <stop offset="100%" stopColor="rgba(56,189,248,0.1)"/>
      </linearGradient>
      <linearGradient id="cardGrad2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(236,72,153,0.3)"/>
        <stop offset="100%" stopColor="rgba(124,58,237,0.2)"/>
      </linearGradient>
      <linearGradient id="cardGrad3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(16,185,129,0.2)"/>
        <stop offset="100%" stopColor="rgba(56,189,248,0.15)"/>
      </linearGradient>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7c3aed"/>
        <stop offset="50%" stopColor="#ec4899"/>
        <stop offset="100%" stopColor="#38bdf8"/>
      </linearGradient>
    </defs>
  </svg>
)

const ImageCard = ({ src, alt, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="relative rounded-2xl overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"/>
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
      loading="lazy"
    />
    <div className="absolute bottom-4 left-4 right-4 z-20">
      <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-2 border border-white/10">
        <Shield className="text-white" size={18} />
      </div>
      <p className="text-white font-semibold text-sm">{alt}</p>
    </div>
  </motion.div>
)

const LandingPage = () => {
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed w-full z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold gradient-text">Credixa</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Why Us', 'Gallery', 'Support', 'FAQ'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-white/60 hover:text-white text-sm font-medium transition-colors relative group"
                  whileHover={{ y: -1 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 transition-all group-hover:w-full"/>
                </motion.a>
              ))}
              <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <motion.button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
              <motion.button
                onClick={() => navigate('/register')}
                className="btn-primary text-sm px-5 py-2.5"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started
              </motion.button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-xl bg-white/5 text-white/60"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 text-white">
                {mobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass-card mx-4 mb-4 p-4 space-y-3"
          >
            {['Features', 'Why Us', 'Gallery', 'Support', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="block py-2 text-white/70 font-medium">
                {item}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              <button onClick={() => navigate('/login')} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium">Sign In</button>
              <button onClick={() => navigate('/register')} className="w-full btn-primary text-sm py-3">Get Started</button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section relative">
        <HeroIllustration />
        
        <motion.div 
          className="float-card float-card-1 hidden lg:flex items-center gap-3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="text-emerald-400" size={20} />
          </div>
          <div>
            <p className="text-xs text-white/50">Transfer activity</p>
            <p className="text-sm font-bold text-emerald-400">PIN protected</p>
          </div>
        </motion.div>

        <motion.div 
          className="float-card float-card-2 hidden lg:flex items-center gap-3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3 }}
        >
          <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
            <Wallet className="text-violet-400" size={20} />
          </div>
          <div>
            <p className="text-xs text-white/50">Balance</p>
            <p className="text-sm font-bold text-white">Account view</p>
          </div>
        </motion.div>

        <motion.div 
          className="float-card float-card-3 hidden lg:flex items-center gap-3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6 }}
        >
          <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="text-pink-400" size={20} />
          </div>
          <div>
            <p className="text-xs text-white/50">Savings goals</p>
            <p className="text-sm font-bold text-pink-400">Track progress</p>
          </div>
        </motion.div>

        <div className="hero-hero-content relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8"
            >
              <Sparkles className="text-violet-400" size={16} />
              <span className="text-sm text-white/70">A calmer view of everyday money</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Bank smarter<br />
              with{' '}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Credixa
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              A clearer way to review your balance, manage account activity, and move money within Credixa.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={() => navigate('/register')}
                className="btn-primary btn-glow text-base px-8 py-4 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowRight size={20} />
                Open Free Account
              </motion.button>
              <motion.a
                href="#features"
                className="px-8 py-4 border border-white/15 text-white rounded-xl font-medium hover:bg-white/5 transition-all backdrop-blur-sm flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Explore banking tools <ArrowRight size={18} />
              </motion.a>
            </motion.div>

            <motion.div
              className="hero-product-preview"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <div className="hero-preview-topline"><span>Credixa overview</span><span className="hero-live-dot">Product preview</span></div>
              <div className="hero-preview-balance"><span>Your account balance</span><strong aria-label="Balance hidden">••••••</strong><small>Your real balance appears after you sign in</small></div>
              <div className="hero-preview-grid">
                <div><span>Transfers</span><strong>Send securely</strong><small>PIN-protected</small></div>
                <div><span>Spending</span><strong>Stay informed</strong><small>Review your activity</small></div>
                <div><span>Savings</span><strong>Plan ahead</strong><small>Track personal goals</small></div>
              </div>
              <div className="hero-preview-activity"><span>Recent activity</span><b>Account history <ArrowRight size={14} /></b></div>
              <p className="text-sm text-white/50">Your transactions appear here after you sign in and use your account.</p>
            </motion.div>

            <motion.div
              className="mt-12 flex items-center justify-center gap-8 text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center gap-2">
                <Lock size={14} />
                <span className="text-xs">Layered account security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} />
                <span className="text-xs">Indicative FX estimates</span>
              </div>
              <div className="flex items-center gap-2"><Smartphone size={14} /><span className="text-xs">Built for every screen</span></div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} className="text-white/30" />
        </motion.div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-24 relative mesh-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-violet-400 text-sm font-semibold tracking-wider uppercase mb-3 block">Everyday banking</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need to<br />manage your money</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">Explore account tools for transfers, cards, savings goals, bills, and account security.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card p-8 group cursor-pointer"
              >
                <div className="feature-icon mb-6">
                  <feature.icon className="text-white" size={26} />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY SECTION ===== */}
      <section id="gallery" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-pink-400 text-sm font-semibold tracking-wider uppercase mb-3 block">Experience</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Banking at your fingertips</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">See how Credixa transforms the way you manage, send, and grow your money.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImageCard src={bankingImages[0]} alt="Secure Mobile Banking" delay={0} />
            <ImageCard src={bankingImages[1]} alt="Instant Card Payments" delay={0.1} />
            <ImageCard src={bankingImages[2]} alt="Smart Analytics" delay={0.2} />
            <ImageCard src={bankingImages[3]} alt="Global Transfers" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE + STATS SECTION ===== */}
      <section id="why-us" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-pink-400 text-sm font-semibold tracking-wider uppercase mb-3 block">Why Credixa</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Built for people who<br />take money seriously</h2>
              <p className="text-white/40 text-lg mb-10 leading-relaxed">
                We built Credixa to give you complete control over your finances with zero hassle. No hidden fees, no complicated processes — just pure banking freedom.
              </p>
              <div className="space-y-5">
                {whyChoose.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="w-7 h-7 bg-emerald-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-emerald-400" size={16} />
                    </div>
                    <span className="text-white/80 text-base">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="glass-card p-8 flex items-center gap-6"
                  whileHover={{ scale: 1.02, x: 8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                    <stat.icon className="text-violet-400" size={32} />
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold stat-glow mb-1">
                      {stat.value}
                    </div>
                    <div className="text-white/40 text-sm font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CUSTOMER SUPPORT SECTION ===== */}
      <section id="support" className="py-24 relative mesh-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-violet-400 text-sm font-semibold tracking-wider uppercase mb-3 block">Customer support</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Help when you need it</h2>
            <p className="text-white/40 text-lg">Get help with your account, transfers, and transaction records through Credixa support.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -8 }}
                className="testimonial-card glass-card"
              >
                <p className="text-white/60 mb-8 leading-relaxed text-sm">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section id="faq" className="py-24 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-pink-400 text-sm font-semibold tracking-wider uppercase mb-3 block">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Questions? Answered.</h2>
            <p className="text-white/40 text-lg">Everything you need to know about Credixa</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left"
                >
                  <span className="font-semibold text-white/90 text-sm pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={20} className="text-white/40" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === idx ? 'auto' : 0,
                    opacity: openFaq === idx ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-white/50 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-white/40 text-sm mb-4">Still have questions?</p>
            <button
              onClick={() => navigate('/support')}
              className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
            >
              Contact our support team →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-purple-900/20 to-pink-900/20"/>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to bank smarter?</h2>
            <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">Open a focused account for transfers, savings, cards, bills, and the financial activity you want to understand.</p>
            <motion.button
              onClick={() => navigate('/register')}
              className="btn-primary btn-glow text-lg px-10 py-5"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Create Free Account
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold gradient-text">Credixa</span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed mb-5">A clear, connected way to manage transfers, savings, cards, and everyday payments.</p>
              <a href="mailto:credixasupport@gmail.com" className="text-sm text-teal-300 hover:text-teal-200 transition-colors">credixasupport@gmail.com</a>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <div key={social} className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                    <Globe size={16} className="text-white/40" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white/80 mb-5 text-sm">Product</h4>
              <ul className="space-y-3">
                {[
                  ['Product overview', '#features'],
                  ['Account experience', '#gallery'],
                  ['Security', '#why-us'],
                  ['Frequently asked questions', '#faq']
                ].map(([item, href]) => (
                  <li key={item}><a href={href} className="text-white/30 hover:text-white/60 text-sm transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white/80 mb-5 text-sm">Your account</h4>
              <ul className="space-y-3">
                {[
                  ['Open an account', '/register'],
                  ['Sign in', '/login'],
                  ['Customer support', '/support']
                ].map(([item, href]) => (
                  <li key={item}><a href={href} className="text-white/30 hover:text-white/60 text-sm transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white/80 mb-5 text-sm">Help</h4>
              <ul className="space-y-3">
                {[
                  ['Support center', '#support'],
                  ['Contact support', '/support'],
                  ['FAQ', '#faq']
                ].map(([item, href]) => (
                  <li key={item}><a href={href} className="text-white/30 hover:text-white/60 text-sm transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/20 text-sm">© {new Date().getFullYear()} Credixa Banking. All rights reserved.</p>
            <p className="text-white/20 text-sm">Digital banking tools for your everyday finances</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
