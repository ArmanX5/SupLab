"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

const QvsRComparison = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full flex items-center gap-2 bg-transparent">
          <Info className="w-4 h-4" />ℝ vs ℚ: Why Completeness Matters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Why ℝ is Complete but ℚ is Not</DialogTitle>
          <DialogDescription>
            Understanding the fundamental difference between real and rational numbers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Card className="bg-secondary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">The Problem in ℚ</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Consider the set:</p>
              <div className="bg-background p-3 rounded font-mono text-xs border border-border">
                A = {"{"}x ∈ ℚ : x² {"<"} 2{"}"}
              </div>
              <p className="text-muted-foreground">
                This is the set of all rational numbers whose square is less than 2.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <Badge variant="destructive" className="w-fit mb-2">
                  ℚ (Rationals)
                </Badge>
                <CardTitle className="text-sm">Incomplete</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <p>The set A is bounded above in ℚ (e.g., by 2).</p>
                <p className="font-medium text-foreground">
                  But A has <strong>no supremum in ℚ</strong>
                </p>
                <p>Why? Because sup(A) = √2 ∉ ℚ</p>
                <p className="pt-2 border-t border-destructive/30">There is a "gap" in ℚ where √2 should be.</p>
              </CardContent>
            </Card>

            <Card className="border-accent/50 bg-accent/5">
              <CardHeader className="pb-3">
                <Badge variant="default" className="w-fit mb-2 bg-accent text-accent-foreground">
                  ℝ (Reals)
                </Badge>
                <CardTitle className="text-sm">Complete</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <p>The set A is bounded above in ℝ (e.g., by 2).</p>
                <p className="font-medium text-foreground">And A has a supremum in ℝ</p>
                <p>sup(A) = √2 ∈ ℝ ✓</p>
                <p className="pt-2 border-t border-accent/30">No gaps: every bounded subset has a least upper bound.</p>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-accent bg-accent/5">
            <AlertDescription className="text-sm">
              <strong>The Completeness Axiom is the defining property of ℝ.</strong> It ensures that the real numbers
              have no "holes" or "gaps" like the rationals do. This is why we can take square roots, solve differential
              equations, and do calculus.
            </AlertDescription>
          </Alert>

          <Card className="bg-secondary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Intuition</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>ℚ:</strong> Like integers on a number line with many "missing points" in between.
              </p>
              <p>
                <strong>ℝ:</strong> A continuous line with no gaps—every bounded set has a supremum.
              </p>
              <p className="pt-2 font-medium text-foreground">
                This continuity is essential for calculus and all of real analysis.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QvsRComparison
