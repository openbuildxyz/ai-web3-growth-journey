## Context
We want a closed-loop AI workflow where Codex implements changes and Gemini audits PRs. The system should be triggered by `codex/*` branch pushes or `@codex` PR comments, and should use PAT-backed tokens where required for PR creation and comments.

## Goals / Non-Goals
- Goals:
  - Automate Codex execution for task-based changes
  - Auto-create PRs for Codex branches
  - Run Gemini audits on PRs and post structured review comments
  - Document required secrets and trigger constraints
- Non-Goals:
  - Replace human review or merge approvals
  - Support forked PRs for Codex execution

## Decisions
- Decision: Use GitHub Actions workflows for Codex and Gemini automation
  - Why: Integrates with existing CI and requires no new infrastructure
- Decision: Use PAT (`PR_CREATOR_TOKEN`) for PR creation and `@codex` triggers
  - Why: GitHub bots cannot trigger `@codex` instructions reliably
- Decision: Restrict Codex runs to `codex/*` branches and authorized commenters
  - Why: Reduce unintended executions and maintain access controls

## Risks / Trade-offs
- Risk: Missing or misconfigured secrets prevent workflows from running
  - Mitigation: Document required secrets and permissions
- Risk: Gemini audit output lacks product context
  - Mitigation: Require PR description to include context and acceptance criteria

## Migration Plan
1. Add workflow files and audit rubric
2. Configure repository secrets for Codex and Gemini
3. Validate workflow triggers on a test `codex/*` branch

## Open Questions
- None
