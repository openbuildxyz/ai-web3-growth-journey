# Change: Define on-chain vs off-chain task storage boundaries

## Why
We need a shared, explicit rule for which task fields live on-chain versus off-chain. This clarifies how task creation, delivery, and arbitration map to contract data while preserving rich metadata off-chain.

## What Changes
- Define the canonical on-chain task fields (taskId, amount, status, metaHash, deliveryHash, arbitration result).
- Define the off-chain task fields (task description, delivery files, user profile data, aggregated task list).
- Require metaHash/deliveryHash to be derived from a canonical JSON payload stored off-chain.

## Impact
- Affected specs: user-tasks
- Affected code: task creation, delivery, and task detail flows (frontend + backend/indexer)
