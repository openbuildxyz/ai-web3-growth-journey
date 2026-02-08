## Package model
- [Package model](#package-model)
  - [class ModelConfig](#class-modelconfig)
    - [func init](#func-init)
  - [struct ModelManager](#struct-modelmanager)
    - [func createChatModel](#func-createchatmodel)
    - [func createChatModel](#func-createchatmodel-1)
    - [func createEmbeddingModel](#func-createembeddingmodel)
    - [func createEmbeddingModel](#func-createembeddingmodel-1)
    - [func createImageModel](#func-createimagemodel)
    - [func createImageModel](#func-createimagemodel-1)
    - [func registerChatModel](#func-registerchatmodel)
    - [func registerEmbeddingModel](#func-registerembeddingmodel)
    - [func registerImageModel](#func-registerimagemodel)
  - [struct ModelUtils](#struct-modelutils)
    - [func agentMakeChat](#func-agentmakechat)
    - [func makeChat](#func-makechat)
    - [func makeChat](#func-makechat-1)

### class ModelConfig
#### func init
```
init(provider!: String, kind!: String, name!: String, apiKey!: String = "", baseURL!: String = "", contextLength!: ?Int64 = None)
```
- Description: Initializes a new ModelConfig instance with the specified parameters. If apiKey or baseURL are not provided, default values will be used.
- Parameters:
  - `provider`: `String`, The provider of the model.
  - `kind`: `String`, The kind of the model.
  - `name`: `String`, The name of the model.
  - `apiKey`: `String`, The API key for the model. If not specified, a default API key will be used.
  - `baseURL`: `String`, The base URL for the model. If not specified, a default base URL will be used.
  - `contextLength`: `?Int64`, The context length for the model. If not specified, a default context length will be used.


### struct ModelManager
#### func createChatModel
```
static func createChatModel(modelName: String): ChatModel
```
- Description: Creates a chat model with the specified name.
- Parameters:
  - `modelName`: `String`, The name of the chat model to create.

#### func createChatModel
```
static func createChatModel(modelConfig: ModelConfig): ChatModel
```
- Description: Creates a chat model with the specified model configuration.
- Parameters:
  - `modelConfig`: `ModelConfig`, The configuration for the chat model.

#### func createEmbeddingModel
```
static func createEmbeddingModel(modelName: String): EmbeddingModel
```
- Description: Creates an embedding model with the specified name.
- Parameters:
  - `modelName`: `String`, The name of the embedding model to create.

#### func createEmbeddingModel
```
static func createEmbeddingModel(modelConfig: ModelConfig): EmbeddingModel
```
- Description: Creates an embedding model with the specified model configuration.
- Parameters:
  - `modelConfig`: `ModelConfig`, The configuration for the embedding model.

#### func createImageModel
```
static func createImageModel(modelName: String): ImageModel
```
- Description: Creates an image model with the specified name.
- Parameters:
  - `modelName`: `String`, The name of the image model to create.

#### func createImageModel
```
static func createImageModel(modelConfig: ModelConfig): ImageModel
```
- Description: Creates an image model with the specified model configuration.
- Parameters:
  - `modelConfig`: `ModelConfig`, The configuration for the image model.

#### func registerChatModel
```
static func registerChatModel(modelName: String, buildFn: () -> ChatModel): Unit
```
- Description: Registers a chat model with the specified name and build function.
- Parameters:
  - `modelName`: `String`, The name of the chat model to register.
  - `buildFn`: `() -> ChatModel`, A function that builds the chat model.

#### func registerEmbeddingModel
```
static func registerEmbeddingModel(modelName: String, buildFn: () -> EmbeddingModel): Unit
```
- Description: Registers an embedding model with the specified name and build function.
- Parameters:
  - `modelName`: `String`, The name of the embedding model to register.
  - `buildFn`: `() -> EmbeddingModel`, A function that builds the embedding model.

#### func registerImageModel
```
static func registerImageModel(modelName: String, buildFn: () -> ImageModel): Unit
```
- Description: Registers an image model with the specified name and build function.
- Parameters:
  - `modelName`: `String`, The name of the image model to register.
  - `buildFn`: `() -> ImageModel`, A function that builds the image model.


### struct ModelUtils
#### func agentMakeChat
```
func agentMakeChat(agent: Agent, request: ChatRequest): Option<ChatResponse>
```
- Description: Creates a chat response using an agent and a chat request.
- Parameters:
  - `agent`: `Agent`, The agent responsible for generating the chat response.
  - `request`: `ChatRequest`, The chat request containing the necessary information for generating the response.

#### func makeChat
```
func makeChat(name: String, model: ChatModel, messageList: MessageList, temperature!: Option<Float64> = None, stop!: Option<Array<String>> = None): Option<ChatResponse>
```
- Description: Creates a chat response with a specified name, model, message list, and optional parameters.
- Parameters:
  - `name`: `String`, The name associated with the chat.
  - `model`: `ChatModel`, The chat model to use for generating the response.
  - `messageList`: `MessageList`, The list of messages to process.
  - `temperature`: `Option<Float64>`, Optional parameter to control the randomness of the response.
  - `stop`: `Option<Array<String>>`, Optional list of strings that, when encountered, will stop the generation.

#### func makeChat
```
func makeChat(model: ChatModel, messageList: MessageList, temperature!: Option<Float64> = None, stop!: Option<Array<String>> = None): Option<ChatResponse>
```
- Description: Creates a chat response based on the provided model, message list, and optional parameters.
- Parameters:
  - `model`: `ChatModel`, The chat model to use for generating the response.
  - `messageList`: `MessageList`, The list of messages to process.
  - `temperature`: `Option<Float64>`, Optional parameter to control the randomness of the response.
  - `stop`: `Option<Array<String>>`, Optional list of strings that, when encountered, will stop the generation.


