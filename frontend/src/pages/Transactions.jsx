import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Transactions = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/transactions')
      setTransactions(res.data.transactions || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatMoney = (amount, currency = '$') => {
    return `${currency}${amount?.toLocaleString() || '0'}`
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    const isOutgoing = tx.senderId === user?.id
    if (filter === 'sent') return isOutgoing
    if (filter === 'received') return !isOutgoing
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="glass sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="ml-4 text-xl font-bold">Transaction History</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'sent', label: 'Sent' },
            { key: 'received', label: 'Received' }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                filter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx, idx) => {
              const isOutgoing = tx.senderId === user?.id

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isOutgoing ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {isOutgoing ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-medium">{isOutgoing ? tx.receiverName : tx.senderName || tx.receiverName}</p>
                      <p className="text-sm text-gray-500">{tx.narration || tx.type}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      isOutgoing ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isOutgoing ? '-' : '+'}{formatMoney(tx.amount, tx.currency || '$')}
                    </p>
                    <p className="text-xs text-gray-500">{tx.reference}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Transactions
