/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Model for Backend API Mapping in UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import std.collection.ArrayList
import magic.core.*

// Model for Backend API Mapping
// Represents the mapping between uctoo-backend server APIs and MCP services
class BackendAPIMapping {
    // Unique identifier for the mapping
    var mappingId: String = ""

    // Backend API endpoint
    var backendEndpoint: String = ""

    // Corresponding MCP service ID
    var mcpServiceId: String = ""

    // List of translation rules
    var translationRules: ArrayList<TranslationRule> = ArrayList<TranslationRule>()

    // List of natural language patterns that map to this service
    var naturalLanguagePatterns: ArrayList<String> = ArrayList<String>()

    // Whether this mapping is enabled
    var enabled: Bool = true


    // Method to validate the mapping
    func isValid(): Bool {
        return !this.mappingId.isEmpty() &&
               !this.backendEndpoint.isEmpty() &&
               !this.mcpServiceId.isEmpty()
    }

    // Method to add a translation rule
    func addTranslationRule(rule: TranslationRule): Unit {
        this.translationRules.add(rule)
    }

    // Method to add a natural language pattern
    func addNaturalLanguagePattern(pattern: String): Unit {
        this.naturalLanguagePatterns.add(pattern)
    }

    // Method to check if a natural language query matches any of the patterns
    func matchesQuery(query: String): Bool {
        let lowerQuery = query.toAsciiLower()
        for (pattern in this.naturalLanguagePatterns) {
            if (lowerQuery.contains(pattern.toAsciiLower())) {
                return true
            }
        }
        return false
    }

    // Method to get the first matching translation rule for a query
    func getMatchingRule(query: String): TranslationRule {
        for (rule in this.translationRules) {
            // Simple pattern matching - in real implementation this could be more sophisticated
            if (query.toAsciiLower().contains(rule.pattern.toAsciiLower())) {
                return rule
            }
        }
        return TranslationRule()  // Return default instance instead of null
    }
}