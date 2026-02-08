/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.domain.models

import std.collection.HashMap

/**
 * SkillResourceLoader handles loading of external resources for skills (scripts, references, assets).
 * Part of the infrastructure layer.
 */
public class SkillResourceLoader {
    public let skillPath: String  // Base path of the skill
    public let scriptsPath: Option<String>  // Path to scripts directory
    public let referencesPath: Option<String>  // Path to references directory
    public let assetsPath: Option<String>  // Path to assets directory
    public let loadedScripts: HashMap<String, String>  // Cached scripts content
    public let loadedReferences: HashMap<String, String>  // Cached references content
    public let loadedAssets: HashMap<String, String>  // Cached assets content

    public init(
        skillPath!: String,
        scriptsPath!: Option<String>,
        referencesPath!: Option<String>,
        assetsPath!: Option<String>,
        loadedScripts!: HashMap<String, String>,
        loadedReferences!: HashMap<String, String>,
        loadedAssets!: HashMap<String, String>
    ) {
        this.skillPath = skillPath
        this.scriptsPath = scriptsPath
        this.referencesPath = referencesPath
        this.assetsPath = assetsPath
        this.loadedScripts = loadedScripts
        this.loadedReferences = loadedReferences
        this.loadedAssets = loadedAssets
    }
}