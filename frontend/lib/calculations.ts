import type { SetComponent, SetDefinition, Bounds } from "./types"

function parseInfinity(val: number | string | undefined): number | null {
  if (val === undefined) return null
  if (typeof val === "number") return isFinite(val) ? val : null

  const str = String(val).toLowerCase().trim()
  if (str === "inf" || str === "infinity" || str === "∞" || str === "+∞") return Number.POSITIVE_INFINITY
  if (str === "-inf" || str === "-infinity" || str === "-∞") return Number.NEGATIVE_INFINITY

  const num = Number.parseFloat(str)
  return isFinite(num) ? num : null
}

function isSequenceUnbounded(points: number[]): boolean {
  if (points.length < 10) return false

  const recentMax = Math.max(...points.slice(-5))
  const absMax = Math.abs(recentMax)

  // If max absolute value is very large and growing, likely unbounded
  return absMax > 1000 || (absMax > 100 && points[points.length - 1] > points[0])
}

function calculateComponentBounds(component: SetComponent): {
  points: number[]
  infimum: number | null
  supremum: number | null
  hasMin: boolean
  hasMax: boolean
  isUnbounded: boolean
} {
  let points: number[] = []
  let infimum: number | null = null
  let supremum: number | null = null
  let hasMin = false
  let hasMax = false
  let isUnbounded = false

  switch (component.type) {
    case "interval": {
      const startVal = parseInfinity(component.start)
      const endVal = parseInfinity(component.end)

      if (startVal === null || endVal === null) break

      const start = Math.min(startVal, endVal)
      const end = Math.max(startVal, endVal)

      let actualLeftBracket = component.leftBracket || "["
      let actualRightBracket = component.rightBracket || "]"

      if (startVal === Number.NEGATIVE_INFINITY) actualLeftBracket = "("
      if (endVal === Number.POSITIVE_INFINITY) actualRightBracket = ")"

      infimum = isFinite(start) ? start : null
      supremum = isFinite(end) ? end : null
      hasMin = isFinite(start) && actualLeftBracket === "["
      hasMax = isFinite(end) && actualRightBracket === "]"
      isUnbounded = !isFinite(start) || !isFinite(end)

      if (isFinite(start) && isFinite(end)) {
        const step = (end - start) / 20
        for (let i = 0; i <= 20; i++) {
          points.push(start + i * step)
        }
      } else if (isFinite(start) && !isFinite(end)) {
        const step = 1
        for (let i = 0; i <= 20; i++) {
          points.push(start + i * step)
        }
      } else if (!isFinite(start) && isFinite(end)) {
        for (let i = 0; i <= 20; i++) {
          points.push(end - (20 - i))
        }
      }
      break
    }

    case "finite": {
      if (!component.elements || component.elements.length === 0) break

      points = [...component.elements]
      infimum = Math.min(...component.elements)
      supremum = Math.max(...component.elements)
      hasMin = true
      hasMax = true
      break
    }

    case "sequence": {
      const seqPoints = generateSequencePoints(component.sequenceFormula || "1/n", 50, component.isCustomFormula)
      points = seqPoints

      isUnbounded = isSequenceUnbounded(seqPoints)

      if (!component.isCustomFormula) {
        if (component.sequenceFormula === "1/n") {
          infimum = 0
          supremum = 1
          hasMin = false
          hasMax = true
        } else if (component.sequenceFormula === "(-1)^n") {
          infimum = -1
          supremum = 1
          hasMin = true
          hasMax = true
        } else if (component.sequenceFormula === "n/(n+1)") {
          infimum = 0.5
          supremum = 1
          hasMin = true
          hasMax = false
        } else if (component.sequenceFormula === "1 - 1/n") {
          infimum = 0
          supremum = 1
          hasMin = false
          hasMax = false
        }
      } else {
        if (isUnbounded) {
          infimum = null
          supremum = null
        } else if (seqPoints.length > 0) {
          const validPoints = seqPoints.filter((p) => typeof p === "number" && !isNaN(p))
          if (validPoints.length > 0) {
            infimum = Math.min(...validPoints)
            supremum = Math.max(...validPoints)
            hasMin = true
            hasMax = true
          }
        }
      }
      break
    }
  }

  return { points, infimum, supremum, hasMin, hasMax, isUnbounded }
}

export function calculateBounds(setDef: SetDefinition): Bounds {
  const components = Array.isArray(setDef?.components) ? setDef.components : []

  if (components.length === 0) {
    return {
      infimum: null,
      supremum: null,
      isBoundedBelow: false,
      isBoundedAbove: false,
      hasMin: false,
      hasMax: false,
      isEmpty: true,
      allPoints: [],
      isUnboundedAbove: false,
      isUnboundedBelow: false,
    }
  }

  let allPoints: number[] = []
  let minInf: number | null = null
  let maxSup: number | null = null
  let unionHasMin = false
  let unionHasMax = false
  let hasUnboundedAbove = false
  let hasUnboundedBelow = false

  for (const component of components) {
    const { points, infimum, supremum, hasMin, hasMax, isUnbounded } = calculateComponentBounds(component)
    allPoints = [...allPoints, ...points]

    if (component.type === "interval") {
      const startVal = parseInfinity(component.start)
      const endVal = parseInfinity(component.end)
      if (startVal === Number.NEGATIVE_INFINITY) hasUnboundedBelow = true
      if (endVal === Number.POSITIVE_INFINITY) hasUnboundedAbove = true
    } else if (isUnbounded) {
      hasUnboundedAbove = true
      hasUnboundedBelow = true
    }

    if (infimum !== null) {
      minInf = minInf === null ? infimum : Math.min(minInf, infimum)
      unionHasMin = unionHasMin || hasMin
    }

    if (supremum !== null) {
      maxSup = maxSup === null ? supremum : Math.max(maxSup, supremum)
      unionHasMax = unionHasMax || hasMax
    }
  }

  allPoints = Array.from(new Set(allPoints)).sort((a, b) => a - b)

  return {
    infimum: minInf,
    supremum: maxSup,
    isBoundedBelow: minInf !== null && !hasUnboundedBelow,
    isBoundedAbove: maxSup !== null && !hasUnboundedAbove,
    hasMin: unionHasMin,
    hasMax: unionHasMax,
    isEmpty: allPoints.length === 0,
    allPoints,
    isUnboundedAbove: hasUnboundedAbove,
    isUnboundedBelow: hasUnboundedBelow,
  }
}

export function evaluateCustomSequenceFormula(formula: string, n: number): number {
  try {
    const sanitized = formula.replace(/\^/g, "**").replace(/n/g, `(${n})`)

    // Basic safe eval using Function - only allows math operations
    const func = new Function("return " + sanitized)
    const result = func()

    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return result
    }
    throw new Error("Invalid result")
  } catch {
    throw new Error("Invalid formula")
  }
}

export function generateSequencePoints(formula: string, count = 20, isCustom = false): number[] {
  const points: number[] = []

  for (let n = 1; n <= count; n++) {
    let value: number

    if (isCustom) {
      try {
        value = evaluateCustomSequenceFormula(formula, n)
      } catch {
        continue
      }
    } else {
      // Preset formulas
      switch (formula) {
        case "1/n":
          value = 1 / n
          break
        case "(-1)^n":
          value = Math.pow(-1, n)
          break
        case "n/(n+1)":
          value = n / (n + 1)
          break
        case "1 - 1/n":
          value = 1 - 1 / n
          break
        default:
          value = n
      }
    }

    if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
      points.push(value)
    }
  }

  return points
}

export function generateComponentLabel(component: SetComponent): string {
  switch (component.type) {
    case "interval": {
      const start = component.start ?? 0
      const end = component.end ?? 1
      return `${component.leftBracket || "["}${start}, ${end}${component.rightBracket || "]"}`
    }
    case "finite": {
      const els = component.elements
        ?.slice(0, 3)
        .map((e) => e.toFixed(1))
        .join(", ")
      const suffix = (component.elements?.length ?? 0) > 3 ? ", ..." : ""
      return `{${els}${suffix}}`
    }
    case "sequence": {
      return `${component.sequenceFormula}`
    }
  }
}
