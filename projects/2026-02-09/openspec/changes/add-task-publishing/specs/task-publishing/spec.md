## ADDED Requirements
### Requirement: Task Publishing Form
The frontend SHALL provide a task publishing form that collects task details and submits them to the backend API.

#### Scenario: Submit task with required fields
- **WHEN** user fills in title, description, and budget_usd
- **THEN** the form validates and submits to `/tasks` endpoint
- **AND** displays confirmation with task details and transaction hash

#### Scenario: Generate placeholder tx hash
- **WHEN** user submits form without providing tx_hash
- **THEN** system generates a placeholder hash (e.g., `0xplaceholder_${timestamp}`)
- **AND** includes it in the API submission
