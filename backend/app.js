import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import db from './db.js';
import {
  sendNotice,
  getNotifyConfig,
  buildAvailabilityEmail,
  buildQuoteEmail,
  buildChatEmail,
  buildRegistrationEmail,
  buildBookingEmail
} from './mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads');
const CLIENT_DIST = path.join(ROOT, 'frontend', 'dist');
const DIST_INDEX = path.join(CLIENT_DIST, 'index.html');
const BOOTSTRAP_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const BOOTSTRAP_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(String(password), salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function bootstrapAdmin() {
  const count = await db.get('SELECT COUNT(*) AS n FROM users');
  if ((count?.n ?? 0) > 0) return;
  try {
    await db.run(
      'INSERT INTO users (username, password_hash, role, token, created_at) VALUES (?,?,?,?,?)',
      [
        BOOTSTRAP_ADMIN_USERNAME,
        await hashPassword(BOOTSTRAP_ADMIN_PASSWORD),
        'admin',
        crypto.randomBytes(24).toString('hex'),
        new Date().toISOString()
      ]
    );
    console.log(`[auth] First-time setup: created default administrator "${BOOTSTRAP_ADMIN_USERNAME}". Add more administrators from the Admin Dashboard.`);
  } catch (err) {
    console.error('[auth] Failed to create default administrator:', err.message);
  }
}

let seedData = { shopItems: [], services: [] };
try {
  const seedPath = path.join(ROOT, 'frontend', 'src', 'data.js').replace(/\\/g, '/');
  seedData = await import(`file:///${seedPath}`);
} catch {
  // data file may not be present in serverless
}

async function seedIfEmpty() {
  if (!Array.isArray(seedData.shopItems) && !Array.isArray(seedData.services)) return;
  const now = new Date().toISOString();
  const eq = await db.get('SELECT COUNT(*) AS n FROM equipment');
  if ((eq?.n ?? 0) === 0 && Array.isArray(seedData.shopItems)) {
    for (const it of seedData.shopItems) {
      await db.run('INSERT INTO equipment (name, price, sku, image, created_at) VALUES (?,?,?,?,?)',
        [it.name, it.price, it.sku || null, null, now]);
    }
  }
  const sv = await db.get('SELECT COUNT(*) AS n FROM services');
  if ((sv?.n ?? 0) === 0 && Array.isArray(seedData.services)) {
    for (const s of seedData.services) {
      await db.run('INSERT INTO services (name, description, tag, image, created_at) VALUES (?,?,?,?,?)',
        [s.name, s.desc, s.tag, null, now]);
    }
  }
}

try {
  await db.init();
  await seedIfEmpty();
  await bootstrapAdmin();
} catch (err) {
  console.error('DB init/seeding failed:', err.message);
}

function genId(prefix) {
  const year = new Date().getFullYear();
  const rand = crypto.randomInt(100000, 999999);
  return `${prefix}-${year}-${rand}`;
}

function str(v) {
  return v === undefined || v === null ? null : String(v);
}

function required(v, field) {
  const s = str(v).trim();
  if (!s) throw new Error(`${field} is required`);
  return s;
}

function parseToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return req.query.token || null;
}

async function requireAdmin(req, res, next) {
  try {
    const token = parseToken(req);
    if (!token) return res.status(401).json({ ok: false, error: 'Admin login required' });
    const user = await db.get(
      "SELECT id, username, role FROM users WHERE token=? AND role='admin'",
      [token]
    );
    if (!user) return res.status(401).json({ ok: false, error: 'Admin login required' });
    req.admin = user;
    next();
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

function requireRole(role) {
  return async (req, res, next) => {
    try {
      const token = parseToken(req);
      if (!token) return res.status(401).json({ ok: false, error: 'Login required' });
      const user = await db.get(
        'SELECT id, name, email, username, role FROM users WHERE token=? AND role=?',
        [token, role]
      );
      if (!user) return res.status(401).json({ ok: false, error: 'You need a ' + role + ' account to do this' });
      req.user = user;
      next();
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  };
}

const requireTechnician = requireRole('technician');

async function authorizedBookingUser(req) {
  const token = parseToken(req);
  if (!token) return null;
  const user = await db.get(
    'SELECT id, name, email, username, role FROM users WHERE token=? AND role IN (' + "'admin','technician'" + ')',
    [token]
  );
  return user || null;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/favicon.ico', (req, res) => res.status(204).end());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype);
    if (ok) return cb(null, true);
    cb(new Error('Only image files are allowed (png, jpg, webp, gif)'));
  }
});

app.post('/api/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, async err => {
    if (err) {
      const msg = err instanceof multer.MulterError
        ? (err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 4 MB)' : 'Upload failed')
        : err.message;
      return res.status(400).json({ ok: false, error: msg });
    }
    if (!req.file) return res.status(400).json({ ok: false, error: 'No image file provided' });
    try {
      const ext = (path.extname(req.file.originalname) || '.png').toLowerCase();
      const filename = `img-${Date.now()}-${crypto.randomInt(1000, 9999)}${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer);
      return res.status(201).json({ ok: true, url: `/uploads/${filename}` });
    } catch (e) {
      return res.status(500).json({ ok: false, error: 'Upload failed: ' + e.message });
    }
  });
});

app.use('/uploads', express.static(UPLOAD_DIR));

app.post('/api/availability', async (req, res) => {
  try {
    const b = req.body || {};
    const request_id = str(b.request_id) || genId('ITISEP');
    const name = required(b.name, 'name');
    const phone = required(b.phone, 'phone');
    await db.run(
      'INSERT INTO availability_requests (request_id, name, phone, email, city, neighborhood, address, service, contact_method, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [request_id, name, phone, str(b.email), str(b.city), str(b.neighborhood), str(b.address), str(b.service), str(b.contact_method), new Date().toISOString()]
    );
    const { title, text, html } = buildAvailabilityEmail({
      request_id, name, phone, email: b.email, city: b.city,
      neighborhood: b.neighborhood, address: b.address,
      service: b.service, contact_method: b.contact_method
    });
    sendNotice({ subject: title, text, html }).catch(() => {});
    res.status(201).json({ ok: true, request_id });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.post('/api/quote', async (req, res) => {
  try {
    const b = req.body || {};
    const request_id = str(b.request_id) || genId('QUOTE');
    const items = b.items;
    const itemsJson = typeof items === 'string' ? items : JSON.stringify(Array.isArray(items) ? items : []);
    const name = required(b.name, 'name');
    const phone = required(b.phone, 'phone');
    await db.run(
      'INSERT INTO quote_requests (request_id, name, company, phone, email, location, notes, items, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [request_id, name, str(b.company), phone, str(b.email), str(b.location), str(b.notes), itemsJson, new Date().toISOString()]
    );
    const { title, text, html } = buildQuoteEmail({
      request_id, name, company: b.company, phone, email: b.email,
      location: b.location, notes: b.notes
    }, Array.isArray(items) ? items : []);
    sendNotice({ subject: title, text, html }).catch(() => {});
    res.status(201).json({ ok: true, request_id });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get('/api/availability', requireAdmin, async (req, res) => {
  res.json(await db.all('SELECT * FROM availability_requests ORDER BY id DESC'));
});
app.get('/api/quotes', requireAdmin, async (req, res) => {
  res.json(await db.all('SELECT * FROM quote_requests ORDER BY id DESC'));
});

app.get('/api/health', async (req, res) => {
  try {
    await db.get('SELECT 1 AS ok');
    res.json({ ok: true, uptime: process.uptime(), db: 'mysql' });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.get('/api/equipment', async (req, res) => {
  res.json(await db.all('SELECT * FROM equipment ORDER BY id DESC'));
});

app.post('/api/equipment', requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    await db.run(
      'INSERT INTO equipment (name, price, sku, image, created_at) VALUES (?,?,?,?,?)',
      [required(b.name, 'name'), required(b.price, 'price'), str(b.sku), str(b.image), new Date().toISOString()]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.put('/api/equipment/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!(await db.get('SELECT id FROM equipment WHERE id=?', [id]))) {
      return res.status(404).json({ ok: false, error: 'Equipment not found' });
    }
    const b = req.body || {};
    await db.run(
      'UPDATE equipment SET name=?, price=?, sku=?, image=? WHERE id=?',
      [required(b.name, 'name'), required(b.price, 'price'), str(b.sku), str(b.image), id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.delete('/api/equipment/:id', requireAdmin, async (req, res) => {
  await db.run('DELETE FROM equipment WHERE id=?', [Number(req.params.id)]);
  res.json({ ok: true });
});

app.get('/api/services', async (req, res) => {
  res.json(await db.all('SELECT * FROM services ORDER BY id DESC'));
});

app.post('/api/services', requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    await db.run(
      'INSERT INTO services (name, description, tag, image, created_at) VALUES (?,?,?,?,?)',
      [required(b.name, 'name'), str(b.description), str(b.tag), str(b.image), new Date().toISOString()]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.put('/api/services/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!(await db.get('SELECT id FROM services WHERE id=?', [id]))) {
      return res.status(404).json({ ok: false, error: 'Service not found' });
    }
    const b = req.body || {};
    await db.run(
      'UPDATE services SET name=?, description=?, tag=?, image=? WHERE id=?',
      [required(b.name, 'name'), str(b.description), str(b.tag), str(b.image), id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.delete('/api/services/:id', requireAdmin, async (req, res) => {
  await db.run('DELETE FROM services WHERE id=?', [Number(req.params.id)]);
  res.json({ ok: true });
});

app.get('/api/settings', async (req, res) => {
  const rows = await db.all('SELECT `key`, `value` FROM settings');
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json(settings);
});

app.put('/api/settings', requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    for (const [key, value] of Object.entries(b)) {
      await db.run(
        'INSERT INTO settings (`key`, `value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)',
        [key, str(value)]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get('/api/admin/admins', requireAdmin, async (req, res) => {
  const rows = await db.all(
    "SELECT id, username, role, created_at FROM users WHERE role='admin' ORDER BY id ASC"
  );
  res.json(rows);
});

app.post('/api/admin/admins', requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const username = required(b.username, 'username').trim();
    const password = String(b.password || '');
    if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
      return res.status(400).json({ ok: false, error: 'Username must be 3-32 characters using letters, numbers, . _ -' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }
    const existing = await db.get('SELECT id FROM users WHERE username=?', [username]);
    if (existing) {
      return res.status(409).json({ ok: false, error: 'That username is already taken' });
    }
    await db.run(
      'INSERT INTO users (username, password_hash, role, token, created_at) VALUES (?,?,?,?,?)',
      [username, await hashPassword(password), 'admin', crypto.randomBytes(24).toString('hex'), new Date().toISOString()]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get('/api/technicians', async (req, res) => {
  const rows = await db.all(
    "SELECT id, name, email, phone, specialty, created_at FROM users WHERE role='technician' ORDER BY name ASC"
  );
  res.json(rows);
});

app.get('/api/admin/technicians', requireAdmin, async (req, res) => {
  const rows = await db.all(
    "SELECT id, name, email, phone, specialty, username, created_at FROM users WHERE role='technician' ORDER BY id ASC"
  );
  res.json(rows);
});

app.post('/api/admin/technicians', requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const name = required(b.name, 'name').trim();
    const password = String(b.password || '');
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }
    const email = String(b.email || '').trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address' });
    }
    if (email && (await db.get('SELECT id FROM users WHERE email=?', [email]))) {
      return res.status(409).json({ ok: false, error: 'A user with that email already exists' });
    }
    const username = b.username && String(b.username).trim()
      ? String(b.username).trim()
      : await uniqueUsername(name.includes(' ') ? name : 'tech_' + name);
    if (await db.get('SELECT id FROM users WHERE username=?', [username])) {
      return res.status(409).json({ ok: false, error: 'That username is already taken' });
    }
    await db.run(
      "INSERT INTO users (name, email, phone, specialty, username, password_hash, role, token, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
      [name, email || null, str(b.phone), str(b.specialty), username, await hashPassword(password), 'technician', crypto.randomBytes(24).toString('hex'), new Date().toISOString()]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.put('/api/admin/technicians/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!(await db.get('SELECT id FROM users WHERE id=? AND role=' + "'technician'", [id]))) {
      return res.status(404).json({ ok: false, error: 'Technician not found' });
    }
    const b = req.body || {};
    const name = required(b.name, 'name').trim();
    const email = String(b.email || '').trim().toLowerCase() || null;
    if (email && (await db.get('SELECT id FROM users WHERE email=? AND id<>?', [email, id]))) {
      return res.status(409).json({ ok: false, error: 'A user with that email already exists' });
    }
    if (b.password && String(b.password).length > 0 && String(b.password).length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }
    const hash = b.password ? await hashPassword(b.password) : null;
    await db.run(
      'UPDATE users SET name=?, email=?, phone=?, specialty=? WHERE id=?',
      [name, email, str(b.phone), str(b.specialty), id]
    );
    if (hash) await db.run('UPDATE users SET password_hash=? WHERE id=?', [hash, id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.delete('/api/admin/technicians/:id', requireAdmin, async (req, res) => {
  await db.run('DELETE FROM bookings WHERE technician_id=?', [Number(req.params.id)]);
  await db.run('DELETE FROM users WHERE id=? AND role=' + "'technician'", [Number(req.params.id)]);
  res.json({ ok: true });
});

app.post('/api/bookings', async (req, res) => {
  try {
    const b = req.body || {};
    const booking_id = str(b.booking_id) || genId('BK');
    let technician_name = null;
    if (b.technician_id) {
      const tech = await db.get('SELECT name FROM users WHERE id=? AND role=' + "'technician'", [Number(b.technician_id)]);
      technician_name = tech ? tech.name : null;
    }
    await db.run(
      'INSERT INTO bookings (booking_id, client_name, client_phone, client_email, service, technician_id, technician_name, booking_date, time_slot, address, city, neighborhood, lat, lng, notes, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [booking_id, required(b.client_name, 'client_name'), required(b.client_phone, 'client_phone'), str(b.client_email), str(b.service), b.technician_id ? Number(b.technician_id) : null, technician_name, str(b.booking_date), str(b.time_slot), str(b.address), str(b.city), str(b.neighborhood), str(b.lat), str(b.lng), str(b.notes), 'pending', new Date().toISOString()]
    );
    const { title, text, html } = buildBookingEmail({
      booking_id, client_name: b.client_name, client_phone: b.client_phone, client_email: b.client_email,
      service: b.service, technician_name, booking_date: b.booking_date, time_slot: b.time_slot,
      address: b.address, city: b.city, neighborhood: b.neighborhood, notes: b.notes
    });
    sendNotice({ subject: title, text, html }).catch(() => {});
    res.status(201).json({ ok: true, booking_id });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get('/api/bookings', requireAdmin, async (req, res) => {
  res.json(await db.all('SELECT * FROM bookings ORDER BY id DESC'));
});

app.get('/api/bookings/me', requireTechnician, async (req, res) => {
  const rows = await db.all('SELECT * FROM bookings WHERE technician_id=? ORDER BY id DESC', [req.user.id]);
  res.json(rows);
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const booking = await db.get('SELECT * FROM bookings WHERE id=?', [id]);
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
    const user = await authorizedBookingUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (user.role === 'technician' && booking.technician_id !== user.id) {
      return res.status(401).json({ ok: false, error: 'Not your booking' });
    }
    const work = await db.all('SELECT * FROM booking_work WHERE booking_id=? ORDER BY id ASC', [booking.booking_id]);
    res.json({ ...booking, work });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await db.get('SELECT * FROM bookings WHERE id=?', [id]);
    if (!existing) return res.status(404).json({ ok: false, error: 'Booking not found' });
    const user = await authorizedBookingUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Login required' });
    const b = req.body || {};

    if (user.role === 'technician') {
      if (existing.technician_id !== user.id) return res.status(401).json({ ok: false, error: 'Not your booking' });
      await db.run('UPDATE bookings SET status=? WHERE id=?', [str(b.status) || existing.status, id]);
      return res.json({ ok: true });
    }

    let technician_id = existing.technician_id;
    let technician_name = existing.technician_name;
    if (b.technician_id !== undefined && b.technician_id !== null && b.technician_id !== '') {
      technician_id = Number(b.technician_id);
      const tech = await db.get('SELECT name FROM users WHERE id=? AND role=' + "'technician'", [technician_id]);
      technician_name = tech ? tech.name : null;
    } else if (b.technician_id === null || b.technician_id === '') {
      technician_id = null;
      technician_name = null;
    }
    await db.run(
      'UPDATE bookings SET technician_id=?, technician_name=?, status=?, service=?, booking_date=?, time_slot=?, address=?, city=?, neighborhood=?, notes=? WHERE id=?',
      [technician_id, technician_name, str(b.status) || existing.status, str(b.service) ?? existing.service, str(b.booking_date) ?? existing.booking_date, str(b.time_slot) ?? existing.time_slot, str(b.address) ?? existing.address, str(b.city) ?? existing.city, str(b.neighborhood) ?? existing.neighborhood, str(b.notes) ?? existing.notes, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.post('/api/bookings/:id/work', requireTechnician, (req, res) => {
  upload.fields([{ name: 'image', maxCount: 1 }])(req, res, async err => {
    if (err) return res.status(400).json({ ok: false, error: err.message });
    if (!req.files || !req.files.image) return res.status(400).json({ ok: false, error: 'No image file provided' });
    try {
      const booking = await db.get('SELECT * FROM bookings WHERE id=?', [Number(req.params.id)]);
      if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
      if (booking.technician_id !== req.user.id) return res.status(401).json({ ok: false, error: 'Not your booking' });
      const file = req.files.image[0];
      const ext = (path.extname(file.originalname) || '.png').toLowerCase();
      const filename = `work-${Date.now()}-${crypto.randomInt(1000, 9999)}${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);
      const kind = req.body.kind === 'final' ? 'final' : 'site';
      await db.run(
        'INSERT INTO booking_work (booking_id, kind, image, caption, created_at) VALUES (?,?,?,?,?)',
        [booking.booking_id, kind, `/uploads/${filename}`, str(req.body.caption), new Date().toISOString()]
      );
      res.status(201).json({ ok: true, url: `/uploads/${filename}` });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });
});

app.delete('/api/bookings/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const booking = await db.get('SELECT booking_id FROM bookings WHERE id=?', [id]);
  if (booking) {
    await db.run('DELETE FROM booking_work WHERE booking_id=?', [booking.booking_id]);
    await db.run('DELETE FROM bookings WHERE id=?', [id]);
  }
  res.json({ ok: true });
});

app.get('/api/bookings/:id/work', async (req, res) => {
  try {
    const booking = await db.get('SELECT * FROM bookings WHERE id=?', [Number(req.params.id)]);
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
    const user = await authorizedBookingUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (user.role === 'technician' && booking.technician_id !== user.id) {
      return res.status(401).json({ ok: false, error: 'Not your booking' });
    }
    const work = await db.all('SELECT * FROM booking_work WHERE booking_id=? ORDER BY id ASC', [booking.booking_id]);
    res.json(work);
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get(['/user', '/api/user'], requireAdmin, async (req, res) => {
  try {
    const rows = await db.all(
      'SELECT id, name, email, username, role, created_at FROM users ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get(['/user/:id', '/api/user/:id'], async (req, res) => {
  try {
    const row = await db.get(
      'SELECT id, name, email, username, role, created_at FROM users WHERE id=?',
      [Number(req.params.id)]
    );
    if (!row) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json(row);
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

async function uniqueUsername(base) {
  const sanitized = String(base || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 24) || 'user';
  if (sanitized.length < 3) return await uniqueUsername('user' + sanitized);
  if (!(await db.get('SELECT id FROM users WHERE username=?', [sanitized]))) return sanitized;
  for (let i = 0; i < 20; i++) {
    const candidate = `${sanitized}_${crypto.randomInt(10, 99)}`;
    if (!(await db.get('SELECT id FROM users WHERE username=?', [candidate]))) return candidate;
  }
  return `${sanitized}_${Date.now().toString().slice(-6)}`;
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const b = req.body || {};
    const name = required(b.name, 'name').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const password = String(b.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }
    const existing = await db.get('SELECT id FROM users WHERE email=?', [email]);
    if (existing) {
      return res.status(409).json({ ok: false, error: 'An account with that email already exists' });
    }
    const username = await uniqueUsername(email.split('@')[0]);
    const token = crypto.randomBytes(24).toString('hex');
    await db.run(
      "INSERT INTO users (name, email, username, password_hash, role, token, created_at) VALUES (?,?,?,?,?,?,?)",
      [name, email, username, await hashPassword(password), 'user', token, new Date().toISOString()]
    );
    const { title, text, html } = buildRegistrationEmail({ name, email, username, created_at: new Date().toISOString() });
    sendNotice({ subject: title, text, html }).catch(() => {});
    res.status(201).json({ ok: true, token, user: { name, email, role: 'user' } });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

async function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored || '').split(':');
    if (!salt || !hash) return false;
    const derivedKey = await scrypt(String(password), salt, 64);
    const a = Buffer.from(derivedKey);
    const b = Buffer.from(hash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const b = req.body || {};
    const identifier = String(b.identifier || b.email || b.username || '').trim();
    const password = String(b.password || '');
    if (!identifier || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }
    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await db.get('SELECT * FROM users WHERE email=?', [identifier.toLowerCase()])
      : await db.get('SELECT * FROM users WHERE username=?', [identifier]);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ ok: false, error: 'Incorrect email or password' });
    }
    const token = crypto.randomBytes(24).toString('hex');
    await db.run('UPDATE users SET token=? WHERE id=?', [token, user.id]);
    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name || user.username,
        email: user.email || user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.query.token || '');
    if (!token) return res.status(401).json({ ok: false, error: 'Not authenticated' });
    const user = await db.get('SELECT id, name, email, username, role FROM users WHERE token=?', [token]);
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid session' });
    res.json({ ok: true, user: { ...user, name: user.name || user.username, email: user.email || user.username } });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.body && req.body.token) || '';
    if (token) await db.run('UPDATE users SET token=NULL WHERE token=?', [token]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get('/api/chat', async (req, res) => {
  const sessionId = str(req.query.session);
  if (!sessionId) return res.status(400).json({ ok: false, error: 'session is required' });
  const messages = await db.all(
    'SELECT * FROM chat_messages WHERE session_id=? ORDER BY id ASC',
    [sessionId]
  );
  res.json(messages);
});

app.post('/api/chat', async (req, res) => {
  try {
    const b = req.body || {};
    const session_id = required(b.session_id, 'session_id');
    const sender = required(b.sender, 'sender') === 'agent' ? 'agent' : 'customer';
    const message = required(b.message, 'message');
    const created_at = new Date().toISOString();
    await db.run(
      'INSERT INTO chat_messages (session_id, sender, message, product_sku, product_name, created_at) VALUES (?,?,?,?,?,?)',
      [session_id, sender, message, str(b.product_sku), str(b.product_name), created_at]
    );
    const row = await db.get(
      'SELECT * FROM chat_messages WHERE session_id=? AND created_at=? ORDER BY id DESC LIMIT 1',
      [session_id, created_at]
    );
    if (sender === 'customer') {
      const { title, text, html } = buildChatEmail(session_id, message, b.product_name);
      sendNotice({ subject: title, text, html }).catch(() => {});
    }
    res.status(201).json({ ok: true, message: row });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.get('/api/chat/sessions', requireAdmin, async (req, res) => {
  const rows = await db.all(
    `SELECT session_id,
            COUNT(*) AS message_count,
            MAX(created_at) AS last_at,
            MAX(product_name) AS product_name,
            (SELECT message FROM chat_messages c2
              WHERE c2.session_id = c.session_id
              ORDER BY id DESC LIMIT 1) AS last_message,
            (SELECT sender FROM chat_messages c3
              WHERE c3.session_id = c.session_id
              ORDER BY id DESC LIMIT 1) AS last_sender
     FROM chat_messages c
     GROUP BY session_id
     ORDER BY last_at DESC`
  );
  res.json(rows);
});

app.get('/api/admin/notifications', requireAdmin, async (req, res) => {
  const cfg = await getNotifyConfig();
  const rows = await db.all('SELECT `key`, `value` FROM settings');
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  res.json({
    enabled: cfg.enabled,
    notifyEmail: s.notifyEmail || process.env.MAIL_TO || 'fuesohyushaou@gmail.com',
    smtpHost: process.env.SMTP_HOST || process.env.MAIL_HOST || '',
    recipient: cfg.to || 'fuesohyushaou@gmail.com'
  });
});

app.post('/api/admin/test-email', requireAdmin, async (req, res) => {
  const sent = await sendNotice({
    subject: 'IT-ISEP Admin — test notification',
    text: 'This is a test notification from the IT-ISEP LTD admin dashboard. If you are reading this, email notifications are working correctly.'
  });
  res.json({
    ok: sent,
    error: sent ? null : 'Email sending failed or is not configured. Start the server with SMTP_HOST/SMTP_USER/SMTP_PASS set (see backend/.env.example) and make sure a recipient address is saved on the Mail tab.'
  });
});

app.use(express.static(CLIENT_DIST));

app.get('/admin', (req, res, next) => {
  const adminIndex = path.join(CLIENT_DIST, 'admin.html');
  if (fs.existsSync(adminIndex)) return res.sendFile(adminIndex);
  next();
});

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (fs.existsSync(DIST_INDEX)) {
    return res.sendFile(DIST_INDEX);
  }
  res.status(503).type('html').send(
    `<h3>Frontend not built yet.</h3><p>Run <code>npm run build</code> once, or use <code>npm run dev</code> for the development server (http://localhost:5173).</p>`
  );
});

export default app;