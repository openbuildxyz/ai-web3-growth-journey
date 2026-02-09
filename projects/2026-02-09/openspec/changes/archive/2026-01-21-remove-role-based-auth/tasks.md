# Tasks: Remove Role-Based Authentication

## Backend Tasks

### 1. Update JWT Strategy and Payload
- [x] 1.1 Remove `role` field from `JwtPayload` interface in `jwt.strategy.ts`
- [x] 1.2 Update JWT payload generation in `auth.service.ts` to exclude role
- [x] 1.3 Update any code that reads `user.role` from JWT payload

### 2. Update Auth Service
- [x] 2.1 Remove `role` parameter from `login()` method signature
- [x] 2.2 Remove role handling logic in user upsert operation
- [x] 2.3 Keep default role assignment for database compatibility
- [x] 2.4 Update auth DTOs to remove role field

### 3. Update Agents Service Authorization
- [x] 3.1 Remove role check from `createAgent()` method
- [x] 3.2 Keep ownership check in `updateAgent()` method
- [x] 3.3 Update error messages to reflect ownership-based authorization
- [ ] 3.4 Add unit tests for new authorization logic

### 4. Update Tasks Service Authorization
- [x] 4.1 Remove role check from `createTask()` method
- [x] 4.2 Replace role check in `acceptTask()` with agent ownership verification
- [x] 4.3 Add agent status check (must be active) in `acceptTask()`
- [x] 4.4 Update `listTasks()` to remove role-based filtering
- [x] 4.5 Update query DTOs to remove role parameter
- [ ] 4.6 Add unit tests for new authorization logic

### 5. Update Arbitration Service Authorization
- [x] 5.1 Replace role check in `listArbitrations()` with DAO membership check
- [x] 5.2 Replace role check in `voteArbitration()` with DAO membership check
- [x] 5.3 Add helper method to check DAO membership
- [x] 5.4 Update error messages to reflect membership-based authorization
- [ ] 5.5 Add unit tests for DAO membership checks

### 6. Update Backend Tests
- [ ] 6.1 Update auth service tests to remove role assertions
- [ ] 6.2 Update agents service tests to remove role checks
- [ ] 6.3 Update tasks service tests to remove role checks
- [ ] 6.4 Update arbitration service tests to use DAO membership
- [ ] 6.5 Update e2e tests to remove role selection steps
- [ ] 6.6 Add tests for ownership-based authorization
- [ ] 6.7 Add tests for DAO membership authorization

## Frontend Tasks

### 7. Update Auth Types
- [x] 7.1 Remove `AuthRole` enum from `lib/types/auth.ts`
- [x] 7.2 Remove `role` field from `AuthLoginRequest` type
- [x] 7.3 Update any imports of `AuthRole` type

### 8. Update Auth Store
- [x] 8.1 Remove `role` field from `AuthState` interface
- [x] 8.2 Update `setAuth()` method to not accept role parameter
- [x] 8.3 Remove role from persisted state
- [x] 8.4 Update any code that reads role from auth store

### 9. Update AuthDialog Component
- [x] 9.1 Remove role selection UI (role cards)
- [x] 9.2 Remove `selectedRole` state
- [x] 9.3 Remove role icons and descriptions
- [x] 9.4 Update `handleLogin()` to not send role parameter
- [x] 9.5 Simplify dialog to just show "Sign to authenticate" message
- [x] 9.6 Update dialog title and description

### 10. Update Wallet Component
- [x] 10.1 Remove role import from auth store
- [x] 10.2 Remove role badge display from connected state
- [x] 10.3 Simplify wallet display to show only address and network
- [x] 10.4 Update component styling after role removal

### 11. Update API Calls
- [ ] 11.1 Review all API calls that might send role parameter
- [ ] 11.2 Remove role parameter from login API call
- [ ] 11.3 Remove role parameter from any other API calls
- [ ] 11.4 Update API types/interfaces

### 12. Frontend Testing and Cleanup
- [ ] 12.1 Test wallet connection flow
- [ ] 12.2 Test authentication without role selection
- [ ] 12.3 Test agent creation and management
- [ ] 12.4 Test task creation and management
- [ ] 12.5 Remove any unused role-related code
- [ ] 12.6 Update component tests if any exist

## Documentation Tasks

### 13. Update Documentation
- [ ] 13.1 Update API documentation to remove role parameters
- [ ] 13.2 Document new authorization model (ownership-based)
- [ ] 13.3 Update authentication flow documentation
- [ ] 13.4 Add migration notes for existing users

## Deployment Tasks

### 14. Deployment Preparation
- [ ] 14.1 Review all changes for security implications
- [ ] 14.2 Prepare deployment checklist
- [ ] 14.3 Plan for user re-authentication after deployment
- [ ] 14.4 Prepare rollback plan
- [ ] 14.5 Set up monitoring for authorization errors

### 15. Post-Deployment Verification
- [ ] 15.1 Verify authentication flow works correctly
- [ ] 15.2 Verify agent operations work correctly
- [ ] 15.3 Verify task operations work correctly
- [ ] 15.4 Verify DAO operations work correctly
- [ ] 15.5 Monitor error logs for authorization issues
- [ ] 15.6 Verify no role-related errors in frontend console

## Notes

### Task Dependencies
- Backend tasks (1-6) should be completed before frontend tasks (7-12)
- Testing tasks (6, 12) should be done after implementation tasks
- Documentation (13) can be done in parallel with implementation
- Deployment tasks (14-15) are done last

### Priority Order
1. **High Priority**: Auth service, JWT payload (tasks 1-2)
2. **High Priority**: Service authorization updates (tasks 3-5)
3. **Medium Priority**: Frontend auth flow (tasks 7-10)
4. **Medium Priority**: Testing (tasks 6, 12)
5. **Low Priority**: Documentation and deployment (tasks 13-15)

### Estimated Effort
- Backend changes: 4-6 hours
- Frontend changes: 2-3 hours
- Testing: 2-3 hours
- Documentation: 1-2 hours
- **Total**: 9-14 hours

### Risk Areas
- Authorization bypass vulnerabilities (test thoroughly)
- Breaking existing user sessions (users need to re-authenticate)
- Missing permission checks (review all endpoints)
- DAO membership edge cases (test with and without membership)
