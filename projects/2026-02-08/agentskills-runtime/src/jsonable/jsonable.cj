/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.jsonable

import std.collection.{ArrayList, HashMap, map, collectArray}
import stdx.encoding.json.*

public interface ToJsonValue {
    func toJsonValue(): JsonValue
}

public interface FromJsonValue<T> {
    /**
     * Deserialize from a Json value
     */
    static func fromJsonValue(json: JsonValue): T
}

public interface Jsonable<T> <: FromJsonValue<T> & ToJsonValue /* where T <: Jsonable<T> */ {
    /**
     * Get the type schema of T
     */
    static func getTypeSchema(): TypeSchema

    /**
     * Deserialize from a Json string
     * Since there is a bug in cjc 0.53.x, we cannot add this method.
     * Fix it later.
     */
    // static func fromJsonStr(jsonStr: String): T {
    //     return T.fromJsonValue(JsonValue.fromStr(jsonStr))
    // }
}

public class JsonableException <: Exception {
    public init(msg: String) {
        super(msg)
    }
}

extend String <: Jsonable<String> {
    public static func getTypeSchema(): TypeSchema {
        return TypeSchema.Str
    }

    public static func fromJsonValue(json: JsonValue): String {
        JsonUtils.toString(json).getOrThrow({
            => JsonableException("Convert to String error. Value: ${json.toJsonString()}")
        })
    }

    public func toJsonValue(): JsonValue {
        return JsonString(this)
    }
}

extend Int64 <: Jsonable<Int64> {
    public static func getTypeSchema(): TypeSchema {
        return TypeSchema.Int
    }

    public static func fromJsonValue(json: JsonValue): Int64 {
        JsonUtils.toInt(json).getOrThrow({ =>
            JsonableException("Convert to Int error. Value: ${json.toJsonString()}")
        })
    }

    public func toJsonValue(): JsonValue {
        return JsonInt(this)
    }
}

extend Float64 <: Jsonable<Float64> {
    public static func getTypeSchema(): TypeSchema {
        return TypeSchema.Float
    }

    public static func fromJsonValue(json: JsonValue): Float64 {
        JsonUtils.toFloat(json).getOrThrow({ =>
            JsonableException("Convert to Float error. Value: ${json.toJsonString()}")
        })
    }

    public func toJsonValue(): JsonValue {
        return JsonFloat(this)
    }
}

extend Bool <: Jsonable<Bool> {
    public static func getTypeSchema(): TypeSchema {
        return TypeSchema.Boolean
    }

    public static func fromJsonValue(json: JsonValue): Bool {
        JsonUtils.toBool(json).getOrThrow({
            => JsonableException("Convert to Bool error. Value: ${json.toJsonString()}")
        })
    }

    public func toJsonValue(): JsonValue {
        return JsonBool(this)
    }
}

extend<T> Array<T> <: FromJsonValue<Array<T>> where T <: FromJsonValue<T> {
    public static func fromJsonValue(json: JsonValue): Array<T> {
        let jsArr = JsonUtils.asJsonArray(json).getOrThrow({
                => JsonableException("Convert to Array error. Value: ${json.toJsonString()}")
        })
        return jsArr.getItems() |>
               map { item: JsonValue => T.fromJsonValue(item) } |>
               collectArray
    }
}

extend<T> Array<T> <: ToJsonValue where T <: ToJsonValue {
    public func toJsonValue(): JsonValue {
        return JsonArray(
            this |> map<T, JsonValue>({ value: T => value.toJsonValue() }) |> collectArray
        )
    }
}

extend<T> Array<T> <: Jsonable<Array<T>> where T <: Jsonable<T> {
    public static func getTypeSchema(): TypeSchema {
        return TypeSchema.Arr(T.getTypeSchema())
    }
}

//------------------------------------------------------------------------

extend<T> ArrayList<T> <: FromJsonValue<ArrayList<T>> where T <: FromJsonValue<T> {
    public static func fromJsonValue(json: JsonValue): ArrayList<T> {
        let jsArr = JsonUtils.asJsonArray(json).getOrThrow({
                => JsonableException("Convert to ArrayList error. Value: ${json.toJsonString()}")
        })
        let arr = jsArr.getItems() |>
                  map { item: JsonValue => T.fromJsonValue(item) } |>
                  collectArray
        return ArrayList<T>(arr)
    }
}

extend<T> ArrayList<T> <: ToJsonValue where T <: ToJsonValue {
    public func toJsonValue(): JsonValue {
        return JsonArray(
            this.iterator() |>
            map { value: T => value.toJsonValue() } |>
            collectArray
        )
    }
}

extend<T> ArrayList<T> <: Jsonable<ArrayList<T>> where T <: Jsonable<T> {
    public static func getTypeSchema(): TypeSchema {
        return TypeSchema.Arr(T.getTypeSchema())
    }
}

//------------------------------------------------------------------------

extend<T> Option<T> <: Jsonable<Option<T>> where T <: Jsonable<T> {
    public static func getTypeSchema(): TypeSchema {
        // Option<T> has the same type schema as T
        // However, Option<T> is not required
        return T.getTypeSchema()
    }

    public static func fromJsonValue(json: JsonValue): Option<T> {
        if (let JsonKind.JsNull <- json.kind()) {
            return None
        }
        return Some(T.fromJsonValue(json))
    }

    public func toJsonValue(): JsonValue {
        if (let Some(value) <- this) {
            return value.toJsonValue()
        } else {
            return JsonNull()
        }
    }
}

extend<T> HashMap<String, T> <: FromJsonValue<HashMap<String, T>> where T <: FromJsonValue<T> {
    public static func fromJsonValue(json: JsonValue): HashMap<String, T> {
        let map = HashMap<String, T>()
        let jsObj = JsonUtils.asJsonObject(json).getOrThrow({
                => JsonableException("Convert to HashMap error. Value: ${json.toJsonString()}")
        })
        for ((key, value) in jsObj.getFields()) {
            map.add(key, T.fromJsonValue(value))
        }
        return map
    }
}

extend<T> HashMap<String, T> <: ToJsonValue where T <: ToJsonValue {
    public func toJsonValue(): JsonValue {
        let map = HashMap<String, JsonValue>()
        for ((key, value) in this) {
            map.add(key, value.toJsonValue())
        }
        return JsonObject(map)
    }
}

extend<T> HashMap<String, T> <: Jsonable<HashMap<String, T>> where T <: Jsonable<T> {
    public static func getTypeSchema(): TypeSchema {
        // A hash map can be de/serialize to a JSON object;
        // however, it has no type schemas because its fields are non-determined.
        throw JsonableException("HashMap has no type schema")
    }
}

extend JsonObject <: Jsonable<JsonObject> {
    public func toJsonValue(): JsonValue {
        return this
    }

    public static func getTypeSchema(): TypeSchema {
        return TypeSchema.Obj([])
    }

    public static func fromJsonValue(json: JsonValue): JsonObject {
        return json.asObject()
    }
}