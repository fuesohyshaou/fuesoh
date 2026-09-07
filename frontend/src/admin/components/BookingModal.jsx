import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { StatusBadge, BOOKING_STATUS_LABELS, dateText } from './rows.jsx';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE]';

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

export default function BookingModal({ row, technicians, onClose, onSaved }) {
  const [form, setForm] = useState({
    service: row.service || '',
    technician_id: row.technician_id != null ? String(row.technician_id) : '',
    booking_date: row.booking_date || '',
    time_slot: row.time_slot || '',
    status: row.status || 'pending',
    address: row.address || '',
    city: row.city || '',
    neighborhood: row.neighborhood || '',
    notes: row.notes || ''
  });
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    api.getBooking(row.id).then(setDetail).catch(() => {});
    return () => document.removeEventListener('keydown', onKey);
  }, [row.id, onClose]);

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
      await api.updateBooking(row.id, {
        service: form.service,
        technician_id: form.technician_id ? Number(form.technician_id) : null,
        booking_date: form.booking_date,
        time_slot: form.time_slot,
        status: form.status,
        address: form.address,
        city: form.city,
        neighborhood: form.neighborhood,
        notes: form.notes
      });
      await onSaved();
    } catch (err) {
      setError(err.message || 'The booking could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  const work = (detail && detail.work) || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-[#071A2F]">Booking <span className="font-mono text-[#0B63CE]">{row.booking_id}</span></h3>
            <p className="text-xs text-slate-400 mt-0.5">{row.client_name} · {row.client_phone} · {dateText(row.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">✕</button>
        </div>

        <div className="mb-4">
          <StatusBadge status={row.status} />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 mb-4 flex items-start gap-2">
            <span className="text-red-500 font-bold leading-none mt-0.5">!</span><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service</label>
              <input value={form.service} onChange={set('service')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
              <select value={form.status} onChange={set('status')} className={inputCls}>
                {STATUSES.map(s => <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assigned technician</label>
            <select value={form.technician_id} onChange={set('technician_id')} className={inputCls}>
              <option value="">Unassigned</option>
              {technicians.map(t => <option key={t.id} value={String(t.id)}>{t.name}{t.specialty ? ` — ${t.specialty}` : ''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
              <input type="date" value={form.booking_date} onChange={set('booking_date')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Time</label>
              <select value={form.time_slot} onChange={set('time_slot')} className={inputCls}>
                <option value="">Select…</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
            <input value={form.address} onChange={set('address')} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
              <input value={form.city} onChange={set('city')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Neighborhood</label>
              <input value={form.neighborhood} onChange={set('neighborhood')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
            <textarea rows="2" value={form.notes} onChange={set('notes')} className={inputCls} />
          </div>

          {work.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Work photos uploaded by technician</p>
              <div className="grid grid-cols-3 gap-2">
                {work.map(w => (
                  <div key={w.id}>
                    <img src={w.image} className="w-full h-20 object-cover rounded-lg border border-slate-200" onError={e => { e.currentTarget.style.display = 'none'; }} alt={w.kind} />
                    <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${w.kind === 'site' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {w.kind === 'site' ? 'SITE' : 'FINAL'} · {dateText(w.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}