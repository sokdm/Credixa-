import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const Analytics = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('month')

  const stats = {
    week: { income: 1200, expenses: 800, savings: 400, topCategory: 'Food', transactions: 24 },
    month: { income: 5200, expenses: 3800, savings: 1400, topCategory: 'Rent', transactions: 98 },
    year: { income: 62000, expenses: 45000, savings: 17000, topCategory: 'Housing', transactions: 1200 }
  }

  const current = stats[period]

  const categories = [
    { name: 'Housing', amount: 1500, percentage: 39, color: 'bg-violet-500' },
    { name: 'Food', amount: 800, percentage: 21, color: 'bg-orange-500' },
    { name: 'Transport', amount: 500, percentage: 13, color: 'bg-blue-500' },
    { name: 'Entertainment', amount: 400, percentage: 11, color: 'bg-pink-500' },
    { name: 'Shopping', amount: 350, percentage: 9, color: 'bg-rose-500' },
    { name: 'Others', amount: 250, percentage: 7, color: 'bg-gray-500' },
  ]

  const monthlyData = [
    { month: 'Jan', income: 5000, expenses: 3500 },
    { month: 'Feb', income: 5200, expenses: 3800 },
    { month: 'Mar', income: 4800, expenses: 3200 },
    { month: 'Apr', income: 5500, expenses: 4000 },
    { month: 'May', income: 5100, expenses: 3600 },
    { month: 'Jun', income: 5300, expenses: 3900 },
  ]

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
        {/* Period Selector */}
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                period === p
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <ArrowDownLeft size={20} className="text-emerald-400 mb-2" />
            <p className="text-lg font-bold">${current.income.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Income</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <ArrowUpRight size={20} className="text-rose-400 mb-2" />
            <p className="text-lg font-bold">${current.expenses.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Expenses</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <TrendingUp size={20} className="text-amber-400 mb-2" />
            <p className="text-lg font-bold">${current.savings.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Savings</p>
          </div>
        </motion.div>

        {/* Simple Bar Chart */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4">Monthly Overview</h3>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map((data, idx) => {
              const maxVal = Math.max(...monthlyData.map(d => d.income))
              const incomeHeight = (data.income / maxVal) * 100
              const expenseHeight = (data.expenses / maxVal) * 100
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 h-full items-end">
                    <div
                      className="flex-1 bg-violet-500 rounded-t"
                      style={{ height: `${incomeHeight}%` }}
                    />
                    <div
                      className="flex-1 bg-rose-500 rounded-t"
                      style={{ height: `${expenseHeight}%` }}
                    />
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

        {/* Category Breakdown */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4">Spending by Category</h3>
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cat.name}</span>
                  <span className="text-gray-400">${cat.amount} ({cat.percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4">Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <TrendingUp size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-400">Savings Rate Up</p>
                <p className="text-xs text-gray-400">Your savings rate increased by 15% compared to last {period}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <TrendingDown size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">High Spending Alert</p>
                <p className="text-xs text-gray-400">Food spending is 20% higher than usual</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
