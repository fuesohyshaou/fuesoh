import nodemailer from 'nodemailer';
import db from './db.js';

const DEFAULT_TO = 'fuesohyushaou@gmail.com';
let transporter = null;

function getTransporter() {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  if (!host) return null;
  if (!transporter) {
    const user = process.env.SMTP_USER || process.env.MAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 465),
      secure: String(process.env.SMTP_SECURE ?? 'true').toLowerCase() === 'true',
      auth: user && pass ? { user, pass } : undefined
    });
  }
  return transporter;
}

async function readSettings() {
  try {
    const rows = await db.all('SELECT `key`, `value` FROM settings');
    const s = {};
    for (const r of rows) s[r.key] = r.value;
    return s;
  } catch {
    return {};
  }
}

export async function getNotifyConfig() {
  const s = await readSettings();
  const to = (s.notifyEmail || process.env.MAIL_TO || DEFAULT_TO || '').trim();
  return {
    enabled: String(s.notificationsEnabled ?? 'true') !== 'false',
    to,
    configured: Boolean((s.notifyEmail || process.env.MAIL_TO || DEFAULT_TO).trim() && (process.env.SMTP_HOST || process.env.MAIL_HOST))
  };
}

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST || process.env.MAIL_HOST);
}

export async function sendNotice({ subject, text, html }) {
  try {
    const cfg = await getNotifyConfig();
    if (!cfg.enabled || !cfg.to) return false;
    const tr = getTransporter();
    if (!tr) return false;
    const fromName = process.env.MAIL_FROM_NAME || 'IT-ISEP LTD Website';
    const fromUser = process.env.SMTP_USER || process.env.MAIL_USER || 'no-reply';
    await tr.sendMail({
      from: `"${fromName}" <${fromUser}>`,
      to: cfg.to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br/>')
    });
    return true;
  } catch (err) {
    console.error('[mail] Failed to send notification:', err.message);
    return false;
  }
}

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title, rowsHtml) {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px;">
    <table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr><td style="background:#071A2F;padding:16px 24px;">
        <span style="color:#ffffff;font-size:16px;font-weight:bold;">IT-ISEP <span style="color:#00B8D9;">LTD</span></span>
        <span style="color:#94a3b8;font-size:12px;float:right;padding-top:4px;">${esc(title)}</span>
      </td></tr>
      <tr><td style="padding:24px;">
        ${rowsHtml}
        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:16px;">
          Received by the IT-ISEP LTD website. Reply in the admin dashboard or contact the customer directly.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

function field(label, value) {
  const v = esc(value);
  return `<p style="margin:0 0 4px;"><span style="color:#64748b;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">${esc(label)}</span><br/><span style="color:#0f172a;font-size:14px;">${v}</span></p>`;
}

export function buildAvailabilityEmail(data) {
  const title = 'New Availability Check';
  const rows = [
    field('Request ID', data.request_id),
    field('Name', data.name),
    field('Phone', data.phone),
    field('Email', data.email),
    field('City', data.city),
    field('Neighborhood', data.neighborhood),
    field('Address', data.address),
    field('Service Required', data.service),
    field('Preferred Contact', data.contact_method)
  ].join('');
  const text = (`NEW AVAILABILITY CHECK (${data.request_id})\n` +
    `Name: ${data.name}\nPhone: ${data.phone}\n` +
    `Email: ${data.email || '—'}\nCity: ${data.city || '—'}\n` +
    `Neighborhood: ${data.neighborhood || '—'}\nAddress: ${data.address || '—'}\n` +
    `Service: ${data.service || '—'}\nContact method: ${data.contact_method || '—'}`).replace(/\n/g, '\n');
  return { title, text, html: layout(title, rows) };
}

export function buildQuoteEmail(data, items) {
  const title = 'New Quote Request';
  const itemsHtml = Array.isArray(items) && items.length
    ? `<p style="margin:8px 0 4px;"><span style="color:#64748b;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Items (${items.length})</span></p><ul style="margin:0 0 12px;padding-left:18px;color:#0f172a;font-size:13px;">${items.map(it => `<li>${esc(it.name || it.product || 'Item')}${it.qty ? ` x${it.qty}` : ''}${it.price ? ` — ${it.price} FCFA` : ''}</li>`).join('')}</ul>`
    : '';
  const rows = [
    field('Request ID', data.request_id),
    field('Name', data.name),
    field('Company', data.company),
    field('Phone', data.phone),
    field('Email', data.email),
    field('Location', data.location),
    itemsHtml,
    field('Notes', data.notes)
  ].join('');
  const text = (`NEW QUOTE REQUEST (${data.request_id})\n` +
    `Name: ${data.name}\nCompany: ${data.company || '—'}\nPhone: ${data.phone}\n` +
    `Email: ${data.email || '—'}\nLocation: ${data.location || '—'}\nNotes: ${data.notes || '—'}`).replace(/\n/g, '\n');
  return { title, text, html: layout(title, rows) };
}

export function buildChatEmail(sessionId, message, product) {
  const title = 'New Chat Message';
  const rows = [
    field('Session', sessionId),
    field('Message', message),
    field('Product', product || '—')
  ].join('');
  const text = `NEW CHAT MESSAGE (${sessionId})\n${message}`.replace(/\n/g, '\n');
  return { title, text, html: layout(title, rows) };
}

export function buildRegistrationEmail(user) {
  const title = 'New User Registration';
  const rows = [
    field('Name', user.name),
    field('Email', user.email),
    field('Username', user.username),
    field('Date', user.created_at)
  ].join('');
  const text = (`NEW USER REGISTRATION\nName: ${user.name}\nEmail: ${user.email}\nUsername: ${user.username}`).replace(/\n/g, '\n');
  return { title, text, html: layout(title, rows) };
}

export function buildBookingEmail(data) {
  const title = 'New Technician Booking';
  const rows = [
    field('Booking ID', data.booking_id),
    field('Client', data.client_name),
    field('Phone', data.client_phone),
    field('Email', data.client_email),
    field('Service', data.service),
    field('Technician', data.technician_name || 'Not assigned yet'),
    field('Date', data.booking_date),
    field('Time', data.time_slot),
    field('Address', data.address),
    field('City', data.city),
    field('Neighborhood', data.neighborhood),
    field('Notes', data.notes)
  ].join('');
  const text = (`NEW BOOKING (${data.booking_id})\n` +
    `Client: ${data.client_name}\nPhone: ${data.client_phone}\nEmail: ${data.client_email || '—'}\n` +
    `Service: ${data.service || '—'}\nTechnician: ${data.technician_name || 'Not assigned yet'}\n` +
    `Date: ${data.booking_date}\nTime: ${data.time_slot}\nAddress: ${data.address || '—'}\n` +
    `City: ${data.city || '—'}\nNeighborhood: ${data.neighborhood || '—'}\nNotes: ${data.notes || '—'}`).replace(/\n/g, '\n');
  return { title, text, html: layout(title, rows) };
}

export default { sendNotice, getNotifyConfig, mailConfigured };