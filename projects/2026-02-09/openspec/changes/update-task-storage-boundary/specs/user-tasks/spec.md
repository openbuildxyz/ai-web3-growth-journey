## ADDED Requirements
### Requirement: On-chain task fields
The system SHALL persist the following task fields on-chain: `taskId`, `amount`, `status`, `metaHash`, `deliveryHash`, and `arbitrationDecision`.
The `status` field SHALL use the existing `TaskStatus` set defined in `apps/agent-market-fe/lib/types/tasks.ts` (including `Disputed` and `Arbitrated`).

#### Scenario: Task created on-chain
- **GIVEN** a buyer submits a new task
- **WHEN** the task is created
- **THEN** the on-chain task record stores `taskId`, `amount`, `status` (`TaskStatus.Created`), and `metaHash`.

#### Scenario: Delivery submitted on-chain
- **GIVEN** a task is in `TaskStatus.Accepted` or `TaskStatus.InProgress`
- **WHEN** the agent submits delivery
- **THEN** the on-chain task record stores `deliveryHash` and updates `status` to `TaskStatus.PendingReview`.

#### Scenario: Task arbitrated on-chain
- **GIVEN** a task is in `TaskStatus.Disputed`
- **WHEN** arbitration finalizes
- **THEN** the on-chain record stores `arbitrationDecision` and updates `status` to `TaskStatus.Arbitrated`.

### Requirement: On-chain amount and token context
The system SHALL represent `amount` on-chain as the raw token amount (smallest unit) and SHALL associate it with a deterministic token reference (token address or symbol defined by the escrow contract).

#### Scenario: Amount is normalized
- **GIVEN** a buyer enters a budget in UI units
- **WHEN** the task is created on-chain
- **THEN** `amount` is computed using the escrow token decimals and stored as the raw integer value.

### Requirement: Off-chain task fields
The system SHALL persist the following task fields off-chain: task title/description, delivery file references, user profile data (nickname/avatar), and aggregated task list views.

#### Scenario: Task metadata stored off-chain
- **GIVEN** a buyer creates a task
- **WHEN** the metadata payload is persisted
- **THEN** the payload includes title/description and is retrievable by `metaHash`.

#### Scenario: Delivery payload stored off-chain
- **GIVEN** an agent submits delivery
- **WHEN** the delivery payload is persisted
- **THEN** the payload includes file references and is retrievable by `deliveryHash`.

### Requirement: Hash generation and validation
The system SHALL generate `metaHash` and `deliveryHash` from canonical JSON payloads and validate them on retrieval.

#### Scenario: metaHash generation
- **GIVEN** a canonical task metadata JSON payload
- **WHEN** `metaHash` is computed using keccak256 over UTF-8 JSON with lexicographically sorted keys
- **THEN** the resulting hash matches the stored on-chain `metaHash`.

#### Scenario: deliveryHash validation
- **GIVEN** a delivery payload retrieved from off-chain storage
- **WHEN** the payload is serialized using the same canonical JSON rules and hashed with keccak256
- **THEN** the resulting hash matches the on-chain `deliveryHash`.
