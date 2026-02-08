/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import magic.jsonable.Jsonable
import magic.prompt.ToPrompt
import magic.utils.writeFile

import std.fs.{Path, File, OpenMode}
import std.io.{StringReader, StringWriter}
import std.collection.{ArrayList, map, filter, collectArrayList, collectArray}
import stdx.encoding.json.JsonValue

/**
 * A index -> jsonvalue map
 * The line number (starting from 0) is its index
 */
public class JsonlIndexMap<T> <: IndexMap<JsonlIndexMap<T>, T> where T <: Jsonable<T> & ToPrompt {
    private let values: ArrayList<T>

    private init(values: ArrayList<T>) {
        this.values = values
    }

    public init() {
        values = ArrayList<T>()
    }

    override public func add(content: T): Unit {
        values.add(content)
    }

    override public func get(index: Int64): T {
        return values[index]
    }

    override public func save(filePath: String): Unit {
        let content = String.join(
            this.values |> map { v => v.toJsonValue().toString() } |> collectArray,
            delimiter: "\n"
        )
        writeFile(Path(filePath), content)
    }

    redef public static func load(filePath: String): JsonlIndexMap<T> {
        let values = JsonlIndexMap<T>.loadJsonl(filePath)
        return JsonlIndexMap<T>(values)
    }

    private static func loadJsonl(filePath: String): ArrayList<T> {
        try (file = File(filePath, OpenMode.Read)) {
            let reader = StringReader(file)
            return reader.lines() |>
                filter { line: String =>
                    return !line.isEmpty()
                } |>
                map { line: String =>
                    return T.fromJsonValue(JsonValue.fromStr(line))
                } |>
                collectArrayList
        }
        throw UnsupportedException()
    }
}