# dao Specification

## Purpose
TBD - created by archiving change migrate-dao-to-react-query. Update Purpose after archive.
## Requirements
### Requirement: DAO Data Fetching with React Query
The DAO page SHALL use React Query (TanStack Query) for data fetching with MSW mocking support, following the same pattern as the market page. React Query hooks SHALL be used internally within `useDaoService`, and data SHALL be provided to components through the existing context pattern. The service SHALL fetch arbitration cases from both backend endpoints (for case enumeration) and on-chain contracts (for real-time case details), combining the data into unified `ArbitrationCase` objects.

#### Scenario: Fetch arbitration cases through useDaoService
- **WHEN** `useDaoService` hook is called
- **THEN** React Query fetches case list from `/dao/cases` backend endpoint
- **AND** React Query fetches case details for each caseId directly from Arbitration contract using `getCase(taskId)`
- **AND** React Query fetches task details for each caseId from TaskManager contract using `getTask(taskId)`
- **AND** case and task data are combined into unified `ArbitrationCase` objects with computed status
- **AND** MSW intercepts backend requests and returns mock data (development only)
- **AND** loading states are available in the service return value
- **AND** error states are available in the service return value

#### Scenario: Fetch DAO members through useDaoService
- **WHEN** `useDaoService` hook is called
- **THEN** React Query fetches DAO members from `/dao/members` endpoint internally
- **OR** React Query fetches staked addresses from Arbitration contract `staked` mapping and formats as members
- **AND** MSW intercepts the request and returns mock data (development only)
- **AND** loading states are available in the service return value

#### Scenario: Filter cases by status in useDaoService
- **WHEN** arbitration cases are fetched via React Query
- **THEN** `useDaoService` computes status from contract data: `finalized == true && result == BuyerWins` → 'resolved_buyer', `finalized == true && result == AgentWins` → 'resolved_seller', `finalized == false` → 'voting'
- **AND** `useDaoService` filters active cases (status: 'voting') into `activeCases`
- **AND** `useDaoService` filters resolved cases (status: 'resolved_buyer' or 'resolved_seller') into `resolvedCases`
- **AND** components receive filtered data through `DaoServiceContext` without changes

#### Scenario: Context pattern maintained
- **WHEN** components consume DAO data
- **THEN** they continue using `useContext(DaoServiceContext)` as before
- **AND** the service interface remains the same (`activeCases`, `resolvedCases`, `mockDaoMembers`)
- **AND** no component changes are required (except for wiring up on-chain actions)

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

### Requirement: On-Chain Case Data Integration
The DAO page SHALL fetch arbitration case data from on-chain Arbitration and TaskManager contracts, mapping contract structs to UI models with proper field conversions and status computation.

#### Scenario: Fetch case details from Arbitration contract
- **WHEN** case list is fetched from backend endpoint
- **THEN** for each caseId, frontend calls `Arbitration.getCase(taskId)` to get case struct
- **AND** case struct fields are mapped: `buyer` → `buyerAddress`, `agent` → `sellerAddress`, `amount` → `amount` (with decimals), `deadline` → `deadline`, `buyerVotes` → `votesForBuyer`, `agentVotes` → `votesForSeller`, `quorum` → `quorum`, `finalized` → `finalized`, `result` → `result`
- **AND** case details are cached using React Query with caseId as part of query key

#### Scenario: Fetch task details from TaskManager contract
- **WHEN** case list is fetched and case details are retrieved
- **THEN** for each caseId, frontend calls `TaskManager.getTask(taskId)` to get task struct
- **AND** task struct fields are used: `buyer` → verify matches case buyer, `agent` → verify matches case agent, `amount` → verify matches case amount, `metaHash` → resolve to task title (IPFS/off-chain lookup)
- **AND** task details are cached using React Query with taskId as part of query key

#### Scenario: Compute case status from contract state
- **WHEN** case data is fetched from contracts
- **THEN** status is computed as: if `finalized == true && result == BuyerWins` then status = 'resolved_buyer'
- **AND** if `finalized == true && result == AgentWins` then status = 'resolved_seller'
- **AND** if `finalized == false` then status = 'voting' (regardless of deadline)
- **AND** computed status is included in `ArbitrationCase` object

#### Scenario: Format token amounts with decimals and symbol
- **WHEN** case amount is displayed in UI
- **THEN** frontend reads `PlatformToken.decimals()` and `PlatformToken.symbol()`
- **AND** amount is formatted as `(amount / 10^decimals).toFixed(2) + " " + symbol` (e.g., "100.50 Q")
- **AND** formatted amount is displayed in ArbitrationCard instead of hardcoded "USDT"

### Requirement: Voting Eligibility and Vote Submission
DAO members SHALL be able to vote on arbitration cases if they meet eligibility requirements (sufficient stake, not already voted, deadline not passed, case not finalized). The system SHALL check eligibility before allowing vote submission and SHALL handle vote transactions with proper error handling.

#### Scenario: Check voting eligibility before vote
- **WHEN** user attempts to vote on a case
- **THEN** frontend checks `Arbitration.staked(userAddress) >= Arbitration.minStake()`
- **AND** frontend checks `Arbitration.hasVoted(taskId, userAddress) == false`
- **AND** frontend checks `block.timestamp <= case.deadline`
- **AND** frontend checks `case.finalized == false`
- **AND** if any check fails, vote button is disabled with appropriate error message
- **AND** if all checks pass, vote button is enabled

#### Scenario: Submit vote transaction
- **WHEN** user clicks vote button and eligibility checks pass
- **THEN** frontend calls `Arbitration.vote(taskId, decision)` where decision is `BuyerWins` (1) or `AgentWins` (2)
- **AND** transaction is submitted with proper gas estimation
- **AND** UI optimistically updates to show vote immediately (vote count incremented, vote buttons hidden)
- **AND** transaction pending state is shown in UI
- **AND** on success, case data is refreshed to confirm vote (or keep optimistic update if already correct)
- **AND** on failure, optimistic update is reverted and error message is displayed (user rejection, insufficient gas, contract revert)

#### Scenario: Display vote status
- **WHEN** case data is displayed
- **THEN** if `Arbitration.hasVoted(taskId, userAddress) == true`, vote buttons are hidden and "已投票" message is shown
- **AND** if user has not voted and case is active, vote buttons are shown

### Requirement: Token Staking for Voting Eligibility
DAO members SHALL be able to stake PlatformToken to gain voting eligibility. The system SHALL handle token approval before staking and SHALL allow unstaking of previously staked tokens.

#### Scenario: Check token allowance before staking
- **WHEN** user attempts to stake tokens
- **THEN** frontend checks `PlatformToken.allowance(userAddress, Arbitration.address)`
- **AND** if allowance < stake amount, approve button is shown
- **AND** if user clicks approve, `PlatformToken.approve(Arbitration.address, amount)` is called
- **AND** after approval, stake button becomes enabled

#### Scenario: Submit stake transaction
- **WHEN** user enters stake amount and clicks stake button
- **THEN** frontend validates stake amount >= `Arbitration.minStake()`
- **AND** frontend validates user balance >= stake amount
- **AND** frontend calls `Arbitration.stake(amount)`
- **AND** transaction is submitted with proper gas estimation
- **AND** transaction pending state is shown in UI
- **AND** on success, stake info is refreshed to show updated staked amount
- **AND** on failure, error message is displayed

#### Scenario: Submit unstake transaction
- **WHEN** user clicks unstake button
- **THEN** frontend calls `Arbitration.unstake(amount)`
- **AND** transaction is submitted with proper gas estimation
- **AND** transaction pending state is shown in UI
- **AND** on success, stake info is refreshed to show updated staked amount
- **AND** on failure, error message is displayed

### Requirement: Case Finalization
DAO members (users with `staked[address] >= minStake`) SHALL be able to finalize arbitration cases when finalization conditions are met (deadline passed OR quorum reached). The system SHALL handle buyer-favoring defaults (timeout/quorum failure → BuyerWins, tie → BuyerWins) and SHALL execute finalization transactions.

#### Scenario: Check finalization eligibility
- **WHEN** case is displayed
- **THEN** frontend checks if user is DAO member: `Arbitration.staked(userAddress) >= Arbitration.minStake()`
- **AND** frontend checks if case can be finalized: `case.finalized == false && (block.timestamp > case.deadline || (case.buyerVotes + case.agentVotes) >= case.quorum)`
- **AND** if user is DAO member AND case is eligible, finalize button is shown
- **AND** if user is not DAO member OR case is not eligible, finalize button is hidden

#### Scenario: Submit finalize transaction
- **WHEN** user clicks finalize button and eligibility checks pass
- **THEN** frontend calls `Arbitration.finalize(taskId)`
- **AND** transaction is submitted with proper gas estimation
- **AND** transaction pending state is shown in UI
- **AND** on success, case data is refreshed to show finalized status and result
- **AND** on failure, error message is displayed

#### Scenario: Handle buyer-favoring defaults
- **WHEN** case is finalized
- **THEN** if `totalVotes < quorum && deadline passed`, result is `BuyerWins` (buyer gets full refund)
- **AND** if `buyerVotes >= agentVotes` (including tie), result is `BuyerWins`
- **AND** if `buyerVotes < agentVotes`, result is `AgentWins`
- **AND** UI displays result as 'resolved_buyer' or 'resolved_seller' accordingly

### Requirement: UI Display Adjustments for On-Chain Data
The DAO arbitration page UI SHALL display on-chain data accurately, showing token symbols, formatted amounts, quorum requirements, and finalized status.

#### Scenario: Display token symbol and formatted amount
- **WHEN** case amount is displayed
- **THEN** token symbol is read from `PlatformToken.symbol()` (not hardcoded "USDT")
- **AND** amount is formatted using `PlatformToken.decimals()` (e.g., "100.50 Q" for 100.5 tokens with 18 decimals)
- **AND** formatted amount is displayed in ArbitrationCard

#### Scenario: Display quorum vs total voters
- **WHEN** voting progress is displayed
- **THEN** progress shows "X/Y 票" where X is `buyerVotes + agentVotes` and Y is `quorum` (not totalVoters)
- **AND** quorum requirement is displayed separately (e.g., "需要 3 票达到法定人数")
- **AND** visual progress bar shows percentage of quorum reached, not percentage of total voters

#### Scenario: Display finalized status
- **WHEN** case is displayed
- **THEN** if `case.finalized == true`, case is shown in resolved cases list
- **AND** status badge shows 'resolved_buyer' or 'resolved_seller' based on `case.result`
- **AND** finalize button is hidden for finalized cases

#### Scenario: Display deadline accurately
- **WHEN** case deadline is displayed
- **THEN** deadline is computed from `case.deadline` timestamp (not mock "剩余 23 小时")
- **AND** remaining time is calculated as `deadline - block.timestamp`
- **AND** if deadline passed, "已超时" or similar message is shown
- **AND** if deadline not passed, remaining time is shown (e.g., "剩余 2 天 3 小时")

### Requirement: Backend Case Enumeration
The backend SHALL provide an endpoint to enumerate arbitration cases by listening to CaseOpened events from the Arbitration contract and maintaining a list of active and resolved cases.

#### Scenario: Index CaseOpened events
- **WHEN** CaseOpened event is emitted from Arbitration contract
- **THEN** backend/indexer validates that corresponding task exists in TaskManager contract using `TaskManager.getTask(taskId)`
- **AND** if task exists, backend/indexer captures event data (taskId, buyer, agent, amount, deadline, quorum)
- **AND** case is added to case list with status 'voting'
- **AND** case metadata is stored (openedAt timestamp)
- **AND** if task does not exist, event is ignored (case not indexed)

#### Scenario: Index CaseFinalized events
- **WHEN** CaseFinalized event is emitted from Arbitration contract
- **THEN** backend/indexer captures event data (taskId, result, buyerVotes, agentVotes)
- **AND** case status is updated to 'resolved_buyer' or 'resolved_seller' based on result
- **AND** resolvedAt timestamp is stored

#### Scenario: Provide case list endpoint
- **WHEN** GET request is made to `/dao/cases`
- **THEN** backend returns list of case taskIds with basic metadata (openedAt, status)
- **AND** endpoint supports filtering by status (active/resolved)
- **AND** endpoint supports pagination (limit, offset)
- **AND** response matches expected format for frontend consumption

