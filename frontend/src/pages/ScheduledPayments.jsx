import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Calendar, Repeat, Trash2, Clock, CheckCircle } from 'lucide-react'

const ScheduledPayments = () => {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([
    { id: 1, name: 'Netflix Subscription', amount: 15.99, frequency: 'monthly', nextDate: '2024-02-15', status: 'active', category: 'entertainment' },
    { id: 2, name: 'Rent Payment', amount: 1200, frequency: 'monthly', nextDate: '2024-02-01', status: 'active', category: 'housing' },
    { id: 3, name: 'Gym Membership', amount: 49.99, frequency: 'monthly', nextDate: '2024-02-10', status: 'paused', category: 'health' },
  ])
  const [showAdd, setShowAdd] = useState(false)

  const toggleStatus = (id) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p))
  }

  const deletePayment = (id) => {
    setPayments(payments.filter(p => p.id !== id))
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
            <input type="text" placeholder="Payment name" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <input type="number" placeholder="Amount ($)" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Yearly</option>
            </select>
            <input type="date" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <button className="w-full py-3 bg-emerald-600 rounded-xl font-medium hover:bg-emerald-700">Schedule Payment</button>
          </motion.div>
        )}

        <div className="space-y-3">
          {payments.map((payment, idx) => (
            <motion.div key={payment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.status === 'active' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                    {payment.status === 'active' ? <CheckCircle size={20} className="text-emerald-400" /> : <Clock size={20} className="text-amber-400" />}
                  </div>
                  <div>
                    <p className="font-semibold">{payment.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{payment.frequency} • Next: {payment.nextDate}</p>
                  </div>
                </div>
                <p className="font-bold">${payment.amount}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(payment.id)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${payment.status === 'active' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {payment.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button onClick={() => deletePayment(payment.id)} className="p-2 hover:bg-rose-500/20 rounded-xl text-gray-400 hover:text-rose-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScheduledPayments
