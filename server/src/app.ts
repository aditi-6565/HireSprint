import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import gdRoutes from './routes/gd.routes.js';
import lmsRoutes from './routes/lms.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import adminRoutes from './routes/admin.routes.js';

export const app = express();

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'HireSprint Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== ''),
  });
};

app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Version 1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/gd', gdRoutes);
app.use('/api/v1/lms', lmsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Fallback aliases without /v1
app.use('/api/auth', authRoutes);
app.use('/api/gd', gdRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handler
app.use(errorHandler);
