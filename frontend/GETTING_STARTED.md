# SupLab - Getting Started Guide

## 🏠 First Time Using SupLab?

Welcome! SupLab is an interactive math lab for exploring supremum, infimum, and the completeness axiom in real analysis.

### Quick Start (2 minutes)

1. **Look at the Preset**: You'll see `[0, 1]` loaded by default
2. **Click "Explain Step-by-Step"** on the right panel
   - Watch the blue line (infimum) and red line (supremum) animate from the edges
3. **Try a Different Scenario**: Click "(0, 1)" at the bottom
   - Notice sup = 1 but it's NOT in the set (hollow circle)
   - This shows the difference between supremum and maximum
4. **Click "{1/n}"** to see a sequence
   - Points cluster near 0 but never reach it
   - sup = 1, inf = 0
5. **Toggle "🔍 Microscope"** and hover over the number line
   - Zoom in on the sequence cluster
   - See the separation between points more clearly

---

## 📚 Core Concepts

### Supremum (sup) - "Least Upper Bound"
- The smallest number that is ≥ all elements in the set
- May or may not be IN the set
- Example: sup([0,1)) = 1, but 1 ∉ [0,1)

### Infimum (inf) - "Greatest Lower Bound"
- The largest number that is ≤ all elements in the set
- May or may not be IN the set
- Example: inf((0,1]) = 0, but 0 ∉ (0,1]

### Completeness Axiom
- Every non-empty subset of ℝ bounded above has a supremum in ℝ
- This is what makes ℝ special compared to ℚ
- **ℚ has gaps** (like at √2), **ℝ has no gaps**

---

## 🎮 Interactive Features

### 1. Set Composer (Left Panel)

**Adding Sets:**
1. Click **"+ Add Component"**
2. Choose from: Interval, Finite Set, Sequence
3. Configure the set:
   - **Interval**: Enter start/end values, choose brackets [ or (
   - **Finite**: Click + to add numbers one by one
   - **Sequence**: Pick from preset formulas (1/n, (-1)^n, etc.)
4. Click **"Add to Union"**

**Editing:**
- Change any value in a component's input boxes
- Instantly updates the visualization
- Delete a component by clicking ×

**Example Union:**
\`\`\`
Add [0, 0.5]
Add {2}
Result: A = [0, 0.5] ∪ {2}
  → sup(A) = 2, inf(A) = 0
\`\`\`

### 2. Epsilon Band (Right Panel)

**What it shows:**
- Orange shaded band from (sup - ε) to sup
- Glowing circles on points within the band
- Proves: "For any ε, there's always a point close to the sup"

**How to use:**
1. Make sure you have a bounded-above set loaded
2. Click **"ε-Band"** toggle in header (appears in right panel)
3. Drag the **ε slider** down from 1.0
4. Watch points light up in the band
5. Mathematically validates the supremum definition

**Why it's important:**
This is the rigorous definition of supremum animated visually:
> s = sup(A) ⟺ ∀ε > 0, ∃a ∈ A: s - ε < a ≤ s

### 3. Microscope Zoom

**How to activate:**
- Click **"🔍 Microscope"** button in the number line header
- Hover over any region of the number line

**What happens:**
- 10x zoom into that region
- Circular dashed lens shows the magnified area
- Perfect for sequences with clustering behavior

**When to use it:**
- Sequence {1/n}: See how points get closer to 0
- Sequence {1 - 1/n}: See convergence from below
- Any detailed structure in your set

### 4. Quiz Mode (Gamification)

**Activate:**
1. Click **"Quiz Mode"** toggle in header
2. Notice bounds lines/values disappear
3. Number line is ready for your guess

**How it works:**
1. Look at the set on the visualization
2. **Click** where you think the supremum is
3. Get instant feedback:
   - Your guess: Purple dashed line
   - Actual sup: Red dashed line
   - Error distance: Shown at top
   - Score: "Perfect!" / "Close!" / error amount

**In the right panel:**
- See "Quiz Results" card with detailed metrics
- Error < 0.05: Perfect
- Error < 0.1: Close
- Error > 0.1: Try again!

**Use it to:**
- Test your understanding
- Build intuition before studying formally
- Practice with different set types

---

## 🎯 Learning Paths

### Path 1: "I'm Learning Supremum for First Time"
1. Load **"[0, 1]"** → Simple closed interval
2. Read "Definition: Supremum" accordion
3. Click "Explain Step-by-Step" to see animation
4. Load **"(0, 1)"** → Notice sup exists but NOT in set
5. Read "Difference: Maximum vs Supremum"
6. Enable **ε-Band**, drag ε down slowly
7. Try **Quiz Mode**: Guess where sup is
8. Load **"{1/n}"** to see sequence behavior
9. Read "ℝ vs ℚ: Why Completeness Matters" dialog

### Path 2: "I'm Mastering Union of Sets"
1. Load **"Union Example"** preset
2. Try adding your own components:
   - [0, 0.3]
   - {1}
   - {1/n}
3. Predict sup and inf before looking
4. Check the Analysis panel
5. Try **Quiz Mode** with custom unions

### Path 3: "Deep Dive on Sequences"
1. Load **"{1/n}"**
2. Enable **Microscope**
3. Hover over cluster near 0
4. Zoom in and out to see structure
5. Enable **ε-Band**, set small ε value
6. Load **"{(-1)^n}"** - Different behavior!
7. Load **"{n/(n+1)}"** - Approaches 1 from below

### Path 4: "ℝ vs ℚ Understanding"
1. Start with **"(0, 1)"** in Student Mode
2. Notice sup = 1 ∈ ℝ ✓
3. Click **"ℝ vs ℚ: Why Completeness Matters"** button
4. Read the explanation carefully
5. Return and imagine this in ℚ: Would there be a gap?
6. Try other sets and think: "Would the supremum exist in ℚ?"

---

## 💡 Tips & Tricks

**Tip 1: Use Presets to Learn Patterns**
- Open each preset in order
- Let the animations play
- Compare how sup and inf behave

**Tip 2: Epsilon Band for Deep Understanding**
- Start with large ε (like 0.5)
- Slowly drag to tiny ε (like 0.01)
- See how points always exist in the band
- This IS the supremum definition!

**Tip 3: Microscope Before Quiz**
- Use microscope to understand point distribution
- Then try Quiz Mode with same set
- Your guess will be more accurate

**Tip 4: Read Accordions While Visualizing**
- Open an accordion definition
- Click corresponding preset
- Watch the visualization match the text
- Multi-sensory learning works!

**Tip 5: Build Intuition with Unions**
- Start simple: one component
- Understand its bounds
- Add second component
- Predict new sup/inf before checking
- This builds deep understanding

---

## ❓ Troubleshooting

**Q: I don't see the bounds lines**
- A: Click "Explain Step-by-Step" to activate animation
- Or: Make sure you're not in Quiz Mode (toggle it off)

**Q: Epsilon band isn't showing**
- A: Make sure set is bounded above (not ℕ or unbounded)
- A: Toggle "ε-Band" button in header

**Q: Microscope isn't zooming**
- A: Click "🔍 Microscope" button first
- A: Then hover over the number line

**Q: Quiz Mode isn't accepting my guess**
- A: Click on the number line (should show cursor-crosshair)
- A: Try clicking in the middle of the visualization area

**Q: I can't find a specific scenario**
- A: Scroll the left sidebar (Set Composer) for "Add Component"
- A: Scroll bottom panel (Learning) for quick scenario buttons

---

## 🎓 Theoretical References

**Definitions used in SupLab:**

**Supremum:**
$$s = \sup(A) \iff \begin{cases} 1) & \forall a \in A: a \leq s \\ 2) & \forall \epsilon > 0, \exists a \in A: a > s - \epsilon \end{cases}$$

**Infimum:**
$$m = \inf(A) \iff \begin{cases} 1) & \forall a \in A: a \geq m \\ 2) & \forall \epsilon > 0, \exists a \in A: a < m + \epsilon \end{cases}$$

**Completeness Axiom:**
$$\text{Every non-empty } A \subseteq \mathbb{R} \text{ with } \sup(A) \text{ existing has } \sup(A) \in \mathbb{R}$$

**Union of sets:**
$$\sup(A_1 \cup A_2 \cup \cdots) = \max(\sup(A_1), \sup(A_2), \ldots)$$
$$\inf(A_1 \cup A_2 \cup \cdots) = \min(\inf(A_1), \inf(A_2), \ldots)$$

---

## 🚀 Next Steps

- Practice with different intervals and bracket types
- Master the epsilon band visualization
- Challenge yourself with Quiz Mode
- Build complex unions from multiple components
- Read all definition accordions
- Understand why ℝ ≠ ℚ at a deep level

**Good luck with your real analysis studies!** 📊✨
