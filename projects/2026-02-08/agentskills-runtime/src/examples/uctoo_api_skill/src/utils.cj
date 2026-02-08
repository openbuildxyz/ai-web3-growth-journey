/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src

import std.collection.HashMap
import std.time.DateTime
import stdx.encoding.json.JsonValue
import stdx.encoding.json.*
import std.regex.Regex
import std.console.Console
import std.core.StringBuilder
import magic.log.LogUtils

/**
 * Utility functions for UCToo API Skills
 */
public class Utils {
    /**
     * Log a message with timestamp using the standard logging system
     */
    public static func logMessage(level: String, message: String): Unit {
        let timestamp = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
        // Use the standard logging system to log the message to file
        LogUtils.info("Utils_" + level + ": " + message)
    }
    
    /**
     * Format a structured log message using the standard logging system
     */
    public static func logStructured(level: String, component: String, action: String, details: HashMap<String, String>): Unit {
        let sb = StringBuilder()
        sb.append("[")
        sb.append((DateTime.now() - DateTime.UnixEpoch).toMilliseconds().toString())
        sb.append("] ")
        sb.append("[")
        sb.append(level)
        sb.append("] ")
        sb.append("[")
        sb.append(component)
        sb.append("] ")
        sb.append(action)
        
        if (!details.isEmpty()) {
            sb.append(" - ")
            var first = true
            for ((key, value) in details.iterator()) {
                if (!first) {
                    sb.append(", ")
                }
                sb.append(key)
                sb.append("=")
                sb.append(value)
                first = false
            }
        }
        
        LogUtils.info("Utils_structured: " + sb.toString())
    }
    
    /**
     * Extract token from API response (JSON format)
     */
    public static func extractTokenFromResponse(response: String): Option<String> {
        try {
            // Try parsing as JSON first
            let jsonValue = JsonValue.fromStr(response)

            // Look for common token field names
            let tokenResult = getJsonValueAsString(jsonValue, "access_token")
            if (tokenResult.isSome()) {
                return tokenResult
            }
            let tokenResult2 = getJsonValueAsString(jsonValue, "token")
            if (tokenResult2.isSome()) {
                return tokenResult2
            }
            let tokenResult3 = getJsonValueAsString(jsonValue, "accessToken")
            if (tokenResult3.isSome()) {
                return tokenResult3
            }
            let tokenResult4 = getJsonValueAsString(jsonValue, "data.token")
            if (tokenResult4.isSome()) {
                return tokenResult4
            }
        } catch (ex: Exception) {
            // JSON parsing failed, try regex as fallback
            logMessage("WARN", "JSON parsing failed, using regex fallback: ${ex.message}")
        }
        
        // Fallback: Use string operations to extract token
        // Common patterns for tokens
        let patterns = [
            "\"access_token\"\\s*:\\s*\"([^\"]+)\"",
            "\"token\"\\s*:\\s*\"([^\"]+)\"",
            "\"accessToken\"\\s*:\\s*\"([^\"]+)\""
        ]
        
        for (pattern in patterns) {
            // Note: Actual regex implementation would depend on Cangjie's regex support
            // This is a simplified approach
            if (response.contains("access_token") && response.contains(":") && response.contains('"')) {
                // Extract the value between quotes after access_token
                let parts = response.split("access_token")
                if (parts.size > 1) {
                    let remaining = parts[1]
                    let quoteParts = remaining.split('"')
                    if (quoteParts.size > 2) {
                        let token = quoteParts[1]
                        if (token.size > 10) {  // Basic validation
                            return Some(token)
                        }
                    }
                }
            }
        }
        
        return None
    }
    
    /**
     * Helper to get a value from JSON by key (supports nested keys like "data.token")
     */
    private static func getJsonValueAsString(jsonValue: JsonValue, keyPath: String): Option<String> {
        let keys = keyPath.split(".")
        var current = jsonValue

        for (i in 0..keys.size) {
            let key = keys[i]

            match (current.kind()) {
                case JsonKind.JsObject =>
                    match (current.asObject().get(key)) {
                        case Some(value) =>
                            if (i == keys.size - 1) {
                                // This is the final key, return its value as string
                                return Some(value.toString())
                            } else {
                                // Continue to the next level
                                current = value
                            }
                        case None =>
                            // Key not found
                            return None
                    }
                case _ =>
                    // Current value is not an object, can't navigate further
                    return None
            }
        }

        return None
    }
    
    /**
     * Sanitize input string to prevent injection attacks
     */
    public static func sanitizeInput(input: String): String {
        // Remove potentially dangerous characters
        var sanitized = input
        sanitized = sanitized.replace("<script", "")
        sanitized = sanitized.replace("</script>", "")
        sanitized = sanitized.replace("javascript:", "")
        sanitized = sanitized.replace("vbscript:", "")
        
        return sanitized
    }
    
    /**
     * Validate if a string looks like a valid ID (alphanumeric, hyphens, underscores)
     */
    public static func isValidId(id: String): Bool {
        if (id.size == 0 || id.size > 128) {
            return false
        }
        
        for (i in 0..id.size) {
            let char = id[i]
            // Check if character is alphanumeric or underscore/hyphen
            // Using direct character comparison with Rune values
            let runeValue = UInt32(Rune(char))
            let aValue = UInt32(r'a')
            let zValue = UInt32(r'z')
            let AValue = UInt32(r'A')
            let ZValue = UInt32(r'Z')
            let zeroValue = UInt32(r'0')
            let nineValue = UInt32(r'9')
            let hyphenValue = UInt32(r'-')
            let underscoreValue = UInt32(r'_')

            if (!((runeValue >= aValue && runeValue <= zValue) ||
                  (runeValue >= AValue && runeValue <= ZValue) ||
                  (runeValue >= zeroValue && runeValue <= nineValue) ||
                  runeValue == hyphenValue ||
                  runeValue == underscoreValue)) {
                return false
            }
        }
        
        return true
    }
}