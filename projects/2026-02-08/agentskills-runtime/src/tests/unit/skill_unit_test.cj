/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.tests.unit

import magic.skill.domain.models.{SkillManifest, SkillParameter}
import std.collection.HashMap

/**
 * Basic unit tests for the skill models
 */
public class SkillUnitTest {
    /**
     * Test creating a SkillManifest instance
     */
    public static func testSkillManifestCreation(): Bool {
        try {
            let metadata = HashMap<String, String>()
            metadata.add("author", "test-author")
            metadata.add("version", "1.0")
            
            let parameters = Array<SkillParameter>()
            
            let skillManifest = SkillManifest(
                name: "test-skill",
                description: "A test skill for validation",
                license: Some("MIT"),
                compatibility: Some("Cangjie 1.0.0"),
                metadata: metadata,
                allowedTools: Some("basic-tools"),
                instructions: "# Test Skill\n\nThis is a test skill.",
                skillPath: "/path/to/test/skill",
                scriptsDirExists: true,
                referencesDirExists: false,
                assetsDirExists: true,
                parameters: parameters
            )
            
            assert(skillManifest.name == "test-skill")
            assert(skillManifest.description == "A test skill for validation")
            assert(skillManifest.license.isSome())
            assert(skillManifest.compatibility.isSome())
            assert(skillManifest.metadata.containsKey("author"))
            assert(skillManifest.instructions.contains("Test Skill"))
            
            return true
        } catch (ex: Exception) {
            println("Error in testSkillManifestCreation: ${ex.message}")
            return false
        }
    }

    /**
     * Test creating a SkillParameter instance
     */
    public static func testSkillParameterCreation(): Bool {
        try {
            let param = SkillParameter(
                name: "test-param",
                type: "String",
                description: "A test parameter",
                required: true,
                defaultValue: Some("default-value")
            )
            
            assert(param.name == "test-param")
            assert(param.type == "String")
            assert(param.description == "A test parameter")
            assert(param.required == true)
            assert(param.defaultValue.isSome())
            
            return true
        } catch (ex: Exception) {
            println("Error in testSkillParameterCreation: ${ex.message}")
            return false
        }
    }

    /**
     * Run all unit tests
     */
    public static func runAllTests(): Bool {
        println("Running Skill Unit Tests...")
        
        let test1Passed = testSkillManifestCreation()
        println("SkillManifest creation test: ${if (test1Passed) { "PASSED" } else { "FAILED" }}")
        
        let test2Passed = testSkillParameterCreation()
        println("SkillParameter creation test: ${if (test2Passed) { "PASSED" } else { "FAILED" }}")
        
        let allPassed = test1Passed && test2Passed
        println("All tests passed: ${allPassed}")
        
        return allPassed
    }
}