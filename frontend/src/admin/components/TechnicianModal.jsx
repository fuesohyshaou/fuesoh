import { useEffect, useState } from 'react';
import { api } from '../../api.js';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]';

export default function TechnicianModal({ row, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: row?.name || '',
    phone: row?.phone || '',
    email: row?.email || '',
    specialty: row?.specialty || '',
    username: row?.username || '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set(field) {
    return e => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (row) {
        const payload = {
          name: form.name,
          phone: form.phone,
          email: form.email,
          specialty: form.specialty
        };
        if (form.password) payload.password = form.password;
        await api.updateTechnician(row.id, payload);
      } else {
        await api.createTechnician({
          name: form.name,
          phone: form.phone,
          email: form.email,
          specialty: form.specialty,
          username: form.username,
          password: form.password
        });
      }
      await onSaved();
    } catch (err) {
      setError(err.message || 'The technician could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-[#071A2F]">{row ? 'Edit Technician' : 'Add Technician'}</h3>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={set('name')} className={inputCls} placeholder="e.g. Jean Mbarga" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <input value={form.phone} onChange={set('phone')} className={inputCls} placeholder="e.g. +237 6 00 00 00 00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Specialty</label>
              <input value={form.specialty} onChange={set('specialty')} className={inputCls} placeholder="e.g. Fibre optics" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
            <input value={form.email} onChange={set('email')} className={inputCls} placeholder="e.g. jean@itisep.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username {row ? '(for sign-in)' : <span className="text-red-500">*</span>}</label>
            <input value={form.username} onChange={set('username')} className={inputCls} placeholder="e.g. jean.mbarga" disabled={Boolean(row)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{row ? 'New password (optional)' : 'Password'} <span className="text-red-500">{row ? '' : '*'}</span></label>
            <input type="password" value={form.password} onChange={set('password')} className={inputCls} placeholder={row ? 'Leave blank to keep current' : 'Minimum 6 characters'} />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : (row ? 'Save technician' : 'Create technician')}
          </button>
          {row && (
            <p className="text-[11px] text-slate-400 text-center">Username cannot be changed after creation.</p>
          )}
        </form>
      </div>
    </div>
  );
}