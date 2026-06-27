import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Users, Building2, Search, UserCheck, Globe, ArrowRightLeft, RefreshCw, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'

const FALLBACK_RATES = {
  USD: { rate: 1, symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  EUR: { rate: 0.92, symbol: '€', flag: '🇪🇺', name: 'Euro' },
  GBP: { rate: 0.79, symbol: '£', flag: '🇬🇧', name: 'British Pound' },
  NGN: { rate: 1550, symbol: '₦', flag: '🇳🇬', name: 'Nigerian Naira' },
  GHS: { rate: 15.5, symbol: '₵', flag: '🇬🇭', name: 'Ghana Cedi' },
  KES: { rate: 132, symbol: 'KSh', flag: '🇰🇪', name: 'Kenyan Shilling' },
  ZAR: { rate: 18.7, symbol: 'R', flag: '🇿🇦', name: 'South African Rand' },
  JPY: { rate: 151, symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
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
  TRY: { rate: 32.1, symbol: '₺', flag: '🇹🇷', name: 'Turkish Lira' },
  COP: { rate: 3900, symbol: '$', flag: '🇨🇴', name: 'Colombian Peso' },
  ARS: { rate: 890, symbol: '$', flag: '🇦🇷', name: 'Argentine Peso' },
  CLP: { rate: 920, symbol: '$', flag: '🇨🇱', name: 'Chilean Peso' },
  PEN: { rate: 3.7, symbol: 'S/', flag: '🇵🇪', name: 'Peruvian Sol' },
  UYU: { rate: 39, symbol: '$', flag: '🇺🇾', name: 'Uruguayan Peso' },
  PYG: { rate: 7500, symbol: '₲', flag: '🇵🇾', name: 'Paraguayan Guarani' },
  BOB: { rate: 6.9, symbol: 'Bs', flag: '🇧🇴', name: 'Bolivian Boliviano' },
  DOP: { rate: 59, symbol: 'RD$', flag: '🇩🇴', name: 'Dominican Peso' },
  HNL: { rate: 24.7, symbol: 'L', flag: '🇭🇳', name: 'Honduran Lempira' },
  GTQ: { rate: 7.8, symbol: 'Q', flag: '🇬🇹', name: 'Guatemalan Quetzal' },
  CRC: { rate: 520, symbol: '₡', flag: '🇨🇷', name: 'Costa Rican Colon' },
  PAB: { rate: 1, symbol: 'B/.', flag: '🇵🇦', name: 'Panamanian Balboa' },
  JMD: { rate: 157, symbol: 'J$', flag: '🇯🇲', name: 'Jamaican Dollar' },
  TTD: { rate: 6.8, symbol: 'TT$', flag: '🇹🇹', name: 'Trinidad Dollar' },
  XCD: { rate: 2.7, symbol: 'EC$', flag: '🇦🇬', name: 'E.Caribbean Dollar' },
  XOF: { rate: 605, symbol: 'CFA', flag: '🇸🇳', name: 'W.African CFA' },
  MAD: { rate: 10, symbol: 'DH', flag: '🇲🇦', name: 'Moroccan Dirham' },
  EGP: { rate: 47.5, symbol: 'E£', flag: '🇪🇬', name: 'Egyptian Pound' },
  DZD: { rate: 134, symbol: 'DA', flag: '🇩🇿', name: 'Algerian Dinar' },
  ETB: { rate: 56, symbol: 'Br', flag: '🇪🇹', name: 'Ethiopian Birr' },
  UGX: { rate: 3700, symbol: 'USh', flag: '🇺🇬', name: 'Ugandan Shilling' },
  TZS: { rate: 2600, symbol: 'TSh', flag: '🇹🇿', name: 'Tanzanian Shilling' },
  RWF: { rate: 1300, symbol: 'RF', flag: '🇷🇼', name: 'Rwandan Franc' },
  ZMW: { rate: 26, symbol: 'K', flag: '🇿🇲', name: 'Zambian Kwacha' },
  MZN: { rate: 63, symbol: 'MT', flag: '🇲🇿', name: 'Mozambican Metical' },
  BWP: { rate: 13.5, symbol: 'P', flag: '🇧🇼', name: 'Botswana Pula' },
  MGA: { rate: 4500, symbol: 'Ar', flag: '🇲🇬', name: 'Malagasy Ariary' },
  AOA: { rate: 915, symbol: 'Kz', flag: '🇦🇴', name: 'Angolan Kwanza' }
}

const CURRENCY_META = {
  USD: { symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  EUR: { symbol: '€', flag: '🇪🇺', name: 'Euro' },
  GBP: { symbol: '£', flag: '🇬🇧', name: 'British Pound' },
  NGN: { symbol: '₦', flag: '🇳🇬', name: 'Nigerian Naira' },
  GHS: { symbol: '₵', flag: '🇬🇭', name: 'Ghana Cedi' },
  KES: { symbol: 'KSh', flag: '🇰🇪', name: 'Kenyan Shilling' },
  ZAR: { symbol: 'R', flag: '🇿🇦', name: 'South African Rand' },
  JPY: { symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
  CNY: { symbol: '¥', flag: '🇨🇳', name: 'Chinese Yuan' },
  INR: { symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
  CAD: { symbol: 'C$', flag: '🇨🇦', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', flag: '🇦🇺', name: 'Australian Dollar' },
  BRL: { symbol: 'R$', flag: '🇧🇷', name: 'Brazilian Real' },
  MXN: { symbol: '$', flag: '🇲🇽', name: 'Mexican Peso' },
  SGD: { symbol: 'S$', flag: '🇸🇬', name: 'Singapore Dollar' },
  AED: { symbol: 'د.إ', flag: '🇦🇪', name: 'UAE Dirham' },
  SAR: { symbol: '﷼', flag: '🇸🇦', name: 'Saudi Riyal' },
  CHF: { symbol: 'Fr', flag: '🇨🇭', name: 'Swiss Franc' },
  SEK: { symbol: 'kr', flag: '🇸🇪', name: 'Swedish Krona' },
  TRY: { symbol: '₺', flag: '🇹🇷', name: 'Turkish Lira' },
  COP: { symbol: '$', flag: '🇨🇴', name: 'Colombian Peso' },
  ARS: { symbol: '$', flag: '🇦🇷', name: 'Argentine Peso' },
  CLP: { symbol: '$', flag: '🇨🇱', name: 'Chilean Peso' },
  PEN: { symbol: 'S/', flag: '🇵🇪', name: 'Peruvian Sol' },
  UYU: { symbol: '$', flag: '🇺🇾', name: 'Uruguayan Peso' },
  PYG: { symbol: '₲', flag: '🇵🇾', name: 'Paraguayan Guarani' },
  BOB: { symbol: 'Bs', flag: '🇧🇴', name: 'Bolivian Boliviano' },
  DOP: { symbol: 'RD$', flag: '🇩🇴', name: 'Dominican Peso' },
  HNL: { symbol: 'L', flag: '🇭🇳', name: 'Honduran Lempira' },
  GTQ: { symbol: 'Q', flag: '🇬🇹', name: 'Guatemalan Quetzal' },
  CRC: { symbol: '₡', flag: '🇨🇷', name: 'Costa Rican Colon' },
  PAB: { symbol: 'B/.', flag: '🇵🇦', name: 'Panamanian Balboa' },
  JMD: { symbol: 'J$', flag: '🇯🇲', name: 'Jamaican Dollar' },
  TTD: { symbol: 'TT$', flag: '🇹🇹', name: 'Trinidad Dollar' },
  XCD: { symbol: 'EC$', flag: '🇦🇬', name: 'E.Caribbean Dollar' },
  XOF: { symbol: 'CFA', flag: '🇸🇳', name: 'W.African CFA' },
  MAD: { symbol: 'DH', flag: '🇲🇦', name: 'Moroccan Dirham' },
  EGP: { symbol: 'E£', flag: '🇪🇬', name: 'Egyptian Pound' },
  DZD: { symbol: 'DA', flag: '🇩🇿', name: 'Algerian Dinar' },
  ETB: { symbol: 'Br', flag: '🇪🇹', name: 'Ethiopian Birr' },
  UGX: { symbol: 'USh', flag: '🇺🇬', name: 'Ugandan Shilling' },
  TZS: { symbol: 'TSh', flag: '🇹🇿', name: 'Tanzanian Shilling' },
  RWF: { symbol: 'RF', flag: '🇷🇼', name: 'Rwandan Franc' },
  ZMW: { symbol: 'K', flag: '🇿🇲', name: 'Zambian Kwacha' },
  MZN: { symbol: 'MT', flag: '🇲🇿', name: 'Mozambican Metical' },
  BWP: { symbol: 'P', flag: '🇧🇼', name: 'Botswana Pula' },
  MGA: { symbol: 'Ar', flag: '🇲🇬', name: 'Malagasy Ariary' },
  AOA: { symbol: 'Kz', flag: '🇦🇴', name: 'Angolan Kwanza' }
}

const fetchLiveRates = async () => {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (!res.ok) throw new Error('API failed')
    const data = await res.json()
    return data.rates
  } catch (err) {
    console.log('Live rates failed, using fallback:', err.message)
    return null
  }
}

const buildRates = (apiRates) => {
  if (!apiRates) return FALLBACK_RATES
  const built = {}
  Object.keys(CURRENCY_META).forEach(code => {
    if (apiRates[code]) built[code] = { ...CURRENCY_META[code], rate: apiRates[code] }
  })
  built.USD = { ...CURRENCY_META.USD, rate: 1 }
  return Object.keys(built).length > 5 ? built : FALLBACK_RATES
}

const convertAmount = (amount, rate) => {
  if (!amount || isNaN(amount) || !rate) return '0.00'
  return (parseFloat(amount) * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getCurrencySymbol = (code, rates) => rates[code]?.symbol || '$'
const getCurrencyFlag = (code, rates) => rates[code]?.flag || '🌐'
const getCurrencyName = (code, rates) => rates[code]?.name || code

export const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center mb-6 lg:mb-8">
    {[1, 2, 3, 4].map((s) => (
      <div key={s} className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/40'}`}>
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
      <button onClick={() => { setTransferType('internal'); setStep(2) }} className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 lg:p-8 text-left hover:border-violet-500/50 transition-all ${transferType === 'internal' ? 'ring-2 ring-violet-600' : ''}`}>
        <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-4"><Users className="text-violet-400" size={28} /></div>
        <h3 className="text-lg font-semibold mb-2">Internal Transfer</h3>
        <p className="text-white/50 text-sm">Send to another Credixa account instantly</p>
      </button>
      <button onClick={() => { setTransferType('external'); setStep(2) }} className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 lg:p-8 text-left hover:border-violet-500/50 transition-all ${transferType === 'external' ? 'ring-2 ring-violet-600' : ''}`}>
        <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-4"><Building2 className="text-pink-400" size={28} /></div>
        <h3 className="text-lg font-semibold mb-2">External Transfer</h3>
        <p className="text-white/50 text-sm">Send to other banks worldwide</p>
      </button>
    </div>
  </motion.div>
)

export const Step2Details = ({ transferType, formData, setFormData, foundUser, searching, selectFoundUser, selectedRecipient, goToPin, setStep, error }) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [convertedAmount, setConvertedAmount] = useState('0.00')
  const [rates, setRates] = useState(FALLBACK_RATES)
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesUpdated, setRatesUpdated] = useState(null)

  useEffect(() => {
    const loadRates = async () => {
      setRatesLoading(true)
      const apiRates = await fetchLiveRates()
      const built = buildRates(apiRates)
      setRates(built)
      setRatesUpdated(new Date().toLocaleTimeString())
      setRatesLoading(false)
    }
    loadRates()
  }, [])

  useEffect(() => {
    const rate = rates[formData.targetCurrency]?.rate || 1
    setConvertedAmount(convertAmount(formData.amount, rate))
  }, [formData.amount, formData.targetCurrency, rates])

  const handleCurrencySelect = (currencyCode) => {
    setFormData({ ...formData, targetCurrency: currencyCode })
    setShowCurrencyDropdown(false)
  }

  const refreshRates = async () => {
    setRatesLoading(true)
    const apiRates = await fetchLiveRates()
    const built = buildRates(apiRates)
    setRates(built)
    setRatesUpdated(new Date().toLocaleTimeString())
    setRatesLoading(false)
  }

  const selectedCurrency = rates[formData.targetCurrency] || rates.USD

  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold mb-2">{transferType === 'internal' ? 'Internal Transfer' : 'External Transfer'}</h2>
      <p className="text-white/50 text-sm mb-6">Enter recipient details</p>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-rose-500/15 border border-rose-500/25 text-rose-400 rounded-xl text-sm">{error}</motion.div>
      )}

      <form onSubmit={goToPin} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 lg:p-8 space-y-5">
        {transferType === 'internal' ? (
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-white/70">Recipient Account Number</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input type="text" required value={formData.recipientAccount}
                onChange={(e) => setFormData({...formData, recipientAccount: e.target.value})}
                disabled={!!selectedRecipient}
                className={`w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors ${selectedRecipient ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="Enter account number" />
              {searching && !selectedRecipient && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}
            </div>

            {selectedRecipient && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center"><UserCheck className="text-violet-400" size={20} /></div>
                <div className="flex-1"><p className="font-semibold text-sm">{selectedRecipient.fullName}</p><p className="text-white/50 text-xs">{selectedRecipient.accountNumber}</p></div>
                <button type="button" onClick={() => { setFormData({ ...formData, recipientAccount: '' }); setSelectedRecipient(null) }} className="text-rose-400 text-xs hover:text-rose-300">Change</button>
              </motion.div>
            )}

            {foundUser && !selectedRecipient && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={() => selectFoundUser(foundUser)} className="mt-3 p-4 bg-white/10 border border-violet-500/30 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/15 transition-colors">
                <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center"><UserCheck className="text-violet-400" size={20} /></div>
                <div className="flex-1"><p className="font-semibold text-sm">{foundUser.fullName}</p><p className="text-white/50 text-xs">{foundUser.accountNumber}</p></div>
                <div className="text-violet-400 text-xs font-medium">Tap to select</div>
              </motion.div>
            )}

            {formData.recipientAccount && !foundUser && !searching && !selectedRecipient && formData.recipientAccount.length >= 5 && (
              <p className="mt-2 text-rose-400 text-xs">No user found with this account number</p>
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Bank Name</label>
              <input type="text" required value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Enter bank name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Account Number</label>
              <input type="text" required value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Enter account number" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Account Name</label>
              <input type="text" required value={formData.accountName}
                onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Enter account holder name" />
            </div>
            {/* EMAIL FIELD FOR EXTERNAL TRANSFER */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70 flex items-center gap-2">
                <Mail size={14} className="text-violet-400" />
                Recipient Email
              </label>
              <input type="email" value={formData.recipientEmail}
                onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Enter recipient email (optional)" />
              <p className="text-xs text-white/40 mt-1">We'll send a receipt to this email</p>
            </div>
          </>
        )}

        {/* Amount Section with Currency Selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white/70">Amount</label>
          <div className="relative mb-3">
            <button type="button" onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15 transition-colors focus:outline-none focus:border-violet-500 min-h-[52px]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedCurrency.flag}</span>
                <div className="text-left"><p className="text-sm font-medium">{selectedCurrency.name}</p><p className="text-xs text-white/50">{selectedCurrency.symbol} {formData.targetCurrency}</p></div>
              </div>
              <div className="flex items-center gap-2">{ratesLoading && <RefreshCw size={16} className="text-white/40 animate-spin" />}<Globe size={20} className="text-white/40" /></div>
            </button>
            {showCurrencyDropdown && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-2 max-h-[70vh] overflow-y-auto bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl">
                <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/10 p-3 flex items-center justify-between">
                  <p className="text-xs text-white/50">{ratesUpdated ? `Updated: ${ratesUpdated}` : 'Live rates'}</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); refreshRates() }} disabled={ratesLoading}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 px-2 py-1 rounded-lg hover:bg-violet-500/10 transition-colors disabled:opacity-50">
                    <RefreshCw size={12} className={ratesLoading ? 'animate-spin' : ''} />Refresh
                  </button>
                </div>
                {Object.entries(rates).map(([code, currency]) => (
                  <button key={code} type="button" onClick={() => handleCurrencySelect(code)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/10 transition-colors text-left min-h-[52px] ${formData.targetCurrency === code ? 'bg-violet-500/20 border-l-2 border-violet-500' : ''}`}>
                    <span className="text-2xl">{currency.flag}</span>
                    <div className="flex-1"><p className="text-sm font-medium text-white">{currency.name}</p><p className="text-xs text-white/50">1 USD = {currency.rate} {currency.symbol}</p></div>
                    {formData.targetCurrency === code && <CheckCircle size={18} className="text-violet-400" />}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold text-lg">$</span>
            <input type="number" required min="1" step="0.01" value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="0.00" />
          </div>

          {formData.amount && parseFloat(formData.amount) > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2"><ArrowRightLeft size={16} className="text-violet-400" /><p className="text-xs text-violet-400 font-medium uppercase tracking-wider">Recipient Receives</p></div>
              <p className="text-2xl font-bold text-white">{selectedCurrency.symbol}{convertedAmount}</p>
              <p className="text-xs text-white/50 mt-1">{selectedCurrency.flag} {getCurrencyName(formData.targetCurrency, rates)} • Exchange rate: 1 USD = {selectedCurrency.rate} {selectedCurrency.symbol}</p>
              {formData.targetCurrency !== 'USD' && <p className="text-xs text-white/40 mt-1">You send: ${parseFloat(formData.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</p>}
              {ratesUpdated && <p className="text-[10px] text-white/30 mt-2 flex items-center gap-1"><RefreshCw size={8} />Rate updated at {ratesUpdated}</p>}
            </motion.div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white/70">Narration (Optional)</label>
          <input type="text" value={formData.narration}
            onChange={(e) => setFormData({...formData, narration: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
            placeholder="What's this for?" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-colors">Back</button>
          <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold hover:opacity-90 transition-opacity">Continue to PIN</button>
        </div>
      </form>
    </motion.div>
  )
}

export const Step3PIN = ({ transferType, formData, selectedRecipient, setFormData, handleSubmit, setStep, loading, error }) => {
  const [rates, setRates] = useState(FALLBACK_RATES)
  const [ratesLoading, setRatesLoading] = useState(false)

  useEffect(() => {
    const loadRates = async () => {
      setRatesLoading(true)
      const apiRates = await fetchLiveRates()
      const built = buildRates(apiRates)
      setRates(built)
      setRatesLoading(false)
    }
    loadRates()
  }, [])

  const targetCurrency = rates[formData.targetCurrency] || rates.USD
  const convertedAmount = convertAmount(formData.amount, targetCurrency.rate)

  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold mb-2">Enter PIN</h2>
      <p className="text-white/50 text-sm mb-6">Confirm transfer with your 4-digit PIN</p>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-rose-500/15 border border-rose-500/25 text-rose-400 rounded-xl text-sm">{error}</motion.div>
      )}

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 lg:p-8 mb-6">
        <div className="space-y-3 mb-6">
          <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-xl p-4 border border-violet-500/20">
            <div className="flex justify-between items-start mb-2"><span className="text-white/50 text-sm">You Send</span><span className="font-bold text-lg">${parseFloat(formData.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
            <div className="flex items-center gap-2 mb-2"><ArrowRightLeft size={14} className="text-violet-400" /><div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent" /></div>
            <div className="flex justify-between items-start"><span className="text-violet-400 text-sm font-medium">Recipient Gets</span><span className="font-bold text-lg text-violet-300">{targetCurrency.symbol}{convertedAmount} {targetCurrency.flag}</span></div>
            <p className="text-xs text-white/40 mt-2 text-right">1 USD = {targetCurrency.rate} {targetCurrency.symbol}{ratesLoading && <RefreshCw size={10} className="inline ml-1 animate-spin" />}</p>
          </div>

          {transferType === 'internal' ? (
            <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">To</span>
              <div className="text-right">{selectedRecipient && <span className="text-sm font-medium block">{selectedRecipient.fullName}</span>}<span className="text-xs text-white/50 block">{formData.recipientAccount}</span></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Bank</span><span className="text-sm">{formData.bankName}</span></div>
              <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Account</span><span className="text-sm">{formData.accountNumber}</span></div>
              <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Name</span><span className="text-sm">{formData.accountName}</span></div>
              {formData.recipientEmail && (
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Email</span><span className="text-sm text-violet-400">{formData.recipientEmail}</span></div>
              )}
            </>
          )}

          {formData.narration && <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Narration</span><span className="text-sm">{formData.narration}</span></div>}
          <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Currency</span><span className="text-sm">{targetCurrency.flag} {targetCurrency.name}</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">Transaction PIN</label>
            <input type="password" required maxLength={4} value={formData.pin}
              onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-[1em] focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="••••" />
          </div>

           <div className="text-center">
  <Link to="/forgot-pin" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
    Forgot your PIN?
  </Link>
</div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-colors">Back</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold disabled:opacity-50 transition-opacity">{loading ? 'Processing...' : 'Confirm Transfer'}</button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
