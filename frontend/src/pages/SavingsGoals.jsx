import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const SavingsGoals = () => {
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/savings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setGoals(res.data)
    } catch (err) {
      console.error('Fetch goals failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const addGoal = async () => {
    if (!newName || !newTarget || !newDeadline) return
    try {
      const res = await axios.post(`${API_URL}/api/savings`, {
        name: newName,
        target: Number(newTarget),
        current: 0,
        deadline: newDeadline,
        icon: '🎯'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setGoals([...goals, res.data])
      setNewName(''); setNewTarget(''); setNewDeadline(''); setShowAdd(false)
    } catch (err) {
      console.error('Add goal failed:', err)
    }
  }

  const addToGoal = async (id, amount) => {
    const goal = goals.find(g => g._id === id)
    if (!goal) return
    try {
      const res = await axios.put(`${API_URL}/api/savings/${id}`, {
        current: Math.min(goal.current + amount, goal.target)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setGoals(goals.map(g => g._id === id ? res.data : g))
    } catch (err) {
      console.error('Update goal failed:', err)
    }
  }

  const deleteGoal = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/savings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setGoals(goals.filter(g => g._id !== id))
    } catch (err) {
      console.error('Delete goal failed:', err)
    }
  }

  const totalSaved = goals.reduce((sum, g) => sum + (g.current || 0), 0)
  const totalTarget = goals.reduce((sum, g) => sum + (g.target || 0), 0)

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
            <h1 className="font-bold text-lg">Savings Goals</h1>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-violet-600 rounded-lg hover:bg-violet-700">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
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
            <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" style={{ width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%` }} />
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
            const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0
            return (
              <motion.div key={goal._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon || '🎯'}</span>
                    <div>
                      <p className="font-semibold">{goal.name}</p>
                      <p className="text-xs text-gray-400">{daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal._id)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">${(goal.current || 0).toLocaleString()}</span>
                  <span className="text-gray-400">of ${(goal.target || 0).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addToGoal(goal._id, 100)} className="flex-1 py-2 bg-violet-600/20 text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-600/30">+$100</button>
                  <button onClick={() => addToGoal(goal._id, 500)} className="flex-1 py-2 bg-violet-600/20 text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-600/30">+$500</button>
                  <button onClick={() => addToGoal(goal._id, 1000)} className="flex-1 py-2 bg-violet-600/20 text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-600/30">+$1000</button>
                </div>
              </motion.div>
            )
          })}
          {goals.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No savings goals yet. Add your first goal above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SavingsGoals
