# Change: Integrate On-Chain Arbitration/TaskManager Logic into DAO Arbitration Page

## Why
The DAO arbitration page currently uses mock data and does not interact with the on-chain Arbitration and TaskManager contracts. To enable real decentralized dispute resolution, the frontend must integrate with these contracts to display actual arbitration cases, allow DAO members to stake tokens, vote on cases, and finalize resolved disputes. This integration requires careful mapping of contract data structures to UI models, handling of contract constraints (binary outcomes, buyer-favoring defaults, no enumeration), and implementing proper eligibility checks for voting/staking operations.

## What Changes
- **Data Sourcing**: Implement hybrid approach using backend/indexer for case enumeration (via CaseOpened events) and direct contract reads for real-time case details
- **Field Mappings**: Map `Arbitration.cases` and `TaskManager.tasks` structs to `ArbitrationCase` UI model, handling token decimals, status conversions, and address formatting
- **Voting Flow**: Implement `vote(taskId, decision)` with eligibility checks (stake >= minStake, not already voted, deadline not passed, case not finalized)
- **Staking Flow**: Implement `stake(amount)` and `unstake(amount)` with token approval handling
- **Finalize Flow**: Implement `finalize(taskId)` with quorum/deadline validation and buyer-favoring tie-breaker logic
- **UI Adjustments**: Update ArbitrationCard to display token symbol/unit from PlatformToken, show quorum vs total voters, display finalized status, handle binary outcomes (BuyerWins/AgentWins)
- **Backend/Indexer**: Add endpoint/indexer logic to enumerate cases by listening to CaseOpened events and maintaining case list
- **Status Mapping**: Map contract states (finalized, deadline, quorum) to UI status ('voting', 'resolved_buyer', 'resolved_seller')

## Impact
- **Affected specs**: `specs/dao/spec.md` - Add requirements for on-chain integration, contract reads, voting/staking/finalize flows
- **Affected code**:
  - `apps/agent-market-fe/app/dao/service.ts` - Add contract interaction hooks
  - `apps/agent-market-fe/app/dao/components/ActiveCases.tsx` - Wire up voting handlers
  - `apps/agent-market-fe/app/dao/components/SolvedCases.tsx` - Display finalized cases
  - `apps/agent-market-fe/components/ui/ArbitrationCard.tsx` - Update for on-chain data structure
  - `apps/agent-market-fe/lib/types/dao.ts` - Update types to match contract structures
  - `apps/agent-market-be/src/dao/` - Add case enumeration endpoint/indexer
  - New contract interaction utilities for Arbitration and TaskManager
- **Contract constraints to handle**:
  - Binary outcomes only (BuyerWins/AgentWins) - no partial splits
  - Buyer-favoring defaults: timeout/quorum failure → BuyerWins, tie → BuyerWins
  - No case enumeration in contracts - must track CaseOpened events
  - Token decimals from PlatformToken contract
  - One vote per address per case
  - Minimum stake requirement for voting eligibility
