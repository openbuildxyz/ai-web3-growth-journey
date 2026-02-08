/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.domain.models

import std.collection.HashMap

/**
 * YamlFrontmatter represents the parsed YAML frontmatter from a SKILL.md file. Part of the domain layer.
 * Parsed using the yaml4cj library from the Cangjie ecosystem.
 */
public class YamlFrontmatter {
    public let name: String  // Skill name
    public let description: String  // Skill description
    public let license: Option<String>  // License information
    public let compatibility: Option<String>  // Compatibility requirements
    public let metadata: HashMap<String, String>  // Additional metadata
    public let allowedTools: Option<String>  // Allowed tools list
    public let parsedWithYaml4cj: Bool  // Flag indicating if the YAML was parsed using the yaml4cj library

    public init(
        name!: String,
        description!: String,
        license!: Option<String>,
        compatibility!: Option<String>,
        metadata!: HashMap<String, String>,
        allowedTools!: Option<String>,
        parsedWithYaml4cj!: Bool
    ) {
        this.name = name
        this.description = description
        this.license = license
        this.compatibility = compatibility
        this.metadata = metadata
        this.allowedTools = allowedTools
        this.parsedWithYaml4cj = parsedWithYaml4cj
    }
}