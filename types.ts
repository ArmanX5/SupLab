export type ComponentType = 'interval' | 'finite' | 'sequence';
export type Universe = 'R' | 'Q';

export type IntervalParams = {
  start: number;
  end: number;
  leftOpen: boolean;
  rightOpen: boolean;
};

export type SequenceType = '1/n' | 'harmonic' | 'alternating' | 'geometric' | 'custom';

export type SequenceParams = {
  type: SequenceType;
  customFormula?: string;
  limit: number;
};

export type FiniteParams = {
  points: number[];
};

export interface SetComponent {
  id: string;
  type: ComponentType;
  interval?: IntervalParams;
  finite?: FiniteParams;
  sequence?: SequenceParams;
  color?: string;
}

export interface AnalysisResult {
  sup: number | 'infinity' | null; // The actual supremum in the current universe
  inf: number | '-infinity' | null;
  max: number | null;
  min: number | null;
  boundedAbove: boolean;
  boundedBelow: boolean;
  isEmpty: boolean;
  
  // Completeness Axiom specific fields
  completenessGap: boolean; // True if bounded but sup DNE in universe
  theoreticalSup: number | 'infinity' | null; // The sup in R (for visualization)
}