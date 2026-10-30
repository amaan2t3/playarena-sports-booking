import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './services/store.js';
import authRoutes from './routes/authRoutes.js';
import groundRoutes from './routes/groundRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for seamless development and cross-origin access
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'PlayArena API',
    supportedCities: ['Rawalpindi', 'Skardu'],
    supportedSports: ['Football', 'Tennis', 'Cricket', 'Badminton', 'Other sports'],
    time: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/grounds', groundRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found on PlayArena API.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🏟️  PlayArena Sports Booking API running on port ${PORT}`);
    console.log(`📍 Cities: Rawalpindi | Skardu`);
    console.log(`⚽ Sports: Football | Tennis | Cricket | Badminton | Others`);
    console.log(`🔑 Admin credentials: admin@playarena.pk / admin123`);
    console.log(`👤 Customer credentials: user@playarena.pk / user123`);
    console.log(`======================================================\n`);
  });
}

start();
