import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';
import { StatusBadge, BOOKING_STATUS_LABELS } from '../admin/components/rows.jsx';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' }
];

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const IMAGE_RE = /^image\/(png|jpe?g|webp|gif)$/;

function datePretty(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

export default function TechnicianApp() {
  const { user, ready, signOut } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState({});

  const load = useCallback(async () => {
    try {
      const rows = await api.getMyBookings();
      setBookings(Array.isArray(rows) ? rows : []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!ready) return;
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load, ready]);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== 'technician') {
      window.location.href = 'login.html';
    }
  }, [ready, user]);

  if (!ready) return <Loading text="Checking your account…" />;
  if (!user || user.role !== 'technician') return null;

  async function loadDetail(id) {
    try {
      const d = await api.getBooking(id);
      setDetails(prev => ({ ...prev, [id]: d }));
    } catch { /* ignore */ }
  }

  async function openDetail(id) {
    if (details[id]) {
      setDetails(prev => ({ ...prev, [id]: null }));
      setError(null);
      return;
    }
    setBusyId(id);
    try {
      await loadDetail(id);
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(id, status) {
    setBusyId(id);
    setError(null);
    try {
      await api.updateBooking(id, { status });
      await Promise.all([load(), loadDetail(id).catch(() => {})]);
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleWork(id, kind, file) {
    if (!file) return;
    if (!IMAGE_RE.test(file.type)) { setError(kind === 'final' ? 'Final work image must be PNG/JPG/WebP/GIF.' : 'Site image must be PNG/JPG/WebP/GIF.'); return; }
    if (file.size > 4 * 1024 * 1024) { setError('Image must be 4 MB or smaller.'); return; }
    setBusyId(id);
    setError(null);
    try {
      await api.uploadBookingWork(id, file, kind, '');
      await loadDetail(id);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setBusyId(null);
    }
  }

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  const shown = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const displayName = user.name || user.email || 'Technician';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <header className="bg-[#071A2F] px-5 lg:px-8 py-4 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#0B63CE] flex items-center justify-center font-extrabold text-sm shrink-0">I</div>
          <div className="min-w-0">
            <p className="font-bold leading-tight truncate">IT-ISEP <span className="text-[#00B8D9]">LTD</span> · Technician</p>
            <p className="text-[11px] text-slate-400 -mt-0.5 truncate">{displayName} — {user.specialty || 'Field technician'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a href="index.html" className="text-xs text-slate-300 hover:text-white hidden sm:inline">← Website</a>
          <button
            onClick={() => { signOut(); window.location.href = 'login.html'; }}
            className="text-xs font-semibold text-red-300 border border-white/15 rounded-lg px-3 py-2 hover:bg-red-500/10 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#071A2F]">My Jobs</h1>
            <p className="text-sm text-slate-500 mt-0.5">Booking{bookings.length === 1 ? '' : 's'} assigned to you, with work photo uploads.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <span className="font-bold leading-none mt-0.5">!</span><span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total jobs', value: counts.all, cls: 'text-[#071A2F]' },
            { label: 'Pending', value: counts.pending, cls: 'text-amber-500' },
            { label: 'In progress', value: counts.in_progress, cls: 'text-indigo-500' },
            { label: 'Completed', value: counts.completed, cls: 'text-emerald-500' }
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className={`text-2xl font-extrabold ${c.cls}`}>{c.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                filter === f.id ? 'bg-[#0B63CE] text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#0B63CE]'
              }`}
            >
              {f.label} <span className="opacity-70">({counts[f.id]})</span>
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-14 text-center text-slate-400 text-sm">
            No {filter === 'all' ? '' : filter.replace('_', ' ') + ' '}jobs right now.
          </div>
        ) : (
          <div className="space-y-4">
            {shown.map(b => (
              <BookingCard
                key={b.id}
                booking={b}
                detail={details[b.id]}
                busy={busyId === b.id}
                onToggle={() => openDetail(b.id)}
                onStatus={status => changeStatus(b.id, status)}
                onWork={(kind, file) => handleWork(b.id, kind, file)}
                onRefresh={() => loadDetail(b.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BookingCard({ booking: b, detail, busy, onToggle, onStatus, onWork, onRefresh }) {
  const expanded = Boolean(detail);
  const siteWork = (detail?.work || []).filter(w => w.kind === 'site');
  const finalWork = (detail?.work || []).filter(w => w.kind === 'final');
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold text-[#0B63CE] bg-[#EAF2FF] px-2.5 py-1 rounded-lg">{b.booking_id}</span>
            <StatusBadge status={b.status} />
          </div>
          <span className="text-[11px] text-slate-400">{datePretty(b.created_at)}</span>
        </div>

        <div className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <InfoRow label="Service" value={b.service || '—'} />
          <InfoRow label="Client" value={`${b.client_name}${b.client_phone ? ` · ${b.client_phone}` : ''}${b.client_email ? ` · ${b.client_email}` : ''}`} />
          <InfoRow label="Date" value={`${b.booking_date || '—'}${b.time_slot ? ` at ${b.time_slot}` : ''}`} />
          <InfoRow label="Site" value={[b.address, b.neighborhood, b.city].filter(Boolean).join(', ') || '—'} />
          {b.lat && b.lng && (
            <div className="sm:col-span-2"><InfoRow label="Coordinates" value={`${b.lat}, ${b.lng}`} /></div>
          )}
          {b.notes && <div className="sm:col-span-2"><InfoRow label="Notes" value={b.notes} /></div>}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {b.status === 'pending' && (
            <ActionBtn onClick={() => onStatus('confirmed')} busy={busy} color="blue">Accept job</ActionBtn>
          )}
          {b.status === 'confirmed' && (
            <ActionBtn onClick={() => onStatus('in_progress')} busy={busy} color="indigo">Start work</ActionBtn>
          )}
          {b.status === 'in_progress' && (
            <ActionBtn onClick={() => onStatus('completed')} busy={busy} color="green">Mark completed</ActionBtn>
          )}
          {b.status === 'completed' && (
            <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              ✓ Completed
            </span>
          )}
          <button
            onClick={onToggle}
            className="text-sm font-semibold text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:border-[#0B63CE] hover:text-[#0B63CE] transition cursor-pointer"
          >
            {expanded ? 'Hide photos' : 'View / upload work photos'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-5">
          <div className="grid md:grid-cols-2 gap-5">
            <WorkColumn
              title="Work done at site"
              hint="Photo of the installation / work in progress"
              kind="site"
              items={siteWork}
              busy={busy}
              label="Upload site photo"
              onPick={f => onWork('site', f)}
            />
            <WorkColumn
              title="Final work"
              hint="Finished installation photo"
              kind="final"
              items={finalWork}
              busy={busy}
              label="Upload final photo"
              onPick={f => onWork('final', f)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, busy, children, color }) {
  const colors = {
    blue: 'bg-[#0B63CE] hover:bg-blue-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    green: 'bg-emerald-500 hover:bg-emerald-600'
  };
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`text-white text-sm font-semibold px-4 py-2 rounded-lg transition ${colors[color]} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
    >
      {busy ? 'Updating…' : children}
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <p className="text-slate-600">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">{label}</span>
      <span className="font-medium text-slate-700 break-words">{value}</span>
    </p>
  );
}

function WorkColumn({ title, hint, kind, items, busy, onPick, label }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="font-bold text-[#071A2F] text-sm">{title}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
      {items.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {items.map(w => (
            <div key={w.id} className="relative group">
              <img src={w.image} className="w-full h-20 object-cover rounded-lg border border-slate-200" onError={e => { e.currentTarget.style.display = 'none'; }} alt={w.kind} />
              <span className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${kind === 'site' ? 'bg-indigo-500' : 'bg-emerald-500'} text-white`}>
                {kind === 'site' ? 'SITE' : 'FINAL'}
              </span>
              {w.caption && <p className="text-[10px] text-slate-500 mt-1 truncate">{w.caption}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 mt-3">No photos uploaded yet.</p>
      )}
      <label className="mt-3 w-full block text-center text-sm font-semibold text-[#0B63CE] border border-dashed border-slate-300 hover:border-[#0B63CE] hover:bg-[#EAF2FF] rounded-lg py-2 transition cursor-pointer disabled:opacity-50">
        <input
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={busy}
          onChange={e => {
            const f = e.target.files && e.target.files[0];
            if (f) onPick(f);
            e.target.value = '';
          }}
        />
        {busy ? 'Uploading…' : `+ ${label}`}
      </label>
    </div>
  );
}

function Loading({ text }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <div className="bg-white rounded-xl shadow-sm px-8 py-6 text-sm text-slate-400">{text}</div>
    </div>
  );
}