import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight, Bell, BarChart3, Briefcase, CalendarClock,
  ChevronRight, HelpCircle, CreditCard, Home, LogOut, Menu, Moon, QrCode,
  Settings2, ShieldCheck, Sun, Users, WalletCards, Landmark, Receipt, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navigation = [
  {
    label: 'BANKING',
    links: [
      { to: '/dashboard', label: 'Overview', icon: Home },
      { to: '/history', label: 'Transactions', icon: Receipt },
      { to: '/transfer', label: 'Send money', icon: ArrowLeftRight }
    ]
  },
  {
    label: 'YOUR MONEY',
    links: [
      { to: '/cards', label: 'Cards', icon: CreditCard },
      { to: '/beneficiaries', label: 'Recipients', icon: Users },
      { to: '/bills', label: 'Payments', icon: WalletCards },
      { to: '/scheduled-payments', label: 'Reminders', icon: CalendarClock },
      { to: '/savings-goals', label: 'Savings goals', icon: Landmark },
      { to: '/budget', label: 'Budgets', icon: Briefcase }
    ]
  },
  {
    label: 'TOOLS',
    links: [
      { to: '/analytics', label: 'Insights', icon: BarChart3 },
      { to: '/invest', label: 'Investments', icon: BarChart3 },
      { to: '/qr-pay', label: 'QR payments', icon: QrCode },
      { to: '/cash-check', label: 'Cash checks', icon: Receipt }
    ]
  }
]

const accountLinks = [
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Settings', icon: Settings2 },
  { to: '/support', label: 'Help & support', icon: HelpCircle },
  { to: '/api-settings', label: 'Developer tools', icon: ShieldCheck }
]

const routeNames = Object.fromEntries(
  [...navigation.flatMap((group) => group.links), ...accountLinks].map(({ to, label }) => [to, label])
)

const BankingLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)
  const previousPath = useRef(location.pathname)
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there'

  useEffect(() => {
    if (previousPath.current === location.pathname) return
    previousPath.current = location.pathname
    setRouteLoading(true)
    const timer = window.setTimeout(() => setRouteLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  const navLinkClass = ({ isActive }) => `banking-nav-link${isActive ? ' is-active' : ''}`

  return (
    <div className="banking-layout">
      {mobileMenuOpen && <button type="button" className="banking-sidebar-backdrop" aria-label="Close account navigation" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`banking-sidebar${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Account navigation">
        <NavLink to="/dashboard" className="banking-brand">
          <span className="banking-brand-mark">C</span>
          <span><strong>Credixa</strong><small>PERSONAL BANKING</small></span>
        </NavLink>

        <div className="banking-account-chip">
          <span className="banking-avatar">{firstName.charAt(0).toUpperCase()}</span>
          <span className="banking-account-name"><strong>{user?.fullName || 'Your account'}</strong><small>Personal account</small></span>
          <ChevronRight size={16} aria-hidden="true" />
        </div>

        <nav className="banking-nav">
          {navigation.map((group) => (
            <section key={group.label} className="banking-nav-group">
              <p>{group.label}</p>
              {group.links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </section>
          ))}
        </nav>

        <div className="banking-sidebar-bottom">
          {accountLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
          <button type="button" className="banking-nav-link banking-logout" onClick={logout}>
            <LogOut size={18} strokeWidth={1.8} /><span>Sign out</span>
          </button>
        </div>

        <div className="banking-sidebar-foot"><ShieldCheck size={15} /> Secure account session</div>
      </aside>

      <div className="banking-main">
        <div className={`banking-route-progress${routeLoading ? ' is-active' : ''}`} aria-hidden="true"><span /></div>
        <header className="banking-topbar">
          <div className="banking-page-heading">
            <p>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName}</p>
            <span>{routeNames[location.pathname] || 'Your account'}</span>
          </div>
          <div className="banking-topbar-actions">
            <button type="button" className="banking-icon-button banking-menu-toggle" aria-label={mobileMenuOpen ? 'Close account navigation' : 'Open account navigation'} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button type="button" className="banking-icon-button" aria-label="Open notifications" onClick={() => navigate('/notifications')}>
              <Bell size={18} />
            </button>
            <button type="button" className="banking-icon-button" aria-label={`Switch to ${darkMode ? 'light' : 'dark'} theme`} onClick={toggleTheme}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button type="button" className="banking-topbar-profile" onClick={() => navigate('/profile')} aria-label="Open account settings">
              <span className="banking-avatar">{firstName.charAt(0).toUpperCase()}</span>
              <span>{firstName}</span>
            </button>
          </div>
        </header>
        <main className="banking-content">
          <div className="banking-page-enter">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default BankingLayout
