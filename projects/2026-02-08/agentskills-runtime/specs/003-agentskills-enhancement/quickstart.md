# Quickstart Guide: AgentSkills Standard Support Enhancement

## Overview
This guide provides a quick introduction to using the enhanced CangjieMagic framework's support for the agentskills standard, including loading and executing skills from SKILL.md files.

## Prerequisites
- Cangjie development environment installed
- CangjieMagic framework with the enhanced agentskills support

## Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd qintong-admin
```

### 2. Navigate to the Enhancement Directory
```bash
cd apps/CangjieMagic/src/skill
```

### 3. Install Dependencies
```bash
# Using Cangjie package manager
cjpm install
```

## Using the Clean Architecture AgentSkills Support

### 1. Creating a SKILL.md File

Create a SKILL.md file with the required YAML frontmatter and instructions:

```markdown
---
name: example-skill
description: An example skill that demonstrates SKILL.md format
license: MIT
metadata:
  author: Your Name
  version: "1.0"
---

# Example Skill

This is an example skill that demonstrates the SKILL.md format.

## Parameters
- param1 (required): Description of the first parameter
- param2 (optional): Description of the second parameter

## Examples
- Example usage 1: {"param1": "value1"}
- Example usage 2: {"param1": "value1", "param2": "value2"}

## Guidelines
- Guideline 1
- Guideline 2
```

### 2. Loading a Skill from SKILL.md

Use the SkillManagementService to load a skill from a SKILL.md file:

```cangjie
// Initialize the application services
let skillParsingService = SkillParsingService()
let skillValidationService = SkillValidationService()
let skillManagementService = SkillManagementService()

// Load a skill from a file path
let skill = skillManagementService.loadSkillFromPath("path/to/SKILL.md")

if (skill.isSome()) {
    // Register the skill with a skill manager
    let skillManager = SimpleSkillManager()
    skillManagementService.registerSkill(skill.getOrThrow(), skillManager)

    // The skill is now ready to use
    let result = skill.execute(HashMap<String, JsonValue>([("param1", JsonString("value1"))]))
} else {
    // Handle loading errors
    println("Skill loading failed")
}
```

### 3. Validating a SKILL.md File

Use the SkillValidationService to validate a SKILL.md file:

```cangjie
// Initialize the validation service
let skillValidationService = SkillValidationService()

// Parse the skill manifest
let skillManifest = skillParsingService.parseSkillFromPath("path/to/SKILL.md")

if (skillManifest.isSome()) {
    // Validate the skill manifest
    let validationResult = skillValidationService.validateSkillManifest(skillManifest.getOrThrow())

    if (validationResult.isValid) {
        println("Skill is valid")
    } else {
        println("Skill validation errors: " + validationResult.errors.toString())
    }
}
```

### 4. Working with External Resources

Skills can access external resources in scripts/, references/, and assets/ directories:

```cangjie
// Initialize the resource loading service
let resourceLoadingService = ResourceLoadingService()

// Load external resources for a skill
let resourceLoader = resourceLoadingService.loadExternalResources("/path/to/skill")

// Access a script
let scriptContent = resourceLoader.loadScript("helper.py")

// Access a reference document
let referenceContent = resourceLoader.loadReference("REFERENCE.md")

// Access an asset
let assetContent = resourceLoader.loadAsset("template.json")
```

## Key Components

### 1. Clean Architecture Layers
The system follows clean architecture principles with clear separation of concerns:

- **Domain Layer**: Contains business logic and entities (SkillManifest, SkillParameter, etc.)
- **Application Layer**: Orchestrates use cases (SkillParsingService, SkillValidationService, etc.)
- **Infrastructure Layer**: Handles external concerns (file loading, network requests, etc.)

### 2. Leveraging Cangjie Ecosystem Libraries
The implementation utilizes existing libraries from the Cangjie ecosystem:

- **yaml4cj**: Used for parsing YAML frontmatter from SKILL.md files
- **commonmark4cj**: Used for processing markdown content in SKILL.md files according to CommonMark specification
- **stdx**: Used for various utility functions

```cangjie
// Example of using yaml4cj library
import yaml4cj.yaml.*

public class YamlFrontmatterParser {
    public func parseYamlContent(content: String): Option<HashMap<String, String>> {
        let yamlBytes = content.toUtf8()
        let parsedYaml = decode(yamlBytes)
        // Process the parsed YAML data
        return Some(parsedYaml)
    }
}
```

### 3. SkillManifest
Represents the parsed content of a SKILL.md file:

```cangjie
public class SkillManifest {
    public let name: String
    public let description: String
    public let license: Option<String>
    public let compatibility: Option<String>
    public let metadata: HashMap<String, String>
    public let allowedTools: Option<String>
    public let instructions: String
    public let skillPath: String
    public let parameters: Array<SkillParameter>
    // ... other fields
}
```

### 4. Application Services
Services in the application layer that orchestrate use cases:

```cangjie
public class SkillParsingService {
    public func parseSkillFromContent(content: String): Option<SkillManifest> {
        // Implementation using yaml4cj and markdown4cj libraries
    }

    public func parseSkillFromPath(path: String): Option<SkillManifest> {
        // Implementation using yaml4cj and markdown4cj libraries
    }
}
```

### 5. Dependency Management
The project includes proper dependency management in the cjpm.toml file:

```toml
[dependencies]
  yaml4cj = { git = "https://gitcode.com/Cangjie-TPC/yaml4cj.git", branch="master" }
  markdown4cj = { git = "https://gitcode.com/Cangjie-TPC/markdown4cj.git", branch="master" }
```

## Testing Structure

Tests are located in the unified testing directory:
```
apps/CangjieMagic/src/tests/
├── unit/                         # Unit tests for individual components
├── integration/                  # Integration tests for the complete pipeline
└── contract/                     # Contract tests for agentskills compliance
```

## Best Practices

### 1. SKILL.md Creation
- Follow the naming conventions (1-64 chars, lowercase, hyphens only)
- Provide clear and comprehensive descriptions
- Include examples of usage
- Document all parameters and their expected types
- Organize content for efficient context usage (keep main SKILL.md under 500 lines)

### 2. Validation
- Always validate SKILL.md files before using them
- Handle validation errors appropriately
- Provide clear error messages to users

### 3. Resource Management
- Organize external resources in the appropriate directories (scripts/, references/, assets/)
- Use descriptive names for resource files
- Consider the size of resources to avoid performance issues

## Troubleshooting

### Common Issues

1. **SKILL.md Format Errors**
   - Verify YAML frontmatter is correctly formatted
   - Ensure required fields (name, description) are present
   - Check that the name follows agentskills specification

2. **Resource Loading Failures**
   - Verify that resource files exist and are accessible
   - Check file permissions
   - Ensure paths are correctly specified

3. **Validation Failures**
   - Review validation error messages for specific issues
   - Check name and description length requirements
   - Verify YAML syntax

### Debugging Tips

1. Enable detailed logging to see the parsing and validation process
2. Use the SkillValidatorService to validate SKILL.md files independently
3. Test resource loading separately from skill execution

## Next Steps

1. Explore the example implementations in the `loaders/` and `validators/` directories
2. Create your own SKILL.md files following the specification
3. Integrate the enhanced skill loading into your applications
4. Contribute improvements to the agentskills support