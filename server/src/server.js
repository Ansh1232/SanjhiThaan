import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errors.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import hukamnamaRoutes from './routes/hukamnamaRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

function validateEnvironment() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  if (!process.env.CLIENT_ORIGIN) throw new Error('CLIENT_ORIGIN is required.');

  let clientOrigin;
  try {
    clientOrigin = new URL(process.env.CLIENT_ORIGIN);
  } catch {
    throw new Error('CLIENT_ORIGIN must be a valid URL.');
  }
  if (!['http:', 'https:'].includes(clientOrigin.protocol)) throw new Error('CLIENT_ORIGIN must use HTTP or HTTPS.');
  return clientOrigin.origin;
}

const clientOrigin = validateEnvironment();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '20kb' }));
app.use('/api', (req, res, next) => {
  const hasBody = Number(req.headers['content-length']) > 0 || Boolean(req.headers['transfer-encoding']);
  if (!hasBody) {
    req.body = {};
    return next();
  }
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sangat', sessionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/hukamnama', hukamnamaRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {});
}

startServer().catch((error) => {
  console.error('Unable to start Saadh Sangat API.', error);
  process.exitCode = 1;
});
