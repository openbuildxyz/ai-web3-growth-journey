# Change: Migrate DAO Page to React Query with MSW Mocking

## Why
The DAO page currently uses a custom service hook that directly filters mock data, which doesn't align with the project's data fetching patterns. The market page already uses React Query with MSW mocking, and the DAO page should follow the same pattern for consistency, better caching, loading states, and easier future integration with real API endpoints.

## What Changes
- Add MSW handlers for DAO endpoints (`/dao/cases`, `/dao/members`)
- Update `useDaoService` hook to use React Query internally for data fetching
- Keep `DaoServiceContext` pattern - components continue using context as before
- Maintain existing component interface - no changes needed to consuming components
- Add proper TypeScript types using Zod schemas for API responses
- Add loading and error states to the service return value

## Impact
- Affected specs: New capability `dao` (data fetching)
- Affected code:
  - `apps/agent-market-fe/app/dao/service.ts` - Update to use React Query internally
  - `apps/agent-market-fe/app/dao/page.tsx` - No changes (keeps context provider)
  - `apps/agent-market-fe/app/dao/components/*.tsx` - No changes (continue using context)
  - `apps/agent-market-fe/msw/handlers.ts` - Add DAO endpoints
  - `apps/agent-market-fe/msw/mockData/dao.ts` - Keep existing mock data
