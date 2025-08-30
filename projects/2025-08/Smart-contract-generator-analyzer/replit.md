# Overview

This is a Smart Contract Generator application that enables users to create Solidity smart contracts through natural language descriptions. The application leverages AI (Google Gemini) to convert user requirements into optimized, secure smart contract code. It features a React frontend for user interaction, an Express.js backend for API handling, and includes comprehensive contract analysis capabilities including gas optimization suggestions and security issue detection.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a dark theme configuration
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via Hookform resolvers

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API endpoints for contract generation and template management
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database serverless)
- **AI Integration**: Google Gemini AI service for natural language to Solidity code generation
- **Code Analysis**: Custom Solidity analyzer for validation, gas optimization detection, and security issue identification

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon Database serverless connection
- **Schema Design**: Two main entities - contracts and templates with JSONB fields for flexible metadata storage
- **Development Storage**: In-memory storage implementation for development/testing
- **Session Management**: PostgreSQL session store using connect-pg-simple

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session storage
- **API Security**: Request logging and error handling middleware
- **CORS**: Configured for cross-origin requests in development mode

## External Service Integrations
- **AI Service**: Google Gemini AI for contract generation from natural language
- **Database**: Neon Database (PostgreSQL) for production data persistence
- **Development Tools**: Replit integration for development environment
- **Font Services**: Google Fonts for typography (Inter, JetBrains Mono)

## Key Architectural Decisions

### Monorepo Structure
The application uses a monorepo approach with shared types and schemas between frontend and backend, enabling type safety across the full stack while maintaining clear separation of concerns.

### AI-Driven Code Generation
The core value proposition relies on Google Gemini AI to transform natural language descriptions into production-ready Solidity contracts, with built-in analysis for gas optimization and security concerns.

### Template System
Pre-built contract templates (ERC20, NFT, Voting) provide quick-start options while maintaining the flexibility for custom contract generation through natural language input.

### Real-time Analysis
Generated contracts undergo immediate analysis for gas optimization opportunities and security vulnerabilities, providing actionable feedback to users.

### Progressive Enhancement
The UI supports both template-based quick generation and detailed custom contract creation with configurable optimization and security settings.