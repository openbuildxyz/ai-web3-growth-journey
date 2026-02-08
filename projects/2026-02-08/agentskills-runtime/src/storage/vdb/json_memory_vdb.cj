/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.storage.vdb

import magic.vdb.{SimpleIndexMap, VectorBuilder, InMemoryVectorDatabase, Vector}
import magic.core.model.EmbeddingModel
import magic.storage.kv.*
import magic.storage.LocalStorage
import magic.core.rag.Document
import magic.utils.{exists, removeIfExists}
import std.sync.*
import std.fs.{Path, Directory}
import std.collection.*
import stdx.encoding.json.*
import std.convert.Parsable

public class JsonMemoryVectorStorage <: LocalVectorStorage {
    private let _workspace: String
    private let _collection: String
    private let _indexPath: String
    private let _vectorBuilder: VectorBuilder
    private let _lock: ReentrantReadWriteMutex = ReentrantReadWriteMutex()
    private let _embeddingModel: EmbeddingModel
    private var _index: SimpleIndexMap
    private let _invertIndex: HashMap<String, Int64> = HashMap()
    private var _vdb: InMemoryVectorDatabase
    private let _vdbStorage: JsonKVStorage<Array<Float64>>

    public init(embeddingModel: EmbeddingModel, workspace!: String = ".storage", collection!: String = "default") {
        this._workspace = workspace
        this._collection = collection.toAsciiLower()
        this._indexPath = Path(this._workspace).join("${this._collection}_vector.index").toString()
        this._vectorBuilder = VectorBuilder(model: embeddingModel)
        this._embeddingModel = embeddingModel
        // load
        if (!exists(this._workspace)) {
            Directory.create(this._workspace, recursive: true)
        }
        if (!exists(this._indexPath)) {
            SimpleIndexMap().save(this._indexPath)
        }
        this._vdb = InMemoryVectorDatabase()
        this._index = SimpleIndexMap.load(this._indexPath)
        this._vdbStorage = JsonKVStorage(workspace: this._workspace, collection: "${this._collection}_vector")
        var i = 0
        while (let Some(vec) <- this._vdbStorage.get(i.toString())) {
            this._vdb.addVector(Vector(vec))
            let doc = Document.fromJsonValue(JsonValue.fromStr(this._index.get(i)))
            this._invertIndex.add(doc.id, i)
            i++
        }
    }

    public prop workspace: String {
        get() {
            this._workspace
        }
    }

    public prop collection: String {
        get() {
            this.collection
        }
    }

    public prop embeddingModel: EmbeddingModel {
        get() {
            this._embeddingModel
        }
    }

    public func commit(): Unit {
        try {
            _lock.writeMutex.lock()
            this._vdbStorage.commit()
            this._index.save(this._indexPath)
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func close(): Unit {
        try {
            _lock.writeMutex.lock()
            this._vdbStorage.close()
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func reset(): Unit {
        try {
            _lock.writeMutex.lock()
            removeIfExists(this._indexPath)
            this._index = SimpleIndexMap()
            this._index.save(this._indexPath)
            this._invertIndex.clear()
            this._vdb = InMemoryVectorDatabase()
            this._vdbStorage.reset()
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func query(query: String, topK: Int64, threshold!: Float64 = 0.6): Array<Document> {
        try {
            _lock.readMutex.lock()
            let vec = this._vectorBuilder.createEmbeddingVector(query)
            let offsets = this._vdb.search(vec, number: topK, minDistance: threshold)
            offsets |> map({sr => this._index.get(sr.index)}) |> map(
                {str => Document.fromJsonValue(JsonValue.fromStr(str))}) |> collectArray
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func queryWithScore(query: String, topK: Int64, threshold!: Float64 = 0.6): Array<(Document, Float64)> {
        try {
            _lock.readMutex.lock()
            let vec = this._vectorBuilder.createEmbeddingVector(query)
            let offsets = this._vdb.search(vec, number: topK, minDistance: threshold)
            offsets |> map({sr => (this._index.get(sr.index), sr.dist)}) |> map(
                {tuple => (Document.fromJsonValue(JsonValue.fromStr(tuple[0])), tuple[1])}) |> collectArray
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func add(doc: Document): Unit {
        try {
            _lock.writeMutex.lock()
            if (let Some(offset) <- this._invertIndex.get(doc.id)) {
                let docInDb = Document.fromJsonValue(JsonValue.fromStr(this._index.get(offset)))
                if (docInDb == doc) {
                    return
                }
                // doc changed, refresh doc value in index.
                this._index.set(offset, doc.toJsonValue().toString())
                if (docInDb.content == doc.content) {
                    return
                }
                let vec = this._vectorBuilder.createEmbeddingVector(doc.content)
                this._vdb.setVector(offset, vec)
                this._vdbStorage.upsert(offset.toString(), vec.vector)
            } else {
                let vec = this._vectorBuilder.createEmbeddingVector(doc.content)
                this._vdb.addVector(vec)
                this._index.add(doc.toJsonValue().toString())
                let offset = this._vdbStorage.insertInc(vec.vector)
                this._invertIndex.add(doc.id, Int64.parse(offset))
            }
        } finally {
            _lock.writeMutex.unlock()
        }
    }
}
