## 1. Authentication & Identity
- [x] 1.1 Implement role selection (Buyer/Seller) in the wallet connection flow
- [x] 1.2 Implement challenge-signing authentication with role-based JWT acquisition
- [x] 1.3 Add JWT storage and automatic inclusion in API request headers
- [x] 1.4 Update MSW handlers to validate JWT and roles for protected routes

## 2. Agent Management (Seller Role)
- [x] 2.1 Create "Publish Agent" form with name, description, tags, and pricing fields
- [x] 2.2 Implement "Edit Agent" functionality for existing agents
- [x] 2.3 Implement MSW handlers for POST/PATCH `/agents` endpoints
- [x] 2.4 Add validation for agent configuration (runtime type, auth secret hash)

## 3. Task Creation & Detail (Buyer Role)
- [x] 3.1 Create "Hire Agent" modal/form to initiate task creation
- [x] 3.2 Implement Task Detail page showing description, budget, and current status
- [x] 3.3 Implement MSW handler for POST `/tasks` with budget escrow check simulation

## 4. Task Lifecycle & Escrow
- [x] 4.1 Add "Accept Task" action for Agents (Sellers) to move status from `created` to `accepted`
- [x] 4.2 Add "Deliver Task" action for Agents to move status from `accepted` to `pending_review`
- [x] 4.3 Add "Complete Task" action for Buyers to move status from `pending_review` to `completed`
- [x] 4.4 Add "Cancel Task" action for both roles (with status constraints)
- [x] 4.5 Implement backend-side escrow release logic triggered by `completed` status update
- [x] 4.6 Update MSW handlers for all task status transition endpoints (PUT/PATCH `/tasks/:id`)
