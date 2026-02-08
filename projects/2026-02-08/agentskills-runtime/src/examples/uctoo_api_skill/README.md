# UCToo API Agent Skills

## Overview
This project implements Agent Skills that convert natural language requests to uctoo-backend server API calls. The skills follow the agentskills standard specification and allow AI assistants to interact with uctoo-backend services using natural language.

## Documentation
- [English Version](README.md)
- [简体中文版](README_zh_CN.md)

The implementation uses the CangjieMagic framework's skill system to create interoperable agent skills that bridge natural language queries and backend API functionality.

## Architecture
The system consists of the following main components:

### 1. UctooAPISkill (src/uctoo_api_skill.cj)
- Core skill that processes natural language requests
- Maps natural language to appropriate backend API calls
- Handles authentication and session management
- Returns structured responses

### 2. Natural Language Processor (src/natural_language_processor.cj)
- Parses natural language requests from AI assistants
- Uses keyword-based scoring to identify user intent
- Extracts parameters from natural language using pattern matching
- Handles ambiguous queries with suggestion mechanisms

### 3. API Mapper (src/api_mapper.cj)
- Maps natural language intents to specific API endpoints
- Handles parameter transformation between natural language and API formats
- Manages API endpoint configurations and metadata

### 4. Authentication Manager (src/auth_manager.cj)
- Handles authentication token management
- Maintains session state between API calls
- Provides secure credential handling

### 5. Configuration (src/config.cj)
- Manages system configuration through environment variables

## Key Features

### Natural Language Processing
- Intent recognition based on keywords and patterns with scoring algorithm
- Parameter extraction from natural language queries using regex patterns
- Support for common entity types (users, products, orders)
- Handling of ambiguous requests with suggestion mechanisms
- Context-aware processing

### API Integration
- Seamless integration with uctoo-backend server APIs
- Support for standard CRUD operations
- Authentication and session management
- Error handling and response formatting

### Agentskills Standard Compliance
- Full compliance with agentskills standard specification
- Support for YAML frontmatter in SKILL.md files
- Support for skill metadata and validation
- External resource access support (scripts/, references/, assets/)

### Error Handling
- Comprehensive error handling for all system components
- Detailed error messages for debugging
- Graceful handling of API failures and network problems

## Skills

The implementation exposes the following agent skills:

### UctooAPISkill
- Processes natural language queries and converts them to backend API calls
- Returns structured API responses based on intent and parameters

## Configuration
System can be configured via environment variables:
- `BACKEND_URL` - Backend URL for uctoo-backend server (default: http://localhost:3000)
- `DEFAULT_TIMEOUT` - Request timeout in milliseconds (default: 10000)
- `LOG_LEVEL` - Logging level (default: INFO)

## Usage Examples

### Natural Language Queries
- "Get all users" → Processes as GET request for users
- "Find user with ID 123" → Processes as GET request with ID parameter
- "Create a new user named John" → Processes as POST request with name parameter
- "Update user 456 with email john@example.com" → Processes as PUT request with ID and email parameters

## Development

### Project Structure
```
apps/CangjieMagic/src/examples/uctoo_api_skill/
├── src/
│   ├── main.cj                          # Main entry point and agent definition
│   ├── uctoo_api_skill.cj               # Core API skill implementation
│   ├── natural_language_processor.cj    # NLP processing
│   ├── api_mapper.cj                    # API mapping and conversion
│   ├── auth_manager.cj                  # Authentication management
│   ├── config.cj                        # Configuration management
│   ├── utils.cj                         # Utility functions
│   ├── error_handler.cj                 # Error handling
│   ├── models/                          # Data models
│   │   ├── api_request.cj               # API request model
│   │   └── api_response.cj              # API response model
│   └── skills/                          # Additional skill implementations
│       └── ...
├── resources/
│   └── api_definitions.json             # API definitions for mapping (planned)
├── tests/
│   ├── unit/                            # Unit tests (planned)
│   ├── integration/                     # Integration tests (planned)
│   └── contract/                        # Contract tests (planned)
└── SKILL.md                             # Standard skill definition file
```

### Agent Implementation

The system implements an AI Agent using Magic Framework's @agent annotation:

```cangjie
@agent[
  model: "deepseek:deepseek-chat",
  description: "MCP adapter for UCToo backend, supporting natural language queries",
  tools: [processNaturalLanguageRequest, getMcpServiceById, listApiMappings]
]
class UctooMCPAdapterAgent {
  @prompt("You are an MCP adapter that can convert natural language requests to API calls for the uctoo-backend server. According to the user's natural language description, call the appropriate backend service and return the result.")
}
```

### Key Implementation Details

#### Natural Language Processing
The system adopts a keyword-based intent determination algorithm with scoring to identify user intent from natural language queries. Multiple keywords are associated with different intents (GET_RESOURCE, CREATE_RESOURCE, UPDATE_RESOURCE, DELETE_RESOURCE, etc.) and a scoring system determines the most likely intent.

Parameter extraction uses regex patterns to identify common entities such as ID, name, email, and phone number.

#### API Mapping
The system includes an automatic API mapping generator that creates MCP adapters for:
- Standard CRUD operations based on database schema (deterministic algorithm)
- Non-standard APIs via algorithmic traversal

Mappings include natural language patterns and translation rules for converting queries to API endpoints.

## Program Flow

The current version of the system follows these correct program flows:

### 1. Client (uctoo_api_mcp_client) Flow
1. **Client startup**: Run `cjpm run --name magic.examples.uctoo_api_mcp_client`
2. **Send requests**:
   - Send "call hello interface" request
   - Send "login with account demo and password 123456" request
   - Send "get entity with ID 3a5a079d-38b2-4ea2-b8cd-f3c0d93dacfb" request
3. **Receive responses**:
   - Hello interface call successful, returns "Hello World"
   - Login request successful, returns user information and access token
   - Get entity request returns "not found" information

### 2. Server (uctoo_api_mcp_server) Flow
1. **Receive MCP protocol requests**: Receive client requests through MCP protocol
2. **Request distribution processing**:
   - For hello interface requests: Directly return "Hello World"
   - For login requests: Process through AI agent (UctooMCPAdapterAgent)
   - For entity requests: Process through AI agent
3. **Detailed login processing flow**:
   - AI agent identifies login intent
   - Calls `processNaturalLanguageRequest` tool
   - `NaturalLanguageProcessor` processes login request
   - Calls `callLoginApiDirectly` method to directly call backend login API
   - Uses `Utils.extractTokenFromResponse` method to parse access_token from JSON response
   - Successfully extracts and stores access_token for subsequent API calls

### 3. Key Technical Implementation
1. **Unified access_token parsing**:
   - All access_token parsing uses the `Utils.extractTokenFromResponse` public method
   - The method first attempts JSON parsing, falls back to regex parsing on failure
   - Successfully parsed tokens are stored in `UctooMCPAdapter` for subsequent API calls
2. **Logging system refactoring**:
   - All `Utils.logMessage` calls now write to log files
   - Consistent with `logToFile` function in `main.cj` for logging approach
   - Provides complete debugging information tracking

### 4. Problem Resolution
**Previous program flow anomaly reason**:
- Old version's log system had JSON parsing error bugs
- `Utils.logMessage` method only output to console, unable to record debugging information
- Made it difficult to trace and debug JSON parsing problems

**Repair effect**:
- All logs now written to files, facilitating debugging
- JSON parsing function works properly, able to correctly extract access_token from login response
- Login flow completes successfully, returning complete user information and access token
- Entire MCP adapter flow works as expected

## Deployment
The adapter can be deployed using standard Cangjie deployment practices:
1. Configure environment variables for backend service URLs and other settings
2. Build project using `cjpm build`
3. Run compiled binary
4. Monitor logs for operational status

System is designed to work with Magic Framework's MCP server infrastructure and can be integrated with AI assistants supporting the Model Context Protocol.

## 🧰 How to Run

1. Deploy https://gitee.com/UCT/uctoo-backend development framework server-side application

2. **Configure API Key**: In the `main.cj` file of the uctoo_api_mcp_client project, replace `<your api key>` with your DeepSeek API Key. Modify config.cj configuration parameters to match the deployment parameters of uctoo_backend from step 1.
   ```cangjie
   Config.env["DEEPSEEK_API_KEY"] = "sk-xxxxxxxxxx";
   ```

You need to open two terminal windows:

3. **Start server**: In first terminal, in CangjieMagic directory, run following command to start MCP service.
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_server
   ```

   **Why run uctoo_api_mcp_server service**:

   The `uctoo_api_skill` project is a skill implementation based on the Agent Skills standard. It works together with the `uctoo_api_mcp_server` project to form a complete MCP (Model Context Protocol) adapter function. Although the `uctoo_api_skill` project focuses on the skill implementation that converts natural language requests to backend API calls, it still requires an MCP server to handle AI assistant client connections and communications.

   The `uctoo_api_mcp_server` project provides the following key functions:
   - MCP protocol service: Handles AI assistant client connections and communication protocols
   - Agent service: Provides tool sets that AI assistants can call
   - Request routing: Forwards AI assistant's natural language requests to appropriate skill processors
   - Response processing: Formats skill execution results and returns to AI assistant

   Therefore, although `uctoo_api_skill` is the core skill implementation, it still requires `uctoo_api_mcp_server` as a communication bridge to enable AI assistants to interact with skills through the MCP protocol.

4. **Start client**: In second terminal, in CangjieMagic directory, run following command to start client and interact with it.
   ```bash
   cjpm run --name magic.examples.uctoo_api_mcp_client
   ```

## Detailed Running Flow

### 1. Initialization Phase

1. **Environment check**: System checks required environment variables such as `BACKEND_URL` and `DEEPSEEK_API_KEY`
2. **Component initialization**: Initializes following core components:
   - `UctooAPISkill`: Main skill processor
   - `NaturalLanguageProcessor`: Natural language processor
   - `ApiMapper`: API mapper
   - `AuthManager`: Authentication manager
3. **Configuration loading**: Loads system configuration from following paths:
   - Configuration file path: `src/config.cj`
   - Loaded configuration items include:
     - `BACKEND_URL`: Backend URL for uctoo-backend server (default: http://localhost:3000)
     - `DEFAULT_TIMEOUT`: Request timeout in milliseconds (default: 10000)
     - `LOG_LEVEL`: Logging level (default: INFO)
     - `API_KEY`: Access key for API calls (if provided)

### 2. Client-Server Interaction Flow

1. **Client startup**: `apps\CangjieMagic\src\examples\uctoo_api_mcp_client` starts, creating `EnhancedUctooMCPTestAgent`
2. **MCP connection establishment**: Client establishes MCP protocol connection with server via `stdioMCP("cjpm run --skip-build --name magic.examples.uctoo_api_mcp_server")` command
3. **Natural language request sending**: Client sends user-input natural language requests (such as "call hello interface", "please login with account demo and password 123456", etc.) to server

### 3. Server-Side Request Processing Flow

1. **Request reception**: `apps\CangjieMagic\src\examples\uctoo_api_mcp_server` receives natural language requests from client
2. **AI processing**: Server-side `UctooMCPAdapterAgent` processes requests using AI model
3. **Tool invocation**: Server calls `processNaturalLanguageRequest` tool function
4. **Skill execution**: Inside `processNaturalLanguageRequest` function, `NaturalLanguageProcessor` calls `UctooAPISkill`'s `execute` method
5. **Intent identification**: `UctooAPISkill`'s `NaturalLanguageProcessor` uses keyword-based scoring algorithm to identify user intent
6. **Parameter extraction**: Extracts parameters from natural language using regex patterns
7. **API mapping**: `ApiMapper` maps natural language intent to specific API endpoint
8. **Authentication check**: `AuthManager` checks authentication status of current session
9. **API call**: Executes corresponding backend API call
10. **Response processing**: Processes API response and returns to client

### 4. Skill Execution Details

`UctooAPISkill` in `apps\CangjieMagic\src\examples\uctoo_api_skill` project is responsible for:
- **Natural language to API mapping**: `NaturalLanguageProcessor` parses natural language requests and identifies user intent
- **API mapping**: `ApiMapper` converts identified intent to specific API endpoints and parameters
- **Authentication management**: `AuthManager` manages authentication tokens and session state
- **Request execution**: Coordinates entire request processing flow

`apps\CangjieMagic\src\examples\uctoo_api_mcp_server` project is responsible for:
- **MCP protocol processing**: Handles communication protocol between client and server
- **AI agent**: Provides AI capability to understand user requests
- **Tool scheduling**: Invokes appropriate tool functions (such as `processNaturalLanguageRequest`)
- **Response formatting**: Formats results into client-friendly responses

**Framework Enhancement Support**:

`apps\CangjieMagic\src\examples\uctoo_api_mcp_server` can call skills from `apps\CangjieMagic\src\examples\uctoo_api_skill` through enhancement support for CangjieMagic framework from `specs\003-agentskills-enhancement` project. This enhancement project implements comprehensive support for agentskills standard, including:

- **SKILL.md file loading**: Framework can now load and parse standard SKILL.md files
- **Skill validation**: Validates skills to ensure compliance with agentskills specification
- **External resource access**: Allows skills to access external resources like scripts/, references/, assets/, etc.
- **Skill execution**: Executes skills through standardized interfaces

Therefore, `processNaturalLanguageRequest` function in `uctoo_api_mcp_server` can call `UctooAPISkill` instance from `uctoo_api_skill`, because framework enhances dynamic loading and execution capability of skills. This enables `uctoo_api_mcp_server` to prioritize natural language processing logic defined in `uctoo_api_skill` instead of using original processing flow in `uctoo_api_mcp_server`, thus achieving modularity and extensibility of skills.

### 5. Authentication Processing Flow

1. **Initial check**: When receiving requests requiring authentication, checks if current session is authenticated
2. **Authentication token extraction**: If user provides authentication info (username/password or API key), extracts and validates
3. **Token storage**: After successful authentication, stores token in `AuthManager` for subsequent requests
4. **Token refresh**: Automatically refreshes token if about to expire

### 6. Error Handling Flow

1. **Input validation**: Validates format and completeness of request parameters
2. **API call errors**: Captures and handles backend API call errors
3. **Authentication errors**: Handles authentication failures and token expiration
4. **Response formatting**: Formats error info into AI assistant-friendly format

### 7. End Phase

1. **Resource cleanup**: Releases occupied resources, such as network connections and cache
2. **Session termination**: Terminates current session and cleans authentication tokens if needed
3. **Log recording**: Records operation logs and performance metrics

### 8. Special Scenario Handling

- **Ambiguous queries**: When natural language request is not clear enough, system uses suggestion mechanism to prompt user for more info
- **Batch operations**: Processes complex requests requiring multiple API calls
- **Concurrent requests**: Manages multiple concurrent API requests, ensuring response order is correct
- **Timeout handling**: Implements timeout control for long-running API calls

These flows ensure that UCToo API Agent Skills can efficiently and reliably process natural language requests and convert them to corresponding backend API calls.

## API Call Initiation Analysis

Based on our analysis of the system architecture and logs, we determined the following about API call initiation:

### API Call Initiation Party

- **`apps\CangjieMagic\src\examples\uctoo_api_mcp_server`** is responsible for initiating actual HTTP requests to the uctoo backend API.
- **`apps\CangjieMagic\src\examples\uctoo_api_skill`** is responsible for converting natural language requests into API call specifications, but does not directly initiate HTTP requests.

### Technical Justification

This architecture is implemented due to the CangjieMagic framework's agentskills enhancement mechanism. The `uctoo_api_mcp_server` accesses skills from `uctoo_api_skill` through enhancement support from the `specs\003-agentskills-enhancement` project. This enhancement project implements comprehensive support for the agentskills standard, including:

- **SKILL.md file loading**: Framework can now load and parse standard SKILL.md files
- **Skill validation**: Validates skills to ensure compliance with agentskills specification
- **External resource access**: Allows skills to access external resources like scripts/, references/, assets/, etc.
- **Skill execution**: Executes skills through standardized interfaces

Therefore, the `processNaturalLanguageRequest` function in `uctoo_api_mcp_server` can call the `UctooAPISkill` instance from `uctoo_api_skill`. The framework enhances dynamic loading and execution capability of skills. This enables `uctoo_api_mcp_server` to prioritize the natural language processing logic defined in `uctoo_api_skill` instead of using the original processing flow in `uctoo_api_mcp_server`, thus achieving modularity and extensibility of skills.

### Responsibility Division

- **`uctoo_api_skill` responsibilities**:
  - Natural language understanding and intent identification
  - Parameter extraction from natural language queries
  - API endpoint mapping based on identified intent
  - Authentication token management
  - Defining how natural language maps to API calls

- **`uctoo_api_mcp_server` responsibilities**:
  - MCP protocol communication with clients
  - Receiving and routing requests to appropriate skills
  - Executing actual HTTP requests to the backend API
  - Processing and formatting API responses for clients
  - Managing authentication sessions

This separation of concerns allows for better modularity: `uctoo_api_skill` focuses on understanding natural language and defining API mappings, while `uctoo_api_mcp_server` handles the actual network communication and protocol management.