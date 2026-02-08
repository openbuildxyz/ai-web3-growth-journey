/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.domain.interfaces

import magic.skill.domain.models.SkillManifest
import std.collection.ArrayList

/**
 * SkillRepository is a domain interface for skill persistence operations.
 */
public interface SkillRepository {
    /**
     * Save a skill manifest
     */
    func save(skillManifest: SkillManifest): Bool

    /**
     * Find a skill by its path
     */
    func findByPath(path: String): Option<SkillManifest>

    /**
     * Find all skills
     */
    func findAll(): Array<SkillManifest>

    /**
     * Delete a skill by its path
     */
    func deleteByPath(path: String): Bool
}