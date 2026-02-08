# Quickstart Guide: MCP Agent Skills

## Overview
This guide provides a quick introduction to using the MCP Agent Skills that convert natural language requests to uctoo-backend API calls. The implementation follows the agentskills standard for skill definition and execution.

## Prerequisites
- Cangjie development environment installed
- Access to uctoo-backend server
- Valid API credentials for the backend server

## Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd uctoo-admin
```

### 2. Navigate to the Skill Directory
```bash
cd apps/CangjieMagic/src/examples/uctoo_api_skill
```

### 3. Install Dependencies
```bash
# Using Cangjie package manager
cjpm install
```

## Running the Skills

### 1. Basic Execution
```bash
cjpm run --name magic.examples.uctoo_api_skill
```

### 2. Configuration
Before running the skills, ensure the following configurations are set:
- Backend server URL
- API credentials (if required)
- Authentication tokens (for protected endpoints)

Configuration can be set via environment variables or a config file.

## Using the Skills

### 1. Standard CRUD Operations

#### Get Entities
```cangjie
// Example: Get all entities
let result = getEntitySkill.execute(HashMap<String, JsonValue>([
    ("table_name", JsonString("entity")),
    ("limit", JsonString("10")),
    ("page", JsonString("0"))
]))
```

#### Create Entity
```cangjie
// Example: Create a new entity
let entityData = JsonObject()
entityData.put("name", JsonString("New Entity"))
entityData.put("description", JsonString("An example entity"))

let params = HashMap<String, JsonValue>([
    ("table_name", JsonString("entity")),
    ("entity_data", entityData)
])

let result = createEntitySkill.execute(params)
```

#### Update Entity
```cangjie
// Example: Update an existing entity
let updateData = JsonObject()
updateData.put("name", JsonString("Updated Entity Name"))

let params = HashMap<String, JsonValue>([
    ("table_name", JsonString("entity")),
    ("id", JsonString("123")),
    ("entity_data", updateData)
])

let result = updateEntitySkill.execute(params)
```

#### Delete Entity
```cangjie
// Example: Delete an entity
let params = HashMap<String, JsonValue>([
    ("table_name", JsonString("entity")),
    ("id", JsonString("123"))
])

let result = deleteEntitySkill.execute(params)
```

### 2. Authentication

#### Login
```cangjie
// Example: Authenticate user
let params = HashMap<String, JsonValue>([
    ("username", JsonString("demo")),
    ("password", JsonString("123456"))
])

let result = loginSkill.execute(params)
```

After successful login, the authentication token will be stored and used for subsequent requests automatically.

### 3. Natural Language Interface
The skills can also be used through a natural language interface:

```cangjie
// Example: Natural language request
let params = HashMap<String, JsonValue>([
    ("query", JsonString("Get all entities with limit 5"))
])

let result = naturalLanguageProcessorSkill.execute(params)
```

### 4. Loading Skills from SKILL.md Files

The framework supports loading skills from SKILL.md files according to the agentskills specification:

```cangjie
// Example SKILL.md file structure:
/*
---
name: get-entities-skill
description: Retrieve entities from the backend with pagination support
license: MIT
metadata:
  author: UCToo Team
  version: "1.0"
---

# Get Entities Skill

This skill retrieves entities from the uctoo-backend server with support for pagination and filtering.

## Parameters
- table_name (required): The name of the database table to query
- limit (optional): Number of records to retrieve (default: 10)
- page (optional): Page number for pagination (default: 0)

## Examples
- Get first 10 entities: {"table_name": "entity", "limit": "10", "page": "0"}
- Get next 10 entities: {"table_name": "entity", "limit": "10", "page": "1"}

## Guidelines
- Always specify the table_name parameter
- Use appropriate limit values to avoid performance issues
*/
```

To load a skill from a SKILL.md file:

```cangjie
let skillLoader = SkillLoader("path/to/skill/directory")
let skills = skillLoader.loadSkills()
let skillManager = SimpleSkillManager()
skillManager.addSkill(skills[0])
```

## Skill Architecture

### 1. Base Skill Structure
All skills extend the `BaseSkill` class and implement the agentskills standard:

```cangjie
public class MyCustomSkill <: BaseSkill {
    public init() {
        super(
            name: "my-custom-skill",
            description: "A custom skill that performs a specific task",
            license: Some("MIT"),
            compatibility: None,
            metadata: HashMap<String, String>([("author", "Your Name"), ("version", "1.0")]),
            allowedTools: None,
            instructions: "# My Custom Skill\n\nThis skill performs a specific task.",
            skillPath: "./my-custom-skill"
        )
    }

    override public func execute(args: HashMap<String, JsonValue>): String {
        // Implement your skill's functionality here
        return "Executed my custom skill"
    }
}
```

### 2. SKILL.md Structure
Skills can also be defined using the standard SKILL.md format:

```
skill-directory/
├── SKILL.md          # Required file with YAML frontmatter and instructions
├── scripts/          # Optional: executable scripts for the skill
├── references/       # Optional: reference documents for the skill
└── assets/           # Optional: static assets for the skill
```

### 3. Skill Registration
Skills are registered with the skill manager:

```cangjie
let skillManager = SimpleSkillManager()
skillManager.registerSkill(MyCustomSkill())
```

## Best Practices

### 1. Error Handling
Always handle potential errors when executing skills:

```cangjie
try {
    let result = someSkill.execute(params)
    // Process successful result
} catch (ex: Exception) {
    // Handle error appropriately
    println("Skill execution failed: " + ex.message)
}
```

### 2. Parameter Validation
Validate input parameters before passing them to skills:

```cangjie
func validateParams(params: HashMap<String, JsonValue>): Bool {
    // Implement validation logic
    return true
}
```

### 3. Token Management
For authenticated endpoints, ensure tokens are properly managed:

```cangjie
// The skill framework handles token storage and retrieval automatically
// after successful authentication
```

### 4. SKILL.md Best Practices
When creating skills using the SKILL.md format:
- Follow the naming conventions (1-64 chars, lowercase, hyphens only)
- Provide clear and comprehensive descriptions
- Include examples of usage
- Document all parameters and their expected types
- Organize content for efficient context usage (keep main SKILL.md under 500 lines)

## Troubleshooting

### Common Issues

1. **Authentication Failure**
   - Verify credentials are correct
   - Check if the authentication endpoint is accessible

2. **Invalid API Response**
   - Check the backend server logs
   - Verify the API endpoint exists and is functioning

3. **Network Connectivity Issues**
   - Ensure the backend server is reachable
   - Check firewall settings

4. **SKILL.md Format Errors**
   - Verify YAML frontmatter is correctly formatted
   - Ensure required fields (name, description) are present
   - Check that the name follows agentskills specification

### Debugging Tips

1. Enable detailed logging to see the request/response flow
2. Use the token validation skill to verify authentication status
3. Test individual skills separately before integrating them
4. Validate SKILL.md files using the StandardSkillValidator

## Next Steps

1. Explore the example implementations in the `skills/` directory
2. Customize skills for your specific use cases
3. Add new skills following the agentskills standard
4. Create SKILL.md files for complex skills with external resources
5. Integrate with your AI assistant framework