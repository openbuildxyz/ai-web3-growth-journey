/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.tests.contract

import magic.skill.domain.models.{SkillManifest, SkillParameter}
import magic.skill.application.SkillValidationService
import magic.skill.infrastructure.validators.SkillManifestValidator
import std.collection.HashMap

/**
 * Contract tests for the agentskills specification compliance
 */
public class SkillContractTest {
    /**
     * Test that a valid SKILL.md manifest passes all validation requirements
     */
    public static func testValidSkillManifestPassesValidation(): Bool {
        try {
            let metadata = HashMap<String, String>()
            metadata.add("author", "Test Author")
            metadata.add("version", "1.0.0")
            
            let parameters = Array<SkillParameter>()
            
            let validManifest = SkillManifest(
                name: "valid-skill-name",
                description: "A valid skill description for testing",
                license: Some("MIT"),
                compatibility: Some("Cangjie 1.0.0"),
                metadata: metadata,
                allowedTools: Some("basic-tools"),
                instructions: "# Valid Skill\n\nThis is a valid skill for testing.",
                skillPath: "/path/to/valid/skill",
                scriptsDirExists: true,
                referencesDirExists: false,
                assetsDirExists: true,
                parameters: parameters
            )
            
            let validationService = SkillValidationService()
            let validationResult = validationService.validateSkillManifest(validManifest)
            
            if (!validationResult.isValid) {
                println("Valid skill manifest failed validation:")
                for (error in validationResult.errors) {
                    println("  - ${error}")
                }
                return false
            }
            
            return true
        } catch (ex: Exception) {
            println("Error in testValidSkillManifestPassesValidation: ${ex.message}")
            return false
        }
    }

    /**
     * Test that skill name follows agentskills specification (1-64 chars, lowercase, hyphens only)
     */
    public static func testSkillNameSpecification(): Bool {
        try {
            let validationService = SkillValidationService()
            
            // Valid names
            let validNames = [
                "a",  // Minimum length
                "a".repeat(64),  // Maximum length
                "valid-name",
                "another-valid-name",
                "name-with-multiple-hyphens"
            ]
            
            for (name in validNames) {
                let (isValid, _) = validationService.validateSkillName(name)
                if (!isValid) {
                    println("Valid name incorrectly rejected: ${name}")
                    return false
                }
            }
            
            // Invalid names
            let invalidNames = [
                "",  // Empty
                "a".repeat(65),  // Too long
                "InvalidName",  // Contains uppercase
                "invalid_name",  // Contains underscore
                "invalid.name",  // Contains dot
                "invalid name",  // Contains space
                "-invalid",  // Starts with hyphen
                "invalid-",  // Ends with hyphen
                "in--valid"  // Contains consecutive hyphens
            ]
            
            for (name in invalidNames) {
                let (isValid, _) = validationService.validateSkillName(name)
                if (isValid) {
                    println("Invalid name incorrectly accepted: ${name}")
                    return false
                }
            }
            
            return true
        } catch (ex: Exception) {
            println("Error in testSkillNameSpecification: ${ex.message}")
            return false
        }
    }

    /**
     * Test that skill description follows agentskills specification (1-1024 chars)
     */
    public static func testSkillDescriptionSpecification(): Bool {
        try {
            let validationService = SkillValidationService()
            
            // Valid descriptions
            let validDescriptions = [
                "a",  // Minimum length
                "a".repeat(1024)  // Maximum length
            ]
            
            for (desc in validDescriptions) {
                let (isValid, _) = validationService.validateSkillDescription(desc)
                if (!isValid) {
                    println("Valid description incorrectly rejected: ${desc.size} chars")
                    return false
                }
            }
            
            // Invalid descriptions
            let invalidDescriptions = [
                "",  // Empty
                "a".repeat(1025)  // Too long
            ]
            
            for (desc in invalidDescriptions) {
                let (isValid, _) = validationService.validateSkillDescription(desc)
                if (isValid) {
                    println("Invalid description incorrectly accepted: ${desc.size} chars")
                    return false
                }
            }
            
            return true
        } catch (ex: Exception) {
            println("Error in testSkillDescriptionSpecification: ${ex.message}")
            return false
        }
    }

    /**
     * Test optional field validation
     */
    public static func testOptionalFieldValidation(): Bool {
        try {
            let validator = SkillManifestValidator()
            
            // Test valid license
            let validLicenseResult = validator.validateLicense(Some("MIT"))
            if (!validLicenseResult.isValid) {
                println("Valid license incorrectly rejected")
                return false
            }
            
            // Test empty license (should be valid since it's optional)
            let emptyLicenseResult = validator.validateLicense(Some(""))
            // This should fail as per our validation logic
            if (emptyLicenseResult.isValid) {
                println("Empty license incorrectly accepted")
                return false
            }
            
            // Test valid compatibility
            let validCompResult = validator.validateCompatibility(Some("Cangjie 1.0.0"))
            if (!validCompResult.isValid) {
                println("Valid compatibility incorrectly rejected")
                return false
            }
            
            // Test too-long compatibility
            let longCompResult = validator.validateCompatibility(Some("a".repeat(501)))
            if (longCompResult.isValid) {
                println("Too-long compatibility incorrectly accepted")
                return false
            }
            
            // Test valid metadata
            let validMetadata = HashMap<String, String>()
            validMetadata.add("author", "Test Author")
            let validMetadataResult = validator.validateMetadata(validMetadata)
            if (!validMetadataResult.isValid) {
                println("Valid metadata incorrectly rejected")
                return false
            }
            
            // Test invalid metadata (empty key)
            let invalidMetadata = HashMap<String, String>()
            invalidMetadata.add("", "Empty key value")
            let invalidMetadataResult = validator.validateMetadata(invalidMetadata)
            if (invalidMetadataResult.isValid) {
                println("Invalid metadata (empty key) incorrectly accepted")
                return false
            }
            
            return true
        } catch (ex: Exception) {
            println("Error in testOptionalFieldValidation: ${ex.message}")
            return false
        }
    }

    /**
     * Run all contract tests
     */
    public static func runAllTests(): Bool {
        println("Running Skill Contract Tests (agentskills specification compliance)...")
        
        let test1Passed = testValidSkillManifestPassesValidation()
        println("Valid skill manifest validation test: ${if (test1Passed) { "PASSED" } else { "FAILED" }}")
        
        let test2Passed = testSkillNameSpecification()
        println("Skill name specification test: ${if (test2Passed) { "PASSED" } else { "FAILED" }}")
        
        let test3Passed = testSkillDescriptionSpecification()
        println("Skill description specification test: ${if (test3Passed) { "PASSED" } else { "FAILED" }}")
        
        let test4Passed = testOptionalFieldValidation()
        println("Optional field validation test: ${if (test4Passed) { "PASSED" } else { "FAILED" }}")
        
        let allPassed = test1Passed && test2Passed && test3Passed && test4Passed
        println("All contract tests passed: ${allPassed}")
        
        return allPassed
    }
}