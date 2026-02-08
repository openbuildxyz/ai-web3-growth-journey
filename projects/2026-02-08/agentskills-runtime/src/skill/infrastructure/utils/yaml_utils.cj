/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.utils

import std.collection.HashMap
import stdx.encoding.json.*
import yaml4cj.yaml.*

/**
 * YAML utilities for processing YAML content using the yaml4cj library from the Cangjie ecosystem.
 */
public class YamlUtils {
    /**
     * Parse YAML content into a HashMap
     * yaml4cj.decode returns a JsonValue which can be JsonObject (for mappings)
     */
    public static func parseYamlContent(content: String): Option<HashMap<String, String>> {
        try {
            let yamlBytes = content.toArray()
            let parsedYaml = decode(yamlBytes)

            // Convert the parsed YAML to a HashMap<String, String>
            let result = HashMap<String, String>()

            // yaml4cj decode returns a JsonValue
            // For YAML mappings, it returns a JsonObject
            if (parsedYaml is JsonObject) {
                let jsonObj = parsedYaml as JsonObject
                if (jsonObj.isSome()) {
                    let obj = jsonObj.getOrThrow()
                    convertJsonObjectToHashMap(obj, result)
                }
            }

            return Some(result)
        } catch (ex: Exception) {
            // Handle the exception appropriately
            return None
        }
    }

    /**
     * Convert a JsonObject to HashMap<String, String>
     */
    private static func convertJsonObjectToHashMap(obj: JsonObject, result: HashMap<String, String>): Unit {
        // Get all fields from the JsonObject
        let fields = obj.getFields()
        for ((key, value) in fields) {
            let valueStr = jsonValueToString(value)
            result.add(key, valueStr)
        }
    }

    /**
     * Convert a JsonValue to a String representation
     */
    private static func jsonValueToString(value: JsonValue): String {
        // Use 'is' operator to check the actual type
        if (value is JsonString) {
            let strVal = value as JsonString
            if (strVal.isSome()) {
                return strVal.getOrThrow().getValue()
            }
            return ""
        } else if (value is JsonInt) {
            let intVal = value as JsonInt
            if (intVal.isSome()) {
                return intVal.getOrThrow().getValue().toString()
            }
            return "0"
        } else if (value is JsonFloat) {
            let floatVal = value as JsonFloat
            if (floatVal.isSome()) {
                return floatVal.getOrThrow().getValue().toString()
            }
            return "0.0"
        } else if (value is JsonBool) {
            let boolVal = value as JsonBool
            if (boolVal.isSome()) {
                return boolVal.getOrThrow().getValue().toString()
            }
            return "false"
        } else if (value is JsonNull) {
            return "null"
        } else {
            return value.toString()
        }
    }

    /**
     * Validate YAML syntax
     */
    public static func validateYamlSyntax(content: String): Bool {
        try {
            let yamlBytes = content.toArray()
            let _ = decode(yamlBytes)
            return true
        } catch (ex: Exception) {
            return false
        }
    }

    /**
     * Extract YAML frontmatter from content (content between --- and ---)
     */
    public static func extractYamlFrontmatter(content: String): Option<String> {
        let lines = content.split("\n")

        var startIndex = -1
        var endIndex = -1

        for (i in 0..lines.size) {
            if (lines[i].trimAscii() == "---") {
                if (startIndex == -1) {
                    startIndex = i
                } else {
                    endIndex = i
                    break
                }
            }
        }

        if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
            let frontmatterLines = lines[(startIndex + 1)..endIndex]
            return Some(String.join(frontmatterLines, delimiter: "\n"))
        }

        return None
    }
}
