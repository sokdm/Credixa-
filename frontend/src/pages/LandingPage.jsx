import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, CreditCard, PiggyBank, Clock, Receipt, Shield,
  CheckCircle, Users, TrendingUp, Activity, Star,
  ChevronDown, Menu, X, Sun, Moon, ArrowRight, Download
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const features = [
  { icon: Zap, title: 'Instant Transfers', desc: 'Send money fast to anyone, anywhere' },
  { icon: CreditCard, title: 'Virtual & Physical Cards', desc: 'Shop online and offline securely' },
  { icon: PiggyBank, title: 'Smart Savings', desc: 'Auto-save and earn rewards daily' },
  { icon: Clock, title: '24/7 Access', desc: 'Use banking anytime, any day' },
  { icon: Receipt, title: 'Bill Payments', desc: 'Pay airtime, electricity, TV, internet' },
  { icon: Shield, title: 'Advanced Security', desc: 'PIN, OTP, and bank-grade encryption' }
]

const whyChoose = [
  'No hidden charges',
  'Fast account opening',
  'User-friendly dashboard',
  'Secure transactions',
  'Real-time alerts',
  'Customer support'
]

const stats = [
  { icon: Users, value: '50,000+', label: 'Active Users' },
  { icon: TrendingUp, value: '₦20M+', label: 'Transferred Monthly' },
  { icon: Activity, value: '99.9%', label: 'Uptime Guaranteed' }
]

const testimonials = [
  { name: 'Sarah O.', text: 'Credixa made transfers so easy. Best banking app ever!' },
  { name: 'Michael K.', text: 'The best digital banking experience I have had.' },
  { name: 'Amina B.', text: 'Fast, secure, and reliable. Highly recommended!' }
]

const faqs = [
  { q: 'Is Credixa safe?', a: 'Yes, we use bank-grade encryption, PIN protection, and OTP verification.' },
  { q: 'How long to open account?', a: 'Less than 2 minutes. Just fill the form and start banking.' },
  { q: 'Can I get a card?', a: 'Yes, request virtual or physical cards from your dashboard.' },
  { q: 'Are transfers instant?', a: 'Internal transfers are instant. External transfers take a few minutes.' }
]

const LandingPage = () => {
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-40 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 via-purple-500 to-accent-pink rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold gradient-text">Credixa</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <motion.a 
                href="#features" 
                className="text-white/70 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >Features</motion.a>
              <motion.a 
                href="#why" 
                className="text-white/70 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >Why Us</motion.a>
              <motion.a 
                href="#faq" 
                className="text-white/70 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >FAQ</motion.a>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <motion.button 
                onClick={() => navigate('/login')} 
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-white">
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass-card mx-4 mb-4 p-4 space-y-3"
          >
            <a href="#features" className="block py-2 text-white/70">Features</a>
            <a href="#why" className="block py-2 text-white/70">Why Us</a>
            <a href="#faq" className="block py-2 text-white/70">FAQ</a>
            <button onClick={() => navigate('/login')} className="w-full btn-primary">Sign In</button>
          </motion.div>
        )}
      </nav>

      {/* Hero - Full screen with photo background */}
      <section className="hero-section min-h-screen flex items-center">
        <div className="hero-overlay" />
        
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-400 via-purple-500 to-accent-pink rounded-2xl flex items-center justify-center"
              style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' }}
            >
              <Shield className="text-white" size={40} />
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Bank smarter with{' '}
              <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-accent-pink bg-clip-text text-transparent">
                Credixa
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/70 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Secure online banking, instant transfers, smart savings, and full control of your money anytime.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button 
                onClick={() => navigate('/register')} 
                className="btn-primary btn-glow text-lg px-8 py-4 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight size={20} />
                Open Account
              </motion.button>
              <motion.button 
                onClick={() => navigate('/register')} 
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </motion.div>
            
            <motion.button 
              className="mt-6 text-sky-400 font-medium flex items-center gap-2 mx-auto hover:gap-3 transition-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ y: -2 }}
            >
              Download App <ChevronDown size={20} className="rotate-[-90deg]" />
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} className="text-white/50" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-white/50">Everything you need in one place</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-8 transition-all duration-300 group cursor-pointer"
              >
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-pink rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/20"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="text-white" size={28} />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/50">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section id="why" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Credixa</h2>
              <p className="text-white/50 mb-8">
                We built Credixa to give you complete control over your finances with zero hassle.
              </p>
              <div className="space-y-4">
                {whyChoose.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <CheckCircle className="text-accent-green flex-shrink-0" size={24} />
                    <span className="text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-6"
            >
              {stats.map((stat, idx) => (
                <motion.div 
                  key={idx} 
                  className="glass-card p-8 text-center transition-all duration-300"
                  whileHover={{ scale: 1.03, y: -3 }}
                >
                  <stat.icon className="mx-auto text-primary-400 mb-4" size={40} />
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-pink bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/50">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What Our Users Say
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 + i * 0.05 }}
                    >
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    </motion.div>
                  ))}
                </div>
                <p className="text-white/60 mb-6 italic">"{t.text}"</p>
                <p className="font-semibold bg-gradient-to-r from-primary-400 to-accent-pink bg-clip-text text-transparent">
                  — {t.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx} 
                className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left font-semibold"
                >
                  {faq.q}
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={20} className="text-white/60" />
                  </motion.div>
                </button>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4 text-white/60"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 text-white py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-pink rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold">Credixa</span>
              </div>
              <p className="text-white/40">Bank smarter, live better.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-white/40">
                <li>support@credixa.com</li>
                <li>+234 800 123 4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/40">
            © 2024 Credixa Banking. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
