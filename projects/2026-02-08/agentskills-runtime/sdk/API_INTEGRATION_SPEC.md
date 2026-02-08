# CangjieMagic Agent Skill Runtime - Multi-Language SDK Integration

## Overview

The CangjieMagic Agent Skill Runtime provides a Standard API Interface Layer that enables lightweight wrappers for various tech stacks. This interface layer enables automatic generation of language-specific wrappers using OpenAPI/Swagger specifications, allowing for seamless integration across multiple programming language ecosystems.

## Standard API Interface Layer

The agent skill runtime provides a standard RESTful API interface layer that follows the UCToo API design specification. This interface layer enables lightweight wrappers for various tech stacks including:

- **Cangjie**: Native integration via direct API calls
- **TypeScript/JavaScript**: Via npm packages
- **ArkTS**: Via ArkUI component integration
- **Java**: Via Maven packages
- **PHP**: Via Composer packages
- **Python**: Via pip packages
- **C#**: Via NuGet packages
- **Go**: Via Go modules
- **Rust**: Via Cargo crates

## API Design Principles

1. **RESTful Architecture**: Following UCToo's API design specification with CRUD operations mapped to standard HTTP methods
2. **JWT-Based Authentication**: All authenticated endpoints require JWT tokens following UCToo's security model
3. **Pagination Support**: Following UCToo's pagination pattern with `limit`, `page`, and `skip` parameters
4. **Filtering and Sorting**: Support for Prisma-style filtering and sorting via query parameters
5. **Error Handling**: Consistent error response format following UCToo's `errno`/`errmsg` pattern

## Multi-Language Ecosystem Integration

The standard interface layer enables automatic generation of language-specific wrappers using OpenAPI/Swagger specifications. This allows for:

- **TypeScript/JavaScript**: Generation of strongly-typed API clients with axios/fetch integration
- **ArkTS**: Integration with HarmonyOS applications via appropriate HTTP clients
- **Java**: Generation of Spring-based REST clients
- **Python**: Generation of requests-based API clients
- **PHP**: Generation of Guzzle-based API clients
- **C#**: Generation of HttpClient-based API clients
- **Go**: Generation of native HTTP clients
- **Rust**: Generation of reqwest-based API clients

Each language ecosystem can distribute the agent skill runtime wrapper as a standard package:

- **npm**: For Node.js/TypeScript ecosystems
- **ohpm**: For HarmonyOS ArkTS ecosystems
- **Composer**: For PHP ecosystems
- **pip**: For Python ecosystems
- **Maven**: For Java ecosystems
- **NuGet**: For C# ecosystems
- **Go modules**: For Go ecosystems
- **Cargo**: For Rust ecosystems

## SDK Command-Line Interface Standard

All language ecosystem SDKs support the same command-line interface standard as the core agent skill runtime. This ensures consistency across all ecosystems:

### Install Command
```bash
# Language-specific prefix + standard command
npm skill install --path path/to/skill
pip skill install --git https://github.com/user/skill.git
mvn skill install --git https://github.com/user/skill.git --branch develop
```

### Run Command
```bash
# Execute a skill tool
npm skill run skill-name:tool-name arg1=value1 arg2=value2
pip skill run skill-name:tool-name arg1=value1
```

### List Command
```bash
# List installed skills
npm skill list
pip skill list
```

### Search Command
```bash
# Search for skills using semantic search
npm skill search "query"
pip skill search "query"
```

## API Endpoints

### Skill Management
- `GET /skills` - List all installed skills
- `POST /skills/install` - Install a skill from local path or Git repository
- `DELETE /skills/{skillName}` - Uninstall a skill
- `GET /skills/search?q={query}` - Search for skills using semantic search

### Tool Execution
- `POST /skills/{skillName}/tools/{toolName}/run` - Execute a specific tool from a skill
- `GET /skills/{skillName}/tools` - List all tools in a skill

### Configuration
- `POST /skills/{skillName}/config` - Set configuration for a skill
- `GET /skills/{skillName}/config` - Get configuration for a skill

## Authentication

All API endpoints require JWT-based authentication following UCToo's security model. Clients must include an Authorization header:

```
Authorization: Bearer {jwt_token}
```

## Error Response Format

All API endpoints follow UCToo's consistent error response format:

```json
{
  "errno": 400,
  "errmsg": "Error message describing the issue",
  "details": {
    // Optional additional error details
  }
}
```

## Integration with UCToo Backend Framework

The API is designed to integrate seamlessly with the UCToo backend framework, allowing skills to be managed and executed within the UCToo ecosystem. This enables:

- Centralized skill management
- Unified authentication and authorization
- Consistent data models
- Shared infrastructure resources

## Integration with UCToo Admin Management Platform

The agent skill runtime is designed to integrate seamlessly with the UCToo Admin management platform, which is built with Vue 3, Ant Design Vue, and follows the UMI full-stack model isomorphism specification. This integration enables:

- **Skill Management Dashboard**: Complete GUI for managing skills with listing, installation, execution, and monitoring capabilities
- **Component-Based Architecture**: Reusable skill management components following Ant Design Vue patterns
- **Consistent Data Models**: Following UMI full-stack model isomorphism for consistent data models between frontend and backend
- **Unified Authentication**: Using JWT-based authentication consistent with the rest of the UCToo ecosystem
- **Real-Time Monitoring**: Live monitoring of skill executions and performance metrics
- **Easy Deployment**: Integration with the existing UCToo Admin platform for centralized management