/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Model for Translation Rule in UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import std.collection.HashMap
import magic.core.*

// Model for Translation Rule
// Represents a rule for converting natural language to backend API calls
class TranslationRule {
    // Unique identifier for the rule
    var ruleId: String = ""

    // Natural language pattern to match
    var pattern: String = ""

    // Target backend API endpoint
    var targetEndpoint: String = ""

    // Mapping of pattern parameters to endpoint parameters
    var parameterMappings: HashMap<String, String> = HashMap<String, String>()

    // Name of the transformation function to apply
    var transformFunction: String = "defaultTransform"


    // Method to validate the rule
    func isValid(): Bool {
        return !this.ruleId.isEmpty() &&
               !this.pattern.isEmpty() &&
               !this.targetEndpoint.isEmpty()
    }

    // Method to add a parameter mapping
    func addParameterMapping(patternParam: String, endpointParam: String): Unit {
        this.parameterMappings[patternParam] = endpointParam
    }

    // Method to get the mapped parameter name
    func getMappedParameterName(patternParam: String): String {
        return this.parameterMappings[patternParam]
    }

    // Method to apply this rule to a query (simplified implementation)
    func applyToQuery(query: String): TranslationResult {
        // This is a simplified implementation - in reality this would involve more sophisticated pattern matching
        if (query.toAsciiLower().contains(this.pattern.toAsciiLower())) {
            // Create a result with the target endpoint and parameters
            let result = TranslationResult()
            result.targetEndpoint = this.targetEndpoint
            result.parameters = HashMap<String, Any>() // Would be populated based on pattern matching

            return result
        }

        return TranslationResult() // Return default instance instead of null
    }
}

// Helper class for translation results
class TranslationResult {
    var targetEndpoint: String = ""
    var parameters: HashMap<String, Any> = HashMap<String, Any>()
    var transformFunction: String = ""
}