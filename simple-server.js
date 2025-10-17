require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./admin/routes/auth');
const portfolioRoutes = require('./admin/routes/portfolio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles for Tailwind
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin/public')));

// Admin routes
app.use('/admin', authRoutes);
app.use('/admin', portfolioRoutes);

// Public API endpoints
app.get('/api/portfolio', async (req, res) => {
  try {
    const data = await fs.promises.readFile(path.join(__dirname, 'data', 'portfolio.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    res.status(500).json({ error: 'Failed to load portfolio data' });
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'views', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log('✅ No live reload - changes require manual refresh');
});