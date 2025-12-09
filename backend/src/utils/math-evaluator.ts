/**
 * Safe math expression evaluator using mathjs
 */

import { create, all, MathJsStatic } from 'mathjs';

// Create a mathjs instance with all functions
const math: MathJsStatic = create(all);

// Create a limited scope for safe evaluation
const limitedScope = {
  // Basic math constants
  pi: Math.PI,
  e: Math.E,
  // Allowed functions - whitelist approach for safety
  abs: Math.abs,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  log: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
  pow: Math.pow,
};

/**
 * Safely evaluates a mathematical formula for a given value of n
 * @param formula - Mathematical expression (e.g., "(-1)^n / n")
 * @param n - The value to substitute for 'n'
 * @returns The evaluated result or null if evaluation fails
 */
export function evaluateFormula(formula: string, n: number): number | null {
  try {
    // Create scope with n value
    const scope = {
      ...limitedScope,
      n: n,
    };

    // Parse and evaluate the expression
    const result = math.evaluate(formula, scope);

    // Ensure result is a valid number
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }

    // Handle mathjs number type
    if (typeof result === 'object' && result !== null) {
      const numResult = Number(result);
      if (isFinite(numResult)) {
        return numResult;
      }
    }

    return null;
  } catch (error) {
    // Log error for debugging but don't crash
    console.warn(`Failed to evaluate formula "${formula}" for n=${n}:`, error);
    return null;
  }
}

/**
 * Validates that a formula string is safe to evaluate
 * @param formula - The formula to validate
 * @returns true if the formula appears safe
 */
export function isValidFormula(formula: string): boolean {
  // Basic validation - check for potentially dangerous patterns
  const dangerousPatterns = [
    /import/i,
    /require/i,
    /eval/i,
    /function/i,
    /=>/,
    /\.\./,
    /process/i,
    /global/i,
    /window/i,
    /document/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(formula)) {
      return false;
    }
  }

  // Try to parse the formula to check syntax
  try {
    math.parse(formula);
    return true;
  } catch {
    return false;
  }
}

