# Design: Remove Role-Based Authentication

## Architecture Overview

This design removes role-based authentication and replaces it with permission-based authorization. The system will authenticate users by wallet address only, and authorize actions based on ownership and specific permissions.

## Component Changes

### 1. Frontend Authentication Flow

#### Current Flow
```
1. User connects wallet
2. AuthDialog opens with role selection
3. User selects role (buyer/seller/dao)
4. Sign message with role parameter
5. Backend creates/updates user with selected role
6. JWT contains role information
7. Role displayed in UI
```

#### New Flow
```
1. User connects wallet
2. Sign message (no role selection)
3. Backend creates/updates user with default role
4. JWT contains user ID and wallet address only
5. No role displayed in UI
```

### 2. Backend Authorization Strategy

#### Permission Checks

**Agent Operations**
- **Create Agent**: Any authenticated user
  ```typescript
  // No role check needed
  async createAgent(user: JwtPayload, dto: CreateAgentDto) {
    // Create agent for user.userId
  }
  ```

- **Update Agent**: Ownership verification
  ```typescript
  async updateAgent(user: JwtPayload, agentId: string, dto: UpdateAgentDto) {
    const agent = await this.prisma.agents.findUnique({ where: { id: agentId } });
    if (agent.user_id !== user.userId) {
      throw new ForbiddenException('You do not own this agent');
    }
    // Update agent
  }
  ```

**Task Operations**
- **Create Task**: Any authenticated user
  ```typescript
  async createTask(user: JwtPayload, dto: CreateTaskDto) {
    // Create task for user.userId as buyer
  }
  ```

- **Accept Task**: User must own an active agent
  ```typescript
  async acceptTask(user: JwtPayload, taskId: string, agentId: string) {
    const agent = await this.prisma.agents.findUnique({ 
      where: { id: agentId } 
    });
    
    if (agent.user_id !== user.userId) {
      throw new ForbiddenException('You do not own this agent');
    }
    
    if (agent.status !== 'active') {
      throw new ForbiddenException('Agent must be active to accept tasks');
    }
    
    // Accept task
  }
  ```

**DAO Operations**
- **View Arbitrations**: Check DAO membership
  ```typescript
  async listArbitrations(user: JwtPayload, query: ListArbitrationsDto) {
    const daoMember = await this.prisma.dao_members.findUnique({
      where: { user_id: user.userId }
    });
    
    if (!daoMember) {
      throw new ForbiddenException('DAO membership required');
    }
    
    // Return arbitrations
  }
  ```

- **Vote on Arbitration**: Check DAO membership
  ```typescript
  async voteArbitration(user: JwtPayload, arbitrationId: string, dto: VoteDto) {
    const daoMember = await this.prisma.dao_members.findUnique({
      where: { user_id: user.userId }
    });
    
    if (!daoMember) {
      throw new ForbiddenException('DAO membership required');
    }
    
    // Record vote
  }
  ```

### 3. Data Model Changes

#### JWT Payload
```typescript
// Before
interface JwtPayload {
  userId: string;
  role: string;
  walletAddress: string;
}

// After
interface JwtPayload {
  userId: string;
  walletAddress: string;
}
```

#### Auth Store (Frontend)
```typescript
// Before
interface AuthState {
  token: string | null;
  role: Role | null;
  address: string | null;
  setAuth: (token: string, role: Role, address: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

// After
interface AuthState {
  token: string | null;
  address: string | null;
  setAuth: (token: string, address: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}
```

#### Database Schema
```prisma
// Keep the role field for backward compatibility
// Set a default value for new users
model users {
  id              String    @id @db.Uuid
  wallet_address  String    @unique
  email           String?
  role            user_role @default(buyer)  // Keep with default
  // ... other fields
}
```

## Implementation Strategy

### Phase 1: Backend Changes
1. Update JWT strategy to remove role from payload
2. Update auth service to not handle role parameter
3. Replace role checks with permission checks in:
   - AgentsService (createAgent, updateAgent)
   - TasksService (createTask, acceptTask, listTasks)
   - ArbitrationService (listArbitrations, voteArbitration)
4. Add helper methods for permission checks
5. Update DTOs to remove role parameters

### Phase 2: Frontend Changes
1. Remove role from auth types
2. Update auth store to remove role
3. Remove role selection from AuthDialog
4. Remove role display from Wallet component
5. Update API calls to not send role parameter

### Phase 3: Testing
1. Test authentication flow without role
2. Test agent creation and management
3. Test task creation and acceptance
4. Test DAO operations with membership check
5. Test authorization edge cases

## Security Considerations

### Authorization Improvements
- **Ownership-based**: More secure than role-based for resource access
- **Explicit membership**: DAO operations require actual membership record
- **Agent verification**: Task acceptance requires owning an active agent

### Potential Vulnerabilities
- **Missing ownership checks**: Ensure all update operations verify ownership
- **DAO membership bypass**: Always check dao_members table, not just role
- **Agent status**: Verify agent is active before allowing task acceptance

### Mitigation Strategies
1. Create reusable authorization guards/decorators
2. Add comprehensive unit tests for permission checks
3. Add integration tests for authorization flows
4. Document permission requirements for each endpoint

## Migration Plan

### Deployment Steps
1. Deploy backend changes first
2. Existing JWT tokens will be invalid (users need to re-authenticate)
3. Deploy frontend changes
4. Monitor for authorization errors
5. No database migration needed (role field kept with default)

### Rollback Plan
If issues arise:
1. Revert frontend to previous version
2. Revert backend to previous version
3. Users will need to re-authenticate again
4. No data loss (role field preserved)

## Testing Strategy

### Unit Tests
- Auth service: JWT generation without role
- Services: Permission check logic
- Guards: Authorization decorators

### Integration Tests
- Authentication flow end-to-end
- Agent CRUD operations with ownership checks
- Task CRUD operations with permission checks
- DAO operations with membership checks

### Manual Testing
- Connect wallet and authenticate
- Create and manage agents
- Create and accept tasks
- Participate in DAO voting (with membership)
- Verify authorization errors for unauthorized actions

## Performance Considerations

### Database Queries
- Additional queries for permission checks (dao_members, agents)
- Consider caching DAO membership status
- Index on agents.user_id for ownership checks

### Optimization Opportunities
- Cache user's agent list for task acceptance checks
- Cache DAO membership status with TTL
- Use database joins to reduce query count

## Future Enhancements

### Role Evolution
- Keep role field for analytics and reporting
- Track user behavior patterns (primarily buyer vs seller)
- Use for personalized UI/UX recommendations

### Advanced Permissions
- Agent-level permissions (co-ownership, delegation)
- Task-level permissions (team collaboration)
- DAO-level permissions (different voting weights)

## Documentation Updates

### API Documentation
- Update Swagger/OpenAPI specs to remove role parameters
- Document new authorization requirements
- Add examples for permission-based operations

### Developer Documentation
- Update authentication guide
- Document permission check patterns
- Add authorization best practices

## Success Criteria

1. ✅ Users can authenticate without selecting a role
2. ✅ Users can create both agents and tasks with same wallet
3. ✅ Authorization works correctly based on ownership
4. ✅ DAO operations require actual membership
5. ✅ No role-related UI elements remain
6. ✅ All tests pass
7. ✅ No authorization bypass vulnerabilities
