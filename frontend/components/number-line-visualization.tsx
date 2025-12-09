"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import type { VisualizationState } from "@/lib/types"
import { generateSequencePoints } from "@/lib/calculations"
import type { JSX } from "react/jsx-runtime"

interface NumberLineVisualizationProps {
  state: VisualizationState
}

const NumberLineVisualization = ({ state }: NumberLineVisualizationProps) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [hoveredX, setHoveredX] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 })
  const [zoomCenter, setZoomCenter] = useState<number | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        setDimensions({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const padding = 60
  const chartWidth = dimensions.width - 2 * padding
  const chartHeight = dimensions.height - 100
  const centerY = dimensions.height / 2 - 20

  let minX = -1
  let maxX = 2

  if (state.bounds.infimum !== null && state.bounds.supremum !== null) {
    minX = Math.min(-0.5, state.bounds.infimum - 0.5)
    maxX = Math.max(2, state.bounds.supremum + 0.5)
  }

  const displayMinX = state.zoomMode && zoomCenter !== null ? zoomCenter - (maxX - minX) / 20 : minX
  const displayMaxX = state.zoomMode && zoomCenter !== null ? zoomCenter + (maxX - minX) / 20 : maxX

  const scaleX = (x: number) => padding + ((x - displayMinX) / (displayMaxX - displayMinX)) * chartWidth
  const unscaleX = (px: number) => displayMinX + ((px - padding) / chartWidth) * (displayMaxX - displayMinX)

  const renderAxisTicks = () => {
    const ticks = []
    const step = Math.max(0.1, Math.ceil((displayMaxX - displayMinX) / 10))

    for (let i = Math.ceil(displayMinX / step) * step; i <= displayMaxX; i += step) {
      const x = scaleX(i)
      ticks.push(
        <g key={`tick-${i}`}>
          <line x1={x} y1={centerY - 5} x2={x} y2={centerY + 5} stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <text x={x} y={centerY + 25} textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.7">
            {i.toFixed(1)}
          </text>
        </g>,
      )
    }
    return ticks
  }

  const renderSetPoints = () => {
    const elements: JSX.Element[] = []
    const colors: { [key: number]: string } = {
      0: "rgb(34, 197, 94)",
      1: "rgb(59, 130, 246)",
      2: "rgb(239, 68, 68)",
    }

    const components = Array.isArray(state.setDef.components) ? state.setDef.components : []

    components.forEach((comp, compIdx) => {
      const color = colors[compIdx % 3]

      if (comp.type === "interval" && comp.start !== undefined && comp.end !== undefined) {
        const start = Math.min(comp.start, comp.end)
        const end = Math.max(comp.start, comp.end)
        const x1 = scaleX(start)
        const x2 = scaleX(end)

        elements.push(
          <motion.line
            key={`interval-${comp.id}`}
            x1={x1}
            y1={centerY}
            x2={x2}
            y2={centerY}
            stroke={color}
            strokeWidth="5"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.8, pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: compIdx * 0.1 }}
          />,
        )

        const leftIsOpen = comp.leftBracket === "("
        elements.push(
          <motion.circle
            key={`left-${comp.id}`}
            cx={x1}
            cy={centerY}
            r={leftIsOpen ? 4 : 5}
            fill={leftIsOpen ? "none" : color}
            stroke={color}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + compIdx * 0.1, duration: 0.4 }}
          />,
        )

        const rightIsOpen = comp.rightBracket === ")"
        elements.push(
          <motion.circle
            key={`right-${comp.id}`}
            cx={x2}
            cy={centerY}
            r={rightIsOpen ? 4 : 5}
            fill={rightIsOpen ? "none" : color}
            stroke={color}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + compIdx * 0.1, duration: 0.4 }}
          />,
        )
      } else if (comp.type === "finite" && comp.elements) {
        comp.elements.forEach((el, idx) => {
          const x = scaleX(el)
          elements.push(
            <motion.circle
              key={`finite-${comp.id}-${idx}`}
              cx={x}
              cy={centerY}
              r="5"
              fill={color}
              stroke={color}
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05 + compIdx * 0.1, duration: 0.4 }}
            />,
          )
        })
      } else if (comp.type === "sequence" && comp.sequenceFormula) {
        const points = generateSequencePoints(comp.sequenceFormula, 15, comp.isCustomFormula)
        points.forEach((val, idx) => {
          const x = scaleX(val)
          elements.push(
            <motion.circle
              key={`seq-${comp.id}-${idx}`}
              cx={x}
              cy={centerY}
              r="3"
              fill={color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: Math.max(0.3, 1 - (idx / points.length) * 0.5) }}
              transition={{ delay: idx * 0.05 + compIdx * 0.1, duration: 0.3 }}
            />,
          )
        })
      }
    })

    return elements
  }

  const renderEpsilonBand = () => {
    if (!state.showEpsilonBand || state.bounds.supremum === null || state.epsilon === undefined) {
      return null
    }

    const xSup = scaleX(state.bounds.supremum)
    const xMin = scaleX(state.bounds.supremum - state.epsilon)

    return (
      <motion.g key="epsilon-band">
        <motion.rect
          x={xMin}
          y={centerY - 50}
          width={xSup - xMin}
          height="100"
          fill="rgb(251, 146, 60)"
          opacity="0.2"
          animate={{ opacity: state.showEpsilonBand ? 0.25 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <motion.text
          x={(xMin + xSup) / 2}
          y={centerY - 60}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="rgb(251, 146, 60)"
          initial={{ opacity: 0 }}
          animate={{ opacity: state.showEpsilonBand ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ε = {state.epsilon.toFixed(3)}
        </motion.text>

        {state.bounds.allPoints
          .filter((p) => p > state.bounds.supremum! - state.epsilon! && p <= state.bounds.supremum!)
          .map((point, idx) => (
            <motion.circle
              key={`epsilon-highlight-${idx}`}
              cx={scaleX(point)}
              cy={centerY}
              r="6"
              fill="none"
              stroke="rgb(251, 146, 60)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
            />
          ))}
      </motion.g>
    )
  }

  const renderBounds = () => {
    const elements: JSX.Element[] = []
    const animDuration = 2

    if (state.bounds.infimum !== null) {
      const xInf = scaleX(state.bounds.infimum)

      elements.push(
        <motion.g key="infimum-group">
          <motion.rect
            x={padding}
            y={centerY - 45}
            width={state.showAnimation ? xInf - padding : 0}
            height="90"
            fill="rgb(59, 130, 246)"
            opacity="0.1"
            animate={{ width: state.showAnimation ? xInf - padding : 0 }}
            transition={{ duration: animDuration }}
          />

          <motion.line
            x1={xInf}
            y1={centerY - 40}
            x2={xInf}
            y2={centerY + 40}
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ opacity: 0 }}
            animate={{ opacity: state.showAnimation ? 0.9 : 0.5 }}
            transition={{ duration: 0.5 }}
          />

          <motion.circle
            cx={xInf}
            cy={centerY - 55}
            r="4"
            fill="rgb(59, 130, 246)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: state.showAnimation ? 1 : 0.6, scale: 1 }}
            transition={{ duration: 0.5 }}
          />

          <motion.text
            x={xInf}
            y={centerY - 70}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="rgb(59, 130, 246)"
            initial={{ opacity: 0 }}
            animate={{ opacity: state.showAnimation ? 1 : 0.6 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            inf
          </motion.text>
        </motion.g>,
      )
    }

    if (state.bounds.supremum !== null) {
      const xSup = scaleX(state.bounds.supremum)

      elements.push(
        <motion.g key="supremum-group">
          <motion.rect
            x={state.showAnimation ? xSup : dimensions.width - padding}
            y={centerY - 45}
            width={state.showAnimation ? dimensions.width - padding - xSup : 0}
            height="90"
            fill="rgb(239, 68, 68)"
            opacity="0.1"
            animate={{ width: state.showAnimation ? dimensions.width - padding - xSup : 0 }}
            transition={{ duration: animDuration }}
          />

          <motion.line
            x1={xSup}
            y1={centerY - 40}
            x2={xSup}
            y2={centerY + 40}
            stroke="rgb(239, 68, 68)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ opacity: 0 }}
            animate={{ opacity: state.showAnimation ? 0.9 : 0.5 }}
            transition={{ duration: 0.5 }}
          />

          <motion.circle
            cx={xSup}
            cy={centerY - 55}
            r="4"
            fill="rgb(239, 68, 68)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: state.showAnimation ? 1 : 0.6, scale: 1 }}
            transition={{ duration: 0.5 }}
          />

          <motion.text
            x={xSup}
            y={centerY - 70}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="rgb(239, 68, 68)"
            initial={{ opacity: 0 }}
            animate={{ opacity: state.showAnimation ? 1 : 0.6 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            sup
          </motion.text>
        </motion.g>,
      )
    }

    return elements
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const x = unscaleX(px)
    setHoveredX(x)

    if (state.zoomMode) {
      setZoomCenter(x)
    }
  }

  return (
    <div
      ref={canvasRef}
      className="w-full h-full flex items-center justify-center bg-gradient-to-b from-secondary to-background"
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="text-foreground"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredX(null)
          if (state.zoomMode) setZoomCenter(null)
        }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width={scaleX(1) - scaleX(0)} height="20" patternUnits="userSpaceOnUse">
            <path
              d={`M ${scaleX(0) - padding} 0 L ${scaleX(0) - padding} 20`}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>
        </defs>
        <rect width={dimensions.width} height={dimensions.height} fill="url(#grid)" opacity="0.5" />

        {/* Main axis line */}
        <line
          x1={padding}
          y1={centerY}
          x2={dimensions.width - padding}
          y2={centerY}
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.8"
        />

        {/* Axis arrows */}
        <polygon
          points={`${dimensions.width - padding + 5},${centerY} ${dimensions.width - padding - 8},${centerY - 5} ${dimensions.width - padding - 8},${centerY + 5}`}
          fill="currentColor"
          opacity="0.6"
        />

        {/* Axis ticks */}
        {renderAxisTicks()}

        {/* Set visualization */}
        {renderSetPoints()}

        {/* Epsilon band */}
        {renderEpsilonBand()}

        {/* Bounds visualization */}
        {renderBounds()}

        {hoveredX !== null && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 0.2 }}>
            <line
              x1={scaleX(hoveredX)}
              y1={centerY - 50}
              x2={scaleX(hoveredX)}
              y2={centerY + 50}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text x={scaleX(hoveredX)} y={centerY + 70} textAnchor="middle" fontSize="11" fill="currentColor">
              x = {hoveredX.toFixed(3)}
            </text>

            {/* Microscope lens circle */}
            {state.zoomMode && (
              <circle
                cx={scaleX(hoveredX)}
                cy={centerY}
                r="40"
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            )}
          </motion.g>
        )}
      </svg>
    </div>
  )
}

export default NumberLineVisualization
