import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Activity, ArrowDownToLine, BookOpen, ChevronRight, Copy, ExternalLink,
  FileCode2, KeyRound, LifeBuoy, Loader2, LockKeyhole, Plus, RefreshCw,
  ShieldCheck, TestTube2, Webhook, X
} from 'lucide-react';
import './APISettings.css';

const API_BASE = '/api/developer';
const SCOPE_OPTIONS = [
  { value: 'read:payments', label: 'Read payments', detail: 'View payment intent and transaction status.' },
  { value: 'write:payment_intents', label: 'Create payment intents', detail: 'Create pending collection requests.' },
  { value: 'write:payment_verification', label: 'Verify payments', detail: 'Match completed Credixa ledger transfers.' },
  { value: 'read:webhooks', label: 'Read webhooks', detail: 'View delivery status and retry failed deliveries.' },
  { value: 'read:merchant_accounts', label: 'Read collection account', detail: 'View the selected owner account.' },
  { value: 'write:sandbox', label: 'Simulate sandbox payments', detail: 'Test outcomes without moving money.' }
];
const EMPTY_FORM = {
  name: '', description: '', environment: 'sandbox', status: 'enabled',
  permissions: ['read:payments', 'write:payment_intents', 'read:merchant_accounts', 'write:sandbox'],
  collectionAccountId: '', webhookUrl: ''
};
const SECTIONS = [
  ['overview', 'Overview', Activity],
  ['applications', 'Applications', KeyRound],
  ['accounts', 'Collection accounts', ShieldCheck],
  ['webhooks', 'Webhooks', Webhook],
  ['sandbox', 'Sandbox', TestTube2],
  ['api-logs', 'API & audit logs', FileCode2],
  ['documentation', 'Documentation', BookOpen]
];

const errorText = (error, fallback) => error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;
const pretty = (value) => JSON.stringify(value, null, 2);

export default function APISettings() {
  const [section, setSection] = useState('overview');
  const [apps, setApps] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [requestLogs, setRequestLogs] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [oneTimeCredential, setOneTimeCredential] = useState(null);
  const [editing, setEditing] = useState(null);
  const [sandboxAppId, setSandboxAppId] = useState('');
  const [sandboxSecret, setSandboxSecret] = useState('');
  const [sandboxAmount, setSandboxAmount] = useState('10.00');
  const [sandboxCurrency, setSandboxCurrency] = useState('USD');
  const [sandboxIntent, setSandboxIntent] = useState('');
  const [sandboxResult, setSandboxResult] = useState(null);

  const selectedApp = useMemo(() => apps.find((app) => app._id === selectedAppId) || apps[0], [apps, selectedAppId]);
  const eligibleAccounts = useMemo(() => accounts.filter((account) => account.eligible), [accounts]);
  const sandboxApps = useMemo(() => apps.filter((app) => app.environment === 'sandbox' && app.status === 'enabled'), [apps]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [appsResponse, accountsResponse, webhooksResponse, auditResponse] = await Promise.all([
        axios.get(`${API_BASE}/apps`),
        axios.get(`${API_BASE}/merchant-accounts`),
        axios.get(`${API_BASE}/webhooks`),
        axios.get(`${API_BASE}/audit-logs`)
      ]);
      const loadedApps = appsResponse.data.apps || [];
      setApps(loadedApps);
      setAccounts(accountsResponse.data.accounts || []);
      setWebhookLogs(webhooksResponse.data.deliveries || []);
      setAuditLogs(auditResponse.data.logs || []);
      setSelectedAppId((previous) => loadedApps.some((app) => app._id === previous) ? previous : loadedApps[0]?._id || '');
      if (!sandboxAppId || !loadedApps.some((app) => app._id === sandboxAppId && app.environment === 'sandbox')) {
        setSandboxAppId(loadedApps.find((app) => app.environment === 'sandbox' && app.status === 'enabled')?._id || '');
      }
      const eligible = accountsResponse.data.accounts?.find((account) => account.eligible);
      setForm((previous) => previous.collectionAccountId || !eligible ? previous : { ...previous, collectionAccountId: eligible._id });
    } catch (requestError) {
      setError(errorText(requestError, 'Unable to load developer settings.'));
    } finally {
      setLoading(false);
    }
  }, [sandboxAppId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (section !== 'api-logs' || !selectedApp?._id) return;
    let active = true;
    axios.get(`${API_BASE}/apps/${selectedApp._id}/request-logs`)
      .then((response) => { if (active) setRequestLogs(response.data.logs || []); })
      .catch((requestError) => { if (active) setError(errorText(requestError, 'Unable to load request logs.')); });
    return () => { active = false; };
  }, [section, selectedApp?._id]);

  const notify = (message) => { setNotice(message); setError(''); };
  const fail = (message) => { setError(message); setNotice(''); };
  const copyText = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      notify(`${label} copied.`);
    } catch {
      fail('Clipboard access is unavailable in this browser.');
    }
  };

  const toggleScope = (scope, permissions, setPermissions) => setPermissions(
    permissions.includes(scope) ? permissions.filter((item) => item !== scope) : [...permissions, scope]
  );

  const createApplication = async (event) => {
    event.preventDefault();
    setBusy('create');
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/apps`, form);
      const application = response.data.app;
      setOneTimeCredential({
        applicationName: application.name,
        apiKey: response.data.apiKey,
        apiSecret: response.data.secret,
        webhookSecret: response.data.webhookSecret
      });
      setSelectedAppId(application._id);
      if (application.environment === 'sandbox') {
        setSandboxAppId(application._id);
        setSandboxSecret(response.data.secret);
      }
      setShowCreate(false);
      setForm({ ...EMPTY_FORM, collectionAccountId: eligibleAccounts[0]?._id || '' });
      await loadData();
      notify('Application created. Copy the secrets now; they will not be shown again.');
    } catch (requestError) {
      fail(errorText(requestError, 'Unable to create application.'));
    } finally {
      setBusy('');
    }
  };

  const rotateCredential = async (application, webhook = false) => {
    setBusy(`${webhook ? 'webhook' : 'credential'}-${application._id}`);
    try {
      const response = await axios.post(`${API_BASE}/apps/${application._id}/${webhook ? 'webhook-secret/rotate' : 'regenerate'}`);
      setOneTimeCredential({
        applicationName: application.name,
        apiKey: response.data.apiKey || application.apiKey,
        apiSecret: response.data.secret,
        webhookSecret: response.data.webhookSecret
      });
      if (!webhook && application.environment === 'sandbox') {
        setSandboxAppId(application._id);
        setSandboxSecret(response.data.secret);
      }
      notify('New secret generated. Copy it now; it cannot be retrieved later.');
      await loadData();
    } catch (requestError) {
      fail(errorText(requestError, 'Unable to rotate the secret.'));
    } finally {
      setBusy('');
    }
  };

  const revokeApplication = async (application) => {
    if (!window.confirm(`Revoke ${application.name}? This immediately invalidates its API credentials.`)) return;
    setBusy(`revoke-${application._id}`);
    try {
      await axios.post(`${API_BASE}/apps/${application._id}/revoke`);
      notify(`${application.name} revoked.`);
      await loadData();
    } catch (requestError) {
      fail(errorText(requestError, 'Unable to revoke application.'));
    } finally {
      setBusy('');
    }
  };

  const updateApplication = async (application, changes) => {
    setBusy(`update-${application._id}`);
    try {
      await axios.put(`${API_BASE}/apps/${application._id}`, changes);
      setEditing(null);
      notify('Application settings saved.');
      await loadData();
    } catch (requestError) {
      fail(errorText(requestError, 'Unable to update application.'));
    } finally {
      setBusy('');
    }
  };

  const sendWebhookTest = async (application) => {
    setBusy(`webhook-test-${application._id}`);
    try {
      await axios.post(`${API_BASE}/apps/${application._id}/webhooks/test`);
      notify('Test webhook queued.');
      const response = await axios.get(`${API_BASE}/webhooks`);
      setWebhookLogs(response.data.deliveries || []);
    } catch (requestError) {
      fail(errorText(requestError, 'Unable to queue webhook test.'));
    } finally {
      setBusy('');
    }
  };

  const retryWebhook = async (delivery) => {
    setBusy(`retry-${delivery._id}`);
    try {
      await axios.post(`${API_BASE}/apps/${delivery.applicationId}/webhooks/${delivery._id}/retry`);
      notify('Webhook retry queued.');
      const response = await axios.get(`${API_BASE}/webhooks`);
      setWebhookLogs(response.data.deliveries || []);
    } catch (requestError) {
      fail(errorText(requestError, 'Unable to retry webhook.'));
    } finally {
      setBusy('');
    }
  };

  const downloadDocument = async (file, label = file) => {
    setBusy(`download-${file}`);
    try {
      const response = await axios.get(`${API_BASE}/docs/${file}`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = label;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify(`${label} downloaded.`);
    } catch (requestError) {
      fail(errorText(requestError, 'Unable to download documentation.'));
    } finally {
      setBusy('');
    }
  };

  const signedSandboxRequest = async (method, endpoint, payload, extraHeaders = {}) => {
    const app = apps.find((item) => item._id === sandboxAppId);
    if (!app || app.environment !== 'sandbox' || app.status !== 'enabled') throw new Error('Choose an enabled sandbox application.');
    if (!sandboxSecret.trim()) throw new Error('Enter the one-time sandbox API secret.');
    const timestamp = String(Date.now());
    const rawBody = payload === undefined ? '' : JSON.stringify(payload);
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(sandboxSecret.trim()));
    const key = await crypto.subtle.importKey('raw', digest, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`));
    const signature = Array.from(new Uint8Array(signatureBytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
    const response = await axios({
      method,
      url: `/api/merchant${endpoint}`,
      data: payload === undefined ? undefined : rawBody,
      headers: {
        'X-API-Key': app.apiKey,
        'X-Request-Timestamp': timestamp,
        'X-Signature': signature,
        ...extraHeaders,
        ...(payload === undefined ? {} : { 'Content-Type': 'application/json' })
      }
    });
    return response.data;
  };

  const runSandbox = async (operation, action) => {
    setBusy(`sandbox-${operation}`);
    setError('');
    try {
      const result = await action();
      setSandboxResult(result);
      notify('Sandbox request completed. No funds were moved.');
      return result;
    } catch (requestError) {
      const message = errorText(requestError, 'Sandbox request failed.');
      setSandboxResult(requestError.response?.data || { error: message });
      fail(message);
      return null;
    } finally {
      setBusy('');
    }
  };

  const createSandboxIntent = () => runSandbox('create', async () => {
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `sandbox-${Date.now()}`;
    const result = await signedSandboxRequest('post', '/payment-intent', {
      amount: Number(sandboxAmount), currency: sandboxCurrency.toUpperCase()
    }, { 'Idempotency-Key': idempotencyKey });
    const intent = result.paymentIntent || result.intent || result;
    if (intent.reference) setSandboxIntent(intent.reference);
    return result;
  });
  const getSandboxStatus = () => runSandbox('status', () => signedSandboxRequest('get', `/payment-intent/${encodeURIComponent(sandboxIntent)}`));
  const simulateSandbox = (outcome) => runSandbox(`simulate-${outcome}`, () => signedSandboxRequest(
    'post', `/payment-intent/${encodeURIComponent(sandboxIntent)}/simulate`, { outcome }
  ));

  const renderApplicationForm = (application, isEditing = false) => {
    const edit = isEditing ? editing : null;
    const values = edit || form;
    const setValues = isEditing
      ? (next) => setEditing((previous) => ({ ...previous, ...next }))
      : (next) => setForm((previous) => ({ ...previous, ...next }));
    return (
      <form className="dev-form" onSubmit={(event) => {
        event.preventDefault();
        if (isEditing) updateApplication(application, edit);
        else createApplication(event);
      }}>
        {!isEditing && <div className="dev-form-grid">
          <label>Application name<input required maxLength={80} value={values.name} onChange={(event) => setValues({ name: event.target.value })} placeholder="My store" /></label>
          <label>Environment<select value={values.environment} onChange={(event) => {
            if (isEditing) return;
            const environment = event.target.value;
            setForm((previous) => ({
              ...previous,
              environment,
              permissions: environment === 'production' ? previous.permissions.filter((item) => item !== 'write:sandbox') : previous.permissions
            }));
          }}><option value="sandbox">Sandbox — testing only</option><option value="production">Production — live internal transfers</option></select></label>
        </div>}
        {isEditing && <div className="dev-form-grid">
          <label>Application name<input required minLength={2} maxLength={80} value={values.name || ''} onChange={(event) => setValues({ name: event.target.value })} /></label>
          <label>Description <span className="dev-muted">(optional)</span><textarea rows="2" maxLength={500} value={values.description || ''} onChange={(event) => setValues({ description: event.target.value })} /></label>
        </div>}
        {!isEditing && <label>Description <span className="dev-muted">(optional)</span><textarea rows="2" maxLength={500} value={values.description} onChange={(event) => setValues({ description: event.target.value })} placeholder="What this integration does" /></label>}
        <label>Credixa collection account
          <select required value={values.collectionAccountId || ''} onChange={(event) => setValues({ collectionAccountId: event.target.value })}>
            <option value="">Select an eligible account</option>
            {accounts.map((account) => <option key={account._id} value={account._id} disabled={!account.eligible}>
              {account.accountNumber || account.fullName || account._id} · {account.currency || account.currencyCode} · {account.eligible ? 'Eligible' : account.ineligibilityReason || 'Not eligible'}
            </option>)}
          </select>
        </label>
        <label>Webhook URL <span className="dev-muted">(HTTPS required; optional)</span>
          <input type="url" value={values.webhookUrl || ''} onChange={(event) => setValues({ webhookUrl: event.target.value })} placeholder="https://your-site.example/webhooks/credixa" />
        </label>
        <fieldset className="dev-scope-list"><legend>Permissions</legend>
          {SCOPE_OPTIONS.filter((scope) => {
            const environment = isEditing ? application.environment : values.environment;
            return !(environment === 'production' && scope.value === 'write:sandbox') &&
              !(environment === 'sandbox' && scope.value === 'write:payment_verification');
          }).map((scope) => (
            <label className="dev-scope" key={scope.value}>
              <input type="checkbox" checked={(values.permissions || []).includes(scope.value)} onChange={() => toggleScope(
                scope.value, values.permissions || [], (permissions) => setValues({ permissions })
              )} />
              <span><strong>{scope.label}</strong><small>{scope.detail}</small></span>
            </label>
          ))}
        </fieldset>
        <div className="dev-form-actions">
          <button type="submit" className="dev-primary" disabled={busy === 'create' || (isEditing && !values.collectionAccountId)}>
            {busy === 'create' ? <Loader2 className="dev-spin" size={16} /> : null}
            {isEditing ? 'Save settings' : 'Create application'}
          </button>
          {isEditing && <button type="button" className="dev-button" onClick={() => setEditing(null)}>Cancel</button>}
        </div>
      </form>
    );
  };

  const CredentialPanel = () => oneTimeCredential ? (
    <div className="dev-secret-panel">
      <div className="dev-secret-heading"><LockKeyhole size={20} /><div><strong>Save these credentials now</strong><p>Shown once for {oneTimeCredential.applicationName}. This display clears when dismissed or when you leave the page.</p></div><button className="dev-icon-button" aria-label="Dismiss credentials" onClick={() => setOneTimeCredential(null)}><X size={18} /></button></div>
      {[['API key', oneTimeCredential.apiKey], ['API secret', oneTimeCredential.apiSecret], ['Webhook signing secret', oneTimeCredential.webhookSecret]].filter((entry) => entry[1]).map(([label, value]) => (
        <div className="dev-secret-row" key={label}><label>{label}</label><code>{value}</code><button className="dev-button dev-small" onClick={() => copyText(value, label)}><Copy size={14} />Copy</button></div>
      ))}
    </div>
  ) : null;

  const renderAppCard = (application) => {
    const editingThis = editing?._id === application._id;
    return (
      <article className="dev-app-card" key={application._id}>
        <div className="dev-app-header">
          <div className="dev-app-icon"><KeyRound size={20} /></div>
          <div className="dev-app-title"><h3>{application.name}</h3><span>{application.description || 'No description'}</span></div>
          <span className={`dev-pill ${application.environment === 'production' ? 'dev-pill-live' : 'dev-pill-test'}`}>{application.environment}</span>
          <span className={`dev-pill ${application.status === 'enabled' ? 'dev-pill-active' : 'dev-pill-off'}`}>{application.status}</span>
        </div>
        <div className="dev-app-credentials">
          <div><small>API key</small><code>{application.apiKey}</code></div>
          <div><small>API secret</small><code>••••••••{application.apiSecretLast4 || '••••'}</code></div>
          <button className="dev-button dev-small" onClick={() => copyText(application.apiKey, 'API key')}><Copy size={14} />Copy key</button>
        </div>
        <div className="dev-app-meta"><span>Collection account: <strong>{application.collectionAccountNumber || application.collectionAccountId || 'Not selected'}</strong></span><span>{application.permissions?.length || 0} permissions</span></div>
        {editingThis ? renderApplicationForm(application, true) : <div className="dev-app-actions">
          <button className="dev-button dev-small" onClick={() => setEditing({
            _id: application._id, name: application.name, description: application.description || '', environment: application.environment,
            permissions: application.permissions || [], collectionAccountId: application.collectionAccountId || '',
            webhookUrl: application.webhookUrl || ''
          })}>Edit settings</button>
          <button className="dev-button dev-small" disabled={busy === `credential-${application._id}`} onClick={() => rotateCredential(application)}><RefreshCw size={14} />Rotate API secret</button>
          <button className="dev-button dev-small" disabled={busy === `webhook-${application._id}`} onClick={() => rotateCredential(application, true)}><Webhook size={14} />Rotate webhook secret</button>
          {!application.revokedAt && <button className="dev-button dev-small" onClick={() => updateApplication(application, { status: application.status === 'enabled' ? 'disabled' : 'enabled' })}>{application.status === 'enabled' ? 'Disable' : 'Enable'}</button>}
          {application.revokedAt && <span className="dev-muted">Revoked · rotate credentials to re-enable</span>}
          <button className="dev-danger-button dev-small" disabled={busy === `revoke-${application._id}`} onClick={() => revokeApplication(application)}>Revoke</button>
        </div>}
      </article>
    );
  };

  return (
    <main className="dev-portal">
      <header className="dev-page-heading">
        <div><div className="dev-eyebrow"><span className="dev-eyebrow-dot" />CREDIXA DEVELOPERS</div><h1>Developer platform</h1><p>Manage your API credentials, collection account, webhooks, and integration tests.</p></div>
        <button className="dev-primary" onClick={() => { setShowCreate(true); setSection('applications'); }}><Plus size={17} />Create application</button>
      </header>
      {(error || notice) && <div className={`dev-alert ${error ? 'dev-alert-error' : 'dev-alert-success'}`} role="status">{error || notice}</div>}
      <CredentialPanel />
      <div className="dev-layout">
        <nav className="dev-nav" aria-label="Developer settings">
          {SECTIONS.map(([id, label, Icon]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}><Icon size={17} /><span>{label}</span><ChevronRight size={15} /></button>)}
          <div className="dev-nav-note"><ShieldCheck size={17} /><p>Production collection confirms only completed transfers in the Credixa ledger. No external settlement is represented as complete.</p></div>
        </nav>
        <section className="dev-content">
          {loading ? <div className="dev-loading"><Loader2 className="dev-spin" size={22} />Loading developer settings…</div> : <>
            {section === 'overview' && <div className="dev-section">
              <div className="dev-section-heading"><div><h2>Integration overview</h2><p>Your credentials, webhook health, and environment at a glance.</p></div><button className="dev-button dev-small" onClick={loadData}><RefreshCw size={14} />Refresh</button></div>
              <div className="dev-stat-grid">
                <div className="dev-stat"><span>Applications</span><strong>{apps.length}</strong><small>{apps.filter((app) => app.status === 'enabled').length} enabled</small></div>
                <div className="dev-stat"><span>Sandbox apps</span><strong>{apps.filter((app) => app.environment === 'sandbox').length}</strong><small>Test without moving funds</small></div>
                <div className="dev-stat"><span>Webhook deliveries</span><strong>{webhookLogs.length}</strong><small>{webhookLogs.filter((log) => log.status === 'failed').length} failed or pending retry</small></div>
                <div className="dev-stat"><span>Eligible collection accounts</span><strong>{eligibleAccounts.length}</strong><small>Owner's unlocked accounts</small></div>
              </div>
              <div className="dev-feature-grid">
                <button className="dev-feature-card" onClick={() => setSection('applications')}><KeyRound /><span><strong>Application credentials</strong><small>Separate sandbox and production credentials, with scoped permissions.</small></span><ChevronRight /></button>
                <button className="dev-feature-card" onClick={() => setSection('webhooks')}><Webhook /><span><strong>Signed webhooks</strong><small>Inspect delivery attempts and retry eligible failures.</small></span><ChevronRight /></button>
                <button className="dev-feature-card" onClick={() => setSection('sandbox')}><TestTube2 /><span><strong>Sandbox testing</strong><small>Simulate test outcomes without ledger or balance changes.</small></span><ChevronRight /></button>
                <button className="dev-feature-card" onClick={() => setSection('documentation')}><BookOpen /><span><strong>API documentation</strong><small>Download versioned API docs, OpenAPI, and integration examples.</small></span><ChevronRight /></button>
              </div>
              <h3 className="dev-subheading">Recent applications</h3>
              {apps.length ? <div className="dev-app-list">{apps.slice(0, 3).map(renderAppCard)}</div> : <div className="dev-empty"><KeyRound /><strong>No applications yet</strong><p>Create a sandbox app to start safely.</p><button className="dev-primary" onClick={() => { setShowCreate(true); setSection('applications'); }}><Plus size={16} />Create application</button></div>}
            </div>}

            {section === 'applications' && <div className="dev-section">
              <div className="dev-section-heading"><div><h2>Applications & credentials</h2><p>Use least-privilege scopes. API secrets are displayed only when first issued or rotated.</p></div><button className="dev-primary" onClick={() => setShowCreate((value) => !value)}><Plus size={16} />New application</button></div>
              {showCreate && <div className="dev-panel"><div className="dev-panel-title"><div><h3>Register an application</h3><p>Start in sandbox. Production is limited to real, completed Credixa ledger transfers.</p></div><button className="dev-icon-button" onClick={() => setShowCreate(false)} aria-label="Close"><X size={18} /></button></div>
                {eligibleAccounts.length === 0 && <div className="dev-inline-warning">No eligible collection account is available. An active, unlocked account owned by you is required. Other users' accounts cannot be selected.</div>}
                {renderApplicationForm(null)}
              </div>}
              <div className="dev-app-list">{apps.length ? apps.map(renderAppCard) : <div className="dev-empty"><KeyRound /><strong>No registered applications</strong><p>Create an application to get started.</p></div>}</div>
            </div>}

            {section === 'accounts' && <div className="dev-section">
              <div className="dev-section-heading"><div><h2>Collection accounts</h2><p>Only your own active, unlocked accounts may be selected by an application.</p></div></div>
              {accounts.length ? <div className="dev-account-list">{accounts.map((account) => <article className="dev-account-card" key={account._id}>
                <div className="dev-account-icon"><ShieldCheck /></div><div className="dev-account-info"><strong>{account.fullName || account.accountNumber || 'Credixa account'}</strong><span>{account.accountNumber || account._id}</span><small>{account.currency || account.currencyCode} · {account.accountType || 'Personal account'}</small></div>
                <span className={`dev-pill ${account.eligible ? 'dev-pill-active' : 'dev-pill-off'}`}>{account.eligible ? 'Eligible' : account.ineligibilityReason || 'Unavailable'}</span>
              </article>)}</div> : <div className="dev-empty"><ShieldCheck /><strong>No collection accounts found</strong><p>Account information is unavailable right now.</p></div>}
              <div className="dev-callout"><LockKeyhole size={18} /><p>For safety, this portal does not expose or allow selecting another user's account. A separate merchant business-account product is not currently supported.</p></div>
            </div>}

            {section === 'webhooks' && <div className="dev-section">
              <div className="dev-section-heading"><div><h2>Webhook deliveries</h2><p>Each event is signed with its own webhook secret. Delivery requires a public HTTPS endpoint.</p></div><button className="dev-button dev-small" onClick={async () => { await loadData(); }}><RefreshCw size={14} />Refresh</button></div>
              <div className="dev-webhook-apps">{apps.map((app) => <div className="dev-webhook-app" key={app._id}><div><strong>{app.name}</strong><small>{app.webhookUrl || 'No webhook URL configured'}</small></div><button className="dev-button dev-small" disabled={!app.webhookUrl || app.status !== 'enabled' || busy === `webhook-test-${app._id}`} onClick={() => sendWebhookTest(app)}><Webhook size={14} />Send test</button></div>)}</div>
              {webhookLogs.length ? <div className="dev-table-wrap"><table className="dev-table"><thead><tr><th>Event</th><th>Application</th><th>Status</th><th>Attempts</th><th>Updated</th><th /></tr></thead><tbody>
                {webhookLogs.map((delivery) => <tr key={delivery._id}><td><strong>{delivery.eventType}</strong><small>{delivery.eventId}</small></td><td>{apps.find((app) => app._id === delivery.applicationId)?.name || 'Application'}</td><td><span className={`dev-pill dev-pill-${delivery.status === 'sent' ? 'active' : delivery.status === 'failed' ? 'off' : 'test'}`}>{delivery.status}</span>{delivery.lastError && <small className="dev-error-text">{delivery.lastError}</small>}</td><td>{delivery.attempts}</td><td>{delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString() : '—'}</td><td>{delivery.status === 'failed' && <button className="dev-button dev-small" disabled={busy === `retry-${delivery._id}`} onClick={() => retryWebhook(delivery)}><RefreshCw size={13} />Retry</button>}</td></tr>)}
              </tbody></table></div> : <div className="dev-empty"><Webhook /><strong>No webhook deliveries yet</strong><p>Configure a URL in application settings, then send a test.</p></div>}
            </div>}

            {section === 'sandbox' && <div className="dev-section">
              <div className="dev-section-heading"><div><h2>Sandbox console</h2><p>Run a signed test request from this browser. Your secret stays in memory and is never saved.</p></div></div>
              <div className="dev-callout dev-callout-blue"><TestTube2 size={18} /><p>Sandbox intent outcomes are simulated. They never create transactions, debit balances, or settle external payments.</p></div>
              {!sandboxApps.length ? <div className="dev-empty"><TestTube2 /><strong>Create an enabled sandbox application first</strong><p>Copy its one-time API secret and enter it here to test.</p><button className="dev-button" onClick={() => setSection('applications')}>Go to applications</button></div> : <>
                <div className="dev-panel"><div className="dev-form-grid">
                  <label>Sandbox application<select value={sandboxAppId} onChange={(event) => setSandboxAppId(event.target.value)}>{sandboxApps.map((app) => <option key={app._id} value={app._id}>{app.name} · {app.apiKey}</option>)}</select></label>
                  <label>One-time API secret<input type="password" autoComplete="off" value={sandboxSecret} onChange={(event) => setSandboxSecret(event.target.value)} placeholder="Paste your sandbox secret" /></label>
                  <label>Amount<input type="number" min="0.01" step="0.01" value={sandboxAmount} onChange={(event) => setSandboxAmount(event.target.value)} /></label>
                  <label>Currency<input maxLength="3" value={sandboxCurrency} onChange={(event) => setSandboxCurrency(event.target.value.toUpperCase())} /></label>
                </div>
                <button className="dev-primary" disabled={busy === 'sandbox-create' || !sandboxSecret || !sandboxAmount || !sandboxCurrency} onClick={createSandboxIntent}><TestTube2 size={16} />Create test intent</button>
                {sandboxIntent && <div className="dev-intent-row"><label>Intent reference<input value={sandboxIntent} onChange={(event) => setSandboxIntent(event.target.value)} /></label><button className="dev-button" disabled={busy === 'sandbox-status'} onClick={getSandboxStatus}>Check status</button><button className="dev-button" disabled={busy.startsWith('sandbox-simulate')} onClick={() => simulateSandbox('succeeded')}>Simulate succeeded</button><button className="dev-button" disabled={busy.startsWith('sandbox-simulate')} onClick={() => simulateSandbox('failed')}>Simulate failed</button><button className="dev-button" disabled={busy.startsWith('sandbox-simulate')} onClick={() => simulateSandbox('expired')}>Simulate expired</button></div>}
                </div>
                {sandboxResult && <div className="dev-result"><div><strong>Response</strong><button className="dev-button dev-small" onClick={() => copyText(pretty(sandboxResult), 'Response')}><Copy size={13} />Copy JSON</button></div><pre>{pretty(sandboxResult)}</pre></div>}
              </>}
            </div>}

            {section === 'api-logs' && <div className="dev-section">
              <div className="dev-section-heading"><div><h2>API & audit logs</h2><p>Recent request metadata and developer account changes. Request bodies and secrets are never logged.</p></div></div>
              <label className="dev-log-picker">Application<select value={selectedApp?._id || ''} onChange={(event) => setSelectedAppId(event.target.value)}>{apps.map((app) => <option key={app._id} value={app._id}>{app.name}</option>)}</select></label>
              <h3 className="dev-subheading">API requests <span className="dev-muted">last 100 · auto-expire after 30 days</span></h3>
              {requestLogs.length ? <div className="dev-table-wrap"><table className="dev-table"><thead><tr><th>Method / route</th><th>Status</th><th>Duration</th><th>Time</th></tr></thead><tbody>{requestLogs.map((log) => <tr key={log._id}><td><strong>{log.method}</strong> <code>{log.path}</code></td><td><span className={`dev-pill ${log.statusCode < 400 ? 'dev-pill-active' : 'dev-pill-off'}`}>{log.statusCode}</span></td><td>{log.durationMs} ms</td><td>{new Date(log.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="dev-empty"><Activity /><strong>No API requests logged</strong><p>Authenticated requests will appear here after the first call.</p></div>}
              <h3 className="dev-subheading">Developer audit trail</h3>
              {auditLogs.length ? <div className="dev-timeline">{auditLogs.map((log) => <div className="dev-timeline-item" key={log._id}><span /><div><strong>{log.action}</strong><small>{log.applicationName || 'Developer account'} · {new Date(log.createdAt).toLocaleString()}</small></div></div>)}</div> : <div className="dev-empty dev-empty-compact"><strong>No audit events yet</strong></div>}
            </div>}

            {section === 'documentation' && <div className="dev-section">
              <div className="dev-section-heading"><div><h2>API documentation</h2><p>Versioned references and examples for integrating with Credixa's currently available API.</p></div></div>
              <div className="dev-callout dev-callout-blue"><LifeBuoy size={18} /><p>Production verification confirms a completed internal Credixa ledger transfer. This API does not provide external bank settlement, refunds, or reversals. Sandbox testing never moves funds.</p></div>
              <div className="dev-doc-grid">
                {[
                  ['api-v1.pdf', 'API reference PDF', 'Printable endpoint and authentication guide.'],
                  ['api-v1.md', 'Markdown reference', 'Versioned API guide in Markdown.'],
                  ['openapi-v1.json', 'OpenAPI 3.1 schema', 'Machine-readable API contract.'],
                  ['changelog.md', 'Changelog', 'Version history and compatibility notes.'],
                  ['examples/node-payment-example.js', 'Node payment example', 'Signed payment-intent request.'],
                  ['examples/node-webhook-example.js', 'Node webhook example', 'Timestamp and HMAC verification.']
                ].map(([file, title, detail]) => <article className="dev-doc-card" key={file}><div className="dev-doc-icon"><BookOpen size={19} /></div><div><strong>{title}</strong><small>{detail}</small></div><button className="dev-icon-button" title={`Download ${title}`} onClick={() => downloadDocument(file, file.split('/').pop())}><ArrowDownToLine size={17} /></button></article>)}
              </div>
              <div className="dev-doc-links"><a href="https://github.com/sokdm/Credixa-" target="_blank" rel="noreferrer">Integration source <ExternalLink size={14} /></a><span>API v1 · revised 17 Nov 2026</span></div>
            </div>}
          </>}
        </section>
      </div>
      <footer className="dev-footer"><span><ShieldCheck size={15} />Scoped access · owner-only account visibility</span><span>Credixa Developer Platform</span></footer>
    </main>
  );
}
