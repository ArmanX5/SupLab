"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import type { SetDefinition } from "@/lib/types"

interface LearningPanelProps {
  onLoadScenario: (setDef: SetDefinition) => void
}

const LearningPanel = ({ onLoadScenario }: LearningPanelProps) => {
  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      <div>
        <h3 className="font-semibold text-sm text-foreground">Definitions & Theory</h3>
      </div>

      {/* Definitions Accordion */}
      <Accordion type="single" collapsible className="text-xs">
        <AccordionItem value="supremum">
          <AccordionTrigger className="py-2 text-xs font-medium">
            Definition: Supremum (Least Upper Bound)
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
            <p>
              The supremum (sup) of a set <strong>A</strong> is the smallest value <strong>M</strong> such that:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Upper bound:</strong> All elements of A ≤ M
              </li>
              <li>
                <strong>Least:</strong> For any m {"<"} M, there exists a ∈ A with a {">"} m
              </li>
            </ul>
            <p className="mt-2">
              <strong>Key:</strong> sup(A) may or may not be in A. For (0,1), sup = 1 but 1 ∉ (0,1).
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="infimum">
          <AccordionTrigger className="py-2 text-xs font-medium">
            Definition: Infimum (Greatest Lower Bound)
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
            <p>
              The infimum (inf) of a set <strong>A</strong> is the largest value <strong>m</strong> such that:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Lower bound:</strong> All elements of A ≥ m
              </li>
              <li>
                <strong>Greatest:</strong> For any M {">"} m, there exists a ∈ A with a {"<"} M
              </li>
            </ul>
            <p className="mt-2">
              <strong>Key:</strong> inf(A) may or may not be in A.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="completeness">
          <AccordionTrigger className="py-2 text-xs font-medium">The Completeness Axiom</AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
            <p>
              <strong>Statement:</strong> Every non-empty subset of ℝ that is bounded above has a least upper bound
              (supremum) in ℝ.
            </p>
            <p className="mt-2">
              This axiom is fundamental to real analysis and <strong>distinguishes ℝ from ℚ</strong>. The rationals ℚ do
              not satisfy this axiom.
            </p>
            <div className="mt-3 p-2 bg-accent/10 rounded">
              <p className="font-medium text-accent">Counter-example in ℚ:</p>
              <p className="mt-1">
                {"{"}x ∈ ℚ : x² {"<"} 2{"}"} is bounded above in ℚ, but has no supremum in ℚ (since √2 ∉ ℚ).
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="max-sup">
          <AccordionTrigger className="py-2 text-xs font-medium">Difference: Maximum vs Supremum</AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground">Maximum</p>
                <p>
                  The maximum of A is the largest element that is <strong>in A</strong>.
                </p>
                <p className="mt-1">max(A) always satisfies: max(A) ∈ A and max(A) = sup(A)</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Supremum</p>
                <p>The supremum is the least upper bound, which may or may not be in A.</p>
                <p className="mt-1">Not every set has a maximum, but many have a supremum.</p>
              </div>
              <Card className="bg-secondary/50 mt-2">
                <CardContent className="text-xs pt-2">
                  <strong>Example:</strong> (0, 1) has sup = 1 but no maximum.
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="union">
          <AccordionTrigger className="py-2 text-xs font-medium">Union of Sets & Bounds</AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
            <p>
              When you combine multiple sets into a <strong>union A = A₁ ∪ A₂ ∪ ...</strong>, the bounds are determined
              by all components:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>sup(A)</strong> = max of all component supremums
              </li>
              <li>
                <strong>inf(A)</strong> = min of all component infimums
              </li>
            </ul>
            <p className="mt-2">
              <strong>Example:</strong> For A = [0, 0.5] ∪ {2}:
            </p>
            <div className="mt-2 p-2 bg-background rounded font-mono text-xs">
              <p>sup(A) = max(0.5, 2) = 2</p>
              <p>inf(A) = min(0, 2) = 0</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default LearningPanel
