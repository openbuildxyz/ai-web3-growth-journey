/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.storage.graph

import magic.storage.LocalStorage
import magic.utils.{readLines, writeLines, move, removeIfExists, exists, directoryOf}
import std.collection.*
import std.collection.concurrent.*
import std.fs.{Path, File, Directory}
import std.sync.*
import stdx.serialization.serialization.*
import stdx.encoding.json.*

public interface GraphStorage<V, E> where V <: Serializable<V> & Equatable<V> & Hashable,
    E <: Serializable<E> & Equatable<E> & Hashable {
    func hasVertex(id: String): Bool
    func hasEdge(srcId: String, tgtId: String): Bool
    func getVertex(id: String): Option<Vertex<V>>
    func getEdge(srcId: String, tgtId: String, eType: String): Option<Edge<E>>
    func getEdges(srcId: String, tgtId: String): Array<Edge<E>>
    func getIncomingEdgesOf(id: String): Array<Edge<E>>
    func getOutgoingEdgesOf(id: String): Array<Edge<E>>
    func upsertVertex(vertex: Vertex<V>): Unit
    func upsertEdge(edge: Edge<E>): Unit
    func removeVertex(id: String): Unit
    func removeEdge(e: Edge<E>): Unit
    func getVertexTypes(): Set<String>
    func getAllVertices(): Array<Vertex<V>>
}

public interface LocalGraphStorage<V, E> <: GraphStorage<V, E> & LocalStorage where V <: Serializable<V> & Equatable<V> & Hashable,
    E <: Serializable<E> & Equatable<E> & Hashable {}

public open class BaseLocalGraphStorage<V, E> <: LocalGraphStorage<V, E> where V <: Serializable<V> & Equatable<V> & Hashable,
    E <: Serializable<E> & Equatable<E> & Hashable {
    private let _workspace: String
    private let _collection: String
    private let _storagePath: Path
    private let _graph: BaseGraph<V, E>
    private let _lock = ReentrantReadWriteMutex()

    public init(workspace!: String = ".storage", collection!: String = "default") {
        this._graph = BaseGraph<V, E>()
        this._workspace = workspace
        this._collection = collection.toAsciiLower()
        this._storagePath = Path(this._workspace).join("${this._collection}_graph.jsonl")
        // initalize and load
        if (!exists(_workspace)) {
            Directory.create(_workspace, recursive: true)
        }
        if (!exists(_storagePath)) {
            File.create(_storagePath)
        }
        var lines = readLines(_storagePath)
        for (line in lines) {
            if (line.isEmpty()) {
                continue
            }
            let jsonValue = JsonValue.fromStr(line)
            if (let Some(cls) <- jsonValue.asObject().get("__class__")) {
                let cname = cls.asString().getValue()
                if (cname == "Vertex") {
                    _graph.upsertVertex(Vertex<V>.deserialize(DataModel.fromJson(jsonValue)))
                } else {
                    _graph.upsertEdge(Edge<E>.deserialize(DataModel.fromJson(jsonValue)))
                }
            }
        }
    }

    public func commit(): Unit {
        try {
            _lock.writeMutex.lock()
            this._commit()
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func _commit(): Unit {
        let backup = directoryOf(_storagePath).join("${_collection}_graph.backup")
        try {
            move(_storagePath, backup, true)
            File.create(_storagePath)
            let nodes = _graph.getAllNodes()
            let vertexStrs = nodes |>
                map { node => node.vertex.toJsonString() } |>
                collectArray
            writeLines(_storagePath, vertexStrs)
            let visited = HashSet<Edge<E>>()
            for (node in nodes) {
                var outgoingEdges = nodes |>
                    flatMap { node => node.outgoing } |>
                    filter { edge: Edge<E> => !visited.contains(edge) } |>
                    inspect { edge: Edge<E> => visited.add(edge); () } |>
                    map { edge: Edge<E> => edge.toJsonString() } |>
                    collectArray
                writeLines(_storagePath, outgoingEdges)
                var incomingEdges = nodes |>
                    flatMap { node => node.incoming } |>
                    filter { edge: Edge<E> => !visited.contains(edge) } |>
                    inspect { edge: Edge<E> => visited.add(edge); () } |>
                    map { edge: Edge<E> => edge.toJsonString() } |>
                    collectArray
                writeLines(_storagePath, incomingEdges)
            }
        } catch (_: Exception) {
            removeIfExists(_storagePath)
            move(backup, _storagePath, true)
            throw Exception("Graph Commit Failed!")
        } finally {
            removeIfExists(backup)
        }
    }

    public func reset(): Unit {
        try {
            _lock.writeMutex.lock()
            _graph.clear()
            commit()
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func close(): Unit {
        // TODO - ADD FILE LOCK
    }

    public prop workspace: String {
        get() {
            this._workspace
        }
    }

    public prop collection: String {
        get() {
            this._collection
        }
    }

    public func hasVertex(id: String): Bool {
        try {
            _lock.readMutex.lock()
            _graph.hasVertex(id)
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func hasEdge(srcId: String, tgtId: String): Bool {
        try {
            _lock.readMutex.lock()
            _graph.hasEdge(srcId, tgtId)
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func getVertex(id: String): Option<Vertex<V>> {
        try {
            _lock.readMutex.lock()
            _graph.getVertex(id)
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func getEdges(srcId: String, tgtId: String): Array<Edge<E>> {
        try {
            _lock.readMutex.lock()
            _graph.getEdges(srcId, tgtId)
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func getEdge(srcId: String, tgtId: String, eType: String): Option<Edge<E>> {
        try {
            _lock.readMutex.lock()
            let allEdges = _graph.getEdges(srcId, tgtId)
            collectArray(allEdges |> filter({edge => edge.eType == eType})).get(0)
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func getOutgoingEdgesOf(id: String): Array<Edge<E>> {
        try {
            _lock.readMutex.lock()
            _graph.getOutgoingEdgesOf(id)
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func getIncomingEdgesOf(id: String): Array<Edge<E>> {
         try {
            _lock.readMutex.lock()
            _graph.getIncomingEdgesOf(id)
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func upsertVertex(vertex: Vertex<V>): Unit {
        try {
            _lock.writeMutex.lock()
            _graph.upsertVertex(vertex)
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func upsertEdge(edge: Edge<E>): Unit {
        try {
            _lock.writeMutex.lock()
            _graph.upsertEdge(edge)
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func removeVertex(id: String): Unit {
        try {
            _lock.writeMutex.lock()
            _graph.removeVertex(id)
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func removeEdge(e: Edge<E>): Unit {
        try {
            _lock.writeMutex.lock()
            _graph.removeEdge(e)
        } finally {
            _lock.writeMutex.unlock()
        }
    }

    public func getVertexTypes(): Set<String> {
        try {
            _lock.readMutex.lock()
            _graph.getVertexTypes()
        } finally {
            _lock.readMutex.unlock()
        }
    }

    public func getAllVertices(): Array<Vertex<V>> {
        this._graph.getVertices()
    }
}
