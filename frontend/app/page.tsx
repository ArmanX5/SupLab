"use client"

import { useState } from "react"
import SetComposerPanel from "@/components/set-composer-panel"
import NumberLineVisualization from "@/components/number-line-visualization"
import AnalysisPanel from "@/components/analysis-panel"
import LearningPanel from "@/components/learning-panel"
import type { SetDefinition, SetComponent, VisualizationState } from "@/lib/types"
import { calculateBounds } from "@/lib/calculations"
import { Toggle } from "@/components/ui/toggle"
import { Zap } from "lucide-react"

export default function Page() {
  const [setDef, setSetDef] = useState<SetDefinition>({
    components: [
      {
        id: "1",
        type: "interval",
        start: 0,
        end: 1,
        leftBracket: "[",
        rightBracket: "]",
        label: "Interval [0, 1]",
      },
    ],
  })

  const [showAnimation, setShowAnimation] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panX, setPanX] = useState(0)
  const [epsilon, setEpsilon] = useState(0.1)
  const [showEpsilonBand, setShowEpsilonBand] = useState(false)
  const [zoomMode, setZoomMode] = useState(false)

  const bounds = calculateBounds(setDef)
  const vizState: VisualizationState = {
    setDef,
    bounds,
    showAnimation,
    zoomLevel,
    panX,
    epsilon,
    showEpsilonBand,
    zoomMode,
  }

  const handleAddComponent = (component: SetComponent) => {
    setSetDef((prev) => {
      const currentComponents = Array.isArray(prev?.components) ? prev.components : []
      return {
        components: [...currentComponents, component],
      }
    })
  }

  const handleRemoveComponent = (id: string) => {
    setSetDef((prev) => {
      const currentComponents = Array.isArray(prev?.components) ? prev.components : []
      return {
        components: currentComponents.filter((c) => c.id !== id),
      }
    })
  }

  const handleUpdateComponent = (id: string, updates: Partial<SetComponent>) => {
    setSetDef((prev) => {
      const currentComponents = Array.isArray(prev?.components) ? prev.components : []
      return {
        components: currentComponents.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }
    })
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">SupLab</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Interactive laboratory for Real Analysis: Supremum, Infimum, and Bounds
              </p>
            </div>
            <div className="flex gap-4">
              <Toggle
                pressed={showEpsilonBand}
                onPressedChange={setShowEpsilonBand}
                className="data-[state=on]:bg-accent"
              >
                <Zap className="w-4 h-4 mr-2" />
                ε-Band
              </Toggle>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Desktop Grid Layout */}
      <div className="flex-1 overflow-hidden p-4 gap-4 hidden md:grid" style={{ gridTemplateColumns: "1fr 2fr 1fr" }}>
        {/* Left Sidebar (3 cols) - Set Composer */}
        <div className="border border-border rounded-lg bg-card shadow-sm overflow-y-auto">
          <SetComposerPanel
            components={setDef.components || []}
            onAddComponent={handleAddComponent}
            onRemoveComponent={handleRemoveComponent}
            onUpdateComponent={handleUpdateComponent}
          />
        </div>

        {/* Center (6 cols) - Visualization - Fixed Height */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 border border-border rounded-lg bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border bg-secondary flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Number Line Laboratory</h2>
              <Toggle pressed={zoomMode} onPressedChange={setZoomMode} size="sm">
                <span className="text-xs">🔍 Microscope</span>
              </Toggle>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <NumberLineVisualization state={vizState} />
            </div>
          </div>

          {/* Bottom Learning Panel */}
          <div className="h-80 border border-border rounded-lg bg-card shadow-sm overflow-y-auto">
            <LearningPanel onLoadScenario={(components) => setSetDef({ components })} />
          </div>
        </div>

        {/* Right Sidebar (3 cols) - Analysis */}
        <div className="border border-border rounded-lg bg-card shadow-sm overflow-y-auto">
          <AnalysisPanel
            bounds={bounds}
            components={setDef.components || []}
            onAnimateClick={() => setShowAnimation(!showAnimation)}
            epsilon={epsilon}
            onEpsilonChange={setEpsilon}
          />
        </div>
      </div>

      {/* Mobile Layout - Stacked (fallback for small screens) */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col md:hidden gap-4">
        {/* Mobile: Stacked layout */}
        <div className="overflow-y-auto border border-border rounded-lg bg-card shadow-sm">
          <SetComposerPanel
            components={setDef.components || []}
            onAddComponent={handleAddComponent}
            onRemoveComponent={handleRemoveComponent}
            onUpdateComponent={handleUpdateComponent}
          />
        </div>

        <div className="flex-1 border border-border rounded-lg bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border bg-secondary flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Number Line Laboratory</h2>
            <Toggle pressed={zoomMode} onPressedChange={setZoomMode} size="sm">
              <span className="text-xs">🔍 Microscope</span>
            </Toggle>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <NumberLineVisualization state={vizState} />
          </div>
        </div>

        <div className="overflow-y-auto border border-border rounded-lg bg-card shadow-sm">
          <AnalysisPanel
            bounds={bounds}
            components={setDef.components || []}
            onAnimateClick={() => setShowAnimation(!showAnimation)}
            epsilon={epsilon}
            onEpsilonChange={setEpsilon}
          />
        </div>

        <div className="h-64 border border-border rounded-lg bg-card shadow-sm overflow-y-auto">
          <LearningPanel onLoadScenario={(components) => setSetDef({ components })} />
        </div>
      </div>
    </div>
  )
}
