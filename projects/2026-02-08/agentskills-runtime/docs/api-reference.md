# API Reference for Agent Skill Runtime

## Overview
This document specifies the API contract for the agent skill runtime, defining the endpoints and data structures for interacting with the system. The API follows the UCToo API design specification with RESTful principles and JWT-based authentication.

## Base URL
```
https://api.skill-runtime.uctoo.com/v1
```

## Authentication
All API requests require JWT token in the Authorization header, following UCToo's authentication pattern:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Common Data Structures

### Skill Object
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "version": "string",
  "author": "string",
  "license": "string",
  "format": "wasm_component|skill_md",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "source_path": "string",
  "metadata": {},
  "dependencies": []
}
```

### Skill Dependency Object
```json
{
  "name": "string",
  "version_constraint": "string",
  "optional": "boolean"
}
```

### Execution Request Object
```json
{
  "skill_id": "string",
  "parameters": {},
  "capabilities": [],
  "timeout": "duration"
}
```

### Execution Result Object
```json
{
  "id": "string",
  "success": "boolean",
  "output": "string",
  "error": "string",
  "execution_time": "duration",
  "resources_used": {}
}
```

## Endpoints

### GET /skills
Retrieve a list of installed skills, following UCToo's pagination pattern.

**Request:**
```
GET /skills?limit=10&page=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `limit` (optional): Number of items per page (default: 10, max: 100)
- `page` (optional): Page number for pagination (starting from 0, default: 0)
- `skip` (optional): Number of items to skip (default: 0)
- `sort` (optional): Sort order (e.g., "-created_at,id")
- `filter` (optional): Filter conditions in JSON format

**Response:**
```json
{
  "current_page": 0,
  "total_count": 1,
  "total_page": 1,
  "skills": [
    {
      "id": "hello-world-123",
      "name": "hello-world",
      "description": "A simple skill that greets the user",
      "version": "1.0.0",
      "author": "Example Author",
      "license": "MIT",
      "format": "skill_md",
      "created_at": "2026-01-25T10:00:00Z",
      "updated_at": "2026-01-25T10:00:00Z",
      "source_path": "/skills/hello-world",
      "metadata": {},
      "dependencies": []
    }
  ]
}
```

### GET /skills/:id
Retrieve details of a specific skill.

**Request:**
```
GET /skills/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Path Parameters:**
- `id`: The ID of the skill to retrieve

**Response:**
```json
{
  "id": "hello-world-123",
  "name": "hello-world",
  "description": "A simple skill that greets the user",
  "version": "1.0.0",
  "author": "Example Author",
  "license": "MIT",
  "format": "skill_md",
  "created_at": "2026-01-25T10:00:00Z",
  "updated_at": "2026-01-25T10:00:00Z",
  "source_path": "/skills/hello-world",
  "metadata": {},
  "dependencies": [],
  "tools": [
    {
      "name": "greet",
      "description": "Greet a user by name",
      "parameters": {
        "name": {
          "type": "string",
          "required": true,
          "description": "The name of the person to greet"
        }
      }
    }
  ]
}
```

### POST /skills/add
Install a skill from a local path or remote URL.

**Request:**
```
POST /skills/add
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "source": "./my-skill",
  "validate": true,
  "creator": "user-id"
}
```

**Response:**
```json
{
  "id": "my-skill-abc",
  "name": "my-skill",
  "status": "installed",
  "message": "Skill installed successfully",
  "created_at": "2026-01-25T10:00:00Z"
}
```

### POST /skills/edit
Update an existing skill.

**Request:**
```
POST /skills/edit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "my-skill-abc",
  "description": "Updated description",
  "creator": "user-id"
}
```

**Response:**
```json
{
  "id": "my-skill-abc",
  "name": "my-skill",
  "description": "Updated description",
  "updated_at": "2026-01-25T10:00:00Z"
}
```

### POST /skills/del
Uninstall a skill.

**Request:**
```
POST /skills/del
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "my-skill-abc"
}
```

**Response:**
```json
{
  "desc": "删除成功"
}
```

### POST /skills/execute
Execute a skill with the provided parameters.

**Request:**
```
POST /skills/execute
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "skill_id": "hello-world-123",
  "parameters": {
    "name": "Alice"
  },
  "capabilities": [
    {
      "type": "network_access",
      "resources": ["https://api.example.com"],
      "permissions": ["read"]
    }
  ],
  "timeout": "30s"
}
```

**Response:**
```json
{
  "id": "exec-abc-123",
  "success": true,
  "output": "Hello, Alice!",
  "error": null,
  "execution_time": "123ms",
  "resources_used": {
    "cpu_time": "50ms",
    "memory_peak": 1048576,
    "network_bytes_in": 0,
    "network_bytes_out": 0,
    "file_operations": 0
  }
}
```

### GET /mcp/stream
Start MCP server with HTTP streaming mode and embedded web UI.

**Request:**
```
GET /mcp/stream
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
Streaming response with embedded web UI for MCP server management and skill execution.
```

### POST /skills/search
Search for skills using semantic search with hybrid dense+sparse search and cross-encoder reranking.

**Request:**
```
POST /skills/search
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "manage kubernetes pods",
  "top_k": 5,
  "include_usage_examples": true,
  "rerank": true,
  "query_understanding": true
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "kubernetes-456",
      "name": "kubernetes",
      "description": "Kubernetes cluster management with kubectl",
      "score": 0.95,
      "usage_examples": [
        {
          "tool": "kubectl-get",
          "example": {
            "resource": "pods",
            "namespace": "default"
          }
        }
      ]
    },
    {
      "id": "container-789",
      "name": "container-tools",
      "description": "Container management tools",
      "score": 0.87,
      "usage_examples": [
        {
          "tool": "docker-run",
          "example": {
            "image": "nginx:latest",
            "port": "80:80"
          }
        }
      ]
    }
  ]
}
```

## Error Responses

All error responses follow UCToo's error format:
```json
{
  "errno": "string",
  "errmsg": "string"
}
```

### Common Error Codes
- `40100`: Unauthorized - Invalid or missing JWT token
- `40001`: Validation Error - Request body validation failed
- `40401`: Not Found - Requested skill does not exist
- `50001`: Execution Error - Skill execution failed
- `40301`: Permission Denied - Insufficient permissions for the requested action
- `50000`: Internal Error - Internal server error

## API Design Principles

### 1. Standard Interface Layer
The agent skill runtime provides a standard RESTful API interface layer that supports multiple programming language ecosystems. This interface layer enables lightweight wrappers for various tech stacks including:

- **Cangjie**: Native integration via direct API calls
- **TypeScript/JavaScript**: Via npm packages
- **ArkTS**: Via ArkUI component integration
- **Java**: Via Maven packages
- **PHP**: Via Composer packages
- **Python**: Via pip packages
- **C#**: Via NuGet packages
- **Go**: Via Go modules
- **Rust**: Via Cargo crates

### 2. UMI Full-Stack Model Isomorphism
The API follows the UMI (Universal Model Isomorphism) design principle, ensuring consistent data models across all application layers. This enables:
- Consistent data structures between client and server
- Shared validation logic
- Reduced development overhead
- Improved AI code generation accuracy

### 3. JWT-Based Authentication
Following UCToo's security model, all authenticated endpoints require JWT tokens obtained via login:
```
POST /auth/login
{
  "username": "user",
  "password": "password"
}
```

JWT tokens have a default expiration of 172800 seconds (2 days) and should be included in the Authorization header as `Bearer <token>`.

### 4. Row-Level Permission Control
The API implements row-level permission control following UCToo's security model. Certain operations may be restricted based on user roles and permissions.

## Multi-Language Ecosystem Support

### 1. Standard API Wrapper Generation
The standard interface layer enables automatic generation of language-specific wrappers using OpenAPI/Swagger specifications. This allows for:

- **TypeScript/JavaScript**: Generation of strongly-typed API clients with axios/fetch integration
- **ArkTS**: Integration with HarmonyOS applications via appropriate HTTP clients
- **Java**: Generation of Spring-based REST clients
- **Python**: Generation of requests-based API clients
- **PHP**: Generation of Guzzle-based API clients
- **C#**: Generation of HttpClient-based API clients
- **Go**: Generation of native HTTP clients
- **Rust**: Generation of reqwest-based API clients

### 2. Package Distribution
Each language ecosystem can distribute the agent skill runtime wrapper as a standard package:

- **npm**: For Node.js/TypeScript ecosystems
- **ohpm**: For HarmonyOS ArkTS ecosystems
- **Composer**: For PHP ecosystems
- **pip**: For Python ecosystems
- **Maven**: For Java ecosystems
- **NuGet**: For C# ecosystems
- **Go modules**: For Go ecosystems
- **Cargo**: For Rust ecosystems

### 3. Integration with UCToo Backend Framework
The API is designed to integrate seamlessly with the UCToo backend framework, allowing skills to be managed and executed within the UCToo ecosystem. This enables:

- Centralized skill management
- Unified authentication and authorization
- Consistent data models
- Shared infrastructure resources

## Rate Limiting
API requests are rate-limited to prevent abuse:
- Per user: 1000 requests per minute
- Per IP: 5000 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## Webhook Events
The runtime emits webhook events for certain actions. You can configure webhook endpoints via the API.

### Supported Event Types
- `skill.installed`: Emitted when a skill is installed
- `skill.uninstalled`: Emitted when a skill is uninstalled
- `execution.started`: Emitted when a skill execution begins
- `execution.completed`: Emitted when a skill execution completes
- `execution.failed`: Emitted when a skill execution fails

### Webhook Payload Structure
```json
{
  "id": "event-123",
  "type": "skill.installed",
  "timestamp": "2026-01-25T10:00:00Z",
  "data": {
    // Event-specific data
  }
}
```

## Integration with UCToo Admin Management Platform

The agent skill runtime is designed to integrate seamlessly with the UCToo Admin management platform (located in `apps/uctoo-app-client-pc`), which is built with Vue 3, Ant Design Vue, and follows the UMI full-stack model isomorphism specification. This integration enables:

### 1. Skill Management Dashboard
- **Skill Listing**: View all installed skills with pagination, filtering, and search capabilities
- **Skill Details**: View detailed information about each skill including metadata, dependencies, and tools
- **Installation Interface**: GUI for installing skills from local paths or Git repositories
- **Execution Interface**: Execute skills with parameters through a user-friendly form
- **Monitoring**: Real-time monitoring of skill executions with performance metrics

### 2. API Integration Pattern
The frontend follows the UCToo API integration pattern using:
- Pinia-ORM for state management with axios plugin
- Ant Design Vue components for UI
- Prisma-style filtering and querying
- JWT-based authentication

Example API integration in the frontend:
```typescript
import { useAxiosRepo } from '@pinia-orm/axios';
import { uctoo_entity } from '#/store'; // Assuming skills are treated as entities

// Fetch skills with pagination and filtering
const result = await useAxiosRepo(uctoo_entity).api().getuctooEntityList(
  (pagination.current || 1) - 1,
  pagination.pageSize || 10,
  queryParam
);

// Install a skill
await useAxiosRepo(uctoo_entity).api().adductooEntity({
  source: "./my-skill",
  validate: true,
  creator: "user-id"
});
```

### 3. Component-Based Architecture
The frontend uses a component-based architecture that allows for:
- Reusable skill management components
- Consistent UI/UX across different skill operations
- Easy customization and extension

### 4. Data Model Consistency
The frontend follows the UMI full-stack model isomorphism specification, ensuring:
- Consistent data models between frontend and backend
- Shared validation logic
- Reduced development overhead
- Improved maintainability
```