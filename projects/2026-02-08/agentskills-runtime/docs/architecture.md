# Architecture Overview

The CangjieMagic framework follows clean architecture principles with clear separation of concerns:

## Layered Architecture

### Domain Layer
Contains business logic and entities:
- SkillManifest
- SkillParameter
- ValidationResult
- Skill models and interfaces

### Application Layer
Orchestrates use cases:
- SkillLoadingService
- SkillValidationService
- SkillManagementService
- SkillParsingService

### Infrastructure Layer
Handles external concerns:
- File loading and YAML processing
- Database access
- External API integrations
- Logging and monitoring

### Presentation Layer
Manages skill and tool interactions:
- CLI commands
- API controllers
- MCP protocol handlers

## Component Structure

### Skill Module
The skill module contains all skill-related functionality:

```
skill/
├── api/                        # Skill API interfaces
├── application/                # Skill application services
│   ├── skill_loading_service.cj      # Service for loading skills from files
│   ├── skill_validation_service.cj   # Service for validating skills
│   ├── skill_management_service.cj   # Main service for skill lifecycle management
│   ├── skill_parsing_service.cj      # Core skill parsing logic
│   ├── progressive_skill_loader.cj   # Progressive skill loading from directories
│   ├── enhanced_progressive_skill_loader.cj # Enhanced progressive skill loader
│   ├── skill_factory.cj              # Skill factory and registry implementation
│   └── skill_registry.cj             # Skill registry for managing skill types
├── domain/                     # Domain layer - business logic and entities
│   ├── models/                 # Core data models
│   │   ├── skill_manifest.cj         # Model representing parsed SKILL.md content
│   │   ├── skill_parameter.cj        # Model for skill parameters
│   │   └── validation_result.cj      # Model for validation results
│   ├── interfaces/             # Domain interfaces/abstractions
│   │   ├── skill_repository.cj       # Abstraction for skill persistence
│   │   └── skill_validator.cj        # Abstraction for skill validation
│   └── services/               # Domain services with business logic
│       ├── skill_parsing_service.cj  # Core skill parsing logic
│       └── skill_management_service.cj # Core skill management logic
└── infrastructure/             # Infrastructure layer - external concerns
    ├── loaders/                # Components for loading skills from various sources
    │   ├── skill_md_loader.cj        # Loader for SKILL.md files
    │   ├── yaml_frontmatter_parser.cj # Parser for YAML frontmatter in SKILL.md
    │   └── resource_loader.cj        # Loader for external resources (scripts, references, assets)
    ├── validators/             # Validation components
    │   ├── skill_validator_impl.cj   # Implementation of skill validator interface
    │   ├── skill_manifest_validator.cj # Validator for skill manifest structure
    │   └── yaml_validator.cj         # Validator for YAML frontmatter
    ├── repositories/           # Repository implementations
    │   └── file_based_skill_repository.cj # File-based skill persistence
    ├── adapters/               # Adapters for external systems
    │   └── skill_to_tool_adapter.cj  # Adapts skills to tool interface
    └── utils/                  # Utility functions
        ├── yaml_utils.cj             # Utilities for YAML processing
        ├── file_utils.cj             # Utilities for file operations
        └── markdown_utils.cj         # Utilities for markdown processing
```

## Key Components

### Skill Management
- `SkillManagementService`: Main service for managing skills throughout their lifecycle
- `SkillLoadingService`: Service for loading skills from SKILL.md files
- `ProgressiveSkillLoader`: Component for automatic discovery and loading of skills from configurable directories

### Skill Validation
- `SkillValidationService`: Service for validating skills against the agentskills specification
- `StandardSkillValidator`: Implementation of skill validation logic

### Skill Execution
- `SkillExecution`: Core logic for executing skills with proper context and security

### MCP Integration
- `MCP Server`: Model Context Protocol server for integration with AI agents
- `SkillToToolAdapter`: Adapter to make skills compatible with tool interface

## Design Patterns

### Clean Architecture
The framework follows clean architecture principles:
- Independence of frameworks
- Testable business rules
- Independence of UI
- Independence of database

### Factory Pattern
- `SkillFactory`: Creates skill instances based on skill manifest
- `SkillRegistry`: Maintains mapping of skill names to their factories

### Adapter Pattern
- `SkillToToolAdapter`: Makes skills compatible with tool interface

### Repository Pattern
- `SkillRepository`: Abstracts skill persistence operations

## Security Architecture

### WASM Sandbox
- Component Model support for secure execution
- Capability-based access control
- Resource quotas and execution limits

### Capability-Based Security
- Fine-grained permissions for resource access
- Network, filesystem, and execution controls

## Data Flow

1. SKILL.md file is loaded by `SkillLoader`
2. YAML frontmatter and markdown content are parsed by `SkillParser`
3. Skill manifest is validated by `SkillValidator`
4. Skill instance is created by `SkillFactory`
5. Skill is registered with `SkillManager`
6. Skill can be executed via `SkillToToolAdapter` when needed