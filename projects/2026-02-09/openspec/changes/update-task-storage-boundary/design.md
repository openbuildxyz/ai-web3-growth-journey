## Context
Task data is split across on-chain contracts and off-chain storage. We need a
deterministic payload format so `metaHash` and `deliveryHash` can be computed
consistently across frontend, backend, and indexer consumers.

## Goals / Non-Goals
- Goals:
  - Define canonical JSON payloads for task metadata and delivery artifacts.
  - Specify deterministic serialization and hashing rules.
  - Document storage locations and aggregation flow.
  - Clarify compatibility and BREAKING impact.
- Non-Goals:
  - Specify the on-chain contract interface (already defined in contracts).
  - Choose a single storage provider for all deployments.

## Decisions
- Decision: Canonical JSON payloads
  - Task metadata payload (off-chain):
    - `version` (string, required)
    - `taskId` (string, required, on-chain id as string)
    - `title` (string, required)
    - `description` (string, required)
    - `agentId` (string, optional)
    - `createdAt` (string, required, ISO-8601)
    - `tokenSymbol` (string, required)
  - Delivery payload (off-chain):
    - `version` (string, required)
    - `taskId` (string, required)
    - `deliveries` (array, required)
      - `type` (string, required, e.g. `ipfs`, `oss`)
      - `uri` (string, required)
      - `checksum` (string, optional)
    - `submittedAt` (string, required, ISO-8601)
- Decision: Serialization rules
  - UTF-8 JSON, no whitespace, deterministic ordering by lexicographic key.
  - Arrays preserve order as provided.
  - Omit optional fields when unset (no nulls).
- Decision: Hashing
  - `metaHash` / `deliveryHash` = keccak256(UTF-8 canonical JSON).
  - Reuse the existing keccak256 helper where available to avoid divergence.
- Decision: Storage and aggregation
  - Off-chain payloads stored in DB or IPFS/OSS.
  - Indexer aggregates on-chain fields with off-chain payloads into task views.

## Risks / Trade-offs
- Payload format changes are breaking for hash verification.
- Multiple storage backends require consistent payload retrieval logic.

## Compatibility / BREAKING
- Existing tasks without off-chain payloads or on-chain hashes MUST continue to
  render using stored task fields; missing `metaHash`/`deliveryHash` is allowed.
- The indexer (GraphSyncService) MUST tolerate missing `create_tx_hash` or
  `chain_task_id` when backfilling older tasks; these are not treated as hard
  failures and SHOULD log a warning before skipping.
- No schema-breaking changes are required for task views; event metadata is
  stored in `task_events.data` for backward compatibility.

## Migration Plan
- If canonical JSON changes, bump version and re-hash existing payloads or
  maintain backward-compatible readers keyed by the stored version field.
- Deploy order: ship backend/indexer event handling first, then enable frontend
  off-chain payload writes to avoid null lookups.
- Data migration: no backfill required; optionally generate payloads for legacy
  tasks and store new `metaHash`/`deliveryHash` with versioned payloads.
- Version checks: readers MUST branch on `payload.version`; unknown versions
  SHOULD be treated as opaque and skipped without breaking task rendering.
- Rollback: disable the new event handlers or revert the backend deployment.
  Frontend should fall back to stored task fields and ignore previously written
  off-chain payloads.

## Open Questions
- Should `tokenSymbol` be replaced with `tokenAddress` in payloads?
- Where should payload versioning be stored (on-chain or off-chain)?
