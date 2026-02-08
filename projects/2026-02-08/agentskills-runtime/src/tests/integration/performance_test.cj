/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.tests.integration

import magic.skill.application.{SkillLoadingService, SkillValidationService}
import magic.skill.domain.models.SkillManifest
import magic.skill.infrastructure.loaders.YamlFrontmatterParser
import magic.skill.infrastructure.utils.{YamlUtils, MarkdownUtils}
import std.collection.HashMap
import std.time.DateTime

/**
 * Performance tests for the skill system components
 */
public class PerformanceTest {
    /**
     * Test YAML parsing performance
     */
    public static func testYamlParsingPerformance(): Bool {
        try {
            let yamlContent = """---
name: performance-test-skill
description: A skill for testing YAML parsing performance
license: MIT
metadata:
  author: Performance Test
  version: "1.0"
  category: testing
  tags:
    - performance
    - test
compatibility: Cangjie 1.0.0
allowed-tools: basic-tools,advanced-tools
---
# Performance Test Skill

This is a skill designed to test the performance of YAML parsing and other operations.

## Parameters
- param1: First test parameter
- param2: Second test parameter
- param3: Third test parameter
- param4: Fourth test parameter
- param5: Fifth test parameter

## Examples
- Example 1: {"param1": "value1", "param2": "value2"}
- Example 2: {"param1": "value1", "param2": "value2", "param3": "value3"}

## Guidelines
- Guideline 1: First guideline
- Guideline 2: Second guideline
- Guideline 3: Third guideline
"""
            
            let startTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
            
            // Run multiple iterations to get a meaningful measurement
            for (i in 0..100) {
                let yamlParser = YamlFrontmatterParser()
                let resultOpt = yamlParser.parseYamlFrontmatter(yamlContent)
                
                if (resultOpt.isNone()) {
                    println("YAML parsing failed in performance test")
                    return false
                }
            }
            
            let endTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
            let totalTime = endTime - startTime
            let avgTime = totalTime / 100.0
            
            println("YAML parsing performance: ${totalTime}ms for 100 iterations (${avgTime}ms average)")
            
            // Check if performance is acceptable (under 100ms average)
            if (avgTime > 100.0) {
                println("YAML parsing performance is too slow: ${avgTime}ms average")
                return false
            }
            
            return true
        } catch (ex: Exception) {
            println("Error in testYamlParsingPerformance: ${ex.message}")
            return false
        }
    }

    /**
     * Test skill validation performance
     */
    public static func testSkillValidationPerformance(): Bool {
        try {
            let metadata = HashMap<String, String>()
            metadata.add("author", "Performance Test")
            metadata.add("version", "1.0")
            metadata.add("category", "testing")
            
            let parameters = Array<magic.skill.domain.models.SkillParameter>()
            
            let skillManifest = magic.skill.domain.models.SkillManifest(
                name: "perf-test-skill",
                description: "A skill for testing validation performance",
                license: Some("MIT"),
                compatibility: Some("Cangjie 1.0.0"),
                metadata: metadata,
                allowedTools: Some("basic-tools"),
                instructions: "# Performance Test Skill\n\nThis skill tests validation performance.",
                skillPath: "/path/to/performance/test",
                scriptsDirExists: false,
                referencesDirExists: false,
                assetsDirExists: false,
                parameters: parameters
            )
            
            let validationService = SkillValidationService()
            
            let startTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
            
            // Run multiple iterations to get a meaningful measurement
            for (i in 0..100) {
                let validationResult = validationService.validateSkillManifest(skillManifest)
                
                if (!validationResult.isValid) {
                    println("Skill validation failed in performance test")
                    return false
                }
            }
            
            let endTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
            let totalTime = endTime - startTime
            let avgTime = totalTime / 100.0
            
            println("Skill validation performance: ${totalTime}ms for 100 iterations (${avgTime}ms average)")
            
            // Check if performance is acceptable (under 100ms average)
            if (avgTime > 100.0) {
                println("Skill validation performance is too slow: ${avgTime}ms average")
                return false
            }
            
            return true
        } catch (ex: Exception) {
            println("Error in testSkillValidationPerformance: ${ex.message}")
            return false
        }
    }

    /**
     * Run all performance tests
     */
    public static func runAllTests(): Bool {
        println("Running Performance Tests...")
        
        let test1Passed = testYamlParsingPerformance()
        println("YAML parsing performance test: ${if (test1Passed) { "PASSED" } else { "FAILED" }}")
        
        let test2Passed = testSkillValidationPerformance()
        println("Skill validation performance test: ${if (test2Passed) { "PASSED" } else { "FAILED" }}")
        
        let allPassed = test1Passed && test2Passed
        println("All performance tests passed: ${allPassed}")
        
        return allPassed
    }
}