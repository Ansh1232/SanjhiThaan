import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { publicUser } from './authRoutes.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/users', async (req, res) => {
  const users = await User.find().select('name email city isAdmin createdAt').sort({ createdAt: -1 }).lean();
  res.json({ users: users.map((user) => ({ ...publicUser(user), createdAt: user.createdAt })) });
});

router.patch('/users/:userId', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ message: 'Invalid user id.' });
  const updates = {};
  if (Object.hasOwn(req.body, 'name')) {
    if (typeof req.body.name !== 'string' || req.body.name.trim().length < 2 || req.body.name.trim().length > 60) return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
    updates.name = req.body.name.trim();
  }
  if (Object.hasOwn(req.body, 'city')) {
    if (typeof req.body.city !== 'string' || req.body.city.trim().length < 2 || req.body.city.trim().length > 80) return res.status(400).json({ message: 'City must be between 2 and 80 characters.' });
    updates.city = req.body.city.trim();
  }
  if (Object.hasOwn(req.body, 'isAdmin')) {
    if (typeof req.body.isAdmin !== 'boolean') return res.status(400).json({ message: 'isAdmin must be true or false.' });
    const target = await User.findById(req.params.userId).select('isAdmin');
    if (!target) return res.status(404).json({ message: 'User not found.' });
    if (target._id.equals(req.userId) && !req.body.isAdmin) return res.status(400).json({ message: 'You cannot remove your own administrator access.' });
    if (target.isAdmin && !req.body.isAdmin && await User.countDocuments({ isAdmin: true }) <= 1) return res.status(400).json({ message: 'At least one administrator must remain.' });
    updates.isAdmin = req.body.isAdmin;
  }
  if (!Object.keys(updates).length) return res.status(400).json({ message: 'Provide a name, city, or administrator status to update.' });
  const user = await User.findByIdAndUpdate(req.params.userId, { $set: updates }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: publicUser(user) });
});

export default router;
