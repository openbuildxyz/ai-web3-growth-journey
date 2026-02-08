/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Configuration module for UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import std.env.getVariable
import std.convert.*
import magic.core.*

// Configuration class for the MCP Server adapter
class UctooConfig {
    // Backend URL for uctoo-backend server
    var backendUrl: String = "https://javatoarktsapi.uctoo.com"  // Default to local backend

    // Alternative backend URL for development/testing
    var devBackendUrl: String = "https://javatoarktsapi.uctoo.com"  // Can be overridden for dev

    // Port for MCP server adapter
    var port: Int32 = 443

    // Maximum concurrent connections
    var maxConnections: Int32 = 100

    // Request timeout in milliseconds
    var requestTimeout: Int32 = 10000  // 10 seconds timeout

    // Logging level
    var logLevel: String = "INFO"

    // Authentication token for backend API
    var authToken: String = ""

    // Initialize with default values from environment variables
    init() {
        // Values can be overridden via environment variables
        let backendUrlOpt = getVariable("BACKEND_URL")
        if (backendUrlOpt != None) {
            let value = backendUrlOpt.getOrThrow()
            if (!value.isEmpty()) {
                this.backendUrl = value
            }
        }

        let portOpt = getVariable("PORT")
        if (portOpt != None) {
            let value = portOpt.getOrThrow()
            if (!value.isEmpty()) {
                this.port = Int32.parse(value)
            }
        }

        let maxConnOpt = getVariable("MAX_CONNECTIONS")
        if (maxConnOpt != None) {
            let value = maxConnOpt.getOrThrow()
            if (!value.isEmpty()) {
                this.maxConnections = Int32.parse(value)
            }
        }

        let timeoutOpt = getVariable("REQUEST_TIMEOUT")
        if (timeoutOpt != None) {
            let value = timeoutOpt.getOrThrow()
            if (!value.isEmpty()) {
                this.requestTimeout = Int32.parse(value)
            }
        }

        let logLevelOpt = getVariable("LOG_LEVEL")
        if (logLevelOpt != None) {
            let value = logLevelOpt.getOrThrow()
            if (!value.isEmpty()) {
                this.logLevel = value
            }
        }
    }

    // Method to load configuration from file (TBD)
    func loadConfigFromFile(filePath: String) {
        // TODO: Implement loading configuration from file
        println("Loading configuration from file: " + filePath)
    }
}