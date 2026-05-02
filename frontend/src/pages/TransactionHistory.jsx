import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Download, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const TransactionHistory = () => {
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
      const res = await axios.get('/api/transfer/history')
      setTransactions(res.data)
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
    if (filter === 'sent') {
      return tx.senderId === user?.id || tx.senderId?._id === user?.id
    }
    if (filter === 'received') {
      return tx.receiverId === user?.id || tx.receiverId?._id === user?.id
    }
    return true
  })

  const downloadReceipt = (tx) => {
    const dateObj = new Date(tx.createdAt)
    const content = `
╔══════════════════════════════════════════════════════════════╗
║                    CREDIXA BANKING                           ║
║                     OFFICIAL RECEIPT                         ║
╠══════════════════════════════════════════════════════════════╣
║  REFERENCE: ${tx.reference.padEnd(49)} ║
╠══════════════════════════════════════════════════════════════╣
║  Status:              SUCCESSFUL${''.padEnd(42)} ║
║  Type:                ${(tx.type === 'internal' ? 'Internal Transfer' : 'External Transfer').padEnd(42)} ║
║  Date:                ${dateObj.toLocaleDateString().padEnd(42)} ║
║  Time:                ${dateObj.toLocaleTimeString().padEnd(42)} ║
╠══════════════════════════════════════════════════════════════╣
║  FROM                                                        ║
║  Name:                ${tx.senderName.padEnd(42)} ║
║  Account:             ${(tx.senderAccountNumber || 'N/A').padEnd(42)} ║
║  Bank:                Credixa Banking${''.padEnd(42)} ║
╠══════════════════════════════════════════════════════════════╣
║  TO                                                          ║
║  Name:                ${tx.receiverName.padEnd(42)} ║
║  Account:             ${(tx.receiverAccountNumber || 'N/A').padEnd(42)} ║
║  Bank:                ${(tx.receiverBankName || 'Credixa Banking').padEnd(42)} ║
╠══════════════════════════════════════════════════════════════╣
║  AMOUNT:              ${formatMoney(tx.amount, tx.currency || '$').padEnd(42)} ║
╠══════════════════════════════════════════════════════════════╣
║  Thank you for banking with Credixa!                         ║
╚══════════════════════════════════════════════════════════════╝
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Credixa-Receipt-${tx.reference}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'sent', label: 'Sent' },
            { id: 'received', label: 'Received' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                filter === f.id 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((tx, idx) => {
              const isSender = tx.senderId === user?.id || tx.senderId?._id === user?.id
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSender ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {isSender ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.receiverName}</p>
                        <p className="text-sm text-gray-500">{tx.narration || tx.type}</p>
                        <p className="text-xs text-gray-400">{tx.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        isSender ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isSender ? '-' : '+'}{formatMoney(tx.amount, tx.currency || '$')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t dark:border-gray-700 flex gap-2">
                    <button
                      onClick={() => downloadReceipt(tx)}
                      className="flex-1 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Download Receipt
                    </button>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionHistory
