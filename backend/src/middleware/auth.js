import jwt from 'jsonwebtoken';
import { findUserById } from '../services/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'playarena_super_secret_jwt_key_2026_sports';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Administrator privilege required.' });
  }
  next();
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    findUserById(decoded.id).then(user => {
      if (user) req.user = user;
      next();
    }).catch(() => next());
  } catch (err) {
    next();
  }
}
