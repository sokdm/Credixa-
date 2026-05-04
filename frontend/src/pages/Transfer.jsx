import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { StepIndicator, Step1SelectType, Step2Details, Step3PIN } from '../components/TransferSteps'
import TransferReceipt from '../components/TransferReceipt'

const API_URL = 'https://credixa-api.onrender.com/api'

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

  // FIXED: Call correct backend endpoint /transfer/lookup-account/
  const searchUser = useCallback(async (accountNumber) => {
    if (!accountNumber || accountNumber.length < 5) {
      setFoundUser(null)
      return
    }
    setSearching(true)
    try {
      const res = await axios.get(`${API_URL}/transfer/lookup-account/${accountNumber}`, {
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
      const endpoint = transferType === 'internal'
        ? `${API_URL}/transfer/internal`
        : `${API_URL}/transfer/external`

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

      console.log(`[TRANSFER] Sending ${transferType} transfer:`, payload)
      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      console.log(`[TRANSFER] Success:`, res.data)
      setReceipt(res.data.transaction)
      setStep(4)
    } catch (err) {
      console.error(`[TRANSFER] Error:`, err.response?.data || err.message)
      setError(err.response?.data?.error || 'Transfer failed')
    } finally {
      setLoading(false)
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

  const resetTransfer = () => {
    setStep(1)
    setReceipt(null)
    setFormData({
      recipientAccount: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      amount: '',
      narration: '',
      pin: ''
    })
    setFoundUser(null)
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
        <StepIndicator step={step} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1SelectType
              transferType={transferType}
              setTransferType={setTransferType}
              setStep={setStep}
            />
          )}

          {step === 2 && (
            <Step2Details
              transferType={transferType}
              formData={formData}
              setFormData={setFormData}
              foundUser={foundUser}
              searching={searching}
              selectFoundUser={selectFoundUser}
              goToPin={goToPin}
              setStep={setStep}
              error={error}
            />
          )}

          {step === 3 && (
            <Step3PIN
              transferType={transferType}
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              setStep={setStep}
              loading={loading}
              error={error}
            />
          )}

          {step === 4 && receipt && (
            <TransferReceipt
              receipt={receipt}
              transferType={transferType}
              onNewTransfer={resetTransfer}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Transfer
