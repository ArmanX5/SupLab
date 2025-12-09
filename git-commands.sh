# ============================================================
# SupLab Git Workflow Commands
# Generated: December 9, 2025
# ============================================================
# Current Repository: git@github.com:ArmanX5/SupLab.git
# Current Branch: main
# Remote: origin
# ============================================================

# ────────────────────────────────────────────────────────────
# OPTION A: Commit directly to current branch (main)
# ────────────────────────────────────────────────────────────

# Step 1: Check current status
git status

# Step 2: Add .gitignore first (to exclude unnecessary files)
git add .gitignore

# Step 3: Stage all relevant changes
# This adds the new TypeScript backend and frontend changes
git add backend-ts/
git add backend/tests/
git add backend/package.json
git add backend/README.md
git add frontend/lib/api-example.ts
git add frontend/tsconfig.json

# Step 4: Verify what will be committed
git status

# Step 5: Commit with descriptive message
git commit -m "feat: Add Node.js/TypeScript backend with API tests

- Add complete backend-ts/ with Express + TypeScript
- Implement POST /api/analyze endpoint for set analysis
- Add sup, inf, max, min, bounded, epsilon-band computation
- Support sequence components with formula evaluation (mathjs)
- Support interval components with open/closed boundaries
- Add comprehensive API test suite (13 tests)
- Add frontend API integration example
- Add .gitignore for node_modules, .next, etc."

# Step 6: Push to remote
git push origin main


# ────────────────────────────────────────────────────────────
# OPTION B: Create a feature branch first (RECOMMENDED)
# ────────────────────────────────────────────────────────────

# Step 1: Create and switch to a new feature branch
git checkout -b feature/typescript-backend

# Step 2: Add .gitignore first
git add .gitignore

# Step 3: Stage all backend and related changes
git add backend-ts/
git add backend/tests/
git add backend/package.json
git add backend/README.md
git add frontend/lib/api-example.ts
git add frontend/tsconfig.json

# Step 4: Commit with descriptive message
git commit -m "feat: Add Node.js/TypeScript backend with API tests

- Add complete backend-ts/ with Express + TypeScript
- Implement POST /api/analyze endpoint for set analysis
- Add sup, inf, max, min, bounded, epsilon-band computation
- Support sequence components with formula evaluation (mathjs)
- Support interval components with open/closed boundaries
- Add comprehensive API test suite (13 tests)
- Add frontend API integration example
- Add .gitignore for node_modules, .next, etc."

# Step 5: Push the feature branch to remote
git push -u origin feature/typescript-backend

# Step 6: (Optional) Create a pull request on GitHub
# Then merge via GitHub UI or use:
# git checkout main
# git merge feature/typescript-backend
# git push origin main


# ────────────────────────────────────────────────────────────
# USEFUL GIT COMMANDS REFERENCE
# ────────────────────────────────────────────────────────────

# View commit history
git log --oneline -10

# View changes before staging
git diff

# View staged changes
git diff --staged

# Unstage a file
git restore --staged <filename>

# Discard local changes to a file
git restore <filename>

# Switch branches
git checkout <branch-name>

# Create branch from current position
git checkout -b <new-branch-name>

# Delete a local branch
git branch -d <branch-name>

# Fetch updates from remote
git fetch origin

# Pull latest changes
git pull origin main

# View remote branches
git branch -r

# Check remote connection
git remote -v

