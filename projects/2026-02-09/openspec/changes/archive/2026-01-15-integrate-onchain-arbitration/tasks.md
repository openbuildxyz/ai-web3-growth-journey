## 1. Contract Interaction Infrastructure
- [x] 1.1 Create contract interaction utilities for Arbitration contract (read functions: getCase, minStake, voteDuration, defaultQuorum, staked, hasVoted)
- [x] 1.2 Create contract interaction utilities for TaskManager contract (read function: getTask)
- [x] 1.3 Create contract interaction utilities for PlatformToken contract (read functions: symbol, decimals, balanceOf, allowance; write: approve)
- [x] 1.4 Create write transaction utilities for Arbitration (stake, unstake, vote, finalize) with error handling
- [x] 1.5 Add contract addresses configuration (from frontend_abi.md or env vars)
- [x] 1.6 Create React hooks for contract reads (useCase, useTask, useStakeInfo, useVotingEligibility)
- [x] 1.7 Create React hooks for contract writes (useStake, useUnstake, useVote, useFinalize) with transaction state

## 2. Type Definitions and Field Mappings
- [x] 2.1 Update `ArbitrationCase` type to include on-chain fields (taskId, buyer, agent, amount, deadline, quorum, buyerVotes, agentVotes, finalized, result)
- [x] 2.2 Add computed status field mapping logic (finalized + result → 'resolved_buyer'/'resolved_seller', !finalized → 'voting')
- [x] 2.3 Add token formatting utilities (formatAmount with decimals, getTokenSymbol)
- [x] 2.4 Create mapping function from `Arbitration.Case` struct to `ArbitrationCase` UI model
- [x] 2.5 Create mapping function from `TaskManager.Task` struct to task metadata (handle metaHash → title lookup - using placeholder for now)
- [x] 2.6 Update `DaoMember` type if needed (staked amount from contract vs mock votingPower - keeping as is for now)

## 3. Backend/Indexer Case Enumeration
- [ ] 3.1 Design database schema or in-memory store for indexed cases (taskId, openedAt, status)
- [ ] 3.2 Implement event listener/indexer for CaseOpened events from Arbitration contract
- [ ] 3.3 Add task existence validation: before indexing CaseOpened event, verify task exists in TaskManager using `getTask(taskId)`
- [ ] 3.4 Only index cases where corresponding task exists (ignore CaseOpened events for non-existent tasks)
- [ ] 3.5 Implement event listener/indexer for CaseFinalized events to update case status
- [ ] 3.6 Create GET `/dao/cases` endpoint that returns list of case taskIds with basic metadata
- [ ] 3.7 Add filtering by status (active/resolved) in backend endpoint
- [ ] 3.8 Add pagination support for case list endpoint
- [ ] 3.9 Update MSW mock handler to match new endpoint structure (if keeping mocks)

## 4. Frontend Service Layer Updates
- [x] 4.1 Update `useDaoService` to fetch case list from backend endpoint
- [x] 4.2 Add logic to fetch case details for each caseId using contract read hooks
- [x] 4.3 Add logic to fetch task details for each caseId using TaskManager contract
- [x] 4.4 Combine case and task data into unified `ArbitrationCase` objects
- [x] 4.5 Update filtering logic to use computed status from contract data
- [x] 4.6 Add loading states for contract reads (per-case loading indicators)
- [x] 4.7 Add error handling for failed contract reads (show error state, retry option)

## 5. Voting Flow Implementation
- [x] 5.1 Add voting eligibility check function (stake >= minStake, !hasVoted, deadline not passed, !finalized)
- [x] 5.2 Update `ArbitrationCard` to accept on-chain case data structure
- [x] 5.3 Wire up vote button handlers in `ActiveCases` component to call `useVote` hook
- [x] 5.4 Implement optimistic updates for voting (immediately update UI vote count, hide vote buttons) - React Query handles this
- [x] 5.5 Add transaction pending state during vote submission
- [x] 5.6 Refresh case data after successful vote transaction (or keep optimistic update if correct)
- [x] 5.7 Revert optimistic update on transaction failure and show error message - React Query handles revert
- [x] 5.8 Show error messages for voting failures (insufficient stake, already voted, deadline passed)
- [x] 5.9 Update vote button to show "已投票" state when `hasVoted[taskId][address] == true`

## 6. Staking Flow Implementation
- [ ] 6.1 Add staking UI component (stake amount input, current stake display, approve button)
- [ ] 6.2 Implement stake amount input with validation (minStake check, balance check)
- [ ] 6.3 Add token approval check before staking (check allowance, show approve button if needed)
- [ ] 6.4 Wire up stake button to call `useStake` hook
- [ ] 6.5 Wire up unstake button to call `useUnstake` hook
- [ ] 6.6 Add transaction pending states for stake/unstake operations
- [ ] 6.7 Refresh stake info after successful stake/unstake transaction
- [ ] 6.8 Update DAO member list to show real staked amounts from contract

## 7. Finalize Flow Implementation
- [x] 7.1 Add DAO member check for finalize button visibility (`staked[address] >= minStake`)
- [x] 7.2 Add finalize button to cases that meet finalization criteria (deadline passed OR quorum reached) AND user is DAO member
- [x] 7.3 Implement finalization eligibility check (user is DAO member, deadline passed OR totalVotes >= quorum, !finalized)
- [x] 7.4 Wire up finalize button to call `useFinalize` hook
- [x] 7.5 Add transaction pending state during finalize submission
- [x] 7.6 Refresh case data after successful finalize transaction
- [x] 7.7 Show buyer-favoring default message when finalizing timeout/quorum failure cases - handled by contract logic

## 8. UI Adjustments
- [x] 8.1 Update `ArbitrationCard` to display token symbol from PlatformToken (replace "USDT" hardcode)
- [x] 8.2 Update amount display to use formatted amount with decimals (e.g., "100.5 Q" instead of "100 USDT")
- [x] 8.3 Update voting progress to show "X/Y 票" where Y is quorum (not totalVoters)
- [x] 8.4 Add quorum indicator (e.g., "需要 3 票达到法定人数")
- [x] 8.5 Update deadline display to show actual timestamp/remaining time (not mock "剩余 23 小时")
- [x] 8.6 Add finalized status badge/indicator for resolved cases
- [x] 8.7 Update status badges to use contract result (BuyerWins → 'resolved_buyer', AgentWins → 'resolved_seller')
- [x] 8.8 Handle binary outcomes display (no partial splits, show full amount to winner)

## 9. Error Handling and Edge Cases
- [ ] 9.1 Handle case where case doesn't exist (getCase returns exists=false)
- [ ] 9.2 Handle RPC errors (network issues, rate limiting)
- [ ] 9.3 Handle transaction failures (user rejection, insufficient gas, contract revert)
- [ ] 9.4 Handle optimistic update revert on transaction failure
- [ ] 9.5 Add retry logic for failed contract reads
- [ ] 9.6 Add fallback to mock data if backend/contracts unavailable (development only)
- [ ] 9.7 Note: Task existence is validated by backend/indexer, so frontend should not encounter cases without tasks

## 10. Testing and Validation
- [ ] 10.1 Add unit tests for field mapping functions (contract struct → UI model)
- [ ] 10.2 Add unit tests for status computation logic
- [ ] 10.3 Add unit tests for voting eligibility checks
- [ ] 10.4 Add integration tests for contract interaction hooks (mock contract calls)
- [ ] 10.5 Test voting flow end-to-end (stake → vote → finalize)
- [ ] 10.6 Test edge cases (tie votes → buyer wins, timeout → buyer wins, quorum not met → buyer wins)
- [ ] 10.7 Validate token formatting with different decimals (18, 6, etc.)
- [ ] 10.8 Test with real contracts on testnet (Sepolia)
