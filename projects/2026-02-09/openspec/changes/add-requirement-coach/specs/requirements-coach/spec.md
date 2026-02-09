## ADDED Requirements
### Requirement: Requirement Coach Draft Analysis
The system SHALL accept a task draft from an authenticated user and return structured requirements including objective, scope, deliverables, constraints, and acceptance criteria.

#### Scenario: Analyze a task draft
- **WHEN** an authenticated buyer submits a task draft
- **THEN** the response includes structured fields for objective, scope, deliverables, constraints, and acceptance criteria

### Requirement: Missing Information Prompts
The system SHALL identify missing task inputs and return follow-up questions the user must answer before submission.

#### Scenario: Missing budget or timeline
- **WHEN** a draft lacks required fields such as budget or timeline
- **THEN** the response includes a list of missing fields and suggested questions

### Requirement: Risk Signals
The system SHALL return risk signals for ambiguous or under-specified drafts to reduce dispute probability.

#### Scenario: Ambiguous acceptance criteria
- **WHEN** the acceptance criteria are vague or non-verifiable
- **THEN** the response includes a risk signal indicating unverifiable deliverables

### Requirement: Dual JWT Invocation Chain
The system SHALL require user JWT authentication for requirement coach requests and SHALL use platform JWT when invoking the coach agent.

#### Scenario: User request and agent invocation
- **WHEN** a user sends a requirement coach request
- **THEN** the platform validates the user JWT and invokes the agent using platform JWT auth

### Requirement: Marketplace Coach Selection
The system SHALL allow users to select a requirement coach agent from the marketplace and SHALL support auto-recommendation when no agent is chosen.

#### Scenario: Auto-recommend a coach agent
- **WHEN** a user does not select a coach agent
- **THEN** the system selects a recommended coach based on historical completion data

### Requirement: Confirmed Metadata Persistence
The system SHALL persist user-confirmed structured requirements and acceptance criteria in task metadata.

#### Scenario: Confirm and persist
- **WHEN** a user confirms the coach output
- **THEN** the structured requirements are saved to task metadata for later review
