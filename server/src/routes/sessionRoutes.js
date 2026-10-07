import { Router } from 'express';
import mongoose from 'mongoose';
import Sangat from '../models/Session.js';
import Rsvp from '../models/Rsvp.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const listingFields = ['name', 'gurudwara', 'address', 'city', 'schedule', 'type', 'description'];

router.get('/', requireAuth, async (req, res) => {
  const filter = {};
  if (typeof req.query.city === 'string' && req.query.city.trim()) {
    filter.city = new RegExp(`^${req.query.city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  }
  const listings = await Sangat.find(filter).sort({ city: 1, name: 1 }).lean();
  const ids = listings.map((listing) => listing._id);
  const counts = await Rsvp.aggregate([
    { $match: { sangat: { $in: ids } } },
    { $group: { _id: '$sangat', count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((item) => [item._id.toString(), item.count]));
  let attendingIds = new Set();
  if (req.userId && ids.length) {
    const rsvps = await Rsvp.find({ user: req.userId, sangat: { $in: ids } }).select('sangat').lean();
    attendingIds = new Set(rsvps.map((item) => item.sangat.toString()));
  }
  res.json({ sangat: listings.map((listing) => ({
    ...listing,
    isAttending: attendingIds.has(listing._id.toString()),
    attendeeCount: countById.get(listing._id.toString()) || 0,
  })) });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const listing = {};
  for (const field of listingFields) {
    if (typeof req.body[field] !== 'string' || !req.body[field].trim()) {
      return res.status(400).json({ message: `A valid ${field} is required.` });
    }
    listing[field] = req.body[field].trim();
  }
  if (!['Diwan', 'Kirtan', 'Path', 'Simran', 'Katha'].includes(listing.type)) {
    return res.status(400).json({ message: 'Choose a valid programme type.' });
  }
  const sangat = await Sangat.create({ ...listing, addedBy: req.userId });
  res.status(201).json({ sangat: { ...sangat.toObject(), id: sangat.id, isAttending: false, attendeeCount: 0 } });
});

router.post('/:sangatId/rsvp', requireAuth, async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.sangatId)) return res.status(400).json({ message: 'Invalid sangat listing id.' });
  try {
    if (!await Sangat.exists({ _id: req.params.sangatId })) return res.status(404).json({ message: 'Sangat listing not found.' });
    await Rsvp.create({ sangat: req.params.sangatId, user: req.userId });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You are already attending this programme.' });
    return next(error);
  }
  const attendeeCount = await Rsvp.countDocuments({ sangat: req.params.sangatId });
  res.status(201).json({ message: 'You are attending this programme.', attendeeCount });
});

router.delete('/:sangatId/rsvp', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.sangatId)) return res.status(400).json({ message: 'Invalid sangat listing id.' });
  const removed = await Rsvp.findOneAndDelete({ sangat: req.params.sangatId, user: req.userId });
  if (!removed) return res.status(404).json({ message: 'You are not marked as attending this programme.' });
  const attendeeCount = await Rsvp.countDocuments({ sangat: req.params.sangatId });
  res.json({ message: 'Your attendance was removed.', attendeeCount });
});

export default router;
