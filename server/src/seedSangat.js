import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';

const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL.trim())) throw new Error('ADMIN_EMAIL must be a valid email address.');
if (ADMIN_PASSWORD.length < 8 || Buffer.byteLength(ADMIN_PASSWORD, 'utf8') > 72) throw new Error('ADMIN_PASSWORD must be at least 8 characters and no more than 72 bytes.');

try {
  await mongoose.connect(MONGO_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email },
    { $set: { name: 'Saadh Sangat Admin', email, city: 'Chandigarh', passwordHash, isAdmin: true } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
} finally {
  await mongoose.disconnect();
}
