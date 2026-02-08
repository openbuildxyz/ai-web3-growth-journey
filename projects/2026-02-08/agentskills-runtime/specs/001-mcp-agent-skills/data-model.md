# Data Model: MCP Agent Skills Implementation

## Overview
This document describes the key data models required for implementing the MCP Agent Skills that convert natural language requests to uctoo-backend API calls.

## Core Models

### 1. UctooSkill (Base Class)
**Description**: Base class for all uctoo-related skills that extends the BaseSkill class and complies with the agentskills standard.

**Fields**:
- `name: String` - Unique identifier for the skill (1-64 chars, lowercase, hyphens only, no leading/trailing hyphens)
- `description: String` - Human-readable description of the skill's functionality (1-1024 chars)
- `license: Option<String>` - License information for the skill
- `compatibility: Option<String>` - Compatibility information (max 500 chars)
- `metadata: HashMap<String, String>` - Additional metadata about the skill
- `allowedTools: Option<String>` - List of tools the skill is allowed to use
- `instructions: String` - Instructions for how the skill should operate (from SKILL.md body)
- `skillPath: String` - Path to the skill's definition
- `parameters: Array<SkillParameter>` - Definition of parameters the skill accepts
- `scriptsDir: Option<String>` - Path to scripts directory if available
- `referencesDir: Option<String>` - Path to references directory if available
- `assetsDir: Option<String>` - Path to assets directory if available

### 2. ApiRequest
**Description**: Represents a request to be sent to the uctoo-backend API.

**Fields**:
- `endpoint: String` - The API endpoint to call (e.g., "/api/uctoo/entity/10/0")
- `method: String` - HTTP method (GET, POST, PUT, DELETE)
- `headers: HashMap<String, String>` - HTTP headers for the request
- `queryParams: HashMap<String, String>` - Query parameters for GET requests
- `body: String` - Request body for POST/PUT requests
- `authToken: Option<String>` - Authentication token if required

### 3. ApiResponse
**Description**: Represents a response from the uctoo-backend API.

**Fields**:
- `id: String` - Unique identifier for the response
- `status: Int32` - HTTP status code
- `data: HashMap<String, Any>` - Response data from the API
- `timestamp: Int64` - Timestamp of the response
- `requestId: String` - ID of the original request

### 4. SkillParameters
**Description**: Encapsulates parameters passed to skills from natural language processing.

**Fields**:
- `intent: String` - Detected intent from natural language (GET_RESOURCE, CREATE_RESOURCE, etc.)
- `queryText: String` - Original natural language query
- `parameters: HashMap<String, Any>` - Extracted parameters from the query
- `userId: Option<String>` - Optional user ID for authenticated requests

### 5. ApiMapping
**Description**: Defines how natural language intents map to specific API endpoints.

**Fields**:
- `mappingId: String` - Unique identifier for the mapping
- `intent: String` - Natural language intent
- `backendEndpoint: String` - Corresponding backend API endpoint
- `httpMethod: String` - HTTP method to use
- `parameterMappings: HashMap<String, String>` - Mappings between natural language params and API params
- `requiredAuth: Bool` - Whether authentication is required

### 6. TokenManager
**Description**: Manages authentication tokens for API calls.

**Fields**:
- `authTokens: HashMap<String, String>` - Storage for authentication tokens
- `tokenExpiry: HashMap<String, Int64>` - Expiration timestamps for tokens

### 7. SkillManifest
**Description**: Represents the parsed content of a SKILL.md file according to the agentskills specification.

**Fields**:
- `name: String` - Unique identifier for the skill (from YAML frontmatter)
- `description: String` - Description of the skill (from YAML frontmatter)
- `license: Option<String>` - License information (from YAML frontmatter)
- `compatibility: Option<String>` - Compatibility requirements (from YAML frontmatter)
- `metadata: HashMap<String, String>` - Additional metadata (from YAML frontmatter)
- `allowedTools: Option<String>` - Pre-approved tools list (from YAML frontmatter)
- `instructions: String` - Skill instructions and guidelines (from markdown body)
- `skillPath: String` - Path to the skill directory
- `scriptsDirExists: Bool` - Whether scripts/ directory exists
- `referencesDirExists: Bool` - Whether references/ directory exists
- `assetsDirExists: Bool` - Whether assets/ directory exists

### 8. SkillParameter
**Description**: Defines a parameter that a skill accepts.

**Fields**:
- `name: String` - Name of the parameter
- `type: String` - Data type of the parameter
- `description: String` - Description of what the parameter does
- `required: Bool` - Whether the parameter is required
- `defaultValue: Option<String>` - Default value if parameter is not provided

### 9. SkillResourceLoader
**Description**: Handles loading of external resources for skills (scripts, references, assets).

**Fields**:
- `skillPath: String` - Base path of the skill
- `scriptsPath: Option<String>` - Path to scripts directory
- `referencesPath: Option<String>` - Path to references directory
- `assetsPath: Option<String>` - Path to assets directory
- `loadedScripts: HashMap<String, String>` - Cached scripts content
- `loadedReferences: HashMap<String, String>` - Cached references content
- `loadedAssets: HashMap<String, String>` - Cached assets content

## Relationships

```
UctooSkill 1 -- * ApiRequest : executes
ApiRequest 1 -- 1 ApiResponse : produces
SkillParameters 1 -- 1 ApiRequest : configures
ApiMapping 1 -- * ApiRequest : defines
TokenManager 1 -- * ApiRequest : provides authentication
```

## State Transitions

### ApiRequest State Model
- `CREATED` → `SENDING`: When the request is prepared and about to be sent
- `SENDING` → `SENT`: When the request has been sent to the backend
- `SENT` → `RESPONSE_RECEIVED`: When a response is received from the backend
- `SENT` → `ERROR`: When an error occurs during transmission

### Skill Execution State Model
- `INITIALIZED` → `PROCESSING`: When the skill receives a request
- `PROCESSING` → `COMPLETED`: When the skill successfully completes
- `PROCESSING` → `FAILED`: When the skill encounters an error
- `FAILED` → `RETRYING`: When the skill attempts to retry after failure (optional)

## Validation Rules

1. **ApiRequest Validation**:
   - `endpoint` must be a valid API endpoint path
   - `method` must be one of: GET, POST, PUT, DELETE
   - If `method` is POST or PUT, `body` must not be empty
   - If `requiredAuth` is true, `authToken` must be present

2. **ApiResponse Validation**:
   - `status` must be a valid HTTP status code (100-599)
   - `data` must be properly structured according to the API specification

3. **SkillParameters Validation**:
   - `intent` must be one of the recognized intents (GET_RESOURCE, CREATE_RESOURCE, etc.)
   - `queryText` must not be empty

4. **ApiMapping Validation**:
   - `mappingId` must be unique
   - `backendEndpoint` must correspond to an actual backend API
   - `httpMethod` must be appropriate for the intent