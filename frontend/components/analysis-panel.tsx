"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Check, X, Play } from "lucide-react"
import type { Bounds, SetComponent } from "@/lib/types"
import { generateComponentLabel } from "@/lib/calculations"
import QvsRComparison from "./qvsr-comparison"

interface AnalysisPanelProps {
  bounds: Bounds
  components: SetComponent[]
  onAnimateClick: () => void
  epsilon?: number
  onEpsilonChange?: (eps: number) => void
}

const AnalysisPanel = ({ bounds, components, onAnimateClick, epsilon = 0.1, onEpsilonChange }: AnalysisPanelProps) => {
  return (
    <div className="p-4 h-full flex flex-col gap-4 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Analysis</h2>
        <p className="text-xs text-muted-foreground mt-1">Union properties & bounds</p>
      </div>

      {components.length > 0 && (
        <Card className="bg-secondary/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {components.map((comp) => (
              <div key={comp.id} className="text-xs flex justify-between items-center">
                <span className="font-mono text-primary">{generateComponentLabel(comp)}</span>
                <Badge variant="outline" className="text-xs">
                  {comp.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bounded Status */}
      <Card className="bg-secondary/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Bounded Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Bounded Above</span>
            <Badge variant={bounds.isBoundedAbove ? "default" : "destructive"}>
              {bounds.isBoundedAbove ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
              {bounds.isBoundedAbove ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Bounded Below</span>
            <Badge variant={bounds.isBoundedBelow ? "default" : "destructive"}>
              {bounds.isBoundedBelow ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
              {bounds.isBoundedBelow ? "Yes" : "No"}
            </Badge>
          </div>
          {bounds.isUnboundedAbove && (
            <div className="text-xs text-destructive mt-2 flex items-center gap-1">
              <X className="w-3 h-3" />
              <span>Set extends to +∞</span>
            </div>
          )}
          {bounds.isUnboundedBelow && (
            <div className="text-xs text-destructive flex items-center gap-1">
              <X className="w-3 h-3" />
              <span>Set extends to -∞</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bounds Values */}
      {!bounds.isEmpty && (
        <Card className="bg-primary/5 border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Bounds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Infimum */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">inf(A)</span>
                <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                  {bounds.isUnboundedBelow
                    ? "Does Not Exist"
                    : bounds.infimum !== null
                      ? bounds.infimum.toFixed(4)
                      : "∞"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!bounds.isUnboundedBelow ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {bounds.hasMin ? "Minimum (in set)" : "Not attained"}
                    </p>
                    {bounds.hasMin && (
                      <Badge variant="secondary" className="text-xs">
                        min ∈ A
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-destructive">A is unbounded below</p>
                )}
              </div>
            </div>

            {/* Supremum */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">sup(A)</span>
                <span className="font-mono text-base font-bold text-red-600 dark:text-red-400">
                  {bounds.isUnboundedAbove
                    ? "Does Not Exist"
                    : bounds.supremum !== null
                      ? bounds.supremum.toFixed(4)
                      : "-∞"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!bounds.isUnboundedAbove ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {bounds.hasMax ? "Maximum (in set)" : "Not attained"}
                    </p>
                    {bounds.hasMax && (
                      <Badge variant="secondary" className="text-xs">
                        max ∈ A
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-destructive">A is unbounded above</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {bounds.supremum !== null && !bounds.isUnboundedAbove && (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Epsilon Band (ε)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Visualizes: ∀ε {">"} 0, ∃a ∈ A such that sup(A) - ε {"<"} a ≤ sup(A)
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">ε = {epsilon.toFixed(3)}</span>
                <span className="text-xs text-muted-foreground">
                  [{(bounds.supremum - epsilon).toFixed(3)}, {bounds.supremum.toFixed(3)}]
                </span>
              </div>
              <Slider
                value={[epsilon]}
                onValueChange={(val) => onEpsilonChange?.(val[0])}
                min={0.01}
                max={Math.max(1, bounds.supremum / 2)}
                step={0.01}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {(bounds.isUnboundedAbove || bounds.isUnboundedBelow) && (
        <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertDescription className="text-xs text-muted-foreground">
            Epsilon band is disabled because the set A is unbounded. The supremum/infimum definition only applies to
            bounded sets.
          </AlertDescription>
        </Alert>
      )}

      {/* Completeness Axiom */}
      <Card className="border-accent/50 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Completeness Axiom</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {!bounds.isEmpty && bounds.isBoundedAbove ? (
            <Alert className="border-accent bg-transparent">
              <Check className="h-4 w-4 text-accent" />
              <AlertDescription className="text-foreground">
                <strong>A ⊆ ℝ</strong> is bounded above.
                <br />
                <strong>Therefore, sup(A) ∈ ℝ exists.</strong>
              </AlertDescription>
            </Alert>
          ) : bounds.isEmpty ? (
            <Alert className="border-muted bg-transparent">
              <AlertDescription className="text-muted-foreground">
                Set A is empty. Axiom applies vacuously.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-destructive bg-transparent">
              <X className="h-4 w-4 text-destructive" />
              <AlertDescription>A is unbounded above. No supremum in ℝ.</AlertDescription>
            </Alert>
          )}

          <p className="text-muted-foreground mt-3 leading-relaxed">
            This distinguishes <strong>ℝ</strong> from <strong>ℚ</strong>: every non-empty subset of ℝ that is bounded
            above has a supremum in ℝ.
          </p>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <Button onClick={onAnimateClick} className="w-full" variant="default">
          <Play className="w-4 h-4 mr-2" />
          Explain Step-by-Step
        </Button>

        <QvsRComparison />
      </div>

      {/* Empty State */}
      {bounds.isEmpty && (
        <Alert variant="destructive">
          <AlertDescription>Set A is empty. No bounds to analyze.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default AnalysisPanel
