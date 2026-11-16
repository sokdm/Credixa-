import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ForgotPIN from './pages/ForgotPIN'
import Dashboard from './pages/Dashboard'
import Transfer from './pages/Transfer'
import Cards from './pages/Cards'
import Loans from './pages/Loans'
import Bills from './pages/Bills'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import TransactionHistory from './pages/TransactionHistory'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import QrPay from './pages/QrPay'
import Budget from './pages/Budget'
import Invest from './pages/Invest'
import Analytics from './pages/Analytics'
import Support from './pages/Support'
import Beneficiaries from './pages/Beneficiaries'
import ScheduledPayments from './pages/ScheduledPayments'
import SavingsGoals from './pages/SavingsGoals'
import CashCheck from './pages/CashCheck'
import APISettings from './pages/APISettings'
import ProtectedRoute from './components/ProtectedRoute'
import BankingLayout from './components/BankingLayout'
import AdminRoute from './components/AdminRoute'

function App() {
  const protectedPage = (page) => (
    <ProtectedRoute>
      <BankingLayout>{page}</BankingLayout>
    </ProtectedRoute>
  )

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-pin" element={<ForgotPIN />} />
            <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
            <Route path="/transfer" element={protectedPage(<Transfer />)} />
            <Route path="/cards" element={protectedPage(<Cards />)} />
            <Route path="/loans" element={protectedPage(<Loans />)} />
            <Route path="/bills" element={protectedPage(<Bills />)} />
            <Route path="/profile" element={protectedPage(<Profile />)} />
            <Route path="/notifications" element={protectedPage(<Notifications />)} />
            <Route path="/history" element={protectedPage(<TransactionHistory />)} />
            <Route path="/qr-pay" element={protectedPage(<QrPay />)} />
            <Route path="/budget" element={protectedPage(<Budget />)} />
            <Route path="/invest" element={protectedPage(<Invest />)} />
            <Route path="/analytics" element={protectedPage(<Analytics />)} />
            <Route path="/support" element={protectedPage(<Support />)} />
            <Route path="/beneficiaries" element={protectedPage(<Beneficiaries />)} />
            <Route path="/scheduled-payments" element={protectedPage(<ScheduledPayments />)} />
            <Route path="/savings-goals" element={protectedPage(<SavingsGoals />)} />
            <Route path="/cash-check" element={protectedPage(<CashCheck />)} />
            <Route path="/api-settings" element={protectedPage(<APISettings />)} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
