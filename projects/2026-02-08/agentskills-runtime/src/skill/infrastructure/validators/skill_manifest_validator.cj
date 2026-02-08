/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.validators

import magic.skill.domain.models.{SkillManifest, ValidationResult}
import std.collection.{ArrayList, HashMap}
import std.time.DateTime

/**
 * SkillManifestValidator validates optional fields in skill manifests according to the agentskills specification.
 */
public class SkillManifestValidator {
    /**
     * Validate optional fields in a skill manifest
     */
    public func validateOptionalFields(manifest: SkillManifest): ValidationResult {
        let errors = ArrayList<String>()
        let warnings = ArrayList<String>()
        
        // Validate license field
        if (let Some(licenseValue) <- manifest.license) {
            if (licenseValue.isEmpty()) {
                errors.add("License field should not be empty if provided")
            }
        }
        
        // Validate compatibility field
        if (let Some(compatibilityValue) <- manifest.compatibility) {
            if (compatibilityValue.size > 500) {
                errors.add("Compatibility field exceeds 500 character limit")
            }
        }
        
        // Validate metadata keys
        for ((key, _) in manifest.metadata) {
            if (key.isEmpty()) {
                errors.add("Metadata keys should not be empty")
            }
        }
        
        // Validate allowedTools field
        if (let Some(allowedToolsValue) <- manifest.allowedTools) {
            if (allowedToolsValue.isEmpty()) {
                errors.add("Allowed-tools field should not be empty if provided")
            }
        }
        
        if (errors.isEmpty()) {
            return ValidationResult.success()
        } else {
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
    }
    
    /**
     * Validate license field specifically
     */
    public func validateLicense(license: Option<String>): ValidationResult {
        let errors = ArrayList<String>()
        let warnings = ArrayList<String>()
        
        if (let Some(licenseValue) <- license) {
            if (licenseValue.isEmpty()) {
                errors.add("License field should not be empty if provided")
            }
        }
        
        if (errors.isEmpty()) {
            return ValidationResult.success()
        } else {
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
    }
    
    /**
     * Validate compatibility field specifically
     */
    public func validateCompatibility(compatibility: Option<String>): ValidationResult {
        let errors = ArrayList<String>()
        let warnings = ArrayList<String>()
        
        if (let Some(compatibilityValue) <- compatibility) {
            if (compatibilityValue.size > 500) {
                errors.add("Compatibility field exceeds 500 character limit")
            }
        }
        
        if (errors.isEmpty()) {
            return ValidationResult.success()
        } else {
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
    }
    
    /**
     * Validate metadata field specifically
     */
    public func validateMetadata(metadata: HashMap<String, String>): ValidationResult {
        let errors = ArrayList<String>()
        let warnings = ArrayList<String>()
        
        for ((key, _) in metadata) {
            if (key.isEmpty()) {
                errors.add("Metadata keys should not be empty")
            }
        }
        
        if (errors.isEmpty()) {
            return ValidationResult.success()
        } else {
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
    }
    
    /**
     * Validate allowedTools field specifically
     */
    public func validateAllowedTools(allowedTools: Option<String>): ValidationResult {
        let errors = ArrayList<String>()
        let warnings = ArrayList<String>()
        
        if (let Some(allowedToolsValue) <- allowedTools) {
            if (allowedToolsValue.isEmpty()) {
                errors.add("Allowed-tools field should not be empty if provided")
            }
        }
        
        if (errors.isEmpty()) {
            return ValidationResult.success()
        } else {
            return ValidationResult.failure(errors.toArray(), warnings.toArray())
        }
    }
}