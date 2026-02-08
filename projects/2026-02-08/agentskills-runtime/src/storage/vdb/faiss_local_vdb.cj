/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.storage.vdb

@When[faiss == "enable"]
import magic.vdb.FaissVectorDatabase
import magic.vdb.{SimpleIndexMap, VectorBuilder}
import magic.core.model.EmbeddingModel
import magic.storage.kv.*
import magic.storage.LocalStorage
import magic.core.rag.Document
import magic.utils.{exists, removeIfExists}
import std.sync.*
import std.fs.*
import std.collection.*
import stdx.encoding.json.*

@When[faiss == "enable"]
public class FaissVectorStorage <: LocalVectorStorage {
    private let _workspace: String
    private let _collection: String
    private let _vdbPath: String
    private let _indexPath: String
    private let _vectorBuilder: VectorBuilder
    private let _lock: ReentrantReadWriteMutex = ReentrantReadWriteMutex()
    private let _embeddingModel: EmbeddingModel
    private let _index: SimpleIndexMap
    private let _vdb: FaissVectorDatabase

    public init(embeddingModel: EmbeddingModel, workspace!: String = ".storage", collection!: String = "default") {
        this._workspace = workspace
        this._collection = collection.toAsciiLower()
        this._vdbPath = Path(this._workspace).join("${this._collection}_vector.db").toString()
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
        if (!exists(this._vdbPath)) {
            FaissVectorDatabase().save(this._vdbPath)
        }
        this._vdb = FaissVectorDatabase.load(this._vdbPath)
        this._index = SimpleIndexMap.load(this._indexPath)
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
            this._vdb.save(this._vdbPath)
            this._index.save(this._indexPath)
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func close(): Unit {
        try {
            _lock.writeMutex.lock()
            this._vdb.close()
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func reset(): Unit {
        try {
            _lock.writeMutex.lock()
            removeIfExists(this._indexPath)
            SimpleIndexMap().save(this._indexPath)
            removeIfExists(this._vdbPath)
            FaissVectorDatabase().save(this._vdbPath)
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
            let vec = this._vectorBuilder.createEmbeddingVector(doc.content)
            this._vdb.addVector(vec)
            this._index.add(doc.toJsonValue().toString())
        } finally {
            _lock.writeMutex.unlock()
        }
    }
}
