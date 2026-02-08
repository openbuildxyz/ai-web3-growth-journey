# API Contracts: MCP Agent Skills Implementation

## Overview
This document defines the API contracts for the MCP Agent Skills implementation, specifying the interfaces between the skills and the uctoo-backend server. The implementation follows the agentskills standard for skill definition and execution.

## Standard CRUD API Contracts

### 1. Get Entity Skill
**Skill Name**: `get-entity-skill`
**Description**: Retrieves one or more entities from the backend based on parameters.

**Input Parameters**:
- `table_name` (required): Name of the database table to query
- `id` (optional): Specific entity ID to retrieve
- `limit` (optional): Number of records to retrieve (default: 10)
- `page` (optional): Page number for pagination (default: 0)
- `skip` (optional): Number of records to skip
- `filter` (optional): JSON string with query filters
- `sort` (optional): Sort parameters

**Output**:
- Success: JSON array of entity objects or single entity object
- Error: Error message string

**Example Usage**:
```
{
  "table_name": "entity",
  "id": "123",
  "limit": "10",
  "page": "0"
}
```

### 2. Create Entity Skill
**Skill Name**: `create-entity-skill`
**Description**: Creates a new entity in the backend.

**Input Parameters**:
- `table_name` (required): Name of the database table to insert into
- `entity_data` (required): JSON object containing the entity data to create

**Output**:
- Success: Created entity object with assigned ID
- Error: Error message string

**Example Usage**:
```
{
  "table_name": "entity",
  "entity_data": {
    "name": "New Entity",
    "description": "An example entity"
  }
}
```

### 3. Update Entity Skill
**Skill Name**: `update-entity-skill`
**Description**: Updates an existing entity in the backend.

**Input Parameters**:
- `table_name` (required): Name of the database table to update
- `id` (required): ID of the entity to update
- `entity_data` (required): JSON object containing the fields to update

**Output**:
- Success: Updated entity object
- Error: Error message string

**Example Usage**:
```
{
  "table_name": "entity",
  "id": "123",
  "entity_data": {
    "name": "Updated Entity Name"
  }
}
```

### 4. Delete Entity Skill
**Skill Name**: `delete-entity-skill`
**Description**: Deletes an entity from the backend.

**Input Parameters**:
- `table_name` (required): Name of the database table to delete from
- `id` (required): ID of the entity to delete
- `force` (optional): Boolean indicating whether to perform hard delete (default: false for soft delete)

**Output**:
- Success: Success confirmation message
- Error: Error message string

**Example Usage**:
```
{
  "table_name": "entity",
  "id": "123",
  "force": false
}
```

## Authentication API Contracts

### 5. Login Skill
**Skill Name**: `login-skill`
**Description**: Authenticates a user and returns an access token.

**Input Parameters**:
- `username` (required): Username or account identifier
- `password` (required): Password for the account

**Output**:
- Success: JSON object containing user information and access token
- Error: Error message string

**Example Usage**:
```
{
  "username": "demo",
  "password": "123456"
}
```

### 6. Token Validation Skill
**Skill Name**: `validate-token-skill`
**Description**: Validates an existing authentication token.

**Input Parameters**:
- `token` (required): Authentication token to validate

**Output**:
- Success: Validation result with user information
- Error: Error message string

## Non-Standard API Contracts

### 7. Custom API Skill
**Skill Name**: `custom-api-skill`
**Description**: Executes a custom API endpoint that doesn't fit the standard CRUD pattern.

**Input Parameters**:
- `endpoint` (required): Full API endpoint path
- `method` (required): HTTP method (GET, POST, PUT, DELETE)
- `params` (optional): Parameters to send with the request
- `body` (optional): Request body for POST/PUT requests

**Output**:
- Success: Response from the custom API endpoint
- Error: Error message string

## AgentSkills Standard API Contracts

### 8. SKILL.md Loader Service
**Interface**: `SkillMdLoaderService`
**Description**: Service for loading and parsing skills from SKILL.md files according to the agentskills specification.

**Methods**:
- `loadSkillFromPath(path: String): Option<SkillManifest>`
- `validateSkillManifest(manifest: SkillManifest): (Bool, Array<String>)`
- `loadExternalResources(skillPath: String): SkillResourceLoader`

### 9. Skill Validator Service
**Interface**: `SkillValidatorService`
**Description**: Service for validating skills against the agentskills specification.

**Methods**:
- `validateSkillName(name: String): Bool`
- `validateSkillDescription(description: String): Bool`
- `validateSkillContent(content: String): (Bool, Array<String>)`
- `validateSkillParameters(parameters: Array<SkillParameter>): (Bool, Array<String>)`

## Internal Service Contracts

### 10. HTTP Client Service
**Interface**: `HttpClientService`
**Description**: Internal service for making HTTP requests to the backend.

**Methods**:
- `sendRequest(endpoint: String, method: String, headers: HashMap<String, String>, body: String): ApiResponse`

### 11. Token Management Service
**Interface**: `TokenManagementService`
**Description**: Internal service for managing authentication tokens.

**Methods**:
- `storeToken(token: String): Unit`
- `getToken(): Option<String>`
- `clearToken(): Unit`
- `isTokenValid(token: String): Bool`

## Error Handling Contracts

### Standard Error Format
All skills return errors in the following format:
```
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes
- `AUTH_ERROR`: Authentication failed
- `VALIDATION_ERROR`: Input validation failed
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `PERMISSION_DENIED`: Insufficient permissions for the operation
- `INTERNAL_ERROR`: Internal server error
- `CONNECTION_ERROR`: Network connection error
- `SKILL_FORMAT_ERROR`: SKILL.md file does not conform to specification
- `RESOURCE_LOAD_ERROR`: Failed to load external resources for the skill