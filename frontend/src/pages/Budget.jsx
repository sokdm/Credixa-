import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import axios from 'axios'

const Budget = () => {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Food & Dining', limit: 500, spent: 320, color: 'bg-orange-500' },
    { id: 2, category: 'Transportation', limit: 300, spent: 150, color: 'bg-blue-500' },
    { id: 3, category: 'Entertainment', limit: 200, spent: 180, color: 'bg-pink-500' },
    { id: 4, category: 'Shopping', limit: 400, spent: 450, color: 'bg-rose-500' },
    { id: 5, category: 'Bills', limit: 800, spent: 800, color: 'bg-violet-500' },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newLimit, setNewLimit] = useState('')

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent

  const addBudget = () => {
    if (!newCategory || !newLimit) return
    setBudgets([...budgets, {
      id: Date.now(),
      category: newCategory,
      limit: Number(newLimit),
      spent: 0,
      color: 'bg-emerald-500'
    }])
    setNewCategory('')
    setNewLimit('')
    setShowAdd(false)
  }

  const deleteBudget = (id) => {
    setBudgets(budgets.filter(b => b.id !== id))
  }

  const getProgress = (spent, limit) => Math.min((spent / limit) * 100, 100)
  const getStatus = (spent, limit) => {
    if (spent > limit) return { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/20', label: 'Over budget' }
    if (spent / limit > 0.8) return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Nearly there' }
    return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'On track' }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg">Budget Planner</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Summary Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Total Budget</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-400">${totalSpent.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Spent</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ${Math.abs(totalRemaining).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">{totalRemaining < 0 ? 'Over' : 'Remaining'}</p>
            </div>
          </div>
          <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
        </motion.div>

        {/* Add Budget Button */}
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full py-3 bg-violet-600 rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Budget Category
        </button>

        {/* Add Form */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 space-y-3">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-violet-500"
            />
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="Budget limit ($)"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-violet-500"
            />
            <button onClick={addBudget} className="w-full py-3 bg-emerald-600 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
              Create Budget
            </button>
          </motion.div>
        )}

        {/* Budget List */}
        <div className="space-y-4">
          {budgets.map((budget, idx) => {
            const progress = getProgress(budget.spent, budget.limit)
            const status = getStatus(budget.spent, budget.limit)
            const StatusIcon = status.icon
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800 rounded-2xl p-5 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${budget.color}`} />
                    <span className="font-medium">{budget.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color} flex items-center gap-1`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                    <button onClick={() => deleteBudget(budget.id)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">${budget.spent.toLocaleString()} spent</span>
                  <span className="text-gray-400">of ${budget.limit.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${budget.color} rounded-full transition-all`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {budget.spent > budget.limit && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Over budget by ${(budget.spent - budget.limit).toLocaleString()}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Budget
