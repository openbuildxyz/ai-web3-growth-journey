/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.rag

import magic.jsonable.*
import magic.prompt.ToPrompt
import magic.utils.calMd5

import std.collection.HashMap
import std.collection.ArrayList
import stdx.encoding.json.*
import stdx.serialization.serialization.*

public class Document <: Jsonable<Document> & ToString & ToPrompt & Serializable<Document> & Equatable<Document> {
    public let id: String
    public let content: String
    public let metadata: HashMap<String, String>

    public init(content: String, metadata!: HashMap<String, String> = HashMap()) {
        this(calMd5(content.trimAscii()), content, metadata: metadata)
    }

    public init(id: String, content: String, metadata!: HashMap<String, String>) {
        this.id = id
        this.content = content
        this.metadata = metadata
    }

    public override func toString(): String {
        let strBuilder = StringBuilder()
        strBuilder.append("id:${id}")
        strBuilder.append("\n")
        strBuilder.append("Metadata:")
        strBuilder.append(metadata.toString())
        strBuilder.append("\n")
        strBuilder.append("Content: ${content}")
        return strBuilder.toString()
    }

    public override func toPrompt(): String {
        return content
    }

    public static func getTypeSchema(): TypeSchema {
        return TypeSchema.Obj(
            [
                FieldSchema("id", "", String.getTypeSchema(), required: true),
                FieldSchema("content", "", String.getTypeSchema(), required: true),
                FieldSchema("metadata", "", HashMap<String, String>.getTypeSchema(), required: true)
            ]
        )
    }

    public static func fromJsonValue(json: JsonValue): Document {
        deserialize(DataModel.fromJson(json))
    }

    public func toJsonValue(): JsonValue {
        this.serialize().toJson()
    }

    public func serialize(): DataModel {
        let dm = DataModelStruct()
        dm.add(field<String>("id", id))
        dm.add(field<String>("content", content))
        dm.add(field<HashMap<String, String>>("metadata", metadata))
        return dm
    }

    public static func deserialize(dm: DataModel) {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let id = String.deserialize(dms.get("id"))
        let content = String.deserialize(dms.get("content"))
        let metadata = HashMap<String, String>.deserialize(dms.get("metadata"))
        return Document(id, content, metadata: metadata)
    }

    public func toJsonString(): String {
        return this.serialize().toJson().toString()
    }

    public operator func ==(other: Document): Bool {
        return this.id == other.id && this.content == other.content && this.metadata == other.metadata
    }

    @When[cjc_version < "1.0.0"]
    public operator func !=(other: Document): Bool {
        return !(this == other)
    }
}
