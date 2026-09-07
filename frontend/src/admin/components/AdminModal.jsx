import { useEffect, useState } from 'react';
import { api } from '../../api.js';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]';

export default function AdminModal({ onClose, onSaved }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.createAdmin(username.trim(), password);
      await onSaved();
    } catch (err) {
      setError(err.message || 'The administrator could not be created. Check that the server is running.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-[#071A2F]">Add Administrator</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 flex items-start gap-2">
              <span className="text-red-500 font-bold leading-none mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Username<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); if (error) setError(null); }}
              placeholder="e.g. john"
              autoComplete="off"
              className={inputCls}
            />
            <p className="text-[11px] text-slate-400 mt-1.5">3-32 characters using letters, numbers, . _ -</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Password<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); if (error) setError(null); }}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {busy ? 'Creating…' : 'Create Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
}