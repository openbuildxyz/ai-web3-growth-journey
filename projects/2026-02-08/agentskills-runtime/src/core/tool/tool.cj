/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.tool

import magic.jsonable.TypeSchema
import magic.jsonable.ToJsonValue

import std.collection.HashMap
import stdx.encoding.json.JsonValue

public interface Tool <: ToJsonValue {
    /**
     * Unique id of a tool
     */
    prop name: String

    /**
     * Description of the tool
     * LLM will choose the tool according to the description
     */
    prop description: String

    /**
     * Type schema of tool inputs
     */
    prop parameters: Array<ToolParameter>

    /**
     * Return type of the tool
     * Not used currently
     */
    prop retType: TypeSchema

    /**
     * Examples of how to call the tool
     * Optional
     */
    prop examples: Array<String>

    /**
     * Extra customized attributes
     * available attributes:
     * - "filterable":  "false" | "true",
     *   whether this tool can be filtered out before agent executions
     * - "terminal": "true" | "true",
     *   whether this tool will terminate the agent execution
     * - "compactable": "true" | "false",
     *   whether the tool response can be compacted
     */
    prop extra: HashMap<String, String>

    /**
     * Arguments and their values are grouped in a hash map
     */
    func invoke(args: HashMap<String, JsonValue>): ToolResponse
}
