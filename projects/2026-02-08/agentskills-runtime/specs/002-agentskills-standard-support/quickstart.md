# Quick Start: Agentskills Standard Support in CangjieMagic Framework

## Overview

This guide provides a quick introduction to implementing and using the agentskills standard in the CangjieMagic framework. The implementation follows the same three-tier architecture as other components in the framework.

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

## Getting Started

### 1. Define a Skill using the @skill DSL Macro

Create a skill using the `@skill` macro that follows the agentskills standard:

```cangjie
@skill(
    name: "greeting-skill",
    description: "A simple skill that generates personalized greetings",
    parameters: {
        name: "The name of the person to greet"
    }
)
public class GreetingSkill {
    public func execute(name: String): String {
        return "Hello, ${name}! Welcome to the CangjieMagic framework."
    }
}
```

### 2. Load Skills from SKILL.md Files

Skills can also be loaded from standard SKILL.md files:

```cangjie
// Create a skill loader
let skillLoader = SkillLoader()

// Load skills from a directory
let skills = skillLoader.loadSkillsFromDirectory("./skills")

// Register skills with the skill manager
let skillManager = SkillManager()
skillManager.addSkills(skills)
```

### 3. Integrate Skills with Existing Tools

Skills implement the `Tool` interface, so they can be used with existing tool managers:

```cangjie
// Skills can be added to existing ToolManager instances
let toolManager = SimpleToolManager([])
toolManager.addTool(greetingSkill)

// Use in an agent that already supports tools
let myAgent = MyAgent()
myAgent.toolManager.addTool(greetingSkill)
```

### 4. Create Skill Sets

Group related skills into skill sets:

```cangjie
// Create a skill set
let communicationSkills = SkillSet("communication", "Skills for communication tasks")

// Add skills to the set
communicationSkills.addSkill(greetingSkill)
communicationSkills.addSkill(farewellSkill)

// Use the skill set
let agent = MyAgent()
agent.toolManager.addTools(communicationSkills.tools)
```

## File Structure

When creating skills following the agentskills standard, use this directory structure:

```
my-skill/
├── SKILL.md              # Required: YAML frontmatter + Markdown instructions
├── scripts/              # Optional: executable scripts
│   ├── helper.py
│   └── utility.sh
├── references/           # Optional: additional documentation
│   └── REFERENCE.md
└── assets/               # Optional: static resources
    ├── template.docx
    └── logo.png
```

Example SKILL.md:
```yaml
---
name: my-skill
description: A skill that performs a specific task
license: MIT
metadata:
  author: example-org
  version: "1.0"
---
# My Skill

This skill performs a specific task.

## Instructions

1. Step one
2. Step two
3. Step three
```

## Integration with Existing Framework

The skill implementation maintains compatibility with existing CangjieMagic components:

- Skills implement the `Tool` interface
- Skill sets implement the `Toolset` interface
- Skill managers implement the `ToolManager` interface
- Existing agents can use skills without modification

## Best Practices

1. **Follow the agentskills standard**: Ensure your SKILL.md files follow the specification
2. **Use descriptive names**: Skill names should be 1-64 characters, lowercase, with hyphens only
3. **Provide clear descriptions**: Descriptions should be 1-1024 characters and explain both what the skill does and when to use it
4. **Maintain compatibility**: Skills should work with existing ToolManager and Agent implementations
5. **Validate skills**: Use the SkillValidator to ensure compliance with the agentskills standard
6. **Review examples**: Check the `apps\CangjieMagic\src\examples\skill_examples` directory for practical implementations

## Example Directory

The CangjieMagic framework includes example skills in the `apps\CangjieMagic\src\examples\skill_examples` directory. These examples demonstrate:

- Basic skill implementations using the `@skill` DSL macro
- SKILL.md file formatting that complies with the agentskills standard
- Integration with existing tool managers and agents
- Best practices for skill development and validation

To explore these examples:
1. Navigate to `apps\CangjieMagic\src\examples\skill_examples`
2. Review the example skill implementations
3. Use these as templates for your own skill development

## Creating New Skills

### Using the Template Generator

You can use the SkillTemplateGenerator to create new skills:

```cangjie
// Generate a SKILL.md template
let success = SkillTemplateGenerator.generateSkillTemplate(
    name: "my-new-skill",
    description: "A skill that performs a specific task",
    outputPath: "./skills"
)

// Generate a Cangjie skill class template
let success2 = SkillTemplateGenerator.generateCangjieSkillTemplate(
    name: "my-new-skill",
    description: "A skill that performs a specific task",
    outputPath: "./src/skills"
)
```

### Implementing a Custom Skill

To implement a custom skill, extend the BaseSkill class:

```cangjie
import magic.skill.BaseSkill
import magic.core.tool.ToolParameter
import magic.jsonable.TypeSchema
import std.collection.HashMap
import stdx.encoding.json.JsonValue

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
            skillPath: "./my-custom-skill",
            parameters: [
                ToolParameter("param1", "Description of parameter 1", TypeSchema.Str),
                ToolParameter("param2", "Description of parameter 2", TypeSchema.Num)
            ]
        )
    }

    override public func execute(args: HashMap<String, JsonValue>): String {
        // Implement skill execution logic here
        return "Executed my custom skill"
    }
}
```

### Using Skills with SkillManager

Once you've created your skills, you can use them with the SkillManager:

```cangjie
// Create a skill manager
let skillManager = SimpleSkillManager()

// Add your custom skill
let mySkill = MyCustomSkill()
skillManager.addSkill(mySkill)

// Execute the skill
let args = HashMap<String, JsonValue>()
args.add("param1", JsonValue.StringValue("value1"))
args.add("param2", JsonValue.NumberValue(42.0))

if (let Some(tool) <- skillManager.findTool("my-custom-skill")) {
    let response = tool.invoke(args)
    print(response.content)
}
```