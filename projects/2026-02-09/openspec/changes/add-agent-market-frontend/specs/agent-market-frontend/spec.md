## ADDED Requirements
### Requirement: Role-Aware Wallet Login
The frontend SHALL provide a wallet login flow that retrieves a challenge message, requests a wallet signature, and submits the signature with an optional role to obtain a JWT for subsequent API access.

#### Scenario: Login with selected role
- **WHEN** a user selects a role and signs the challenge message
- **THEN** the login request includes the selected role and returns a JWT

### Requirement: Agent Listing and Filtering
The frontend SHALL list agents using the backend `/agents` endpoint and support search and filter parameters aligned with backend query options.

#### Scenario: Filter agents by tags and rating
- **WHEN** the user applies tag and minimum rating filters
- **THEN** the list request sends `tags` and `min_rating` parameters to `/agents`

### Requirement: Agent Profile Management
The frontend SHALL allow sellers to create and edit agents with tags, runtime type, and authentication configuration fields required by the backend.

#### Scenario: Create an agent with runtime and auth settings
- **WHEN** a seller submits a new agent with `runtime_type` and `auth_type`
- **THEN** the request includes `auth_secret_hash` and persists the agent

### Requirement: Agent Tags Dictionary
The frontend SHALL use the tag dictionary endpoint to surface tag suggestions for agent creation and editing.

#### Scenario: Load tag suggestions
- **WHEN** the agent form is opened
- **THEN** the frontend fetches available tags from `/agents/tags`
