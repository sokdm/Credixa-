import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Building2, Users, CheckCircle, Download, Search, UserCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Transfer = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [transferType, setTransferType] = useState('internal')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)

  const [formData, setFormData] = useState({
    recipientAccount: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: '',
    narration: '',
    pin: ''
  })

  const [foundUser, setFoundUser] = useState(null)
  const [searching, setSearching] = useState(false)

  const searchUser = useCallback(async (accountNumber) => {
    if (!accountNumber || accountNumber.length < 5) {
      setFoundUser(null)
      return
    }
    setSearching(true)
    try {
      const res = await axios.get(`${API_URL}/users/lookup/${accountNumber}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setFoundUser(res.data)
    } catch {
      setFoundUser(null)
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (transferType === 'internal' && formData.recipientAccount) {
      const timer = setTimeout(() => searchUser(formData.recipientAccount), 500)
      return () => clearTimeout(timer)
    }
  }, [formData.recipientAccount, transferType, searchUser])

  const selectFoundUser = (u) => {
    setFormData({ ...formData, recipientAccount: u.accountNumber })
    setFoundUser(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = transferType === 'internal' ? `${API_URL}/transfer/internal` : `${API_URL}/transfer/external`
      const payload = transferType === 'internal'
        ? {
            recipientAccount: formData.recipientAccount,
            amount: formData.amount,
            narration: formData.narration,
            pin: formData.pin
          }
        : {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
            amount: formData.amount,
            narration: formData.narration,
            pin: formData.pin
          }

      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setReceipt(res.data.transaction)
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = () => {
    if (!receipt) return
    const dateObj = new Date(receipt.date)
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    })

    const content = `
╔══════════════════════════════════════════════════════════════╗
║                    CREDIXA BANKING                           ║
║                     OFFICIAL RECEIPT                         ║
╠══════════════════════════════════════════════════════════════╣
║  REFERENCE: ${receipt.reference.padEnd(51)} ║
╠══════════════════════════════════════════════════════════════╣
║  Status:    ${'SUCCESSFUL'.padEnd(51)} ║
║  Type:      ${(transferType === 'internal' ? 'Internal Transfer' : 'External Transfer').padEnd(51)} ║
║  Date:      ${formattedDate.padEnd(51)} ║
║  Time:      ${formattedTime.padEnd(51)} ║
╠══════════════════════════════════════════════════════════════╣
║  FROM: ${receipt.senderName.padEnd(54)} ║
║  ACCT: ${receipt.senderAccountNumber.padEnd(54)} ║
║  BANK: ${'Credixa Banking'.padEnd(54)} ║
╠══════════════════════════════════════════════════════════════╣
║  TO:   ${receipt.receiverName.padEnd(54)} ║
║  ACCT: ${(receipt.receiverAccountNumber || 'N/A').padEnd(54)} ║
║  BANK: ${(receipt.bankName || 'Credixa Banking').padEnd(54)} ║
╠══════════════════════════════════════════════════════════════╣
║  AMOUNT: ${receipt.currency}${receipt.amount.toLocaleString()}                                      ║
╚══════════════════════════════════════════════════════════════╝
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Credixa-Receipt-${receipt.reference}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  }

  const goToPin = (e) => {
    e.preventDefault()
    if (transferType === 'internal') {
      if (!formData.recipientAccount || !formData.amount) {
        setError('Please fill all required fields')
        return
      }
    } else {
      if (!formData.bankName || !formData.accountNumber || !formData.accountName || !formData.amount) {
        setError('Please fill all required fields')
        return
      }
    }
    setError('')
    setStep(3)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="ml-4 text-xl font-bold">Transfer Money</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
        <div className="flex items-center justify-center mb-6 lg:mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/40'
              }`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              {s < 4 && <div className={`w-8 lg:w-12 h-1 mx-1 lg:mx-2 ${step > s ? 'bg-violet-600' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-6">Select Transfer Type</h2>
              <div className="grid gap-4 mb-8">
                <button
                  onClick={() => { setTransferType('internal'); setStep(2) }}
                  className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 lg:p-8 text-left hover:border-violet-500/50 transition-all ${
                    transferType === 'internal' ? 'ring-2 ring-violet-600' : ''
                  }`}
                >
                  <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="text-violet-400" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Internal Transfer</h3>
                  <p className="text-white/50 text-sm">Send to another Credixa account instantly</p>
                </button>

                <button
                  onClick={() => { setTransferType('external'); setStep(2) }}
                  className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 lg:p-8 text-left hover:border-violet-500/50 transition-all ${
                    transferType === 'external' ? 'ring-2 ring-violet-600' : ''
                  }`}
                >
                  <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Building2 className="text-pink-400" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">External Transfer</h3>
                  <p className="text-white/50 text-sm">Send to other banks</p>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-2">
                {transferType === 'internal' ? 'Internal Transfer' : 'External Transfer'}
              </h2>
              <p className="text-white/50 text-sm mb-6">Enter recipient details</p>

              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={goToPin} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 lg:p-8 space-y-5">
                {transferType === 'internal' ? (
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-white/70">Recipient Account Number</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                      <input type="text" required value={formData.recipientAccount}
                        onChange={(e) => setFormData({...formData, recipientAccount: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                        placeholder="Enter account number" />
                      {searching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {foundUser && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => selectFoundUser(foundUser)}
                        className="mt-3 p-4 bg-white/10 border border-violet-500/30 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/15 transition-colors">
                        <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                          <UserCheck className="text-violet-400" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{foundUser.fullName}</p>
                          <p className="text-white/50 text-xs">{foundUser.accountNumber}</p>
                        </div>
                        <div className="text-violet-400 text-xs font-medium">Tap to select</div>
                      </motion.div>
                    )}

                    {formData.recipientAccount && !foundUser && !searching && formData.recipientAccount.length >= 5 && (
                      <p className="mt-2 text-red-400 text-xs">No user found with this account number</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/70">Bank Name</label>
                      <input type="text" required value={formData.bankName}
                        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                        placeholder="Enter bank name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/70">Account Number</label>
                      <input type="text" required value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                        placeholder="Enter account number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/70">Account Name</label>
                      <input type="text" required value={formData.accountName}
                        onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                        placeholder="Enter account holder name" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">$</span>
                    <input type="number" required min="1" value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                      placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Narration (Optional)</label>
                  <input type="text" value={formData.narration}
                    onChange={(e) => setFormData({...formData, narration: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                    placeholder="What's this for?" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5">
                    Back
                  </button>
                  <button type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold">
                    Continue to PIN
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-2">Enter PIN</h2>
              <p className="text-white/50 text-sm mb-6">Confirm transfer with your 4-digit PIN</p>

              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 lg:p-8 mb-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/50 text-sm">Amount</span>
                    <span className="font-bold">${formData.amount}</span>
                  </div>
                  {transferType === 'internal' ? (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/50 text-sm">To</span>
                      <span className="text-sm">{formData.recipientAccount}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50 text-sm">Bank</span>
                        <span className="text-sm">{formData.bankName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50 text-sm">Account</span>
                        <span className="text-sm">{formData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-white/50 text-sm">Name</span>
                        <span className="text-sm">{formData.accountName}</span>
                      </div>
                    </>
                  )}
                  {formData.narration && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/50 text-sm">Narration</span>
                      <span className="text-sm">{formData.narration}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Transaction PIN</label>
                    <input type="password" required maxLength={4} value={formData.pin}
                      onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-[1em] focus:outline-none focus:border-violet-500"
                      placeholder="••••" />
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)}
                      className="flex-1 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5">
                      Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold disabled:opacity-50">
                      {loading ? 'Processing...' : 'Confirm Transfer'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 4 && receipt && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-green-400">Transfer Successful!</h2>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-4 text-center border-b border-white/10">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <h3 className="font-bold">CREDIXA BANKING</h3>
                  <p className="text-white/50 text-xs">Transaction Receipt</p>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/50 text-sm">Reference</span>
                    <span className="font-mono font-semibold text-sm">{receipt.reference}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/50 text-sm">Status</span>
                    <span className="text-green-400 font-bold text-sm">{receipt.status}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/50 text-sm">Type</span>
                    <span className="text-sm">{transferType === 'internal' ? 'Internal' : 'External'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/50 text-sm">Date</span>
                    <span className="text-sm">{formatDateTime(receipt.date).date}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/50 text-sm">Time</span>
                    <span className="text-sm">{formatDateTime(receipt.date).time}</span>
                  </div>

                  <div className="py-2 border-b border-white/5">
                    <p className="text-xs text-white/40 mb-1 uppercase">From</p>
                    <p className="font-semibold text-sm">{receipt.senderName}</p>
                    <p className="text-xs text-white/50">{receipt.senderAccountNumber}</p>
                  </div>

                  <div className="py-2 border-b border-white/5">
                    <p className="text-xs text-white/40 mb-1 uppercase">To</p>
                    <p className="font-semibold text-sm">{receipt.receiverName}</p>
                    <p className="text-xs text-white/50">{receipt.receiverAccountNumber || 'N/A'}</p>
                    <p className="text-xs text-white/50">{receipt.bankName || 'Credixa Banking'}</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-white/50 text-xs">Amount</p>
                    <p className="text-2xl font-bold text-white">{receipt.currency}{receipt.amount.toLocaleString()}</p>
                  </div>

                  {receipt.narration && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/50 text-sm">Narration</span>
                      <span className="text-sm text-right">{receipt.narration}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-white/10 text-center">
                  <p className="text-xs text-white/40">Thank you for banking with Credixa</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={downloadReceipt}
                  className="flex-1 py-3 border border-violet-600 text-violet-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-violet-600/10 text-sm">
                  <Download size={16} /> Download
                </button>
                <button onClick={() => { setStep(1); setReceipt(null); setFormData({ recipientAccount: '', bankName: '', accountNumber: '', accountName: '', amount: '', narration: '', pin: '' }); setFoundUser(null); }}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold text-sm">
                  New Transfer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Transfer
