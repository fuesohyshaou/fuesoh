import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth.jsx';
import { api } from '../../api.js';
import { dateText } from './rows.jsx';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]';

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [createdAt, setCreatedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    setMessage(null);
    try {
      const res = await api.me(token);
      if (res && res.user) {
        setForm({ name: res.user.name || '', email: res.user.email || '' });
        setCreatedAt(res.user.created_at || null);
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not load profile. Check that the server is running.' });
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '' });
    load();
  }, [user, load]);

  function set(field) {
    return e => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (message) setMessage(null);
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    const hasPasswordChange = newPassword || confirmPassword;
    if (hasPasswordChange && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'The new passwords do not match.' });
      return;
    }
    if (hasPasswordChange && !currentPassword) {
      setMessage({ type: 'error', text: 'Enter your current password to change it.' });
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim()
      };
      if (hasPasswordChange) {
        body.current_password = currentPassword;
        body.new_password = newPassword;
      }
      const res = await api.updateProfile(body);
      if (res && res.user) updateUser(res.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Profile saved successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Profile could not be saved.' });
    } finally {
      setSaving(false);
    }
  }

  const displayName = user?.name || user?.email || 'Admin';
  const avatarChar = (displayName.charAt(0) || 'I').toUpperCase();

  return (
    <div className="max-w-xl bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-[#071A2F]">My Profile</h2>
        <button
          onClick={load}
          disabled={refreshing}
          className="inline-flex items-center gap-2 text-sm text-[#0B63CE] font-semibold hover:underline cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className={refreshing ? 'animate-spin' : ''}>
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0B63CE] flex items-center justify-center text-xl font-extrabold text-white">
            {avatarChar}
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#071A2F]">{displayName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#0B63CE] mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B63CE]"></span>
              Administrator
            </span>
          </div>
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
            <input value={user?.username || ''} readOnly className={`${inputCls} bg-slate-50 text-slate-400`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
            <input value={user?.role || 'admin'} readOnly className={`${inputCls} bg-slate-50 text-slate-400`} />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
              <input value={form.name} onChange={set('name')} placeholder="Full name" autoComplete="name" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="name@company.com" autoComplete="email" className={inputCls} />
            </div>
          </div>

          {createdAt && (
            <p className="text-[11px] text-slate-400">
              Account created {dateText(createdAt)}
            </p>
          )}

          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-bold text-[#071A2F] mb-3">Change password</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); if (message) setMessage(null); }}
                  placeholder="Current password"
                  autoComplete="current-password"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); if (message) setMessage(null); }}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); if (message) setMessage(null); }}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0B63CE] hover:bg-blue-600 disabled:bg-slate-200 text-white font-semibold py-3 rounded-lg transition text-sm cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}