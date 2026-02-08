# Implementation Plan: MCP Agent Skills Implementation

**Branch**: `001-mcp-agent-skills` | **Date**: 2026-01-25 | **Spec**: [link to spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mcp-agent-skills/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Convert the existing MCP adapter functionality into a comprehensive set of Agent Skills that conform to the agentskills standard. This implementation builds upon the enhanced agentskills standard support implemented in the specs\003-agentskills-enhancement project. The implementation will use a two-phase approach: first generating skills for standard CRUD APIs using a deterministic algorithm similar to the backend's `batchCreateModuleFromDb.ts`, then generating skills for non-standard APIs by analyzing the routes directory. The solution leverages the existing SKILL.md file loading, validation, and execution capabilities from the enhanced framework.

## Technical Context

**Language/Version**: 仓颉 (Cangjie) 1.0.0
**Primary Dependencies**: CangjieMagic framework, std library, stdx extension library, yaml4cj library, markdown4cj library, enhanced agentskills support from specs\003-agentskills-enhancement
**Storage**: N/A (stateless skills with token storage in memory)
**Testing**: Unit tests for individual skills, integration tests for skill workflows
**Target Platform**: Cangjie runtime environment
**Project Type**: Single project (skill library)
**Performance Goals**: Sub-second response times for skill execution
**Constraints**: <200ms p95 response time, <100MB memory usage, must conform to agentskills standard
**Scale/Scope**: Support all uctoo-backend APIs, handle concurrent requests from multiple AI assistants, leverage existing SKILL.md loading and validation from enhanced framework

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All code must follow the 仓颉编程语言编码规范 as defined in `.specify/memory/CANGJIE_CODING_GUIDELINES.md`. All implementations must use genuine 仓颉 standard library and extension library components as verified in the `apps/CangjieMagic/resource` directory. Code must be documented in Chinese as per the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-agent-skills/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/CangjieMagic/src/examples/uctoo_api_skill/
├── main.cj                           # Entry point for the skill application
├── skills/                           # Individual skill implementations
│   ├── base_uctoo_skill.cj           # Base class for all uctoo skills
│   ├── standard_crud_skills.cj       # Generated skills for standard CRUD operations
│   ├── non_standard_api_skills.cj    # Skills for non-standard API endpoints
│   └── auth_management_skill.cj      # Skill for authentication management
├── generators/                       # Code generation utilities
│   ├── standard_api_generator.cj     # Generator for standard API skills
│   └── non_standard_api_generator.cj # Generator for non-standard API skills
├── models/                           # Data models for API requests/responses
│   ├── api_request.cj                # Model for API requests
│   ├── api_response.cj               # Model for API responses
│   ├── skill_parameters.cj           # Model for skill parameters
│   ├── skill_manifest.cj             # Model for SKILL.md manifest
│   ├── skill_parameter.cj            # Model for skill parameters definition
│   └── skill_resource_loader.cj      # Model for loading external skill resources
├── utils/                            # Utility functions
│   ├── http_client.cj                # HTTP client for backend communication
│   ├── token_manager.cj              # Authentication token management
│   ├── natural_language_processor.cj # Natural language processing utilities
│   ├── skill_md_loader.cj            # SKILL.md file loader and parser
│   └── skill_validator.cj            # Skill validation against agentskills spec
├── services/                         # Service layer implementations
│   ├── skill_md_loader_service.cj    # Service for loading skills from SKILL.md
│   └── skill_validator_service.cj    # Service for validating skills
└── tests/                            # Test suite
    ├── unit/                         # Unit tests for individual skills
    ├── integration/                  # Integration tests for skill workflows
    └── contract/                     # Contract tests for agentskills compliance
```

**Structure Decision**: Selected single project structure under `apps/CangjieMagic/src/examples/uctoo_api_skill/` to maintain consistency with other examples and follow the CangjieMagic framework conventions. Leverages the enhanced agentskills support implemented in specs\003-agentskills-enhancement project.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |