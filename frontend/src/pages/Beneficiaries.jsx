import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Send, User, Building2, Star } from 'lucide-react'

const Beneficiaries = () => {
  const navigate = useNavigate()
  const [beneficiaries, setBeneficiaries] = useState([
    { id: 1, name: 'John Smith', account: '302093740999', bank: 'Chase Bank', type: 'individual', favorite: true },
    { id: 2, name: 'Sarah Wilson', account: '302093740888', bank: 'Bank of America', type: 'individual', favorite: false },
    { id: 3, name: 'Tech Corp Ltd', account: '302093740777', bank: 'Wells Fargo', type: 'business', favorite: true },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAccount, setNewAccount] = useState('')
  const [newBank, setNewBank] = useState('')

  const addBeneficiary = () => {
    if (!newName || !newAccount || !newBank) return
    setBeneficiaries([...beneficiaries, {
      id: Date.now(),
      name: newName,
      account: newAccount,
      bank: newBank,
      type: 'individual',
      favorite: false
    }])
    setNewName('')
    setNewAccount('')
    setNewBank('')
    setShowAdd(false)
  }

  const toggleFavorite = (id) => {
    setBeneficiaries(beneficiaries.map(b => b.id === id ? { ...b, favorite: !b.favorite } : b))
  }

  const deleteBeneficiary = (id) => {
    setBeneficiaries(beneficiaries.filter(b => b.id !== id))
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
            <button onClick={addBeneficiary} className="w-full py-3 bg-emerald-600 rounded-xl font-medium hover:bg-emerald-700">Add Beneficiary</button>
          </motion.div>
        )}

        <div className="space-y-3">
          {beneficiaries.sort((a, b) => b.favorite - a.favorite).map((b, idx) => (
            <motion.div key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
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
                  <button onClick={() => toggleFavorite(b.id)} className={`p-2 rounded-lg transition-colors ${b.favorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}`}>
                    <Star size={18} fill={b.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => navigate('/transfer', { state: { beneficiary: b } })} className="p-2 bg-violet-600 rounded-lg hover:bg-violet-700">
                    <Send size={16} />
                  </button>
                  <button onClick={() => deleteBeneficiary(b.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Beneficiaries
