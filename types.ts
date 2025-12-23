
export type Dimension = 1 | 2 | 3;
export type PointND = number[];

export type ExtendedReal = 
  | { type: 'value'; val: number }
  | { type: 'infinity' }
  | { type: 'neg_infinity' }
  | { type: 'empty' };

export type MetricType = 'l2' | 'l1' | 'linf';

export interface Metric {
  id: MetricType;
  name: string;
  compute: (p1: PointND, p2: PointND) => number;
}

export type ComponentType = 'interval' | 'finite' | 'sequence' | 'function';
export type TopologyType = ComponentType;

export interface SetComponent {
  id: string;
  type: TopologyType;
  interval?: {
    start: number;
    end: number;
    leftOpen: boolean;
    rightOpen: boolean;
  };
  finite?: {
    points: number[];
  };
  sequence?: {
    type: string;
    limit: number;
    customFormula?: string;
  };
  function?: {
    funcType: 'explicit' | 'parametric' | 'implicit';
    formulaX?: string;
    formulaY?: string;
    formulaZ?: string;
    domain: [number, number];
    samples: number;
  };
  color?: string;
}

export interface SpaceDomain {
  dimension: Dimension;
  bounds: {
    xMin: number;
    xMax: number;
    yMin?: number;
    yMax?: number;
    zMin?: number;
    zMax?: number;
  };
  isBoundedSpace: boolean;
}

export interface DiameterInfo {
  value: number | 'infinity' | null;
  point1?: PointND;
  point2?: PointND;
}

export interface AnalysisResult {
  sup: number | 'infinity' | null;
  inf: number | '-infinity' | null;
  max: number | null;
  min: number | null;
  diameter: number | 'infinity' | null;
  diameterInfo?: DiameterInfo;
  boundedAbove: boolean;
  boundedBelow: boolean;
  isBounded: boolean;
  isEmpty: boolean;
  dimension: Dimension;
  isCauchy?: boolean;
  convergesTo?: number | null;
  isCompleteInSpace?: boolean;
  isCompact?: boolean;
}
