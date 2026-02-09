## ADDED Requirements

### Requirement: DAO Data Fetching with React Query
The DAO page SHALL use React Query (TanStack Query) for data fetching with MSW mocking support, following the same pattern as the market page. React Query hooks SHALL be used internally within `useDaoService`, and data SHALL be provided to components through the existing context pattern.

#### Scenario: Fetch arbitration cases through useDaoService
- **WHEN** `useDaoService` hook is called
- **THEN** React Query fetches arbitration cases from `/dao/cases` endpoint internally
- **AND** MSW intercepts the request and returns mock data
- **AND** loading states are available in the service return value
- **AND** error states are available in the service return value

#### Scenario: Fetch DAO members through useDaoService
- **WHEN** `useDaoService` hook is called
- **THEN** React Query fetches DAO members from `/dao/members` endpoint internally
- **AND** MSW intercepts the request and returns mock data
- **AND** loading states are available in the service return value

#### Scenario: Filter cases by status in useDaoService
- **WHEN** arbitration cases are fetched via React Query
- **THEN** `useDaoService` filters active cases (status: 'voting') into `activeCases`
- **AND** `useDaoService` filters resolved cases (status: 'resolved_buyer' or 'resolved_seller') into `resolvedCases`
- **AND** components receive filtered data through `DaoServiceContext` without changes

#### Scenario: Context pattern maintained
- **WHEN** components consume DAO data
- **THEN** they continue using `useContext(DaoServiceContext)` as before
- **AND** the service interface remains the same (`activeCases`, `resolvedCases`, `mockDaoMembers`)
- **AND** no component changes are required

### Requirement: MSW Mock Handlers for DAO
The MSW setup SHALL include handlers for DAO endpoints that return mock data matching the existing data structure.

#### Scenario: Mock arbitration cases endpoint
- **WHEN** a GET request is made to `/dao/cases`
- **THEN** MSW returns all mock arbitration cases from `msw/mockData/dao.ts`
- **AND** the response matches the Zod schema for `ArbitrationCase[]`

#### Scenario: Mock DAO members endpoint
- **WHEN** a GET request is made to `/dao/members`
- **THEN** MSW returns all mock DAO members from `msw/mockData/dao.ts`
- **AND** the response matches the Zod schema for `DaoMember[]`

### Requirement: React Query Integration in useDaoService
The `useDaoService` hook SHALL use React Query internally to fetch data, following the same pattern as `useMarketService`.

#### Scenario: useDaoService uses React Query for cases
- **WHEN** `useDaoService` hook is called
- **THEN** it internally uses `useQuery` with query key `['dao', 'cases']`
- **AND** it fetches from `/dao/cases` endpoint using RxJS for error handling
- **AND** it validates the response with Zod schema

#### Scenario: useDaoService uses React Query for members
- **WHEN** `useDaoService` hook is called
- **THEN** it internally uses `useQuery` with query key `['dao', 'members']`
- **AND** it fetches from `/dao/members` endpoint using RxJS for error handling
- **AND** it validates the response with Zod schema
