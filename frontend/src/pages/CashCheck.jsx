import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, FileImage, ShieldCheck, Upload, X } from 'lucide-react'
import axios from 'axios'

const CashCheck = () => {
  const navigate = useNavigate()
  const [checkId, setCheckId] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [details, setDetails] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const selectImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('Choose a JPG, PNG, or WEBP image under 8MB')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  const verifyCheck = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await axios.post('/api/checks/verify', { checkId: checkId.trim() })
      setDetails(response.data.check)
    } catch (err) {
      setDetails(null)
      setError(err.response?.data?.error || 'Unable to verify this Credixa check')
    } finally {
      setBusy(false)
    }
  }

  const depositCheck = async () => {
    setBusy(true)
    setError('')
    try {
      await axios.post(`/api/checks/${encodeURIComponent(details.checkId)}/deposit`)
      setMessage('Check deposited successfully. Your balance and history have been updated.')
      setDetails({ ...details, status: 'deposited' })
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to deposit this check')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4"><button onClick={() => navigate('/dashboard')} className="mr-3 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Back to dashboard"><ArrowLeft size={20} /></button><h1 className="text-lg font-bold">Cash Check</h1></div>
      </header>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-900 dark:bg-teal-950/40"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-teal-600" /><div><h2 className="font-semibold">Internal Credixa check</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">This closed-loop digital check can only be deposited to its intended Credixa account. It is not negotiable and is not valid at external banks.</p></div></div></section>
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800"><form onSubmit={verifyCheck} className="space-y-5"><label className="block text-sm font-medium">Credixa check ID<input required value={checkId} onChange={(e) => setCheckId(e.target.value)} placeholder="CC-..." className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-600" /></label><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-5 text-sm hover:border-teal-500 dark:border-gray-600"><Upload size={18} />{image ? image.name : 'Upload check image for review'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} className="sr-only" /></label>{preview && <div className="relative"><img src={preview} alt="Uploaded check preview" className="max-h-64 w-full rounded-xl object-contain" /><button type="button" onClick={() => { setImage(null); setPreview(null) }} className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white" aria-label="Remove image"><X size={16} /></button></div>}<button disabled={busy || !checkId.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Verifying...' : <><FileImage size={18} /> Verify check</>}</button></form></section>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
        {message && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-200">{message}</p>}
        {details && <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800"><div className="mb-4 flex items-center gap-2"><CheckCircle className="text-green-600" size={20} /><h2 className="font-semibold">Verified check details</h2></div><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-gray-500">Recipient</dt><dd>{details.recipientName}</dd></div><div className="flex justify-between gap-4"><dt className="text-gray-500">Amount</dt><dd className="font-semibold">{details.currency} {details.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</dd></div><div className="flex justify-between gap-4"><dt className="text-gray-500">Memo</dt><dd>{details.memo || 'None'}</dd></div></dl>{details.status !== 'deposited' && <button onClick={depositCheck} disabled={busy} className="mt-6 w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Depositing...' : 'Confirm deposit'}</button>}</section>}
      </div>
    </main>
  )
}

export default CashCheck
