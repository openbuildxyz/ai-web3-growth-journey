## Context
The DAO arbitration page needs to integrate with on-chain Arbitration and TaskManager contracts. The contracts use a token-staked voting model where DAO members must stake PlatformToken to gain voting eligibility. Cases are opened automatically when tasks are disputed, and voting follows strict rules (quorum, deadline, one vote per address). The frontend currently uses mock data and needs to transition to real contract interactions.

## Goals / Non-Goals
- **Goals**:
  - Display real arbitration cases from on-chain contracts
  - Enable DAO members to stake tokens and vote on cases
  - Allow DAO members to finalize cases when conditions are met
  - Show accurate voting progress, quorum status, and deadlines
  - Handle contract constraints (binary outcomes, buyer-favoring defaults)
- **Non-Goals**:
  - Implementing the indexer/backend event listener (assumed to exist or be implemented separately)
  - Supporting partial vote splits or weighted voting beyond 1:1
  - Modifying contract logic or adding new contract features

## Decisions

### Decision: Hybrid Data Sourcing (Backend Enumeration + Direct Contract Reads)
**What**: Use backend/indexer to enumerate cases (via CaseOpened events) and provide case list endpoint. Frontend reads individual case details directly from contracts for real-time accuracy.

**Why**: 
- Contracts don't provide case enumeration (no array/list of case IDs)
- Direct contract reads ensure real-time accuracy for voting counts, deadlines, finalized status
- Backend can efficiently track CaseOpened events and maintain case list
- Reduces RPC load by caching case list while allowing real-time detail fetches

**Alternatives considered**:
- Pure event-based: Would require complex event filtering and state reconstruction
- Pure backend: Would introduce latency and require constant polling for updates
- Pure direct reads: Would require knowing all case IDs upfront (not possible)

### Decision: Field Mapping Strategy
**What**: Map contract structs to UI model with computed fields:
- `Arbitration.Case` → `ArbitrationCase` with status computed from `finalized`, `deadline`, `quorum`
- `TaskManager.Task` → Task metadata (title from metaHash/IPFS, buyer/agent addresses)
- Token amounts: Read `decimals()` from PlatformToken, format with symbol

**Why**: 
- UI model needs human-readable status strings ('voting', 'resolved_buyer', etc.)
- Contract uses enums (Decision.None/BuyerWins/AgentWins) and booleans
- Token amounts need formatting with decimals and symbol for display

**Alternatives considered**:
- Keep contract structs as-is: Would require UI to handle raw contract types
- Separate models: Adds complexity but improves type safety and separation of concerns

### Decision: Voting Eligibility Checks
**What**: Check eligibility before allowing vote: `staked[address] >= minStake`, `!hasVoted[taskId][address]`, `block.timestamp <= deadline`, `!finalized`.

**Why**: 
- Prevents failed transactions and improves UX
- Contract enforces these checks but frontend should validate first
- Can show helpful error messages for each failure case

**Alternatives considered**:
- Let contract handle all validation: Poor UX, users pay gas for failed transactions
- Full client-side validation: Risk of stale data, but acceptable for eligibility checks

### Decision: Status Computation Logic
**What**: Compute UI status from contract state:
- `finalized == true` → 'resolved_buyer' if `result == BuyerWins`, else 'resolved_seller'
- `finalized == false && block.timestamp <= deadline` → 'voting'
- `finalized == false && block.timestamp > deadline` → 'voting' (still voting until finalized, but can be finalized)

**Why**: 
- Contract doesn't have explicit 'voting' status, only `finalized` boolean
- Deadline passed doesn't mean finalized - someone must call `finalize()`
- UI needs clear status for filtering and display

**Alternatives considered**:
- Add status to contract: Would require contract upgrade (not in scope)
- Use deadline as status indicator: Doesn't account for finalized state

### Decision: Token Approval Flow
**What**: Check `allowance(Arbitration)` before staking, prompt user to approve if insufficient. Use same pattern as task creation (approve to EscrowVault).

**Why**: 
- ERC20 requires approval before transfer
- Consistent with existing task creation flow
- Prevents failed transactions

**Alternatives considered**:
- Auto-approve maximum: Security risk, users may not want unlimited approval
- Check on every action: More checks but safer

### Decision: Optimistic Updates for Voting
**What**: Implement optimistic updates for voting - immediately update UI to show vote, then revert if transaction fails.

**Why**: 
- Improves perceived performance and UX
- Vote counts update instantly, making UI feel responsive
- Can revert on failure with error message

**Alternatives considered**:
- Wait for transaction confirmation: More accurate but slower UX
- No optimistic updates: Safer but less responsive

### Decision: Finalize Access Control
**What**: Finalize button SHALL only be visible to DAO members (users with `staked[address] >= minStake`).

**Why**: 
- Restricts finalization to active DAO participants
- Prevents unauthorized finalization attempts
- Aligns with DAO governance model

**Alternatives considered**:
- Allow anyone to finalize: Simpler but less secure
- Require additional permissions: More complex, not needed for MVP

### Decision: Task Existence Validation
**What**: If TaskManager task doesn't exist for a caseId, the case should not appear in case list (backend/indexer should validate task exists before indexing CaseOpened event).

**Why**: 
- Prevents orphaned cases without corresponding tasks
- Ensures data integrity between TaskManager and Arbitration contracts
- Simplifies frontend error handling (no need to handle missing tasks)

**Alternatives considered**:
- Handle missing tasks in frontend: More error handling complexity
- Allow orphaned cases: Data inconsistency risk

## Risks / Trade-offs

### Risk: Stale Case List from Backend
**Mitigation**: Backend should index CaseOpened events in real-time. Frontend can poll case list endpoint or use WebSocket for updates. Direct contract reads for case details ensure accuracy.

### Risk: RPC Rate Limiting
**Mitigation**: Use React Query caching to minimize redundant reads. Batch multiple case detail reads if possible. Consider using a dedicated RPC provider with higher rate limits.

### Risk: Contract State Changes During User Interaction
**Mitigation**: Re-fetch case details before critical actions (vote, finalize). Show loading states during contract interactions. Use transaction receipts to confirm state changes. For optimistic updates, revert UI state if transaction fails.

### Trade-off: Real-time vs Performance
**Decision**: Prefer real-time accuracy for voting counts and deadlines (direct reads) over performance. Cache case list (backend) but refresh case details on user actions.

## Migration Plan
1. **Phase 1**: Update types and add contract interaction utilities (non-breaking)
2. **Phase 2**: Add backend case enumeration endpoint (new endpoint, doesn't break existing)
3. **Phase 3**: Update frontend service to fetch from backend + contracts (gradual migration, keep mock fallback)
4. **Phase 4**: Wire up voting/staking/finalize flows (new functionality)
5. **Phase 5**: Remove mock data fallback (breaking, but after validation)

**Rollback**: Keep mock data handlers until Phase 5. Can revert to mock data by changing service implementation.

## Open Questions
- ✅ **Optimistic updates**: We may use optimistic updates for voting to improve UX. Decision documented above.
- ✅ **Network switching**: Network switching is not allowed in this product, so no special handling needed.
- ✅ **Finalize access**: Finalize button should be visible only to DAO members (users with sufficient stake). Decision documented above.
- ✅ **Missing tasks**: If tasks don't exist, there shouldn't be relevant arbitration cases. Backend/indexer should validate task existence before indexing CaseOpened events. Decision documented above.
