import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Truck, Crown, Clock, CheckCircle } from 'lucide-react'
import axios from 'axios'

const cardTypes = [
  { 
    id: 'virtual', 
    name: 'Virtual Card', 
    icon: CreditCard,
    desc: 'Instant digital card for online shopping',
    color: 'from-primary-500 to-primary-600',
    features: ['Instant activation', 'Online purchases only', 'No delivery needed']
  },
  { 
    id: 'physical', 
    name: 'Physical Card', 
    icon: Truck,
    desc: 'Real card delivered to your address',
    color: 'from-accent-pink to-pink-600',
    features: ['ATM withdrawals', 'POS payments', 'Contactless enabled']
  },
  { 
    id: 'credit', 
    name: 'Credit Card', 
    icon: Crown,
    desc: 'Premium card with credit line',
    color: 'from-accent-green to-emerald-600',
    features: ['Credit line up to ₦500k', 'Reward points', 'Travel benefits']
  }
]

const Cards = () => {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [myCards, setMyCards] = useState([])
  const [formData, setFormData] = useState({ address: '', phone: '' })

  useEffect(() => {
    fetchMyCards()
  }, [])

  const fetchMyCards = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/card/my-cards')
      setMyCards(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/card/request', {
        cardType: selectedType,
        address: formData.address,
        phone: formData.phone
      })
      setSuccess(true)
      fetchMyCards()
    } catch (error) {
      alert(error.response?.data?.error || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="glass sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="ml-4 text-xl font-bold">Cards</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {success ? (
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
              Your card request is being processed. We'll notify you once approved.
            </p>
            <button onClick={() => { setSuccess(false); setShowForm(false); setSelectedType(null); }} className="btn-primary px-8 py-3">
              Request Another
            </button>
          </motion.div>
        ) : !showForm ? (
          <>
            <h2 className="text-2xl font-bold mb-2">Request a Card</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Choose the card that fits your needs</p>

            <div className="space-y-4 mb-8">
              {cardTypes.map((card) => (
                <motion.button
                  key={card.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedType(card.id); setShowForm(true) }}
                  className="w-full glass-card p-6 text-left hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <card.icon className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{card.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{card.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {card.features.map((f, i) => (
                          <span key={i} className="text-xs px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {myCards.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">My Card Requests</h3>
                <div className="space-y-3">
                  {myCards.map((card, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CreditCard className="text-primary-600" size={20} />
                        <div>
                          <p className="font-medium capitalize">{card.cardType} Card</p>
                          <p className="text-sm text-gray-500">{new Date(card.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        card.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        card.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6">
              Request {selectedType?.charAt(0).toUpperCase() + selectedType?.slice(1)} Card
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Address</label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Enter your full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-primary-500"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary py-4 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Cards
