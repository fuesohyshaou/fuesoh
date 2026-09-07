import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { cities } from '../data.js';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const inputCls = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white';

function monthLabel(y, m) {
  return new Date(y, m, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' });
}

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function Calendar({ selected, onSelect }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const firstDay = new Date(ym.y, ym.m, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dayISO = d => `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  function go(dir) {
    let m = ym.m + dir;
    let y = ym.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setYm({ y, m });
  }

  const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => go(-1)} className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer">
          ‹
        </button>
        <p className="font-semibold text-[#071A2F] text-sm">{monthLabel(ym.y, ym.m)}</p>
        <button type="button" onClick={() => go(1)} className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400 mb-1">
        {WEEK.map(w => <span key={w} className="py-1">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`x${i}`} className="h-9"></span>;
          const iso = dayISO(d);
          const past = iso < todayISO();
          const isSel = selected === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              onClick={() => onSelect(iso)}
              className={`h-9 rounded-lg text-sm transition cursor-pointer ${
                isSel
                  ? 'bg-brand text-white font-semibold shadow'
                  : past
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'hover:bg-brand-light hover:text-brand text-slate-600'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function useLeaflet() {
  const [state, setState] = useState({ ready: false, failed: false });
  useEffect(() => {
    if (window.L) { setState({ ready: true, failed: false }); return; }
    let cancelled = false;
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkEl);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.async = true;
    s.onload = () => { if (!cancelled) setState({ ready: true, failed: false }); };
    s.onerror = () => { if (!cancelled) setState({ failed: true }); };
    document.head.appendChild(s);
    const t = setTimeout(() => {
      if (!cancelled && !window.L) setState(prev => (prev.ready ? prev : { failed: true }));
    }, 5000);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);
  return state;
}

function MapPicker({ location, onPick }) {
  const { ready, failed } = useLeaflet();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([4.0511, 9.7679], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    map.on('click', e => {
      if (markerRef.current) markerRef.current.setLatLng(e.latlng);
      else markerRef.current = L.marker(e.latlng).addTo(map);
      onPick(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    });
    if (location.lat && location.lng) {
      const ll = [Number(location.lat), Number(location.lng)];
      map.setView(ll, 15);
      markerRef.current = L.marker(ll).addTo(map);
    }
    mapRef.current = map;
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) {
    return (
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 text-center text-sm text-slate-500">
        The online map could not be loaded right now. No problem — just type your address below and we will locate
        your site for you.
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="h-56 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-sm text-slate-400 animate-pulse">
        Loading map…
      </div>
    );
  }
  return (
    <div className="relative">
      <div ref={containerRef} className="h-56 w-full rounded-lg border border-slate-200 z-0"></div>
      <p className="text-[11px] text-slate-400 mt-1.5">Click on the map to drop a pin for the exact site location.</p>
      {location.lat && location.lng && (
        <span className="absolute top-2 left-2 bg-white/90 text-[11px] font-semibold text-slate-600 px-2 py-1 rounded shadow">
          {location.lat}, {location.lng}
        </span>
      )}
    </div>
  );
}

export default function Booking() {
  const [services, setServices] = useState([]);
  const [techs, setTechs] = useState([]);
  const [form, setForm] = useState({
    service: '',
    technician_id: '',
    date: '',
    time: '',
    city: '',
    neighborhood: '',
    address: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    notes: ''
  });
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.getServices().then(s => setServices(Array.isArray(s) ? s : [])).catch(() => {});
    api.getTechnicians().then(t => setTechs(Array.isArray(t) ? t : [])).catch(() => {});
  }, []);

  const set = field => e => {
    const value = e.target && e.target.value !== undefined ? e.target.value : e;
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.service) return setError('Please choose a service.');
    if (!form.date) return setError('Please pick a date on the calendar.');
    if (!form.time) return setError('Please choose a time slot.');
    if (!form.client_name.trim()) return setError('Please enter your full name.');
    if (!form.client_phone.trim()) return setError('Please enter your phone number.');
    setBusy(true);
    try {
      const res = await api.createBooking({
        client_name: form.client_name.trim(),
        client_phone: form.client_phone.trim(),
        client_email: form.client_email.trim() || null,
        service: form.service,
        technician_id: form.technician_id ? Number(form.technician_id) : null,
        booking_date: form.date,
        time_slot: form.time,
        address: form.address.trim() || null,
        city: form.city || null,
        neighborhood: form.neighborhood.trim() || null,
        lat: lat || null,
        lng: lng || null,
        notes: form.notes.trim() || null
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'The booking could not be submitted. Check that the server is running.');
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#071A2F] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
        <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#169B62" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#071A2F]">Booking received!</h1>
          <p className="text-slate-500 text-sm mt-2">
            Your technician booking is confirmed. We received it and will contact you shortly.
          </p>
          <div className="mt-6 bg-slate-50 rounded-xl p-5 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Booking ID</span><span className="font-mono font-bold text-[#0B63CE]">{result.booking_id}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Service</span><span className="font-medium text-slate-700">{form.service}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="font-medium text-slate-700">{form.date}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Time</span><span className="font-medium text-slate-700">{form.time}</span></div>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <a href="index.html" className="bg-brand text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-600">Back to Home</a>
            <a href="booking.html" className="border border-slate-200 text-slate-600 hover:border-brand hover:text-brand font-semibold px-5 py-2.5 rounded-lg text-sm">Book another</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <header className="bg-[#071A2F] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center font-extrabold text-sm">I</div>
          <div>
            <p className="font-bold leading-tight">IT-ISEP <span className="text-[#00B8D9]">LTD</span></p>
            <p className="text-[11px] text-slate-400 -mt-0.5">Book a Technician</p>
          </div>
        </div>
        <a href="index.html" className="text-sm text-slate-300 hover:text-white">← Back to website</a>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#071A2F]">Book a Technician</h1>
          <p className="text-slate-500 text-sm mt-1">
            Choose your service, pick a date and time on the calendar, point to your location on the map, and our technician will visit your site.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-5">
            <Section title="1 · Service" desc="What do you need help with?">
              <div className="flex flex-wrap gap-2">
                {services.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set('service')(s.name)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition cursor-pointer ${
                      form.service === s.name
                        ? 'bg-brand text-white border-brand shadow'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand hover:text-brand'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
                {services.length === 0 && <p className="text-sm text-slate-400">Loading services…</p>}
              </div>
            </Section>

            <Section title="2 · Date & time" desc="Pick an available day and time slot.">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <Calendar selected={form.date} onSelect={set('date')} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Available time slots</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('time')(t)}
                        className={`py-2 rounded-lg text-sm font-semibold border transition cursor-pointer ${
                          form.time === t
                            ? 'bg-brand text-white border-brand shadow'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand hover:text-brand'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {form.date && <p className="text-[11px] text-slate-400 mt-3">Selected date: <span className="font-semibold text-brand">{form.date}</span></p>}
                </div>
              </div>
            </Section>

            <Section title="3 · Technician" desc="Leave “Any available” and we assign the nearest expert, or choose one.">
              <select value={form.technician_id} onChange={set('technician_id')} className={inputCls}>
                <option value="">Any available technician</option>
                {techs.map(t => (
                  <option key={t.id} value={t.id}>{t.name}{t.specialty ? ` — ${t.specialty}` : ''}</option>
                ))}
              </select>
            </Section>

            <Section title="4 · Location on map & address" desc="Drop a pin on the map or type your address.">
              <div>
                <MapPicker location={{ lat, lng }} onPick={(la, ln) => { setLat(la); setLng(ln); }} />
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">City</label>
                  <select value={form.city} onChange={set('city')} className={inputCls}>
                    <option value="">Select city…</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Neighborhood / Quarter</label>
                  <input value={form.neighborhood} onChange={set('neighborhood')} placeholder="e.g. Bonapriso" className={inputCls} />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full address / landmark</label>
                <input value={form.address} onChange={set('address')} placeholder="Street, building, landmark…" className={inputCls} />
              </div>
            </Section>

            <Section title="5 · Your contact details" desc="So the technician can reach you.">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full name *</label>
                  <input value={form.client_name} onChange={set('client_name')} placeholder="e.g. John Doe" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone *</label>
                  <input value={form.client_phone} onChange={set('client_phone')} placeholder="e.g. +237 670 000 000" className={inputCls} />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email (optional)</label>
                <input type="email" value={form.client_email} onChange={set('client_email')} placeholder="e.g. john@example.com" className={inputCls} />
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notes for the technician (optional)</label>
                <textarea rows="3" value={form.notes} onChange={set('notes')} placeholder="Anything we should know about the site?" className={inputCls} />
              </div>
            </Section>
          </div>

          <aside className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 lg:sticky lg:top-6">
            <h2 className="font-extrabold text-[#071A2F] mb-4">Booking summary</h2>
            <div className="space-y-2.5 text-sm">
              <Row label="Service" value={form.service || '—'} />
              <Row label="Date" value={form.date || '—'} />
              <Row label="Time" value={form.time || '—'} />
              <Row label="Technician" value={techs.find(t => String(t.id) === String(form.technician_id))?.name || 'Any available'} />
              <Row label="Location" value={[form.city, form.neighborhood].filter(Boolean).join(', ') || '—'} />
              <Row label="Client" value={form.client_name.trim() || '—'} />
            </div>
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-500 font-bold leading-none mt-0.5">!</span>
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              className="mt-5 w-full bg-brand hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? 'Booking…' : 'Confirm Booking'}
            </button>
            <p className="text-[11px] text-slate-400 mt-3 text-center leading-relaxed">
              You will receive confirmation by phone or WhatsApp. Your booking reference is generated instantly.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="font-bold text-[#071A2F]">{title}</h2>
      <p className="text-xs text-slate-400 mb-4 -mt-0.5">{desc}</p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className="font-semibold text-slate-700 text-right text-[13px] max-w-[180px] truncate">{value}</span>
    </div>
  );
}