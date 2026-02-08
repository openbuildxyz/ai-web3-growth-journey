/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.storage.graph

import std.collection.*
import stdx.serialization.serialization.*
import magic.utils.{ObjectHasher, calMd5}
import stdx.encoding.json.*

public class IllegalEdgeException <: Exception {
    public init(message: String) {
        super(message)
    }
}

public class Vertex<V> <: Equatable<Vertex<V>> & Hashable & Serializable<Vertex<V>> where V <: Serializable<V> & Equatable<V> & Hashable {
    private var _id: String
    private var _type: String
    private var _data: Option<V>
    public init(id: String, vType!: String = "DEFAULT", data!: Option<V> = None) {
        this._id = id
        this._type = vType
        this._data = data
    }

    public prop id: String {
        get() {
            _id
        }
    }

    public prop vType: String {
        get() {
            _type
        }
    }

    public prop data: Option<V> {
        get() {
            _data
        }
    }

    public operator func ==(other: Vertex<V>): Bool {
        this.id == other.id
    }

    @When[cjc_version < "1.0.0"]
    public operator func !=(other: Vertex<V>): Bool {
        this.id != other.id
    }

    public func hashCode(): Int64 {
        var hasher = ObjectHasher()
        hasher.write(id)
        hasher.write(vType)
        hasher.write(data)
        return hasher.finish()
    }

    public func serialize(): DataModel {
        let dm = DataModelStruct()
        dm.add(field<String>("id", id))
        dm.add(field<String>("type", vType))
        dm.add(field<Option<V>>("data", data))
        dm.add(field<String>("__class__", "Vertex"))
        return dm
    }

    public static func deserialize(dm: DataModel): Vertex<V> {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let _id = String.deserialize(dms.get("id"))
        let _type = String.deserialize(dms.get("type"))
        var _data = Option<V>.deserialize(dms.get("data"))
        return Vertex<V>(_id, vType: _type, data: _data)
    }

    public func toJsonString(): String {
        return this.serialize().toJson().toString()
    }

    public static func fromJsonString(str: String): Vertex<V> {
        let jv = JsonValue.fromStr(str)
        let dm = DataModel.fromJson(jv)
        return Vertex<V>.deserialize(dm)
    }
}

public class Edge<E> <: Equatable<Edge<E>> & Hashable & Serializable<Edge<E>> where E <: Serializable<E> & Equatable<E> & Hashable {
    private var _srcId: String
    private var _tgtId: String
    private var _eType: String
    private var _weight: Float64
    private var _data: Option<E>

    public init(srcId: String, tgtId: String, eType!: String = "DEFAULT", weight!: Float64 = 1.0,
        data!: Option<E> = None) {
        this._srcId = srcId
        this._tgtId = tgtId
        this._eType = eType
        this._data = data
        this._weight = weight
    }

    public mut prop weight: Float64 {
        get() {
            this._weight
        }
        set(v) {
            this._weight = v
        }
    }

    public prop eType: String {
        get() {
            _eType
        }
    }

    public prop srcId: String {
        get() {
            _srcId
        }
    }

    public prop tgtId: String {
        get() {
            _tgtId
        }
    }

    public prop data: Option<E> {
        get() {
            _data
        }
    }

    public prop uniqueId: String {
        get() {
            calMd5("${srcId}-${tgtId}-${eType}")
        }
    }

    public operator func ==(other: Edge<E>): Bool {
        this.srcId == other.srcId && this.tgtId == other.tgtId && this.eType == other.eType && this.weight == other
            .weight && this.data == other.data
    }

    @When[cjc_version < "1.0.0"]
    public operator func !=(other: Edge<E>): Bool {
        !(this == other)
    }

    public func hashCode(): Int64 {
        var hasher = ObjectHasher()
        hasher.write(srcId)
        hasher.write(tgtId)
        hasher.write(eType)
        hasher.write(weight)
        hasher.write(data)
        return hasher.finish();
    }

    public func serialize(): DataModel {
        let dm = DataModelStruct()
        dm.add(field<String>("srcId", srcId))
        dm.add(field<String>("tgtId", tgtId))
        dm.add(field<String>("eType", eType))
        dm.add(field<Float64>("weight", weight))
        dm.add(field<Option<E>>("data", data))
        dm.add(field<String>("__class__", "Edge"))
        return dm
    }

    public static func deserialize(dm: DataModel) {
        var dms = match (dm) {
            case data: DataModelStruct => data
            case _ => throw Exception("this data is not DataModelStruct")
        }
        let srcId = String.deserialize(dms.get("srcId"))
        let tgtId = String.deserialize(dms.get("tgtId"))
        let eType = String.deserialize(dms.get("eType"))
        let weight = Float64.deserialize(dms.get("weight"))
        let data = Option<E>.deserialize(dms.get("data"))
        return Edge<E>(srcId, tgtId, eType: eType, weight: weight, data: data)
    }

    public func toJsonString(): String {
        return this.serialize().toJson().toString()
    }

    public static func fromJson(str: String): Edge<E> {
        let jv = JsonValue.fromStr(str)
        let dm = DataModel.fromJson(jv)
        return Edge<E>.deserialize(dm)
    }
}

public class NodeContainer<V, E> where V <: Serializable<V> & Equatable<V> & Hashable,
    E <: Serializable<E> & Equatable<E> & Hashable {
    // INCOMING EDGE SET
    private var _incoming: HashMap<String, Edge<E>>
    // OUTGOING EDGE SET
    private var _outgoing: HashMap<String, Edge<E>>
    private var _vertex: Vertex<V>

    NodeContainer(v: Vertex<V>) {
        this._vertex = v
        this._incoming = HashMap<String, Edge<E>>()
        this._outgoing = HashMap<String, Edge<E>>()
    }

    public func addIncomingEdge(e: Edge<E>): Unit {
        this._incoming.add(e.uniqueId, e)
    }

    public func removeIncomingEdge(e: Edge<E>): Unit {
        this._incoming.remove(e.uniqueId)
    }

    public func addOutgoingEdge(e: Edge<E>): Unit {
        this._outgoing.add(e.uniqueId, e)
    }

    public func removeOutgoingEdge(e: Edge<E>): Unit {
        this._outgoing.remove(e.uniqueId)
    }

    public mut prop vertex: Vertex<V> {
        get() {
            this._vertex
        }
        set(v) {
            this._vertex = v
        }
    }
    public prop incoming: Set<Edge<E>> {
        get() {
            HashSet(_incoming.values())
        }
    }

    public prop outgoing: Set<Edge<E>> {
        get() {
            HashSet(_outgoing.values())
        }
    }
}

public class BaseGraph<V, E> where V <: Serializable<V> & Equatable<V> & Hashable,
    E <: Serializable<E> & Equatable<E> & Hashable {
    private var _vertexMap: Map<String, NodeContainer<V, E>>
    private var _vertexTypes = HashMap<String, Int64>()
    public BaseGraph(vertexMap!: Map<String, NodeContainer<V, E>> = HashMap()) {
        this._vertexMap = vertexMap
    }

    public func upsertVertex(v: Vertex<V>): Unit {
        let ec = _vertexMap.get(v.id);
        match (ec) {
            case Some(x) => x.vertex = v
            case _ =>
                _vertexMap.add(v.id, NodeContainer<V, E>(v))
                var cnt = _vertexTypes.get(v.vType).getOrDefault({=> 0})
                _vertexTypes.add(v.vType, cnt + 1)
        }
    }

    public func getVertex(id: String): ?Vertex<V> {
        match (_vertexMap.get(id)) {
            case Some(nc) => nc.vertex
            case _ => None
        }
    }

    public func hasVertex(id: String): Bool {
        match (getVertex(id)) {
            case Some(v) => true
            case _ => false
        }
    }

    public func getVertices(): Array<Vertex<V>> {
        let containers = Array<NodeContainer<V, E>>()
        let nodes = ArrayList<Vertex<V>>()
        for ((id, nc) in _vertexMap) {
            nodes.add(nc.vertex)
        }
        nodes.toArray()
    }

    public func removeVertex(id: String): Unit {
        if (let Some(nc) <- _vertexMap.remove(id)) {
            var cnt = _vertexTypes.get(nc.vertex.vType).getOrDefault({=> 1})
            _vertexTypes.add(nc.vertex.vType, cnt - 1)
        }
    }

    public func getVertexTypes(): Set<String> {
        this._vertexTypes |> filter({item => item[1] >= 0}) |> map({item => item[0]})|> collectHashSet
    }

    public func upsertEdge(e: Edge<E>): Unit {
        if (!hasVertex(e.srcId)) {
            throw IllegalEdgeException("Unknown Vertex ${e.srcId}")
        }
        if (!hasVertex(e.tgtId)) {
            throw IllegalEdgeException("Unknown Vertex ${e.tgtId}")
        }
        let sc = _vertexMap.get(e.srcId).getOrThrow()
        sc.addOutgoingEdge(e)
        let tc = _vertexMap.get(e.tgtId).getOrThrow()
        tc.addIncomingEdge(e)
    }

    public func getEdges(srcId: String, tgtId: String): Array<Edge<E>> {
        if (_vertexMap.contains(srcId) && _vertexMap.contains(tgtId)) {
            let sc = _vertexMap.get(srcId).getOrThrow();
            let edgeSet = sc.outgoing
            let tc = _vertexMap.get(tgtId).getOrThrow();
            let edgeSetIncome = tc.incoming
            edgeSet.retain(all: edgeSetIncome)
            return collectArray<Edge<E>>(edgeSet)
        }
        return []
    }

    public func hasEdge(srcId: String, tgtId: String): Bool {
        return getEdges(srcId, tgtId).size > 0
    }

    public func getIncomingEdgesOf(id: String): Array<Edge<E>> {
        if (let Some(nc) <- _vertexMap.get(id)) {
            return nc.incoming |> collectArray
        }
        return []
    }

    public func getOutgoingEdgesOf(id: String): Array<Edge<E>> {
        if (let Some(nc) <- _vertexMap.get(id)) {
            return nc.outgoing |> collectArray
        }
        return []
    }

    public func removeEdge(e: Edge<E>): Unit {
        if (!hasVertex(e.srcId)) {
            throw IllegalEdgeException("Unknown Vertex ${e.srcId}")
        }
        if (!hasVertex(e.tgtId)) {
            throw IllegalEdgeException("Unknown Vertex ${e.tgtId}")
        }
        let sc = _vertexMap.get(e.srcId).getOrThrow()
        sc.removeOutgoingEdge(e)
        let tc = _vertexMap.get(e.tgtId).getOrThrow()
        tc.removeIncomingEdge(e)
    }

    public func getAllNodes(): Array<NodeContainer<V, E>> {
        collectArray<NodeContainer<V, E>>(_vertexMap.values())
    }

    public func clear(): Unit {
        _vertexMap.clear()
    }
}
