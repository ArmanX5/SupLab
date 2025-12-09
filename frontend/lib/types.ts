export type BracketType = "[" | "]" | "(" | ")"

export type SetComponentType = "interval" | "finite" | "sequence"

export interface SetComponent {
  id: string
  type: SetComponentType
  // Interval properties
  start?: number | string
  end?: number | string
  leftBracket?: "[" | "("
  rightBracket?: "]" | ")"
  // Finite set properties
  elements?: number[]
  // Sequence properties
  sequenceFormula?: string
  isCustomFormula?: boolean
  label?: string
}

export interface SetDefinition {
  components: SetComponent[]
}

export interface Bounds {
  infimum: number | null
  supremum: number | null
  isBoundedBelow: boolean
  isBoundedAbove: boolean
  hasMin: boolean
  hasMax: boolean
  isEmpty: boolean
  allPoints: number[]
  isUnboundedAbove: boolean
  isUnboundedBelow: boolean
}

export interface VisualizationState {
  setDef: SetDefinition
  bounds: Bounds
  showAnimation: boolean
  zoomLevel: number
  panX: number
  epsilon?: number
  showEpsilonBand?: boolean
  zoomMode?: boolean
}

export type AnimationType = "supremum" | "infimum" | "none"
