# JavaScript SDK Design for CangjieMagic Agent Skill Runtime

## Overview

The JavaScript SDK provides a way for developers to create skills for the CangjieMagic Agent Skill Runtime using JavaScript or TypeScript. The SDK abstracts away the complexity of interacting with the runtime's Standard API Interface Layer and provides a simple, intuitive API for skill development.

## Architecture

```
┌─────────────────────────────────────┐
│         JavaScript Ecosystem        │
├─────────────────────────────────────┤
│        npm skill {command}          │
├─────────────────────────────────────┤
│        SDK Programmatic API         │
│   defineSkill(), getConfig(), etc   │
├─────────────────────────────────────┤
│   Standard API Interface Layer      │
│     (RESTful + JWT Auth)            │
├─────────────────────────────────────┤
│   Agent Skill Runtime Kernel        │
└─────────────────────────────────────┘
```

## Core Components

### 1. Skill Definition API

The SDK provides a `defineSkill()` function that allows developers to define skills with:

- Metadata (name, version, description, author)
- Tools with parameters and handlers
- Optional configuration validation

### 2. Configuration Management

The SDK provides a `getConfig()` function that retrieves configuration from environment variables with the `SKILL_` prefix.

### 3. API Client

The SDK includes a `SkillRuntimeClient` class that handles communication with the agent skill runtime via the Standard API Interface Layer.

### 4. CLI Tool

The SDK includes a CLI tool that supports the standard command format:

- `npm skill install`
- `npm skill run`
- `npm skill list`
- `npm skill search`

## Implementation Details

### Skill Definition

Skills are defined using the `defineSkill()` function:

```typescript
import { defineSkill, getConfig } from '@cangjiemagic/skill-runtime-sdk';

export default defineSkill({
  metadata: {
    name: 'my-skill',
    version: '1.0.0',
    description: 'My awesome skill',
    author: 'Your Name'
  },
  tools: [
    {
      name: 'greet',
      description: 'Greet someone by name',
      parameters: [
        {
          name: 'name',
          paramType: 'string',
          description: 'Name to greet',
          required: true
        }
      ],
      handler: async (args) => {
        return {
          success: true,
          output: `Hello, ${args.name}!`,
          errorMessage: null
        };
      }
    }
  ]
});
```

### API Communication

The SDK communicates with the agent skill runtime via RESTful API calls:

- Base URL is configurable via environment variable
- All requests include JWT authentication
- Consistent error handling following UCToo patterns

### CLI Integration

The CLI tool is registered as a bin entry in package.json and provides the standard command interface:

```json
{
  "bin": {
    "skill": "dist/cli.js"
  }
}
```

This allows users to run commands like `npm skill install` which translates to using the SDK's CLI tool.

## Design Patterns

### Type Safety

The SDK uses TypeScript to provide strong typing for:

- Skill definitions
- Tool parameters
- Configuration objects
- API responses

### Asynchronous Operations

All API operations are asynchronous and return Promises, allowing for non-blocking operations.

### Error Handling

The SDK follows consistent error handling patterns:

- API errors are caught and wrapped in consistent response objects
- Configuration validation returns clear error messages
- Network errors are handled gracefully

## Integration with Standard API Interface Layer

The JavaScript SDK communicates with the agent skill runtime through the Standard API Interface Layer:

1. **RESTful API**: All communication is done via HTTP requests
2. **JWT Authentication**: Requests include Authorization headers
3. **Consistent Data Models**: Request/response formats follow UMI principles
4. **Error Handling**: Errors follow the errno/errmsg pattern

## Package Structure

```
javascript-sdk/
├── package.json          # Package metadata and dependencies
├── README.md            # Documentation and usage examples
├── tsconfig.json        # TypeScript configuration
├── src/
│   ├── index.ts         # Main SDK exports (defineSkill, getConfig, etc)
│   ├── cli.ts           # CLI tool implementation
│   └── client.ts        # API client implementation
├── dist/                # Compiled JavaScript (generated)
│   ├── index.js
│   ├── cli.js
│   └── client.js
└── tests/               # Unit and integration tests
```

## Best Practices

### For SDK Users

1. Use TypeScript for type safety
2. Validate configuration at startup
3. Handle errors gracefully in tool handlers
4. Follow semantic versioning for skills
5. Use the standard CLI format for consistency

### For SDK Developers

1. Maintain backward compatibility
2. Follow UCToo API design principles
3. Provide comprehensive documentation
4. Include extensive test coverage
5. Handle edge cases gracefully

## Future Enhancements

1. Support for additional JavaScript frameworks (React, Vue, etc.)
2. Advanced debugging and profiling tools
3. Integration with popular IDEs
4. Support for streaming responses
5. Enhanced security features (encryption, signing)