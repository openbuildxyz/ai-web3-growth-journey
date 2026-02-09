# Tasks: Add My Tasks Page

- [x] Define Task types and Zod schemas in `apps/agent-market-fe/lib/types/tasks.ts`
- [x] Implement MSW handlers for `GET /api/tasks` in `apps/agent-market-fe/msw/handlers.ts`
- [x] Create mock task data in `apps/agent-market-fe/msw/mockData/tasks.ts`
- [x] Create `TaskCard` component in `apps/agent-market-fe/components/ui/TaskCard.tsx`
- [x] Create `TaskFilter` component in `apps/agent-market-fe/components/business/TaskFilter.tsx`
- [x] Implement the tasks page layout and logic in `apps/agent-market-fe/app/tasks/page.tsx`
  - [x] Role switcher (Buying/Working)
  - [x] Search and status filter integration
  - [x] Pagination logic
- [x] Add "My Tasks" link to the main `Header` or `NavMenu`
- [x] Verify the page with MSW enabled and test different filter combinations
- [ ] (Optional) Add unit tests for `TaskCard` and filter logic
