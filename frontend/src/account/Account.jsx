import { useState } from 'react';
import { useAuth } from '../auth.jsx';

export default function Account() {
  const { user, ready, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  }

  function copyEmail() {
    if (!user) return;
    navigator.clipboard?.writeText(user.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <header className="bg-[#071A2F] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B63CE] flex items-center justify-center font-extrabold text-sm">I</div>
          <div>
            <p className="font-bold leading-tight">IT-ISEP <span className="text-[#00B8D9]">LTD</span></p>
            <p className="text-[11px] text-slate-400 -mt-0.5">My Account</p>
          </div>
        </div>
        <a href="index.html" className="text-sm text-slate-300 hover:text-white">← Back to website</a>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        {!ready ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : !user ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="font-semibold text-slate-700 mb-4">You are not signed in.</p>
            <div className="flex items-center justify-center gap-3">
              <a href="login.html" className="bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">Sign In</a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#071A2F] px-6 py-6 text-white flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0B63CE] flex items-center justify-center text-xl font-extrabold">
                {String(user.name || user.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-lg truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">Name</p>
                  <p className="font-medium text-slate-700 truncate">{user.name}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">Role</p>
                  <p className="font-medium text-slate-700 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={copyEmail}
                className="w-full text-left bg-slate-50 rounded-lg p-3 text-sm hover:bg-slate-100 transition cursor-pointer"
              >
                <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">Email</p>
                <p className="font-medium text-slate-700 truncate">{user.email} {copied && <span className="text-emerald-600 font-semibold">✓ Copied</span>}</p>
              </button>

              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={handleSignOut}
                  disabled={busy}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50 transition cursor-pointer"
                >
                  {busy ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}