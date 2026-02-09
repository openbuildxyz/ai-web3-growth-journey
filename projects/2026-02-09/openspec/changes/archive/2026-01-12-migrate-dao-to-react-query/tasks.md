## 1. MSW Setup
- [x] 1.1 Add MSW handlers for `/dao/cases` endpoint returning all arbitration cases
- [x] 1.2 Add MSW handler for `/dao/members` endpoint returning DAO members
- [x] 1.3 Ensure handlers use existing mock data from `msw/mockData/dao.ts`
- [x] 1.4 Add Zod response schemas for API validation

## 2. Update useDaoService Hook
- [x] 2.1 Add `useQuery` hook for fetching arbitration cases from `/dao/cases`
- [x] 2.2 Add `useQuery` hook for fetching DAO members from `/dao/members`
- [x] 2.3 Filter cases into `activeCases` (status: 'voting') and `resolvedCases` (status: 'resolved_buyer' or 'resolved_seller')
- [x] 2.4 Follow the same pattern as `useMarketService` (with RxJS for error handling)
- [x] 2.5 Add `isLoading` and `error` states to the return value
- [x] 2.6 Maintain the same return interface so components don't need changes

## 3. Context Pattern
- [x] 3.1 Keep `DaoServiceContext` - no changes needed
- [x] 3.2 Keep context provider in `dao/page.tsx` - no changes needed
- [x] 3.3 Components continue using `useContext(DaoServiceContext)` - no changes needed

## 4. Validation
- [x] 4.1 Verify all components render correctly with React Query data
- [x] 4.2 Verify loading states are available (though components may not use them yet)
- [x] 4.3 Verify error handling is in place
- [x] 4.4 Test that MSW mocking works in development
- [x] 4.5 Ensure TypeScript types are correct throughout
