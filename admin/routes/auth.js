const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  if (req.session.token) {
    return res.redirect('/admin/dashboard');
  }
  res.sendFile(require('path').join(__dirname, '../views/login.html'));
});

// Dashboard page (authenticated route)
router.get('/dashboard', (req, res) => {
  const token = req.session.token;
  
  if (!token) {
    return res.redirect('/admin/login');
  }
  
  try {
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET);
    // Serve the advanced admin dashboard
    res.sendFile(require('path').join(__dirname, '../../public/admin.html'));
  } catch (error) {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  }
});

// Login API
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check credentials
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { email: email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store token in session
    req.session.token = token;

    res.json({ 
      success: true, 
      token: token,
      redirectUrl: '/admin/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, redirectUrl: '/admin/login' });
  });
});

// Auth status check
router.get('/api/auth-status', (req, res) => {
  const token = req.session.token;
  
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ authenticated: true });
  } catch (error) {
    req.session.destroy(() => {
      res.status(401).json({ authenticated: false });
    });
  }
});

module.exports = router;
