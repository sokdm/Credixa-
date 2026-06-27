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
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
            <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
            <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
            <Route path="/qr-pay" element={<ProtectedRoute><QrPay /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
            <Route path="/invest" element={<ProtectedRoute><Invest /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/beneficiaries" element={<ProtectedRoute><Beneficiaries /></ProtectedRoute>} />
            <Route path="/scheduled-payments" element={<ProtectedRoute><ScheduledPayments /></ProtectedRoute>} />
            <Route path="/savings-goals" element={<ProtectedRoute><SavingsGoals /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
