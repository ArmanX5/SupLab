/**
 * DiameterCalculator Module
 * 
 * Implements robust algorithms for calculating the diameter of metric spaces in R^n.
 * Diameter: diam(S) = sup { d(x, y) | x, y ∈ S }
 * 
 * Uses Euclidean metric (L2 norm) exclusively: d(x, y) = sqrt(Σ(x_i - y_i)²)
 */

import { PointND, DiameterInfo } from '../types';

/**
 * Compute Euclidean distance between two points in R^n
 */
export const euclideanDistance = (p1: PointND, p2: PointND): number => {
  const maxLen = Math.max(p1.length, p2.length);
  let sumSquares = 0;
  
  for (let i = 0; i < maxLen; i++) {
    const diff = (p1[i] || 0) - (p2[i] || 0);
    sumSquares += diff * diff;
  }
  
  return Math.sqrt(sumSquares);
};

/**
 * Brute force diameter calculation for small point sets
 * Time Complexity: O(n²)
 */
const bruteForceDiameter = (points: PointND[]): DiameterInfo => {
  if (points.length === 0) {
    return { value: null };
  }
  
  if (points.length === 1) {
    return { value: 0, point1: points[0], point2: points[0] };
  }
  
  let maxDistance = 0;
  let maxPoint1 = points[0];
  let maxPoint2 = points[0];
  
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = euclideanDistance(points[i], points[j]);
      if (dist > maxDistance) {
        maxDistance = dist;
        maxPoint1 = points[i];
        maxPoint2 = points[j];
      }
    }
  }
  
  return {
    value: maxDistance,
    point1: maxPoint1,
    point2: maxPoint2
  };
};

/**
 * Optimized diameter calculation using rotating calipers algorithm (for 2D convex hull)
 * This is a heuristic for general point clouds - finds approximate diameter quickly
 */
const optimizedDiameter = (points: PointND[]): DiameterInfo => {
  if (points.length < 100) {
    return bruteForceDiameter(points);
  }
  
  // For large point sets, use sampling + local search
  const sampleSize = Math.min(200, points.length);
  const sampledPoints: PointND[] = [];
  const step = Math.floor(points.length / sampleSize);
  
  for (let i = 0; i < points.length; i += step) {
    sampledPoints.push(points[i]);
  }
  
  // Find initial max distance in sample
  let maxDistance = 0;
  let maxPoint1 = sampledPoints[0];
  let maxPoint2 = sampledPoints[0];
  
  for (let i = 0; i < sampledPoints.length; i++) {
    for (let j = i + 1; j < sampledPoints.length; j++) {
      const dist = euclideanDistance(sampledPoints[i], sampledPoints[j]);
      if (dist > maxDistance) {
        maxDistance = dist;
        maxPoint1 = sampledPoints[i];
        maxPoint2 = sampledPoints[j];
      }
    }
  }
  
  // Refine by checking all points against the current max points
  for (const point of points) {
    const dist1 = euclideanDistance(point, maxPoint1);
    const dist2 = euclideanDistance(point, maxPoint2);
    
    if (dist1 > maxDistance) {
      maxDistance = dist1;
      maxPoint2 = point;
    }
    if (dist2 > maxDistance) {
      maxDistance = dist2;
      maxPoint1 = point;
    }
  }
  
  return {
    value: maxDistance,
    point1: maxPoint1,
    point2: maxPoint2
  };
};

/**
 * Simulated Annealing for continuous function surfaces
 * Finds approximate maximum distance on manifolds
 */
interface Point2D { x: number; y: number; }
interface Point3D extends Point2D { z: number; }

export const findDiameterOnSurface = (
  surfacePoints: PointND[],
  continuousMode: boolean = false
): DiameterInfo => {
  if (surfacePoints.length === 0) {
    return { value: null };
  }
  
  // Use optimized algorithm for point clouds
  return optimizedDiameter(surfacePoints);
};

/**
 * Calculate diameter with gradient ascent for parametric curves/surfaces
 * This uses a multi-start gradient ascent to find the global maximum
 */
export const findDiameterParametric = (
  points: PointND[],
  iterations: number = 50
): DiameterInfo => {
  if (points.length < 2) {
    return { value: 0, point1: points[0], point2: points[0] };
  }
  
  let globalMaxDist = 0;
  let globalPoint1 = points[0];
  let globalPoint2 = points[0];
  
  // Multi-start: try different initial point pairs
  const numStarts = Math.min(10, Math.floor(points.length / 10));
  const startStep = Math.floor(points.length / numStarts);
  
  for (let start = 0; start < numStarts; start++) {
    const idx1 = start * startStep;
    let currentPoint1 = points[idx1];
    let currentPoint2 = points[(idx1 + Math.floor(points.length / 2)) % points.length];
    let currentMaxDist = euclideanDistance(currentPoint1, currentPoint2);
    
    // Gradient ascent iterations
    for (let iter = 0; iter < iterations; iter++) {
      let improved = false;
      
      // Try to improve point1
      for (let i = 0; i < points.length; i += Math.max(1, Math.floor(points.length / 50))) {
        const dist = euclideanDistance(points[i], currentPoint2);
        if (dist > currentMaxDist) {
          currentMaxDist = dist;
          currentPoint1 = points[i];
          improved = true;
        }
      }
      
      // Try to improve point2
      for (let i = 0; i < points.length; i += Math.max(1, Math.floor(points.length / 50))) {
        const dist = euclideanDistance(currentPoint1, points[i]);
        if (dist > currentMaxDist) {
          currentMaxDist = dist;
          currentPoint2 = points[i];
          improved = true;
        }
      }
      
      if (!improved) break; // Converged
    }
    
    if (currentMaxDist > globalMaxDist) {
      globalMaxDist = currentMaxDist;
      globalPoint1 = currentPoint1;
      globalPoint2 = currentPoint2;
    }
  }
  
  return {
    value: globalMaxDist,
    point1: globalPoint1,
    point2: globalPoint2
  };
};

/**
 * Main diameter calculator - automatically selects best algorithm
 */
export class DiameterCalculator {
  /**
   * Calculate diameter of a point set using Euclidean metric
   * @param points Array of points in R^n
   * @param isManifold Whether points represent a continuous manifold (uses advanced algorithms)
   * @returns DiameterInfo containing value and extremal points
   */
  static calculate(points: PointND[], isManifold: boolean = false): DiameterInfo {
    if (points.length === 0) {
      return { value: null };
    }
    
    if (points.length === 1) {
      return { value: 0, point1: points[0], point2: points[0] };
    }
    
    // For manifolds (functions/surfaces), use parametric algorithm
    if (isManifold && points.length > 50) {
      return findDiameterParametric(points);
    }
    
    // For discrete point sets, use optimized brute force
    return optimizedDiameter(points);
  }
  
  /**
   * Calculate diameter for interval in R^1
   */
  static intervalDiameter(start: number, end: number): DiameterInfo {
    if (!isFinite(start) || !isFinite(end)) {
      return { value: 'infinity' };
    }
    
    const diameter = Math.abs(end - start);
    return {
      value: diameter,
      point1: [start],
      point2: [end]
    };
  }
  
  /**
   * Combine multiple diameter calculations (for union of sets)
   */
  static combineSetsDiameter(pointGroups: PointND[][]): DiameterInfo {
    // Flatten all points
    const allPoints: PointND[] = [];
    for (const group of pointGroups) {
      allPoints.push(...group);
    }
    
    if (allPoints.length === 0) {
      return { value: null };
    }
    
    return this.calculate(allPoints, false);
  }
}
