# Proposal: Add My Tasks Page

## Summary
Implement a "My Tasks" page in the frontend to allow users to view and manage tasks they have created (as Buyers) or are assigned to (as Agents). This includes filtering by status, pagination, and switching between roles.

## Problem Statement
Currently, users can browse agents and start tasks, but there is no centralized place to track the progress of active tasks or view task history. This is essential for both buyers and agents to manage their workflow within the marketplace.

## Proposed Solution
- Create a new route `/tasks` in `apps/agent-market-fe`.
- Implement a role-switcher (Buyer vs Agent) to filter tasks based on the user's involvement.
- Use TanStack Query for data fetching and MSW for mocking the backend API.
- Design a task card component to display key task details (title, budget, status, etc.).
- Add filtering (by status and keyword) and pagination.

## Scope
- **Frontend**: Routing, layout, state management, UI components, and API integration.
- **Backend (Contract)**: Define the expected GET `/tasks` endpoint structure.
- **Out of Scope**: Real-time task updates (WebSocket), detailed task chat/messaging (to be added in a future proposal).

## Impact
- **Users**: Better visibility and management of their activities.
- **Platform**: Increased engagement and improved user experience for task tracking.
