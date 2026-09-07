import { useMemo, useState } from 'react';
import { WHATSAPP_HELP_LINK, equipmentCategories, serviceTags, serviceIcons } from '../data.js';
import Reveal from './Reveal.jsx';

const VIEWS = [
  { key: 'all', label: 'All' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'services', label: 'Services' }
];

const CATEGORY_BADGE_COLORS = {
  Routers: 'bg-sky-100 text-sky-700',
  'Access Points': 'bg-violet-100 text-violet-700',
  Switches: 'bg-amber-100 text-amber-700',
  CPE: 'bg-emerald-100 text-emerald-700',
  Fibre: 'bg-cyan-100 text-cyan-700'
};

const SERVICE_ICON_BY_TAG = { FIBRE: 0, SATELLITE: 1, 'WI-FI': 2, NETWORK: 3, EQUIPMENT: 4, SUPPORT: 5 };

function parseNum(v) {
  return Number(String(v ?? '').replace(/[^\d]/g, '')) || 0;
}

function fmt(v) {
  return String(v ?? '').replace(/[^\d]/g, '');
}

function placeholderSvg() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="8" rx="1.5" stroke="#94A3B8" strokeWidth="1.4" />
      <circle cx="7" cy="12" r="1" fill="#94A3B8" />
      <circle cx="11" cy="12" r="1" fill="#94A3B8" />
      <path d="M15 12h4" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function chatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function cartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" />
      <path d="M2.5 3h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function searchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Store({
  equipment,
  services,
  cart,
  onAdd,
  onUpdateQty,
  onRemoveItem,
  onOpenCart,
  onAsk
}) {
  const [broken, setBroken] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [view, setView] = useState('all');
  const [category, setCategory] = useState('All');
  const [tag, setTag] = useState('All');
  const markBroken = id => setBroken(prev => new Set(prev).add(id));

  const cartMap = useMemo(() => {
    const m = {};
    cart.forEach(c => { m[c.sku] = c.qty || 1; });
    return m;
  }, [cart]);

  const filteredEquipment = useMemo(() => {
    let list = equipment;
    if (category !== 'All') list = list.filter(i => (i.category || '') === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(i =>
        `${i.name} ${i.sku} ${i.category || ''}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [equipment, category, query]);

  const filteredServices = useMemo(() => {
    let list = services;
    if (tag !== 'All') list = list.filter(s => (s.tag || '') === tag);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(s =>
        `${s.name} ${s.desc || ''} ${s.tag || ''}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [services, tag, query]);

  const showEquipment = view === 'all' || view === 'equipment';
  const showServices = view === 'all' || view === 'services';
  const nothingToShow = (showEquipment && filteredEquipment.length === 0) && (showServices && filteredServices.length === 0);

  const subtotal = useMemo(
    () => cart.reduce((sum, c) => sum + parseNum(c.price) * (c.qty || 1), 0),
    [cart]
  );
  const totalItems = useMemo(
    () => cart.reduce((sum, c) => sum + (c.qty || 1), 0),
    [cart]
  );

  return (
    <section id="store" className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <Reveal>
            <span className="text-brand text-xs font-bold tracking-widest uppercase">
              IT-ISEP Store &amp; Services
            </span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-2">
              Equipment <span className="text-brand">&amp;</span> Services Hub
            </h2>
            <p className="text-slate-500 mt-3 text-sm max-w-md">
              Routers, switches, access points, fibre, CPE devices and installation services.
              Filter, add to your cart and request a quotation, or chat with a technician directly.
            </p>
          </Reveal>
          <button
            onClick={onOpenCart}
            className="shrink-0 inline-flex items-center gap-2 bg-brand-dark hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-lg text-sm transition w-max cursor-pointer"
          >
            {cartIcon()}
            View Cart
            {totalItems > 0 && (
              <span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems} · {fmt(subtotal)} FCFA
              </span>
            )}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="inline-flex bg-slate-100 rounded-full p-1 w-max">
              {VIEWS.map(v => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                    view === v.key ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:text-brand'
                  }`}
                >
                  {v.label}
                  {v.key === 'equipment' && <span className="ml-1.5 opacity-70">{equipment.length}</span>}
                  {v.key === 'services' && <span className="ml-1.5 opacity-70">{services.length}</span>}
                </button>
              ))}
            </div>
            <div className="relative flex-1 md:max-w-sm">
              {searchIcon()}
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search catalog or services..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          {(showEquipment || view === 'all') && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Equipment</span>
              {equipmentCategories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                    category === c
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand hover:text-brand'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {(showServices || view === 'all') && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Services</span>
              {serviceTags.map(t => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                    tag === t
                      ? 'bg-cyan text-white border-cyan'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-cyan hover:text-cyan'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {nothingToShow ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-sm font-semibold text-slate-500">No items match your search.</p>
            <p className="text-xs text-slate-400 mt-1">
              Try a different keyword or filter — or ask us in chat, our team will source it.
            </p>
            <button
              onClick={() => onAsk(null)}
              className="mt-4 inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-600 transition cursor-pointer"
            >
              {chatIcon()} Ask in Chat
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {showEquipment && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-brand inline-block" />
                    Equipment Store
                    <span className="text-xs font-semibold text-slate-400">({filteredEquipment.length})</span>
                  </h3>
                  {view === 'all' && (
                    <button
                      onClick={() => setView('equipment')}
                      className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                    >
                      View all equipment →
                    </button>
                  )}
                </div>

                {filteredEquipment.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-400">
                    No equipment matches your filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredEquipment.map(item => {
                      const qty = cartMap[item.sku] || 0;
                      return (
                        <div
                          key={item.id ?? item.sku}
                          className={`bg-white rounded-xl border overflow-hidden flex flex-col card-hover ${
                            qty > 0 ? 'border-brand/40 ring-1 ring-brand/20' : 'border-slate-200'
                          }`}
                        >
                          <div className="relative h-32 bg-gradient-to-br from-slate-50 to-brand-light flex items-center justify-center overflow-hidden">
                            {item.image && !broken.has(item.id) ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain p-3"
                                onError={() => markBroken(item.id)}
                              />
                            ) : (
                              placeholderSvg()
                            )}
                            {item.category && (
                              <span
                                className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                                  CATEGORY_BADGE_COLORS[item.category] || 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.category}
                              </span>
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <p className="text-xs font-medium text-slate-700 leading-snug flex-1">{item.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">SKU: {item.sku}</p>
                            {(item.features || []).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {(item.features || []).slice(0, 2).map(f => (
                                  <span key={f} className="bg-slate-100 text-slate-500 text-[9px] font-medium px-1.5 py-0.5 rounded">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2 mb-3">
                              <p className="text-brand font-bold text-sm">{item.price}</p>
                              <span className="text-[9px] text-slate-400">FCFA</span>
                            </div>

                            {qty > 0 ? (
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => (qty === 1 ? onRemoveItem(item.sku) : onUpdateQty(item.sku, qty - 1))}
                                    className="w-8 h-8 text-slate-500 hover:bg-slate-100 cursor-pointer"
                                    aria-label={`Decrease ${item.name}`}
                                  >
                                    −
                                  </button>
                                  <span className="w-8 text-center text-sm font-semibold text-brand-dark tabular-nums">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => onUpdateQty(item.sku, qty + 1)}
                                    className="w-8 h-8 text-slate-500 hover:bg-slate-100 cursor-pointer"
                                    aria-label={`Increase ${item.name}`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => onRemoveItem(item.sku)}
                                  className="text-[10px] text-slate-400 hover:text-red-500 font-medium cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onAdd(item.sku)}
                                className="w-full text-xs font-semibold rounded-lg py-2 mb-2 transition cursor-pointer border border-brand text-brand hover:bg-brand hover:text-white"
                              >
                                Add to Cart
                              </button>
                            )}

                            <button
                              onClick={() => onAsk(item)}
                              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 transition cursor-pointer bg-brand-light text-brand hover:bg-brand hover:text-white"
                            >
                              {chatIcon()} Inquire in Chat
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {showServices && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-cyan inline-block" />
                    Our Services
                    <span className="text-xs font-semibold text-slate-400">({filteredServices.length})</span>
                  </h3>
                  {view === 'all' && (
                    <button
                      onClick={() => setView('services')}
                      className="text-xs font-semibold text-cyan hover:underline cursor-pointer"
                    >
                      View all services →
                    </button>
                  )}
                </div>

                {filteredServices.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-400">
                    No services match your filters.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(s => (
                      <div key={s.id ?? s.name} className="rounded-2xl overflow-hidden border border-slate-100 card-hover bg-white">
                        <div className="h-40 bg-gradient-to-br from-brand-dark to-blue-900 flex items-center justify-center relative overflow-hidden">
                          {s.image && !broken.has(s.id) ? (
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" onError={() => markBroken(s.id)} />
                          ) : (
                            <svg
                              width="46"
                              height="46"
                              viewBox="0 0 24 24"
                              fill="none"
                              dangerouslySetInnerHTML={{ __html: serviceIcons[SERVICE_ICON_BY_TAG[s.tag] ?? 0] }}
                            />
                          )}
                          {s.tag && (
                            <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest text-cyan bg-white/10 px-2 py-1 rounded">
                              {s.tag}
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <p className="font-semibold text-brand-dark">{s.name}</p>
                          {s.desc && <p className="text-sm text-slate-500 mt-1">{s.desc}</p>}
                          {(s.features || []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {(s.features || []).map(f => (
                                <span key={f} className="bg-brand-light text-brand text-[10px] font-semibold px-2 py-1 rounded">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 flex gap-2">
                            <a
                              href="#availability"
                              className="flex-1 text-center text-xs font-semibold rounded-lg py-2 transition cursor-pointer bg-brand text-white hover:bg-blue-600"
                            >
                              Request Service
                            </a>
                            <button
                              onClick={() => onAsk(s)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 transition cursor-pointer bg-brand-light text-brand hover:bg-brand hover:text-white"
                            >
                              {chatIcon()} Ask
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-slate-400 mt-8">
          Need help choosing equipment or a service?{' '}
          <button
            onClick={() => onAsk(null)}
            className="text-brand font-medium hover:underline cursor-pointer"
          >
            Start a direct chat with a technician →
          </button>{' '}
          or{' '}
          <a href={WHATSAPP_HELP_LINK} className="text-brand font-medium hover:underline">
            WhatsApp us
          </a>
          .
        </p>
      </div>
    </section>
  );
}