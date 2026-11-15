import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowRight, CheckCircle2, KeyRound, ShieldCheck, Globe, RefreshCcw, XCircle, Sparkles } from 'lucide-react'

const defaultPermissions = ['read:payments', 'write:payment_intents', 'read:webhooks']

const APISettings = () => {
  const [apps, setApps] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: 'TRX LUXUARY Commerce',
    description: 'Official shopping platform integration for retrieving authorized merchant payment details, creating payment intents, verifying relevant internal transfers and receiving verified payment events.',
    environment: 'sandbox',
    status: 'enabled',
    permissions: defaultPermissions,
    webhookUrl: 'https://example.com/webhooks/credixa',
    collectionAccountId: ''
  })
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadApps()
    loadMerchantAccounts()
  }, [])

  const loadApps = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/developer/apps')
      setApps(response.data.apps || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load developer apps.')
    } finally {
      setLoading(false)
    }
  }

  const loadMerchantAccounts = async () => {
    try {
      const response = await axios.get('/api/developer/merchant-accounts')
      setAccounts(response.data.accounts || [])
    } catch (err) {
      console.error('Unable to load merchant accounts', err)
    }
  }

  const handlePermissionToggle = (value) => {
    setForm((previous) => {
      const exists = previous.permissions.includes(value)
      return {
        ...previous,
        permissions: exists
          ? previous.permissions.filter((permission) => permission !== value)
          : [...previous.permissions, value]
      }
    })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await axios.post('/api/developer/apps', form)
      setSecret(response.data.secret || '')
      setMessage(response.data.message || 'Application created successfully.')
      setForm({
        name: 'TRX LUXUARY Commerce',
        description: 'Official shopping platform integration for retrieving authorized merchant payment details, creating payment intents, verifying relevant internal transfers and receiving verified payment events.',
        environment: 'sandbox',
        status: 'enabled',
        permissions: defaultPermissions,
        webhookUrl: 'https://example.com/webhooks/credixa',
        collectionAccountId: ''
      })
      loadApps()
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create app.')
    }
  }

  const activeAppCount = apps.filter((app) => app.status === 'enabled').length

  return (
    <div className="min-h-screen bg-[#0a0e1a] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 p-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Developer portal</p>
              <h1 className="text-3xl font-bold">API & Developer Settings</h1>
            </div>
          </div>
          <p className="max-w-3xl text-sm text-slate-300">
            Configure secure backend integrations, manage credentials, webhook delivery and merchant payment collections for partner applications.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <p className="text-sm text-slate-400">Applications</p>
            <p className="mt-2 text-3xl font-bold">{apps.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <p className="text-sm text-slate-400">Enabled</p>
            <p className="mt-2 text-3xl font-bold">{activeAppCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <p className="text-sm text-slate-400">Environment</p>
            <p className="mt-2 text-3xl font-bold">Sandbox</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <h2 className="text-xl font-semibold">Create an integration</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Application name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500"
                  placeholder="TRX LUXUARY Commerce"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Environment</label>
                  <select
                    name="environment"
                    value={form.environment}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                  >
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Merchant collection account</label>
                <select
                  name="collectionAccountId"
                  value={form.collectionAccountId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                >
                  <option value="">Select an eligible Credixa account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.fullName} • {account.accountNumber} • {account.currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Webhook endpoint</label>
                <input
                  name="webhookUrl"
                  value={form.webhookUrl}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  placeholder="https://example.com/webhooks/credixa"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Allowed permissions</label>
                <div className="grid gap-2 md:grid-cols-2">
                  {['read:payments', 'write:payment_intents', 'read:webhooks', 'read:merchant_accounts'].map((permission) => (
                    <label key={permission} className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                        className="h-4 w-4 accent-violet-500"
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5"
              >
                Create app <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {secret && (
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Secret created</span>
                </div>
                <p className="break-all text-sm text-slate-200">{secret}</p>
                <p className="mt-2 text-xs text-emerald-200">Store this value in your backend only. It is shown once for security.</p>
              </div>
            )}

            {message && !secret && (
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                <XCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-semibold">Existing apps</h2>
            </div>

            {loading ? (
              <p className="text-sm text-slate-300">Loading integrations...</p>
            ) : apps.length === 0 ? (
              <p className="text-sm text-slate-300">No applications yet. Create your first integration above.</p>
            ) : (
              <div className="space-y-4">
                {apps.map((app) => (
                  <div key={app._id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{app.name}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs ${app.status === 'enabled' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{app.description || 'No description provided.'}</p>
                    <div className="mt-3 space-y-1 text-xs text-slate-400">
                      <p>Environment: {app.environment}</p>
                      <p>Webhook: {app.webhookUrl || 'Not configured'}</p>
                      <p>Permissions: {app.permissions.join(', ') || 'None'}</p>
                    </div>
                    <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-xs text-violet-200">
                      API key: <span className="break-all">{app.apiKey}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default APISettings
