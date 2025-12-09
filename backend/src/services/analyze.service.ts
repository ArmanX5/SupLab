/**
 * Analysis service - main math logic for computing sup, inf, max, min, bounds
 */

import {
  AnalyzeRequest,
  SetComponent,
  SequenceComponent,
  isSequenceComponent,
  isIntervalComponent,
  AnalysisResult,
  EpsilonBand,
  SetAnalysisData,
  IntervalBoundInfo,
} from '../types';
import { evaluateFormula } from '../utils';

const DEFAULT_EPSILON = 0.01;

/**
 * Main analysis function - processes all components and computes results
 */
export function analyzeSet(request: AnalyzeRequest): AnalysisResult {
  // Extract data from all components
  const analysisData = extractSetData(request.components);

  // Compute the analysis result
  return computeAnalysis(analysisData);
}

/**
 * Extracts numeric values and interval information from components
 */
function extractSetData(components: SetComponent[]): SetAnalysisData {
  const values: number[] = [];
  const intervalBounds: IntervalBoundInfo[] = [];

  for (const component of components) {
    if (isSequenceComponent(component)) {
      const sequenceValues = evaluateSequence(component);
      values.push(...sequenceValues);
    } else if (isIntervalComponent(component)) {
      // Don't add interval bounds to discrete values array
      // They will be handled separately for sup/inf/max/min computation
      intervalBounds.push({
        start: component.start,
        end: component.end,
        openStart: component.openStart,
        openEnd: component.openEnd,
      });
    }
  }

  return { values, intervalBounds };
}

/**
 * Evaluates a sequence formula for all n values in the range
 */
function evaluateSequence(component: SequenceComponent): number[] {
  const values: number[] = [];

  for (let n = component.start; n <= component.end; n++) {
    const value = evaluateFormula(component.formula, n);
    if (value !== null) {
      values.push(value);
    }
  }

  return values;
}

/**
 * Computes the full analysis from extracted data
 */
function computeAnalysis(data: SetAnalysisData): AnalysisResult {
  const { values, intervalBounds } = data;

  // Handle empty set case
  if (values.length === 0 && intervalBounds.length === 0) {
    return {
      boundedAbove: true, // Empty set is vacuously bounded
      boundedBelow: true,
      sup: null,
      inf: null,
      max: null,
      min: null,
      epsilonBand: null,
    };
  }

  // Compute sup (least upper bound)
  const supResult = computeSupremum(values, intervalBounds);

  // Compute inf (greatest lower bound)
  const infResult = computeInfimum(values, intervalBounds);

  // Determine boundedness
  const boundedAbove = supResult.sup !== null && isFinite(supResult.sup);
  const boundedBelow = infResult.inf !== null && isFinite(infResult.inf);

  // Compute max and min (actual elements of the set)
  const max = computeMaximum(values, intervalBounds, supResult.sup);
  const min = computeMinimum(values, intervalBounds, infResult.inf);

  // Compute epsilon band around sup
  const epsilonBand = computeEpsilonBand(supResult.sup, DEFAULT_EPSILON);

  return {
    boundedAbove,
    boundedBelow,
    sup: supResult.sup,
    inf: infResult.inf,
    max,
    min,
    epsilonBand,
  };
}

/**
 * Computes the supremum (least upper bound) of the set
 */
function computeSupremum(
  values: number[],
  intervalBounds: IntervalBoundInfo[]
): { sup: number | null } {
  let sup = -Infinity;

  // Check all discrete values
  for (const value of values) {
    if (value > sup) {
      sup = value;
    }
  }

  // Check interval upper bounds
  for (const interval of intervalBounds) {
    if (interval.end > sup) {
      sup = interval.end;
    }
  }

  // If sup is still -Infinity, there were no values
  if (sup === -Infinity) {
    return { sup: null };
  }

  return { sup };
}

/**
 * Computes the infimum (greatest lower bound) of the set
 */
function computeInfimum(
  values: number[],
  intervalBounds: IntervalBoundInfo[]
): { inf: number | null } {
  let inf = Infinity;

  // Check all discrete values
  for (const value of values) {
    if (value < inf) {
      inf = value;
    }
  }

  // Check interval lower bounds
  for (const interval of intervalBounds) {
    if (interval.start < inf) {
      inf = interval.start;
    }
  }

  // If inf is still Infinity, there were no values
  if (inf === Infinity) {
    return { inf: null };
  }

  return { inf };
}

/**
 * Computes the maximum (if it exists in the set)
 * Maximum exists if supremum is actually in the set
 */
function computeMaximum(
  values: number[],
  intervalBounds: IntervalBoundInfo[],
  sup: number | null
): number | null {
  if (sup === null) {
    return null;
  }

  // Check if sup is in the discrete values
  const EPSILON = 1e-10;
  for (const value of values) {
    if (Math.abs(value - sup) < EPSILON) {
      return sup;
    }
  }

  // Check if sup is a closed endpoint of an interval
  for (const interval of intervalBounds) {
    if (Math.abs(interval.end - sup) < EPSILON && !interval.openEnd) {
      return sup;
    }
  }

  // Sup is not in the set (it's a limit point)
  return null;
}

/**
 * Computes the minimum (if it exists in the set)
 * Minimum exists if infimum is actually in the set
 */
function computeMinimum(
  values: number[],
  intervalBounds: IntervalBoundInfo[],
  inf: number | null
): number | null {
  if (inf === null) {
    return null;
  }

  // Check if inf is in the discrete values
  const EPSILON = 1e-10;
  for (const value of values) {
    if (Math.abs(value - inf) < EPSILON) {
      return inf;
    }
  }

  // Check if inf is a closed endpoint of an interval
  for (const interval of intervalBounds) {
    if (Math.abs(interval.start - inf) < EPSILON && !interval.openStart) {
      return inf;
    }
  }

  // Inf is not in the set (it's a limit point)
  return null;
}

/**
 * Computes the epsilon band around the supremum
 */
function computeEpsilonBand(
  sup: number | null,
  epsilon: number
): EpsilonBand | null {
  if (sup === null) {
    return null;
  }

  return {
    epsilon,
    interval: [sup - epsilon, sup],
  };
}

