## Package storage.graph
- [Package storage.graph](#package-storage.graph)
  - [class BaseGraph<V, E>](#class-basegraph<v,-e>)
    - [func clear](#func-clear)
    - [func getAllNodes](#func-getallnodes)
    - [func getEdges](#func-getedges)
    - [func getIncomingEdgesOf](#func-getincomingedgesof)
    - [func getOutgoingEdgesOf](#func-getoutgoingedgesof)
    - [func getVertex](#func-getvertex)
    - [func getVertexTypes](#func-getvertextypes)
    - [func getVertices](#func-getvertices)
    - [func hasEdge](#func-hasedge)
    - [func hasVertex](#func-hasvertex)
    - [func removeEdge](#func-removeedge)
    - [func removeVertex](#func-removevertex)
    - [func upsertEdge](#func-upsertedge)
    - [func upsertVertex](#func-upsertvertex)
  - [class BaseLocalGraphStorage<V, E>](#class-baselocalgraphstorage<v,-e>)
    - [func close](#func-close)
    - [prop collection](#prop-collection)
    - [func commit](#func-commit)
    - [func getAllVertices](#func-getallvertices)
    - [func getEdge](#func-getedge)
    - [func getEdges](#func-getedges-1)
    - [func getIncomingEdgesOf](#func-getincomingedgesof-1)
    - [func getOutgoingEdgesOf](#func-getoutgoingedgesof-1)
    - [func getVertex](#func-getvertex-1)
    - [func getVertexTypes](#func-getvertextypes-1)
    - [func hasEdge](#func-hasedge-1)
    - [func hasVertex](#func-hasvertex-1)
    - [func init](#func-init)
    - [func removeEdge](#func-removeedge-1)
    - [func removeVertex](#func-removevertex-1)
    - [func reset](#func-reset)
    - [func upsertEdge](#func-upsertedge-1)
    - [func upsertVertex](#func-upsertvertex-1)
    - [prop workspace](#prop-workspace)
  - [class Edge<E>](#class-edge<e>)
    - [func !=](#func-!=)
    - [func ==](#func-==)
    - [prop data](#prop-data)
    - [func deserialize](#func-deserialize)
    - [prop eType](#prop-etype)
    - [func fromJson](#func-fromjson)
    - [func hashCode](#func-hashcode)
    - [func init](#func-init-1)
    - [func serialize](#func-serialize)
    - [prop srcId](#prop-srcid)
    - [prop tgtId](#prop-tgtid)
    - [func toJsonString](#func-tojsonstring)
    - [prop uniqueId](#prop-uniqueid)
    - [prop weight](#prop-weight)
  - [interface GraphStorage<V, E>](#interface-graphstorage<v,-e>)
    - [func getAllVertices](#func-getallvertices-1)
    - [func getEdge](#func-getedge-1)
    - [func getEdges](#func-getedges-1)
    - [func getIncomingEdgesOf](#func-getincomingedgesof-1)
    - [func getOutgoingEdgesOf](#func-getoutgoingedgesof-1)
    - [func getVertex](#func-getvertex-1)
    - [func getVertexTypes](#func-getvertextypes-1)
    - [func hasEdge](#func-hasedge-1)
    - [func hasVertex](#func-hasvertex-1)
    - [func removeEdge](#func-removeedge-1)
    - [func removeVertex](#func-removevertex-1)
    - [func upsertEdge](#func-upsertedge-1)
    - [func upsertVertex](#func-upsertvertex-1)
  - [class IllegalEdgeException](#class-illegaledgeexception)
    - [func init](#func-init-1)
  - [interface LocalGraphStorage<V, E>](#interface-localgraphstorage<v,-e>)
  - [class NodeContainer<V, E>](#class-nodecontainer<v,-e>)
    - [func addIncomingEdge](#func-addincomingedge)
    - [func addOutgoingEdge](#func-addoutgoingedge)
    - [prop incoming](#prop-incoming)
    - [prop outgoing](#prop-outgoing)
    - [func removeIncomingEdge](#func-removeincomingedge)
    - [func removeOutgoingEdge](#func-removeoutgoingedge)
    - [prop vertex](#prop-vertex)
  - [class Vertex<V>](#class-vertex<v>)
    - [func !=](#func-!=-1)
    - [func ==](#func-==-1)
    - [prop data](#prop-data-1)
    - [func deserialize](#func-deserialize-1)
    - [func fromJsonString](#func-fromjsonstring)
    - [func hashCode](#func-hashcode-1)
    - [prop id](#prop-id)
    - [func init](#func-init-1)
    - [func serialize](#func-serialize-1)
    - [func toJsonString](#func-tojsonstring-1)
    - [prop vType](#prop-vtype)

### class BaseGraph<V, E>
#### func clear
```
func clear(): Unit
```
- Description: Clears the graph

#### func getAllNodes
```
func getAllNodes(): Array<NodeContainer<V, E>>
```
- Description: Gets all node containers in the graph

#### func getEdges
```
func getEdges(srcId: String, tgtId: String): Array<Edge<E>>
```
- Description: Gets all edges between two vertices
- Parameters:
  - `srcId`: `String`, The source vertex ID
  - `tgtId`: `String`, The target vertex ID

#### func getIncomingEdgesOf
```
func getIncomingEdgesOf(id: String): Array<Edge<E>>
```
- Description: Gets all incoming edges of a vertex
- Parameters:
  - `id`: `String`, The ID of the vertex

#### func getOutgoingEdgesOf
```
func getOutgoingEdgesOf(id: String): Array<Edge<E>>
```
- Description: Gets all outgoing edges of a vertex
- Parameters:
  - `id`: `String`, The ID of the vertex

#### func getVertex
```
func getVertex(id: String): ?Vertex<V>
```
- Description: Gets a vertex by its ID
- Parameters:
  - `id`: `String`, The ID of the vertex

#### func getVertexTypes
```
func getVertexTypes(): Set<String>
```
- Description: Gets all vertex types in the graph

#### func getVertices
```
func getVertices(): Array<Vertex<V>>
```
- Description: Gets all vertices in the graph

#### func hasEdge
```
func hasEdge(srcId: String, tgtId: String): Bool
```
- Description: Checks if an edge exists between two vertices
- Parameters:
  - `srcId`: `String`, The source vertex ID
  - `tgtId`: `String`, The target vertex ID

#### func hasVertex
```
func hasVertex(id: String): Bool
```
- Description: Checks if a vertex exists in the graph
- Parameters:
  - `id`: `String`, The ID of the vertex

#### func removeEdge
```
func removeEdge(e: Edge<E>): Unit
```
- Description: Removes an edge from the graph
- Parameters:
  - `e`: `Edge<E>`, The edge to remove

#### func removeVertex
```
func removeVertex(id: String): Unit
```
- Description: Removes a vertex from the graph
- Parameters:
  - `id`: `String`, The ID of the vertex to remove

#### func upsertEdge
```
func upsertEdge(e: Edge<E>): Unit
```
- Description: Updates or inserts an edge into the graph
- Parameters:
  - `e`: `Edge<E>`, The edge to upsert

#### func upsertVertex
```
func upsertVertex(v: Vertex<V>): Unit
```
- Description: Updates or inserts a vertex into the graph
- Parameters:
  - `v`: `Vertex<V>`, The vertex to upsert


### class BaseLocalGraphStorage<V, E>
#### func close
```
public func close(): Unit
```
- Description: 关闭存储

#### prop collection
```
public prop collection: String
```
- Description: 获取存储的集合名称

#### func commit
```
public func commit(): Unit
```
- Description: 提交所有更改到存储

#### func getAllVertices
```
public func getAllVertices(): Array<Vertex<V>>
```
- Description: 获取图中所有的顶点

#### func getEdge
```
public func getEdge(srcId: String, tgtId: String, eType: String): Option<Edge<E>>
```
- Description: 获取从源顶点到目标顶点且具有指定类型的边
- Parameters:
  - `srcId`: `String`, 源顶点的唯一标识符
  - `tgtId`: `String`, 目标顶点的唯一标识符
  - `eType`: `String`, 边的类型

#### func getEdges
```
public func getEdges(srcId: String, tgtId: String): Array<Edge<E>>
```
- Description: 获取从源顶点到目标顶点的所有边
- Parameters:
  - `srcId`: `String`, 源顶点的唯一标识符
  - `tgtId`: `String`, 目标顶点的唯一标识符

#### func getIncomingEdgesOf
```
public func getIncomingEdgesOf(id: String): Array<Edge<E>>
```
- Description: 获取指向指定顶点的所有边
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func getOutgoingEdgesOf
```
public func getOutgoingEdgesOf(id: String): Array<Edge<E>>
```
- Description: 获取从指定顶点出发的所有边
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func getVertex
```
public func getVertex(id: String): Option<Vertex<V>>
```
- Description: 获取指定ID的顶点
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func getVertexTypes
```
public func getVertexTypes(): Set<String>
```
- Description: 获取图中所有顶点的类型

#### func hasEdge
```
public func hasEdge(srcId: String, tgtId: String): Bool
```
- Description: 检查图中是否存在从源顶点到目标顶点的边
- Parameters:
  - `srcId`: `String`, 源顶点的唯一标识符
  - `tgtId`: `String`, 目标顶点的唯一标识符

#### func hasVertex
```
public func hasVertex(id: String): Bool
```
- Description: 检查图中是否存在指定ID的顶点
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func init
```
public init(workspace!: String = ".storage", collection!: String = "default")
```
- Description: 初始化本地图存储
- Parameters:
  - `workspace`: `String`, 存储的工作目录
  - `collection`: `String`, 存储的集合名称

#### func removeEdge
```
public func removeEdge(e: Edge<E>): Unit
```
- Description: 移除指定的边
- Parameters:
  - `e`: `Edge<E>`, 要移除的边

#### func removeVertex
```
public func removeVertex(id: String): Unit
```
- Description: 移除指定ID的顶点
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func reset
```
public func reset(): Unit
```
- Description: 重置存储

#### func upsertEdge
```
public func upsertEdge(edge: Edge<E>): Unit
```
- Description: 插入或更新边
- Parameters:
  - `edge`: `Edge<E>`, 要插入或更新的边

#### func upsertVertex
```
public func upsertVertex(vertex: Vertex<V>): Unit
```
- Description: 插入或更新顶点
- Parameters:
  - `vertex`: `Vertex<V>`, 要插入或更新的顶点

#### prop workspace
```
public prop workspace: String
```
- Description: 获取存储的工作目录


### class Edge<E>
#### func operator !=
```
operator func !=(other: Edge<E>): Bool
```
- Description: Checks if two edges are not equal based on their properties
- Parameters:
  - `other`: `Edge<E>`, The other edge to compare with

#### func operator ==
```
operator func ==(other: Edge<E>): Bool
```
- Description: Checks if two edges are equal based on their properties
- Parameters:
  - `other`: `Edge<E>`, The other edge to compare with

#### prop data
```
prop data: Option<E>
```
- Description: Gets the optional data associated with the edge

#### func deserialize
```
static func deserialize(dm: DataModel)
```
- Description: Deserializes a DataModel into an Edge
- Parameters:
  - `dm`: `DataModel`, The DataModel to deserialize

#### prop eType
```
prop eType: String
```
- Description: Gets the type of the edge

#### func fromJson
```
static func fromJson(str: String): Edge<E>
```
- Description: Creates an Edge from a JSON string
- Parameters:
  - `str`: `String`, The JSON string to parse

#### func hashCode
```
func hashCode(): Int64
```
- Description: Generates a hash code for the edge

#### func init
```
init(srcId: String, tgtId: String, eType: String = "DEFAULT", weight: Float64 = 1.0, data: Option<E> = None)
```
- Description: Constructor for Edge
- Parameters:
  - `srcId`: `String`, The source vertex ID
  - `tgtId`: `String`, The target vertex ID
  - `eType`: `String`, The type of the edge
  - `weight`: `Float64`, The weight of the edge
  - `data`: `Option<E>`, Optional data associated with the edge

#### func serialize
```
func serialize(): DataModel
```
- Description: Serializes the edge into a DataModel

#### prop srcId
```
prop srcId: String
```
- Description: Gets the source vertex ID

#### prop tgtId
```
prop tgtId: String
```
- Description: Gets the target vertex ID

#### func toJsonString
```
func toJsonString(): String
```
- Description: Converts the edge to a JSON string

#### prop uniqueId
```
prop uniqueId: String
```
- Description: Gets a unique identifier for the edge

#### prop weight
```
mut prop weight: Float64
```
- Description: Gets or sets the weight of the edge


### interface GraphStorage<V, E>
#### func getAllVertices
```
func getAllVertices(): Array<Vertex<V>>
```
- Description: 获取图中所有的顶点

#### func getEdge
```
func getEdge(srcId: String, tgtId: String, eType: String): Option<Edge<E>>
```
- Description: 获取从源顶点到目标顶点且具有指定类型的边
- Parameters:
  - `srcId`: `String`, 源顶点的唯一标识符
  - `tgtId`: `String`, 目标顶点的唯一标识符
  - `eType`: `String`, 边的类型

#### func getEdges
```
func getEdges(srcId: String, tgtId: String): Array<Edge<E>>
```
- Description: 获取从源顶点到目标顶点的所有边
- Parameters:
  - `srcId`: `String`, 源顶点的唯一标识符
  - `tgtId`: `String`, 目标顶点的唯一标识符

#### func getIncomingEdgesOf
```
func getIncomingEdgesOf(id: String): Array<Edge<E>>
```
- Description: 获取指向指定顶点的所有边
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func getOutgoingEdgesOf
```
func getOutgoingEdgesOf(id: String): Array<Edge<E>>
```
- Description: 获取从指定顶点出发的所有边
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func getVertex
```
func getVertex(id: String): Option<Vertex<V>>
```
- Description: 获取指定ID的顶点
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func getVertexTypes
```
func getVertexTypes(): Set<String>
```
- Description: 获取图中所有顶点的类型

#### func hasEdge
```
func hasEdge(srcId: String, tgtId: String): Bool
```
- Description: 检查图中是否存在从源顶点到目标顶点的边
- Parameters:
  - `srcId`: `String`, 源顶点的唯一标识符
  - `tgtId`: `String`, 目标顶点的唯一标识符

#### func hasVertex
```
func hasVertex(id: String): Bool
```
- Description: 检查图中是否存在指定ID的顶点
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func removeEdge
```
func removeEdge(e: Edge<E>): Unit
```
- Description: 移除指定的边
- Parameters:
  - `e`: `Edge<E>`, 要移除的边

#### func removeVertex
```
func removeVertex(id: String): Unit
```
- Description: 移除指定ID的顶点
- Parameters:
  - `id`: `String`, 顶点的唯一标识符

#### func upsertEdge
```
func upsertEdge(edge: Edge<E>): Unit
```
- Description: 插入或更新边
- Parameters:
  - `edge`: `Edge<E>`, 要插入或更新的边

#### func upsertVertex
```
func upsertVertex(vertex: Vertex<V>): Unit
```
- Description: 插入或更新顶点
- Parameters:
  - `vertex`: `Vertex<V>`, 要插入或更新的顶点


### class IllegalEdgeException
#### func init
```
init(message: String)
```
- Description: Constructor for IllegalEdgeException
- Parameters:
  - `message`: `String`, The error message


### interface LocalGraphStorage<V, E>

### class NodeContainer<V, E>
#### func addIncomingEdge
```
func addIncomingEdge(e: Edge<E>): Unit
```
- Description: Adds an incoming edge to the node
- Parameters:
  - `e`: `Edge<E>`, The edge to add

#### func addOutgoingEdge
```
func addOutgoingEdge(e: Edge<E>): Unit
```
- Description: Adds an outgoing edge to the node
- Parameters:
  - `e`: `Edge<E>`, The edge to add

#### prop incoming
```
prop incoming: Set<Edge<E>>
```
- Description: Gets the set of incoming edges

#### prop outgoing
```
prop outgoing: Set<Edge<E>>
```
- Description: Gets the set of outgoing edges

#### func removeIncomingEdge
```
func removeIncomingEdge(e: Edge<E>): Unit
```
- Description: Removes an incoming edge from the node
- Parameters:
  - `e`: `Edge<E>`, The edge to remove

#### func removeOutgoingEdge
```
func removeOutgoingEdge(e: Edge<E>): Unit
```
- Description: Removes an outgoing edge from the node
- Parameters:
  - `e`: `Edge<E>`, The edge to remove

#### prop vertex
```
mut prop vertex: Vertex<V>
```
- Description: Gets or sets the vertex of the node


### class Vertex<V>
#### func operator !=
```
operator func !=(other: Vertex<V>): Bool
```
- Description: Checks if two vertices are not equal based on their IDs
- Parameters:
  - `other`: `Vertex<V>`, The other vertex to compare with

#### func operator ==
```
operator func ==(other: Vertex<V>): Bool
```
- Description: Checks if two vertices are equal based on their IDs
- Parameters:
  - `other`: `Vertex<V>`, The other vertex to compare with

#### prop data
```
prop data: Option<V>
```
- Description: Gets the optional data associated with the vertex

#### func deserialize
```
static func deserialize(dm: DataModel): Vertex<V>
```
- Description: Deserializes a DataModel into a Vertex
- Parameters:
  - `dm`: `DataModel`, The DataModel to deserialize

#### func fromJsonString
```
static func fromJsonString(str: String): Vertex<V>
```
- Description: Creates a Vertex from a JSON string
- Parameters:
  - `str`: `String`, The JSON string to parse

#### func hashCode
```
func hashCode(): Int64
```
- Description: Generates a hash code for the vertex

#### prop id
```
prop id: String
```
- Description: Gets the unique identifier of the vertex

#### func init
```
init(id: String, vType: String = "DEFAULT", data: Option<V> = None)
```
- Description: Constructor for Vertex
- Parameters:
  - `id`: `String`, The unique identifier of the vertex
  - `vType`: `String`, The type of the vertex
  - `data`: `Option<V>`, Optional data associated with the vertex

#### func serialize
```
func serialize(): DataModel
```
- Description: Serializes the vertex into a DataModel

#### func toJsonString
```
func toJsonString(): String
```
- Description: Converts the vertex to a JSON string

#### prop vType
```
prop vType: String
```
- Description: Gets the type of the vertex


