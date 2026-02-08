/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.loaders

import magic.skill.domain.models.YamlFrontmatter
import magic.skill.infrastructure.utils.YamlUtils
import std.collection.HashMap

/**
 * YamlFrontmatterParser implements YAML frontmatter parsing using the yaml4cj library.
 */
public class YamlFrontmatterParser {
    /**
     * Parse YAML frontmatter from content string
     */
    public func parseYamlFrontmatter(content: String): Option<YamlFrontmatter> {
        // Extract the YAML frontmatter from the content
        let frontmatterContentOpt = YamlUtils.extractYamlFrontmatter(content)

        if (frontmatterContentOpt.isNone()) {
            return None
        }

        let frontmatterContent = frontmatterContentOpt.getOrThrow()

        // Parse the YAML content
        let parsedYamlOpt = YamlUtils.parseYamlContent(frontmatterContent)

        if (parsedYamlOpt.isNone()) {
            return None
        }

        let parsedYaml = parsedYamlOpt.getOrThrow()

        // Extract individual fields
        let name = if (let Some(value) <- parsedYaml.get("name")) {
            value
        } else {
            "default-name"
        }
        let description = if (let Some(value) <- parsedYaml.get("description")) {
            value
        } else {
            "default-description"
        }
        let license = parsedYaml.get("license")
        let compatibility = parsedYaml.get("compatibility")
        let allowedTools = parsedYaml.get("allowed-tools")  // Note: this field might have a different name in YAML

        // Extract metadata (any additional fields)
        let metadata = HashMap<String, String>()
        for ((key, value) in parsedYaml) {
            if (key != "name" && key != "description" && key != "license" && key != "compatibility" && key != "allowed-tools") {
                metadata.add(key, value)
            }
        }

        // Create and return the YamlFrontmatter object
        return Some(
            YamlFrontmatter(
                name: name,
                description: description,
                license: license,
                compatibility: compatibility,
                metadata: metadata,
                allowedTools: allowedTools,
                parsedWithYaml4cj: true
            )
        )
    }
}