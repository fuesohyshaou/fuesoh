import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api.js';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]';

export default function NotifySettings() {
  const [enabled, setEnabled] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [smtpHint, setSmtpHint] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    try {
      const cfg = await api.getNotifications();
      setEnabled(cfg.enabled !== false);
      setNotifyEmail(cfg.notifyEmail || '');
      setSmtpHint(cfg.smtpHost || '');
    } catch {
      // server offline - keep current state
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.updateSettings({
        notificationsEnabled: enabled ? 'true' : 'false',
        notifyEmail: notifyEmail.trim()
      });
      setMessage({ type: 'success', text: 'Notification settings saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Save failed. Check that the server is running.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setMessage(null);
    try {
      await api.updateSettings({
        notificationsEnabled: enabled ? 'true' : 'false',
        notifyEmail: notifyEmail.trim()
      });
      const res = await api.testEmail();
      setMessage({ type: res.ok ? 'success' : 'error', text: res.ok ? 'Test email sent successfully.' : (res.error || 'Test email failed.') });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Test failed. Check that the server is running.' });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-xl bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-[#071A2F]">Mail Notifications</h2>
        <button onClick={load} className="text-sm text-[#0B63CE] font-semibold hover:underline cursor-pointer">Refresh</button>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-500 leading-relaxed">
          Every request from the website — availability checks, quote requests, chat messages and new user
          registrations — is emailed here automatically. Fill in the recipient address below (default:
          <span className="font-semibold text-slate-700"> fuesohyushaou@gmail.com</span>).
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <label className="flex items-center justify-between gap-4 bg-slate-50 rounded-lg px-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-700">Send email notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">Turn all request emails on or off.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => { setEnabled(!enabled); setMessage(null); }}
              className={`relative w-12 h-6.5 rounded-full transition shrink-0 cursor-pointer ${enabled ? 'bg-[#0B63CE]' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow transition-all ${enabled ? 'left-6' : 'left-0.5'}`}></span>
            </button>
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notification email address</label>
            <input
              type="email"
              value={notifyEmail}
              onChange={e => { setNotifyEmail(e.target.value); if (message) setMessage(null); }}
              placeholder="fuesohyushaou@gmail.com"
              className={inputCls}
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Requests are sent to this address as soon as they arrive.
            </p>
          </div>

          {message && (
            <div
              className={`rounded-lg border px-3.5 py-2.5 text-sm flex items-start gap-2 ${
                message.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <span className="font-bold leading-none mt-0.5">{message.type === 'error' ? '!' : '✓'}</span>
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save settings'}
            </button>
            <button
              type="button"
              disabled={testing || !enabled || !notifyEmail.trim()}
              onClick={handleTest}
              className="text-sm font-semibold text-[#0B63CE] border border-[#0B63CE] hover:bg-[#0B63CE] hover:text-white rounded-lg px-4 py-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Sending…' : 'Send test email'}
            </button>
          </div>
        </form>

        <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Server setup (one-time)</p>
          <p>
            Outgoing mail is sent through your SMTP account. The recipient address above is controlled here in the
            admin dashboard, but the sending account is configured in <code className="bg-slate-200 px-1 rounded">backend/.env</code>:
          </p>
          <pre className="mt-2 bg-[#071A2F] text-emerald-300 rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed">{`MAIL_TO=${notifyEmail.trim() || 'fuesohyushaou@gmail.com'}
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your_app_password`}</pre>
          {smtpHint && (
            <p className="mt-2 text-emerald-600 font-medium">✓ SMTP is set up ({smtpHint}). Use “Send test email” to verify.</p>
          )}
        </div>
      </div>
    </div>
  );
}