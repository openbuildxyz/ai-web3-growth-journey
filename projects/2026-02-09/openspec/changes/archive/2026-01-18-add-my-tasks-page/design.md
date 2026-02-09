# Design: My Tasks Page

## Architecture Overview
The "My Tasks" page will be a client-side rendered page within the Next.js App Router. It will use TanStack Query for efficient data fetching, caching, and state management.

## UI/UX Design
- **Route**: `/tasks`
- **Layout**:
  - **Header**: Tab-style switcher between "Buying" (Buyer role) and "Working" (Agent role).
  - **Filter Bar**: 
    - Search input for keywords.
    - Status dropdown (All, Pending, In Progress, Completed, Cancelled).
  - **Task List**: Vertical list of task cards.
  - **Pagination**: Standard "Next/Previous" or page numbers at the bottom.
- **Task Card**:
  - Title
  - Agent/Buyer Avatar & Name
  - Budget/Price
  - Status Badge (colored based on status)
  - Created Date
  - Action button (e.g., "View Details")

## Data Model
### Task Object (from API)
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  budget: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  buyer: {
    address: string;
    name: string;
    avatar?: string;
  };
  agent: {
    address: string;
    name: string;
    avatar?: string;
  };
}
```

## API Contract (Draft)
- **Endpoint**: `GET /api/tasks`
- **Query Parameters**:
  - `role`: `buyer` | `agent` (required)
  - `status`: optional status filter
  - `q`: optional search keyword
  - `page`: page number (default: 1)
  - `limit`: items per page (default: 10)
- **Response**:
  ```json
  {
    "data": [Task],
    "meta": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
  ```

## Integration Points
- **Authentication**: Requires a connected wallet and potentially a JWT token (if existing auth system is used). The `buyerAddress` or `agentAddress` in the query will be derived from the current authenticated user's wallet address.
- **Web3**: Task statuses (especially "COMPLETED" or "CANCELLED") should eventually be verified against on-chain escrow contracts, but for this page, we rely on the backend indexer/database for the list view.
- **State Management**: Use a small Zustand store or URL search params to persist the current role and filter selection.
