## Package storage.vdb
- [Package storage.vdb](#package-storage.vdb)
  - [class FaissVectorStorage](#class-faissvectorstorage)
    - [func add](#func-add)
    - [func close](#func-close)
    - [prop collection](#prop-collection)
    - [func commit](#func-commit)
    - [prop embeddingModel](#prop-embeddingmodel)
    - [func init](#func-init)
    - [func query](#func-query)
    - [func queryWithScore](#func-querywithscore)
    - [func reset](#func-reset)
    - [prop workspace](#prop-workspace)
  - [class JsonMemoryVectorStorage](#class-jsonmemoryvectorstorage)
    - [func add](#func-add-1)
    - [func close](#func-close-1)
    - [prop collection](#prop-collection-1)
    - [func commit](#func-commit-1)
    - [prop embeddingModel](#prop-embeddingmodel-1)
    - [func init](#func-init-1)
    - [func query](#func-query-1)
    - [func queryWithScore](#func-querywithscore-1)
    - [func reset](#func-reset-1)
    - [prop workspace](#prop-workspace-1)
  - [interface LocalVectorStorage](#interface-localvectorstorage)
  - [interface VectorStorage](#interface-vectorstorage)
    - [func add](#func-add-1)
    - [prop embeddingModel](#prop-embeddingmodel-1)
    - [func query](#func-query-1)
    - [func queryWithScore](#func-querywithscore-1)

### class FaissVectorStorage
#### func add
```
func add(doc: Document): Unit
```
- Description: Adds a document to the vector storage.
- Parameters:
  - `doc`: `Document`, The document to add to the storage.

#### func close
```
func close(): Unit
```
- Description: Closes the vector storage and releases any resources.

#### prop collection
```
prop collection: String
```
- Description: Gets the collection name.

#### func commit
```
func commit(): Unit
```
- Description: Commits the current state of the vector storage to disk.

#### prop embeddingModel
```
prop embeddingModel: EmbeddingModel
```
- Description: Gets the embedding model used for vector creation.

#### func init
```
init(embeddingModel: EmbeddingModel, workspace!: String = ".storage", collection!: String = "default")
```
- Description: Initializes the FaissVectorStorage with the given embedding model, workspace, and collection.
- Parameters:
  - `embeddingModel`: `EmbeddingModel`, The embedding model to use for vector creation.
  - `workspace`: `String`, The directory path where the storage files will be saved. Defaults to '.storage'.
  - `collection`: `String`, The name of the collection. Defaults to 'default'.

#### func query
```
func query(query: String, topK: Int64, threshold!: Float64 = 0.6): Array<Document>
```
- Description: Queries the vector storage for documents similar to the given query string.
- Parameters:
  - `query`: `String`, The query string to search for.
  - `topK`: `Int64`, The maximum number of documents to return.
  - `threshold`: `Float64`, The minimum similarity threshold for returned documents. Defaults to 0.6.

#### func queryWithScore
```
func queryWithScore(query: String, topK: Int64, threshold!: Float64 = 0.6): Array<(Document, Float64)>
```
- Description: Queries the vector storage for documents similar to the given query string, including similarity scores.
- Parameters:
  - `query`: `String`, The query string to search for.
  - `topK`: `Int64`, The maximum number of documents to return.
  - `threshold`: `Float64`, The minimum similarity threshold for returned documents. Defaults to 0.6.

#### func reset
```
func reset(): Unit
```
- Description: Resets the vector storage by clearing all stored data.

#### prop workspace
```
prop workspace: String
```
- Description: Gets the workspace directory path.


### class JsonMemoryVectorStorage
#### func add
```
func add(doc: Document): Unit
```
- Description: Adds a document to the storage.
- Parameters:
  - `doc`: `Document`, The document to add to the storage.

#### func close
```
func close(): Unit
```
- Description: Closes the storage and releases any resources.

#### prop collection
```
prop collection: String
```
- Description: Gets the collection name.

#### func commit
```
func commit(): Unit
```
- Description: Commits all changes to the storage.

#### prop embeddingModel
```
prop embeddingModel: EmbeddingModel
```
- Description: Gets the embedding model used for vector creation.

#### func init
```
init(embeddingModel: EmbeddingModel, workspace!: String = ".storage", collection!: String = "default")
```
- Description: Initializes the JsonMemoryVectorStorage with the given embedding model, workspace, and collection.
- Parameters:
  - `embeddingModel`: `EmbeddingModel`, The embedding model to use for vector creation.
  - `workspace`: `String`, The directory path where the storage files will be kept. Defaults to '.storage'.
  - `collection`: `String`, The name of the collection. Defaults to 'default'.

#### func query
```
func query(query: String, topK: Int64, threshold!: Float64 = 0.6): Array<Document>
```
- Description: Queries the storage for documents similar to the given query string.
- Parameters:
  - `query`: `String`, The query string to search for.
  - `topK`: `Int64`, The maximum number of documents to return.
  - `threshold`: `Float64`, The minimum similarity threshold for results. Defaults to 0.6.

#### func queryWithScore
```
func queryWithScore(query: String, topK: Int64, threshold!: Float64 = 0.6): Array<(Document, Float64)>
```
- Description: Queries the storage for documents similar to the given query string, including similarity scores.
- Parameters:
  - `query`: `String`, The query string to search for.
  - `topK`: `Int64`, The maximum number of documents to return.
  - `threshold`: `Float64`, The minimum similarity threshold for results. Defaults to 0.6.

#### func reset
```
func reset(): Unit
```
- Description: Resets the storage to its initial state.

#### prop workspace
```
prop workspace: String
```
- Description: Gets the workspace directory path.


### interface LocalVectorStorage

### interface VectorStorage
#### func add
```
func add(doc: Document): Unit
```
- Description: Adds a document to the vector storage.
- Parameters:
  - `doc`: `Document`, The document to add to the storage.

#### prop embeddingModel
```
prop embeddingModel: EmbeddingModel
```
- Description: The embedding model used for vector storage.

#### func query
```
func query(query: String, topK: Int64, threshold!: Float64): Array<Document>
```
- Description: Queries the vector storage with the given query string, returning the top K documents that meet the threshold.
- Parameters:
  - `query`: `String`, The query string to search for.
  - `topK`: `Int64`, The number of top documents to return.
  - `threshold!`: `Float64`, The similarity threshold that documents must meet.

#### func queryWithScore
```
func queryWithScore(query: String, topK: Int64, threshold!: Float64): Array<(Document, Float64)>
```
- Description: Queries the vector storage with the given query string, returning the top K documents along with their similarity scores that meet the threshold.
- Parameters:
  - `query`: `String`, The query string to search for.
  - `topK`: `Int64`, The number of top documents to return.
  - `threshold!`: `Float64`, The similarity threshold that documents must meet.


