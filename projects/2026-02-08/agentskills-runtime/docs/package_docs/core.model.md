## Package core.model
- [Package core.model](#package-core.model)
  - [struct AsyncChatChunk](#struct-asyncchatchunk)
    - [func toString](#func-tostring)
  - [class AsyncChatResponse](#class-asyncchatresponse)
    - [let chunks](#let-chunks)
    - [func iter](#func-iter)
    - [prop message](#prop-message)
    - [prop usage](#prop-usage)
  - [interface ChatModel](#interface-chatmodel)
    - [func asyncCreate](#func-asynccreate)
    - [prop contextLength](#prop-contextlength)
    - [func create](#func-create)
    - [prop maxTokens](#prop-maxtokens)
  - [class ChatRequest](#class-chatrequest)
    - [func init](#func-init)
    - [func init](#func-init-1)
    - [func init](#func-init-1)
    - [func init](#func-init-1)
    - [let messageList](#let-messagelist)
    - [let stop](#let-stop)
    - [let temperature](#let-temperature)
    - [func toJsonValue](#func-tojsonvalue)
    - [func toString](#func-tostring-1)
    - [let tools](#let-tools)
  - [class ChatResponse](#class-chatresponse)
    - [func init](#func-init-1)
    - [prop message](#prop-message-1)
    - [prop model](#prop-model)
    - [func toJsonValue](#func-tojsonvalue-1)
    - [func toString](#func-tostring-1)
    - [prop toolRequests](#prop-toolrequests)
    - [prop usage](#prop-usage-1)
  - [class ChatUsage](#class-chatusage)
    - [let completionTokens](#let-completiontokens)
    - [func init](#func-init-1)
    - [let promptTokens](#let-prompttokens)
    - [let timeCost](#let-timecost)
    - [func toJsonValue](#func-tojsonvalue-1)
    - [func toString](#func-tostring-1)
    - [let totalTokens](#let-totaltokens)
  - [interface EmbeddingModel](#interface-embeddingmodel)
    - [func create](#func-create-1)
  - [struct EmbeddingRequest](#struct-embeddingrequest)
    - [let dimensions](#let-dimensions)
    - [func init](#func-init-1)
    - [let prompt](#let-prompt)
  - [struct EmbeddingResponse](#struct-embeddingresponse)
    - [let data](#let-data)
    - [func init](#func-init-1)
    - [func toString](#func-tostring-1)
  - [interface ImageModel](#interface-imagemodel)
    - [func create](#func-create-1)
  - [struct ImageRequest](#struct-imagerequest)
  - [struct ImageResponse](#struct-imageresponse)
  - [interface Model](#interface-model)
    - [prop fullName](#prop-fullname)
    - [prop name](#prop-name)
    - [prop provider](#prop-provider)
  - [class ModelException](#class-modelexception)

### struct AsyncChatChunk
#### func toString
```
override public func toString(): String
```
- Description: Converts the AsyncChatChunk object to a string representation.


### class AsyncChatResponse
#### let chunks
```
public let chunks: Iterator<AsyncChatChunk>
```
- Description: An iterator over AsyncChatChunk objects.

#### func iter
```
public func iter(withReason!: Bool = true): Iterator<String>
```
- Description: Returns an iterator over the chat response strings, optionally including the reason.
- Parameters:
  - `withReason`: `Bool`, Whether to include the reason in the iterator output. Default is true.

#### prop message
```
override public prop message: Message
```
- Description: Gets the complete message of the chat response. This method is synchronous and will wait until the chat response completes.

#### prop usage
```
override public prop usage: Option<ChatUsage>
```
- Description: Gets the usage information of the chat response. Returns None if the response is not finished.


### interface ChatModel
#### func asyncCreate
```
func asyncCreate(request: ChatRequest): AsyncChatResponse
```
- Description: Asynchronous API of the chat model
- Parameters:
  - `request`: `ChatRequest`, The chat request to be processed asynchronously

#### prop contextLength
```
prop contextLength: Int64
```
- Description: The context length of the chat model

#### func create
```
func create(request: ChatRequest): ChatResponse
```
- Description: Synchronous API of the chat model
- Parameters:
  - `request`: `ChatRequest`, The chat request to be processed

#### prop maxTokens
```
mut prop maxTokens: Option<Int64>
```
- Description: Control the max output tokens of the chat model


### class ChatRequest
#### func init
```
init(message: String, temperature!: Option<Float64> = None, stop!: Option<Array<String>> = None, tools!: Array<Tool> = [])
```
- Description: Constructor for ChatRequest with a single message string.
- Parameters:
  - `message`: `String`, The message string to initialize the chat request.
  - `temperature`: `Option<Float64>`, Optional temperature setting for the chat request.
  - `stop`: `Option<Array<String>>`, Optional stop words for the chat request.
  - `tools`: `Array<Tool>`, List of tools associated with the chat request.

#### func init
```
init(message: Message, temperature!: Option<Float64> = None, stop!: Option<Array<String>> = None, tools!: Array<Tool> = [])
```
- Description: Constructor for ChatRequest with a single Message object.
- Parameters:
  - `message`: `Message`, The Message object to initialize the chat request.
  - `temperature`: `Option<Float64>`, Optional temperature setting for the chat request.
  - `stop`: `Option<Array<String>>`, Optional stop words for the chat request.
  - `tools`: `Array<Tool>`, List of tools associated with the chat request.

#### func init
```
init(messages: Array<Message>, temperature!: Option<Float64> = None, stop!: Option<Array<String>> = None, tools!: Array<Tool> = [])
```
- Description: Constructor for ChatRequest with an array of Message objects.
- Parameters:
  - `messages`: `Array<Message>`, Array of Message objects to initialize the chat request.
  - `temperature`: `Option<Float64>`, Optional temperature setting for the chat request.
  - `stop`: `Option<Array<String>>`, Optional stop words for the chat request.
  - `tools`: `Array<Tool>`, List of tools associated with the chat request.

#### func init
```
init(messageList: MessageList, temperature!: Option<Float64> = None, stop!: Option<Array<String>> = None, tools!: Array<Tool> = [])
```
- Description: Constructor for ChatRequest with a MessageList object.
- Parameters:
  - `messageList`: `MessageList`, MessageList object to initialize the chat request.
  - `temperature`: `Option<Float64>`, Optional temperature setting for the chat request.
  - `stop`: `Option<Array<String>>`, Optional stop words for the chat request.
  - `tools`: `Array<Tool>`, List of tools associated with the chat request.

#### let messageList
```
let messageList: MessageList
```
- Description: A list of messages in the chat request.

#### let stop
```
let stop: Option<Array<String>>
```
- Description: Optional stop words for the chat request.

#### let temperature
```
let temperature: Option<Float64>
```
- Description: Optional temperature setting for the chat request.

#### func toJsonValue
```
func toJsonValue(): JsonValue
```
- Description: Converts the ChatRequest object to a JsonValue.

#### func toString
```
func toString(): String
```
- Description: Converts the ChatRequest object to a JSON string.

#### let tools
```
let tools: Array<Tool>
```
- Description: List of tools associated with the chat request.


### class ChatResponse
#### func init
```
init(model: String, message: Message, toolRequests!: Array<ToolRequest> = [], usage!: Option<ChatUsage> = None)
```
- Description: Initializes a new instance of ChatResponse with the specified model, message, tool requests, and usage.
- Parameters:
  - `model`: `String`, The model used for the chat response.
  - `message`: `Message`, The message content of the chat response.
  - `toolRequests`: `Array<ToolRequest>`, An optional array of tool requests associated with the chat response.
  - `usage`: `Option<ChatUsage>`, An optional usage object associated with the chat response.

#### prop message
```
prop message: Message
```
- Description: Gets the message content of the chat response.

#### prop model
```
prop model: String
```
- Description: Gets the model used for the chat response.

#### func toJsonValue
```
func toJsonValue(): JsonValue
```
- Description: Converts the chat response to a JSON value.

#### func toString
```
func toString(): String
```
- Description: Converts the chat response to a JSON string.

#### prop toolRequests
```
prop toolRequests: Array<ToolRequest>
```
- Description: Gets the array of tool requests associated with the chat response.

#### prop usage
```
prop usage: Option<ChatUsage>
```
- Description: Gets the optional usage object associated with the chat response.


### class ChatUsage
#### let completionTokens
```
let completionTokens: Int64
```
- Description: Number of tokens used in the completion.

#### func init
```
init(promptTokens!: Int64, completionTokens!: Int64, timeCost!: Option<Duration>)
```
- Description: Constructor for ChatUsage class.
- Parameters:
  - `promptTokens`: `Int64`, Number of tokens used in the prompt.
  - `completionTokens`: `Int64`, Number of tokens used in the completion.
  - `timeCost`: `Option<Duration>`, Optional duration representing the time cost.

#### let promptTokens
```
let promptTokens: Int64
```
- Description: Number of tokens used in the prompt.

#### let timeCost
```
let timeCost: Option<Duration>
```
- Description: Optional duration representing the time cost.

#### func toJsonValue
```
func toJsonValue(): JsonValue
```
- Description: Converts the ChatUsage object to a JsonValue.

#### func toString
```
func toString(): String
```
- Description: Converts the ChatUsage object to a string representation.

#### let totalTokens
```
let totalTokens: Int64
```
- Description: Total number of tokens used (promptTokens + completionTokens).


### interface EmbeddingModel
#### func create
```
func create(request: EmbeddingRequest): EmbeddingResponse
```
- Description: Creates an embedding based on the provided request.
- Parameters:
  - `request`: `EmbeddingRequest`, The request containing the data needed to create an embedding.


### struct EmbeddingRequest
#### let dimensions
```
let dimensions: Option<Int64>
```
- Description: Optional dimensions for the embedding output.

#### func init
```
init(prompt: String, dimensions!: Option<Int> = None)
```
- Description: Initializes an EmbeddingRequest with the given prompt and optional dimensions.
- Parameters:
  - `prompt`: `String`, The input prompt for generating embeddings.
  - `dimensions`: `Option<Int>`, Optional dimensions for the embedding output. Defaults to None.

#### let prompt
```
let prompt: String
```
- Description: The input prompt for generating embeddings.


### struct EmbeddingResponse
#### let data
```
let data: Array<Float64>
```
- Description: An array of Float64 values representing the embedding data.

#### func init
```
init(data: Array<Float64>)
```
- Description: Initializes the EmbeddingResponse with the given embedding data.
- Parameters:
  - `data`: `Array<Float64>`, An array of Float64 values representing the embedding data.

#### func toString
```
func toString(): String
```
- Description: Converts the embedding data to a string representation.


### interface ImageModel
#### func create
```
func create(request: ImageRequest): ImageResponse
```
- Description: Creates an image based on the provided request.
- Parameters:
  - `request`: `ImageRequest`, The request containing details for image creation.


### struct ImageRequest

### struct ImageResponse

### interface Model
#### prop fullName
```
prop fullName: String
```
- Description: Full name of the model in the format 'provider:name'

#### prop name
```
prop name: String
```
- Description: Name of the model

#### prop provider
```
prop provider: String
```
- Description: Provider of the model


### class ModelException

