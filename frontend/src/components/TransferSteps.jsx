import { motion } from 'framer-motion'
import { CheckCircle, Users, Building2, Search, UserCheck, Globe, ArrowRightLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

// Real-time exchange rates (USD base) - update these periodically or fetch from API
const EXCHANGE_RATES = {
  USD: { rate: 1, symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  EUR: { rate: 0.85, symbol: '€', flag: '🇪🇺', name: 'Euro' },
  GBP: { rate: 0.73, symbol: '£', flag: '🇬🇧', name: 'British Pound' },
  NGN: { rate: 1550, symbol: '₦', flag: '🇳🇬', name: 'Nigerian Naira' },
  GHS: { rate: 15.2, symbol: '₵', flag: '🇬🇭', name: 'Ghana Cedi' },
  KES: { rate: 129.5, symbol: 'KSh', flag: '🇰🇪', name: 'Kenyan Shilling' },
  ZAR: { rate: 18.4, symbol: 'R', flag: '🇿🇦', name: 'South African Rand' },
  JPY: { rate: 157.3, symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
  CNY: { rate: 7.24, symbol: '¥', flag: '🇨🇳', name: 'Chinese Yuan' },
  INR: { rate: 83.5, symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
  CAD: { rate: 1.36, symbol: 'C$', flag: '🇨🇦', name: 'Canadian Dollar' },
  AUD: { rate: 1.52, symbol: 'A$', flag: '🇦🇺', name: 'Australian Dollar' },
  BRL: { rate: 5.15, symbol: 'R$', flag: '🇧🇷', name: 'Brazilian Real' },
  MXN: { rate: 18.2, symbol: '$', flag: '🇲🇽', name: 'Mexican Peso' },
  SGD: { rate: 1.35, symbol: 'S$', flag: '🇸🇬', name: 'Singapore Dollar' },
  AED: { rate: 3.67, symbol: 'د.إ', flag: '🇦🇪', name: 'UAE Dirham' },
  SAR: { rate: 3.75, symbol: '﷼', flag: '🇸🇦', name: 'Saudi Riyal' },
  CHF: { rate: 0.88, symbol: 'Fr', flag: '🇨🇭', name: 'Swiss Franc' },
  SEK: { rate: 10.6, symbol: 'kr', flag: '🇸🇪', name: 'Swedish Krona' },
  TRY: { rate: 32.1, symbol: '₺', flag: '🇹🇷', name: 'Turkish Lira' }
}

const convertAmount = (amount, currencyCode) => {
  if (!amount || isNaN(amount)) return '0.00'
  const rate = EXCHANGE_RATES[currencyCode]?.rate || 1
  const converted = parseFloat(amount) * rate
  return converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getCurrencySymbol = (code) => EXCHANGE_RATES[code]?.symbol || '$'
const getCurrencyFlag = (code) => EXCHANGE_RATES[code]?.flag || '🌐'
const getCurrencyName = (code) => EXCHANGE_RATES[code]?.name || code

export const StepIndicator = ({ step }) => (
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
)

export const Step1SelectType = ({ transferType, setTransferType, setStep }) => (
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
        <p className="text-white/50 text-sm">Send to other banks worldwide</p>
      </button>
    </div>
  </motion.div>
)

export const Step2Details = ({
  transferType, formData, setFormData, foundUser, searching,
  selectFoundUser, selectedRecipient, goToPin, setStep, error
}) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [convertedAmount, setConvertedAmount] = useState('0.00')

  useEffect(() => {
    const converted = convertAmount(formData.amount, formData.targetCurrency)
    setConvertedAmount(converted)
  }, [formData.amount, formData.targetCurrency])

  const handleCurrencySelect = (currencyCode) => {
    setFormData({ ...formData, targetCurrency: currencyCode })
    setShowCurrencyDropdown(false)
  }

  const selectedCurrency = EXCHANGE_RATES[formData.targetCurrency] || EXCHANGE_RATES.USD

  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold mb-2">
        {transferType === 'internal' ? 'Internal Transfer' : 'External Transfer'}
      </h2>
      <p className="text-white/50 text-sm mb-6">Enter recipient details</p>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={goToPin} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 lg:p-8 space-y-5">
        {transferType === 'internal' ? (
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-white/70">Recipient Account Number</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                required
                value={formData.recipientAccount}
                onChange={(e) => {
                  setFormData({...formData, recipientAccount: e.target.value})
                }}
                disabled={!!selectedRecipient}
                className={`w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors ${
                  selectedRecipient ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                placeholder="Enter account number"
              />
              {searching && !selectedRecipient && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {selectedRecipient && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <UserCheck className="text-violet-400" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{selectedRecipient.fullName}</p>
                  <p className="text-white/50 text-xs">{selectedRecipient.accountNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, recipientAccount: '' })
                  }}
                  className="text-violet-400 text-xs font-medium hover:text-violet-300"
                >
                  Change
                </button>
              </motion.div>
            )}

            {foundUser && !selectedRecipient && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => selectFoundUser(foundUser)}
                className="mt-3 p-4 bg-white/10 border border-violet-500/30 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/15 transition-colors"
              >
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

            {formData.recipientAccount && !foundUser && !searching && !selectedRecipient && formData.recipientAccount.length >= 5 && (
              <p className="mt-2 text-red-400 text-xs">No user found with this account number</p>
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Bank Name</label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Account Number</label>
              <input
                type="text"
                required
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Enter account number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Account Name</label>
              <input
                type="text"
                required
                value={formData.accountName}
                onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Enter account holder name"
              />
            </div>
          </>
        )}

        {/* Amount Section with Currency Selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white/70">Amount</label>
          
          {/* Currency Selector */}
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15 transition-colors focus:outline-none focus:border-violet-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{selectedCurrency.flag}</span>
                <div className="text-left">
                  <p className="text-sm font-medium">{selectedCurrency.name}</p>
                  <p className="text-xs text-white/50">{selectedCurrency.symbol} {selectedCurrency.code}</p>
                </div>
              </div>
              <Globe size={18} className="text-white/40" />
            </button>

            {showCurrencyDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-2 max-h-64 overflow-y-auto bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl"
              >
                {Object.entries(EXCHANGE_RATES).map(([code, currency]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleCurrencySelect(code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left ${
                      formData.targetCurrency === code ? 'bg-violet-500/20 border-l-2 border-violet-500' : ''
                    }`}
                  >
                    <span className="text-xl">{currency.flag}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{currency.name}</p>
                      <p className="text-xs text-white/50">1 USD = {currency.rate} {currency.symbol}</p>
                    </div>
                    {formData.targetCurrency === code && (
                      <CheckCircle size={16} className="text-violet-400" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Amount Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold text-lg">$</span>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="0.00"
            />
          </div>
          {/* Live Conversion Display */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft size={16} className="text-violet-400" />
                <p className="text-xs text-violet-400 font-medium uppercase tracking-wider">Recipient Receives</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {selectedCurrency.symbol}{convertedAmount}
              </p>
              <p className="text-xs text-white/50 mt-1">
                {selectedCurrency.flag} {getCurrencyName(formData.targetCurrency)} • Exchange rate: 1 USD = {selectedCurrency.rate} {selectedCurrency.symbol}
              </p>
              {formData.targetCurrency !== 'USD' && (
                <p className="text-xs text-white/40 mt-1">
                  You send: ${parseFloat(formData.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD
                </p>
              )}
            </motion.div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white/70">Narration (Optional)</label>
          <input
            type="text"
            value={formData.narration}
            onChange={(e) => setFormData({...formData, narration: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
            placeholder="What's this for?"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold hover:opacity-90 transition-opacity"
          >
            Continue to PIN
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export const Step3PIN = ({
  transferType, formData, selectedRecipient, setFormData, handleSubmit,
  setStep, loading, error
}) => {
  const targetCurrency = EXCHANGE_RATES[formData.targetCurrency] || EXCHANGE_RATES.USD
  const convertedAmount = convertAmount(formData.amount, formData.targetCurrency)

  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold mb-2">Enter PIN</h2>
      <p className="text-white/50 text-sm mb-6">Confirm transfer with your 4-digit PIN</p>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 lg:p-8 mb-6">
        <div className="space-y-3 mb-6">
          {/* Amount with conversion */}
          <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-xl p-4 border border-violet-500/20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-white/50 text-sm">You Send</span>
              <span className="font-bold text-lg">${parseFloat(formData.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft size={14} className="text-violet-400" />
              <div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent" />
            </div>
            <div className="flex justify-between items-start">
              <span className="text-violet-400 text-sm font-medium">Recipient Gets</span>
              <span className="font-bold text-lg text-violet-300">
                {targetCurrency.symbol}{convertedAmount} {targetCurrency.flag}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-2 text-right">
              1 USD = {targetCurrency.rate} {targetCurrency.symbol}
            </p>
          </div>

          {transferType === 'internal' ? (
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">To</span>
              <div className="text-right">
                {selectedRecipient && (
                  <span className="text-sm font-medium block">{selectedRecipient.fullName}</span>
                )}
                <span className="text-xs text-white/50 block">{formData.recipientAccount}</span>
              </div>
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
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-white/50 text-sm">Currency</span>
            <span className="text-sm">{targetCurrency.flag} {targetCurrency.name}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">Transaction PIN</label>
            <input
              type="password"
              required
              maxLength={4}
              value={formData.pin}
              onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-[1em] focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="••••"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Processing...' : 'Confirm Transfer'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
