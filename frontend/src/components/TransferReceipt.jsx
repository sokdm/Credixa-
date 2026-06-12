import { motion } from 'framer-motion'
import { CheckCircle, Download, ArrowLeft, Copy, Calendar, Clock, User, Building2, Hash, FileText, CreditCard, Globe, ArrowRightLeft, Share2, Wallet } from 'lucide-react'
import { useState, useRef } from 'react'

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

const TransferReceipt = ({ receipt, transferType, onNewTransfer }) => {
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const receiptRef = useRef(null)

  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      shortDate: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      shortTime: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const dt = formatDateTime(receipt.date)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateTransactionId = () => {
    const prefix = 'TXN'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  const transactionId = receipt.transactionId || generateTransactionId()

  const targetCurrency = EXCHANGE_RATES[receipt.targetCurrency || receipt.currency || 'USD'] || EXCHANGE_RATES.USD
  const originalAmount = receipt.originalAmount || receipt.amount
  const displayAmount = receipt.amount

  const downloadReceipt = () => {
    if (!receipt) return

    const content = `
╔══════════════════════════════════════════════════════════════════╗
║                    CREDIXA DIGITAL BANKING                       ║
║                                                                  ║
║              OFFICIAL TRANSACTION RECEIPT                        ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  TRANSACTION ID    : ${transactionId.padEnd(47)} ║
║  REFERENCE NUMBER  : ${receipt.reference.padEnd(47)} ║
╠══════════════════════════════════════════════════════════════════╣
║  STATUS            : SUCCESSFUL                                  ║
║  TYPE              : ${(transferType === 'internal' ? 'Internal Transfer' : 'External Transfer').padEnd(47)} ║
║  DATE              : ${dt.date.padEnd(47)} ║
║  TIME              : ${dt.time.padEnd(47)} ║
║  PROCESSING TIME   : Instant                                     ║
╠══════════════════════════════════════════════════════════════════╣
║  FROM                                                            ║
║  Name:      ${receipt.senderName.padEnd(51)} ║
║  Account:   ${receipt.senderAccountNumber.padEnd(51)} ║
║  Bank:      Credixa Banking                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  TO                                                              ║
║  Name:      ${receipt.receiverName.padEnd(51)} ║
║  Account:   ${(receipt.receiverAccountNumber || 'N/A').padEnd(51)} ║
║  Bank:      ${(receipt.bankName || 'Credixa Banking').padEnd(51)} ║
╠══════════════════════════════════════════════════════════════════╣
║  AMOUNT SENT        : $${originalAmount.toLocaleString().padEnd(46)} ║
║  CURRENCY           : ${(targetCurrency.name + ' ' + targetCurrency.flag).padEnd(47)} ║
║  RECIPIENT RECEIVES : ${(targetCurrency.symbol + displayAmount.toLocaleString()).padEnd(47)} ║
╠══════════════════════════════════════════════════════════════════╣
║  NARRATION       : ${(receipt.narration || 'N/A').padEnd(49)} ║
║  CHANNEL         : Mobile App                                    ║
║  SESSION ID      : ${receipt.reference.padEnd(49)} ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  This is an official receipt generated by Credixa Banking.       ║
║  Keep this receipt for your records.                             ║
║                                                                  ║
║  For support: credixasupport@gmail.com                           ║
║  Generated: ${dt.shortDate} ${dt.shortTime.padEnd(37)} ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Credixa-Receipt-${receipt.reference}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareReceipt = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Credixa Transfer Receipt',
          text: `Transfer of ${targetCurrency.symbol}${displayAmount.toLocaleString()} to ${receipt.receiverName} - Ref: ${receipt.reference}`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto px-4"
    >
      {/* Success Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full flex items-center justify-center border-2 border-green-400/30 shadow-lg shadow-green-500/10"
        >
          <CheckCircle className="text-green-400" size={40} strokeWidth={2.5} />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-green-400"
        >
          Transfer Successful!
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-sm mt-1"
        >
          Transaction completed securely
        </motion.p>
      </div>

      {/* Receipt Card */}
      <motion.div 
        ref={receiptRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-b from-[#1a1a2e] to-[#131325] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
      >
        {/* Decorative Top Pattern */}
        <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        
        {/* Bank Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-white/5">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20"
          >
            <span className="text-white font-bold text-2xl">C</span>
          </motion.div>
          <h3 className="font-bold text-lg tracking-wider text-white">CREDIXA</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-0.5">Digital Banking</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-[10px] font-semibold uppercase tracking-wider">Successful</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Amount Section - Hero */}
          <div className="bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl p-5 text-center border border-violet-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet size={14} className="text-violet-400" />
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Amount Transferred</p>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">
                {targetCurrency.symbol}{displayAmount.toLocaleString()}
              </p>
              <p className="text-xs text-white/50 mt-1">
                {targetCurrency.flag} {targetCurrency.name}
              </p>
              
              {receipt.targetCurrency && receipt.targetCurrency !== 'USD' && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                    <ArrowRightLeft size={12} />
                    <span>Sent: ${originalAmount.toLocaleString()} USD</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar size={12} className="text-violet-400" />
                <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Date</p>
              </div>
              <p className="text-xs text-white/90 font-medium">{dt.shortDate}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock size={12} className="text-violet-400" />
                <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Time</p>
              </div>
              <p className="text-xs text-white/90 font-medium">{dt.shortTime}</p>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Hash size={12} className="text-violet-400" />
                <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Transaction ID</p>
              </div>
              <button
                onClick={() => copyToClipboard(transactionId)}
                className="text-violet-400 hover:text-violet-300 transition-colors p-1 hover:bg-violet-500/10 rounded-lg"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="font-mono font-semibold text-xs text-violet-300 tracking-wide">{transactionId}</p>
          </div>

          {/* Reference */}
          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText size={12} className="text-violet-400" />
              <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Reference</p>
            </div>
            <p className="font-mono font-semibold text-xs text-white/80">{receipt.reference}</p>
          </div>

          {/* Status & Type */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle size={12} className="text-green-400" />
                <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Status</p>
              </div>
              <p className="text-xs text-green-400 font-bold">SUCCESSFUL</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ArrowLeft size={12} className="text-violet-400" />
                <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Type</p>
              </div>
              <p className="text-xs text-white/90 font-medium">
                {transferType === 'internal' ? 'Internal' : 'External'}
              </p>
            </div>
          </div>

          {/* From Section */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <User size={14} className="text-violet-400" />
              </div>
              <div>
                <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">From</p>
                <p className="text-xs text-white/60">Credixa Banking</p>
              </div>
            </div>
            <p className="font-semibold text-sm text-white ml-10">{receipt.senderName}</p>
            <p className="text-[11px] text-white/40 font-mono ml-10">{receipt.senderAccountNumber}</p>
          </div>

          {/* To Section */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <User size={14} className="text-pink-400" />
              </div>
              <div>
                <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">To</p>
                <p className="text-xs text-white/60">{receipt.bankName || 'Credixa Banking'}</p>
              </div>
            </div>
            <p className="font-semibold text-sm text-white ml-10">{receipt.receiverName}</p>
            <p className="text-[11px] text-white/40 font-mono ml-10">{receipt.receiverAccountNumber || 'N/A'}</p>
          </div>

          {/* Currency Info */}
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Globe size={12} className="text-violet-400" />
              <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Currency</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{targetCurrency.flag}</span>
              <div>
                <p className="text-xs text-white/90 font-medium">{targetCurrency.name}</p>
                <p className="text-[10px] text-white/40">1 USD = {targetCurrency.rate} {targetCurrency.symbol}</p>
              </div>
            </div>
          </div>

          {/* Narration */}
          {receipt.narration && (
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText size={12} className="text-violet-400" />
                <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Narration</p>
              </div>
              <p className="text-xs text-white/80">{receipt.narration}</p>
            </div>
          )}

          {/* Session ID */}
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Hash size={12} className="text-violet-400" />
              <p className="text-white/30 text-[9px] uppercase tracking-wider font-medium">Session ID</p>
            </div>
            <p className="font-mono text-[11px] text-white/40">{receipt.reference}</p>
          </div>
        </div>
        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8 bg-white/10" />
            <CreditCard size={14} className="text-white/20" />
            <div className="h-px w-8 bg-white/10" />
          </div>
          <p className="text-[10px] text-white/30 text-center">Thank you for banking with Credixa</p>
          <p className="text-[10px] text-white/20 text-center mt-0.5">credixasupport@gmail.com</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 mt-5 mb-8"
      >
        <button
          onClick={downloadReceipt}
          className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white text-sm active:scale-95"
        >
          <Download size={16} /> Download
        </button>
        <button
          onClick={shareReceipt}
          className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white text-sm active:scale-95"
        >
          <Share2 size={16} /> Share
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onNewTransfer}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl text-white font-bold text-sm hover:opacity-90 transition-opacity active:scale-[0.98] mb-8 shadow-lg shadow-violet-500/20"
      >
        New Transfer
      </motion.button>
    </motion.div>
  )
}

export default TransferReceipt
