import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TransferConfirm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const transferData = location.state || {}
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (pin.length !== 4) {
      setError('Enter 4-digit PIN')
      return
    }
    setLoading(true)
    setError('')
    try {
      const endpoint = transferData.type === 'external' ? '/api/transfer/external' : '/api/transfer/internal'
      const res = await axios.post(`${API_URL}${endpoint}`, {
        ...transferData,
        pin
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      navigate('/transfer-success', { state: res.data.transaction })
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg">Transfer Money</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <Lock size={32} className="mx-auto text-violet-400" />
          <h2 className="text-xl font-bold">Enter PIN</h2>
          <p className="text-sm text-gray-400">Confirm transfer with your 4-digit PIN</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
            {error}
          </motion.div>
        )}

        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Amount</span>
            <span className="font-bold">${transferData.amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Bank</span>
            <span>{transferData.bankName || 'Credixa Banking'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Account</span>
            <span>{transferData.recipientAccount || transferData.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span>{transferData.recipientName || transferData.accountName}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-gray-400">Transaction PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl tracking-[1em] text-white"
            placeholder="••••"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 py-4 bg-gray-800 rounded-xl font-medium hover:bg-gray-700">
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || pin.length !== 4}
            className="flex-1 py-4 bg-violet-600 rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransferConfirm
