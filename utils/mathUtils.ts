
import { SetComponent, AnalysisResult, Dimension, PointND, Metric, MetricType, SpaceDomain } from '../types';
import { create, all } from 'mathjs';
import { DiameterCalculator, euclideanDistance } from './diameterCalculator';

const math = create(all);

// Restrict to Euclidean metric only
export const METRICS: Record<MetricType, Metric> = {
  l2: {
    id: 'l2',
    name: 'Euclidean (ℓ²)',
    compute: euclideanDistance
  },
  l1: {
    id: 'l1',
    name: 'Manhattan (ℓ¹) [Disabled]',
    compute: euclideanDistance // Fallback to Euclidean
  },
  linf: {
    id: 'linf',
    name: 'Chebyshev (ℓ∞) [Disabled]',
    compute: euclideanDistance // Fallback to Euclidean
  }
};

export const formatNum = (n: number | null): string => {
  if (n === null) return 'NaN';
  if (!isFinite(n)) return n > 0 ? '∞' : '-∞';
  return (Math.round(n * 1e6) / 1e6).toString();
};

/**
 * Enhanced formula evaluation using mathjs
 * Supports: trigonometric, logarithmic, exponential, power functions
 * Handles: pi, e, complex expressions
 */
export const safeEvaluate = (formula: string, vars: Record<string, number>): number | null => {
  try {
    // Prepare scope with variables
    const scope = { ...vars, pi: Math.PI, e: Math.E };
    
    // Compile and evaluate
    const compiled = math.compile(formula);
    const result = compiled.evaluate(scope);
    
    // Handle mathjs complex numbers and convert to real
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
    
    // Check if it's a mathjs number type
    if (result && typeof result === 'object' && 're' in result) {
      const realPart = (result as any).re;
      if (typeof realPart === 'number' && isFinite(realPart)) {
        return realPart;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Formula evaluation error:', error);
    return null;
  }
};

/**
 * Validate formula syntax without evaluation
 */
export const validateFormula = (formula: string, expectedVars: string[]): { valid: boolean; error?: string } => {
  try {
    const compiled = math.compile(formula);
    
    // Check if formula contains expected variables
    const testScope: Record<string, number> = {};
    expectedVars.forEach(v => testScope[v] = 0);
    testScope.pi = Math.PI;
    testScope.e = Math.E;
    
    const result = compiled.evaluate(testScope);
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Invalid formula' 
    };
  }
};

const normalizeFunctionDomain = (domain: [number, number]): [number, number] => {
  let [start, end] = domain;

  if (!Number.isFinite(start)) start = -10;
  if (!Number.isFinite(end)) end = 10;

  if (start > end) [start, end] = [end, start];

  if (start === end) {
    const delta = Math.max(1, Math.abs(start) * 0.05, 0.5);
    start -= delta;
    end += delta;
  }

  return [start, end];
};

export const getSequencePoints = (type: string, count: number = 100, customFormula?: string): number[] => {
  const points: number[] = [];
  for (let n = 1; n <= count; n++) {
    if (type === 'custom' && customFormula) {
      const v = safeEvaluate(customFormula, { n });
      if (v !== null) points.push(v);
    } else {
      if (type === '1/n' || type === 'harmonic') points.push(1/n);
      if (type === 'alternating') points.push(Math.pow(-1, n) / n);
      if (type === 'geometric') points.push(Math.pow(0.5, n));
    }
  }
  return points;
};

export const getFunctionPoints = (comp: SetComponent, domain?: SpaceDomain): PointND[] => {
  if (comp.type !== 'function' || !comp.function) return [];
  const { funcType, formulaX, formulaY, formulaZ, domain: funcDomain, samples } = comp.function;
  const points: PointND[] = [];
  const [start, end] = normalizeFunctionDomain(funcDomain);
  const sampleCount = Math.max(1, samples);
  const range = end - start;
  const step = range / sampleCount;

  if (!Number.isFinite(step) || step === 0 || range <= 0) {
    return points;
  }

  if (funcType === 'explicit' && formulaY) {
    // R² explicit: y = f(x)
    for (let x = start; x <= end; x += step) {
      const y = safeEvaluate(formulaY, { x });
      if (y !== null) {
        // Apply domain constraints if provided
        if (domain) {
          const { bounds } = domain;
          if (x >= bounds.xMin && x <= bounds.xMax && 
              y >= (bounds.yMin ?? -Infinity) && y <= (bounds.yMax ?? Infinity)) {
            points.push([x, y, 0]);
          }
        } else {
          points.push([x, y, 0]);
        }
      }
    }
  } else if (funcType === 'parametric' && (formulaX || formulaY || formulaZ)) {
    // R³ parametric: r(t) = <x(t), y(t), z(t)>
    for (let t = start; t <= end; t += step) {
      const x = formulaX ? safeEvaluate(formulaX, { t }) : 0;
      const y = formulaY ? safeEvaluate(formulaY, { t }) : 0;
      const z = formulaZ ? safeEvaluate(formulaZ, { t }) : 0;
      
      if (x !== null && y !== null && z !== null) {
        // Apply domain constraints
        if (domain) {
          const { bounds } = domain;
          if (x >= bounds.xMin && x <= bounds.xMax &&
              y >= (bounds.yMin ?? -Infinity) && y <= (bounds.yMax ?? Infinity) &&
              z >= (bounds.zMin ?? -Infinity) && z <= (bounds.zMax ?? Infinity)) {
            points.push([x, y, z]);
          }
        } else {
          points.push([x, y, z]);
        }
      }
    }
  } else if (funcType === 'implicit' && formulaY) {
    // R² implicit: F(x,y) = 0
    // R³ implicit: F(x,y,z) = 0
    const gridSize = Math.max(1, Math.floor(Math.sqrt(sampleCount * 5)));
    const xStep = range / gridSize;
    const yStep = range / gridSize;
    const threshold = 0.1; // Points where |F(x,y,z)| < threshold
    
    // Check if formula contains 'z' variable for 3D implicit surface
    const is3D = formulaY.includes('z');
    
    if (!Number.isFinite(xStep) || xStep === 0 || !Number.isFinite(yStep) || yStep === 0) {
      return points;
    }

    if (is3D) {
      // 3D implicit surface F(x,y,z) = 0
      const zStep = range / gridSize;
      if (!Number.isFinite(zStep) || zStep === 0) return points;
      for (let x = start; x <= end; x += xStep) {
        for (let y = start; y <= end; y += yStep) {
          for (let z = start; z <= end; z += zStep) {
            const val = safeEvaluate(formulaY, { x, y, z });
            if (val !== null && Math.abs(val) < threshold) {
              if (domain) {
                const { bounds } = domain;
                if (x >= bounds.xMin && x <= bounds.xMax &&
                    y >= (bounds.yMin ?? -Infinity) && y <= (bounds.yMax ?? Infinity) &&
                    z >= (bounds.zMin ?? -Infinity) && z <= (bounds.zMax ?? Infinity)) {
                  points.push([x, y, z]);
                }
              } else {
                points.push([x, y, z]);
              }
            }
          }
        }
      }
    } else {
      // 2D implicit curve F(x,y) = 0
      for (let x = start; x <= end; x += xStep) {
        for (let y = start; y <= end; y += yStep) {
          const val = safeEvaluate(formulaY, { x, y });
          if (val !== null && Math.abs(val) < threshold) {
            if (domain) {
              const { bounds } = domain;
              if (x >= bounds.xMin && x <= bounds.xMax &&
                  y >= (bounds.yMin ?? -Infinity) && y <= (bounds.yMax ?? Infinity)) {
                points.push([x, y, 0]);
              }
            } else {
              points.push([x, y, 0]);
            }
          }
        }
      }
    }
  }
  return points;
};

export const calculateAnalysis = (
  components: SetComponent[], 
  dimension: Dimension, 
  activeMetric: Metric,
  spaceDomain?: SpaceDomain
): AnalysisResult => {
  if (components.length === 0) {
    return {
      sup: null, inf: null, max: null, min: null, diameter: null,
      boundedAbove: true, boundedBelow: true, isEmpty: true, dimension, isBounded: true,
      isCompact: false
    };
  }

  let globalMax = -Infinity;
  let globalMin = Infinity;
  let isUnboundedAbove = false;
  let isUnboundedBelow = false;
  let hasInfiniteComponent = false;
  
  let isCauchy = true;
  let limit: number | null = null;
  let isComplete = true;

  const sequenceLimits: number[] = [];
  const allPointsForDiameter: PointND[] = [];

  components.forEach(comp => {
    let scalarAnalysisPoints: number[] = [];
    let ndPoints: PointND[] = [];
    
    if (comp.type === 'interval' && comp.interval) {
      if (comp.interval.start === -Infinity) isUnboundedBelow = true;
      else globalMin = Math.min(globalMin, comp.interval.start);
      if (comp.interval.end === Infinity) isUnboundedAbove = true;
      else globalMax = Math.max(globalMax, comp.interval.end);
      
      if (comp.interval.start === -Infinity || comp.interval.end === Infinity) {
        hasInfiniteComponent = true;
      } else {
        // Add interval endpoints for diameter calculation
        ndPoints.push([comp.interval.start]);
        ndPoints.push([comp.interval.end]);
      }
    } else if (comp.type === 'finite' && comp.finite) {
      scalarAnalysisPoints = comp.finite.points;
      ndPoints = comp.finite.points.map(p => [p]);
    } else if (comp.type === 'sequence' && comp.sequence) {
      hasInfiniteComponent = true;
      scalarAnalysisPoints = getSequencePoints(comp.sequence.type, comp.sequence.limit, comp.sequence.customFormula);
      ndPoints = scalarAnalysisPoints.map(p => [p]);
      
      if (scalarAnalysisPoints.length > 5) {
        const last = scalarAnalysisPoints[scalarAnalysisPoints.length - 1];
        const prev = scalarAnalysisPoints[scalarAnalysisPoints.length - 2];
        const diff = activeMetric.compute([last], [prev]);
        if (diff > 0.05) isCauchy = false;
        limit = last; 
        sequenceLimits.push(limit);
      }
    } else if (comp.type === 'function' && comp.function) {
      const fPoints = getFunctionPoints(comp, spaceDomain);
      ndPoints = fPoints;
      
      if (comp.function.funcType === 'explicit') {
        scalarAnalysisPoints = fPoints.map(p => p[1]); // y-values
      } else {
        scalarAnalysisPoints = fPoints.map(p => p[0]); // x-values for bounds
      }
    }
    
    // Collect all n-dimensional points for diameter calculation
    allPointsForDiameter.push(...ndPoints);
    
    if (scalarAnalysisPoints.length > 0) {
      const pMax = Math.max(...scalarAnalysisPoints);
      const pMin = Math.min(...scalarAnalysisPoints);
      if (pMax > globalMax) globalMax = pMax;
      if (pMin < globalMin) globalMin = pMin;
    }
  });

  // Check completeness
  sequenceLimits.forEach(L => {
    const inSet = components.some(c => {
      if (c.type === 'interval' && c.interval) {
        const { start, end, leftOpen, rightOpen } = c.interval;
        return (leftOpen ? L > start : L >= start) && (rightOpen ? L < end : L <= end);
      }
      if (c.type === 'finite' && c.finite) return c.finite.points.some(p => Math.abs(p - L) < 1e-6);
      return false; 
    });
    if (!inSet) isComplete = false;
  });

  const sup = isUnboundedAbove ? 'infinity' : (globalMax === -Infinity ? null : globalMax);
  const inf = isUnboundedBelow ? '-infinity' : (globalMin === Infinity ? null : globalMin);

  // Calculate diameter using DiameterCalculator
  let diameterInfo;
  let diameterValue: number | 'infinity' | null;
  
  if (isUnboundedAbove || isUnboundedBelow) {
    diameterValue = 'infinity';
    diameterInfo = { value: 'infinity' as const };
  } else if (allPointsForDiameter.length === 0) {
    diameterValue = null;
    diameterInfo = { value: null };
  } else {
    // Determine if this is a manifold (continuous function)
    const hasFunction = components.some(c => c.type === 'function');
    diameterInfo = DiameterCalculator.calculate(allPointsForDiameter, hasFunction);
    diameterValue = diameterInfo.value;
  }

  // Check compactness: in R^n, compact <=> closed and bounded
  const isBoundedSet = !isUnboundedAbove && !isUnboundedBelow;
  const isCompact = isBoundedSet && isComplete;

  return {
    sup, inf,
    max: (sup !== 'infinity' && sup !== null) ? sup : null,
    min: (inf !== '-infinity' && inf !== null) ? inf : null,
    diameter: diameterValue,
    diameterInfo,
    boundedAbove: !isUnboundedAbove,
    boundedBelow: !isUnboundedBelow,
    isBounded: isBoundedSet,
    isEmpty: false,
    dimension,
    isCauchy: hasInfiniteComponent ? isCauchy : undefined,
    convergesTo: sequenceLimits.length > 0 ? sequenceLimits[0] : null,
    isCompleteInSpace: hasInfiniteComponent ? isComplete : true,
    isCompact
  };
};
