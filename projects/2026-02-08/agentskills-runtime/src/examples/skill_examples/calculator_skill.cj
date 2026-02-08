/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.skill_examples

import magic.skill.BaseSkill
import std.collection.HashMap
import stdx.encoding.json.JsonValue
import std.convert.Parsable

/**
 * Example calculator skill implementation following the agentskills standard
 */
public class CalculatorSkill <: BaseSkill {
    public init() {
        super(
            name: "calculator-skill",
            description: "A skill that performs basic mathematical calculations",
            license: Some("MIT"),
            compatibility: None,
            metadata: HashMap<String, String>([("author", "CangjieMagic"), ("version", "1.0")]),
            allowedTools: None,
            instructions: "# Calculator Skill\n\nThis skill performs basic mathematical calculations like addition, subtraction, multiplication, and division.",
            skillPath: "./calculator-skill"
        )
    }

    override public func execute(args: HashMap<String, JsonValue>): String {
        let operation = if (let Some(opValue) <- args.get("operation")) {
            let strValue = opValue.toString()
            if (strValue.startsWith("\"") && strValue.endsWith("\"")) {
                strValue[1..(strValue.size - 1)]
            } else {
                strValue
            }
        } else {
            "add"
        }

        let a = if (let Some(aValue) <- args.get("a")) {
            let strValue = aValue.toString()
            let cleanValue = if (strValue.startsWith("\"") && strValue.endsWith("\"")) {
                strValue[1..(strValue.size - 1)]
            } else {
                strValue
            }
            try {
                Float64.parse(cleanValue)
            } catch (ex: Exception) {
                0.0
            }
        } else {
            0.0
        }

        let b = if (let Some(bValue) <- args.get("b")) {
            let strValue = bValue.toString()
            let cleanValue = if (strValue.startsWith("\"") && strValue.endsWith("\"")) {
                strValue[1..(strValue.size - 1)]
            } else {
                strValue
            }
            try {
                Float64.parse(cleanValue)
            } catch (ex: Exception) {
                0.0
            }
        } else {
            0.0
        }

        let result = match (operation.toAsciiLower()) {
            case "add" => a + b
            case "subtract" => a - b
            case "multiply" => a * b
            case "divide" => if (b != 0.0) { a / b } else { Float64.NaN }
            case _ => a + b  // default to addition
        }

        if (result.isNaN()) {
            return "Error: Division by zero"
        }

        return "Result of ${a} ${operation} ${b} = ${result}"
    }
}