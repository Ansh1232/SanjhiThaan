import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import User from '../models/User.js';
import { createToken, requireAuth } from '../middleware/auth.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });

export function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, city: user.city, isAdmin: Boolean(user.isAdmin) };
}

router.post('/signup', authLimiter, async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const city = typeof req.body.city === 'string' ? req.body.city.trim() : '';

  if (name.length < 2 || name.length > 60) return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({ message: 'Password must be at least 8 characters and no more than 72 bytes.' });
  if (city.length < 2 || city.length > 80) return res.status(400).json({ message: 'Enter a city between 2 and 80 characters.' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, city });
  res.status(201).json({ token: createToken(user._id.toString()), user: publicUser(user) });
});

router.post('/login', authLimiter, async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (!password || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({ message: 'Enter a valid password.' });
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  res.json({ token: createToken(user._id.toString()), user: publicUser(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'This account no longer exists.' });
  res.json({ user: publicUser(user) });
});

router.patch('/me', requireAuth, async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const city = typeof req.body.city === 'string' ? req.body.city.trim() : '';
  if (name.length < 2 || name.length > 60) return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
  if (city.length < 2 || city.length > 80) return res.status(400).json({ message: 'City must be between 2 and 80 characters.' });
  const user = await User.findByIdAndUpdate(req.userId, { $set: { name, city } }, { new: true, runValidators: true });
  if (!user) return res.status(401).json({ message: 'This account no longer exists.' });
  res.json({ user: publicUser(user) });
});

export default router;
