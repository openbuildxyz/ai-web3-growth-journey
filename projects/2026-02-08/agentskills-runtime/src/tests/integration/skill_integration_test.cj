/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.tests.integration

import magic.skill.application.{SkillLoadingService, SkillValidationService}
import magic.skill.domain.models.ValidationResult
import magic.skill.infrastructure.loaders.{SkillMdLoader, YamlFrontmatterParser}
import magic.skill.infrastructure.utils.{YamlUtils, MarkdownUtils}
import std.collection.HashMap

/**
 * Integration tests for the skill system components
 */
public class SkillIntegrationTest {
    /**
     * Test YAML parsing functionality
     */
    public static func testYamlParsing(): Bool {
        try {
            let yamlContent = """---
name: test-skill
description: A test skill for integration testing
license: MIT
metadata:
  author: Test Author
  version: "1.0"
---
# Test Skill

This is a test skill for integration testing.
"""
            
            let yamlParser = YamlFrontmatterParser()
            let resultOpt = yamlParser.parseYamlFrontmatter(yamlContent)
            
            if (resultOpt.isNone()) {
                println("YAML parsing failed - no result returned")
                return false
            }
            
            let result = resultOpt.getOrThrow()
            
            assert(result.name == "test-skill")
            assert(result.description == "A test skill for integration testing")
            assert(result.license.isSome())
            assert(result.metadata.containsKey("author"))
            assert(result.metadata.containsKey("version"))
            
            return true
        } catch (ex: Exception) {
            println("Error in testYamlParsing: ${ex.message}")
            return false
        }
    }

    /**
     * Test markdown processing functionality
     */
    public static func testMarkdownProcessing(): Bool {
        try {
            let markdownContent = """# Test Skill

This is a test skill for integration testing.

## Parameters
- param1: First parameter
- param2: Second parameter

## Examples
- Example 1: {"param1": "value1"}
- Example 2: {"param1": "value1", "param2": "value2"}
"""
            
            let processedContent = MarkdownUtils.parseMarkdownContent(markdownContent)
            
            // Basic validation - the processed content should contain the original content
            if (!processedContent.contains("Test Skill")) {
                println("Markdown processing failed - title not found")
                return false
            }
            
            return true
        } catch (ex: Exception) {
            println("Error in testMarkdownProcessing: ${ex.message}")
            return false
        }
    }

    /**
     * Test skill validation functionality
     */
    public static func testSkillValidation(): Bool {
        try {
            let validationService = SkillValidationService()
            
            // Test valid skill name
            let (validName, _) = validationService.validateSkillName("valid-skill-name")
            if (!validName) {
                println("Skill name validation failed for valid name")
                return false
            }
            
            // Test invalid skill name (too long)
            let longName = "a".repeat(65)  // 65 characters, exceeding the 64 limit
            let (invalidName, _) = validationService.validateSkillName(longName)
            if (invalidName) {
                println("Skill name validation passed for invalid name (too long)")
                return false
            }
            
            // Test valid skill description
            let (validDesc, _) = validationService.validateSkillDescription("Valid skill description")
            if (!validDesc) {
                println("Skill description validation failed for valid description")
                return false
            }
            
            // Test invalid skill description (empty)
            let (invalidDesc, _) = validationService.validateSkillDescription("")
            if (invalidDesc) {
                println("Skill description validation passed for invalid description (empty)")
                return false
            }
            
            return true
        } catch (ex: Exception) {
            println("Error in testSkillValidation: ${ex.message}")
            return false
        }
    }

    /**
     * Run all integration tests
     */
    public static func runAllTests(): Bool {
        println("Running Skill Integration Tests...")
        
        let test1Passed = testYamlParsing()
        println("YAML parsing test: ${if (test1Passed) { "PASSED" } else { "FAILED" }}")
        
        let test2Passed = testMarkdownProcessing()
        println("Markdown processing test: ${if (test2Passed) { "PASSED" } else { "FAILED" }}")
        
        let test3Passed = testSkillValidation()
        println("Skill validation test: ${if (test3Passed) { "PASSED" } else { "FAILED" }}")
        
        let allPassed = test1Passed && test2Passed && test3Passed
        println("All integration tests passed: ${allPassed}")
        
        return allPassed
    }
}