import { useState } from 'react';
import { useAuth } from '../../auth.jsx';

export default function Signup() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Sign up failed. Check that the server is running.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071A2F] px-4" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#0B63CE] flex items-center justify-center text-white text-2xl font-extrabold mb-3">
            I
          </div>
          <p className="text-white font-bold text-xl">IT-ISEP <span className="text-[#00B8D9]">LTD</span></p>
          <p className="text-slate-400 text-xs mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 mb-4 flex items-start gap-2">
              <span className="text-red-500 font-bold leading-none mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}
          {done && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-700 mb-4 flex items-start gap-2">
              <span className="font-bold leading-none mt-0.5">✓</span>
              <span>
                Your account has been created! <a href="account.html" className="text-[#0B63CE] hover:underline font-semibold">Go to your account</a>.
              </span>
            </div>
          )}

          {!done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); if (error) setError(null); }}
                  placeholder="e.g. John Doe"
                  autoComplete="name"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(null); }}
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); if (error) setError(null); }}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Creating account…' : 'Sign Up'}
              </button>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                User accounts give you access to the website. Administrator accounts are created by an existing administrator.
              </p>
            </form>
          )}

          <div className="flex items-center justify-center gap-4 mt-5 text-xs">
            <a href="login.html" className="text-[#0B63CE] hover:underline">Already have an account? Sign in</a>
            <span className="text-slate-300">•</span>
            <a href="index.html" className="text-[#0B63CE] hover:underline">Back to website</a>
          </div>
        </div>
      </div>
    </div>
  );
}