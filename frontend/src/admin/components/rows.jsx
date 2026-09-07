export const titles = {
  availability: 'Availability Requests',
  quotes: 'Quote Requests',
  equipment: 'Equipment Marketplace',
  services: 'Services',
  bookings: 'Technician Bookings',
  technicians: 'Technicians',
  users: 'Registered Users',
  admins: 'Administrators'
};

export const headers = {
  availability: [
    ['request_id', 'ID'], ['name', 'Name'], ['phone', 'Contact'], ['city', 'Location'],
    ['service', 'Service'], ['created_at', 'Received']
  ],
  quotes: [
    ['request_id', 'ID'], ['name', 'Name'], ['company', 'Company'], ['phone', 'Contact'],
    ['location', 'Location'], ['created_at', 'Received']
  ],
  equipment: [
    ['image', 'Image'], ['name', 'Name'], ['price', 'Price'], ['sku', 'SKU'], ['created_at', 'Added']
  ],
  services: [
    ['image', 'Image'], ['name', 'Name'], ['description', 'Description'], ['tag', 'Tag'], ['created_at', 'Added']
  ],
  bookings: [
    ['booking_id', 'ID'], ['client_name', 'Client'], ['service', 'Service'], ['technician_name', 'Technician'],
    ['booking_date', 'Date'], ['time_slot', 'Time'], ['status', 'Status'], ['created_at', 'Received']
  ],
  technicians: [
    ['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['specialty', 'Specialty'], ['created_at', 'Added']
  ],
  users: [
    ['name', 'Name'], ['email', 'Email'], ['username', 'Username'], ['role', 'Role'], ['created_at', 'Joined']
  ],
  admins: [
    ['id', 'ID'], ['username', 'Username'], ['created_at', 'Created']
  ]
};

export function dateText(v) {
  try { return new Date(v).toLocaleString(); } catch (e) { return ''; }
}

function td(children, cls = 'px-5 py-3') {
  return <td className={cls}>{children}</td>;
}

function ActionsCell({ onEdit, onDelete }) {
  return (
    <td className="px-5 py-3">
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-xs font-semibold text-[#0B63CE] border border-[#0B63CE] hover:bg-[#0B63CE] hover:text-white rounded-lg px-3 py-1.5 cursor-pointer">Edit</button>
        <button onClick={onDelete} className="text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 cursor-pointer">Delete</button>
      </div>
    </td>
  );
}

function Thumb({ image }) {
  if (!image) return <span className="text-slate-300">—</span>;
  return <img src={image} onError={e => { e.currentTarget.style.display = 'none'; }} className="w-12 h-12 object-contain bg-slate-50 rounded-lg" alt="" />;
}

export function renderAvailabilityRow(r) {
  return (
    <tr className="hover:bg-slate-50">
      {td(<span className="font-mono text-xs text-[#0B63CE]">{r.request_id}</span>) }
      {td(<span className="font-medium text-slate-700">{r.name}</span>)}
      {td(<span className="text-slate-500">{r.phone}{r.email ? <><br /><span className="text-[11px]">{r.email}</span></> : null}</span>)}
      {td(<span className="text-slate-500">{r.city}{r.neighborhood ? <><br /><span className="text-[11px]">{r.neighborhood}</span></> : null}</span>)}
      {td(<span className="text-slate-500">{r.service}</span>)}
      {td(<span className="text-xs text-slate-400">{dateText(r.created_at)}</span>)}
    </tr>
  );
}

export function renderQuoteRow(r) {
  let items = [];
  try { items = JSON.parse(r.items || '[]'); } catch (e) { items = []; }
  return (
    <tr className="hover:bg-slate-50">
      {td(<span className="font-mono text-xs text-[#0B63CE]">{r.request_id}</span>)}
      {td(<span className="font-medium text-slate-700">{r.name}</span>)}
      {td(<span className="text-slate-500">{r.company}</span>)}
      {td(<span className="text-slate-500">{r.phone}{r.email ? <><br /><span className="text-[11px]">{r.email}</span></> : null}</span>)}
      {td(<span className="text-slate-500">{r.location}{items.length ? <><br /><span className="text-[11px] text-[#0B63CE]">{items.length} item(s)</span></> : null}</span>)}
      {td(<span className="text-xs text-slate-400">{dateText(r.created_at)}</span>)}
    </tr>
  );
}

export function renderEquipmentRow(r, onEdit, onDelete) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-3"><Thumb image={r.image} /></td>
      {td(<span className="font-medium text-slate-700">{r.name}</span>)}
      {td(<span className="text-slate-500">{r.price} FCFA</span>)}
      {td(<span className="text-slate-500 font-mono text-xs">{r.sku || '—'}</span>)}
      {td(<span className="text-xs text-slate-400">{dateText(r.created_at)}</span>)}
      <ActionsCell onEdit={onEdit} onDelete={onDelete} />
    </tr>
  );
}

export function renderServiceRow(r, onEdit, onDelete) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-3"><Thumb image={r.image} /></td>
      {td(<span className="font-medium text-slate-700">{r.name}</span>)}
      {td(<span className="text-slate-500">{r.description}</span>)}
      {td(<span className="text-[10px] font-bold tracking-widest text-[#00B8D9] bg-slate-100 px-2 py-1 rounded">{r.tag || ''}</span>)}
      {td(<span className="text-xs text-slate-400">{dateText(r.created_at)}</span>)}
      <ActionsCell onEdit={onEdit} onDelete={onDelete} />
    </tr>
  );
}

export function renderAdminRow(r) {
  return (
    <tr className="hover:bg-slate-50">
      {td(<span className="text-xs font-mono text-slate-400">{r.id}</span>)}
      {td(<span className="font-medium text-slate-700">{r.username}</span>)}
      {td(<span className="text-xs text-slate-400">{dateText(r.created_at)}</span>)}
    </tr>
  );
}

export function renderUserRow(r) {
  const isAdmin = r.role === 'admin';
  const name = r.name || r.username || '—';
  return (
    <tr className="hover:bg-slate-50">
      {td(
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isAdmin ? 'bg-[#0B63CE]' : 'bg-emerald-500'}`}>
            {(name.charAt(0) || '?').toUpperCase()}
          </div>
          <span className="font-medium text-slate-700">{name}</span>
        </div>
      )}
      {td(<span className="text-slate-500">{r.email || '—'}</span>)}
      {td(<span className="text-slate-500 font-mono text-xs">{r.username}</span>)}
      {td(
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-2 py-1 rounded ${
          isAdmin ? 'bg-[#EAF2FF] text-[#0B63CE]' : 'bg-emerald-50 text-emerald-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-[#0B63CE]' : 'bg-emerald-500'}`}></span>
          {r.role || 'user'}
        </span>
      )}
      {td(<span className="text-xs text-slate-400">{dateText(r.created_at)}</span>)}
    </tr>
  );
}

export const BOOKING_STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  confirmed: 'bg-[#EAF2FF] text-[#0B63CE] border-[#BBDCFE]',
  in_progress: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  cancelled: 'bg-red-50 text-red-500 border-red-200'
};

export const BOOKING_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export function StatusBadge({ status }) {
  const s = status || 'pending';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded-full border ${BOOKING_STATUS_STYLES[s] || BOOKING_STATUS_STYLES.pending}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {BOOKING_STATUS_LABELS[s] || s}
    </span>
  );
}

export function renderBookingRow(r, onEdit, onDelete) {
  return (
    <tr className="hover:bg-slate-50">
      {td(<span className="font-mono text-xs font-bold text-[#0B63CE]">{r.booking_id}</span>)}
      {td(
        <span className="text-slate-700">
          <span className="font-medium">{r.client_name}</span>
          <br /><span className="text-[11px] text-slate-400">{r.client_phone}</span>
        </span>
      )}
      {td(<span className="text-slate-500">{r.service || '—'}</span>)}
      {td(<span className="text-slate-500">{r.technician_name || <span className="text-slate-300">Not assigned</span>}</span>)}
      {td(<span className="text-slate-500">{r.booking_date || '—'}</span>)}
      {td(<span className="text-slate-500">{r.time_slot || '—'}</span>)}
      {td(<StatusBadge status={r.status} />)}
      {td(<span className="text-xs text-slate-400">{dateText(r.created_at)}</span>)}
      <ActionsCell onEdit={onEdit} onDelete={onDelete} />
    </tr>
  );
}

export function renderTechnicianRow(r, onEdit, onDelete) {
  const name = r.name || r.username || '—';
  return (
    <tr className="hover:bg-slate-50">
      {td(
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0B63CE] flex items-center justify-center text-xs font-bold text-white">
            {(name.charAt(0) || '?').toUpperCase()}
          </div>
          <span className="font-medium text-slate-700">{name}</span>
        </div>
      )}
      {td(<span className="text-slate-500">{r.phone || '—'}</span>)}
      {td(<span className="text-slate-500">{r.email || '—'}</span>)}
      {td(<span className="text-[10px] font-bold tracking-widest text-[#00B8D9] bg-slate-100 px-2 py-1 rounded">{r.specialty || 'General'}</span>)}
      {td(<span className="text-xs text-slate-400">{dateText(r.created_at)}</span>)}
      <ActionsCell onEdit={onEdit} onDelete={onDelete} />
    </tr>
  );
}
