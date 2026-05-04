const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('[AUTH_MW] No token provided');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded._id || decoded.userId;
    
    if (!userId) {
      console.log('[AUTH_MW] Invalid token payload');
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    console.log(`[AUTH_MW] Token valid for user: ${userId}`);
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.log(`[AUTH_MW] User not found: ${userId}`);
      return res.status(401).json({ error: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH_MW] Auth middleware error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('[ADMIN_MW] No token provided');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded._id || decoded.userId;
    
    if (!userId) {
      console.log('[ADMIN_MW] Invalid token payload');
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    console.log(`[ADMIN_MW] Token valid for admin check: ${userId}`);
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.log(`[ADMIN_MW] User not found: ${userId}`);
      return res.status(401).json({ error: 'Token is not valid' });
    }
    if (!user.isAdmin) {
      console.log(`[ADMIN_MW] User is not admin: ${userId}`);
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log(`[ADMIN_MW] Admin access granted: ${userId}`);
    req.user = user;
    next();
  } catch (error) {
    console.error('[ADMIN_MW] Admin auth error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = { auth, adminAuth };
