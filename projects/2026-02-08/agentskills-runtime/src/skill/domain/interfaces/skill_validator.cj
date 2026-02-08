/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.domain.interfaces

import magic.skill.domain.models.SkillManifest
import magic.skill.domain.models.ValidationResult

/**
 * SkillValidator is a domain interface for skill validation operations.
 */
public interface SkillValidator {
    /**
     * Validate a skill manifest
     */
    func validate(manifest: SkillManifest): ValidationResult

    /**
     * Check if a skill name is valid
     */
    func isValidName(name: String): Bool

    /**
     * Check if a skill description is valid
     */
    func isValidDescription(description: String): Bool
}