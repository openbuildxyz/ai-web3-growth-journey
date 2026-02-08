# Skill Examples

This directory contains example implementations of skills that conform to the [agentskills standard](https://agentskills.io). These examples demonstrate how to create and use skills in the CangjieMagic framework.

## Overview

The skill examples showcase the implementation of the agentskills standard within the CangjieMagic framework. The examples include:

- **GreetingSkill**: A simple skill that generates personalized greetings
- **CalculatorSkill**: A skill that performs basic mathematical calculations
- **SkillExecutionTests**: Tests demonstrating how to execute skills

## File Structure

```
skill_examples/
├── greeting_skill.cj        # Implementation of a greeting skill
├── calculator_skill.cj      # Implementation of a calculator skill
├── skill_execution_tests.cj # Tests for skill execution
├── main.cj                  # Entry point for the example application
└── README.md               # This file
```

## Usage

To run the skill examples:

```bash
cjpm run --name magic.examples.skill_examples
```

This will execute the example skills and demonstrate:
- GreetingSkill generating personalized greetings
- CalculatorSkill performing mathematical operations
- Error handling (e.g., division by zero)
- Skill metadata display

## Agentskills Standard Compliance

All skills in this example follow the agentskills standard specification:

- Skills are defined with required fields: `name`, `description`
- Optional fields are properly handled: `license`, `compatibility`, `metadata`, `allowedTools`
- Skills implement the proper interfaces to work with the CangjieMagic framework
- Skills can be loaded from SKILL.md files or defined directly in code

## Creating Your Own Skills

To create your own skill following the agentskills standard:

1. Extend the `BaseSkill` class (which inherits from `AbsSkill` rather than `Tool`)
2. Implement the required properties: `name`, `description`, etc.
3. Override the `execute` method with your skill's functionality
4. Use the `@skill` DSL macro for advanced features if needed

Example:
```cangjie
public class MyCustomSkill <: BaseSkill {
    public init() {
        super(
            name: "my-custom-skill",
            description: "A custom skill that performs a specific task",
            license: Some("MIT"),
            compatibility: None,
            metadata: HashMap<String, String>([("author", "Your Name"), ("version", "1.0")]),
            allowedTools: None,
            instructions: "# My Custom Skill\n\nThis skill performs a specific task.",
            skillPath: "./my-custom-skill"
        )
    }

    override public func execute(args: HashMap<String, JsonValue>): String {
        // Implement your skill's functionality here
        return "Executed my custom skill"
    }
}
```

## Integration with CangjieMagic Framework

The skills integrate seamlessly with the existing CangjieMagic framework:

- Skills integrate with `ToolManager` through the `SkillToToolAdapter` adapter
- Skills no longer directly implement the `Tool` interface, but use adapter pattern for compatibility
- Skills can be used by agents that already support tools through the adapter
- Skills follow the same architectural patterns as other components in the framework

## Architecture Changes

The refactored skill system adopts a new architecture:

- **AbsSkill**: Independent abstract base class that does not inherit from the `Tool` interface
- **SkillToToolAdapter**: Adapter pattern that enables skills to work with the existing `ToolManager`
- **BaseSkill**: Inherits from `AbsSkill` to provide base implementation
- This design resolves the previous mixing of skills and tools, providing clearer separation of concerns