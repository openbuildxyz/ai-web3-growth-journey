# JavaScript/TypeScript SDK for Agent Skill Runtime

This directory contains the JavaScript/TypeScript SDK for the CangjieMagic Agent Skill Runtime, allowing developers to create and manage skills using JavaScript/TypeScript.

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

## Usage

### Installation

```bash
npm install @uctoo/skill-runtime
```

### Defining a Skill

```typescript
import { defineSkill, getConfig } from '@cangjiemagic/skill-runtime';

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

### Configuration Management

Skills can access configuration through environment variables prefixed with `SKILL_`:

```typescript
import { getConfig } from '@cangjiemagic/skill-runtime';

// User configures: skill config my-skill --set API_KEY=abc123
// Skill receives: SKILL_API_KEY=abc123

const config = getConfig();
const apiKey = config.API_KEY; // "abc123"
```

### API Client

The SDK includes a client for interacting with the skill runtime API:

```typescript
import { SkillRuntimeClient } from '@cangjiemagic/skill-runtime';

const client = new SkillRuntimeClient({
  baseUrl: 'https://api.skill-runtime.uctoo.com/v1',
  authToken: 'your-jwt-token'
});

// Execute a skill
const result = await client.executeSkill('my-skill', {
  parameters: { name: 'Alice' }
});
```