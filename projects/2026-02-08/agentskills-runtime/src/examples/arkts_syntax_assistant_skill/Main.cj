/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.arkts_syntax_assistant_skill

import magic.examples.arkts_syntax_assistant_skill.src.ArkTSSyntaxAssistantSkillFactory
import magic.skill.application.ProgressiveSkillLoader

/**
 * Entry point for the ArkTS Syntax Assistant Skill
 * This registers the skill factory with the ProgressiveSkillLoader
 */
main(): Unit {
    // The skill will be loaded via the progressive loading mechanism
    // This main function is just a placeholder to ensure the skill gets compiled
    println("ArkTS Syntax Assistant Skill module loaded")
}