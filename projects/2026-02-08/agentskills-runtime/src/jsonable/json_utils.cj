/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.jsonable

import stdx.encoding.json.*
import std.collection.{map, collectArray}

protected struct JsonUtils {
    public static func buildJsonObject(key: String, value: String): JsonObject {
        let j = JsonObject()
        j.put(key, JsonString(value))
        return j
    }

    public static func buildJsonObject(items: Array<(String, String)>): JsonObject {
        let obj = JsonObject()
        for ((k, v) in items) {
            obj.put(k, JsonString(v))
        }
        return obj
    }

    public static func buildJsonObject(items: Array<(String, JsonValue)>): JsonObject {
        let obj = JsonObject()
        for ((k, v) in items) {
            obj.put(k, v)
        }
        return obj
    }

    public static func buildJsonArray(items: Array<String>): JsonArray {
        return JsonArray(
            items |> map { v => (JsonString(v) as JsonValue).getOrThrow() } |> collectArray
        )
    }

    public static func buildJsonArray<T>(items: Array<T>): JsonArray where T <: JsonValue {
        return JsonArray(
            items |> map { v => (v as JsonValue).getOrThrow() } |> collectArray
        )
    }

    public static func appendJsonObject(obj: JsonObject, items: Array<(String, String)>): JsonObject {
        for ((k, v) in items) {
            obj.put(k, JsonString(v))
        }
        return obj
    }

    public static func asJsonObject(j: JsonValue): Option<JsonObject> {
        match (j.kind()) {
            case JsonKind.JsObject => return j.asObject()
            case _ => None
        }
    }

    public static func asJsonArray(j: JsonValue): Option<JsonArray> {
        match (j.kind()) {
            case JsonKind.JsArray => return j.asArray()
            case JsonKind.JsNull => return Some(JsonArray())
            case _ => return None
        }
    }

    //======================================================

    public static func toString(j: JsonValue): Option<String> {
        match (j.kind()) {
            case JsonKind.JsString => return j.asString().getValue()
            case JsonKind.JsNull => return Some("")
            case _ => return None
        }
    }

    public static func toFloat(j: JsonValue): Option<Float64> {
        match (j.kind()) {
            case JsonKind.JsFloat => return j.asFloat().getValue()
            case JsonKind.JsInt => return Float64(j.asInt().getValue())
            case JsonKind.JsNull => return Some(0.0)
            case _ => return None
        }
    }

    public static func toInt(j: JsonValue): Option<Int64> {
        match (j.kind()) {
            case JsonKind.JsInt => return j.asInt().getValue()
            case JsonKind.JsNull => return Some(0)
            case _ => return None
        }
    }

    public static func toBool(j: JsonValue): Option<Bool> {
        match (j.kind()) {
            case JsonKind.JsBool => return j.asBool().getValue()
            case JsonKind.JsNull => return Some(false)
            case _ => return None
        }
    }

    //======================================================

    public static func getJsonValue(j: JsonValue, key: String): Option<JsonValue> {
        if (let Some(jo) <- JsonUtils.asJsonObject(j)) {
            return jo.get(key)
        }
        return None
    }

    public static func getJsonObject(j: JsonValue, key: String): Option<JsonObject> {
        if (let Some(jo) <- JsonUtils.asJsonObject(j)) {
            match (jo.get(key)) {
                case Some(value) => return JsonUtils.asJsonObject(value)
                case None => return None
            }
        }
        return None
    }

    public static func getJsonArray(j: JsonValue, key: String): Option<JsonArray> {
        if (let Some(jo) <- JsonUtils.asJsonObject(j)) {
            match (jo.get(key)) {
                case Some(value) => return JsonUtils.asJsonArray(value)
                case None => return None
            }
        }
        return None
    }

    public static func getString(j: JsonValue, key: String): Option<String> {
        if (let Some(jo) <- JsonUtils.asJsonObject(j)) {
            match (jo.get(key)) {
                case Some(value) => return JsonUtils.toString(value)
                case None => return None
            }
        }
        return None
    }

    public static func getFloat(j: JsonValue, key: String): Option<Float64> {
        if (let Some(jo) <- JsonUtils.asJsonObject(j)) {
            match (jo.get(key)) {
                case Some(value) => return JsonUtils.toFloat(value)
                case None => return None
            }
        }
        return None
    }

    public static func getInt(key: String, j: JsonValue): Option<Int64> {
        if (let Some(jo) <- JsonUtils.asJsonObject(j)) {
            match (jo.get(key)) {
                case Some(value) => return JsonUtils.toInt(value)
                case None => return None
            }
        }
        return None
    }

    public static func getBool(j: JsonValue, key: String): Option<Bool> {
        if (let Some(jo) <- JsonUtils.asJsonObject(j)) {
            match (jo.get(key)) {
                case Some(value) => return JsonUtils.toBool(value)
                case None => return None
            }
        }
        return None
    }

    public static func toFloatArray(j: JsonArray): Array<Float64> {
        return j.getItems() |>
            map { item: JsonValue =>
                JsonUtils.toFloat(item).getOrThrow()
            } |>
            collectArray
    }
}