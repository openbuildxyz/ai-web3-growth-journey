## ADDED Requirements
### Requirement: Codex task runner workflow
The system SHALL run a Codex task workflow on pushes to `codex/*` branches and on authorized `@codex` PR comments, using `task.md` as the primary instruction source.

#### Scenario: Run on codex branch push
- **WHEN** a commit is pushed to a `codex/*` branch
- **THEN** the Codex task runner builds a prompt from `task.md` and executes it

#### Scenario: Run on authorized @codex comment
- **WHEN** an authorized collaborator posts a comment containing `@codex`
- **THEN** the Codex task runner executes using the PR branch and comment content

### Requirement: Codex auto-PR workflow
The system SHALL create a pull request automatically after a successful Codex task run on a `codex/*` branch if no open PR exists.

#### Scenario: Create PR for Codex branch
- **WHEN** the Codex task workflow completes successfully for a `codex/*` branch
- **THEN** the system creates a PR targeting the default branch if one does not already exist

### Requirement: Gemini audit workflow
The system SHALL run a Gemini-based audit on PR open, sync, or reopen events and post a structured review comment following `.github/ai-review-rubric.md`.

#### Scenario: Post audit results
- **WHEN** a pull request is opened or updated
- **THEN** the Gemini audit runs against the PR diff and posts a structured comment

### Requirement: Audit trigger rules
The system SHALL ensure audit comments include `@codex` only when code changes are required, and MUST omit `@codex` when no code changes are needed.

#### Scenario: Audit requires fixes
- **WHEN** the audit identifies any issue requiring code changes
- **THEN** the comment begins with `@codex` and a short instruction

#### Scenario: Audit requires no fixes
- **WHEN** the audit identifies no code changes needed
- **THEN** the comment does not include `@codex`
