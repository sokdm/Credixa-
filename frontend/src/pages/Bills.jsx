import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Smartphone, Zap, Tv, Wifi, Clock } from 'lucide-react'

const services = [
  { icon: Smartphone, name: 'Airtime', desc: 'Recharge your mobile phone', color: 'from-primary-500 to-primary-600' },
  { icon: Zap, name: 'Electricity', desc: 'Pay your electricity bills', color: 'from-yellow-500 to-orange-500' },
  { icon: Tv, name: 'TV Subscription', desc: 'Renew your cable TV', color: 'from-accent-pink to-pink-600' },
  { icon: Wifi, name: 'Internet Data', desc: 'Buy data bundles', color: 'from-accent-green to-emerald-600' }
]

const Bills = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="glass sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="ml-4 text-xl font-bold">Bills & Airtime</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-primary-100 to-accent-pink/20 dark:from-primary-900/30 dark:to-accent-pink/10 rounded-full flex items-center justify-center animate-pulse-slow">
            <Clock className="text-primary-600" size={48} />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 gradient-text">Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-12">
            We're working hard to bring you seamless bill payments. 
            Stay tuned for airtime, electricity, TV, and data purchases.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 opacity-60"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                  <service.icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{service.name}</h3>
                <p className="text-xs text-gray-500">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Bills
