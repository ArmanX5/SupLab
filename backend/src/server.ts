/**
 * SupLab Backend Server
 * Express application entry point
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRoutes from './routes';

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Create Express application
const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'SupLab Backend API',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze',
      health: 'GET /api/health',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} does not exist`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Start server
app.listen(Number(PORT), HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧮 SupLab Backend Server                                ║
║                                                           ║
║   Server running at: http://${HOST}:${PORT}                  ║
║   API endpoint: http://${HOST}:${PORT}/api/analyze           ║
║   Health check: http://${HOST}:${PORT}/api/health            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;

