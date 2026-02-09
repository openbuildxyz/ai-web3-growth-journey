# Agent Management - Role Removal Changes

## MODIFIED Requirements

### Requirement: Agent Creation Authorization
Any authenticated user SHALL be able to create an agent without role restrictions.

#### Scenario: User creates agent
- **WHEN** an authenticated user submits agent creation request
- **THEN** the system creates the agent regardless of user role

### Requirement: Agent Update Authorization
Users SHALL only be able to update agents they own.

#### Scenario: Owner updates agent
- **WHEN** the agent owner submits an update request
- **THEN** the system updates the agent

#### Scenario: Non-owner attempts update
- **WHEN** a non-owner submits an update request
- **THEN** the system rejects with "You do not own this agent" error
