import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { StepIndicator, Step1SelectType, Step2Details, Step3PIN } from '../components/TransferSteps'
import TransferReceipt from '../components/TransferReceipt'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Transfer = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [transferType, setTransferType] = useState('internal')
  const [formData, setFormData] = useState({
    recipientAccount: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: '',
    narration: '',
    pin: '',
    targetCurrency: 'USD'
  })
  const [foundUser, setFoundUser] = useState(null)
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    if (transferType === 'internal' && formData.recipientAccount.length >= 5 && !selectedRecipient) {
      const timeout = setTimeout(async () => {
        setSearching(true)
        try {
          const res = await axios.get(`${API_URL}/api/transfer/lookup-account/${formData.recipientAccount}`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          })
          setFoundUser(res.data)
        } catch (err) {
          setFoundUser(null)
        }
        setSearching(false)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [formData.recipientAccount, transferType, selectedRecipient])

  const selectFoundUser = (user) => {
    setSelectedRecipient(user)
    setFormData({ ...formData, recipientAccount: user.accountNumber })
    setFoundUser(null)
  }

  const goToPin = (e) => {
    e.preventDefault()
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setError('')
    setStep(3)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.pin || formData.pin.length !== 4) {
      setError('Please enter a 4-digit PIN')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        pin: formData.pin,
        narration: formData.narration,
        targetCurrency: formData.targetCurrency,
        originalAmount: parseFloat(formData.amount)
      }

      const endpoint = transferType === 'internal' ? '/api/transfer/internal' : '/api/transfer/external'

      if (transferType === 'internal') {
        payload.recipientAccount = formData.recipientAccount
      } else {
        payload.bankName = formData.bankName
        payload.accountNumber = formData.accountNumber
        payload.accountName = formData.accountName
      }

      const res = await axios.post(`${API_URL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })

      // Use the transaction data from backend (which now includes targetCurrency)
      setReceipt(res.data.transaction)
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  const resetTransfer = () => {
    setStep(1)
    setTransferType('internal')
    setFormData({
      recipientAccount: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      amount: '',
      narration: '',
      pin: '',
      targetCurrency: 'USD'
    })
    setSelectedRecipient(null)
    setFoundUser(null)
    setReceipt(null)
    setError('')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] text-white">
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => step === 4 ? resetTransfer() : navigate(-1)}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Transfer Money</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
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
              selectedRecipient={selectedRecipient}
              goToPin={goToPin}
              setStep={setStep}
              error={error}
            />
          )}

          {step === 3 && (
            <Step3PIN
              transferType={transferType}
              formData={formData}
              selectedRecipient={selectedRecipient}
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
