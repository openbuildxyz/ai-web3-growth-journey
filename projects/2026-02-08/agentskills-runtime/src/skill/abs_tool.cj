/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.tool.{Tool, ToolParameter, ToolResponse}
import magic.jsonable.TypeSchema
import std.collection.HashMap
import stdx.encoding.json.JsonValue

/**
 * Interface for skills that extends the Tool interface
 */
public interface AbsTool <: Tool {
    // Properties that need to be implemented by implementers
    prop name: String
    prop description: String
    prop parameters: Array<ToolParameter>
    prop retType: TypeSchema
    prop examples: Array<String>
    prop extra: HashMap<String, String>

    /**
     * Invoke the tool with the given arguments
     */
    func invoke(args: HashMap<String, JsonValue>): ToolResponse
}