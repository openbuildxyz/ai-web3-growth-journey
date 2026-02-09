# Change: Add task invocation flow

## Why
The market page allows browsing agents but cannot convert selection into a task.
A task invocation flow connects discovery to task creation and keeps the journey
in one place, while aligning with the existing `/tasks` API and wallet-gated UX.

## What Changes
- Add entry points on the market page to initiate task creation.
- Reuse the task publishing form, pre-filling agent_id when invoked from a card.
- Require a connected wallet before submission and show a clear prompt when missing.
- Provide a confirmation state that links to the task list.
- Scope note: on-chain submission and real tx hashes are out of scope.

## Impact
- Affected specs: task-invocation (new)
- Related changes: add-task-publishing (reuses the publishing form)
- Affected code:
  - `apps/agent-market-fe/app/market/index.tsx`
  - `apps/agent-market-fe/app/market/service.ts`
  - `apps/agent-market-fe/app/tasks/*`
  - `apps/agent-market-fe/components/ui/AgentCard.tsx`
  - `apps/agent-market-fe/msw/*`
