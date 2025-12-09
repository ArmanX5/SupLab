/**
 * Routes for the analyze API
 */

import { Router } from 'express';
import { analyzeController } from '../controllers/analyze.controller';

const router = Router();

/**
 * POST /api/analyze
 * Analyzes set components (sequences and intervals)
 * Returns sup, inf, max, min, boundedness, and epsilon band
 */
router.post('/analyze', analyzeController);

export default router;

