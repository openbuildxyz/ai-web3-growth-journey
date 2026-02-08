/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src

import std.collection.HashMap
import stdx.encoding.json.JsonValue
import stdx.encoding.json.*
import std.time.DateTime
import std.core.StringBuilder

/**
 * Error types for UCToo API Skills
 */
public enum ErrorType <: ToString {
    | AUTHENTICATION_ERROR
    | AUTHORIZATION_ERROR
    | VALIDATION_ERROR
    | NETWORK_ERROR
    | API_ERROR
    | PARSING_ERROR
    | UNKNOWN_ERROR

    public override func toString(): String {
        match (this) {
            case AUTHENTICATION_ERROR => "AUTHENTICATION_ERROR"
            case AUTHORIZATION_ERROR => "AUTHORIZATION_ERROR"
            case VALIDATION_ERROR => "VALIDATION_ERROR"
            case NETWORK_ERROR => "NETWORK_ERROR"
            case API_ERROR => "API_ERROR"
            case PARSING_ERROR => "PARSING_ERROR"
            case UNKNOWN_ERROR => "UNKNOWN_ERROR"
        }
    }
}

/**
 * Represents an error in the UCToo API Skills system
 */
public class SkillError {
    public var errorType: ErrorType
    public var message: String
    public var details: HashMap<String, String>
    public var timestamp: String
    
    public init(errorType: ErrorType, message: String) {
        this.errorType = errorType
        this.message = message
        this.details = HashMap<String, String>()
        this.timestamp = DateTime.now().toString()
    }
    
    /**
     * Add detail information to the error
     */
    public func addDetail(key: String, value: String): SkillError {
        this.details.add(key, value)
        return this
    }
    
    /**
     * Convert the error to a string representation
     */
    public func toString(): String {
        let sb = StringBuilder()
        sb.append("Error [")
        sb.append(timestamp)
        sb.append("]: ")
        sb.append(errorType.toString())
        sb.append(" - ")
        sb.append(message)

        if (!details.isEmpty()) {
            sb.append("\nDetails: ")
            for ((key, value) in details.iterator()) {
                sb.append("\n  ")
                sb.append(key)
                sb.append(": ")
                sb.append(value)
            }
        }

        return sb.toString()
    }
}

/**
 * Error Handler for UCToo API Skills
 * Manages errors and exceptions throughout the system
 */
public class ErrorHandler {
    
    /**
     * Handle an exception and return a formatted error message
     */
    public static func handleError(ex: Exception): String {
        let error = createSkillError(ErrorType.UNKNOWN_ERROR, "An unexpected error occurred", ex.message)
        logError(error)
        return formatErrorResponse(error)
    }
    
    /**
     * Handle a specific error type
     */
    public static func handleErrorWithType(errorType: ErrorType, message: String, details: HashMap<String, String>): String {
        let error = createSkillError(errorType, message, "")
        for ((key, value) in details.iterator()) {
            error.addDetail(key, value)
        }
        logError(error)
        return formatErrorResponse(error)
    }
    
    /**
     * Create a SkillError instance
     */
    private static func createSkillError(errorType: ErrorType, message: String, exMessage: String): SkillError {
        let fullMessage = if (exMessage != "") { "${message}: ${exMessage}" } else { message }
        return SkillError(errorType, fullMessage);
    }
    
    /**
     * Log an error using the utility logger
     */
    private static func logError(error: SkillError): Unit {
        Utils.logStructured("ERROR", "ErrorHandler", "Error Occurred", 
            HashMap<String, String>([
                ("type", error.errorType.toString()),
                ("message", error.message),
                ("timestamp", error.timestamp)
            ]))
    }
    
    /**
     * Format an error response for API return
     */
    public static func formatErrorResponse(error: SkillError): String {
        let sb = StringBuilder()
        sb.append("{\n")
        sb.append("  \"error\": true,\n")
        sb.append("  \"type\": \"")
        sb.append(error.errorType.toString())
        sb.append("\",\n")
        sb.append("  \"message\": \"")
        sb.append(error.message.replace("\"", "\\\""))
        sb.append("\",\n")
        sb.append("  \"timestamp\": \"")
        sb.append(error.timestamp)
        sb.append("\"\n")

        if (!error.details.isEmpty()) {
            sb.append("  \"details\": {\n")
            var first = true
            for ((key, value) in error.details.iterator()) {
                if (!first) {
                    sb.append(",\n")
                }
                sb.append("    \"")
                sb.append(key.replace("\"", "\\\""))
                sb.append("\": \"")
                sb.append(value.replace("\"", "\\\""))
                sb.append("\"")
                first = false
            }
            sb.append("\n  }\n")
        }

        sb.append("}")

        return sb.toString()
    }
    
    /**
     * Validate input and return error if validation fails
     */
    public static func validateInput(input: HashMap<String, JsonValue>): Option<SkillError> {
        if (input.isEmpty()) {
            return Some(createSkillError(ErrorType.VALIDATION_ERROR, "Input cannot be empty", ""))
        }
        
        // Check for potentially unsafe content in the input
        for ((key, value) in input.iterator()) {
            let strValue = value.toString()
            if (strValue.contains("<script") || strValue.contains("javascript:") || strValue.contains("vbscript:")) {
                return Some(createSkillError(ErrorType.VALIDATION_ERROR, "Potentially unsafe input detected", ""))
            }
        }

        return None
    }
    
    /**
     * Handle API-specific errors
     */
    public static func handleApiError(statusCode: Int32, responseBody: String): String {
        let errorType = match (statusCode) {
            case 401 => ErrorType.AUTHENTICATION_ERROR
            case 403 => ErrorType.AUTHORIZATION_ERROR
            case 400 => ErrorType.VALIDATION_ERROR
            case 404 => ErrorType.API_ERROR
            case 500 => ErrorType.API_ERROR
            case 502 => ErrorType.NETWORK_ERROR
            case 503 => ErrorType.NETWORK_ERROR
            case 504 => ErrorType.NETWORK_ERROR
            case _ => ErrorType.UNKNOWN_ERROR
        }
        
        let message = match (statusCode) {
            case 401 => "Unauthorized: Please authenticate first"
            case 403 => "Forbidden: Insufficient permissions"
            case 400 => "Bad Request: Invalid parameters"
            case 404 => "Not Found: The requested resource does not exist"
            case 500 => "Internal Server Error"
            case 502 => "Bad Gateway: Network error communicating with backend"
            case 503 => "Service Unavailable: Backend service is temporarily unavailable"
            case 504 => "Gateway Timeout: Request timed out"
            case _ => "API Error: Status code ${statusCode}"
        }
        
        let error = createSkillError(errorType, message, "")
        error.addDetail("status_code", "${statusCode}")
        error.addDetail("response_body", responseBody)
        
        logError(error)
        return formatErrorResponse(error)
    }
}