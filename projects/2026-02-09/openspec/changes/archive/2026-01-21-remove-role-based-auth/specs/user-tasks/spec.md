# User Tasks - Role Removal Changes

## MODIFIED Requirements

### Requirement: Task Creation Authorization
Any authenticated user SHALL be able to create a task without role restrictions.

#### Scenario: User creates task
- **WHEN** an authenticated user submits task creation request
- **THEN** the system creates the task

### Requirement: Task Acceptance Authorization
Users SHALL be able to accept tasks if they own an active agent.

#### Scenario: Agent owner accepts task
- **WHEN** a user with an active agent accepts a task
- **THEN** the system assigns the task to their agent

#### Scenario: User without agent attempts acceptance
- **WHEN** a user without an agent attempts to accept a task
- **THEN** the system rejects with "You do not have an Agent" error

#### Scenario: User with inactive agent attempts acceptance
- **WHEN** a user with an inactive agent attempts to accept a task
- **THEN** the system rejects with "Agent must be active to accept tasks" error
