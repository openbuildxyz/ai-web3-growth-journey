/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.application

import magic.skill.domain.models.{SkillManifest, SkillLoadingContext}
import stdx.encoding.json.JsonValue

/**
 * SkillParsingService is an application service for parsing SKILL.md files into structured data.
 * Uses yaml4cj library for YAML parsing and markdown4cj library for markdown processing.
 */
public interface SkillParsingService {
    /**
     * Parse skill from content string
     */
    func parseSkillFromContent(content: String): Option<SkillManifest>

    /**
     * Parse skill from file path
     */
    func parseSkillFromPath(path: String): Option<SkillManifest>
}