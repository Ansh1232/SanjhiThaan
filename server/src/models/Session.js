import mongoose from 'mongoose';

const sangatSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  gurudwara: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  address: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  city: { type: String, required: true, trim: true, minlength: 2, maxlength: 80, index: true },
  schedule: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  type: { type: String, required: true, enum: ['Diwan', 'Kirtan', 'Path', 'Simran', 'Katha'] },
  description: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

sangatSchema.index({ city: 1, type: 1 });

export default mongoose.model('Sangat', sangatSchema);
