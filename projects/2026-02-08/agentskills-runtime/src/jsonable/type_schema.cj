/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.jsonable

import std.collection.{HashMap, map, collectArray, ArrayList}
import stdx.encoding.json.{JsonValue, JsonObject, JsonString}
import stdx.encoding.json.JsonArray

public struct FieldSchema {
    public FieldSchema (
        public let name: String,
        public let description: String,
        public let typeSchema: TypeSchema,
        public let required!: Bool = true
    ) { }
}

public enum TypeSchema <: ToJsonValue & ToString {
    | Str
    | Int
    | Float
    | Boolean
    | Arr(TypeSchema)
    | Enum(Array<String>)
    | Obj(Array<FieldSchema>)

    override public func toJsonValue(): JsonValue {
        let jo = JsonObject()
        match (this) {
            case Str => jo.put("type", JsonString("string"))
            case Int => jo.put("type", JsonString("integer"))
            case Float => jo.put("type", JsonString("number"))
            case Boolean => jo.put("type", JsonString("boolean"))
            case Arr(ts) =>
                jo.put("type", JsonString("array"))
                jo.put("items", ts.toJsonValue())
            case Enum(values) =>
                jo.put("type", JsonString("string"))
                jo.put("enum", JsonUtils.buildJsonArray(values))
            case Obj(fields) =>
                jo.put("type", JsonString("object"))
                let propertiesJo = JsonObject()
                let required = ArrayList<JsonValue>()
                for (field in fields) {
                    let fieldTsJo = field.typeSchema.toJsonValue().asObject()
                    if (!field.description.isEmpty()) {
                        fieldTsJo.put("description", JsonString(field.description))
                    }
                    propertiesJo.put(field.name, fieldTsJo)
                    if (field.required) {
                        required.add(JsonString(field.name))
                    }
                }
                if (!fields.isEmpty()) {
                    jo.put("properties", propertiesJo)
                    jo.put("required", JsonArray(required))
                }
        }
        return jo
    }

    override public func toString(): String {
        return this.toJsonValue().toJsonString()
    }
}
