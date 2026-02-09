## 1. Implementation
- [ ] 1.1 Define canonical JSON payloads for task metadata and delivery artifacts (shared schema).
- [ ] 1.2 Update frontend task creation to compute metaHash from canonical JSON and persist payload off-chain.
- [ ] 1.3 Update frontend delivery submission to compute deliveryHash and persist delivery payload off-chain.
- [x] 1.4 Update backend/indexer to store off-chain payloads and return aggregated task views.
- [x] 1.5 Update backend/indexer to map on-chain fields (taskId, amount, status, arbitration result) into task views.
- [x] 1.6 Document compatibility, BREAKING impact (if any), and migration/rollback steps for indexer/schema changes.
- [x] 1.7 Add MSW mocks for off-chain payload retrieval and aggregated task list (development).

## 2. Testing & Validation
- [ ] 2.1 Verify metaHash/deliveryHash generation against canonical JSON (deterministic hashing).
- [ ] 2.2 Verify off-chain payload retrieval and aggregated task view includes on-chain fields.
- [ ] 2.3 Verify migration/compatibility path (existing tasks still render; rollback restores prior view).
