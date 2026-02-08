/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Model for Parameter in UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import magic.core.*

// Model for API Parameter
// Represents a parameter definition for API endpoints
class Parameter {
    // Parameter name
    var name: String = ""

    // Parameter type - using backticks since 'type' is a reserved keyword
    var `type`: String = ""

    // Whether the parameter is required
    var required: Bool = false

    // Description of the parameter
    var description: String = ""

    // Default value for the parameter (using None instead of null)
    var defaultValue: ?Any = None

    // Valid parameter types - using a helper method
    private static func isValidType(`type`: String): Bool {
        let lowerType = `type`.toAsciiLower()
        return lowerType == "string" || lowerType == "integer" || lowerType == "boolean" ||
               lowerType == "number" || lowerType == "array" || lowerType == "object"
    }


    // Method to validate the parameter
    func isValid(): Bool {
        return !this.name.isEmpty() && isValidType(this.`type`)
    }

    // Method to check if this parameter has a default value
    func hasDefaultValue(): Bool {
        return this.defaultValue.isSome()
    }

    // Method to get the default value with type safety
    func getDefaultValue(): ?Any {
        return this.defaultValue
    }

    // Method to set the default value
    func setDefaultValue(value: Any): Unit {
        this.defaultValue = value
    }
}