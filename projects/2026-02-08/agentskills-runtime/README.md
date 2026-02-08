# AgentSkills Runtime

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/uctoo/agentskills-runtime)
[![Cangjie](https://img.shields.io/badge/language-Cangjie-orange.svg)](https://cangjie-lang.cn/)

## Project Introduction

AgentSkills Runtime is a runtime environment for the Agent Skills standard implemented based on the Cangjie programming language. It is a domestic technology stack implementation of the AgentSkills open standard, providing a secure and efficient AI agent skill execution environment. It aims to enable AgentSkills to run anywhere. Open source project address: https://atomgit.com/uctoo/agentskills-runtime

## Overview

AgentSkills Runtime is a comprehensive framework for building and executing AI agent skills. It provides a secure, portable, and intelligent runtime environment for AI agent tools that follow the agentskills standard. The framework is built on the Cangjie programming language and incorporates advanced features from the UCToo project architecture.

The framework includes:
- Support for the agentskills standard, including loading and validation of SKILL.md files
- DSL support with `@skill`, `@tool`, and `@agent` macros
- Clean architecture with clear separation of concerns (domain layer, application layer, infrastructure layer)
- MCP (Model Context Protocol) support for integration with AI agents
- Skill-to-tool adapter for compatibility between skills and tools
- Progressive skill loading from configurable directories
- WASM-based security sandboxing for secure skill execution
- Advanced RAG search with hybrid dense+sparse search capabilities
- Multi-format skill support (WASM components and SKILL.md files)

## 🎯 Project Vision

Build a domestically developed and controllable AI agent skill runtime, promote the application of Agent Skills standards in the AI ecosystem, and construct an open, secure, and efficient AI-native application infrastructure. Aiming to enable AgentSkills to run anywhere.

## Architecture Design

This implementation follows clean architecture principles with clear separation of concerns:

- **Domain Layer**: Contains business logic and entities (SkillManifest, SkillParameter, etc.)
- **Application Layer**: Orchestrates use cases (SkillLoadingService, SkillValidationService, etc.)
- **Infrastructure Layer**: Handles external concerns (file loading, YAML processing, etc.)
- **Presentation Layer**: Manages skill and tool interactions

## Features

### AgentSkills Standard Support
- Loading skills from SKILL.md files according to the agentskills specification
- YAML frontmatter parsing with validation
- Markdown body processing for skill instructions
- External resource access (scripts/, references/, assets/)

### DSL Support
- `@skill` macro for declarative skill definition
- `@tool` macro for tool definition
- `@agent` macro for agent definition

### Security
- WASM-based security sandboxing with Component Model support
- Capability-based access control (filesystem, network, etc.)
- Resource quotas and execution limits
- Execution context isolation

### Search & Discovery
- Advanced RAG search with hybrid dense+sparse search (vector embeddings + BM25 with RRF fusion)
- Cross-encoder reranking for improved precision
- Query understanding with intent classification and entity extraction
- Context compression for token-efficient output

### Multi-Format Skill Support
- WASM component model execution with Component Model support
- SKILL.md file parsing and execution following agentskills standard
- Format-agnostic skill interface
- Dynamic format detection and validation

### MCP Integration
- Dynamic tool discovery from skill manifests
- Semantic search integration with MCP protocol
- Pagination support for large skill catalogs
- HTTP streaming mode with embedded web UI

### Multi-Language Ecosystem Support
- **Cross-Language Interoperability**: Support for skills written in different programming languages working together in the same runtime environment
- **Language Adapters**: Standardized skill interface adapters for different programming languages
- **Unified API Layer**: Abstracts underlying implementation details and provides consistent programming interfaces
- **Dependency Management**: Intelligent handling of dependency relationships and version conflicts in multi-language projects

### Multi-Language SDK Support
- **JavaScript/TypeScript SDK**: Complete Node.js and browser environment support
- **Python SDK**: Integration with popular Python AI and data science libraries
- **Java SDK**: Enterprise application and Android platform support
- **Go SDK**: High-performance concurrent processing and cloud-native application support
- **Rust SDK**: System-level performance and memory safety guarantees
- **C# SDK**: .NET ecosystem and Windows platform integration

## Core Features

### 🚀 High-Performance Execution
- **High Performance**: High-performance runtime based on Cangjie programming language
- **Strong Security**: WASM sandbox secure execution environment + multi-layer permission control security architecture
- **Standardization**: Fully compatible with AgentSkills open standard specifications

### 🔒 Security and Reliability
- **Execution Isolation**: Multi-layer security protection mechanism
- **Permission Control**: Fine-grained permission management and resource access control
- **Audit Tracking**: Complete operation logs and security audit mechanism

### 📦 Standard Compatibility
- Fully compatible with AgentSkills open standards
- Support for SKILL.md file format
- Implementation of standard YAML frontmatter specifications

### 🔧 Ease of Use
- **Simple Integration**: Provides clean API interfaces
- **Rich Examples**: Diverse usage examples and best practices
- **Comprehensive Documentation**: Complete Chinese and English technical documentation

### 🔧 Flexible Extension
- Plugin-based architecture design
- Support for custom skill development
- Rich API interfaces and tool sets

## Quick Start

### Environment Requirements
- Cangjie programming language environment (https://cangjie-lang.cn/)
- Supported operating systems: Windows/Linux/macOS

### Installation

```bash
# Ensure Cangjie programming language environment is installed
cjpm --version

# Clone the project
git clone https://atomgit.com/uctoo/agentskills-runtime.git
cd agentskills-runtime
```

### Running Examples
```bash
# Build the project
cjpm build

# Run examples
cjpm run --skip-build --name magic.examples.uctoo_api_mcp_server
cjpm run --skip-build --name magic.examples.uctoo_api_mcp_client
```

## Usage

### Creating Skills with DSL

```cangjie
import { Skill, Tool } from "agentskills-runtime";

@Skill(
  name = "hello-world",
  description = "A simple skill that greets users",
  license = "MIT",
  metadata = {
    author = "Your Name",
    version = "1.0.0",
    tags = ["greeting", "example"]
  }
)
public class HelloWorldSkill {
    @Tool(
      name = "greet",
      description = "Greet a user by name",
      parameters = [
        { name: "name", type: "string", required: true, description: "The name of the person to greet" }
      ]
    )
    public String greet(String name) {
        return "Hello, " + name + "!";
    }
}
```

### Loading Skills from SKILL.md

Create a `SKILL.md` file:

```markdown
---
name: example-skill
description: An example skill demonstrating the SKILL.md format
license: MIT
metadata:
  author: Your Name
  version: "1.0"
---

# Example Skill

This is an example skill that demonstrates the SKILL.md format.

## Tools Provided

### greet

Greet a user by name.

**Parameters:**
- `name` (required, string): The name of the person to greet

**Example:**
```bash
skill run example-skill:greet name=Alice
```
```

### Progressive Skill Loading

```cangjie
let skillDir = "path/to/skill/directory"
let loader = ProgressiveSkillLoader(skillBaseDirectory: skillDir)
let skillManager = CompositeSkillToolManager()
let skills = loader.loadSkillsToManager(skillManager)
```

### Multi-Language SDK Usage Examples

#### JavaScript/TypeScript Example
```javascript
import { AgentSkillsRuntime } from '@agentskills/runtime';

// Initialize runtime
const runtime = new AgentSkillsRuntime({
  baseUrl: 'http://localhost:8080',
  apiKey: 'your-api-key'
});

// Load and execute skill
const result = await runtime.executeSkill('example-skill', {
  name: 'Alice',
  age: 30
});

console.log('Execution result:', result);
```

#### Python Example
```python
from agentskills import Runtime

# Initialize runtime
runtime = Runtime(
    base_url="http://localhost:8080",
    api_key="your-api-key"
)

# Load and execute skill
result = runtime.execute_skill("example-skill", {
    "name": "Alice",
    "age": 30
})

print(f"Execution result: {result}")
```

#### Java Example
```java
import com.agentskills.Runtime;
import com.agentskills.SkillResult;

// Initialize runtime
Runtime runtime = Runtime.builder()
    .baseUrl("http://localhost:8080")
    .apiKey("your-api-key")
    .build();

// Load and execute skill
Map<String, Object> parameters = new HashMap<>();
parameters.put("name", "Alice");
parameters.put("age", 30);

SkillResult result = runtime.executeSkill("example-skill", parameters);
System.out.println("Execution result: " + result.getOutput());
```

## Development Guide

### Development Environment Setup

```bash
# Install dependencies
cjpm install

# Run tests
cjpm test

# Code checking
cjpm check
```

## Project Structure

```
apps/agentskills-runtime/
├── cjpm.toml                            # Cangjie package configuration
├── build.cj                             # Build script
├── README.md                            # Project documentation
├── README_cn.md                         # Chinese project documentation
├── LICENSE                              # License information
├── docs/                                # Documentation
│   ├── architecture.md                  # Architecture overview
│   ├── quickstart.md                    # Quick start guide
│   └── api-reference.md                 # API reference
├── src/                                 # Source code
│   ├── skill/                          # Skill-related functionality
│   │   ├── domain/                     # Skill domain models
│   │   ├── infrastructure/             # Skill infrastructure components
│   │   └── application/                # Skill application services
│   ├── security/                       # Security module
│   │   ├── wasm_sandbox/               # WASM sandbox
│   │   └── access_control/             # Access control
│   ├── runtime/                        # Runtime core
│   ├── utils/                          # Utility functions
│   └── examples/                       # Example implementations
├── specs/                               # Specification documents
├── skills/                              # Example and reference skills
├── sdk/                                 # Multi-language SDK implementations
│   ├── javascript/                     # JavaScript/TypeScript SDK
│   ├── python/                         # Python SDK
│   ├── java/                           # Java SDK
│   ├── go/                             # Go SDK
│   ├── rust/                           # Rust SDK
│   └── csharp/                         # C# SDK
└── tests/                               # Test implementations
```

## Dependencies

This implementation leverages existing libraries from the Cangjie ecosystem:
- `yaml4cj`: For parsing YAML frontmatter from SKILL.md files
- `commonmark4cj`: For processing markdown content in SKILL.md files according to CommonMark specification
- `stdx`: For various utility functions

### Multi-Language SDK Dependencies
Each language SDK depends on its respective ecosystem:
- **JavaScript**: npm package manager, depending on mainstream AI libraries like langchain, openai-api
- **Python**: pip package manager, depending on numpy, scikit-learn, transformers, etc.
- **Java**: Maven/Gradle, depending on Spring Boot, Apache HttpComponents
- **Go**: Go modules, depending on gin, gorilla/websocket, etc.
- **Rust**: Cargo, depending on tokio, serde, reqwest, etc.
- **C#**: NuGet, depending on .NET Core related packages

### Basic Usage

```cangjie
import magic.agentskills.runtime

// Create skill runtime instance
let runtime = SkillRuntime()

// Load skill
let skill = runtime.loadSkill("path/to/skill")

// Execute skill
let result = skill.execute(params)
```

### Skill Development Example
```cangjie
import magic.agentskills.runtime
import magic.agentskills.skill.domain.models.skill_manifest

// Define skill manifest
let manifest = SkillManifest {
    name: "example_skill",
    version: "1.0.0",
    description: "Example skill",
    author: "UCToo",
    parameters: [],
    implementation: "./skill_impl.cj"
}

// Create skill runtime
let runtime = SkillRuntime()

// Load and execute skill
let skill_result = runtime.execute(manifest, {})
```

## Documentation Resources

- [Complete Documentation](docs/)
- [API Reference](docs/api-reference.md)
- [Development Guide](docs/skill-development.md)

### Specification Driven Development Documents
- [AgentSkills Standard Specification](specs/003-agentskills-enhancement/spec.md)
- [Data Model Definition](specs/003-agentskills-enhancement/data-model.md)
- [Implementation Plan](specs/003-agentskills-enhancement/plan.md)

## Contribution Guide

Welcome to contribute to the project! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for details.

Please refer to the contribution guidelines in the documentation.

### Contribution Methods
1. **Code Contribution**: Submit Pull Request to improve code
2. **Documentation Improvement**: Help improve technical documentation and usage guides
3. **Issue Feedback**: Report bugs or propose feature suggestions
4. **Skill Development**: Develop new skill examples
5. **SDK Development**: Develop SDKs for new programming languages
6. **Language Adapters**: Develop new language adapters and bindings
7. **Ecosystem Integration**: Integrate mainstream development tools and platforms

### Development Process
```bash
# Fork the project
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git commit -am 'Add new feature'

# Push branch
git push origin feature/your-feature

# Create Pull Request
```

## Project Status

- [x] Core runtime implementation
- [x] Security sandbox mechanism
- [x] Standard compatibility verification
- [ ] Performance optimization
- [ ] Production environment deployment
- [ ] Community ecosystem building

## Overall Process and Key Technologies

### Core Workflow

1. **Skill Discovery and Loading**
   - Automatically scan skill files in configuration directories
   - Parse YAML frontmatter of SKILL.md files
   - Validate skill format and dependency relationships

2. **Secure Execution Environment**
   - WASM sandbox provides isolated execution environment
   - Capability-based permission control system
   - Resource usage monitoring and limitations

3. **Skill Execution and Orchestration**
   - Dynamic parameter parsing and validation
   - Inter-skill dependency relationship management
   - Execution result collection and processing

### Key Technology Components

- **Skill Manifest Parser**: Parse and validate SKILL.md file format
- **WASM Runtime**: Secure skill execution environment
- **Capability Manager**: Fine-grained permission control system
- **Resource Monitor**: Resource usage monitoring and quota management
- **Dependency Resolver**: Skill dependency relationship resolution
- **Execution Orchestrator**: Skill execution orchestration engine

## License

This project uses the MIT license. See [LICENSE](LICENSE) file for details.

## Contact Information

- Project Homepage: https://atomgit.com/uctoo/agentskills-runtime
- Issue Feedback: https://atomgit.com/uctoo/agentskills-runtime/issues
- Email Contact: contact@uctoo.com
- WeChat Group: Please get the QR code through the project homepage

## Acknowledgements

Thanks for the support from the following open source projects and communities:

### Technical Standards
- [AgentSkills Open Standard](https://github.com/agentskills/agentskills)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)

### Programming Languages
- [Cangjie Programming Language](https://cangjie-lang.cn/)
- [WebAssembly](https://webassembly.org/)


### Open Source Tools
- [UCToo](https://gitee.com/uctoo/uctoo)
- [CangjieMagic](https://gitcode.com/Cangjie-TPC/CangjieMagic)
- Various excellent open source libraries and tools

### References
- [Developing Powerful Agents with Cangjie Using Only Free AI](https://mp.weixin.qq.com/s/jcUVuj7bLs9DaHLhol4-Hg)
- [In-depth Analysis of Agent Skill Standards](https://mp.weixin.qq.com/s/qFae5uqJsOAEkn1LN12tuA)

---
**AgentSkills Runtime - Making AI Development Simpler, Safer, and Faster!**