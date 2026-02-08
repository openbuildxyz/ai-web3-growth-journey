# AgentSkills Standard Support Enhancement

This module enhances the CangjieMagic framework's support for the agentskills standard by implementing a clean architecture approach for loading skills from SKILL.md files. This involves designing a well-structured, maintainable system that follows clean architecture principles and best practices.

## Architecture

The implementation follows clean architecture principles with clear separation of concerns:

- **Domain Layer**: Contains business logic and entities (SkillManifest, SkillParameter, etc.)
- **Application Layer**: Orchestrates use cases (SkillParsingService, SkillValidationService, etc.)
- **Infrastructure Layer**: Handles external concerns (file loading, YAML processing, etc.)

### Domain Layer
- `models/` - Core data models like SkillManifest, SkillParameter, ValidationResult, etc.
- `interfaces/` - Domain interfaces like SkillRepository, SkillValidator
- `services/` - Domain services with business logic

### Application Layer
- `SkillLoadingService` - Service for loading skills from files
- `SkillValidationService` - Service for validating skills

### Infrastructure Layer
- `loaders/` - Components for loading skills from various sources
- `validators/` - Validation components
- `repositories/` - Repository implementations
- `adapters/` - Adapters for external systems
- `utils/` - Utility functions

## Features

1. **SKILL.md Loading**: Load skills from standard SKILL.md files according to the agentskills specification
2. **YAML Processing**: Parse YAML frontmatter using the yaml4cj library from the Cangjie ecosystem
3. **Markdown Processing**: Process markdown body content using the markdown4cj library from the Cangjie ecosystem
4. **Validation**: Comprehensive validation against the agentskills specification
5. **External Resource Access**: Support for accessing external resources (scripts/, references/, assets/)
6. **Progressive Skill Discovery**: Automatic scanning and loading of skills from subdirectories containing SKILL.md files

## Usage

To use the enhanced skill system:

1. Create a SKILL.md file with the required YAML frontmatter and instructions:

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

2. Use the SkillLoadingService to load and manage skills:

```cangjie
let skillLoadingService = SkillLoadingService()
let skill = skillLoadingService.loadSkillFromPath("path/to/SKILL.md")
```

3. For automatic discovery and loading of skills from subdirectories, use the ProgressiveSkillLoader:

```cangjie
let skillDir = "path/to/skill/directory"  // Can be any directory containing skill subdirectories
let loader = ProgressiveSkillLoader(skillBaseDirectory: skillDir)
let skillManager = CompositeSkillToolManager()
let skills = loader.loadSkillsToManager(skillManager)
```

## Key Components

- **SkillManagementService**: Main application service for managing skills throughout their lifecycle, coordinating loading, validation, and registration
- **SkillLoadingService**: Application service for loading skills from SKILL.md files (used internally by SkillManagementService)
- **SkillLoader**: Basic implementation for loading skills from directories
- **CompositeSkillToolManager**: Unified manager implementing both SkillManager and ToolManager interfaces
- **ProgressiveSkillLoader**: Component for automatic discovery and loading of skills from configurable directories, leveraging SkillManagementService for comprehensive skill lifecycle management

## Dependencies

This implementation leverages existing libraries from the Cangjie ecosystem:
- `yaml4cj`: For parsing YAML frontmatter from SKILL.md files
- `commonmark4cj`: For processing markdown content in SKILL.md files according to CommonMark specification
- `stdx`: For various utility functions

## Testing

Tests are located in the unified testing directory:
```
apps/CangjieMagic/src/tests/
├── unit/                         # Unit tests for individual components
├── integration/                  # Integration tests for the complete pipeline
└── contract/                     # Contract tests for agentskills compliance
```