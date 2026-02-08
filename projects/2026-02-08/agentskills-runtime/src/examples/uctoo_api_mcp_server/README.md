# UCToo MCP Server Adapter

## Overview
This project implements an MCP (Model Context Protocol) Server adapter that converts uctoo-backend server APIs to MCP services for AI assistant clients to use via natural language. The adapter allows AI assistants to call uctoo-backend server APIs using natural language queries.

The implementation uses Magic Framework's @agent and @tool annotations to create an AI agent that can process natural language requests and convert them to appropriate backend API calls. The system simulates API calls and provides structured responses based on natural language processing.

## Architecture
The system consists of the following main components:

### 1. Natural Language Processor ([natural_language_processor.cj](src/natural_language_processor.cj))
- Parses natural language requests from AI assistants
- Identifies user intent from queries using keyword-based scoring
- Extracts parameters from natural language using pattern matching
- Handles ambiguous queries with suggestion mechanisms

### 2. MCP Adapter ([mcp_adapter.cj](src/mcp_adapter.cj))
- Core component that handles API communication
- Converts natural language requests to backend API calls
- Determines appropriate endpoints and HTTP methods based on intent
- Simulates API calls for demonstration purposes

### 3. API Mapper ([api_mapper.cj](src/api_mapper.cj))
- Implements deterministic algorithm for standard API generation from uctoo-backend
- Handles algorithmic traversal for non-standard APIs
- Manages API conversion logic with translation rules
- Generates mappings for standard CRUD operations and non-standard endpoints

### 4. Configuration ([config.cj](src/config.cj))
- Manages system configuration through environment variables
- Configures backend URL, port, connection limits, timeouts, and logging

### 5. Models
- Data models for requests, responses, and API mappings
- Error handling models
- Parameter and translation rule models

## Key Features

### Natural Language Processing
- Intent recognition based on keywords and patterns with scoring algorithm
- Parameter extraction from natural language queries using regex patterns
- Support for common entity types (users, products, orders)
- Handling of ambiguous requests with suggestion mechanisms
- Context-aware processing

### API Conversion
- Automatic mapping of standard CRUD operations
- Support for complex, non-standard backend APIs
- Deterministic API generation based on database schemas
- Translation rules for mapping natural language to API endpoints

### Error Handling
- Comprehensive error handling for all system components
- Detailed error messages for debugging
- Graceful handling of processing exceptions

### Configuration & Performance
- Environment-based configuration management
- Simulated API calls for demonstration
- Structured response formats
- Extensible mapping framework

## Tools

The MCP adapter exposes the following tools that can be used by AI agents:

### processNaturalLanguageRequest
- Processes natural language queries and converts them to structured API calls
- Returns simulated API responses based on intent and parameters

### getMcpServiceById
- Retrieves details of a specific MCP service by ID
- Returns service metadata and configuration

### listApiMappings
- Lists all available API mappings
- Shows mapping IDs, endpoints, and associated patterns

## Configuration
The system can be configured via environment variables:
- `BACKEND_URL` - Backend URL for uctoo-backend server (default: http://localhost:3000)
- `PORT` - Port for MCP server adapter (default: 8080)
- `MAX_CONNECTIONS` - Maximum concurrent connections (default: 100)
- `REQUEST_TIMEOUT` - Request timeout in milliseconds (default: 10000)
- `LOG_LEVEL` - Logging level (default: INFO)

## Usage Examples

### Natural Language Queries
- "Get all users" → Processes as GET_RESOURCE intent for users
- "Find user with ID 123" → Processes as GET_RESOURCE intent with ID parameter
- "Create a new user named John" → Processes as CREATE_RESOURCE intent with name parameter
- "Update user 456 with email john@example.com" → Processes as UPDATE_RESOURCE intent with ID and email parameters

### Tool Usage
```javascript
// Process a natural language request
const result = await processNaturalLanguageRequest("Get all users");

// Get details of an MCP service
const serviceDetails = await getMcpServiceById("mcp-service-users");

// List all API mappings
const mappings = await listApiMappings();
```

## Development

### Project Structure
```
apps/CangjieMagic/src/examples/uctoo_api_mcp_server/
├── src/
│   ├── main.cj                          # Main entry point and agent definition
│   ├── mcp_adapter.cj                   # MCP adapter core logic
│   ├── api_mapper.cj                    # API mapping and conversion
│   ├── natural_language_processor.cj    # NLP processing
│   ├── config.cj                        # Configuration management
│   ├── utils.cj                         # Utility functions
│   ├── mcp_service.cj                   # MCP service model
│   ├── backend_api_mapping.cj           # Backend API mapping model
│   ├── parameter.cj                     # Parameter model
│   ├── translation_rule.cj              # Translation rule model
│   ├── natural_language_request.cj      # Natural language request model
│   ├── api_response.cj                  # API response model
│   └── error_response.cj                # Error response model
├── resources/
│   └── api_definitions.json             # API definitions for mapping (planned)
└── tests/
    ├── unit/                            # Unit tests (planned)
    ├── integration/                     # Integration tests (planned)
    └── contract/                        # Contract tests (planned)
```

### Agent Implementation

The system implements an AI agent using Magic Framework's @agent annotation:

```cangjie
@agent[
  model: "deepseek:deepseek-chat",
  description: "MCP adapter for UCToo backend APIs, supporting natural language queries",
  tools: [processNaturalLanguageRequest, getMcpServiceById, listApiMappings]
]
class UctooMCPAdapterAgent {
  @prompt("You are an MCP adapter that can convert natural language requests to API calls for the uctoo-backend server. Based on the user's natural language description, call the appropriate backend service and return the result.")
}
```

### Key Implementation Details

#### Natural Language Processing
The system employs a keyword-based intent determination algorithm with scoring to identify user intent from natural language queries. Multiple keywords are associated with different intents (GET_RESOURCE, CREATE_RESOURCE, UPDATE_RESOURCE, DELETE_RESOURCE, etc.) and a scoring system determines the most likely intent.

The parameter extraction uses regex patterns to identify common entities like IDs, names, emails, and phone numbers.

#### API Mapping
The system includes an automatic API mapping generator that creates MCP adapters for:
- Standard CRUD operations based on database schemas (deterministic algorithm)
- Non-standard APIs via algorithmic traversal

Mappings include natural language patterns and translation rules for converting queries to API endpoints.

## Program Flow

The current version of the system follows these correct program flows:

### 1. Client (uctoo_api_mcp_client) Flow
1. **Client Startup**: Run `cjpm run --name magic.examples.uctoo_api_mcp_client`
2. **Sending Requests**:
   - Send "call hello interface" request
   - Send "login with account demo and password 123456" request
   - Send "get entity with ID 3a5a079d-38b2-4ea2-b8cd-f3c0d93dacfb" request
3. **Receiving Responses**:
   - Hello interface call successful, returns "Hello World"
   - Login request successful, returns user information and access token
   - Get entity request returns "not found" information

### 2. Server (uctoo_api_mcp_server) Flow
1. **Receive MCP Protocol Requests**: Receive client requests through MCP protocol
2. **Request Distribution Processing**:
   - For hello interface requests: Directly return "Hello World"
   - For login requests: Process through AI agent (UctooMCPAdapterAgent)
   - For entity requests: Process through AI agent
3. **Detailed Login Processing Flow**:
   - AI agent identifies login intent
   - Calls `processNaturalLanguageRequest` tool
   - `NaturalLanguageProcessor` processes login request
   - Calls `callLoginApiDirectly` method to directly call backend login API
   - Uses `Utils.extractTokenFromResponse` method to parse access_token from JSON response
   - Successfully extracts and stores access_token for subsequent API calls

### 3. Key Technical Implementation
1. **Unified access_token Parsing**:
   - All access_token parsing uses the `Utils.extractTokenFromResponse` public method
   - The method first attempts JSON parsing, falling back to regex parsing on failure
   - Successfully parsed tokens are stored in `UctooMCPAdapter` for subsequent API calls
2. **Logging System Refactoring**:
   - All `Utils.logMessage` calls now write to log files
   - Consistent with `logToFile` function in `main.cj` for logging approach
   - Provides complete debugging information tracking

### 4. Issue Resolution
**Reason for previous program flow anomalies**:
- The old version's log system had JSON parsing error bugs
- `Utils.logMessage` method only output to console, unable to record debugging information
- Made it difficult to trace and debug JSON parsing issues

**Effects after repair**:
- All logs are now written to files, facilitating debugging
- JSON parsing function works correctly, able to properly extract access_token from login response
- Login flow completes successfully, returning complete user information and access token
- The entire MCP adapter flow works as expected

## Deployment
The adapter can be deployed with standard Cangjie deployment practices:
1. Configure environment variables for backend service URLs and other settings
2. Build the project using `cjpm build`
3. Run the compiled binary
4. Monitor logs for operation health

The system is designed to work with Magic Framework's MCP server infrastructure and can be integrated with AI assistants that support the Model Context Protocol.

## 🧰 How to Run

1. Deploy the https://gitee.com/UCT/uctoo-backend development framework server-side application

2. **Configure API Key**: In the `main.cj` file of the uctoo_api_mcp_client project, replace `<your api key>` with your DeepSeek API Key. Modify the configuration parameters in config.cj to match the uctoo_backend deployment parameters from step 1.
   ```cangjie
   Config.env["DEEPSEEK_API_KEY"] = "sk-xxxxxxxxxx";
   ```

You need to open two terminal windows:

3. **Start the server**: In the first terminal, in the CangjieMagic directory, run the following command to start the MCP service.
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_server
   ```
4. **Start the client**: In the second terminal, in the CangjieMagic directory, run the following command to start the client and interact with it.
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_client
   ```