import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    console.log('Auth middleware - Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Auth middleware - Invalid token:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Optional authentication: attaches req.user if a valid token is present,
// but does not error when no/invalid token is provided (for public endpoints)
export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
  } catch (_) {
    // ignore invalid token to keep endpoint public
  }
  next();
}

// Middleware to protect routes (alias for authenticate)
export function protect(req, res, next) {
  authenticate(req, res, next);
}

// Middleware to restrict access to specific roles
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      console.log('RestrictTo middleware - No user in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log('RestrictTo middleware - User role:', req.user.role);
    console.log('RestrictTo middleware - Allowed roles:', roles);
    
    // Check if the role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      console.log('RestrictTo middleware - Access denied for role:', req.user.role);
      return res.status(403).json({ message: 'Access denied' });
    }
    
    console.log('RestrictTo middleware - Access granted');
    next();
  };
}