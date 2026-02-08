/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.parser

import magic.core.tool.ToolRequest
import magic.jsonable.{Jsonable, JsonUtils, JsonableException}
import magic.log.LogUtils

import std.collection.{map, collectArray}
import stdx.encoding.json.*

/**
 * Represent which Json type to extract
 */
public enum ExtractGoal {
    | Object
    | Array
}

public struct ParserUtils {
    private static func extractCode(str: String, lang: String, last!: Bool): Option<String> {
        let langStartMark = "```${lang}"
        let langEndMark = "```"
        let found = if (last) {
            str.lastIndexOf(langStartMark)
        } else {
            str.indexOf(langStartMark)
        }
        if (let Some(start) <- found) {
            let contentStart = start + langStartMark.size
            // Code blocks may be nested, like ```plain ```json ... ``` ```
            var nested = 0
            var currStart = contentStart
            while (let Some(pos) <- str.indexOf(langEndMark, currStart)) {
                // Check whether ``` or ```xxx is found
                let posAfterEndMark = pos + langEndMark.size
                // Case 1: ``` is found, which is a close mark
                if (posAfterEndMark == str.size ||
                    !str[posAfterEndMark].isAsciiLetter()) {
                    if (nested == 0) {
                        return str[contentStart..pos].trimAscii()
                    } else {
                        nested -= 1
                    }
                } else { // Case 2: ```xxx is found, which means a new nested code block starts
                    nested += 1
                }
                currStart = posAfterEndMark
            }
        }
        return None  // The target section is not found
    }

    /**
     * Extract a JSON object/array from the string using a heuristic method.
     * This method tries to find the first complete JSON object/array in the string.
     * It is not guaranteed to work in all cases, but it is useful for quick extraction.
     * `target`:
     */
    private static func extractFirstJsonWithHeuristic(str: String, goal!: ExtractGoal): Option<String> {
        let (beginSymbol, endSymbol) = match(goal) {
            case ExtractGoal.Object => (b'{', b'}')
            case ExtractGoal.Array => (b'[', b']')
        }
        let start = if (let Some(idx) <- str.indexOf(beginSymbol)) {
            idx
        } else {
            return None
        }
        var numberOfBraces = 0
        var inString = false
        var escaped = false
        for (idx in start..str.size) {
            let ch = str[idx]
            if (ch == beginSymbol && !inString) {
                numberOfBraces += 1
            } else if (ch == endSymbol && !inString) {
                numberOfBraces -= 1
                // Found the end of the JSON object
                if (numberOfBraces == 0) {
                    let jsonStr = str[start..(idx+1)].trimAscii()
                    // Test whether it's a valid JSON string
                    try {
                        let _ = JsonValue.fromStr(jsonStr)
                        return jsonStr
                    } catch (ex: JsonException) {
                        return None
                    }
                }
            } else if (ch == b'"' && !escaped) {
                inString = !inString
            }
            escaped = (ch == b'\\' && !escaped)
        }
        return None
    }

    /**
     * Extract the last code block of the specified language from the string.
     */
    public static func extractLastCode(str: String, lang: String): Option<String> {
        return extractCode(str, lang, last: true)
    }

    /**
     * Extract the first code block of the specified language from the string.
     */
    public static func extractFirstCode(str: String, lang: String): Option<String> {
        return extractCode(str, lang, last: false)
    }

    private static func parseToolRequest(json: JsonValue): ToolRequest {
        // LLM may return tool name as "name", "function", or "tool" because of hallucination
        // Heuristic: use a loop to try "name", "function", and "tool" in order
        var name = ""
        for (key in ["name", "function", "tool"]) {
            name = JsonUtils.getString(json, key) ?? ""
            if (!name.isEmpty()) {
                break
            }
        }
        if (name.isEmpty()) {
            throw ParserException("Failed to parse tool request: tool name is missing")
        }
        // Heuristic: use a loop to try "arguments", "parameters", "argument", "parameter", and "args" in order
        var args: Option<JsonObject> = None
        for (key in ["arguments", "parameters", "argument", "parameter", "args"]) {
            args = JsonUtils.getJsonObject(json, key)
            if (args.isSome()) {
                return ToolRequest(name: name, args: args.getOrThrow())
            }
        }
        throw ParserException("Failed to parse tool request: arguments are missing")
    }

    public static func extractToolRequest(str: String): ToolRequest {
        let json  = extractFirstJsonValue(str, goal: ExtractGoal.Object)
        return parseToolRequest(json)
    }

    public static func extractToolRequestArray(str: String): Array<ToolRequest> {
        let json  = extractFirstJsonValue(str, goal: ExtractGoal.Array)
        if (let Some(ja) <- JsonUtils.asJsonArray(json)) {
            return ja.getItems() |> map { jv => parseToolRequest(jv) } |> collectArray
        } else {
            throw ParserException("Failed to parse tool request array: not array")
        }
    }

    /**
     * The Json extraction may fail, e.g.,
     * - it will fail to extract ```json "abc```" ``` because of nested ``` symbols,
     * - or, there is no ```json marks.
     * So, we use a heuristic method to extract the JSON string if failed.
     */
    public static func extractFirstJsonValue(str: String, goal!: ExtractGoal): JsonValue {
        if (let Some(jsonStr) <- extractCode(str, "json", last: false)) {
            try {
                LogUtils.trace("Extracted JSON string: `${jsonStr}`")
                return JsonValue.fromStr(jsonStr)
            } catch (ex: JsonException) {
                // If the string is not a valid JSON object, try to extract again using heuristic;
                // so, this exception is not thrown
                LogUtils.trace("Failed to parse the string as JSON: `${str}`; trying heuristic extraction")
            }
        }
        if (let Some(jsonStr) <- extractFirstJsonWithHeuristic(str, goal: goal)) {
            LogUtils.trace("Extracted JSON string with heuristic: `${jsonStr}`")
            try {
                return JsonValue.fromStr(jsonStr)
            } catch (ex: JsonException) {
                let msg = "Failed to parse the string as JSON: `${jsonStr}`"
                LogUtils.debug(msg)
                throw ParserException(msg)
            }
        } else {
            // The error message "NO JSON" is IMPORTANT, which will be used in JSON retrying
            throw ParserException("There is NO JSON output in the string: ${str}")
        }
    }

    /**
     * Extract the last value of the specified type from a string that contains a JSON value.
     */
    public static func extractFirstValue<T>(str: String): T where T <: Jsonable<T> {
        // Parse the JSON string to the expected type
        let jv = extractFirstJsonValue(str, goal: ExtractGoal.Object)
        try {
            return T.fromJsonValue(jv)
        } catch (ex: JsonableException) {
            throw JsonableException("Failed to convert the JSON value `${jv}` as the specified type")
        }
    }
}