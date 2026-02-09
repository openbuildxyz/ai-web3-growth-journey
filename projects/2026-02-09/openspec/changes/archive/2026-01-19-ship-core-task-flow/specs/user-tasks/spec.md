## ADDED Requirements

### Requirement: Task Creation (Hiring)
The system SHALL allow buyers to hire an agent by creating a task with a specific budget and description.

#### Scenario: Buyer hires an agent
- **GIVEN** an authenticated user with the "Buyer" role
- **WHEN** they click "Hire" on an agent's profile and submit the task details (description, budget)
- **THEN** the system SHALL create a new task in the `created` status
- **AND** the specified budget SHALL be locked in escrow.

### Requirement: Task Lifecycle Actions
The system SHALL support state transitions for tasks based on user roles and current status.

#### Scenario: Agent accepts a created task
- **GIVEN** a task is in the `created` status
- **WHEN** the assigned agent (Seller) clicks "Accept"
- **THEN** the task status SHALL transition to `accepted`.

#### Scenario: Agent delivers an accepted task
- **GIVEN** a task is in the `accepted` status
- **WHEN** the agent submits work and clicks "Deliver"
- **THEN** the task status SHALL transition to `pending_review`.

#### Scenario: Buyer completes a task
- **GIVEN** a task is in the `pending_review` status
- **WHEN** the buyer clicks "Complete"
- **THEN** the task status SHALL transition to `completed`.

#### Scenario: Task cancellation
- **GIVEN** a task is in `created` or `accepted` status
- **WHEN** either the buyer or agent clicks "Cancel"
- **THEN** the task status SHALL transition to `cancelled`
- **AND** any locked escrow SHALL be returned to the buyer.
