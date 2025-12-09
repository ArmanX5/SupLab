/**
 * Example: How to call the SupLab backend API from Next.js frontend
 *
 * This file demonstrates the recommended way to call the /api/analyze endpoint
 */

// Types matching the backend API
interface SequenceComponent {
  type: 'sequence';
  formula: string;
  start: number;
  end: number;
}

interface IntervalComponent {
  type: 'interval';
  start: number;
  end: number;
  openStart: boolean;
  openEnd: boolean;
}

type SetComponent = SequenceComponent | IntervalComponent;

interface AnalyzeRequest {
  components: SetComponent[];
}

interface EpsilonBand {
  epsilon: number;
  interval: [number, number];
}

interface AnalysisResult {
  boundedAbove: boolean;
  boundedBelow: boolean;
  sup: number | null;
  inf: number | null;
  max: number | null;
  min: number | null;
  epsilonBand: EpsilonBand | null;
}

// Backend URL - adjust for your environment
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Analyzes a set of components by calling the backend API
 */
export async function analyzeSet(components: SetComponent[]): Promise<AnalysisResult> {
  const request: AnalyzeRequest = { components };

  const response = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================
// USAGE EXAMPLES
// ============================================================

/**
 * Example 1: Analyze a sequence
 */
async function exampleSequence() {
  const result = await analyzeSet([
    {
      type: 'sequence',
      formula: '(-1)^n / n',
      start: 1,
      end: 1000,
    },
  ]);

  console.log('Sequence Analysis:', result);
  // Expected output:
  // {
  //   boundedAbove: true,
  //   boundedBelow: true,
  //   sup: 1,
  //   inf: -0.5,
  //   max: 1,
  //   min: -0.5,
  //   epsilonBand: { epsilon: 0.01, interval: [0.99, 1] }
  // }
}

/**
 * Example 2: Analyze an interval
 */
async function exampleInterval() {
  const result = await analyzeSet([
    {
      type: 'interval',
      start: -2,
      end: 5,
      openStart: false,
      openEnd: true, // Open at 5, so max does not exist
    },
  ]);

  console.log('Interval Analysis:', result);
  // Expected output:
  // {
  //   boundedAbove: true,
  //   boundedBelow: true,
  //   sup: 5,
  //   inf: -2,
  //   max: null,        // null because openEnd is true
  //   min: -2,          // exists because openStart is false
  //   epsilonBand: { epsilon: 0.01, interval: [4.99, 5] }
  // }
}

/**
 * Example 3: Analyze multiple components combined
 */
async function exampleCombined() {
  const result = await analyzeSet([
    {
      type: 'sequence',
      formula: '(-1)^n / n',
      start: 1,
      end: 1000,
    },
    {
      type: 'interval',
      start: -2,
      end: 5,
      openStart: false,
      openEnd: true,
    },
  ]);

  console.log('Combined Analysis:', result);
}

/**
 * Example 4: React hook usage (for Next.js app)
 */
import { useState, useCallback } from 'react';

export function useSetAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (components: SetComponent[]) => {
    setLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzeSet(components);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, analyze };
}

/**
 * Example 5: Usage in a React component
 */
/*
function AnalysisPanel() {
  const { result, loading, error, analyze } = useSetAnalysis();

  const handleAnalyze = () => {
    analyze([
      {
        type: 'sequence',
        formula: '1/n',
        start: 1,
        end: 100,
      },
    ]);
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Set'}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div>
          <p>Supremum: {result.sup}</p>
          <p>Infimum: {result.inf}</p>
          <p>Maximum: {result.max ?? 'Does not exist'}</p>
          <p>Minimum: {result.min ?? 'Does not exist'}</p>
          <p>Bounded Above: {result.boundedAbove ? 'Yes' : 'No'}</p>
          <p>Bounded Below: {result.boundedBelow ? 'Yes' : 'No'}</p>
          {result.epsilonBand && (
            <p>
              ε-band (ε={result.epsilonBand.epsilon}):
              [{result.epsilonBand.interval[0]}, {result.epsilonBand.interval[1]}]
            </p>
          )}
        </div>
      )}
    </div>
  );
}
*/

