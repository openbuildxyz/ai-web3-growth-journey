/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.skill_examples

import magic.skill.BaseSkill
import std.collection.HashMap
import stdx.encoding.json.JsonValue

/**
 * Example greeting skill implementation following the agentskills standard
 */
public class GreetingSkill <: BaseSkill {
    public init() {
        super(
            name: "greeting-skill",
            description: "A simple skill that generates personalized greetings",
            license: Some("MIT"),
            compatibility: None,
            metadata: HashMap<String, String>([("author", "CangjieMagic"), ("version", "1.0")]),
            allowedTools: None,
            instructions: "# Greeting Skill\n\nThis skill generates personalized greetings for users.",
            skillPath: "./greeting-skill"
        )
    }

    override public func execute(args: HashMap<String, JsonValue>): String {
        let name = if (let Some(nameValue) <- args.get("name")) {
            let strValue = nameValue.toString()
            if (strValue.startsWith("\"") && strValue.endsWith("\"")) {
                strValue[1..(strValue.size - 1)]
            } else {
                strValue
            }
        } else {
            "Friend"
        }
        return "Hello, ${name}! Welcome to the CangjieMagic framework."
    }
}