// ═══════════════════════════════════════════════════════
//  Task-alot — Express Backend
//  Run:  npm install  →  npm run dev
// ═══════════════════════════════════════════════════════

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const authRoutes  = require('./routes/auth');
const taskRoutes  = require('./routes/tasks');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Ensure data files exist ───────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const usersFile = path.join(dataDir, 'users.json');
const tasksFile = path.join(dataDir, 'tasks.json');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');
if (!fs.existsSync(tasksFile)) fs.writeFileSync(tasksFile, '[]');

// ── Middleware ────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'https://ellisheidi.github.io', 'https://ellisheidi.github.io'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('../Frontend'))
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/tasks', taskRoutes);

// ── Health check ──────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    app:       'Task-alot API',
    version:   '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── 404 handler ───────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ── Start server ──────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║        Task-alot API is live!        ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  URL:    http://localhost:${PORT}         ║`);
  console.log(`║  Health: http://localhost:${PORT}/api/health ║`);
  console.log('╚══════════════════════════════════════╝\n');
});

module.exports = app;
