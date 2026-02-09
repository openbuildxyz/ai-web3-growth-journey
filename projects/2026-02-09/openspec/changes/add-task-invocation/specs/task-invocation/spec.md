## ADDED Requirements
### Requirement: Task Invocation from Market
The frontend SHALL provide entry points from the agent market page to initiate task creation.

#### Scenario: Open form from publish button
- **WHEN** user clicks the "发布新任务" button on the market page
- **THEN** the task creation form opens
- **AND** no agent is pre-selected

#### Scenario: Open form with pre-selected agent
- **WHEN** user selects an agent from an AgentCard
- **THEN** the task creation form opens
- **AND** agent_id is pre-filled with the selected agent

### Requirement: Wallet-Gated Submission
The frontend SHALL block task submission until a wallet is connected.

#### Scenario: Prompt for wallet connection
- **WHEN** user attempts to submit the task form without a connected wallet
- **THEN** the submission is blocked
- **AND** a wallet connection prompt is displayed

### Requirement: Confirmation Navigation
The frontend SHALL provide a confirmation state after successful task creation.

#### Scenario: Link to task list after creation
- **WHEN** a task is successfully created
- **THEN** a confirmation state is displayed
- **AND** it includes a link to the user's task list
