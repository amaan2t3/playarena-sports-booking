import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import groundRoutes from './routes/groundRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

export const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'PlayArena API',
    supportedCities: ['Rawalpindi', 'Skardu'],
    supportedSports: ['Football', 'Tennis', 'Cricket', 'Badminton', 'Other sports'],
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/grounds', groundRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found on PlayArena API.` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
