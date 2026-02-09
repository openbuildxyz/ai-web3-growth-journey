# Remove Role-Based Authentication

## Overview
Remove the role-based authentication system from the agent marketplace. Users should be able to both sell agents and buy services without selecting a role during login.

## Background
Currently, the system requires users to select a role (buyer, seller, or DAO member) during authentication. This creates an artificial constraint where:
- Users must choose between being a buyer or seller
- Users cannot easily switch between buying and selling
- The same wallet address is locked to a single role

The reality is that users should be able to:
- Sell their agents (publish and manage agents)
- Buy services from other agents (create and manage tasks)
- Participate in DAO governance (if they stake tokens)

All without needing to select or switch roles.

## User Stories

### 1. Unified User Experience
**As a** platform user  
**I want to** connect my wallet without selecting a role  
**So that** I can seamlessly buy services and sell agents with the same account

**Acceptance Criteria:**
- When connecting wallet, user is not prompted to select a role
- User can create tasks without being a "buyer"
- User can publish agents without being a "seller"
- User can participate in DAO activities if they have staked tokens

### 2. Simplified Authentication Flow
**As a** platform user  
**I want** a streamlined login process  
**So that** I can quickly access the platform without unnecessary steps

**Acceptance Criteria:**
- Wallet connection triggers automatic authentication
- No role selection dialog appears
- JWT token is issued without role information
- User profile does not display a role badge

### 3. Permission-Based Authorization
**As a** platform developer  
**I want** authorization based on ownership and permissions  
**So that** the system is more flexible and secure

**Acceptance Criteria:**
- Agent creation is allowed for any authenticated user
- Agent updates require ownership verification (user owns the agent)
- Task creation is allowed for any authenticated user
- Task acceptance requires the user to own an agent
- DAO voting requires active DAO membership (staked tokens)

## Technical Requirements

### Frontend Changes
1. Remove role selection from AuthDialog component
2. Remove role display from Wallet component
3. Remove role from auth store (zustand)
4. Remove role from auth types
5. Update API calls to not send role parameter

### Backend Changes
1. Remove role-based authorization checks from services
2. Replace with ownership-based and permission-based checks
3. Update JWT payload to remove role field
4. Update auth service to not handle role parameter
5. Keep role field in database for backward compatibility but make it nullable or set a default value
6. Update Prisma schema to make role optional or use a default value

### Database Migration
1. The `user_role` enum and `role` field in `users` table should be kept for data integrity
2. Set a default value (e.g., 'buyer') for existing users
3. New users can have a default role that doesn't affect authorization

## Authorization Logic Changes

### Current (Role-Based)
- Create Agent: `user.role === 'seller'`
- Update Agent: `user.role === 'seller' && agent.user_id === user.userId`
- Create Task: `user.role === 'buyer'`
- Accept Task: `user.role === 'seller'`
- DAO Voting: `user.role === 'dao'`

### New (Permission-Based)
- Create Agent: Authenticated user (any)
- Update Agent: `agent.user_id === user.userId` (ownership)
- Create Task: Authenticated user (any)
- Accept Task: User owns at least one active agent
- DAO Voting: User has active DAO membership (check `dao_members` table)

## Out of Scope
- Removing the role field from the database entirely (keep for backward compatibility)
- Changing the DAO membership system
- Modifying the agent or task data models

## Success Metrics
- Users can create both agents and tasks with the same wallet
- Authentication flow has fewer steps
- No role-related errors in the application
- Existing functionality remains intact

## Dependencies
- Frontend: React, Zustand, TypeScript
- Backend: NestJS, Prisma, PostgreSQL
- Smart Contracts: No changes required

## Risks and Mitigations
- **Risk**: Breaking existing user sessions
  - **Mitigation**: Users will need to re-authenticate after deployment
- **Risk**: Authorization bypass vulnerabilities
  - **Mitigation**: Thorough testing of all permission checks
- **Risk**: Database migration issues
  - **Mitigation**: Keep role field, only change application logic
