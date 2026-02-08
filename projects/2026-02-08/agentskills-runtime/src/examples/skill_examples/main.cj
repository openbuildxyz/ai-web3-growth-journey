/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.skill_examples

import magic.skill.{BaseSkill, SimpleSkillManager}
import magic.core.skill.Skill
import std.collection.HashMap
import stdx.encoding.json.{JsonValue, JsonString, JsonFloat}
import std.io.*
import magic.core.tool.Tool
import magic.skill.application.ProgressiveSkillLoader
import magic.skill.CompositeSkillToolManager
import magic.examples.arkts_syntax_assistant_skill.src.ArkTSSyntaxAssistantSkillFactory

/**
 * Main entry point for the skill examples demonstration
 */
main() {
    println("Starting Agentskills Standard Demonstration...")

    // Create example skills
    let greetingSkill = GreetingSkill()
    let calculatorSkill = CalculatorSkill()

    // Demonstrate greeting skill directly
    println("\n--- Testing Greeting Skill ---")
    let greetingArgs = HashMap<String, JsonValue>()
    greetingArgs.add("name", JsonString("Alice"))

    let greetingResult = greetingSkill.execute(greetingArgs)
    println("Greeting Skill Response: ${greetingResult}")

    // Demonstrate calculator skill with addition
    println("\n--- Testing Calculator Skill (Addition) ---")
    let calcAddArgs = HashMap<String, JsonValue>()
    calcAddArgs.add("operation", JsonString("add"))
    calcAddArgs.add("a", JsonFloat(5.0))
    calcAddArgs.add("b", JsonFloat(3.0))

    let calcResult = calculatorSkill.execute(calcAddArgs)
    println("Calculator Skill (Add) Response: ${calcResult}")

    // Demonstrate calculator skill with division by zero (error case)
    println("\n--- Testing Calculator Skill (Division by Zero) ---")
    let calcDivArgs = HashMap<String, JsonValue>()
    calcDivArgs.add("operation", JsonString("divide"))
    calcDivArgs.add("a", JsonFloat(10.0))
    calcDivArgs.add("b", JsonFloat(0.0))

    let calcDivResult = calculatorSkill.execute(calcDivArgs)
    println("Calculator Skill (Divide by Zero) Response: ${calcDivResult}")

    // Demonstrate loading and using arkts-syntax-assistant skill
    println("\n--- Testing ArkTS Syntax Assistant Skill ---")
    try {
        // Define the path to the examples directory containing the arkts-syntax-assistant skill
        let examplesDir = "D:/UCT/projects/miniapp/uctoo/Delivery/uctoo-admin/apps/CangjieMagic/src/examples"

        // Create a ProgressiveSkillLoader to load skills from the examples directory
        let skillLoader = ProgressiveSkillLoader(skillBaseDirectory: examplesDir)

        // Register the factory for our enhanced ArkTS skill before loading skills
        // This ensures our implementation takes precedence over any basic skill
        let skillRegistry = skillLoader.getSkillRegistry()
        skillRegistry.registerFactory("arkts-syntax-assistant", ArkTSSyntaxAssistantSkillFactory())

        // Create a skill manager
        let skillManager = CompositeSkillToolManager()

        println("Starting progressive skill loading from: ${examplesDir}")

        // Load skills using the progressive loader
        let skills = skillLoader.loadSkillsToManager(skillManager)
        println("Successfully loaded ${skills.size} skills")

        // Look for the arkts-syntax-assistant skill
        let arktsSkillOpt = skillManager.getSkill("arkts-syntax-assistant")
        if (arktsSkillOpt.isSome()) {
            let arktsSkill = arktsSkillOpt.getOrThrow()
            println("Found ArkTS Syntax Assistant skill: ${arktsSkill.name}")
            println("Description: ${arktsSkill.description}")

            // Execute the skill with a sample query about variable declaration
            let arktsArgs = HashMap<String, JsonValue>()
            arktsArgs.add("query", JsonString("How to declare a variable in ArkTS?"))

            let arktsResult = arktsSkill.execute(arktsArgs)

            // Check if the result is just an echo of the arguments (indicating a basic skill)
            if (arktsResult.contains("executed with arguments")) {
                println("ArkTS Syntax Assistant returned basic echo response, indicating limited functionality")
                println("Raw response: ${arktsResult}")
            } else {
                // If it's a more meaningful response, display it
                println("ArkTS Syntax Assistant Response: ${arktsResult}")
            }

            // Test another query about functions
            println("\nTesting function declaration query...")
            let functionArgs = HashMap<String, JsonValue>()
            functionArgs.add("query", JsonString("How to declare a function in ArkTS?"))
            let functionResult = arktsSkill.execute(functionArgs)
            if (!functionResult.contains("executed with arguments")) {
                println("Function Declaration Response: ${functionResult}")
            } else {
                println("Function query returned basic echo response")
            }
        } else {
            println("ArkTS Syntax Assistant skill not found in loaded skills")
            // List all loaded skills for debugging
            println("Available skills in manager:")
            // Get all available skills from the manager
            let availableSkills = skillManager.availableSkills
            for ((skillName, skill) in availableSkills) {
                println("- ${skill.name}: ${skill.description}")
            }
        }
    } catch (ex: Exception) {
        println("Error loading or executing arkts-syntax-assistant skill: ${ex.message}")
        ex.printStackTrace()
    }

    // Show available skills
    println("\n--- Available Skills ---")
    println("- ${greetingSkill.name}: ${greetingSkill.description}")
    println("- ${calculatorSkill.name}: ${calculatorSkill.description}")

    println("\nAgentskills Standard Demonstration Completed!")
}