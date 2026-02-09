# user-tasks Specification

## Purpose
TBD - created by archiving change add-my-tasks-page. Update Purpose after archive.
## Requirements
### Requirement: Task List View
The system SHALL provide a centralized view for users to see all tasks they are involved in.

#### Scenario: Viewing tasks as a buyer
- GIVEN the user is logged in as a buyer
- WHEN they navigate to the "My Tasks" page and select the "Buying" tab
- THEN they MUST see a list of tasks they have created, including the agent's name, task status, and budget.

#### Scenario: Viewing tasks as an agent
- GIVEN the user is logged in as an agent
- WHEN they navigate to the "My Tasks" page and select the "Working" tab
- THEN they MUST see a list of tasks assigned to them, including the buyer's name, task status, and reward.

### Requirement: Task Filtering and Search
The system SHALL allow users to filter and search their task list to find specific items.

#### Scenario: Filtering by status
- GIVEN a list of tasks is displayed
- WHEN the user selects a specific status (e.g., "In Progress") from the filter dropdown
- THEN only tasks with that status MUST be shown in the list.

#### Scenario: Searching by keyword
- GIVEN a list of tasks is displayed
- WHEN the user enters a keyword in the search bar
- THEN only tasks where the title or description matches the keyword MUST be shown.

### Requirement: Task Pagination
The system SHALL support pagination for the task list to handle large volumes of tasks efficiently.

#### Scenario: Navigating pages
- GIVEN there are more than 10 tasks in the current view
- WHEN the user clicks the "Next" button
- THEN the next 10 tasks MUST be loaded and displayed.

### Requirement: Role-Based Access Control
The "My Tasks" page SHALL only be accessible to authenticated users with a connected wallet.

#### Scenario: Unauthorized access
- GIVEN a user is not logged in
- WHEN they attempt to access the `/tasks` route
- THEN they MUST be redirected to the login/connect wallet page.

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

