# Quickstart Guide

This guide provides a quick introduction to setting up and using the CangjieMagic framework.

## Prerequisites
- Cangjie 1.0 or higher
- Basic familiarity with AI agent tools and skills

## Installation

The CangjieMagic framework is typically included as part of the larger application. The core runtime is implemented in Cangjie and can be integrated into your project.

## Basic Usage

### Loading Skills

#### From SKILL.md Files
```cangjie
import magic.skill.application.ProgressiveSkillLoader
import magic.skill.CompositeSkillToolManager

// Create a progressive skill loader
let skillDir = "path/to/skills"
let loader = ProgressiveSkillLoader(skillBaseDirectory: skillDir)

// Create a skill manager
let skillManager = CompositeSkillToolManager()

// Load skills from the directory
let skills = loader.loadSkillsToManager(skillManager)

// Skills are now available for execution
```

#### Using the DSL
```cangjie
import { Skill, Tool } from "cangjiemagic";

@Skill(
  name = "hello-world",
  description = "A simple skill that greets the user",
  license = "MIT"
)
public class HelloWorldSkill {
    @Tool(
      name = "greet",
      description = "Greet a user by name",
      parameters = [
        { name: "name", type: "string", required: true, description: "The name of the person to greet" }
      ]
    )
    public String greet(String name) {
        return "Hello, " + name + "!";
    }
}
```

### Executing Skills

Skills can be executed through the tool interface using the `SkillToToolAdapter`:

```cangjie
// Find and execute a skill as a tool
if (let Some(tool) <- skillManager.findTool("hello-world")) {
    let args = HashMap<String, JsonValue>()
    args.add("name", JsonString("Alice"))
    
    let result = tool.invoke(args)
    print(result.content)
}
```

### Creating a Skill with SKILL.md Format

Create a `SKILL.md` file in your skill directory following the agentskills standard:

```markdown
---
name: hello-world
description: A simple skill that greets the user
license: MIT
metadata:
  author: Your Name
  version: "1.0.0"
  tags: ["greeting", "example"]
---

# Hello World Skill

This skill takes a name and returns a greeting.

## Tools Provided

### greet

Greet a user by name.

**Parameters:**
- `name` (required, string): The name of the person to greet

**Examples:**
```bash
skill run hello-world:greet name=Alice
```

## Guidelines

- Use this skill to greet users by name
- The name parameter is required
```

## Progressive Skill Loading

The framework includes a progressive skill loader that automatically discovers and loads skills from configurable directories:

```cangjie
// Load skills from multiple directories
let directories = ["./skills", "./plugins/skills"]
let loader = ProgressiveSkillLoader(skillBaseDirectories: directories)

// Load and register skills with the manager
let skillManager = CompositeSkillToolManager()
loader.loadSkillsToManager(skillManager)
```

## MCP Integration

The framework supports MCP (Model Context Protocol) for integration with AI agents:

```cangjie
// The framework provides MCP server capabilities
// Skills loaded via the framework are automatically available via MCP
```

## Security Model

The framework implements a comprehensive security model:

1. **WASM-based Security Sandbox**: All skills execute in a secure WASM environment
2. **Capability-based Access Control**: Fine-grained permissions limiting skills to only necessary resources
3. **Resource Quotas**: Prevention of resource exhaustion attacks
4. **Execution Context Isolation**: Complete separation between concurrent skill executions

### Granting Capabilities
```cangjie
// When executing a skill, grant specific capabilities
let result = runtime.executeSkill('my-skill', {
  parameters: { /* ... */ },
  capabilities: {
    network: {
      allowedHosts: ['api.example.com'],
      allowedPorts: [443]
    },
    filesystem: {
      allowedPaths: ['/tmp', '/data'],
      permissions: ['read', 'write']
    }
  }
});
```

## Advanced Semantic Search

The runtime includes advanced RAG search capabilities:

```cangjie
// Search for skills using natural language
const results = await runtime.searchSkills('manage kubernetes pods', {
  topK: 5,                    // Number of results to return
  includeExamples: true,      // Include usage examples in results
  rerank: true,               // Apply cross-encoder reranking for improved precision
  queryUnderstanding: true,   // Apply query understanding with intent classification
  contextCompression: true    // Apply context compression for token efficiency
});
```

## CLI Usage

The framework includes a comprehensive command-line interface:

```bash
# Install a skill from local path
skill install --path ./my-skill

# Install a skill from Git repository
skill install --git https://github.com/user/skill.git

# List installed skills
skill list

# Execute a skill with parameters
skill run my-skill:tool --param1 value1 --param2 value2

# Semantic search for skills with usage examples
skill find "manage kubernetes pods"

# Start MCP server with HTTP streaming mode and embedded web UI
skill serve --http --port 3000
```

## Configuration

The framework can be configured via a comprehensive configuration:

```toml
# skill-runtime.toml
[storage]
path = "./skills"
type = "local"

[security]
level = "high"
sandbox = "wasm"  # WASM-based sandboxing with Component Model support
timeout = "30s"
capability_model = true  # Enable capability-based access control
scene_security = true    # Enable scene-based hierarchical security
resource_quotas = true   # Enable resource quotas and isolation

[search]
enabled = true
provider = "fastembed"  # Use fastembed for vector embeddings
model = "all-minilm"    # Model for embeddings
hybrid = true           # Enable hybrid dense+sparse search with RRF fusion
rerank = true           # Enable cross-encoder reranking
query_understanding = true  # Enable query understanding with intent classification
context_compression = true  # Enable context compression for token efficiency

[performance]
max_concurrency = 10000   # Support for high concurrency (10,000+ concurrent executions)
memory_limit = "1GB"
response_timeout = "5s"
```

## Troubleshooting

If you encounter issues:

1. Check that your SKILL.md files follow the correct format
2. Verify that all required fields are present in the YAML frontmatter
3. Ensure that your skill names follow the naming conventions (1-64 chars, lowercase, hyphens only, no leading/trailing hyphens)
4. Confirm that your Cangjie environment is properly set up