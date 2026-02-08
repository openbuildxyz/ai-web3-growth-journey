# Research Summary: MCP Agent Skills Implementation

## Overview
This document summarizes the research conducted to implement the MCP Agent Skills feature, which involves converting the existing MCP adapter functionality into a set of Agent Skills that conform to the agentskills standard.

## Key Findings

### 1. Current MCP Adapter Implementation
The existing MCP adapter in `apps\CangjieMagic\src\examples\uctoo_api_mcp_server` provides:
- Natural language processing to convert user requests to backend API calls
- HTTP client functionality to communicate with the uctoo-backend server
- Authentication token management for session persistence
- API mapping logic to determine endpoints and methods based on intent

### 2. Agent Skills Architecture
Based on the examples in `apps\CangjieMagic\src\examples\skill_examples`, the skills architecture includes:
- `AbsSkill`: Abstract base class that implements the Skill interface
- `BaseSkill`: Concrete base class extending AbsSkill
- `SkillToToolAdapter`: Adapter pattern to make skills compatible with the existing Tool interface
- Skills follow the agentskills standard specification

### 3. Backend API Generation
The `apps\backend\src\app\helpers\batchCreateModuleFromDb.ts` script generates standard CRUD API endpoints deterministically from database schemas. This includes:
- GET /api/{db}/{table}/:limit/:page/:skip for retrieving records
- POST /api/{db}/{table}/add for creating records
- POST /api/{db}/{table}/edit for updating records
- POST /api/{db}/{table}/del for deleting records

### 4. API Design Standards
According to `apps\backend\docs\uctooAPI设计规范.md`, the API follows RESTful principles with:
- JWT-based authentication
- Standard CRUD operations
- Query parameters for filtering and sorting
- Consistent error handling

## Implementation Strategy

### Phase 1: Standard API Skills Generation
1. Develop a deterministic algorithm to generate Agent Skills for standard CRUD operations
2. Use the same logic as `batchCreateModuleFromDb.ts` to identify database tables and their fields
3. Create skills for each table with appropriate parameters based on the schema
4. Implement proper error handling and validation

### Phase 2: Non-Standard API Skills Generation
1. Analyze the routes in `apps\backend\src\app\routes` to identify non-standard API endpoints
2. Create specific skills for these endpoints based on their unique parameters and functionality
3. Ensure these skills integrate seamlessly with the standard API skills

### Phase 3: Natural Language Processing
1. Adapt the existing natural language processing logic from the MCP adapter
2. Map natural language intents to the appropriate skills
3. Implement parameter extraction and validation

### Phase 4: Authentication and Session Management
1. Implement token storage and retrieval for session persistence
2. Ensure skills can access authentication tokens when needed
3. Handle authentication failures gracefully

## Technical Decisions

### Decision: Use Template-Based Skill Generation
**Rationale**: Following the same approach as the backend's code generation, we'll use templates to generate skills for standard APIs. This ensures consistency and reduces manual effort.

**Alternatives considered**:
- Manual creation of each skill: Would be time-consuming and error-prone
- Runtime generation: Would add complexity and potential runtime errors

### Decision: Maintain Compatibility with Existing Tool System
**Rationale**: Using the `SkillToToolAdapter` allows the new skills to work with existing agents that expect tools, ensuring backward compatibility.

**Alternatives considered**:
- Replacing the entire tool system: Would require extensive refactoring
- Separate skill execution system: Would fragment the ecosystem

### Decision: Two-Phase Generation Approach
**Rationale**: Separating standard and non-standard APIs allows us to use the deterministic algorithm for standard APIs while handling custom endpoints individually.

**Alternatives considered**:
- Single unified approach: Would complicate the generation logic
- Manual implementation of all APIs: Would be inefficient and inconsistent