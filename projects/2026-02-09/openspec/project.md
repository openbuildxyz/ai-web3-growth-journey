# Project Context

## Purpose
Agent Market is a decentralized marketplace platform for AI agents. Users can browse, purchase, and interact with various AI agents that perform specific tasks. The platform includes:
- Agent marketplace with ratings, pricing, and availability status
- Task management system for buyers and sellers
- DAO (Decentralized Autonomous Organization) arbitration system for dispute resolution
- Wallet integration for blockchain transactions

## Tech Stack

### Monorepo Architecture
- **Package Manager**: pnpm (v10.27.0)
- **Build System**: Turborepo for monorepo orchestration
- **Workspace Structure**: 
  - `apps/agent-market-fe` - Next.js frontend
  - `apps/agent-market-be` - NestJS backend
  - `contracts/ai-agent` - Smart contracts (Hardhat)
  - `packages/ui` - Shared UI components
  - `packages/hooks` - Shared React hooks

### Frontend (`agent-market-fe`)
- **Framework**: Next.js 16.1.1 with App Router
- **React**: v19.2.3
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS 4 with custom animations
- **UI Components**: Radix UI primitives (dialog, alert-dialog, label, progress, slot)
- **Forms**: React Hook Form + Zod validation
- **State Management**: 
  - Zustand for client state
  - TanStack Query (React Query) for server state
  - RxJS for reactive programming
- **Animations**: Framer Motion
- **API Mocking**: MSW (Mock Service Worker)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **Theming**: next-themes for dark/light mode

### Backend (`agent-market-be`)
- **Framework**: NestJS 11.x
- **Runtime**: Node.js
- **Language**: TypeScript 5.x
- **Testing**: Jest with Supertest for e2e tests

### Development Tools
- **Linter & Formatter**: Biome (v2.3.11)
- **Git Hooks**: Husky + Commitlint (conventional commits)
- **Lint Staged**: Pre-commit formatting with Biome
- **Version Management**: Changesets for monorepo versioning

## Project Conventions

### Code Style
- **Formatter**: Biome with 2-space indentation
- **Line Width**: 80 characters
- **Line Ending**: LF
- **Quotes**: Single quotes for JS/TS, double quotes for JSX attributes
- **Semicolons**: Optional (as needed)
- **Trailing Commas**: Always
- **Arrow Parens**: Always
- **File Naming**: 
  - Components: PascalCase (e.g., `AgentCard.tsx`, `Header.tsx`)
  - Utilities: camelCase (e.g., `utils.ts`, `service.ts`)
  - Pages: lowercase with Next.js conventions (e.g., `page.tsx`)
- **Import Organization**: Disabled (no auto-organize)
- **Type Definitions**: Zod schemas for runtime validation + TypeScript inference

### Architecture Patterns

#### Frontend Architecture
- **App Router**: Next.js App Router with file-based routing
- **Component Structure**:
  - `app/` - Pages and route handlers
  - `components/ui/` - Reusable UI components (AgentCard, dialogs, buttons)
  - `components/business/` - Business logic components (Header)
  - `lib/types/` - Zod schemas and type definitions
  - `lib/providers/` - Context providers (MSW, Query)
  - `msw/` - Mock Service Worker handlers and mock data
- **Data Fetching**: Server Components + TanStack Query for client-side data
- **Type Safety**: Zod schemas with `.infer<>` for TypeScript types
- **Styling Pattern**: Utility-first with Tailwind + CVA for component variants
- **Component Pattern**: Functional components with hooks

#### Backend Architecture
- **NestJS Modules**: Modular architecture with controllers, services, and modules
- **API Design**: RESTful endpoints
- **Testing**: Unit tests (*.spec.ts) + e2e tests

#### Monorepo Pattern
- **Shared Packages**: Independently versioned with Changesets
- **Task Pipeline**: Turbo orchestrates build, lint, test tasks with dependency graph
- **Publishing**: GitHub Actions workflow for npm registry publishing

### Testing Strategy
- **Frontend**: MSW for API mocking in development and testing
- **Backend**: Jest for unit tests, Supertest for e2e API tests
- **Test Location**: 
  - Backend: `*.spec.ts` files alongside source, `test/` for e2e
  - Coverage: Configured in Jest config
- **Mock Data**: Centralized in `msw/mockData/` directory

### Git Workflow
- **Commit Convention**: Conventional Commits (enforced by Commitlint)
- **Pre-commit**: Lint-staged runs Biome formatting on staged files
- **Hooks**: Managed by Husky
- **Versioning**: Changesets for semantic versioning
- **Branches**: (Not explicitly documented - standard Git flow assumed)

## Domain Context

### Agent Marketplace
- **Agents**: AI entities with profiles including name, description, avatar, pricing, ratings, completion stats, response time, tags, and online status
- **Pricing Model**: Agents have per-task pricing
- **Discovery**: Search, filter by tags, view ratings and performance metrics
- **Status Tracking**: Real-time online/offline status

### Task System
- **Buyers**: Create tasks and hire agents
- **Sellers**: Complete tasks and receive payment
- **Task Lifecycle**: Creation → Assignment → Completion → Payment

### DAO Arbitration
- **Purpose**: Decentralized dispute resolution for buyer-seller conflicts
- **Cases**: Disputes include task details, parties' addresses, amount in question, reason, evidence
- **Voting**: DAO members vote with weighted voting power
- **Status**: Active cases (ongoing voting) vs solved cases
- **Deadlines**: Time-bound voting periods
- **Members**: Have voting power and avatars (likely NFT-based identity)

### Wallet Integration
- **Blockchain**: Platform uses wallet addresses for identity and transactions
- **Payments**: Likely cryptocurrency-based payments between buyers/sellers

## Important Constraints
- **TypeScript Strict Mode**: Type safety is enforced
- **Biome Rules**: Specific linting rules must be followed (e.g., no var, use const, no CommonJS)
- **Monorepo**: Changes may affect multiple packages - consider cross-package impacts
- **React 19**: Using latest React with concurrent features
- **Package Manager**: Must use pnpm (not npm or yarn)
- **Private Packages**: Both apps are private and restricted access

## External Dependencies

### Production Dependencies
- **UI Frameworks**: Radix UI for accessible primitives
- **State Management**: Zustand, TanStack Query, RxJS
- **Validation**: Zod for schema validation
- **Styling**: TailwindCSS + class-variance-authority for variants
- **Animation**: Framer Motion, tailwindcss-animate
- **Backend**: NestJS platform, Express

### Development Dependencies
- **Build Tools**: Turbo, Next.js compiler
- **Code Quality**: Biome, Commitlint, Husky
- **Testing**: Jest, Supertest, MSW
- **Type Checking**: TypeScript, various @types packages

### External Services
- **Blockchain Network**: (Specific network not documented - likely Ethereum or compatible chain)
- **Private NPM Registry**: Optional for internal package publishing
- **GitHub Actions**: CI/CD for automated publishing

### Future/Potential Integrations
- **Smart Contracts**: For DAO voting and payment escrow
- **IPFS**: For evidence storage in arbitration cases
- **Wallet Providers**: Web3 wallet integration (MetaMask, WalletConnect, etc.)
