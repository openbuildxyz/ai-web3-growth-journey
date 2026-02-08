/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import std.collection.{map, collectArray}
import std.fs.{Path, FSException, FileInfo}

import magic.core.rag.Retriever
import magic.core.model.EmbeddingModel
import magic.model.ModelUtils
import magic.prompt.ToPrompt

public class SemanticMap<VDB, IMAP, T> where VDB <: VectorDatabase<VDB>,
                                             IMAP <: IndexMap<IMAP, T>,
                                             T <: ToPrompt {
    public let vectorDB: VDB
    public let indexMap: IMAP
    private var _embeddingModel: Option<EmbeddingModel> = None
    private var _vecBuilder: Option<VectorBuilder> = None

    public init(vectorDB!: VDB, indexMap!: IMAP, embeddingModel!: Option<EmbeddingModel> = None) {
        this.vectorDB = vectorDB
        this.indexMap = indexMap
        this._embeddingModel = embeddingModel
        if (let Some(model) <- embeddingModel) {
            this._vecBuilder = VectorBuilder(model: model)
        } else {
            this._vecBuilder = None
        }
    }

    public mut prop embeddingModel: EmbeddingModel {
        get() { this._embeddingModel.getOrThrow({ => Exception("Embedding model is not set") }) }
        set(model) {
            this._embeddingModel = model
            this._vecBuilder = VectorBuilder(model: model)
        }
    }

    private prop vecBuilder: VectorBuilder {
        get() {
            this._vecBuilder.getOrThrow({ => Exception("Embedding model is not set") })
        }
    }

    public func put(key: String, value: T): Unit {
        let keyVec = this.vecBuilder.createEmbeddingVector(key)
        vectorDB.addVector(keyVec)
        indexMap.add(value)
    }

    /**
     * Find similar data
     */
    public func search(query: String, number!: Int64 = 5, minDistance!: Float64 = 0.3): Array<T> {
        let queryVec = this.vecBuilder.createEmbeddingVector(query)
        vectorDB.search(queryVec, number: number, minDistance: minDistance) |>
            map { sr: SearchResult => indexMap.get(sr.index) } |>
            collectArray
    }

    public func asRetriever(): Retriever {
        return SemanticMapRetriever(this)
    }

    static private func checkAndGetPaths(dirPath: String): (String, String) {
        let path = Path(dirPath)
        try {
            if (!FileInfo(dirPath).isDirectory()) {
                throw VectorDatabaseException("${dirPath} is not a directory")
            }
        } catch (ex: FSException) {
            throw ex
        }
        let dbPath = path.join("vec.db")
        let mapPath = path.join("index.map")
        return (dbPath.toString(), mapPath.toString())
    }

    public func save(dirPath: String): Unit {
        let (dbPath, mapPath) = checkAndGetPaths(dirPath)
        vectorDB.save(dbPath)
        indexMap.save(mapPath)
    }

    public static func load(dirPath: String): SemanticMap<VDB, IMAP, T> {
        let (dbPath, mapPath) = checkAndGetPaths(dirPath)
        let db = VDB.load(dbPath)
        let map = IMAP.load(mapPath)
        return SemanticMap<VDB, IMAP, T>(vectorDB: db, indexMap: map)
    }
}
