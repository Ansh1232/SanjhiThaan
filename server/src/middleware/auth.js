import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!mongoose.isValidObjectId(payload.userId)) return res.status(401).json({ message: 'Your session is invalid or has expired. Please sign in again.' });
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Your session is invalid or has expired. Please sign in again.' });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('isAdmin').lean();
    if (!user) return res.status(401).json({ message: 'Sign in to continue.' });
    if (!user.isAdmin) return res.status(403).json({ message: 'Administrator access is required.' });
    next();
  } catch (error) {
    next(error);
  }
}

export function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
