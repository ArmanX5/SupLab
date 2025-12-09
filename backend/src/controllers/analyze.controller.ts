/**
 * Controller for the analyze endpoint
 */

import { Request, Response } from 'express';
import { analyzeSet } from '../services/analyze.service';
import { validateAnalyzeRequest } from '../utils/validators';
import { AnalyzeRequest, AnalysisResult } from '../types';

/**
 * POST /api/analyze
 * Analyzes a set composed of sequences and intervals
 */
export async function analyzeController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validate request body
    const validation = validateAnalyzeRequest(req.body);

    if (!validation.valid) {
      res.status(400).json({
        error: 'Invalid request',
        details: validation.errors,
      });
      return;
    }

    const request = req.body as AnalyzeRequest;

    // Perform analysis
    const result: AnalysisResult = analyzeSet(request);

    // Return successful response
    res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: 'Internal server error',
      message: errorMessage,
    });
  }
}

