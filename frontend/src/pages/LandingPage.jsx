import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, BadgeCheck, BarChart3, Check,
  ChevronDown, CreditCard, Globe2, LockKeyhole, Menu, MessageCircle,
  Moon, ShieldCheck, Smartphone, Sun, WalletCards, X
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } }
}

const featureCards = [
  { icon: WalletCards, title: 'A clear view of your money', copy: 'See account activity and your available balance together in one considered dashboard.' },
  { icon: ArrowUpRight, title: 'Transfers with care', copy: 'Move money between Credixa accounts through a simple, PIN-protected flow.' },
  { icon: BarChart3, title: 'Make sense of spending', copy: 'Review your recorded activity and organize your plans with built-in money tools.' },
  { icon: ShieldCheck, title: 'Security at every step', copy: 'Authenticated sessions, verification flows, and server-side checks help protect account activity.' }
]

const faqItems = [
  ['How do I get started?', 'Create an account using the registration form. Your available account features are shown after you sign in.'],
  ['How do Credixa transfers work?', 'Transfers between Credixa accounts update both account balances. External transfers debit and record the amount in Credixa, but are not settled through an outside bank.'],
  ['Are exchange rates guaranteed?', 'Currency quotes are indicative estimates and may change or be unavailable. A quote does not mean an external bank transfer will settle.'],
  ['How is my account protected?', 'Credixa uses authenticated sessions, transaction PIN protection, verification flows, and server-side validation.']
]

const LandingPage = () => {
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link className="landing-brand" to="/" aria-label="Credixa home">
            <span className="landing-brand-mark">C</span>
            <span>credixa</span>
          </Link>
          <button className="landing-menu-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`landing-links${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#stories" onClick={closeMenu}>Stories</a>
            <a href="#help" onClick={closeMenu}>Help</a>
            <div className="landing-nav-actions">
              <button className="landing-theme-button" type="button" aria-label={`Switch to ${darkMode ? 'light' : 'dark'} theme`} onClick={toggleTheme}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
              <button className="landing-signin" onClick={() => navigate('/login')}>Sign in</button>
              <button className="landing-button landing-button-small" onClick={() => navigate('/register')}>Get started <ArrowRight size={16} /></button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <motion.div className="landing-hero-copy" initial="hidden" animate="visible" variants={reveal}>
              <span className="landing-eyebrow"><span className="landing-eyebrow-dot" /> Banking, made more human</span>
              <h1>Your money.<br /><span>Your next move.</span></h1>
              <p>One thoughtful place to understand your account, follow your activity, and manage everyday money with confidence.</p>
              <div className="landing-hero-actions">
                <button className="landing-button" onClick={() => navigate('/register')}>Open your account <ArrowRight size={18} /></button>
                <a className="landing-text-link" href="#features">Explore Credixa <span>↓</span></a>
              </div>
              <div className="landing-trust-line"><ShieldCheck size={17} /> Secure account access <span /> Clear activity records <span /> No clutter</div>
            </motion.div>

            <motion.div className="landing-hero-visual" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <div className="landing-photo-frame">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1100&q=80"
                  alt="Customer using a payment card at a shop"
                  fetchPriority="high"
                />
              </div>
              <div className="landing-product-card" aria-label="Illustrative Credixa app preview">
                <div className="landing-preview-top">
                  <span className="landing-mini-brand"><span>C</span> credixa</span>
                  <span className="landing-preview-avatar">A</span>
                </div>
                <p className="landing-preview-label">Account overview</p>
                <div className="landing-preview-balance">Your account</div>
                <div className="landing-preview-caption">A clear view of your balance and activity</div>
                <div className="landing-preview-actions">
                  <span><i><ArrowUpRight size={16} /></i>Send</span>
                  <span><i><ArrowDownLeft size={16} /></i>Receive</span>
                  <span><i><CreditCard size={16} /></i>Cards</span>
                </div>
                <div className="landing-preview-activity">
                  <div className="landing-preview-activity-head"><strong>Recent activity</strong><span>View all</span></div>
                  <div><i className="activity-icon"><ArrowDownLeft size={15} /></i><span><b>Incoming transfer</b><small>Account activity</small></span><em>Recorded</em></div>
                  <div><i className="activity-icon"><ArrowUpRight size={15} /></i><span><b>Card payment</b><small>Account activity</small></span><em>Recorded</em></div>
                </div>
              </div>
              <div className="landing-floating-note"><span className="landing-floating-icon"><BadgeCheck size={19} /></span><span><b>Built around clarity</b><small>See your activity at a glance</small></span></div>
            </motion.div>
          </div>
        </section>

        <section className="landing-proof-strip" aria-label="Credixa product highlights">
          <div className="landing-container landing-proof-grid">
            <span><LockKeyhole size={19} /> Account-first security</span>
            <span><Smartphone size={19} /> Designed for every screen</span>
            <span><Globe2 size={19} /> Currency tools in one place</span>
            <span><MessageCircle size={19} /> Support when you need it</span>
          </div>
        </section>

        <section className="landing-section landing-features" id="features">
          <div className="landing-container">
            <motion.div className="landing-section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
              <span className="landing-eyebrow">Everyday banking, thoughtfully arranged</span>
              <h2>Less searching.<br /><span>More understanding.</span></h2>
              <p>Credixa brings your account essentials together in an interface designed to feel simple, clear, and in your control.</p>
            </motion.div>
            <div className="landing-feature-grid">
              {featureCards.map(({ icon: Icon, title, copy }, index) => (
                <motion.article className="landing-feature-card" key={title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} transition={{ delay: index * 0.06 }}>
                  <span className="landing-feature-icon"><Icon size={21} /></span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <span className="landing-card-arrow"><ArrowRight size={17} /></span>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-showcase" id="how-it-works">
          <div className="landing-container landing-showcase-grid">
            <div className="landing-showcase-image">
              <img src="https://images.unsplash.com/photo-1516321310764-8d8a4c218d3c?auto=format&fit=crop&w=1000&q=80" alt="Person checking their finances on a smartphone" loading="lazy" />
              <div className="landing-image-tag"><span className="landing-tag-dot" /> Your account, at a glance</div>
            </div>
            <motion.div className="landing-showcase-copy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
              <span className="landing-eyebrow">Made for everyday decisions</span>
              <h2>Everything in its place. <span>Nothing in your way.</span></h2>
              <p>From account details to recorded transactions, navigate the things you need with a calmer, more considered banking experience.</p>
              <ul>
                <li><Check size={17} /> Review account activity and transaction status</li>
                <li><Check size={17} /> Keep recipients and payment tools organized</li>
                <li><Check size={17} /> Use a responsive experience on phone or desktop</li>
              </ul>
              <button className="landing-button landing-button-outline" onClick={() => navigate('/register')}>See your account <ArrowRight size={17} /></button>
            </motion.div>
          </div>
        </section>

        <section className="landing-stories" id="stories">
          <div className="landing-container landing-stories-inner">
            <div className="landing-stories-heading">
              <span className="landing-eyebrow">A more personal banking experience</span>
              <h2>Built around the way<br />you manage money.</h2>
              <p>Explore the parts of Credixa designed to make daily account management feel more straightforward.</p>
            </div>
            <div className="landing-story-cards">
              <article className="landing-story-card">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=75" alt="" loading="lazy" />
                <div><span>ACCOUNT OVERVIEW</span><p>Know where to find your account information and recent activity.</p></div>
              </article>
              <article className="landing-story-card">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=75" alt="" loading="lazy" />
                <div><span>PAYMENT TOOLS</span><p>Keep transfer, recipient, and payment tools together in one place.</p></div>
              </article>
              <article className="landing-story-card">
                <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=75" alt="" loading="lazy" />
                <div><span>HELP WHEN NEEDED</span><p>Find support and account guidance without losing your place.</p></div>
              </article>
              <p className="landing-story-disclaimer">Illustrative product scenarios. Images are representative and do not depict verified Credixa customers or testimonials.</p>
            </div>
          </div>
        </section>

        <section className="landing-section landing-security">
          <div className="landing-container landing-security-panel">
            <div className="landing-security-icon"><ShieldCheck size={28} /></div>
            <div><span className="landing-eyebrow">Security is part of the experience</span><h2>Designed with account protection in mind.</h2><p>Credixa uses authentication, verification, and server-side checks to support secure access and account activity.</p></div>
            <button className="landing-button landing-button-light" onClick={() => navigate('/register')}>Get started <ArrowRight size={17} /></button>
          </div>
        </section>

        <section className="landing-section landing-faq" id="help">
          <div className="landing-container landing-faq-grid">
            <div className="landing-section-heading">
              <span className="landing-eyebrow">A few helpful answers</span>
              <h2>Good to know.</h2>
              <p>Find out more about getting started and managing your account.</p>
              <Link className="landing-text-link" to="/login">Visit account support <ArrowRight size={16} /></Link>
            </div>
            <div className="landing-faq-list">
              {faqItems.map(([question, answer], index) => (
                <article className={`landing-faq-item${openFaq === index ? ' is-open' : ''}`} key={question}>
                  <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                    {question}<ChevronDown size={19} />
                  </button>
                  {openFaq === index && <p>{answer}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-container landing-cta-inner">
            <div><span className="landing-eyebrow">Take the next step</span><h2>A clearer way to manage your money starts here.</h2></div>
            <button className="landing-button landing-button-light" onClick={() => navigate('/register')}>Create your account <ArrowRight size={18} /></button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-main">
          <div><Link className="landing-brand" to="/"><span className="landing-brand-mark">C</span><span>credixa</span></Link><p>Banking tools for a clearer view of your money.</p></div>
          <div className="landing-footer-links"><a href="#features">Features</a><a href="#help">FAQs</a><Link to="/login">Sign in</Link><Link to="/register">Create account</Link></div>
          <span className="landing-footer-note">Please review product details and account terms before use.</span>
        </div>
        <div className="landing-container landing-footer-bottom"><span>© {new Date().getFullYear()} Credixa</span><span>Account features are subject to availability.</span></div>
      </footer>
    </div>
  )
}

export default LandingPage
