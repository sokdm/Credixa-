import { motion } from 'framer-motion'
import { CheckCircle, Users, Building2, Search, UserCheck } from 'lucide-react'

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
        <p className="text-white/50 text-sm">Send to other banks</p>
      </button>
    </div>
  </motion.div>
)

export const Step2Details = ({ 
  transferType, formData, setFormData, foundUser, searching, 
  selectFoundUser, goToPin, setStep, error 
}) => (
  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <h2 className="text-2xl font-bold mb-2">
      {transferType === 'internal' ? 'Internal Transfer' : 'External Transfer'}
    </h2>
    <p className="text-white/50 text-sm mb-6">Enter recipient details</p>

    {error && (
      <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm">
        {error}
      </div>
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
              onChange={(e) => setFormData({...formData, recipientAccount: e.target.value})}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
              placeholder="Enter account number" 
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {foundUser && (
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

          {formData.recipientAccount && !foundUser && !searching && formData.recipientAccount.length >= 5 && (
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
              placeholder="Enter account holder name" 
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-white/70">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">$</span>
          <input 
            type="number" 
            required 
            min="1" 
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
            placeholder="0.00" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white/70">Narration (Optional)</label>
        <input 
          type="text" 
          value={formData.narration}
          onChange={(e) => setFormData({...formData, narration: e.target.value})}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
          placeholder="What's this for?" 
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={() => setStep(1)}
          className="flex-1 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5"
        >
          Back
        </button>
        <button 
          type="submit"
          className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold"
        >
          Continue to PIN
        </button>
      </div>
    </form>
  </motion.div>
)

export const Step3PIN = ({ 
  transferType, formData, setFormData, handleSubmit, 
  setStep, loading, error 
}) => (
  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <h2 className="text-2xl font-bold mb-2">Enter PIN</h2>
    <p className="text-white/50 text-sm mb-6">Confirm transfer with your 4-digit PIN</p>

    {error && (
      <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm">
        {error}
      </div>
    )}

    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 lg:p-8 mb-6">
      <div className="space-y-3 mb-6">
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-white/50 text-sm">Amount</span>
          <span className="font-bold">${formData.amount}</span>
        </div>
        {transferType === 'internal' ? (
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-white/50 text-sm">To</span>
            <span className="text-sm">{formData.recipientAccount}</span>
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
            className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-[1em] focus:outline-none focus:border-violet-500"
            placeholder="••••" 
          />
        </div>

        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => setStep(2)}
            className="flex-1 py-4 border-2 border-white/20 rounded-xl font-semibold hover:bg-white/5"
          >
            Back
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Transfer'}
          </button>
        </div>
      </form>
    </div>
  </motion.div>
)
