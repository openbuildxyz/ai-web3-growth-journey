/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import magic.utils.{readFile, writeFile}

import std.collection.HashMap
import std.fs.Path
import stdx.serialization.serialization.*
import stdx.encoding.json.*

/**
 * A simple index -> String map
 * Use a hashmap to store the map and save it as a json file
 */
public class SimpleIndexMap <: IndexMap<SimpleIndexMap, String> &Serializable<SimpleIndexMap> {
    // Since we use DataModel to serialize the map, its key should also be String
    var map = HashMap<String, String>()

    public func set(index: Int64, content: String): Unit {
        map.add(index.toString(), content)
    }

    override public func add(content: String): Unit {
        set(map.size, content)
    }

    override public func get(index: Int64): String {
        return map[index.toString()]
    }

    public func serialize(): DataModel {
        return DataModelStruct().add(field<HashMap<String, String>>("map", map))
    }

    public static func deserialize(dm: DataModel): SimpleIndexMap {
        let dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let result = SimpleIndexMap()
        result.map = HashMap<String, String>.deserialize(dms.get("map"))
        return result
    }

    override public func save(filePath: String): Unit {
        writeFile(Path(filePath), this.serialize().toJson().toString())
    }

    redef public static func load(filePath: String): SimpleIndexMap {
        let jsonStr = readFile(Path(filePath))
        let jv = JsonValue.fromStr(jsonStr)
        let dm = DataModelStruct.fromJson(jv)
        return SimpleIndexMap.deserialize(dm)
    }
}