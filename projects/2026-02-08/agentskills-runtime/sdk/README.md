# Agent Skill Runtime SDK Directory Structure

## Overview

This directory contains SDKs for multiple programming language ecosystems that integrate with the CangjieMagic Agent Skill Runtime. Each SDK provides a consistent interface while leveraging each ecosystem's standard package management and command-line tools.

## Directory Structure

```
sdk/
├── javascript/           # JavaScript/TypeScript SDK
│   ├── src/             # Source code
│   │   ├── index.ts     # Main SDK exports
│   │   └── cli.ts       # CLI tool implementation
│   ├── package.json     # Package metadata
│   ├── README.md        # Documentation and usage examples
│   ├── DESIGN.md        # Design documentation
│   └── tsconfig.json    # TypeScript configuration
├── python/              # Python SDK
│   ├── src/
│   ├── pyproject.toml   # Package metadata
│   └── README.md        # Documentation
├── java/                # Java SDK
│   ├── src/
│   ├── pom.xml          # Package metadata
│   └── README.md        # Documentation
├── go/                  # Go SDK
│   ├── src/
│   ├── go.mod           # Package metadata
│   └── README.md        # Documentation
├── rust/                # Rust SDK
│   ├── src/
│   ├── Cargo.toml       # Package metadata
│   └── README.md        # Documentation
├── API_INTEGRATION_SPEC.md  # API integration specifications
└── SDK_REQUIREMENTS.md      # SDK requirements documentation
```

## Purpose

Each SDK provides:

1. **Programmatic API**: Functions and classes for skill development
2. **CLI Integration**: Standard command-line interface using ecosystem prefixes
3. **API Communication**: Integration with the Standard API Interface Layer
4. **Documentation**: Usage examples and API references

## Standard CLI Format

All SDKs support the same command-line interface with ecosystem-specific prefixes:

- JavaScript: `npm skill {command}`
- Python: `pip skill {command}`
- Java: `mvn skill {command}`
- Go: `go skill {command}`
- Rust: `cargo skill {command}`

## Integration Points

All SDKs integrate with the CangjieMagic Agent Skill Runtime through:

1. **Standard API Interface Layer**: RESTful API with JWT authentication
2. **Common Data Models**: Consistent request/response formats
3. **Shared Authentication**: JWT-based security model
4. **Unified Error Handling**: Consistent error response format