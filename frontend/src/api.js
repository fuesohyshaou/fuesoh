async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {};
  const token = localStorage.getItem('itisep_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body != null && !isFormData) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const res = await fetch('/api' + path, { method, headers, body });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  if (!res.ok) {
    const err = new Error((json && json.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export function genRequestId(prefix) {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${rand}`;
}

export const api = {
  getHealth: () => request('/health'),
  getAvailability: () => request('/availability'),
  getQuotes: () => request('/quotes'),
  getEquipment: () => request('/equipment'),
  getServices: () => request('/services'),

  getChatMessages: sessionId => request(`/chat?session=${encodeURIComponent(sessionId)}`),
  sendChatMessage: (sessionId, sender, message, meta = {}) =>
    request('/chat', {
      method: 'POST',
      body: { session_id: sessionId, sender, message, ...meta }
    }),
  getChatSessions: () => request('/chat/sessions'),

  createEquipment: data => request('/equipment', { method: 'POST', body: data }),
  updateEquipment: (id, data) => request(`/equipment/${id}`, { method: 'PUT', body: data }),
  deleteEquipment: id => request(`/equipment/${id}`, { method: 'DELETE' }),

  createService: data => request('/services', { method: 'POST', body: data }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: data }),
  deleteService: id => request(`/services/${id}`, { method: 'DELETE' }),

  submitAvailability: data => request('/availability', { method: 'POST', body: data }),
  submitQuote: data => request('/quote', { method: 'POST', body: data }),

  uploadImage: file => {
    const fd = new FormData();
    fd.append('image', file);
    return request('/upload', { method: 'POST', body: fd, isFormData: true });
  },

  getSettings: () => request('/settings'),
  updateSettings: data => request('/settings', { method: 'PUT', body: data }),

  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (identifier, password) => request('/auth/login', { method: 'POST', body: { identifier, password } }),
  me: token => request('/auth/me', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
  logout: token => request('/auth/logout', { method: 'POST', body: { token } }),

  getAdmins: () => request('/admin/admins'),
  createAdmin: (username, password) => request('/admin/admins', { method: 'POST', body: { username, password } }),

  getUsers: () => request('/user'),
  getNotifications: () => request('/admin/notifications'),
  testEmail: () => request('/admin/test-email', { method: 'POST' }),

  getTechnicians: () => request('/technicians'),
  getAdminTechnicians: () => request('/admin/technicians'),
  createTechnician: data => request('/admin/technicians', { method: 'POST', body: data }),
  updateTechnician: (id, data) => request(`/admin/technicians/${id}`, { method: 'PUT', body: data }),
  deleteTechnician: id => request(`/admin/technicians/${id}`, { method: 'DELETE' }),

  createBooking: data => request('/bookings', { method: 'POST', body: data }),
  getBookings: () => request('/bookings'),
  updateBooking: (id, data) => request(`/bookings/${id}`, { method: 'PUT', body: data }),
  deleteBooking: id => request(`/bookings/${id}`, { method: 'DELETE' }),
  getMyBookings: () => request('/bookings/me'),
  getBooking: id => request(`/bookings/${id}`),
  uploadBookingWork: (id, file, kind, caption) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('kind', kind);
    fd.append('caption', caption || '');
    return request(`/bookings/${id}/work`, { method: 'POST', body: fd, isFormData: true });
  }
};