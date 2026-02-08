/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.Skill
import magic.core.tool.{Tool, ToolParameter, ToolResponse}
import magic.jsonable.TypeSchema
import magic.log.LogUtils
import std.collection.HashMap
import stdx.encoding.json.{JsonValue, JsonObject, JsonNull, JsonString}

/**
 * Adapter to make Skill compatible with Tool interface
 * Allows skills to be used in contexts that expect a Tool
 * This follows clean architecture principle by keeping skills independent
 * and only connecting them via this adapter layer
 */
public class SkillToToolAdapter <: Tool {
    private let _skill: Skill

    public init(skill!: Skill) {
        _skill = skill
    }

    public prop name: String {
        get() { _skill.name }
    }

    public prop description: String {
        get() { _skill.description }
    }

    public prop parameters: Array<ToolParameter> {
        get() {
            // Define a query parameter for natural language requests
            [
                ToolParameter("query", "The natural language query or request to process", TypeSchema.Str)
            ]
        }
    }

    public prop retType: TypeSchema {
        get() { TypeSchema.Str }
    }

    public prop examples: Array<String> {
        get() { [] }
    }

    public prop extra: HashMap<String, String> {
        get() { HashMap<String, String>() }
    }

    /**
     * Invoke the skill through the Tool interface
     */
    public func invoke(args: HashMap<String, JsonValue>): ToolResponse {
        try {
            // Log the arguments passed to the skill
            LogUtils.info("Invoking skill '${_skill.name}' with ${args.size.toString()} arguments")
            for ((key, value) in args) {
                LogUtils.info("  Arg '${key}': ${value.toString()}")
            }
            
            let result = _skill.execute(args)
            LogUtils.info("Raw skill result from '${_skill.name}': ${result}")
            
            let resultLength = result.size.toString()
            let first100Chars = if (result.size > 100) { result[0..100] } else { result }
            LogUtils.info("Result length: ${resultLength}, first 100 chars: ${first100Chars}")

            let trimmedResult = result.trimAscii()

            // Check specifically for known status strings that indicate execution status rather than actual response data
            if (trimmedResult == "Success" || trimmedResult == "Failure" || trimmedResult == "Partial") {
                LogUtils.error("Skill returned execution status instead of actual response: ${trimmedResult}")
                return ToolResponse("{\"error\": \"Skill returned invalid response format - returned status string instead of actual response\"}", isError: true)
            } else {
                // First, check if the result is already valid JSON
                if (trimmedResult.startsWith("{") || trimmedResult.startsWith("[")) {
                    LogUtils.info("Skill returned JSON response, treating as valid result")
                    
                    // Validate that it's actually valid JSON
                    try {
                        let _ = JsonValue.fromStr(result)
                        LogUtils.info("Skill returned valid JSON, returning as-is")
                        return ToolResponse(result, isError: false)
                    } catch (jsonEx: Exception) {
                        LogUtils.info("Skill returned JSON-like string but JSON parsing failed: ${jsonEx.message}")
                        // Fall through to wrap in JSON format
                    }
                }

                // Only check for status strings if the result is very short (likely to be a status)
                // This prevents misidentifying legitimate API responses that happen to start with S/F/P/R
                if (trimmedResult.size <= 5) {
                    if (trimmedResult == "Success" || trimmedResult == "Failure" || trimmedResult == "Partial" ||
                        trimmedResult == "Result" || trimmedResult == "Response" || trimmedResult == "Return" ||
                        trimmedResult == "OK" || trimmedResult == "Done") {
                        LogUtils.info("Skill returned very short status-like string, treating as potential status: ${trimmedResult}")
                        // For very short status-like strings, return as JSON to avoid parsing issues
                        let jsonResult = "{\"result\":\"" + result + "\",\"is_status_like\":true,\"warning\":\"Very short status-like string returned by skill\"}"
                        return ToolResponse(jsonResult, isError: false)
                    }
                } else {
                    // For longer strings, assume they are actual content even if starting with S/F/P/R
                    LogUtils.info("Long result string detected, treating as actual content despite starting character")
                }

                // If result is not JSON, wrap it in JSON format
                LogUtils.info("Skill result is not JSON, wrapping in JSON format")
                
                // Escape any quotes in the result to ensure valid JSON
                let escapedResult = result.replace("\"", "\\\"")
                let jsonResult = "{\"result\":\"" + escapedResult + "\",\"is_raw_response\":true}"
                
                LogUtils.info("Wrapped skill result in JSON format: " + (if (jsonResult.size > 200) { jsonResult[0..200] + "..." } else { jsonResult }))
                return ToolResponse(jsonResult, isError: false)
            }
        } catch (ex: Exception) {
            LogUtils.error("Exception in SkillToToolAdapter.invoke: ${ex.message}")
            return ToolResponse("{\"error\":\"Error executing skill\",\"message\":\"" + ex.message + "\",\"status\":\"error\"}", isError: true)
        }
    }

    /**
     * Convert to JSON value
     */
    public func toJsonValue(): JsonValue {
        let obj = JsonObject()
        obj.put("name", JsonString(_skill.name))
        obj.put("description", JsonString(_skill.description))
        obj.put("instructions", JsonString(_skill.instructions))

        // Add optional fields
        if (let Some(license) <- _skill.license) {
            obj.put("license", JsonString(license))
        } else {
            obj.put("license", JsonNull())
        }

        if (let Some(compatibility) <- _skill.compatibility) {
            obj.put("compatibility", JsonString(compatibility))
        } else {
            obj.put("compatibility", JsonNull())
        }

        // Add metadata
        let metadataObj = JsonObject()
        for ((key, value) in _skill.metadata) {
            metadataObj.put(key, JsonString(value))
        }
        obj.put("metadata", metadataObj)

        return obj
    }
}