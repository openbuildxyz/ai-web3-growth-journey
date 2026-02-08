## Package rag.graph
- [Package rag.graph](#package-rag.graph)
  - [class Entity](#class-entity)
    - [func !=](#func-!=)
    - [func ==](#func-==)
    - [func addDesc](#func-adddesc)
    - [func addSource](#func-addsource)
    - [prop descs](#prop-descs)
    - [func deserialize](#func-deserialize)
    - [func hashCode](#func-hashcode)
    - [func init](#func-init)
    - [prop name](#prop-name)
    - [func serialize](#func-serialize)
    - [prop sources](#prop-sources)
  - [class MiniRag](#class-minirag)
    - [func asRetriever](#func-asretriever)
    - [func close](#func-close)
    - [func commit](#func-commit)
    - [func init](#func-init-1)
    - [func insert](#func-insert)
    - [func insert](#func-insert-1)
    - [func reset](#func-reset)
  - [class MiniRagBuilder](#class-miniragbuilder)
    - [func build](#func-build)
    - [func collection](#func-collection)
    - [func completionDelimiter](#func-completiondelimiter)
    - [func contextTemplate](#func-contexttemplate)
    - [func entityDescMaxTokens](#func-entitydescmaxtokens)
    - [func entityExtractContinueTemplate](#func-entityextractcontinuetemplate)
    - [func entityExtractJudgeTemplate](#func-entityextractjudgetemplate)
    - [func entityExtractTemplate](#func-entityextracttemplate)
    - [func entityTypes](#func-entitytypes)
    - [func graphFieldDelimiter](#func-graphfielddelimiter)
    - [func graphStorageInstance](#func-graphstorageinstance)
    - [func init](#func-init-1)
    - [func kvStorageInstance](#func-kvstorageinstance)
    - [func query2KeywordTemplate](#func-query2keywordtemplate)
    - [func recordDelimiter](#func-recorddelimiter)
    - [func splitter](#func-splitter)
    - [func tokenizer](#func-tokenizer)
    - [func tupleDelimiter](#func-tupledelimiter)
    - [func vectorStroageInstance](#func-vectorstroageinstance)
    - [func workspace](#func-workspace)
  - [class MiniRagConfig](#class-miniragconfig)
    - [prop chatModel](#prop-chatmodel)
    - [prop completionDelimiter](#prop-completiondelimiter)
    - [prop contextBuildTemplate](#prop-contextbuildtemplate)
    - [prop descSummarizeTemplate](#prop-descsummarizetemplate)
    - [prop embeddingModel](#prop-embeddingmodel)
    - [prop entityDescMaxTokens](#prop-entitydescmaxtokens)
    - [prop entityExtractContinueTemplate](#prop-entityextractcontinuetemplate)
    - [prop entityExtractJudgeTemplate](#prop-entityextractjudgetemplate)
    - [prop entityExtractTemplate](#prop-entityextracttemplate)
    - [prop entityTypes](#prop-entitytypes)
    - [prop graphFieldDelimiter](#prop-graphfielddelimiter)
    - [func init](#func-init-1)
    - [prop maxContinueTimes](#prop-maxcontinuetimes)
    - [prop query2KeywordTemplate](#prop-query2keywordtemplate)
    - [prop recordDelimiter](#prop-recorddelimiter)
    - [prop splitter](#prop-splitter)
    - [prop tokenizer](#prop-tokenizer)
    - [prop tupleDelimiter](#prop-tupledelimiter)
  - [class MiniRagRetrival](#class-miniragretrival)
    - [prop sources](#prop-sources-1)
    - [func toPrompt](#func-toprompt)
  - [class QueryParam](#class-queryparam)
    - [let maxTokenForEntity](#let-maxtokenforentity)
    - [let query](#let-query)
    - [let threshold](#let-threshold)
    - [let topK](#let-topk)
  - [class Relationship](#class-relationship)
    - [func !=](#func-!=-1)
    - [func ==](#func-==-1)
    - [func addDesc](#func-adddesc-1)
    - [func addKeyword](#func-addkeyword)
    - [func addSource](#func-addsource-1)
    - [prop descs](#prop-descs-1)
    - [func deserialize](#func-deserialize-1)
    - [func hashCode](#func-hashcode-1)
    - [func init](#func-init-1)
    - [prop keywords](#prop-keywords)
    - [func serialize](#func-serialize-1)
    - [prop sources](#prop-sources-1)

### class Entity
#### func operator !=
```
operator func !=(other: Entity): Bool
```
- Description: Checks if two entities are not equal.
- Parameters:
  - `other`: `Entity`, Entity to compare with.

#### func operator ==
```
operator func ==(other: Entity): Bool
```
- Description: Checks if two entities are equal.
- Parameters:
  - `other`: `Entity`, Entity to compare with.

#### func addDesc
```
func addDesc(desc: String)
```
- Description: Adds a description to the entity.
- Parameters:
  - `desc`: `String`, Description to add.

#### func addSource
```
func addSource(source: String)
```
- Description: Adds a source to the entity.
- Parameters:
  - `source`: `String`, Source to add.

#### prop descs
```
prop descs: Array<String>
```
- Description: Gets the descriptions of the entity as an array.

#### func deserialize
```
static func deserialize(dm: DataModel): Entity
```
- Description: Deserializes a DataModel into an Entity.
- Parameters:
  - `dm`: `DataModel`, DataModel to deserialize.

#### func hashCode
```
func hashCode(): Int64
```
- Description: Generates a hash code for the entity.

#### func init
```
init(name: String, descs: ArrayList<String> = ArrayList(), sources: ArrayList<String> = ArrayList())
```
- Description: Constructor for Entity class.
- Parameters:
  - `name`: `String`, Name of the entity.
  - `descs`: `ArrayList<String>`, List of descriptions for the entity.
  - `sources`: `ArrayList<String>`, List of sources for the entity.

#### prop name
```
prop name: String
```
- Description: Gets the name of the entity.

#### func serialize
```
func serialize(): DataModel
```
- Description: Serializes the entity into a DataModel.

#### prop sources
```
prop sources: Array<String>
```
- Description: Gets the sources of the entity as an array.


### class MiniRag
#### func asRetriever
```
func asRetriever(description: String = "A garph Retriever"): Retriever
```
- Description: Converts MiniRag to a retriever.
- Parameters:
  - `description`: `String`, Description of the retriever.

#### func close
```
func close(): Unit
```
- Description: Closes MiniRag.

#### func commit
```
func commit(): Unit
```
- Description: Commits changes to MiniRag.

#### func init
```
init(builder: MiniRagBuilder)
```
- Description: Constructor for MiniRag.
- Parameters:
  - `builder`: `MiniRagBuilder`, Builder for MiniRag.

#### func insert
```
func insert(doc: Document): Unit
```
- Description: Inserts a document into MiniRag.
- Parameters:
  - `doc`: `Document`, Document to insert.

#### func insert
```
func insert(content: String): Unit
```
- Description: Inserts content as a document into MiniRag.
- Parameters:
  - `content`: `String`, Content to insert.

#### func reset
```
func reset(): Unit
```
- Description: Resets MiniRag.


### class MiniRagBuilder
#### func build
```
func build(): MiniRag
```
- Description: Builds the MiniRag instance.

#### func collection
```
func collection(collection: String): MiniRagBuilder
```
- Description: Sets the collection for MiniRag.
- Parameters:
  - `collection`: `String`, Collection name.

#### func completionDelimiter
```
func completionDelimiter(completionDelimiter: String): MiniRagBuilder
```
- Description: Sets the delimiter for completion.
- Parameters:
  - `completionDelimiter`: `String`, Delimiter string.

#### func contextTemplate
```
func contextTemplate(contextTemplate: String): MiniRagBuilder
```
- Description: Sets the template for building context.
- Parameters:
  - `contextTemplate`: `String`, Template string.

#### func entityDescMaxTokens
```
func entityDescMaxTokens(entityDescMaxTokens: Int64): MiniRagBuilder
```
- Description: Sets the maximum tokens for entity descriptions.
- Parameters:
  - `entityDescMaxTokens`: `Int64`, Maximum token count.

#### func entityExtractContinueTemplate
```
func entityExtractContinueTemplate(entityExtractContinueTemplate: String): MiniRagBuilder
```
- Description: Sets the template for continuing entity extraction.
- Parameters:
  - `entityExtractContinueTemplate`: `String`, Template string.

#### func entityExtractJudgeTemplate
```
func entityExtractJudgeTemplate(entityExtractJudgeTemplate: String): MiniRagBuilder
```
- Description: Sets the template for judging entity extraction.
- Parameters:
  - `entityExtractJudgeTemplate`: `String`, Template string.

#### func entityExtractTemplate
```
func entityExtractTemplate(entityExtractTemplate: String): MiniRagBuilder
```
- Description: Sets the template for entity extraction.
- Parameters:
  - `entityExtractTemplate`: `String`, Template string.

#### func entityTypes
```
func entityTypes(entityTypes: Array<String>): MiniRagBuilder
```
- Description: Sets the entity types for MiniRag.
- Parameters:
  - `entityTypes`: `Array<String>`, List of entity types.

#### func graphFieldDelimiter
```
func graphFieldDelimiter(graphFieldDelimiter: String): MiniRagBuilder
```
- Description: Sets the delimiter for graph fields.
- Parameters:
  - `graphFieldDelimiter`: `String`, Delimiter string.

#### func graphStorageInstance
```
func graphStorageInstance(graphStorageInstance: (workspace: String, collection: String) -> LocalGraphStorage<Entity, Relationship>): MiniRagBuilder
```
- Description: Sets the graph storage instance for MiniRag.
- Parameters:
  - `graphStorageInstance`: `(workspace: String, collection: String) -> LocalGraphStorage<Entity, Relationship>`, Function to create graph storage instance.

#### func init
```
init(config: MiniRagConfig)
```
- Description: Constructor for MiniRagBuilder.
- Parameters:
  - `config`: `MiniRagConfig`, Configuration for MiniRag.

#### func kvStorageInstance
```
func kvStorageInstance(kvStorageInstance: (workspace: String, collection: String) -> LocalKVStorage<Document>): MiniRagBuilder
```
- Description: Sets the KV storage instance for MiniRag.
- Parameters:
  - `kvStorageInstance`: `(workspace: String, collection: String) -> LocalKVStorage<Document>`, Function to create KV storage instance.

#### func query2KeywordTemplate
```
func query2KeywordTemplate(query2KeywordTemplate: String): MiniRagBuilder
```
- Description: Sets the template for converting queries to keywords.
- Parameters:
  - `query2KeywordTemplate`: `String`, Template string.

#### func recordDelimiter
```
func recordDelimiter(recordDelimiter: String): MiniRagBuilder
```
- Description: Sets the delimiter for records.
- Parameters:
  - `recordDelimiter`: `String`, Delimiter string.

#### func splitter
```
func splitter(splitter: Splitter): MiniRagBuilder
```
- Description: Sets the text splitter for MiniRag.
- Parameters:
  - `splitter`: `Splitter`, Text splitter.

#### func tokenizer
```
func tokenizer(tokenizer: Tokenizer): MiniRagBuilder
```
- Description: Sets the tokenizer for MiniRag.
- Parameters:
  - `tokenizer`: `Tokenizer`, Tokenizer.

#### func tupleDelimiter
```
func tupleDelimiter(tupleDelimiter: String): MiniRagBuilder
```
- Description: Sets the delimiter for tuples.
- Parameters:
  - `tupleDelimiter`: `String`, Delimiter string.

#### func vectorStroageInstance
```
func vectorStroageInstance(vectorStroageInstance: (workspace: String, collection: String, embeddingModel: EmbeddingModel) -> LocalVectorStorage): MiniRagBuilder
```
- Description: Sets the vector storage instance for MiniRag.
- Parameters:
  - `vectorStroageInstance`: `(workspace: String, collection: String, embeddingModel: EmbeddingModel) -> LocalVectorStorage`, Function to create vector storage instance.

#### func workspace
```
func workspace(workspace: String): MiniRagBuilder
```
- Description: Sets the workspace for MiniRag.
- Parameters:
  - `workspace`: `String`, Workspace name.


### class MiniRagConfig
#### prop chatModel
```
var chatModel: ChatModel
```
- Description: Chat model for processing queries.

#### prop completionDelimiter
```
var completionDelimiter: String = "<|COMPLETE|>"
```
- Description: Delimiter for completion.

#### prop contextBuildTemplate
```
var contextBuildTemplate: String = DEFAULT_CONTEXT_BUILD_TEMPLATE
```
- Description: Template for building context.

#### prop descSummarizeTemplate
```
var descSummarizeTemplate: String = DEFAULT_DESCRIPTION_SUMMARIZE_TEMPLATE
```
- Description: Template for summarizing descriptions.

#### prop embeddingModel
```
var embeddingModel: EmbeddingModel
```
- Description: Embedding model for generating embeddings.

#### prop entityDescMaxTokens
```
var entityDescMaxTokens: Int64 = 400
```
- Description: Maximum tokens for entity descriptions.

#### prop entityExtractContinueTemplate
```
var entityExtractContinueTemplate: String = DEFAULT_ENEITY_EXTRACT_CONTINUE_TEMPLATE
```
- Description: Template for continuing entity extraction.

#### prop entityExtractJudgeTemplate
```
var entityExtractJudgeTemplate: String = DEFAULT_ENTITY_EXTRACT_JUDGE_TEMPLATE
```
- Description: Template for judging entity extraction.

#### prop entityExtractTemplate
```
var entityExtractTemplate: String = DEFAULT_ENEITY_EXTRACT_TEMPLATE
```
- Description: Template for entity extraction.

#### prop entityTypes
```
var entityTypes: Array<String> = ["organization", "person", "geo", "event", "category"]
```
- Description: List of entity types.

#### prop graphFieldDelimiter
```
var graphFieldDelimiter: String = "<SEP>"
```
- Description: Delimiter for graph fields.

#### func init
```
init(chatModel: ChatModel, embeddingModel: EmbeddingModel, tokenizer: Tokenizer)
```
- Description: Constructor for MiniRagConfig.
- Parameters:
  - `chatModel`: `ChatModel`, Chat model for processing queries.
  - `embeddingModel`: `EmbeddingModel`, Embedding model for generating embeddings.
  - `tokenizer`: `Tokenizer`, Tokenizer for processing text.

#### prop maxContinueTimes
```
var maxContinueTimes: Int64 = 1
```
- Description: Maximum times to continue entity extraction.

#### prop query2KeywordTemplate
```
var query2KeywordTemplate: String = DEFAULT_QUERY2KEYWORD_TEMPLATE
```
- Description: Template for converting queries to keywords.

#### prop recordDelimiter
```
var recordDelimiter: String = "##"
```
- Description: Delimiter for records.

#### prop splitter
```
var splitter: Splitter = RecursiveCharacterTextSplitter(chunkSize: 4096, chunkOverlap: 1024)
```
- Description: Text splitter for processing documents.

#### prop tokenizer
```
var tokenizer: Tokenizer
```
- Description: Tokenizer for processing text.

#### prop tupleDelimiter
```
var tupleDelimiter: String = "<|>"
```
- Description: Delimiter for tuples.


### class MiniRagRetrival
#### prop sources
```
override prop sources: Array<Document>
```
- Description: Gets the sources of the retrieval.

#### func toPrompt
```
override func toPrompt(): String
```
- Description: Converts the retrieval to a prompt string.


### class QueryParam
#### let maxTokenForEntity
```
let maxTokenForEntity: Int64 = 1000
```
- Description: Maximum tokens for entity descriptions.

#### let query
```
let query: String
```
- Description: Query string.

#### let threshold
```
let threshold: Float64 = 0.5
```
- Description: Threshold for filtering results.

#### let topK
```
let topK: Int64 = 20
```
- Description: Top K results to retrieve.


### class Relationship
#### func operator !=
```
operator func !=(other: Relationship): Bool
```
- Description: Checks if two relationships are not equal.
- Parameters:
  - `other`: `Relationship`, Relationship to compare with.

#### func operator ==
```
operator func ==(other: Relationship): Bool
```
- Description: Checks if two relationships are equal.
- Parameters:
  - `other`: `Relationship`, Relationship to compare with.

#### func addDesc
```
func addDesc(desc: String)
```
- Description: Adds a description to the relationship.
- Parameters:
  - `desc`: `String`, Description to add.

#### func addKeyword
```
func addKeyword(keyword: String)
```
- Description: Adds a keyword to the relationship.
- Parameters:
  - `keyword`: `String`, Keyword to add.

#### func addSource
```
func addSource(source: String)
```
- Description: Adds a source to the relationship.
- Parameters:
  - `source`: `String`, Source to add.

#### prop descs
```
prop descs: Array<String>
```
- Description: Gets the descriptions of the relationship as an array.

#### func deserialize
```
static func deserialize(dm: DataModel): Relationship
```
- Description: Deserializes a DataModel into a Relationship.
- Parameters:
  - `dm`: `DataModel`, DataModel to deserialize.

#### func hashCode
```
func hashCode(): Int64
```
- Description: Generates a hash code for the relationship.

#### func init
```
init(descs: ArrayList<String> = ArrayList(), keywords: HashSet<String> = HashSet(), sources: ArrayList<String> = ArrayList())
```
- Description: Constructor for Relationship class.
- Parameters:
  - `descs`: `ArrayList<String>`, List of descriptions for the relationship.
  - `keywords`: `HashSet<String>`, Set of keywords for the relationship.
  - `sources`: `ArrayList<String>`, List of sources for the relationship.

#### prop keywords
```
prop keywords: Array<String>
```
- Description: Gets the keywords of the relationship as an array.

#### func serialize
```
func serialize(): DataModel
```
- Description: Serializes the relationship into a DataModel.

#### prop sources
```
prop sources: Array<String>
```
- Description: Gets the sources of the relationship as an array.


