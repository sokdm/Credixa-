import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, QrCode, Camera, Upload, ScanLine, CheckCircle, X } from 'lucide-react'
import axios from 'axios'

const QrPay = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState('scan')
  const [amount, setAmount] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScannedData({
        merchant: 'Starbucks Coffee',
        account: '302093740999',
        bank: 'Credixa Bank'
      })
      setStep('confirm')
    }, 2000)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setScanning(true)
      setTimeout(() => {
        setScanning(false)
        setScannedData({
          merchant: 'Uploaded Merchant',
          account: '302093740888',
          bank: 'Credixa Bank'
        })
        setStep('confirm')
      }, 1500)
    }
  }

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) return
    setLoading(true)
    try {
      await axios.post('/api/transfer/qr', {
        toAccount: scannedData.account,
        amount: Number(amount),
        description: `QR Payment to ${scannedData.merchant}`
      })
      setStep('success')
    } catch (error) {
      alert(error.response?.data?.error || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg">QR Pay</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {step === 'scan' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-violet-500/20 rounded-2xl flex items-center justify-center">
                <QrCode size={40} className="text-violet-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Scan QR Code</h2>
              <p className="text-gray-400 text-sm">Point your camera at a QR code to pay</p>
            </div>

            <div className="relative aspect-square bg-gray-800 rounded-3xl border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
              {scanning ? (
                <div className="text-center">
                  <ScanLine size={48} className="text-violet-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-gray-400">Scanning...</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  <Camera size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm mb-4">Camera preview would appear here</p>
                  <button
                    onClick={handleScan}
                    className="px-6 py-3 bg-violet-600 rounded-xl font-medium hover:bg-violet-700 transition-colors"
                  >
                    Simulate Scan
                  </button>
                </div>
              )}
              <div className="absolute inset-0 border-2 border-violet-500/30 rounded-3xl pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-violet-500 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-violet-500 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-violet-500 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-violet-500 rounded-br-lg" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors"
              >
                <Upload size={20} />
                <span>Upload QR Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </motion.div>
        )}

        {step === 'confirm' && scannedData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-semibold mb-4 text-gray-400 text-sm uppercase tracking-wider">Merchant Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="font-medium">{scannedData.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account</span>
                  <span className="font-mono">{scannedData.account}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bank</span>
                  <span>{scannedData.bank}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <label className="block text-sm text-gray-400 mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white text-2xl font-bold focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={!amount || loading}
              className="w-full py-4 bg-violet-600 rounded-xl font-bold text-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>

            <button
              onClick={() => setStep('scan')}
              className="w-full py-3 bg-gray-800 rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-2">${amount} paid to {scannedData.merchant}</p>
            <p className="text-sm text-gray-500 mb-8">Transaction ID: TXN{Date.now()}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/history')}
                className="w-full py-3 bg-gray-800 rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                View Receipt
              </button>
              <button
                onClick={() => {
                  setStep('scan')
                  setAmount('')
                  setScannedData(null)
                }}
                className="w-full py-3 bg-violet-600 rounded-xl font-medium hover:bg-violet-700 transition-colors"
              >
                Scan Another
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default QrPay
