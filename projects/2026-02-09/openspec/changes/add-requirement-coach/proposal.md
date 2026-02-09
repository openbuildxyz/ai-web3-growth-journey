# Change: Add Requirement Coach Agent

## Why
Task descriptions are currently free-form, which increases ambiguity and raises dispute/rollback risk. A requirement coach agent that is selectable in the marketplace can structure inputs, surface missing details, and generate clear acceptance criteria before tasks are created.

## What Changes
- Add a requirement-coach capability exposed as a marketplace agent with user selection and auto-recommendation.
- Add risk signals for ambiguous or under-specified tasks.
- Add JWT-authenticated request flow for user->platform and platform->agent invocation.
- Persist user-confirmed structured requirements in task metadata.

## Impact
- Affected specs: requirements-coach (new)
- Affected code: apps/agent-market-fe (task publish UI), apps/agent-market-be (tasks/agent invocation/auth)
