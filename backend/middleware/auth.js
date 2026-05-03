const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded._id || decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(userId).select('-password +transactionPin');

    if (!user) return res.status(401).json({ error: 'Token is not valid' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded._id || decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(userId).select('-password +transactionPin');

    if (!user) return res.status(401).json({ error: 'Token is not valid' });
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = { auth, adminAuth };
