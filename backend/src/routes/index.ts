/**
 * Central route configuration
 */

import { Router } from 'express';
import analyzeRouter from './analyze.route';

const router = Router();

// Mount analyze routes
router.use(analyzeRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;

