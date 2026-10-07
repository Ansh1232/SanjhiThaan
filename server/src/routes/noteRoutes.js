import { Router } from 'express';
import mongoose from 'mongoose';
import Note from '../models/Note.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ notes });
});

router.post('/', async (req, res) => {
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  if (!content || content.length > 1200) {
    return res.status(400).json({ message: 'A reflection must be between 1 and 1,200 characters.' });
  }
  const note = await Note.create({ user: req.userId, content });
  res.status(201).json({ note });
});

router.delete('/:noteId', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.noteId)) return res.status(400).json({ message: 'Invalid note id.' });
  const note = await Note.findOneAndDelete({ _id: req.params.noteId, user: req.userId });
  if (!note) return res.status(404).json({ message: 'Reflection not found.' });
  res.json({ message: 'Reflection deleted.' });
});

export default router;
