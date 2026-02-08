# Skill Development Templates and Scaffolding

This document provides templates and scaffolding for developing skills for the CangjieMagic Agent Skill Runtime.

## Basic SKILL.md Template

```markdown
---
name: my-awesome-skill
description: A skill that performs amazing tasks
license: MIT
metadata:
  author: Your Name
  version: "1.0.0"
  tags: ["utility", "example"]
allowed-tools: network, filesystem
---

# My Awesome Skill

This skill performs amazing tasks that help users accomplish their goals.

## Tools Provided

### perform-task

Perform an amazing task with the given parameters.

**Parameters:**
- `input` (required, string): The input to process
- `options` (optional, string): Additional options for processing

**Examples:**
```bash
skill run my-awesome-skill:perform-task input="Hello, world!" options="--verbose"
```

## Guidelines

- Use this skill to perform amazing tasks
- The input parameter is required
- Options are optional and default to standard processing

## Security Considerations

- This skill only accesses local resources
- No external network connections required unless explicitly allowed
```

## Cangjie Skill Class Template

```cangjie
/*
 * Copyright (c) Your Company. All rights reserved.
 */
package magic.skills

import magic.dsl.skill
import std.collection.HashMap
import stdx.encoding.json.{JsonValue, JsonObject, JsonString}

/**
 * MyAwesomeSkill - A skill that performs amazing tasks
 */
@skill(
    name = "my-awesome-skill",
    description = "A skill that performs amazing tasks",
    license = "MIT",
    metadata = {
        author = "Your Name",
        version = "1.0.0",
        tags = ["utility", "example"]
    },
    allowedTools = ["network", "filesystem"]
)
public class MyAwesomeSkill {
    /**
     * Perform an amazing task with the given parameters
     */
    @tool(
        name = "perform-task",
        description = "Perform an amazing task with the given parameters",
        parameters = [
            { name: "input", type: "string", required: true, description: "The input to process" },
            { name: "options", type: "string", required: false, description: "Additional options for processing" }
        ]
    )
    public String performTask(String input, String options = "") {
        // Implement the skill logic here
        return "Processed input: ${input} with options: ${options}";
    }
}
```

## Skill Project Structure

```
my-skill-project/
├── SKILL.md                 # Skill definition following agentskills standard
├── src/                     # Source code for the skill
│   ├── main.cj              # Main skill implementation
│   └── utils.cj             # Utility functions
├── tests/                   # Test implementations
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── docs/                    # Documentation
│   └── usage.md             # Usage instructions
├── scripts/                 # Scripts for the skill (if needed)
├── references/              # Reference materials (if needed)
├── assets/                  # Assets for the skill (if needed)
├── cjpm.toml               # Cangjie package configuration
├── build.cj                # Build script
└── README.md               # Project documentation
```

## Testing Templates

### Unit Test Template
```cangjie
/*
 * Unit tests for MyAwesomeSkill
 */
package magic.skills.tests.unit

import magic.skills.MyAwesomeSkill
import std.testing.Test

@Test
public class MyAwesomeSkillTest {
    @Test
    public func testPerformTask(): Unit {
        let skill = MyAwesomeSkill()
        let result = skill.performTask("test input")
        
        assert(result.contains("test input"))
    }
}
```

### Integration Test Template
```cangjie
/*
 * Integration tests for MyAwesomeSkill
 */
package magic.skills.tests.integration

import magic.skills.MyAwesomeSkill
import std.testing.Test

@Test
public class MyAwesomeSkillIntegrationTest {
    @Test
    public func testSkillExecution(): Unit {
        // Test the skill in the context of the skill runtime
        // This would involve setting up the skill runtime and executing the skill
    }
}
```

## Configuration Template

### cjpm.toml
```toml
[package]
name = "my-awesome-skill"
version = "1.0.0"
description = "A skill that performs amazing tasks"
authors = ["Your Name <your.email@example.com>"]

[dependencies]
cangjiemagic = "1.0.0"

[build]
target = "wasm32-wasi"
features = ["component-model"]
```

## Build Script Template

### build.cj
```cangjie
/*
 * Build script for MyAwesomeSkill
 */
package build

import std.fs.Path
import std.process.Process
import std.collection.HashMap

public func main(args: Array<String>): Unit {
    println("Building MyAwesomeSkill...")
    
    // Compile the skill
    let compileResult = Process.exec([
        "cjc",
        "--target", "wasm32-wasi",
        "--feature", "component-model",
        "src/main.cj",
        "-o", "dist/my-awesome-skill.wasm"
    ])
    
    if (compileResult.exitCode == 0) {
        println("Build successful!")
    } else {
        println("Build failed: ${compileResult.stderr}")
    }
}
```

## Documentation Template

### README.md
```markdown
# My Awesome Skill

This skill performs amazing tasks that help users accomplish their goals.

## Installation

```bash
skill install --path /path/to/my-awesome-skill
```

Or from Git:

```bash
skill install --git https://github.com/user/my-awesome-skill.git
```

## Usage

```bash
skill run my-awesome-skill:perform-task input="Hello, world!" options="--verbose"
```

## Tools

### perform-task

Perform an amazing task with the given parameters.

- `input` (required): The input to process
- `options` (optional): Additional options for processing

## Development

To run tests:

```bash
cjpm test
```

To build:

```bash
cjpm build
```

## License

This skill is licensed under the MIT License.
```

## Skill Development Best Practices

1. **Security First**: Always consider security implications when designing your skill
2. **Clear Documentation**: Provide clear usage examples and parameter descriptions
3. **Error Handling**: Implement proper error handling and return meaningful error messages
4. **Testing**: Write comprehensive unit and integration tests
5. **Performance**: Optimize for performance, especially for frequently called skills
6. **Modularity**: Design skills to be modular and reusable
7. **Validation**: Validate all inputs to prevent injection and other security issues
8. **Logging**: Implement appropriate logging for debugging and monitoring
```