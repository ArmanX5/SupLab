/**
 * Request validation utilities
 */

import {
  AnalyzeRequest,
  SetComponent,
  isSequenceComponent,
  isIntervalComponent
} from '../types';
import { isValidFormula } from './math-evaluator';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates the analyze request body
 */
export function validateAnalyzeRequest(body: unknown): ValidationResult {
  const errors: string[] = [];

  // Check if body exists and is an object
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const request = body as Record<string, unknown>;

  // Check if components array exists
  if (!Array.isArray(request.components)) {
    return { valid: false, errors: ['Request must contain a "components" array'] };
  }

  if (request.components.length === 0) {
    return { valid: false, errors: ['Components array must not be empty'] };
  }

  // Validate each component
  request.components.forEach((component: unknown, index: number) => {
    const componentErrors = validateComponent(component, index);
    errors.push(...componentErrors);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a single component
 */
function validateComponent(component: unknown, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Component[${index}]`;

  if (!component || typeof component !== 'object') {
    return [`${prefix}: Must be an object`];
  }

  const comp = component as Record<string, unknown>;

  if (comp.type !== 'sequence' && comp.type !== 'interval') {
    errors.push(`${prefix}: Type must be "sequence" or "interval"`);
    return errors;
  }

  if (comp.type === 'sequence') {
    // Validate sequence component
    if (typeof comp.formula !== 'string' || comp.formula.trim() === '') {
      errors.push(`${prefix}: Sequence must have a non-empty "formula" string`);
    } else if (!isValidFormula(comp.formula)) {
      errors.push(`${prefix}: Invalid or unsafe formula`);
    }

    if (typeof comp.start !== 'number' || !Number.isInteger(comp.start)) {
      errors.push(`${prefix}: Sequence must have an integer "start" value`);
    }

    if (typeof comp.end !== 'number' || !Number.isInteger(comp.end)) {
      errors.push(`${prefix}: Sequence must have an integer "end" value`);
    }

    if (typeof comp.start === 'number' && typeof comp.end === 'number') {
      if (comp.start > comp.end) {
        errors.push(`${prefix}: "start" must be less than or equal to "end"`);
      }
      if (comp.end - comp.start > 100000) {
        errors.push(`${prefix}: Sequence range too large (max 100000 elements)`);
      }
    }
  } else if (comp.type === 'interval') {
    // Validate interval component
    if (typeof comp.start !== 'number' || !isFinite(comp.start)) {
      errors.push(`${prefix}: Interval must have a finite "start" number`);
    }

    if (typeof comp.end !== 'number' || !isFinite(comp.end)) {
      errors.push(`${prefix}: Interval must have a finite "end" number`);
    }

    if (typeof comp.start === 'number' && typeof comp.end === 'number') {
      if (comp.start > comp.end) {
        errors.push(`${prefix}: Interval "start" must be less than or equal to "end"`);
      }
    }

    if (typeof comp.openStart !== 'boolean') {
      errors.push(`${prefix}: Interval must have a boolean "openStart" value`);
    }

    if (typeof comp.openEnd !== 'boolean') {
      errors.push(`${prefix}: Interval must have a boolean "openEnd" value`);
    }
  }

  return errors;
}

/**
 * Type guard to check if request is valid AnalyzeRequest
 */
export function isValidAnalyzeRequest(body: unknown): body is AnalyzeRequest {
  return validateAnalyzeRequest(body).valid;
}

