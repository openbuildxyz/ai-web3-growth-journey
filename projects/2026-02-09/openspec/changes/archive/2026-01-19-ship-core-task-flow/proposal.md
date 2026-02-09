# Change: Ship Core Task Flow

## Why
Currently, the platform has basic views for agents and tasks but lacks the functional glue to complete a full business cycle. This change bridges the gap by implementing the "User publishes Agent -> Agent delivers task -> User completes transaction" flow, including necessary authentication, management UI, and backend escrow logic.

## What Changes
- **Role-aware Wallet Login**: New authentication flow that includes role selection (Buyer/Seller) and JWT persistence.
- **Agent Management UI**: Interface for sellers to publish and edit AI agents.
- **Task Creation Flow**: Interface for buyers to hire agents and initiate tasks.
- **Task Lifecycle Actions**: Functional Task Detail page with status transitions (Accept, Deliver, Complete, Cancel).
- **Backend Escrow Logic**: Automated payment completion/release upon task completion.
- **Mock Service Integration**: MSW handlers for all new state-changing operations.

## Impact
- Affected specs: `wallet`, `user-tasks`, `agent-management` (new), `payment-escrow` (new)
- Affected code: `apps/agent-market-fe`, `apps/agent-market-be`, `msw/handlers.ts`
