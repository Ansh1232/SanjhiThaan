import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema({
  sangat: { type: mongoose.Schema.Types.ObjectId, ref: 'Sangat', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

rsvpSchema.index({ sangat: 1, user: 1 }, { unique: true });

export default mongoose.model('Rsvp', rsvpSchema);
