/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill.examples

import magic.skill.application.ProgressiveSkillLoader
import magic.skill.CompositeSkillToolManager

main(): Unit {
    // Define the path to the examples directory
    let examplesDir = "D:/UCT/projects/miniapp/uctoo/Delivery/uctoo-admin/apps/CangjieMagic/src/examples"

    // Create a ProgressiveSkillLoader instance
    let loader = ProgressiveSkillLoader(skillBaseDirectory: examplesDir)

    // Create a skill manager
    let skillManager = CompositeSkillToolManager()

    // Starting progressive skill loading from examplesDir

    // Load skills using the progressive loader
    let skills = loader.loadSkillsToManager(skillManager)

    // Successfully loaded skills
    for (skill in skills) {
        // Process skill name and description
    }

    // Skill loading completed.

    // Test getting loaded skills
    let loadedSkills = loader.getLoadedSkills()
    // Total loaded skills in loader
}