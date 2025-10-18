require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const authRoutes = require('./admin/routes/auth');
const portfolioRoutes = require('./admin/routes/portfolio');
const enhancedRoutes = require('./admin/routes/enhanced');

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
app.use('/admin', enhancedRoutes);

// WebSocket endpoint info for debugging
app.get('/api/ws-info', (req, res) => {
  res.json({
    connectedClients: wss ? wss.clients.size : 0,
    websocketPort: PORT
  });
});

// Function to broadcast reload to all WebSocket clients
function broadcastReload() {
  if (global.wss) {
    const message = JSON.stringify({ type: 'reload' });
    let clientCount = 0;
    global.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        clientCount++;
      }
    });
    console.log(`📡 Sent reload signal to ${clientCount} WebSocket client(s)`);
  } else {
    console.warn('⚠️ WebSocket server not available for broadcast');
  }
}

// Make broadcastReload globally available
global.broadcastReload = broadcastReload;

// Manual trigger endpoint for testing
app.post('/api/trigger-reload', (req, res) => {
  broadcastReload();
  res.json({ success: true, message: 'Reload triggered manually' });
});

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

// Admin routes with proper trailing slash handling
app.get(['/admin', '/admin/'], (req, res) => {
  if (req.session.token) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
});

// Handle direct access to admin login
app.get('/admin/login', (req, res) => {
  if (req.session.token) {
    res.redirect('/admin/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'admin', 'views', 'login.html'));
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
global.wss = wss; // Make WebSocket server globally available

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('📡 WebSocket client connected');
  ws.send(JSON.stringify({ type: 'connected' }));
  
  ws.on('close', () => {
    console.log('📤 WebSocket client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Watch for file changes in development (disabled to prevent reload loops)
// File watching is disabled - live reload only triggered by publish button
if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_FILE_WATCH === 'true') {
  const chokidar = require('chokidar');
  
  // Watch for changes in public folder
  const watcher = chokidar.watch(['public/**/*', 'admin/public/**/*'], {
    ignored: /node_modules/,
    persistent: true
  });
  
  watcher.on('change', (filePath) => {
    console.log(`📁 File changed: ${filePath}`);
    // Broadcast to all connected clients that files have changed
    broadcastReload();
  });
  
  console.log('👀 Watching for file changes...');
} else {
  console.log('📝 Live reload: Only triggered by publish button');
}
