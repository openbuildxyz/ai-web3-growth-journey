/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src.models

import std.collection.HashMap

/**
 * Model representing an API response
 */
public class ApiResponse {
    public var statusCode: Int32;
    public var headers: HashMap<String, String>;
    public var body: String;
    public var success: Bool;
    
    public init(statusCode: Int32, body: String) {
        this.statusCode = statusCode
        this.body = body
        this.headers = HashMap<String, String>()
        this.success = statusCode >= 200 && statusCode < 300
    }
    
    /**
     * Add a header to the response
     */
    public func addHeader(key: String, value: String): ApiResponse {
        this.headers.add(key, value)
        return this
    }
    
    /**
     * Check if the response indicates success
     */
    public func isSuccessful(): Bool {
        return this.success
    }
    
    /**
     * Get the response body as a string
     */
    public func getBody(): String {
        return this.body
    }
    
    /**
     * Try to extract a specific field from the response JSON
     */
    public func extractField(fieldName: String): Option<String> {
        // Simplified field extraction from JSON response
        // In a real implementation, this would use a proper JSON parser
        
        // Look for the field in the response
        let lowerBody = body.toAsciiLower()
        let lowerField = fieldName.toAsciiLower()
        
        if (lowerBody.contains(lowerField)) {
            // Attempt to extract the value
            let parts = body.split("${fieldName}")
            if (parts.size > 1) {
                let remaining = parts[1]
                
                // Look for the value between quotes
                if (remaining.contains(":") && remaining.contains('"')) {
                    let afterColon = remaining.split(":")[1].trimAscii()
                    if (afterColon.startsWith("\"")) {
                        let quoteParts = afterColon.split('"')
                        if (quoteParts.size >= 2) {
                            return Some(quoteParts[1])
                        }
                    }
                }
            }
        }
        
        return None
    }
}