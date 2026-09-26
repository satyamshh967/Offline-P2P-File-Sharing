const express = require('express');
const router = express.Router();
const authStore = require('../authStore');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, name, email, password, avatarColor } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const result = authStore.register(username, name || username, email, password, avatarColor);
    return res.status(201).json({
      success: true,
      user: result.user,
      token: result.token
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  try {
    const result = authStore.login(usernameOrEmail, password);
    return res.json({
      success: true,
      user: result.user,
      token: result.token
    });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.substring(7);
  const user = authStore.getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  return res.json({ success: true, user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    authStore.logout(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
