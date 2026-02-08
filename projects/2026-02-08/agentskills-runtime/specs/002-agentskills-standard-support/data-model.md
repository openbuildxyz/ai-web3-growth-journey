# Data Model: Agentskills Standard Support in CangjieMagic Framework

## Architecture Pattern

The skill implementation follows the same three-tier architecture pattern as the rest of the CangjieMagic framework:

1. **User-facing components** (`apps\CangjieMagic\src\skill`)
   - Contains high-level, user-friendly skill implementations
   - Examples: `FileBasedSkill`, `SkillLoader`, etc.

2. **Core components** (`apps\CangjieMagic\src\core\skill`)
   - Contains abstract interfaces and core logic
   - Examples: `Skill` interface, `SkillManager` interface, etc.

3. **DSL macros** (`apps\CangjieMagic\src\dsl\skill.cj`)
   - Contains AST transformation macros
   - Example: `@skill` macro implementation

## Core Entities

### Skill
- **Description**: Represents an individual skill conforming to the agentskills standard
- **Fields**:
  - `name: String` - Unique identifier for the skill (max 64 characters, lowercase, hyphens only)
  - `description: String` - Description of what the skill does and when to use it (max 1024 characters)
  - `license: Option<String>` - License information for the skill
  - `compatibility: Option<String>` - Environment requirements for the skill
  - `metadata: HashMap<String, String>` - Additional arbitrary metadata
  - `allowedTools: Option<String>` - Space-delimited list of pre-approved tools
  - `instructions: String` - Markdown content containing the skill instructions
  - `skillPath: String` - File path to the skill's directory
- **Relationships**: Belongs to a SkillSet
- **Implementation**: Implements the `Tool` interface to maintain compatibility with existing ToolManager

### SkillSet
- **Description**: A collection of related skills, similar to the existing ToolSet concept
- **Fields**:
  - `name: String` - Name of the skill set
  - `skills: Array<Skill>` - Collection of skills in the set
  - `description: String` - Description of the skill set
- **Relationships**: Contains multiple Skills
- **Implementation**: Implements the `Toolset` interface to maintain compatibility with existing framework

### SkillManager
- **Description**: Manages the lifecycle of skills, similar to ToolManager
- **Fields**:
  - `availableSkills: HashMap<String, Skill>` - Map of skill names to skill objects
  - `enabledSkills: Array<String>` - List of currently enabled skill names
- **Relationships**: Manages multiple Skills
- **Implementation**: Implements the `ToolManager` interface to maintain compatibility with existing framework

### SkillExecutionResult
- **Description**: Represents the result of executing a skill
- **Fields**:
  - `skillName: String` - Name of the skill that was executed
  - `status: ExecutionStatus` - Enum indicating success, failure, or partial success
  - `output: String` - Output from the skill execution
  - `error: Option<String>` - Error message if execution failed
  - `executionTime: Int64` - Time taken for execution in milliseconds

## Supporting Entities

### SkillValidator
- **Description**: Validates skills against the agentskills standard specification
- **Fields**:
  - `validationRules: Array<ValidationRule>` - List of rules to validate against
- **Relationships**: Validates Skills

### ValidationRule
- **Description**: A single rule used to validate skills
- **Fields**:
  - `ruleName: String` - Name of the validation rule
  - `description: String` - Description of what the rule checks
  - `errorMessage: String` - Message to display if validation fails

### SkillMetadata
- **Description**: Additional metadata extracted from skill definition
- **Fields**:
  - `author: Option<String>` - Author of the skill (from metadata)
  - `version: Option<String>` - Version of the skill (from metadata)
  - `tags: Array<String>` - Tags associated with the skill
  - `categories: Array<String>` - Categories the skill belongs to

### SkillLoader
- **Description**: Loads skills from SKILL.md files and directories
- **Fields**:
  - `skillDirectory: String` - Path to the directory containing skills
  - `loadedSkills: Array<Skill>` - Skills loaded from the directory
- **Relationships**: Creates Skills from file system

## State Transitions

### Skill States
1. **Discovered**: Skill has been found in the file system but not yet loaded
2. **Loaded**: Skill has been parsed and validated
3. **Registered**: Skill has been added to the SkillManager
4. **Enabled**: Skill is available for execution
5. **Disabled**: Skill is registered but not available for execution
6. **Unregistered**: Skill has been removed from the SkillManager

### Skill Execution States
1. **Pending**: Skill execution has been requested but not started
2. **Executing**: Skill is currently running
3. **Completed**: Skill execution finished successfully
4. **Failed**: Skill execution encountered an error
5. **Cancelled**: Skill execution was cancelled before completion

## Relationships

```
SkillSet 1 -- * Skill
SkillManager 1 -- * Skill
Skill 1 -- 1 SkillExecutionResult
SkillValidator 1 -- * ValidationRule
Skill * -- 1 SkillMetadata
SkillLoader 1 -- * Skill
```

## Validation Rules

### Required Fields
- `name` must be 1-64 characters
- `name` may only contain lowercase alphanumeric characters and hyphens
- `name` must not start or end with a hyphen
- `name` must not contain consecutive hyphens
- `description` must be 1-1024 characters
- `description` must not be empty

### Optional Fields
- `license` if present, should be a valid license identifier
- `compatibility` if present, must be 1-500 characters
- `metadata` keys should be reasonably unique to avoid conflicts
- `allowed-tools` if present, should be a space-delimited list of tools

## Integration with Existing Framework

### Compatibility with Tool Interface
- The `Skill` interface extends the `Tool` interface to maintain compatibility with existing `ToolManager`
- Skills can be used interchangeably with tools in existing agent implementations

### Compatibility with ToolManager
- The `SkillManager` implements the `ToolManager` interface
- Skills can be added to existing `ToolManager` instances
- Existing agents can use skills without modification