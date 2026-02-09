# Change: Add task publishing flow

## Why
The tasks page is currently a placeholder, which blocks demoing task creation.
This change introduces a basic publishing flow and uses a transaction hash
placeholder for development until on-chain submission is integrated.

## What Changes
- Add a task publishing form with required fields: title, description, budget_usd
- Add optional fields: agent_id, review_deadline, tx_hash (placeholder)
- Add a submission flow that posts to `/tasks` and shows a confirmation state
- Generate a placeholder tx hash when none is provided

## Impact
- Affected specs: task-publishing (new)
- Affected code:
  - `apps/agent-market-fe/app/tasks/page.tsx`
  - `apps/agent-market-fe/app/tasks/service.ts` (new)
  - `apps/agent-market-fe/msw/handlers.ts`
  - `apps/agent-market-fe/msw/mockData/` (new task mocks)
