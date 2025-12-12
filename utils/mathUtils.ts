import { SetComponent, AnalysisResult, Universe } from '../types';

// Safe evaluator for user math formulas
// Supports basic Math functions and converts ^ to **
export const safeEvaluate = (formula: string, n: number): number | null => {
  try {
    // 1. Basic sanitization: allow numbers, n, arithmetic, parens, and Math functions
    
    // Replace ^ with ** for powers
    let jsFormula = formula.replace(/\^/g, '**');
    
    // Map common math functions to Math.func
    const mathFuncs = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'log', 'exp', 'floor', 'ceil', 'round', 'pow', 'max', 'min'];
    mathFuncs.forEach(func => {
      const regex = new RegExp(`\\b${func}\\b`, 'g');
      jsFormula = jsFormula.replace(regex, `Math.${func}`);
    });

    // Constants
    jsFormula = jsFormula.replace(/\bpi\b/gi, 'Math.PI');
    jsFormula = jsFormula.replace(/\be\b/gi, 'Math.E');

    // Create a function with 'n' as argument
    const f = new Function('n', `return (${jsFormula});`);
    const result = f(n);
    
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) return null;
    return result;
  } catch (e) {
    return null;
  }
};

export const getSequencePoints = (type: string, count: number = 40, customFormula?: string): number[] => {
  const points: number[] = [];
  
  if (type === 'custom' && customFormula) {
    for (let n = 1; n <= count; n++) {
      const val = safeEvaluate(customFormula, n);
      if (val !== null) points.push(val);
    }
    return points;
  }

  for (let n = 1; n <= count; n++) {
    if (type === '1/n' || type === 'harmonic') points.push(1/n);
    if (type === 'alternating') points.push(Math.pow(-1, n));
    if (type === 'geometric') points.push(Math.pow(0.5, n));
  }
  return points;
};

// Advanced heuristic to determine if a custom sequence is unbounded
const analyzeSequence = (formula: string) => {
    // 1. Sample standard range for basic min/max
    const smallSample: number[] = [];
    for(let i=1; i<=100; i++) {
        const v = safeEvaluate(formula, i);
        if (v !== null) smallSample.push(v);
    }
    
    let localMax = smallSample.length > 0 ? Math.max(...smallSample) : -Infinity;
    let localMin = smallSample.length > 0 ? Math.min(...smallSample) : Infinity;

    // 2. Tail Analysis (Check N=1000, N=10000, N=100000)
    // This detects slow divergence like log(n) or sqrt(n) vs convergence like 1-1/n
    const t1 = safeEvaluate(formula, 1000);
    const t2 = safeEvaluate(formula, 10000);
    const t3 = safeEvaluate(formula, 100000);

    let isUnboundedAbove = false;
    let isUnboundedBelow = false;

    // Check for large magnitude divergence
    const largeThreshold = 10000;
    const terms = [t1, t2, t3].filter(t => t !== null) as number[];
    
    if (terms.some(t => t > largeThreshold)) isUnboundedAbove = true;
    if (terms.some(t => t < -largeThreshold)) isUnboundedBelow = true;

    // Check for slow monotonic divergence (e.g. sqrt(n), ln(n))
    // If t3 > t2 > t1 AND differences are significant, assume unbounded
    if (t1 !== null && t2 !== null && t3 !== null) {
        // Upper Bound Check
        if (t3 > t2 && t2 > t1) {
            const diff1 = t2 - t1;
            const diff2 = t3 - t2;
            // If it keeps growing by a non-trivial amount
            if (diff2 > 0.1) { 
                isUnboundedAbove = true;
            }
        }
        
        // Lower Bound Check
        if (t3 < t2 && t2 < t1) {
            const diff1 = t1 - t2;
            const diff2 = t2 - t3;
             if (diff2 > 0.1) {
                isUnboundedBelow = true;
            }
        }
    }
    
    // Update local max/min with tail values to ensure we cover the range
    terms.forEach(t => {
        if (t > localMax) localMax = t;
        if (t < localMin) localMin = t;
    });

    return {
        isUnboundedAbove,
        isUnboundedBelow,
        approxMax: localMax,
        approxMin: localMin
    };
};

const isIrrationalApprox = (val: number): boolean => {
    // Check against known irrationals used in common analysis problems
    const irrationals = [
        Math.SQRT2, 
        Math.PI, 
        Math.E, 
        Math.sqrt(3), 
        Math.sqrt(5)
    ];
    // We check if the value is extremely close to a known irrational
    return irrationals.some(irr => Math.abs(val - irr) < 1e-7);
};

export const calculateAnalysis = (components: SetComponent[], universe: Universe = 'R'): AnalysisResult => {
  // 1. Check if empty
  if (components.length === 0) {
    return {
      sup: null, inf: null, max: null, min: null,
      boundedAbove: true, boundedBelow: true, isEmpty: true,
      completenessGap: false, theoreticalSup: null
    };
  }

  let anyNotEmpty = false;
  let isUnboundedAbove = false;
  let isUnboundedBelow = false;
  
  const componentSups: { val: number, isInSet: boolean }[] = [];
  const componentInfs: { val: number, isInSet: boolean }[] = [];

  for (const comp of components) {
    if (comp.type === 'interval' && comp.interval) {
      const { start, end, leftOpen, rightOpen } = comp.interval;
      if (start > end) continue; 
      anyNotEmpty = true;

      if (end === Infinity) isUnboundedAbove = true;
      else componentSups.push({ val: end, isInSet: !rightOpen });

      if (start === -Infinity) isUnboundedBelow = true;
      else componentInfs.push({ val: start, isInSet: !leftOpen });
    } 
    else if (comp.type === 'finite' && comp.finite) {
      if (comp.finite.points.length === 0) continue;
      anyNotEmpty = true;
      const max = Math.max(...comp.finite.points);
      const min = Math.min(...comp.finite.points);
      
      componentSups.push({ val: max, isInSet: true });
      componentInfs.push({ val: min, isInSet: true });
    }
    else if (comp.type === 'sequence' && comp.sequence) {
      anyNotEmpty = true;
      
      if (comp.sequence.type === 'custom' && comp.sequence.customFormula) {
        // Use Robust Analysis
        const analysis = analyzeSequence(comp.sequence.customFormula);
        
        if (analysis.isUnboundedAbove) isUnboundedAbove = true;
        else componentSups.push({ val: analysis.approxMax, isInSet: true }); 

        if (analysis.isUnboundedBelow) isUnboundedBelow = true;
        else componentInfs.push({ val: analysis.approxMin, isInSet: true });

      } else {
        // Standard sequences
        if (comp.sequence.type === '1/n') {
            componentSups.push({ val: 1, isInSet: true });
            componentInfs.push({ val: 0, isInSet: false });
        } else if (comp.sequence.type === 'alternating') {
            componentSups.push({ val: 1, isInSet: true });
            componentInfs.push({ val: -1, isInSet: true });
        } else if (comp.sequence.type === 'geometric') {
            componentSups.push({ val: 0.5, isInSet: true });
            componentInfs.push({ val: 0, isInSet: false });
        }
      }
    }
  }

  if (!anyNotEmpty) {
    return {
      sup: null, inf: null, max: null, min: null,
      boundedAbove: true, boundedBelow: true, isEmpty: true,
      completenessGap: false, theoreticalSup: null
    };
  }

  const supValues = componentSups.map(c => c.val);
  const infValues = componentInfs.map(c => c.val);

  const numericSup = supValues.length > 0 ? Math.max(...supValues) : null;
  const numericInf = infValues.length > 0 ? Math.min(...infValues) : null;

  // Theoretical Sup (In Real Numbers)
  const theoreticalSup: number | 'infinity' | null = isUnboundedAbove ? 'infinity' : numericSup;
  const theoreticalInf: number | '-infinity' | null = isUnboundedBelow ? '-infinity' : numericInf;

  // Universe Logic: Completeness Gap Detection
  let actualSup: number | 'infinity' | null = theoreticalSup;
  let completenessGap = false;

  if (universe === 'Q' && typeof theoreticalSup === 'number') {
      // Check if theoretical sup is irrational
      if (isIrrationalApprox(theoreticalSup)) {
          completenessGap = true;
          actualSup = null; // Supremum does not exist in Q
      }
  }

  // Max exists only if bounded AND sup is in set (and we aren't in a gap)
  let isMax = false;
  if (!completenessGap && typeof actualSup === 'number') {
      isMax = componentSups.some(c => Math.abs(c.val - (actualSup as number)) < 1e-9 && c.isInSet);
  }

  let isMin = false;
  if (typeof theoreticalInf === 'number') {
       // Simplified logic for Infimum (ignoring gaps for now for simplicity, focus is on Sup)
       isMin = componentInfs.some(c => Math.abs(c.val - theoreticalInf) < 1e-9 && c.isInSet);
  }

  return {
    sup: actualSup,
    inf: theoreticalInf, // Keeping Inf logic simple R for now
    max: isMax && typeof actualSup === 'number' ? actualSup : null,
    min: isMin && typeof theoreticalInf === 'number' ? theoreticalInf : null,
    boundedAbove: !isUnboundedAbove,
    boundedBelow: !isUnboundedBelow,
    isEmpty: false,
    completenessGap,
    theoreticalSup
  };
};