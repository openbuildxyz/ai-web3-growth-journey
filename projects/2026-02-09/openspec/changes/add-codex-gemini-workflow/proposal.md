# Change: Add Codex/Gemini CI workflow automation

## Why
Standardize AI-assisted coding and audit automation using Codex and Gemini so changes are consistently implemented, reviewed, and corrected through a closed-loop workflow.

## What Changes
- Add Codex task runner workflow that executes `task.md` on pushes to `codex/*` and on `@codex` PR comments
- Add auto-PR workflow to create PRs for Codex branches
- Add Gemini audit workflow that posts review comments based on `.github/ai-review-rubric.md`
- Add `.github/ai-review-rubric.md` with audit requirements and `@codex` trigger rules

## Impact
- Affected specs: ci-automation
- Affected code: `.github/workflows/*`, `.github/ai-review-rubric.md`, repo root `task.md` (usage)
