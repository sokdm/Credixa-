import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Send, User, Building2, Star } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Beneficiaries = () => {
  const navigate = useNavigate()
  const [beneficiaries, setBeneficiaries] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAccount, setNewAccount] = useState('')
  const [newBank, setNewBank] = useState('')
  const [newType, setNewType] = useState('individual')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBeneficiaries()
  }, [])

  const fetchBeneficiaries = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/beneficiary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setBeneficiaries(res.data)
    } catch (err) {
      console.error('Fetch beneficiaries failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const addBeneficiary = async () => {
    if (!newName || !newAccount || !newBank) return
    try {
      const res = await axios.post(`${API_URL}/api/beneficiary`, {
        name: newName,
        account: newAccount,
        bank: newBank,
        type: newType,
        favorite: false
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setBeneficiaries([...beneficiaries, res.data])
      setNewName(''); setNewAccount(''); setNewBank(''); setShowAdd(false)
    } catch (err) {
      console.error('Add beneficiary failed:', err)
    }
  }

  const toggleFavorite = async (id, current) => {
    try {
      await axios.put(`${API_URL}/api/beneficiary/${id}`, { favorite: !current }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setBeneficiaries(beneficiaries.map(b => b._id === id ? { ...b, favorite: !current } : b))
    } catch (err) {
      console.error('Toggle favorite failed:', err)
    }
  }

  const deleteBeneficiary = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/beneficiary/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setBeneficiaries(beneficiaries.filter(b => b._id !== id))
    } catch (err) {
      console.error('Delete beneficiary failed:', err)
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
            <h1 className="font-bold text-lg">Beneficiaries</h1>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-violet-600 rounded-lg hover:bg-violet-700">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 space-y-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <input type="text" value={newAccount} onChange={(e) => setNewAccount(e.target.value)} placeholder="Account number" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <input type="text" value={newBank} onChange={(e) => setNewBank(e.target.value)} placeholder="Bank name" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white" />
            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white">
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
            <button onClick={addBeneficiary} className="w-full py-3 bg-emerald-600 rounded-xl font-medium hover:bg-emerald-700">Add Beneficiary</button>
          </motion.div>
        )}

        <div className="space-y-3">
          {[...beneficiaries].sort((a, b) => b.favorite - a.favorite).map((b, idx) => (
            <motion.div key={b._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    {b.type === 'business' ? <Building2 size={20} className="text-violet-400" /> : <User size={20} className="text-violet-400" />}
                  </div>
                  <div>
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.account} • {b.bank}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleFavorite(b._id, b.favorite)} className={`p-2 rounded-lg transition-colors ${b.favorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}`}>
                    <Star size={18} fill={b.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => navigate('/transfer', { state: { beneficiary: b } })} className="p-2 bg-violet-600 rounded-lg hover:bg-violet-700">
                    <Send size={16} />
                  </button>
                  <button onClick={() => deleteBeneficiary(b._id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {beneficiaries.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No beneficiaries yet. Add your first beneficiary above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Beneficiaries
