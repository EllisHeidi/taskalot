const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs       = require('fs');
const path     = require('path');

const router = express.Router();
const JWT_SECRET  = process.env.JWT_SECRET || 'taskalot-super-secret-key-change-in-production';
const USERS_FILE  = path.join(__dirname, '../data/users.json');

// ── Helpers ──────────────────────────────────────────
function readUsers()       { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
function writeUsers(data)  { fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2)); }
function signToken(user)   {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── POST /api/auth/login ──────────────────────────────
// Body: { email, password }
// Returns: { token, user: { id, name, email } }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = readUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── POST /api/auth/register ───────────────────────────
// Body: { name, email, password }
// Returns: { token, user: { id, name, email } }
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const users = readUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id:       uuidv4(),
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashedPassword
    };

    users.push(newUser);
    writeUsers(users);

    const token = signToken(newUser);

    return res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────
// Returns the currently logged-in user's info (requires token)
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
