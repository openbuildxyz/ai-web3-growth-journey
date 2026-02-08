# Comprehensive Documentation: Agentskills Standard Support in CangjieMagic Framework

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Usage Guide](#usage-guide)
5. [API Reference](#api-reference)
6. [Performance Considerations](#performance-considerations)
7. [Troubleshooting](#troubleshooting)

## Overview

The agentskills standard support in CangjieMagic provides a comprehensive framework for creating, managing, and executing AI agent skills that conform to the agentskills standard. This implementation allows developers to create interoperable agent skills that follow industry best practices.

### Key Features
- Full compliance with the agentskills standard specification
- DSL macro support with `@skill` annotation
- Skill lifecycle management
- Validation against agentskills standard
- Performance optimizations for skill discovery and execution
- Comprehensive error handling and logging

## Architecture

The system follows the same three-tier architecture pattern as the rest of the CangjieMagic framework:

### Component Organization Pattern:
The CangjieMagic framework follows a consistent three-tier architecture for its components:

1. **User-facing components** (`apps\CangjieMagic\src\skill`)
   - Contains high-level, user-friendly skill implementations
   - Examples: `FileBasedSkill`, `SkillLoader`, etc.

2. **Core components** (`apps\CangjieMagic\src\core\skill`)
   - Contains abstract interfaces and core logic
   - Examples: `Skill` interface, `SkillManager` interface, etc.

3. **DSL macros** (`apps\CangjieMagic\src\dsl\skill.cj`)
   - Contains AST transformation macros
   - Example: `@skill` macro implementation

### Skill Component Architecture:
- **User-facing**: Located in `apps\CangjieMagic\src\skill`, contains concrete skill implementations
- **Core**: Located in `apps\CangjieMagic\src\core\skill`, contains interfaces like `Skill`, `SkillManager`, etc.
- **DSL**: The `@skill` macro in `apps\CangjieMagic\src\dsl\skill.cj` transforms skill definitions into objects that implement the `Tool` interface

### Integration with Existing Framework:
The skill implementation integrates with the existing CangjieMagic architecture:
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Skill DSL     │    │  Skill Manager   │    │  Tool Manager   │
│   (@skill)      │───▶│  (SkillSet)      │───▶│  (Existing)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Skill Parser   │    │  Skill Validator │    │  Agent Executor │
│  (SKILL.md)     │    │  (Standard)      │    │  (Uses Skills)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Details

### Core Components Implementation

#### Skill Interface
The `Skill` interface extends the `Tool` interface to maintain compatibility with existing `ToolManager`. It includes all required fields per the agentskills standard:

- `name`: Unique identifier (1-64 chars, lowercase, hyphens only)
- `description`: Description of what the skill does (1-1024 chars)
- `license`: License information
- `compatibility`: Environment requirements
- `metadata`: Additional arbitrary metadata
- `allowedTools`: Space-delimited list of pre-approved tools
- `instructions`: Markdown content with skill instructions
- `skillPath`: File path to skill directory

#### BaseSkill Class
The `BaseSkill` class provides a concrete implementation of the `Skill` interface. It implements the `Tool` interface to ensure compatibility with existing tool management systems.

#### Skill Management
The `SimpleSkillManager` class extends `SimpleToolManager` to provide skill-specific management capabilities while maintaining compatibility with the existing tool management infrastructure.

### DSL Macro Implementation
The `@skill` DSL macro has been implemented in `apps\CangjieMagic\src\dsl\skill.cj`. It follows the same architectural pattern as the existing `@tool` and `@toolset` macros, transforming skill definitions into objects that implement the `Tool` interface, enabling seamless integration with existing agents and tool managers.

The macro supports the following attributes:
- `name`: Unique identifier for the skill
- `description`: Description of what the skill does
- `license`: License information
- `compatibility`: Environment requirements
- `metadata`: Additional arbitrary metadata
- `allowedTools`: Space-delimited list of pre-approved tools
- `parameters`: Parameters for the skill

### Skill Parsing Implementation
The `SkillParser` class in `apps\CangjieMagic\src\skill\skill_parser.cj` implements parsing logic to read SKILL.md files and extract metadata. It includes validation to ensure skills conform to the agentskills standard specification.

### API Services Implementation
The implementation includes API-like services that follow the contract defined in `contracts/skills-api.yaml`:

- `SkillRegistrationService` in `apps\CangjieMagic\src\skill\api\skill_registration_service.cj` handles skill registration
- `SkillExecutionService` in `apps\CangjieMagic\src\skill\api\skill_execution_service.cj` handles skill execution
- `SkillValidationService` in `apps\CangjieMagic\src\skill\api\skill_validation_service.cj` handles skill validation

### Package Structure:
The skill implementation follows the same package structure as other components:
```cj
package magic.core.skill  // Core skill interfaces
public import magic.core.skill.*

package magic.skill       // User-facing skill implementations
```

## Core Components

### Skill Entity
The `Skill` class represents an individual skill conforming to the agentskills standard:

```cangjie
public class Skill {
    prop name: String              // Unique identifier (1-64 chars, lowercase/hyphens)
    prop description: String       // Description of what the skill does (1-1024 chars)
    prop license: Option<String>   // License information
    prop compatibility: Option<String> // Environment requirements
    prop metadata: HashMap<String, String> // Additional arbitrary metadata
    prop allowedTools: Option<String> // Pre-approved tools list
    prop instructions: String      // Markdown content with skill instructions
    prop skillPath: String         // File path to skill directory
}
```

### SkillManager
The `SkillManager` handles the lifecycle of skills:

```cangjie
public class SkillManager {
    public func addSkill(skill: Skill)
    public func removeSkill(skillName: String)
    public func enableSkill(skillName: String)
    public func disableSkill(skillName: String)
    public func getSkill(skillName: String): Option<Skill>
    public func getAllSkills(): ArrayList<Skill>
    public func isSkillEnabled(skillName: String): Bool
}
```

### @skill DSL Macro
The `@skill` macro allows developers to define skills using Cangjie's AST transformation capabilities:

```cangjie
@skill(path: "./greeting-skill")
class GreetingSkill : Skill {
    init() {
        super(
            name: "greeting-skill",
            description: "A simple skill that generates personalized greetings",
            license: Some("MIT"),
            compatibility: None,
            metadata: HashMap<String, String>(),
            allowedTools: None,
            instructions: "# Greeting Skill\n\nThis skill generates personalized greetings for users.",
            skillPath: "./greeting-skill"
        )
    }
}
```

## Usage Guide

### Creating a New Skill

1. **Define the skill using the @skill macro:**

```cangjie
@skill
public class MyCustomSkill : Skill {
    init() {
        super(
            name: "my-custom-skill",
            description: "A custom skill that performs a specific task",
            license: Some("MIT"),
            compatibility: None,
            metadata: HashMap<String, String>(),
            allowedTools: None,
            instructions: "# My Custom Skill\n\nThis skill performs a specific task.",
            skillPath: "/path/to/my/skill"
        )
    }
    
    public func execute(arguments: HashMap<String, JsonValue>): String {
        // Implement skill execution logic here
        return "Executed my custom skill"
    }
}
```

2. **Register the skill with the SkillManager:**

```cangjie
let manager = SkillManager()
let skill = MyCustomSkill()
manager.addSkill(skill)
manager.enableSkill(skill.name)
```

### Using the Skill Service

The SkillService provides an API-like interface for skill operations:

```cangjie
let service = SkillService()

// Register a skill from a directory
let registeredSkill = service.registerSkill("/path/to/skill/directory")

// Execute a skill
let args = HashMap<String, JsonValue>()
args.add("param1", JsonValue.StringValue("value1"))
let result = service.executeSkill("my-skill-name", args)

// Validate a skill
let (isValid, issues) = service.validateSkill("/path/to/skill/directory")
```

### Importing Skills from Directory

Use the SkillImporter to load skills from a directory:

```cangjie
let manager = SkillManager()
let importer = SkillImporter()

// Import all skills from a directory
let importedSkills = importer.importSkillsFromDirectory("/path/to/skills", manager)

// Validate imported skills
let validationResults = importer.validateImportedSkills(importedSkills)
```

### Example Skills

The CangjieMagic framework includes example skills in the `apps\CangjieMagic\src\examples\skill_examples` directory to help developers understand how to implement skills following the agentskills standard. These examples demonstrate:

- Basic skill implementations using the `@skill` DSL macro
- SKILL.md file formatting that complies with the agentskills standard
- Integration with existing tool managers and agents
- Best practices for skill development and validation

To explore these examples:
1. Navigate to `apps\CangjieMagic\src\examples\skill_examples`
2. Review the example skill implementations
3. Use these as templates for your own skill development

## API Reference

### Skill Management Endpoints

The system supports API-like operations through the SkillService:

#### POST /skills
Register a new skill from a SKILL.md file or skill directory

#### GET /skills
Retrieve a list of all skills that conform to the agentskills standard

#### GET /skills/{skillName}
Retrieve details of a specific skill by name

#### DELETE /skills/{skillName}
Remove a skill from the skill manager

#### POST /skills/{skillName}/execute
Execute a specific skill with provided arguments

#### POST /skills/validate
Validate a skill against the agentskills standard

## Performance Considerations

### Caching
The OptimizedSkillManager implements caching for frequently accessed skills to improve performance:

- Skills are cached after first retrieval
- Cache can be cleared when needed
- Preloading available for anticipated access patterns

### Concurrent Access
The system uses concurrent data structures where appropriate to handle multi-threaded access patterns.

### Performance Tracking
The PerformanceTracker utility can be used to monitor operation timings:

```cangjie
let tracker = PerformanceTracker()
tracker.recordTiming("skill_execution", 150)  // Record 150ms execution time
let avgTime = tracker.getAverageTiming("skill_execution")  // Get average time
```

## Troubleshooting

### Common Issues

1. **Skill name validation errors**
   - Ensure skill names are 1-64 characters
   - Use only lowercase alphanumeric characters and hyphens
   - Do not start or end with a hyphen
   - Do not use consecutive hyphens

2. **Skill description validation errors**
   - Ensure descriptions are 1-1024 characters
   - Description cannot be empty

3. **Missing SKILL.md file**
   - Verify that each skill directory contains a SKILL.md file
   - Check that the file follows the agentskills standard format

4. **Directory access issues**
   - Verify that the agentskills directory is accessible
   - Check file permissions if running in a restricted environment

### Error Handling

The system provides comprehensive error handling and logging:

- All operations are wrapped in try-catch blocks
- Errors are logged with timestamps
- Error messages provide specific details about what went wrong

### Logging

The SkillLogger provides different levels of logging:

- `logInfo`: General operational messages
- `logWarning`: Non-critical issues that don't stop execution
- `logError`: Critical issues that may stop execution

Logs are written to both console and file (skill_operations.log) for debugging purposes.