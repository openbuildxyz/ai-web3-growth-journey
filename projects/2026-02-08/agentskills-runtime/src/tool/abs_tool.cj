/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tool

import magic.core.tool.*
import magic.jsonable.JsonUtils

import std.collection.{ArrayList, HashMap}
import stdx.encoding.json.{JsonValue, JsonObject, JsonString, JsonArray}

public abstract class AbsTool <: Tool {
    protected var _extra = HashMap<String, String>()

    override public prop extra: HashMap<String, String> {
        get() { _extra }
    }

    public func toJsonValue(): JsonValue {
        let properties = JsonObject()
        let required = ArrayList<String>()
        for (param in this.parameters) {
            let paramTypeSchema = param.typeSchema.toJsonValue().asObject()
            // description should be added to the type schema
            if (!param.description.isEmpty()) {
                paramTypeSchema.put("description", JsonString(param.description))
            }
            properties.put(param.name, paramTypeSchema)
            required.add(param.name)
        }
        let toolSchema = JsonUtils.buildJsonObject([
            ("name", JsonString(name)),
            ("description", JsonString(description)),
            ("parameters", JsonUtils.buildJsonObject([
                ("type", JsonString("object")),
                ("properties", properties),
                ("required", JsonUtils.buildJsonArray(required.toArray()))]))
            // ("result", retType.toJsonValue())
        ])
        if (!examples.isEmpty()) {
            toolSchema.put("examples", JsonUtils.buildJsonArray(examples))
        }
        return toolSchema
    }
}
