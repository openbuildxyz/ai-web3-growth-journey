/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Model for MCP Service in UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import std.collection.{ArrayList, HashMap}
import magic.core.*

// Model for MCP Service
// Represents an MCP-compliant service that bridges natural language requests and backend API calls
class MCPService {
    // Unique identifier for the MCP service
    var id: String = ""

    // Name of the service
    var name: String = ""

    // Description of the service
    var description: String = ""

    // Backend API endpoint
    var endpoint: String = ""

    // HTTP method for the API call
    var method: String = "GET"

    // List of service parameters
    var parameters: ArrayList<Parameter> = ArrayList<Parameter>()

    // Expected response format
    var responseFormat: String = "json"

    // Adapter-specific configuration
    var adapterConfig: HashMap<String, Any> = HashMap<String, Any>()

    // HTTP methods validation - using a manual approach since toAsciiUpper is not a standard method
    private static func isValidMethod(method: String): Bool {
        // Convert to uppercase using a simple approach since toAsciiUpper isn't available
        let upperMethod = method.toAsciiUpper()
        return upperMethod == "GET" || upperMethod == "POST" || upperMethod == "PUT" ||
               upperMethod == "DELETE" || upperMethod == "PATCH"
    }


    // Method to validate the service
    func isValid(): Bool {
        return !this.id.isEmpty() &&
               !this.name.isEmpty() &&
               !this.endpoint.isEmpty() &&
               isValidMethod(this.method)
    }

    // Method to get parameter by name
    func getParameter(name: String): Parameter {
        for (param in this.parameters) {
            if (param.name == name) {
                return param
            }
        }
        return Parameter()  // Return default instance instead of null
    }

    // Method to add a parameter
    func addParameter(parameter: Parameter): Unit {
        this.parameters.add(parameter)
    }
}

