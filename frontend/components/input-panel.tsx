"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { SetDefinition } from "@/lib/types"

interface InputPanelProps {
  setDef: SetDefinition
  onSetDefChange: (def: SetDefinition) => void
}

const InputPanel = ({ setDef, onSetDefChange }: InputPanelProps) => {
  const [finiteInput, setFiniteInput] = useState("")

  const handleIntervalChange = (field: keyof SetDefinition, value: any) => {
    onSetDefChange({
      ...setDef,
      [field]: value,
    })
  }

  const handleAddElement = () => {
    const num = Number.parseFloat(finiteInput)
    if (!isNaN(num)) {
      const newElements = [...(setDef.elements || []), num]
      onSetDefChange({
        type: "finite",
        elements: newElements.sort((a, b) => a - b),
      })
      setFiniteInput("")
    }
  }

  const handleRemoveElement = (idx: number) => {
    const newElements = setDef.elements?.filter((_, i) => i !== idx) || []
    onSetDefChange({
      type: "finite",
      elements: newElements,
    })
  }

  const handleGenerateRandom = () => {
    const count = Math.floor(Math.random() * 5) + 3
    const elements = Array.from({ length: count }, () => Math.random() * 5 - 1)
    onSetDefChange({
      type: "finite",
      elements: elements.sort((a, b) => a - b),
    })
  }

  const handleSequenceSelect = (formula: string) => {
    onSetDefChange({
      type: "sequence",
      sequenceFormula: formula,
    })
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Set Definition</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure set A ⊆ ℝ</p>
      </div>

      <Tabs
        defaultValue="interval"
        value={setDef.type}
        onValueChange={(type: any) => {
          if (type === "interval") {
            onSetDefChange({
              type: "interval",
              start: 0,
              end: 1,
              leftBracket: "[",
              rightBracket: "]",
            })
          } else if (type === "finite") {
            onSetDefChange({ type: "finite", elements: [0, 1] })
          } else if (type === "sequence") {
            onSetDefChange({ type: "sequence", sequenceFormula: "1/n" })
          }
        }}
        className="flex-1"
      >
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="interval" className="text-xs">
            Interval
          </TabsTrigger>
          <TabsTrigger value="finite" className="text-xs">
            Finite
          </TabsTrigger>
          <TabsTrigger value="sequence" className="text-xs">
            Sequence
          </TabsTrigger>
          <TabsTrigger value="function" className="text-xs">
            Function
          </TabsTrigger>
        </TabsList>

        {/* Interval Tab */}
        <TabsContent value="interval" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="start">Start Value</Label>
            <Input
              id="start"
              type="number"
              value={setDef.start ?? 0}
              onChange={(e) => handleIntervalChange("start", Number.parseFloat(e.target.value))}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end">End Value</Label>
            <Input
              id="end"
              type="number"
              value={setDef.end ?? 1}
              onChange={(e) => handleIntervalChange("end", Number.parseFloat(e.target.value))}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Left Bracket</Label>
            <div className="flex gap-2">
              <Button
                variant={setDef.leftBracket === "[" ? "default" : "outline"}
                size="sm"
                onClick={() => handleIntervalChange("leftBracket", "[")}
                className="flex-1"
              >
                [
              </Button>
              <Button
                variant={setDef.leftBracket === "(" ? "default" : "outline"}
                size="sm"
                onClick={() => handleIntervalChange("leftBracket", "(")}
                className="flex-1"
              >
                (
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Right Bracket</Label>
            <div className="flex gap-2">
              <Button
                variant={setDef.rightBracket === "]" ? "default" : "outline"}
                size="sm"
                onClick={() => handleIntervalChange("rightBracket", "]")}
                className="flex-1"
              >
                ]
              </Button>
              <Button
                variant={setDef.rightBracket === ")" ? "default" : "outline"}
                size="sm"
                onClick={() => handleIntervalChange("rightBracket", ")")}
                className="flex-1"
              >
                )
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Finite Set Tab */}
        <TabsContent value="finite" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="element-input">Add Element</Label>
            <div className="flex gap-2">
              <Input
                id="element-input"
                type="number"
                value={finiteInput}
                onChange={(e) => setFiniteInput(e.target.value)}
                placeholder="Enter number"
                className="text-sm"
              />
              <Button onClick={handleAddElement} size="sm" className="px-3">
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Elements</Label>
            <div className="flex flex-wrap gap-1">
              {setDef.elements?.map((el, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveElement(idx)}
                >
                  {el.toFixed(2)} ✕
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerateRandom} variant="outline" size="sm" className="w-full bg-transparent">
            Generate Random Set
          </Button>
        </TabsContent>

        {/* Sequence Tab */}
        <TabsContent value="sequence" className="space-y-3">
          <div className="space-y-2">
            <Label>Select Sequence</Label>
            <Select value={setDef.sequenceFormula || "1/n"} onValueChange={handleSequenceSelect}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1/n">
                  <span className="font-mono">1/n</span>
                </SelectItem>
                <SelectItem value="(-1)^n">
                  <span className="font-mono">(-1)^n</span>
                </SelectItem>
                <SelectItem value="n/(n+1)">
                  <span className="font-mono">n/(n+1)</span>
                </SelectItem>
                <SelectItem value="1 - 1/n">
                  <span className="font-mono">1 - 1/n</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-secondary/50">
            <CardContent className="text-xs text-muted-foreground pt-3">
              <p>
                <strong>Formula:</strong> {setDef.sequenceFormula}
              </p>
              <p className="mt-2">Shows first 15 terms of the sequence.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Function Tab */}
        <TabsContent value="function" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="func-formula">Formula: f(x) =</Label>
            <Input
              id="func-formula"
              type="text"
              placeholder="e.g., x^2, sin(x), etc."
              value={setDef.functionFormula || ""}
              onChange={(e) => handleIntervalChange("functionFormula", e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Domain</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Start"
                value={setDef.functionDomain?.[0] ?? "-1"}
                onChange={(e) => {
                  const start = Number.parseFloat(e.target.value)
                  const end = setDef.functionDomain?.[1] ?? 1
                  handleIntervalChange("functionDomain", [start, end])
                }}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="End"
                value={setDef.functionDomain?.[1] ?? "1"}
                onChange={(e) => {
                  const start = setDef.functionDomain?.[0] ?? -1
                  const end = Number.parseFloat(e.target.value)
                  handleIntervalChange("functionDomain", [start, end])
                }}
                className="text-sm"
              />
            </div>
          </div>

          <Card className="bg-secondary/50">
            <CardContent className="text-xs text-muted-foreground pt-3">
              <p className="text-accent">Coming soon: Visual function plotting</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InputPanel
