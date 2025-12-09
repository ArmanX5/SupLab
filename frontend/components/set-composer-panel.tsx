"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus } from "lucide-react"
import type { SetComponent, SetComponentType } from "@/lib/types"
import { generateComponentLabel, evaluateCustomSequenceFormula } from "@/lib/calculations"

interface SetComposerPanelProps {
  components: SetComponent[] | undefined
  onAddComponent: (component: SetComponent) => void
  onRemoveComponent: (id: string) => void
  onUpdateComponent: (id: string, updates: Partial<SetComponent>) => void
}

const SetComposerPanel = ({
  components,
  onAddComponent,
  onRemoveComponent,
  onUpdateComponent,
}: SetComposerPanelProps) => {
  const [selectedType, setSelectedType] = useState<SetComponentType>("interval")
  const [finiteInput, setFiniteInput] = useState("")
  const [customFormula, setCustomFormula] = useState("")
  const [formulaError, setFormulaError] = useState("")
  const [formulaPreview, setFormulaPreview] = useState<number[]>([])
  const [intervalStart, setIntervalStart] = useState<string>("0")
  const [intervalEnd, setIntervalEnd] = useState<string>("1")

  const handleCustomFormulaChange = (val: string) => {
    setCustomFormula(val)
    setFormulaError("")

    if (val.trim() === "") {
      setFormulaPreview([])
      return
    }

    try {
      // Try to evaluate with n = 1 to 5 for preview
      const preview = []
      for (let n = 1; n <= 5; n++) {
        const result = evaluateCustomSequenceFormula(val, n)
        if (typeof result === "number" && !isNaN(result)) {
          preview.push(result)
        } else {
          throw new Error("Invalid formula")
        }
      }
      setFormulaPreview(preview)
    } catch {
      setFormulaError("Invalid Formula")
      setFormulaPreview([])
    }
  }

  const addNewComponent = () => {
    const id = `comp-${Date.now()}`

    if (selectedType === "interval") {
      onAddComponent({
        id,
        type: "interval",
        start: intervalStart,
        end: intervalEnd,
        leftBracket: "[",
        rightBracket: "]",
      })
      setIntervalStart("0")
      setIntervalEnd("1")
    } else if (selectedType === "finite") {
      onAddComponent({
        id,
        type: "finite",
        elements: [],
      })
    } else if (selectedType === "sequence") {
      const formula = customFormula.trim() || "1/n"
      onAddComponent({
        id,
        type: "sequence",
        sequenceFormula: formula,
        isCustomFormula: customFormula.trim() !== "",
      })
      setCustomFormula("")
      setFormulaPreview([])
    }
  }

  const handleAddElement = (compId: string) => {
    const num = Number.parseFloat(finiteInput)
    if (!isNaN(num)) {
      const comp = components?.find((c) => c.id === compId)
      if (comp && comp.type === "finite") {
        const newElements = [...(comp.elements || []), num]
        onUpdateComponent(compId, { elements: newElements.sort((a, b) => a - b) })
        setFiniteInput("")
      }
    }
  }

  const handleRemoveElement = (compId: string, idx: number) => {
    const comp = components?.find((c) => c.id === compId)
    if (comp && comp.type === "finite") {
      const newElements = comp.elements?.filter((_, i) => i !== idx) || []
      onUpdateComponent(compId, { elements: newElements })
    }
  }

  const safeComponents = Array.isArray(components) ? components : []

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Set Composer</h2>
        <p className="text-xs text-muted-foreground mt-1">Build A = ⋃ of components</p>
      </div>

      {/* Add Component Section */}
      <Card className="bg-secondary/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">+ Add Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="component-type">Type</Label>
            <Select value={selectedType} onValueChange={(val) => setSelectedType(val as SetComponentType)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interval">Interval</SelectItem>
                <SelectItem value="finite">Finite Set</SelectItem>
                <SelectItem value="sequence">Sequence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedType === "interval" && (
            <div className="space-y-2 border-t pt-3">
              <Label htmlFor="interval-start">Start</Label>
              <div className="flex gap-2">
                <input
                  id="interval-start"
                  type="text"
                  placeholder="e.g., -Inf or 0"
                  value={intervalStart}
                  onChange={(e) => setIntervalStart(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border rounded bg-background text-foreground"
                />
                <button
                  onClick={() => setIntervalStart("-Inf")}
                  className="px-2 py-1 text-xs bg-secondary border rounded hover:bg-secondary/80"
                  title="Insert -∞"
                >
                  -∞
                </button>
              </div>

              <Label htmlFor="interval-end">End</Label>
              <div className="flex gap-2">
                <input
                  id="interval-end"
                  type="text"
                  placeholder="e.g., Inf or 1"
                  value={intervalEnd}
                  onChange={(e) => setIntervalEnd(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border rounded bg-background text-foreground"
                />
                <button
                  onClick={() => setIntervalEnd("Inf")}
                  className="px-2 py-1 text-xs bg-secondary border rounded hover:bg-secondary/80"
                  title="Insert +∞"
                >
                  +∞
                </button>
              </div>
            </div>
          )}

          {selectedType === "sequence" && (
            <div className="space-y-2 border-t pt-3">
              <Label htmlFor="custom-formula">Custom Formula a_n =</Label>
              <Input
                id="custom-formula"
                placeholder="e.g., (-1)^n / n or (n+1)/n"
                value={customFormula}
                onChange={(e) => handleCustomFormulaChange(e.target.value)}
                className="text-xs h-8"
              />

              {formulaError && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-xs">{formulaError}</AlertDescription>
                </Alert>
              )}

              {formulaPreview.length > 0 && (
                <div className="space-y-1 bg-secondary/50 p-2 rounded">
                  <p className="text-xs text-muted-foreground">Preview (first 5 terms):</p>
                  <p className="text-xs font-mono">
                    {formulaPreview.map((v) => v.toFixed(3)).join(", ")}
                    {formulaPreview.length > 0 && ", ..."}
                  </p>
                </div>
              )}

              <Label htmlFor="preset-formula" className="mt-2">
                Or choose preset:
              </Label>
              <Select value={customFormula ? "" : "1/n"} onValueChange={(val) => handleCustomFormulaChange(val)}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1/n">1/n</SelectItem>
                  <SelectItem value="(-1)^n">(-1)^n</SelectItem>
                  <SelectItem value="n/(n+1)">n/(n+1)</SelectItem>
                  <SelectItem value="1 - 1/n">1 - 1/n</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={addNewComponent} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add to Union
          </Button>
        </CardContent>
      </Card>

      {/* Components List */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Components ({safeComponents.length})</Label>

        {safeComponents.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-xs">No components yet. Add one to begin.</div>
        )}

        {safeComponents.map((comp, idx) => (
          <Card key={comp.id} className="bg-background border-primary/30">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-primary">{generateComponentLabel(comp)}</p>
                  <p className="text-xs text-muted-foreground">{comp.type}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemoveComponent(comp.id)} className="h-6 w-6 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Component-specific Editor */}
            <CardContent className="space-y-2 text-sm">
              {comp.type === "interval" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Start</Label>
                      <input
                        type="text"
                        value={comp.start ?? 0}
                        onChange={(e) => onUpdateComponent(comp.id, { start: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End</Label>
                      <input
                        type="text"
                        value={comp.end ?? 1}
                        onChange={(e) => onUpdateComponent(comp.id, { end: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={comp.leftBracket === "[" ? "default" : "outline"}
                      size="sm"
                      onClick={() => onUpdateComponent(comp.id, { leftBracket: "[" })}
                      className="flex-1 text-xs h-8"
                    >
                      [
                    </Button>
                    <Button
                      variant={comp.leftBracket === "(" ? "default" : "outline"}
                      size="sm"
                      onClick={() => onUpdateComponent(comp.id, { leftBracket: "(" })}
                      className="flex-1 text-xs h-8"
                    >
                      (
                    </Button>
                    <Button
                      variant={comp.rightBracket === "]" ? "default" : "outline"}
                      size="sm"
                      onClick={() => onUpdateComponent(comp.id, { rightBracket: "]" })}
                      className="flex-1 text-xs h-8"
                    >
                      ]
                    </Button>
                    <Button
                      variant={comp.rightBracket === ")" ? "default" : "outline"}
                      size="sm"
                      onClick={() => onUpdateComponent(comp.id, { rightBracket: ")" })}
                      className="flex-1 text-xs h-8"
                    >
                      )
                    </Button>
                  </div>
                </>
              )}

              {comp.type === "finite" && (
                <>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add element"
                      value={finiteInput}
                      onChange={(e) => setFiniteInput(e.target.value)}
                      className="text-xs h-8 flex-1"
                    />
                    <Button onClick={() => handleAddElement(comp.id)} size="sm" className="px-2 h-8">
                      +
                    </Button>
                  </div>

                  {comp.elements && comp.elements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {comp.elements.map((el, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive text-xs"
                          onClick={() => handleRemoveElement(comp.id, i)}
                        >
                          {el.toFixed(2)} ✕
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}

              {comp.type === "sequence" && (
                <div className="space-y-2">
                  {comp.isCustomFormula ? (
                    <div className="text-xs">
                      <p className="text-muted-foreground mb-1">Formula:</p>
                      <p className="font-mono bg-secondary/50 p-2 rounded">{comp.sequenceFormula}</p>
                    </div>
                  ) : (
                    <Select
                      value={comp.sequenceFormula || "1/n"}
                      onValueChange={(val) => onUpdateComponent(comp.id, { sequenceFormula: val })}
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1/n">1/n</SelectItem>
                        <SelectItem value="(-1)^n">(-1)^n</SelectItem>
                        <SelectItem value="n/(n+1)">n/(n+1)</SelectItem>
                        <SelectItem value="1 - 1/n">1 - 1/n</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SetComposerPanel
