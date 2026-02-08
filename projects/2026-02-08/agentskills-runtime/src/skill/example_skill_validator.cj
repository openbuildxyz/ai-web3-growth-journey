/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.Skill
import std.collection.ArrayList

/**
 * Validates example skills to ensure they conform to agentskills standard
 */
public class ExampleSkillValidator {
    /**
     * Validate a collection of example skills
     */
    public static func validateExampleSkills(skills: Collection<Skill>): (Bool, Array<String>) {
        let issues = ArrayList<String>()
        let validator = StandardSkillValidator()
        
        for (skill in skills) {
            let (isValid, skillIssues) = validator.validateSkill(skill)
            if (!isValid) {
                for (issue in skillIssues) {
                    issues.add("Skill '${skill.name}': ${issue}")
                }
            }
        }
        
        return (issues.isEmpty(), issues.toArray())
    }

    /**
     * Validate example skills from a directory
     */
    public static func validateExampleSkillsFromDirectory(directoryPath: String): (Bool, Array<String>) {
        let loader = SkillLoader(skillDirectory: directoryPath)
        let skills = loader.loadSkills()
        return validateExampleSkills(skills)
    }

    /**
     * Validate a single example skill
     */
    public static func validateExampleSkill(skill: Skill): (Bool, Array<String>) {
        let validator = StandardSkillValidator()
        return validator.validateSkill(skill)
    }
}