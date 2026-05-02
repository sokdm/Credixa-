import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Target, Trash2, PiggyBank, TrendingUp } from 'lucide-react'

const SavingsGoals = () => {
  const navigate = useNavigate()
  const [goals, setGoals] = useState([
    { id: 1, name: 'New Car', target: 25000, current: 15000, deadline: '2024-12-31', icon: '🚗' },
    { id: 2, name: 'Emergency Fund', target: 10000, current: 8500, deadline: '2024-06-30', icon: '🛡️' },
    { id: 3, name: 'Vacation', target: 5000, current: 1200, deadline: '2024-08-15', icon: '✈️' },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newDeadline, setNewDeadline] = useState('')

  const addGoal = () => {
    if (!newName || !newTarget || !newDeadline) return
    setGoals([...goals, {
      id: Date.now(),
      name: newName,
      target: Number(newTarget),
      current: 0,
      deadline: newDeadline,
      icon: '🎯'
    }])
    setNewName('')
    setNewTarget('')
    setNewDeadline('')
    setShowAdd(false)
  }

  const addToGoal = (id, amount) => {
    setGoals(goals.map(g => g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g))
  }

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id))
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-700 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg">Savings Goals</h1>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-violet-600 rounded-lg hover:bg-violet-700">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400">Total Saved</p>
              <p className="text-3xl font-bold">${totalSaved.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Target</p>
              <p className="text-xl font-bold text-gray-300">${totalTarget.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }} />
          </div>
        </motion.div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 space-y-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Goal name" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <input type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="Target amount ($)" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <button onClick={addGoal} className="w-full py-3 bg-emerald-600 rounded-xl font-medium hover:bg-emerald-700">Create Goal</button>
          </motion.div>
        )}

        <div className="space-y-4">
          {goals.map((goal, idx) => {
            const progress = (goal.current / goal.target) * 100
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="font-semibold">{goal.name}</p>
                      <p className="text-xs text-gray-400">{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">${goal.current.toLocaleString()}</span>
                  <span className="text-gray-400">of ${goal.target.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addToGoal(goal.id, 100)} className="flex-1 py-2 bg-violet-600/20 text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-600/30">+$100</button>
                  <button onClick={() => addToGoal(goal.id, 500)} className="flex-1 py-2 bg-violet-600/20 text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-600/30">+$500</button>
                  <button onClick={() => addToGoal(goal.id, 1000)} className="flex-1 py-2 bg-violet-600/20 text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-600/30">+$1000</button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SavingsGoals
