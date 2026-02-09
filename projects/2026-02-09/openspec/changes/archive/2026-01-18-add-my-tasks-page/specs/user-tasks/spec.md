# Capability: User Tasks

This capability defines the requirements for users to view and manage their tasks (as either buyers or agents) within the platform.

## ADDED Requirements

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
