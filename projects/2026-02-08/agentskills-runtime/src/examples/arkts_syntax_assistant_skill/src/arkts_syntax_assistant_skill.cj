/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.arkts_syntax_assistant_skill.src

import magic.skill.BaseSkill
import magic.skill.domain.models.SkillManifest
import std.collection.HashMap
import stdx.encoding.json.JsonValue
import std.core.StringBuilder
import std.collection.ArrayList
import std.io.StringReader
import stdx.net.http.*
import stdx.net.tls.*
import std.time.*
import magic.config.Config
import stdx.encoding.json.JsonObject
import stdx.encoding.json.JsonString
import magic.log.LogUtils as Utils


/**
 * ArkTS Syntax Assistant Skill implementation
 * This skill processes natural language queries about ArkTS syntax and retrieves relevant information from documentation
 * Uses RAG (Retrieval-Augmented Generation) to provide accurate responses based on documentation
 */
public class ArkTSSyntaxAssistantSkill <: BaseSkill {
    private var documentationRetriever: DocumentationRetriever;

    /**
     * Constructor that accepts a SkillManifest for progressive loading
     * This allows the skill to be loaded from SKILL.md files
     */
    public init(manifest: SkillManifest) {
        super(
            name: manifest.name,
            description: manifest.description,
            license: manifest.license,
            compatibility: manifest.compatibility,
            metadata: manifest.metadata,
            allowedTools: manifest.allowedTools,
            instructions: manifest.instructions,
            skillPath: manifest.skillPath
        )

        Utils.debug("Initializing ArkTSSyntaxAssistantSkill from manifest: ${manifest.name}...");
        
        // Initialize the documentation retriever with the path to ArkTS documentation
        this.documentationRetriever = DocumentationRetriever(docsPath: "D:/UCT/projects/miniapp/uctoo/Delivery/uctoo-admin/apps/CangjieMagic/src/examples/skill-arkts-syntax-assistant");
    }

    /**
     * Execute the skill with the provided arguments
     */
    override public func execute(args: HashMap<String, JsonValue>): String {
        Utils.debug("=== ArkTSSyntaxAssistantSkill.execute START ===");
        Utils.debug("Executing ArkTSSyntaxAssistantSkill with arguments");

        // Extract the query from the arguments
        let queryOpt = args.get("query")
        let query = if (queryOpt.isSome()) {
            let queryValue = queryOpt.getOrThrow()
            if (queryValue is JsonString) {
                let jsonStringOpt = queryValue as JsonString
                if (jsonStringOpt.isSome()) {
                    jsonStringOpt.getOrThrow().getValue()
                } else {
                    "No query provided"
                }
            } else {
                "No query provided"
            }
        } else {
            "No query provided"
        }

        Utils.debug("Processing query: ${query}");

        // Use the documentation retriever to get relevant information
        let result = documentationRetriever.retrieveInfo(query)
        Utils.debug("Retrieved documentation info, returning result");

        Utils.debug("=== ArkTSSyntaxAssistantSkill.execute END ===");
        return result
    }
}