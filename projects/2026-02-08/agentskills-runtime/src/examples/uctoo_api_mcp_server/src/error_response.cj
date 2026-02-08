/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Model for Error Response in UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import magic.core.*
import std.time.DateTime

// Model for Error Response
// Represents error information for error scenarios
class ErrorResponse {
    // Error message
    var error: String = ""

    // Additional error details (using Option for safety)
    var details: ?String = None

    // Error code (using Option for safety)
    var code: ?String = None

    // Request identifier that generated this error (using Option for safety)
    var requestId: ?String = None

    // Timestamp of the error
    var timestamp: Int64 = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()


    // Method to set error details
    func setDetails(errorDetails: String): Unit {
        this.details = errorDetails
    }

    // Method to set error code
    func setErrorCode(errorCode: String): Unit {
        this.code = errorCode
    }

    // Method to set request ID
    func setRequestId(requestId: String): Unit {
        this.requestId = requestId
    }
}