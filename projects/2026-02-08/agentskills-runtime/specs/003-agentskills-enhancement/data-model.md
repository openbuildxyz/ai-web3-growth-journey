# Data Model: AgentSkills Standard Support Enhancement

## Overview
This document describes the key data models required for enhancing the CangjieMagic framework's support for the agentskills standard, particularly for loading and executing skills from SKILL.md files.

## Core Models

### 1. SkillManifest
**Description**: Represents the parsed content of a SKILL.md file according to the agentskills specification. Part of the domain layer.

**Fields**:
- `name: String` - Unique identifier for the skill (from YAML frontmatter, 1-64 chars)
- `description: String` - Description of the skill (from YAML frontmatter, 1-1024 chars)
- `license: Option<String>` - License information (from YAML frontmatter)
- `compatibility: Option<String>` - Compatibility requirements (from YAML frontmatter, max 500 chars)
- `metadata: HashMap<String, String>` - Additional metadata (from YAML frontmatter)
- `allowedTools: Option<String>` - Pre-approved tools list (from YAML frontmatter)
- `instructions: String` - Skill instructions and guidelines (from markdown body)
- `skillPath: String` - Path to the skill directory
- `scriptsDirExists: Bool` - Whether scripts/ directory exists
- `referencesDirExists: Bool` - Whether references/ directory exists
- `assetsDirExists: Bool` - Whether assets/ directory exists
- `parameters: Array<SkillParameter>` - Definition of parameters the skill accepts

### 2. SkillParameter
**Description**: Defines a parameter that a skill accepts. Part of the domain layer.

**Fields**:
- `name: String` - Name of the parameter
- `type: String` - Data type of the parameter
- `description: String` - Description of what the parameter does
- `required: Bool` - Whether the parameter is required
- `defaultValue: Option<String>` - Default value if parameter is not provided

### 3. ValidationResult
**Description**: Represents the result of validating a skill or SKILL.md file. Part of the domain layer.

**Fields**:
- `isValid: Bool` - Whether the validation passed
- `errors: Array<String>` - List of validation errors if any
- `warnings: Array<String>` - List of warnings if any
- `validationDate: Int64` - Timestamp of validation

### 4. SkillResourceLoader
**Description**: Handles loading of external resources for skills (scripts, references, assets). Part of the infrastructure layer.

**Fields**:
- `skillPath: String` - Base path of the skill
- `scriptsPath: Option<String>` - Path to scripts directory
- `referencesPath: Option<String>` - Path to references directory
- `assetsPath: Option<String>` - Path to assets directory
- `loadedScripts: HashMap<String, String>` - Cached scripts content
- `loadedReferences: HashMap<String, String>` - Cached references content
- `loadedAssets: HashMap<String, String>` - Cached assets content

### 5. YamlFrontmatter
**Description**: Represents the parsed YAML frontmatter from a SKILL.md file. Part of the domain layer. Parsed using the yaml4cj library from the Cangjie ecosystem.

**Fields**:
- `name: String` - Skill name
- `description: String` - Skill description
- `license: Option<String>` - License information
- `compatibility: Option<String>` - Compatibility requirements
- `metadata: HashMap<String, String>` - Additional metadata
- `allowedTools: Option<String>` - Allowed tools list
- `parsedWithYaml4cj: Bool` - Flag indicating if the YAML was parsed using the yaml4cj library

### 6. SkillLoadingContext
**Description**: Context information for loading and instantiating a skill from a SKILL.md file. Part of the application layer.

**Fields**:
- `manifest: SkillManifest` - The parsed skill manifest
- `resourceLoader: SkillResourceLoader` - Resource loader for the skill
- `validationResult: ValidationResult` - Result of validating the skill
- `creationDate: Int64` - Timestamp of skill creation

### 7. CleanSkillArchitecture
**Description**: Represents the clean architecture approach with separation of concerns.

**Layers**:
- `domainLayer: DomainLayer` - Contains business logic and entities
- `applicationLayer: ApplicationLayer` - Orchestrates use cases
- `infrastructureLayer: InfrastructureLayer` - Handles external concerns
- `interfaces: Array<Interface>` - Clean abstractions between layers

## Relationships

```
SkillManifest 1 -- 1 SkillLoadingContext : creates
SkillResourceLoader 1 -- 1 SkillLoadingContext : provides resources
ValidationResult 1 -- 1 SkillLoadingContext : validates
SkillParameter * -- 1 SkillManifest : defines parameters
YamlFrontmatter 1 -- 1 SkillManifest : provides metadata
```

## State Transitions

### SkillLoadingContext State Model
- `INITIALIZED` → `LOADING_RESOURCES`: When external resources are being loaded
- `LOADING_RESOURCES` → `RESOURCES_LOADED`: When all resources are loaded successfully
- `LOADING_RESOURCES` → `LOADING_FAILED`: When resource loading fails
- `RESOURCES_LOADED` → `VALIDATED`: When the skill has been validated
- `VALIDATED` → `READY`: When the skill is ready for execution
- `VALIDATED` → `INVALID`: When validation fails

## Validation Rules

1. **SkillManifest Validation**:
   - `name` must be 1-64 characters
   - `name` must contain only lowercase letters, numbers, and hyphens
   - `name` must not start or end with a hyphen
   - `name` must not contain consecutive hyphens
   - `description` must be 1-1024 characters
   - `compatibility` must be ≤ 500 characters if provided
   - `metadata` keys must not be empty

2. **YamlFrontmatter Validation**:
   - `name` and `description` are required fields
   - All constraints from SkillManifest validation apply

3. **SkillParameter Validation**:
   - `name` must not be empty
   - `type` must be a valid type
   - `required` and `defaultValue` should not conflict

4. **ValidationResult Validation**:
   - If `isValid` is true, `errors` array should be empty
   - Validation results should include timestamp

## Testing Structure

Tests for these models are located in the unified testing directory:
```
apps/CangjieMagic/src/tests/
├── unit/                         # Unit tests for individual components
├── integration/                  # Integration tests for the complete pipeline
└── contract/                     # Contract tests for agentskills compliance
```