import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Download } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Analytics = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('month')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setTransactions(res.data || [])
    } catch (err) {
      console.error('Fetch transactions failed:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats from real transactions
  const now = new Date()
  const getPeriodStart = () => {
    if (period === 'week') {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return d
    }
    if (period === 'month') {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 1)
      return d
    }
    const d = new Date(now)
    d.setFullYear(d.getFullYear() - 1)
    return d
  }

  const periodStart = getPeriodStart()
  const periodTransactions = transactions.filter(t => new Date(t.createdAt) >= periodStart)

  const income = periodTransactions.filter(t => t.type === 'admin' || (t.receiverId && t.receiverId.toString() === localStorage.getItem('userId'))).reduce((sum, t) => sum + t.amount, 0)
  const expenses = periodTransactions.filter(t => t.type === 'internal' || t.type === 'external').reduce((sum, t) => sum + t.amount, 0)
  const savings = Math.max(income - expenses, 0)

  // Animated bar chart data (simulated monthly)
  const monthlyData = [
    { month: 'Jan', income: income * 0.8, expenses: expenses * 0.7 },
    { month: 'Feb', income: income * 0.9, expenses: expenses * 0.8 },
    { month: 'Mar', income: income * 0.7, expenses: expenses * 0.9 },
    { month: 'Apr', income: income * 1.1, expenses: expenses * 0.6 },
    { month: 'May', income: income * 0.95, expenses: expenses * 0.85 },
    { month: 'Jun', income: income, expenses: expenses },
  ]

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses))) || 1

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-700 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg">Analytics</h1>
          </div>
          <button className="p-2 hover:bg-gray-700 rounded-lg">
            <Download size={20} className="text-gray-400" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all ${period === p ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <TrendingUp size={20} className="text-emerald-400 mb-2" />
            <p className="text-lg font-bold">${income.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Income</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <TrendingDown size={20} className="text-rose-400 mb-2" />
            <p className="text-lg font-bold">${expenses.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Expenses</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <TrendingUp size={20} className="text-amber-400 mb-2" />
            <p className="text-lg font-bold">${savings.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Savings</p>
          </div>
        </motion.div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4">Monthly Overview</h3>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map((data, idx) => {
              const incomeHeight = (data.income / maxVal) * 100
              const expenseHeight = (data.expenses / maxVal) * 100
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 h-full items-end">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${incomeHeight}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="flex-1 bg-violet-500 rounded-t" />
                    <motion.div initial={{ height: 0 }} animate={{ height: `${expenseHeight}%` }} transition={{ duration: 0.8, delay: idx * 0.1 + 0.05 }}
                      className="flex-1 bg-rose-500 rounded-t" />
                  </div>
                  <span className="text-[10px] text-gray-400">{data.month}</span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-violet-500 rounded" /> Income</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded" /> Expenses</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4">Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <TrendingUp size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-400">Savings Rate</p>
                <p className="text-xs text-gray-400">Your savings rate is {income > 0 ? Math.round((savings / income) * 100) : 0}% for this {period}</p>
              </div>
            </div>
            {expenses > income && (
              <div className="flex items-start gap-3 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <TrendingDown size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-400">Spending Alert</p>
                  <p className="text-xs text-gray-400">Your expenses exceed income by ${(expenses - income).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
