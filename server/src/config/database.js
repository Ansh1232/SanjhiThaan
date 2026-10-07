import mongoose from 'mongoose';

export async function connectDatabase() {
  const connectionString = process.env.MONGO_URI;
  if (!connectionString) {
    throw new Error('MONGO_URI is missing. Copy .env.example to .env and add your MongoDB connection string.');
  }

  await mongoose.connect(connectionString);
}
