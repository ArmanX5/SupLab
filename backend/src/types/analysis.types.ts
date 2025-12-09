/**
 * Type definitions for analysis results
 */

export interface EpsilonBand {
  epsilon: number;
  interval: [number, number];
}

export interface AnalysisResult {
  boundedAbove: boolean;
  boundedBelow: boolean;
  sup: number | null;
  inf: number | null;
  max: number | null;
  min: number | null;
  epsilonBand: EpsilonBand | null;
}

export interface SetAnalysisData {
  values: number[];
  intervalBounds: IntervalBoundInfo[];
}

export interface IntervalBoundInfo {
  start: number;
  end: number;
  openStart: boolean;
  openEnd: boolean;
}

