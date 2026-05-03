import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Clock, CheckCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ScheduledPayments = () => {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newFrequency, setNewFrequency] = useState('monthly')
  const [newDate, setNewDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/scheduled`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPayments(res.data)
    } catch (err) {
      console.error('Fetch payments failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const addPayment = async () => {
    if (!newName || !newAmount || !newDate) return
    try {
      const res = await axios.post(`${API_URL}/api/scheduled`, {
        name: newName,
        amount: Number(newAmount),
        frequency: newFrequency,
        nextDate: newDate,
        status: 'active'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPayments([...payments, res.data])
      setNewName(''); setNewAmount(''); setNewDate(''); setShowAdd(false)
    } catch (err) {
      console.error('Add payment failed:', err)
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      await axios.put(`${API_URL}/api/scheduled/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPayments(payments.map(p => p._id === id ? { ...p, status: newStatus } : p))
    } catch (err) {
      console.error('Toggle status failed:', err)
    }
  }

  const deletePayment = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/scheduled/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPayments(payments.filter(p => p._id !== id))
    } catch (err) {
      console.error('Delete payment failed:', err)
    }
  }

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
            <h1 className="font-bold text-lg">Scheduled Payments</h1>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-violet-600 rounded-lg hover:bg-violet-700">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 space-y-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Payment name" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Amount ($)" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <select value={newFrequency} onChange={(e) => setNewFrequency(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <button onClick={addPayment} className="w-full py-3 bg-emerald-600 rounded-xl font-medium hover:bg-emerald-700">Schedule Payment</button>
          </motion.div>
        )}

        <div className="space-y-3">
          {payments.map((payment, idx) => (
            <motion.div key={payment._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.status === 'active' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                    {payment.status === 'active' ? <CheckCircle size={20} className="text-emerald-400" /> : <Clock size={20} className="text-amber-400" />}
                  </div>
                  <div>
                    <p className="font-semibold">{payment.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{payment.frequency} • Next: {new Date(payment.nextDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="font-bold">${payment.amount}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(payment._id, payment.status)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${payment.status === 'active' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {payment.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button onClick={() => deletePayment(payment._id)} className="p-2 hover:bg-rose-500/20 rounded-xl text-gray-400 hover:text-rose-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
          {payments.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No scheduled payments yet. Add your first payment above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScheduledPayments
