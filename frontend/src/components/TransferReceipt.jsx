import { motion } from 'framer-motion'
import { CheckCircle, Download, Copy, Calendar, Clock, User, Hash, ArrowRightLeft, Share2, Wallet, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

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
  AOA: { symbol: 'Kz', flag: '🇦🇴', name: 'Angolan Kwanza' },
  NZD: { symbol: 'NZ$', flag: '🇳🇿', name: 'New Zealand Dollar' },
  HKD: { symbol: 'HK$', flag: '🇭🇰', name: 'Hong Kong Dollar' },
  KRW: { symbol: '₩', flag: '🇰🇷', name: 'South Korean Won' },
  IDR: { symbol: 'Rp', flag: '🇮🇩', name: 'Indonesian Rupiah' },
  MYR: { symbol: 'RM', flag: '🇲🇾', name: 'Malaysian Ringgit' },
  PHP: { symbol: '₱', flag: '🇵🇭', name: 'Philippine Peso' },
  THB: { symbol: '฿', flag: '🇹🇭', name: 'Thai Baht' },
  VND: { symbol: '₫', flag: '🇻🇳', name: 'Vietnamese Dong' },
  PKR: { symbol: '₨', flag: '🇵🇰', name: 'Pakistani Rupee' },
  BDT: { symbol: '৳', flag: '🇧🇩', name: 'Bangladeshi Taka' },
  LKR: { symbol: '₨', flag: '🇱🇰', name: 'Sri Lankan Rupee' },
  NPR: { symbol: '₨', flag: '🇳🇵', name: 'Nepalese Rupee' },
  RUB: { symbol: '₽', flag: '🇷🇺', name: 'Russian Ruble' },
  PLN: { symbol: 'zł', flag: '🇵🇱', name: 'Polish Zloty' },
  CZK: { symbol: 'Kč', flag: '🇨🇿', name: 'Czech Koruna' },
  HUF: { symbol: 'Ft', flag: '🇭🇺', name: 'Hungarian Forint' },
  RON: { symbol: 'lei', flag: '🇷🇴', name: 'Romanian Leu' },
  DKK: { symbol: 'kr', flag: '🇩🇰', name: 'Danish Krone' },
  NOK: { symbol: 'kr', flag: '🇳🇴', name: 'Norwegian Krone' },
  ISK: { symbol: 'kr', flag: '🇮🇸', name: 'Icelandic Krona' },
  UAH: { symbol: '₴', flag: '🇺🇦', name: 'Ukrainian Hryvnia' },
  KZT: { symbol: '₸', flag: '🇰🇿', name: 'Kazakhstani Tenge' },
  AZN: { symbol: '₼', flag: '🇦🇿', name: 'Azerbaijani Manat' },
  AMD: { symbol: '֏', flag: '🇦🇲', name: 'Armenian Dram' },
  MDL: { symbol: 'L', flag: '🇲🇩', name: 'Moldovan Leu' },
  BHD: { symbol: '.د.ب', flag: '🇧🇭', name: 'Bahraini Dinar' },
  KWD: { symbol: 'د.ك', flag: '🇰🇼', name: 'Kuwaiti Dinar' },
  OMR: { symbol: 'ر.ع.', flag: '🇴🇲', name: 'Omani Rial' },
  QAR: { symbol: 'ر.ق', flag: '🇶🇦', name: 'Qatari Riyal' },
  JOD: { symbol: 'د.ا', flag: '🇯🇴', name: 'Jordanian Dinar' },
  LBP: { symbol: 'ل.ل', flag: '🇱🇧', name: 'Lebanese Pound' },
  BND: { symbol: 'B$', flag: '🇧🇳', name: 'Brunei Dollar' },
  FJD: { symbol: 'FJ$', flag: '🇫🇯', name: 'Fijian Dollar' }
}

const fetchLiveRates = async () => {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (!res.ok) throw new Error('API failed')
    const data = await res.json()
    return data.rates
  } catch (err) {
    return null
  }
}

const TransferReceipt = ({ receipt, transferType, onNewTransfer }) => {
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [liveRates, setLiveRates] = useState(null)
  const receiptRef = useRef(null)

  useEffect(() => {
    const loadRates = async () => {
      const rates = await fetchLiveRates()
      setLiveRates(rates)
    }
    loadRates()
  }, [])

  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    }
  }

  const dt = formatDateTime(receipt.date)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const transactionId = receipt.transactionId || receipt.reference || `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const targetCurrencyCode = receipt.targetCurrency || receipt.currency || 'USD'
  const targetCurrency = CURRENCY_META[targetCurrencyCode] || CURRENCY_META.USD
  
  const usdAmount = receipt.originalAmount || receipt.amount
  
  const liveRate = liveRates?.[targetCurrencyCode]
  const convertedAmount = liveRate 
    ? (parseFloat(usdAmount) * liveRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null

  const senderName = receipt.senderName || 'N/A'
  const senderAccount = receipt.senderAccountNumber || 'N/A'
  const receiverName = receipt.receiverName || receipt.recipientName || receipt.recipient || 'N/A'
  const receiverAccount = receipt.receiverAccountNumber || receipt.recipientAccount || receipt.accountNumber || 'N/A'
  const receiverBank = receipt.receiverBankName || receipt.bankName || receipt.recipientBank || 'Credixa Banking'

  const handleDownload = () => {
    const element = receiptRef.current
    if (!element) return
    
    const printWindow = window.open('', '_blank')
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transfer Receipt - ${transactionId}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 40px; background: #f8fafc; }
            .receipt { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { text-align: center; margin-bottom: 20px; }
            .success-badge { display: inline-flex; align-items: center; gap: 8px; background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; }
            .amount-section { text-align: center; margin: 16px 0; padding: 16px; background: #f8fafc; border-radius: 12px; }
            .amount { font-size: 28px; font-weight: 700; color: #0f172a; }
            .converted { font-size: 16px; color: #059669; margin-top: 6px; font-weight: 600; }
            .parties { display: flex; align-items: center; justify-content: space-between; margin: 16px 0; padding: 12px; background: #f8fafc; border-radius: 12px; }
            .party { text-align: center; flex: 1; }
            .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px; }
            .party-name { font-size: 13px; font-weight: 600; color: #0f172a; }
            .party-acct { font-size: 11px; color: #64748b; margin-top: 2px; }
            .arrow { color: #059669; font-size: 20px; font-weight: 700; margin: 0 8px; }
            .details { margin-top: 16px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: #64748b; }
            .detail-value { color: #0f172a; font-weight: 500; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e2e8f0; color: #64748b; font-size: 11px; }
            .logo { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
            .tagline { font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">CREDIXA</div>
              <div class="tagline">Secure Global Transfers</div>
              <div style="margin-top:12px">
                <div class="success-badge">✓ Transfer Successful</div>
              </div>
            </div>
            
            <div class="amount-section">
              <div class="amount">$${parseFloat(usdAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
              ${convertedAmount ? `<div class="converted">≈ ${targetCurrency.symbol}${convertedAmount} ${targetCurrencyCode}</div>` : ''}
            </div>

            <div class="parties">
              <div class="party">
                <div class="party-label">From</div>
                <div class="party-name">${senderName}</div>
                <div class="party-acct">${senderAccount}</div>
              </div>
              <div class="arrow">→</div>
              <div class="party">
                <div class="party-label">To</div>
                <div class="party-name">${receiverName}</div>
                <div class="party-acct">${receiverAccount}</div>
              </div>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Transaction ID</span>
                <span class="detail-value">${transactionId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${dt.fullDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${dt.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transfer Type</span>
                <span class="detail-value">${transferType === 'wire' ? 'Wire Transfer' : transferType === 'mobile' ? 'Mobile Money' : transferType === 'external' ? 'External Transfer' : 'Bank Transfer'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Currency</span>
                <span class="detail-value">${targetCurrency.flag} ${targetCurrency.name} (${targetCurrencyCode})</span>
              </div>
              ${receipt.narration ? `
              <div class="detail-row">
                <span class="detail-label">Description</span>
                <span class="detail-value">${receipt.narration}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value" style="color: #059669; font-weight: 600;">Completed</span>
              </div>
            </div>
            
            <div class="footer">
              <p>This receipt was generated automatically by CREDIXA.</p>
              <p>Keep this for your records.</p>
            </div>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  const handleShare = async () => {
    const shareData = {
      title: 'CREDIXA Transfer Receipt',
      text: `Transfer of $${parseFloat(usdAmount).toLocaleString()} USD to ${receiverName} (${targetCurrencyCode}) completed successfully. TXN: ${transactionId}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled
      }
    } else {
      copyToClipboard(shareData.text)
    }
    setShowShareMenu(false)
  }

  const receiptDetails = [
    { icon: Hash, label: 'Transaction ID', value: transactionId, copyable: true },
    { icon: Calendar, label: 'Date', value: dt.fullDate },
    { icon: Clock, label: 'Time', value: dt.time },
    { icon: ArrowRightLeft, label: 'Transfer Type', value: transferType === 'wire' ? 'Wire Transfer' : transferType === 'mobile' ? 'Mobile Money' : transferType === 'external' ? 'External Transfer' : 'Bank Transfer' },
    { icon: Wallet, label: 'Recipient Currency', value: `${targetCurrency.flag} ${targetCurrency.name} (${targetCurrencyCode})` },
    ...(receipt.narration ? [{ icon: Hash, label: 'Description', value: receipt.narration }] : []),
  ]

return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <div
        ref={receiptRef}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-2 backdrop-blur-sm"
          >
            <CheckCircle className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="text-xl font-bold mb-0.5">Transfer Successful!</h2>
          <p className="text-emerald-100 text-xs">Your money is on its way</p>
        </div>

        {/* Amount Section - BOTH USD sent AND converted target currency */}
        <div className="p-4 text-center border-b border-slate-100">
          <p className="text-slate-500 text-xs mb-1">You sent</p>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            ${parseFloat(usdAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-slate-400">USD</span>
          </div>
          
          {convertedAmount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              Receiver gets ≈ {targetCurrency.symbol}{convertedAmount} {targetCurrencyCode}
            </motion.div>
          )}
          
          {!convertedAmount && liveRates === null && (
            <p className="text-xs text-slate-400 mt-1">Exchange rate unavailable</p>
          )}
        </div>

        {/* Sender → Receiver Compact Row */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">From</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{senderName}</p>
              <p className="text-[10px] text-slate-500">{senderAccount}</p>
            </div>
            <div className="mx-2 text-emerald-500">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">To</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{receiverName}</p>
              <p className="text-[10px] text-slate-500">{receiverAccount}</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-1">{receiverBank}</p>
        </div>

        {/* Details */}
        <div className="px-4 py-3 space-y-2">
          {receiptDetails.map((detail, index) => (
            <motion.div
              key={detail.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <detail.icon className="w-3.5 h-3.5" />
                <span className="text-xs">{detail.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-900 text-right">{detail.value}</span>
                {detail.copyable && (
                  <button
                    onClick={() => copyToClipboard(detail.value)}
                    className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                    title="Copy"
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between py-1 pt-2 border-t border-slate-100"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs">Status</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              Completed
            </span>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all text-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-0 right-0 mb-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-10"
                >
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share via...
                  </button>
                  <button
                    onClick={() => {
                      copyToClipboard(`Transfer of $${parseFloat(usdAmount).toLocaleString()} USD to ${receiverName} (${targetCurrencyCode}) - TXN: ${transactionId}`)
                      setShowShareMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Details
                  </button>
                </motion.div>
              )}
            </div>
          </div>
          
          <button
            onClick={onNewTransfer}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all text-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            New Transfer
          </button>
        </div>
      </div>

      {/* Security Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-[10px] text-slate-400 mt-3 px-4"
      >
        This receipt was generated securely by CREDIXA. Keep it for your records.
      </motion.p>
    </motion.div>
  )
}

export default TransferReceipt
