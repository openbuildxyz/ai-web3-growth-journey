/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src

import std.collection.HashMap
import std.console.Console
import std.env.*
import std.env.getVariable
import std.convert.*

/**
 * Configuration management for UCToo API Skills
 * Handles environment variables and system configuration
 */
public class Config {
    public static var BACKEND_URL: String = getEnvOrDefault("BACKEND_URL", "https://javatoarktsapi.uctoo.com")
    public static var DEFAULT_TIMEOUT: Int32 = parseInt32OrDef(getEnvOrDefault("DEFAULT_TIMEOUT", "10000"), 10000)
    public static var LOG_LEVEL: String = getEnvOrDefault("LOG_LEVEL", "INFO")
    public static var API_KEY: Option<String> = getVariable("UCTOO_API_KEY")
    public static var BASE_URL: Option<String> = getVariable("BASE_URL")
    
    /**
     * Get environment variable or return default value
     */
    private static func getEnvOrDefault(key: String, defaultValue: String): String {
        return if (let Some(value) <- getVariable(key)) { value } else { defaultValue }
    }
    
    /**
     * Parse integer from string or return default value
     */
    private static func parseInt32OrDef(str: String, defaultValue: Int32): Int32 {
        try {
            return Int32.parse(str)
        } catch (ex: Exception) {
            return defaultValue
        }
    }
}