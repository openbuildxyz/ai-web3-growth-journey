# API Contracts: AgentSkills Standard Support Enhancement

## Overview
This document defines the API contracts for the AgentSkills Standard Support Enhancement, specifying the interfaces for loading, validating, and executing skills from SKILL.md files according to the agentskills specification.

## Core API Contracts

### 1. Skill Parsing Service (Application Layer)
**Interface**: `SkillParsingService`
**Description**: Application service for parsing SKILL.md files into structured data. Uses yaml4cj library for YAML parsing and markdown4cj library for markdown processing.

**Methods**:
- `parseSkillFromContent(content: String): Option<SkillManifest>`
- `parseSkillFromPath(path: String): Option<SkillManifest>`

**Example Usage**:
```
let content = "---\nname: example-skill\ndescription: An example skill\n---\n# Example Skill\n\nThis is an example skill."
let manifest = skillParsingService.parseSkillFromContent(content)
```

**Implementation Details**:
- Uses yaml4cj library to parse YAML frontmatter
- Uses commonmark4cj library to process markdown content
- Leverages existing Cangjie ecosystem libraries for optimal performance and reliability

### 2. Skill Validation Service (Application Layer)
**Interface**: `SkillValidationService`
**Description**: Application service for validating skills against the agentskills specification.

**Methods**:
- `validateSkillManifest(manifest: SkillManifest): ValidationResult`
- `validateSkillName(name: String): (Bool, String)`
- `validateSkillDescription(description: String): (Bool, String)`
- `validateSkillContent(content: String): ValidationResult`

**Example Usage**:
```
let validationResult = skillValidationService.validateSkillManifest(skillManifest)
if (validationResult.isValid) {
  // Proceed with skill instantiation
} else {
  // Handle validation errors
}
```

### 3. Skill Management Service (Application Layer)
**Interface**: `SkillManagementService`
**Description**: Application service for managing skills throughout their lifecycle.

**Methods**:
- `loadSkillFromPath(path: String): Option<Skill>`
- `registerSkill(skill: Skill, skillManager: SkillManager): Bool`
- `loadSkillsFromDirectory(directoryPath: String): Array<Skill>`

**Example Usage**:
```
let skill = skillManagementService.loadSkillFromPath("/path/to/skill/SKILL.md")
if (skill.isSome()) {
  skillManagementService.registerSkill(skill.getOrThrow(), skillManager)
}
```

### 4. Skill Repository (Domain Interface)
**Interface**: `SkillRepository`
**Description**: Domain interface for skill persistence operations.

**Methods**:
- `save(skillManifest: SkillManifest): Bool`
- `findByPath(path: String): Option<SkillManifest>`
- `findAll(): Array<SkillManifest>`
- `deleteByPath(path: String): Bool`

**Example Usage**:
```
// This interface would be implemented in the infrastructure layer
// and injected into domain services
```

### 5. Skill Validator (Domain Interface)
**Interface**: `SkillValidator`
**Description**: Domain interface for skill validation operations.

**Methods**:
- `validate(manifest: SkillManifest): ValidationResult`
- `isValidName(name: String): Bool`
- `isValidDescription(description: String): Bool`

**Example Usage**:
```
// This interface would be implemented in the infrastructure layer
// and injected into domain services
```

### 6. Resource Loading Service (Infrastructure Layer)
**Interface**: `ResourceLoadingService`
**Description**: Infrastructure service for loading external resources for skills (scripts, references, assets).

**Methods**:
- `loadExternalResources(skillPath: String): SkillResourceLoader`
- `loadScript(skillPath: String, scriptName: String): Option<String>`
- `loadReference(skillPath: String, referenceName: String): Option<String>`
- `loadAsset(skillPath: String, assetName: String): Option<String>`

**Example Usage**:
```
let resourceLoader = resourceLoadingService.loadExternalResources("/path/to/skill")
let scriptContent = resourceLoader.loadScript("helper.py")
```

### 7. YAML Processing Service (Infrastructure Layer)
**Interface**: `YamlProcessingService`
**Description**: Infrastructure service for processing YAML content using the yaml4cj library from the Cangjie ecosystem.

**Methods**:
- `parseYamlContent(content: String): Option<HashMap<String, String>>`
- `validateYamlSyntax(content: String): Bool`
- `extractYamlFrontmatter(content: String): Option<HashMap<String, String>>`

**Example Usage**:
```
import yaml4cj.yaml.*

let yamlService = YamlProcessingService()
let content = "---\nname: example-skill\ndescription: An example skill\n---"
let parsedYaml = yamlService.parseYamlContent(content)
```

### 8. Markdown Processing Service (Infrastructure Layer)
**Interface**: `MarkdownProcessingService`
**Description**: Infrastructure service for processing markdown content using the commonmark4cj library from the Cangjie ecosystem.

**Methods**:
- `parseMarkdownContent(content: String): String`
- `extractSections(markdown: String): Array<String>`
- `renderToHtml(markdown: String): String`

**Example Usage**:
```
let markdownService = MarkdownProcessingService()
let content = "# Example Skill\n\nThis is an example skill."
let html = markdownService.renderToHtml(content)
```

## File Format Contracts

### 5. SKILL.md Format
**Description**: The required format for skill definition files.

**Structure**:
```
---
name: skill-name
description: A description of what this skill does and when to use it
license: [optional license info]
compatibility: [optional compatibility requirements]
metadata: [optional key-value pairs]
allowed-tools: [optional list of allowed tools]
---
# Skill Title

[Skill instructions in markdown format]

## Examples
- Example usage 1
- Example usage 2

## Guidelines
- Guideline 1
- Guideline 2
```

**Validation Rules**:
- File must start with YAML frontmatter delimited by `---`
- `name` field is required, 1-64 chars, lowercase alphanumerics and hyphens only
- `description` field is required, 1-1024 chars
- Name must not start or end with hyphen
- Name must not contain consecutive hyphens
- Markdown body follows after closing `---`

**YAML Parsing Implementation**:
- Use yaml4cj library from the Cangjie ecosystem for parsing YAML frontmatter
- Leverage existing library functionality for validation and error handling

### 6. Directory Structure Contract
**Description**: The expected directory structure for skills with external resources.

**Structure**:
```
skill-directory/
├── SKILL.md          # Required file with YAML frontmatter and instructions
├── scripts/          # Optional: executable scripts for the skill
│   ├── script1.py
│   └── script2.sh
├── references/       # Optional: reference documents for the skill
│   ├── REFERENCE.md
│   └── FORMS.md
└── assets/           # Optional: static assets for the skill
    ├── template.docx
    └── schema.json
```

## Internal Service Contracts

### 7. YAML Processing Service
**Interface**: `YamlProcessingService`
**Description**: Internal service for processing YAML content.

**Methods**:
- `parseYaml(yamlString: String): HashMap<String, String>`
- `validateYamlFormat(yamlString: String): Bool`
- `getYamlValue(yamlMap: HashMap<String, String>, key: String): Option<String>`

### 8. File System Service
**Interface**: `FileSystemService`
**Description**: Internal service for file system operations.

**Methods**:
- `fileExists(path: String): Bool`
- `readFile(path: String): Option<String>`
- `directoryExists(path: String): Bool`
- `listDirectoryContents(path: String): Array<String>`

## Error Handling Contracts

### Standard Error Format
All services return errors in the following format:
```
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes
- `SKILL_FORMAT_ERROR`: SKILL.md file does not conform to specification
- `YAML_PARSE_ERROR`: YAML frontmatter is malformed
- `RESOURCE_LOAD_ERROR`: Failed to load external resources for the skill
- `VALIDATION_ERROR`: Skill does not meet agentskills specification requirements
- `FILE_ACCESS_ERROR`: Cannot access required files or directories
- `NAME_CONSTRAINT_ERROR`: Skill name does not meet specification requirements
- `DESCRIPTION_CONSTRAINT_ERROR`: Skill description does not meet specification requirements