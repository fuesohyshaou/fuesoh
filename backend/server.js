import 'dotenv/config';
import app from './app.js';
import db from './db.js';

// Keep a fixed default. Apache/XAMPP commonly occupies 8080, so the app
// defaults to 8081. Override via PORT in backend/.env.
const PORT = process.env.PORT || 8081;

const server = app.listen(PORT, () => {
  console.log(`IT-ISEP server running at http://localhost:${PORT}`);
  console.log(`Admin dashboard at http://localhost:${PORT}/admin`);
  console.log(`Database: MySQL at ${db.config.host}:${db.config.port}/${db.config.database}`);
  console.log('Admin accounts are stored in the database. On first start a default administrator is created');
  console.log(`from the ADMIN_USERNAME / ADMIN_PASSWORD environment variables (default: admin / admin).`);
  console.log('Add more administrators from the "Administrators" tab on the Admin Dashboard.');
});

function shutdown() {
  server.close(async () => {
    try { await db.close(); } catch { /* ignore */ }
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);