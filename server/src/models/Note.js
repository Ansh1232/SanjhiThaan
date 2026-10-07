import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1200 },
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
