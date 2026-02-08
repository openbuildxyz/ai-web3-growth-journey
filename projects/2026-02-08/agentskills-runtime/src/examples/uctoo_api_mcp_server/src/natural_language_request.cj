/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Model for Natural Language Request in UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import std.collection.HashMap
import magic.core.*
import std.time.DateTime

// Model for Natural Language Request
// Represents a user's natural language query to be processed by the system
class NaturalLanguageRequest {
    // Unique identifier for the request
    var id: String = ""

    // The natural language query text from user
    var queryText: String = ""

    // Parsed intent from the query
    var intent: String = ""

    // Parameters extracted from the query
    var parameters: HashMap<String, Any> = HashMap<String, Any>()

    // Additional context for the query
    var context: HashMap<String, Any> = HashMap<String, Any>()

    // Optional user identifier (using None instead of null)
    var userId: ?String = None

    // Timestamp of the request
    var timestamp: Int64 = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()


    // Helper method to generate ID - using the global Utils method
    private func generateId(): String {
        return "nlreq-" + this.timestamp.toString()
    }
}