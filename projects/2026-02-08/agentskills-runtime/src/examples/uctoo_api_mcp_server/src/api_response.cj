/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Model for API Response in UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import magic.core.*
import std.time.DateTime

// Model for API Response - using Option type for safety
class APIResponse {
    // Response identifier matching the request
    var id: String = ""

    // HTTP status code
    var status: Int32 = 200

    // Response data from the backend API (using Option for safety)
    var data: ?Any = None

    // Error message if the request failed (using Option for safety)
    var error: ?String = None

    // Timestamp of the response
    var timestamp: Int64 = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()

    // Request identifier that generated this response
    var requestId: String = ""


    // Helper method to generate ID
    private func generateId(): String {
        return "resp-" + this.timestamp.toString()
    }

    // Method to check if the response indicates success
    func isSuccess(): Bool {
        return this.status >= 200 && this.status < 300 && this.error == None
    }

    // Method to check if the response indicates an error
    func isError(): Bool {
        return this.status >= 400 || this.error != None
    }

    // Method to set error details
    func setError(statusCode: Int32, errorMessage: String): Unit {
        this.status = statusCode
        this.error = errorMessage
    }

    // Method to set success data
    func setData(responseData: Any): Unit {
        this.status = 200
        this.data = responseData
        this.error = None
    }
}