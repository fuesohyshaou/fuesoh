import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';
import { getCollection } from '../store.js';
import Modal from './components/Modal.jsx';
import AdminModal from './components/AdminModal.jsx';
import BookingModal from './components/BookingModal.jsx';
import TechnicianModal from './components/TechnicianModal.jsx';
import Stats from './components/Stats.jsx';
import ChatAdmin from './components/ChatAdmin.jsx';
import HomeSettings from './components/HomeSettings.jsx';
import NotifySettings from './components/NotifySettings.jsx';
import {
  headers,
  titles,
  renderAvailabilityRow,
  renderQuoteRow,
  renderEquipmentRow,
  renderServiceRow,
  renderAdminRow,
  renderUserRow,
  renderBookingRow,
  renderTechnicianRow
} from './components/rows.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Icon path="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /> },
  { id: 'availability', label: 'Availability Checks', icon: <Icon path="M9 3v2M15 3v2M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4 9 2 2 4-4" /> },
  { id: 'quotes', label: 'Quote Requests', icon: <Icon path="M4 2h16v16l-8 5-3-2-1 2-4-2zM8 7h8M8 11h8M8 15h5" /> },
  { id: 'equipment', label: 'Equipment', icon: <Icon path="M6 6h12v12H6zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /> },
  { id: 'services', label: 'Services', icon: <Icon path="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4L15 12l-3-3z" /> },
  { id: 'bookings', label: 'Bookings', icon: <Icon path="M8 2v3M16 2v3M3 8h18M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM12 12h.01M16 12h.01M8 12h.01" /> },
  { id: 'technicians', label: 'Technicians', icon: <Icon path="M10.3 3.9a3 3 0 1 1-3.6 3.6 3 3 0 0 1 3.6-3.6zM5 21v-8h4M15 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM15 12v9M19 15h2M9 15h2" /> },
  { id: 'chats', label: 'Chat Inquiries', icon: <Icon path="M21 12a8 8 0 0 1-8 8H5l-2 2V5a4 4 0 0 1 4-4h6a8 8 0 0 1 8 11zM8 9h8M8 13h5" /> },
  { id: 'users', label: 'Users', icon: <Icon path="M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /> },
  { id: 'admins', label: 'Administrators', icon: <Icon path="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6zM9 12l2 2 4-4" /> },
  { id: 'home', label: 'Home Page', icon: <Icon path="M3 11 12 3l9 8M5 9v11h14V9M9 20v-6h6v6" /> },
  { id: 'mail', label: 'Mail Settings', icon: <Icon path="M3 5h18v14H3zM3 6l9 6 9-6" /> }
];

const OVERVIEW_TILES = [
  { id: 'availability', label: 'Availability checks', color: '#0B63CE', bg: '#EAF2FF' },
  { id: 'quotes', label: 'Quote requests', color: '#00B8D9', bg: '#E0FAFF' },
  { id: 'equipment', label: 'Equipment items', color: '#169B62', bg: '#E7F8F0' },
  { id: 'services', label: 'Services', color: '#8B5CF6', bg: '#F3EEFF' },
  { id: 'chats', label: 'Chat inquiries', color: '#F59E0B', bg: '#FFF6E6' },
  { id: 'bookings', label: 'Technician bookings', color: '#EF4444', bg: '#FEF2F2' },
  { id: 'users', label: 'Registered users', color: '#14B8A6', bg: '#E6FAF8' },
  { id: 'admins', label: 'Administrators', color: '#0B63CE', bg: '#EAF2FF' }
];

function Icon({ path }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function App() {
  const { user, ready, signOut } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({ availability: [], quotes: [], equipment: [], services: [], users: [], admins: [], bookings: [], technicians: [] });
  const [modal, setModal] = useState(null);
  const [serverOk, setServerOk] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [availability, quotes, equipment, services, admins, users, bookings, technicians] = await Promise.all([
        api.getAvailability(),
        api.getQuotes(),
        api.getEquipment(),
        api.getServices(),
        api.getAdmins(),
        api.getUsers(),
        api.getBookings(),
        api.getAdminTechnicians()
      ]);
      setData({ availability, quotes, equipment, services, admins, users, bookings, technicians });
      setServerOk(true);
    } catch {
      setData({
        availability: getCollection('availability'),
        quotes: getCollection('quotes'),
        equipment: getCollection('equipment'),
        services: getCollection('services'),
        admins: [],
        users: [],
        bookings: [],
        technicians: []
      });
      setServerOk(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    loadAll();
    const onStorage = e => {
      if (e.key === null) loadAll();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadAll, ready]);

  useEffect(() => {
    setMobileOpen(false);
  }, [tab]);

  if (ready && (!user || user.role !== 'admin')) {
    window.location.href = 'login.html';
    return null;
  }

  async function handleDelete(kind, row) {
    const label = kind === 'bookings' ? `booking ${row.booking_id}` : (kind === 'technicians' ? `technician "${row.name}"` : `"${row.name}"`);
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    try {
      if (kind === 'equipment') await api.deleteEquipment(row.id);
      else if (kind === 'services') await api.deleteService(row.id);
      else if (kind === 'bookings') await api.deleteBooking(row.id);
      else if (kind === 'technicians') await api.deleteTechnician(row.id);
      loadAll();
    } catch (err) {
      window.alert('Delete failed: ' + (err.message || 'unknown error'));
    }
  }

  const list = data[tab];
  const isEditable = tab === 'equipment' || tab === 'services' || tab === 'admins' || tab === 'technicians';
  const isActionable = tab === 'equipment' || tab === 'services' || tab === 'bookings' || tab === 'technicians';

  const displayName = user?.name || user?.email || 'Admin';
  const displayEmail = user?.email || user?.user_name || '';

  function handleSignOut() {
    signOut();
    window.location.href = 'login.html';
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 lg:flex" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <Sidebar
        user={user}
        displayName={displayName}
        displayEmail={displayEmail}
        tab={tab}
        setTab={setTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-[#071A2F] text-white px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p className="font-bold">IT-ISEP <span className="text-[#00B8D9]">LTD</span> Admin</p>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${serverOk === false ? 'text-red-300' : 'text-slate-300'}`}
              title={serverOk === false ? 'The API server is not reachable.' : 'The API server is reachable.'}
            >
              <span className={`w-2 h-2 rounded-full ${serverOk === false ? 'bg-red-400' : serverOk === true ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
              {serverOk === false ? 'Offline' : serverOk === true ? 'Online' : '…'}
            </span>
          </div>
        </div>

        {/* Desktop header */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between">
          <p className="text-xl font-extrabold text-[#071A2F]">{titles[tab] || TABS.find(t => t.id === tab)?.label}</p>
          <div className="flex items-center gap-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${
                serverOk === false ? 'text-red-500' : 'text-slate-500'
              }`}
              title={serverOk === false ? 'The API server is not reachable. Uploads and saves will fail.' : 'The API server is reachable.'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOk === false ? 'bg-red-400' : serverOk === true ? 'bg-emerald-400' : 'bg-slate-400'
                }`}
              ></span>
              {serverOk === false ? 'Server offline' : serverOk === true ? 'Connected to server' : 'Checking…'}
            </span>
            <a href="index.html" className="text-sm text-[#0B63CE] hover:underline">← Back to website</a>
          </div>
        </header>

        {serverOk === false && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div className="text-sm text-red-700">
              <p className="font-semibold">The backend server is not reachable.</p>
              <p className="text-red-600 text-xs mt-0.5">
                Uploads, saving changes and email notifications require the API server. Start it with{' '}
                <code className="bg-red-100 px-1 rounded">npm run server</code>. You are currently viewing offline data.
              </p>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 lg:px-8 py-6">
          {tab === 'chats' ? (
            <ChatAdmin />
          ) : tab === 'home' ? (
            <HomeSettings />
          ) : tab === 'mail' ? (
            <NotifySettings />
          ) : tab === 'dashboard' ? (
            <Overview data={data} setTab={setTab} />
          ) : (
            <>
              <Stats data={data} />

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-[#071A2F]">{titles[tab]}</h2>
                  <div className="flex items-center gap-3">
                    {isEditable && (
                      <button
                        onClick={() => setModal({ kind: tab, row: null })}
                        className="text-sm bg-[#0B63CE] hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        {tab === 'admins' ? '+ Add Administrator' : tab === 'technicians' ? '+ Add Technician' : '+ Add new'}
                      </button>
                    )}
                    <button onClick={loadAll} className="text-sm text-[#0B63CE] font-semibold hover:underline cursor-pointer">Refresh</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {list.length === 0 ? (
                    <div className="text-center text-slate-400 py-16 text-sm">
                      {tab === 'admins' ? 'No administrators yet.' : tab === 'users' ? 'No users registered yet.' : 'No requests yet.'}
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          {headers[tab].map(([k, label]) => (
                            <th key={k} className="px-5 py-3">{label}</th>
                          ))}
                          {isActionable && <th className="px-5 py-3">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {list.map(row => (
                          <TableRow
                            key={row.id}
                            tab={tab}
                            row={row}
                            onEdit={() => setModal({ kind: tab, row })}
                            onDelete={() => handleDelete(tab, row)}
                          />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {modal && (modal.kind === 'admins' ? (
        <AdminModal
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); loadAll(); }}
        />
      ) : modal.kind === 'bookings' ? (
        <BookingModal
          row={modal.row}
          technicians={data.technicians}
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); loadAll(); }}
        />
      ) : modal.kind === 'technicians' ? (
        <TechnicianModal
          row={modal.row}
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); loadAll(); }}
        />
      ) : (
        <Modal
          kind={modal.kind}
          row={modal.row}
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); loadAll(); }}
        />
      ))}
    </div>
  );
}

function Sidebar({ user, displayName, displayEmail, tab, setTab, mobileOpen, onCloseMobile, onSignOut }) {
  const avatarChar = (displayName.charAt(0) || 'I').toUpperCase();
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onCloseMobile}></div>
      )}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-full lg:h-screen w-72 shrink-0 bg-[#071A2F] text-white flex flex-col transition-transform duration-200 lg:transition-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-[#0B63CE] flex items-center justify-center font-extrabold text-sm">I</div>
          <div className="min-w-0">
            <p className="font-bold leading-tight">IT-ISEP <span className="text-[#00B8D9]">LTD</span></p>
            <p className="text-[11px] text-slate-400 -mt-0.5">Admin Dashboard</p>
          </div>
          <button onClick={onCloseMobile} className="ml-auto lg:hidden p-1.5 hover:bg-white/10 rounded-lg cursor-pointer" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                tab === t.id ? 'bg-[#0B63CE] text-white shadow' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={tab === t.id ? 'text-white' : 'text-slate-400'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#0B63CE] flex items-center justify-center font-bold text-sm">{avatarChar}</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#071A2F]" title="Online"></span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Admin · online
              </span>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-300 hover:bg-red-500/10 hover:text-red-200 border border-white/10 rounded-lg px-3 py-2 transition cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
          <a href="index.html" className="mt-2 block text-center text-[11px] text-slate-500 hover:text-slate-300 transition">← Back to website</a>
        </div>
      </aside>
    </>
  );
}

function Overview({ data, setTab }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#071A2F]">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Everything that arrives from the website, in one place.</p>
      </div>

      <Stats data={data} />

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {OVERVIEW_TILES.filter(t => t.id !== 'admins' || true).map(t => {
          const count = Array.isArray(data[t.id]) ? data[t.id].length : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="bg-white rounded-xl p-5 shadow-sm text-left hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-[#071A2F]">{count}</span>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.bg, color: t.color }}>
                  {TABS.find(x => x.id === t.id)?.icon}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">{t.label}</p>
              <p className="text-[11px] font-semibold mt-1.5" style={{ color: t.color }}>Open →</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TableRow({ tab, row, onEdit, onDelete }) {
  if (tab === 'availability') return <>{renderAvailabilityRow(row)}</>;
  if (tab === 'quotes') return <>{renderQuoteRow(row)}</>;
  if (tab === 'equipment') return <>{renderEquipmentRow(row, onEdit, onDelete)}</>;
  if (tab === 'bookings') return <>{renderBookingRow(row, onEdit, onDelete)}</>;
  if (tab === 'technicians') return <>{renderTechnicianRow(row, onEdit, onDelete)}</>;
  if (tab === 'users') return <>{renderUserRow(row)}</>;
  if (tab === 'admins') return <>{renderAdminRow(row)}</>;
  return <>{renderServiceRow(row, onEdit, onDelete)}</>;
}