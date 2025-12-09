/**
 * Type definitions for set components
 */

export interface SequenceComponent {
  type: 'sequence';
  formula: string;
  start: number;
  end: number;
}

export interface IntervalComponent {
  type: 'interval';
  start: number;
  end: number;
  openStart: boolean;
  openEnd: boolean;
}

export type SetComponent = SequenceComponent | IntervalComponent;

export interface AnalyzeRequest {
  components: SetComponent[];
}

export function isSequenceComponent(component: SetComponent): component is SequenceComponent {
  return component.type === 'sequence';
}

export function isIntervalComponent(component: SetComponent): component is IntervalComponent {
  return component.type === 'interval';
}

