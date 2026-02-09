# Bug Report

## E2E Test Failures Analysis

Based on the analysis of the project documentation (`PRD.md`, `技术文档.md`, `todos.md`, `swagger.json`) and the E2E test results, the root cause of the majority of the failures has been identified.

### 1. Root Cause: Incorrect Role Assignment in Authentication

**File:** `src/Modules/Auth/auth.service.ts`

**Bug:** The `login` method in the `AuthService` currently ignores the `role` parameter provided during login. It hardcodes every new user's role to `'buyer'`. Furthermore, the generated JWT payload does not include the user's role, making role-based access control (RBAC) impossible.

**Affected Tests:**
- `test/e2e/auth.e2e-spec.ts`: Fails because it explicitly tests for the creation of a `'seller'` user.
- `test/e2e/arbitration.e2e-spec.ts`: Fails with `403 Forbidden` because the test user, intended to be a DAO member, is authenticated with a JWT that lacks the `'dao'` role.
- `test/e2e/agents.e2e-spec.ts`: Fails with `403 Forbidden` because the user (likely a seller) does not have the correct role in their token.
- `test/e2e/tasks.e2e-spec.ts` (`/accept`, `/deliver`): Fails with `403 Forbidden` because the seller user does not have the `'seller'` role in their token.

**This single bug is the primary cause of almost all permission-related (`403 Forbidden`) errors across the E2E test suites.**

### 2. Incorrect Test Implementation

**File:** `test/e2e/tasks.e2e-spec.ts`

**Bug:** The test case for completing a task (`/tasks/:id/complete`) is using an incorrect and likely deprecated endpoint. The project's documentation (`swagger.json` and `todos.md`) clearly states that chain-related actions must be reported via the generic `POST /tasks/{id}/report-action` endpoint with an `action_type` of `'approve'`. The current test calls `POST /tasks/:id/complete` directly, leading to a `400 Bad Request` because the application logic correctly rejects this invalid or out-of-sequence action.

**This is an issue with the test case itself being outdated, not a bug in the application logic.**
