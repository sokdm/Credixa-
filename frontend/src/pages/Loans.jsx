import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, PiggyBank } from 'lucide-react'
import axios from 'axios'

const Loans = () => {
  const navigate = useNavigate()
  const [eligible, setEligible] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [myLoans, setMyLoans] = useState([])
  const [formData, setFormData] = useState({ amount: '', duration: '', purpose: '' })

  useEffect(() => {
    checkEligibility()
    fetchMyLoans()
  }, [])

  const checkEligibility = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/loan/eligibility')
      setEligible(res.data.eligible)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyLoans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/loan/my-loans')
      setMyLoans(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post('http://localhost:5000/api/loan/request', formData)
      setSuccess(true)
      fetchMyLoans()
    } catch (error) {
      alert(error.response?.data?.error || 'Request failed')
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="ml-4 text-xl font-bold">Loans</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!eligible ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Not Yet Eligible</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              You need active transaction history for 30 days before loan eligibility. 
              Keep using Credixa for transfers and check back later.
            </p>
          </motion.div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your loan request is under review. We will notify you of the decision.
            </p>
            <button onClick={() => setSuccess(false)} className="btn-primary px-8 py-3">
              Request Another
            </button>
          </motion.div>
        ) : (
          <>
            <div className="glass-card p-6 mb-8 bg-gradient-to-br from-primary-50 to-accent-pink/10 dark:from-gray-800 dark:to-primary-900/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <PiggyBank className="text-primary-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Loan Eligible</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">You qualify for a loan</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">30+ days of active transfers verified</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Request Loan</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Loan Amount (₦)</label>
                <input
                  type="number"
                  required
                  min="5000"
                  max="500000"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-primary-500"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (Months)</label>
                <select
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select duration</option>
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <textarea
                  required
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="What do you need this loan for?"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-4 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Loan Request'}
              </button>
            </form>
          </>
        )}

        {myLoans.length > 0 && (
          <div className="mt-8 glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">My Loan Requests</h3>
            <div className="space-y-3">
              {myLoans.map((loan, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="font-medium">₦{loan.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{loan.duration} months • {new Date(loan.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    loan.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {loan.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Loans
