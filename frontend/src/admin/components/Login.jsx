import { useState } from 'react';
import { useAuth } from '../../auth.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await signIn(identifier.trim(), password);
      setUserName(user.name || user.email);
      setUserRole(user.role);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Sign in failed. Check that the server is running.');
    } finally {
      setBusy(false);
    }
  }

  const dashboardHref = userRole === 'admin' ? 'admin.html' : userRole === 'technician' ? 'technician.html' : 'account.html';
  const dashboardLabel = userRole === 'admin' ? 'Go to Dashboard' : userRole === 'technician' ? 'Go to My Jobs' : 'Go to your account';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071A2F] px-4" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#0B63CE] flex items-center justify-center text-white text-2xl font-extrabold mb-3">
            I
          </div>
          <p className="text-white font-bold text-xl">IT-ISEP <span className="text-[#00B8D9]">LTD</span></p>
          <p className="text-slate-400 text-xs mt-1">Welcome back</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 mb-4 flex items-start gap-2">
              <span className="text-red-500 font-bold leading-none mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}
          {done ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-700 mb-4 flex items-start gap-2">
              <span className="font-bold leading-none mt-0.5">✓</span>
              <span>
                Welcome{userName ? `, ${userName}` : ' back'}!{' '}
                <a href={dashboardHref} className="text-[#0B63CE] hover:underline font-semibold">{dashboardLabel}</a>.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address or username</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); if (error) setError(null); }}
                  placeholder="e.g. john@example.com"
                  autoComplete="email"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (error) setError(null); }}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-4 mt-5 text-xs">
            <a href="index.html" className="text-slate-400 hover:text-[#0B63CE] transition">← Back to website</a>
            <span className="text-slate-200">•</span>
            <a href="admin.html" className="text-[#0B63CE] hover:underline">Admin Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}