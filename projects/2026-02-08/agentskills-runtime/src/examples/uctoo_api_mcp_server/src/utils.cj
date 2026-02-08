/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Utility functions for UCToo MCP Server adapter
 */

package magic.examples.uctoo_api_mcp_server.src

import magic.core.*
import std.time.DateTime
import stdx.encoding.json.*
import std.regex.Regex
import magic.log.LogUtils

// Utility class with common helper functions
class Utils {

    // Function to convert JSON string to object - using magic framework capabilities
    static func parseJson(jsonString: String, clazz: Any): Any {
        // In magic framework, use appropriate JSON parsing
        // This is a placeholder implementation
        // Actual implementation might use different approach
        return clazz
    }

    // Function to convert object to JSON string
    static func toJson(obj: Any): String {
        // In magic framework, use appropriate JSON stringification
        // This is a placeholder implementation
        return "PLACEHOLDER_JSON_OUTPUT"
    }

    // Function to validate if a string is not empty
    static func isNotEmpty(str: String): Bool {
        return str.size > 0
    }

    // Function to validate if a string is a valid URL
    static func isValidUrl(url: String): Bool {
        // Simple URL validation - in real implementation, this could be more sophisticated
        return url.startsWith("http://") || url.startsWith("https://")
    }

    // Function to generate unique ID
    static func generateId(): String {
        // Using current timestamp as part of the ID
        return "id-" + (DateTime.now() - DateTime.UnixEpoch).toMilliseconds().toString()
    }

    // Function to format timestamp to readable date
    static func formatTimestamp(timestamp: Int64): String {
        // This would format the timestamp to a readable date string
        // For now returning the timestamp as string
        return timestamp.toString()
    }

    // Function to log messages with a timestamp
    static func logMessage(level: String, message: String): Unit {
        let timestamp = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
        // Use the standard logging system to log the message to file
        LogUtils.info("Utils_" + level + ": " + message)
    }

    // Function to measure execution time
    static func measureTime(operation: () -> Unit): Int64 {
        let start = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
        operation()
        return (DateTime.now() - DateTime.UnixEpoch).toMilliseconds() - start
    }

    // Helper function to extract token from JSON response using proper JSON parsing
    static func extractTokenFromResponse(responseJson: String): String {
        Utils.logMessage("DEBUG", "Starting extractTokenFromResponse with response (first 100 chars): " +
                        if (responseJson.size > 100) { responseJson[0..100] } else { responseJson })
        try {
            // Parse the JSON response using the standard method from the codebase
            Utils.logMessage("DEBUG", "About to parse JSON with JsonValue.fromStr")
            let jsonValue = JsonValue.fromStr(responseJson)
            Utils.logMessage("DEBUG", "JSON parsed successfully, checking if it's an object")

            // Check if the JSON value is an object using match on kind()
            match (jsonValue.kind()) {
                case JsonKind.JsObject =>
                    let jsonObj = jsonValue.asObject()
                    Utils.logMessage("DEBUG", "Got JSON object, attempting to extract access_token directly")

                    // First try to get the access_token directly from the root object
                    let accessTokenOpt = jsonObj.get("access_token")
                    Utils.logMessage("DEBUG", "Got access_token option from root: " + accessTokenOpt.isSome().toString())
                    if (accessTokenOpt.isSome()) {
                        let tokenValue = accessTokenOpt.getOrThrow()
                        // Check if the token value is a string using match on kind()
                        match (tokenValue.kind()) {
                            case JsonKind.JsString =>
                                let token = tokenValue.asString().getValue()
                                Utils.logMessage("DEBUG", "Extracted access token from root: " + token)
                                return token
                            case _ =>
                                Utils.logMessage("WARN", "access_token found but is not a string value")
                        }
                    } else {
                        Utils.logMessage("DEBUG", "access_token not found directly in root object")
                    }

                    // If not found directly, check if it's nested inside a 'user' object or similar
                    Utils.logMessage("DEBUG", "Checking for user object in response")
                    let userOpt = jsonObj.get("user")
                    Utils.logMessage("DEBUG", "Got user option: " + userOpt.isSome().toString())
                    if (userOpt.isSome()) {
                        let userValue = userOpt.getOrThrow()
                        // Check if the user value is an object using match on kind()
                        match (userValue.kind()) {
                            case JsonKind.JsObject =>
                                let userObj = userValue.asObject()
                                Utils.logMessage("DEBUG", "Got user object, attempting to extract access_token from user")
                                let userTokenOpt = userObj.get("access_token")
                                Utils.logMessage("DEBUG", "Got user access_token option: " + userTokenOpt.isSome().toString())
                                if (userTokenOpt.isSome()) {
                                    let tokenValue = userTokenOpt.getOrThrow()
                                    // Check if the token value in user object is a string using match on kind()
                                    match (tokenValue.kind()) {
                                        case JsonKind.JsString =>
                                            let token = tokenValue.asString().getValue()
                                            Utils.logMessage("DEBUG", "Extracted access token from user object: " + token)
                                            return token
                                        case _ =>
                                            Utils.logMessage("WARN", "access_token found in user object but is not a string value")
                                    }
                                } else {
                                    Utils.logMessage("DEBUG", "access_token not found in user object")
                                }
                            case _ =>
                                Utils.logMessage("WARN", "user field found but is not an object")
                        }
                    } else {
                        Utils.logMessage("DEBUG", "No user object found in response")
                    }
                case _ =>
                    Utils.logMessage("WARN", "Parsed JSON is not an object")
            }

            // If still not found, log a warning
            Utils.logMessage("WARN", "Could not extract access token from response: " + responseJson)
            return ""
        } catch (ex: JsonException) {
            Utils.logMessage("ERROR", "JSON parsing error when extracting access token: " + ex.message)
            Utils.logMessage("ERROR", "Trying regex fallback for response: " + responseJson)

            // Fallback to regex approach if JSON parsing fails
            let tokenRegex = Regex("\"access_token\"\\s*:\\s*\"([^\"]+)\"")
            let matches = tokenRegex.findAll(responseJson)
            Utils.logMessage("DEBUG", "Regex found " + matches.size.toString() + " matches")
            if (!matches.isEmpty()) {
                let matchResult = matches[0]
                Utils.logMessage("DEBUG", "First match has " + matchResult.groupCount().toString() + " groups")
                if (matchResult.groupCount() >= 1) {
                    try {
                        let token = matchResult.matchString(1)
                        Utils.logMessage("DEBUG", "Extracted access token with regex fallback: " + token)
                        return token
                    } catch (regexEx: Exception) {
                        Utils.logMessage("ERROR", "Error extracting access token with regex fallback: " + regexEx.message)
                    }
                }
            }

            return ""
        } catch (ex: Exception) {
            Utils.logMessage("ERROR", "General error when extracting access token: " + ex.message)
            // Fallback to regex approach if general error occurs
            let tokenRegex = Regex("\"access_token\"\\s*:\\s*\"([^\"]+)\"")
            let matches = tokenRegex.findAll(responseJson)
            Utils.logMessage("DEBUG", "General error fallback - Regex found " + matches.size.toString() + " matches")
            if (!matches.isEmpty()) {
                let matchResult = matches[0]
                Utils.logMessage("DEBUG", "General error fallback - First match has " + matchResult.groupCount().toString() + " groups")
                if (matchResult.groupCount() >= 1) {
                    try {
                        let token = matchResult.matchString(1)
                        Utils.logMessage("INFO", "Extracted access token with general fallback: " + token)
                        return token
                    } catch (regexEx: Exception) {
                        Utils.logMessage("ERROR", "Error extracting access token with general fallback: " + regexEx.message)
                    }
                }
            }
            return ""
        }
    }
}

