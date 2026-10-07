import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  passwordHash: { type: String, required: true, select: false },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
