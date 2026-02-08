## Package core.rag
- [Package core.rag](#package-core.rag)
  - [class Document](#class-document)
    - [func !=](#func-!=)
    - [func ==](#func-==)
    - [let content](#let-content)
    - [func deserialize](#func-deserialize)
    - [func fromJsonValue](#func-fromjsonvalue)
    - [func getTypeSchema](#func-gettypeschema)
    - [let id](#let-id)
    - [func init](#func-init)
    - [func init](#func-init-1)
    - [let metadata](#let-metadata)
    - [func serialize](#func-serialize)
    - [func toJsonString](#func-tojsonstring)
    - [func toJsonValue](#func-tojsonvalue)
    - [func toPrompt](#func-toprompt)
    - [func toString](#func-tostring)
  - [interface Retrieval](#interface-retrieval)
    - [prop sources](#prop-sources)
  - [struct RetrievalInfo](#struct-retrievalinfo)
  - [interface Retriever](#interface-retriever)
    - [prop description](#prop-description)
    - [prop mode](#prop-mode)
    - [func search](#func-search)
  - [class RetrieverException](#class-retrieverexception)
    - [func init](#func-init-1)
  - [enum RetrieverMode](#enum-retrievermode)
    - [func !=](#func-!=-1)
    - [func ==](#func-==-1)
    - [enumeration Dynamic](#enumeration-dynamic)
    - [enumeration Static](#enumeration-static)

### class Document
#### func operator !=
```
public operator func !=(other: Document): Bool
```
- Description: Compares two documents for inequality based on id, content, and metadata
- Parameters:
  - `other`: `Document`, The other document to compare with

#### func operator ==
```
public operator func ==(other: Document): Bool
```
- Description: Compares two documents for equality based on id, content, and metadata
- Parameters:
  - `other`: `Document`, The other document to compare with

#### let content
```
public let content: String
```
- Description: The main content of the document

#### func deserialize
```
public static func deserialize(dm: DataModel)
```
- Description: Deserializes a Document from a DataModel
- Parameters:
  - `dm`: `DataModel`, The DataModel to deserialize from

#### func fromJsonValue
```
public static func fromJsonValue(json: JsonValue): Document
```
- Description: Deserializes a Document from a JsonValue
- Parameters:
  - `json`: `JsonValue`, The JsonValue to deserialize from

#### func getTypeSchema
```
public static func getTypeSchema(): TypeSchema
```
- Description: Returns the type schema for the Document class

#### let id
```
public let id: String
```
- Description: Unique identifier for the document

#### func init
```
public init(content: String, metadata!: HashMap<String, String> = HashMap())
```
- Description: Initializes a new document with the given content and optional metadata
- Parameters:
  - `content`: `String`, The main content of the document
  - `metadata`: `HashMap<String, String>`, Additional metadata for the document, defaults to an empty HashMap

#### func init
```
public init(id: String, content: String, metadata!: HashMap<String, String>)
```
- Description: Initializes a new document with the specified id, content, and metadata
- Parameters:
  - `id`: `String`, Unique identifier for the document
  - `content`: `String`, The main content of the document
  - `metadata`: `HashMap<String, String>`, Additional metadata for the document

#### let metadata
```
public let metadata: HashMap<String, String>
```
- Description: Additional metadata associated with the document

#### func serialize
```
public func serialize(): DataModel
```
- Description: Serializes the Document to a DataModel

#### func toJsonString
```
public func toJsonString(): String
```
- Description: Converts the Document to a JSON string

#### func toJsonValue
```
public func toJsonValue(): JsonValue
```
- Description: Serializes the Document to a JsonValue

#### func toPrompt
```
public override func toPrompt(): String
```
- Description: Returns the content of the document as a prompt string

#### func toString
```
public override func toString(): String
```
- Description: Converts the document to a string representation including id, metadata, and content


### interface Retrieval
#### prop sources
```
prop sources: Array<Document>
```
- Description: Sources of the retrieval result


### struct RetrievalInfo

### interface Retriever
#### prop description
```
prop description: String
```
- Description: Describe what the retriever will search. Used under the dynamic mode.

#### prop mode
```
mut prop mode: RetrieverMode
```
- Description: The mode of the retriever.

#### func search
```
func search(query: String): Retrieval
```
- Description: Searches for the given query.
- Parameters:
  - `query`: `String`, The query string to search for.


### class RetrieverException
#### func init
```
init(msg: String)
```
- Description: Constructor for RetrieverException
- Parameters:
  - `msg`: `String`, The exception message


### enum RetrieverMode
#### func operator !=
```
operator func !=(other: RetrieverMode): Bool
```
- Description: Compares two RetrieverMode instances for inequality
- Parameters:
  - `other`: `RetrieverMode`, The other RetrieverMode instance to compare with

#### func operator ==
```
operator func ==(other: RetrieverMode): Bool
```
- Description: Compares two RetrieverMode instances for equality
- Parameters:
  - `other`: `RetrieverMode`, The other RetrieverMode instance to compare with

####  Dynamic
```
Dynamic
```
- Description: The retriever will be used during the agent solving the problem

####  Static
```
Static
```
- Description: The retriever will be used to search related content before the agent answer the question


