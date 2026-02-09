# Remove Role-Based Authentication

## Summary
Remove the role-based authentication system from the agent marketplace. Users should be able to both sell agents and buy services without selecting a role during login.

## Problem
Currently, the system requires users to select a role (buyer, seller, or DAO member) during authentication. This creates an artificial constraint where:
- Users must choose between being a buyer or seller
- Users cannot easily switch between buying and selling
- The same wallet address is locked to a single role

## Solution
Replace role-based authentication with permission-based authorization:
- Remove role selection from login flow
- Authenticate users by wallet address only
- Authorize actions based on ownership and specific permissions
- Agent operations: ownership-based
- Task operations: ownership + agent status checks
- DAO operations: membership-based (check `dao_members` table)

## Scope
### Backend Changes
- Update JWT payload to remove role field
- Update auth service to not handle role parameter
- Replace role checks with permission checks in services (Agents, Tasks, Arbitration)
- Keep role field in database for backward compatibility

### Frontend Changes
- Remove role selection from AuthDialog
- Remove role display from Wallet component
- Remove role from auth store and types
- Consolidate wallet connection and authentication into single flow

### Out of Scope
- Removing the role field from database entirely
- Changing the DAO membership system
- Modifying agent or task data models

## Impact
- Users can create both agents and tasks with the same wallet
- Simplified authentication flow (single button click)
- More secure authorization based on ownership
- Existing user sessions will be invalidated (users need to re-authenticate)

## Status
✅ Implemented and deployed
