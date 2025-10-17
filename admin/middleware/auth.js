const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.session.token || req.headers.authorization?.split(' ')[1];
  const isApiRequest = req.path.startsWith('/api/') || req.originalUrl.includes('/api/');

  if (!token) {
    if (isApiRequest) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (isApiRequest) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  }
};

module.exports = { requireAuth };