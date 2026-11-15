import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Download, Filter, Search, X, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const TransactionHistory = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const wasExternalDebitRecorded = (tx) => tx.isSimulation && tx.status === 'completed'

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

  const userId = user?.id || user?._id
  const filteredTransactions = useMemo(() => transactions.filter(tx => {
    const senderId = tx.senderId?._id || tx.senderId
    const receiverId = tx.receiverId?._id || tx.receiverId
    const isSender = String(senderId) === String(userId)
    const haystack = [tx.reference, tx.senderName, tx.receiverName, tx.narration, tx.type]
      .filter(Boolean).join(' ').toLowerCase()
    if (filter === 'sent' && !isSender) return false
    if (filter === 'received' && (isSender || String(receiverId) !== String(userId))) return false
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false
    return !search.trim() || haystack.includes(search.trim().toLowerCase())
  }), [transactions, filter, typeFilter, statusFilter, search, userId])

  const downloadReceipt = (tx) => {
    const dateObj = new Date(tx.createdAt)
    const content = `
╔══════════════════════════════════════════════════════════════╗
║                    CREDIXA BANKING                           ║
║                     OFFICIAL RECEIPT                         ║
╠══════════════════════════════════════════════════════════════╣
║  REFERENCE: ${tx.reference.padEnd(49)} ║
╠══════════════════════════════════════════════════════════════╣
║  Status:              ${(tx.status.toUpperCase()).padEnd(42)} ║
║  Type:                ${(tx.isSimulation ? 'External Transfer (Credixa debit)' : tx.type === 'internal' ? 'Internal Transfer' : 'External Transfer').padEnd(42)} ║
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
║  Country:             ${(tx.receiverCountry || 'N/A').padEnd(42)} ║
╠══════════════════════════════════════════════════════════════╣
║  AMOUNT:              ${formatMoney(tx.amount, tx.currency || '$').padEnd(42)} ║
${tx.indicativeAmount ? `║  Indicative amount:    ${tx.indicativeAmount.toLocaleString()} ${tx.targetCurrency || ''}` : ''}
${tx.isSimulation ? `║  ${wasExternalDebitRecorded(tx) ? 'Credixa balance debited; no external bank contacted.' : 'No funds were debited; no external bank contacted.'}` : ''}
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
    <div className="transaction-page min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, reference or memo" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
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
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
            <option value="all">All types</option><option value="internal">Internal</option><option value="external">External</option><option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
            <option value="all">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option>
          </select>
        </div>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((tx, idx) => {
              const isSender = String(tx.senderId?._id || tx.senderId) === String(userId)
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
                        <p className="font-medium">{isSender ? `To ${tx.receiverName}` : `From ${tx.senderName}`}</p>
                        <p className="text-sm text-gray-500">{tx.isSimulation ? (wasExternalDebitRecorded(tx) ? 'Credixa balance debited — no external bank contacted' : 'External transfer not completed — no funds debited') : tx.narration || tx.type}</p>
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
                      {tx.isSimulation && <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{wasExternalDebitRecorded(tx) ? 'Recorded debit' : 'Not completed'}</p>}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t dark:border-gray-700 flex gap-2">
                    <button onClick={() => setSelectedTransaction(tx)} className="flex-1 py-2 text-sm text-teal-700 dark:text-teal-300 border border-teal-600 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 flex items-center justify-center gap-2">
                      <Eye size={14} /> View details
                    </button>
                    <button
                      onClick={() => downloadReceipt(tx)}
                      className="flex-1 py-2 text-sm text-teal-700 dark:text-teal-300 border border-teal-600 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 flex items-center justify-center gap-2"
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
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedTransaction(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold">Transaction details</h2><button onClick={() => setSelectedTransaction(null)} aria-label="Close details"><X size={20} /></button></div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Reference</dt><dd className="font-mono text-right">{selectedTransaction.reference}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Type</dt><dd className="capitalize">{selectedTransaction.isSimulation ? 'External transfer (Credixa debit)' : selectedTransaction.type}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Status</dt><dd className="capitalize">{selectedTransaction.status}</dd></div>
              {selectedTransaction.receiverCountry && <div className="flex justify-between gap-4"><dt className="text-gray-500">Recipient country</dt><dd>{selectedTransaction.receiverCountry}</dd></div>}
              {selectedTransaction.isSimulation && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">{wasExternalDebitRecorded(selectedTransaction) ? 'Your Credixa balance was debited. No outside bank was contacted or paid.' : 'This transfer was not completed and did not debit your balance.'}</p>}
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Date and time</dt><dd className="text-right">{new Date(selectedTransaction.createdAt).toLocaleString()}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Memo</dt><dd className="text-right">{selectedTransaction.narration || 'None'}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionHistory
