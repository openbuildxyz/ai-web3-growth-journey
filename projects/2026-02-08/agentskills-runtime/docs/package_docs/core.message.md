## Package core.message
- [Package core.message](#package-core.message)
  - [class ChatRound](#class-chatround)
    - [func fromJsonValue](#func-fromjsonvalue)
    - [func toJsonValue](#func-tojsonvalue)
    - [func toString](#func-tostring)
  - [class CompactedConversation](#class-compactedconversation)
    - [func fromJsonValue](#func-fromjsonvalue-1)
    - [func toJsonValue](#func-tojsonvalue-1)
  - [class Conversation](#class-conversation)
    - [func addChatRound](#func-addchatround)
    - [func addChatRound](#func-addchatround-1)
    - [func clear](#func-clear)
    - [func clone](#func-clone)
    - [func compactBy](#func-compactby)
    - [prop compacts](#prop-compacts)
    - [func fromJsonValue](#func-fromjsonvalue-1)
    - [func isEmpty](#func-isempty)
    - [func iterator](#func-iterator)
    - [func load](#func-load)
    - [func operator []](#func-operator-[])
    - [func save](#func-save)
    - [prop size](#prop-size)
    - [func toJsonValue](#func-tojsonvalue-1)
  - [interface ConversationCompactor](#interface-conversationcompactor)
    - [func compact](#func-compact)
  - [class Message](#class-message)
    - [func assistant](#func-assistant)
    - [let content](#let-content)
    - [func fromJsonValue](#func-fromjsonvalue-1)
    - [let image](#let-image)
    - [func init](#func-init)
    - [let name](#let-name)
    - [let reason](#let-reason)
    - [let role](#let-role)
    - [func system](#func-system)
    - [func toJsonValue](#func-tojsonvalue-1)
    - [func toString](#func-tostring-1)
    - [func user](#func-user)
  - [enum MessageRole](#enum-messagerole)
    - [func !=](#func-!=)
    - [func ==](#func-==)
    - [enumeration Assistant](#enumeration-assistant)
    - [enumeration System](#enumeration-system)
    - [enumeration Unknown](#enumeration-unknown)
    - [enumeration User](#enumeration-user)
    - [func fromStr](#func-fromstr)
    - [func toString](#func-tostring-1)

### class ChatRound
#### func fromJsonValue
```
redef static public func fromJsonValue(json: JsonValue): ChatRound
```
- Description: Creates a ChatRound object from a JsonValue.
- Parameters:
  - `json`: `JsonValue`, The JsonValue to convert from.

#### func toJsonValue
```
override public func toJsonValue(): JsonValue
```
- Description: Converts the ChatRound object to a JsonValue.

#### func toString
```
override public func toString(): String
```
- Description: Converts the ChatRound object to a string representation.


### class CompactedConversation
#### func fromJsonValue
```
redef static public func fromJsonValue(json: JsonValue): CompactedConversation
```
- Description: Creates a CompactedConversation object from a JsonValue.
- Parameters:
  - `json`: `JsonValue`, The JsonValue to convert from.

#### func toJsonValue
```
override public func toJsonValue(): JsonValue
```
- Description: Converts the CompactedConversation object to a JsonValue.


### class Conversation
#### func addChatRound
```
public func addChatRound(round: ChatRound): Unit
```
- Description: Adds a ChatRound to the conversation.
- Parameters:
  - `round`: `ChatRound`, The ChatRound to add.

#### func addChatRound
```
public func addChatRound(question: Message, answer: Message, steps!: MessageList = MessageList()): Unit
```
- Description: Adds a ChatRound to the conversation with specified question, answer, and optional steps.
- Parameters:
  - `question`: `Message`, The question message.
  - `answer`: `Message`, The answer message.
  - `steps`: `MessageList`, Optional execution step messages.

#### func clear
```
public func clear(): Unit
```
- Description: Clears all ChatRounds from the conversation.

#### func clone
```
public func clone(): Conversation
```
- Description: Creates a clone of the conversation.

#### func compactBy
```
public func compactBy(compactor: ConversationCompactor, firstN!: Option<Int64> = None, keepOrigin!: Bool = true): String
```
- Description: Compacts the conversation and saves the summary.
- Parameters:
  - `compactor`: `ConversationCompactor`, The compactor to use.
  - `firstN`: `Option<Int64>`, The first N chat rounds to compact.
  - `keepOrigin`: `Bool`, Whether to save the original conversation messages.

#### prop compacts
```
public prop compacts: Array<CompactedConversation>
```
- Description: Gets the array of compacted conversations.

#### func fromJsonValue
```
redef static public func fromJsonValue(json: JsonValue): Conversation
```
- Description: Creates a Conversation object from a JsonValue.
- Parameters:
  - `json`: `JsonValue`, The JsonValue to convert from.

#### func isEmpty
```
public func isEmpty(): Bool
```
- Description: Checks if the conversation is empty.

#### func iterator
```
override public func iterator(): Iterator<ChatRound>
```
- Description: Returns an iterator over the ChatRounds in the conversation.

#### func load
```
public static func load(path: Path): Conversation
```
- Description: Loads a conversation from a file.
- Parameters:
  - `path`: `Path`, The file path to load from.

#### func operator operator []
```
public operator func [](index: Int64): ChatRound
```
- Description: Gets the ChatRound at the specified index.
- Parameters:
  - `index`: `Int64`, The index of the ChatRound to retrieve.

#### func save
```
public func save(path: Path): Unit
```
- Description: Saves the conversation to a file.
- Parameters:
  - `path`: `Path`, The file path to save to.

#### prop size
```
public prop size: Int64
```
- Description: Gets the number of ChatRounds in the conversation.

#### func toJsonValue
```
override public func toJsonValue(): JsonValue
```
- Description: Converts the Conversation object to a JsonValue.


### interface ConversationCompactor
#### func compact
```
func compact(conversation: Conversation): String
```
- Description: Compact the conversation a list of messages
- Parameters:
  - `conversation`: `Conversation`, The conversation to be compacted


### class Message
#### func assistant
```
public static func assistant(content: String, name!: String = ""): Message
```
- Description: Creates an assistant message
- Parameters:
  - `content`: `String`, Content of the assistant message
  - `name`: `String`, Name of the assistant (default: empty string)

#### let content
```
public let content: String
```
- Description: Content of the message

#### func fromJsonValue
```
redef public static func fromJsonValue(json: JsonValue): Message
```
- Description: Creates a Message from a JsonValue
- Parameters:
  - `json`: `JsonValue`, JsonValue to convert to Message

#### let image
```
public let image: Option<String>
```
- Description: Optional image of the message (url or base64)

#### func init
```
public init(role: MessageRole, content: String, name!: String = "", image!: Option<String> = None, reason!: Option<String> = None)
```
- Description: Constructor for Message class
- Parameters:
  - `role`: `MessageRole`, Role of the message sender
  - `content`: `String`, Content of the message
  - `name`: `String`, Name of the message sender (default: empty string)
  - `image`: `Option<String>`, Optional image of the message (default: None)
  - `reason`: `Option<String>`, Optional reasoning content (default: None)

#### let name
```
public let name: String
```
- Description: Name of the message sender

#### let reason
```
public let reason: Option<String>
```
- Description: The reasoning content. A reason model, like deepseek-r1, may generate reasoning content

#### let role
```
public let role: MessageRole
```
- Description: Role of the message sender

#### func system
```
public static func system(content: String): Message
```
- Description: Creates a system message
- Parameters:
  - `content`: `String`, Content of the system message

#### func toJsonValue
```
override public func toJsonValue(): JsonValue
```
- Description: Converts the message to a JsonValue

#### func toString
```
override public func toString(): String
```
- Description: Converts the message to a string representation

#### func user
```
public static func user(content: String, image!: Option<String> = None): Message
```
- Description: Creates a user message
- Parameters:
  - `content`: `String`, Content of the user message
  - `image`: `Option<String>`, Optional image of the message (default: None)


### enum MessageRole
#### func operator !=
```
operator func !=(other: MessageRole): Bool
```
- Description: Checks if two MessageRole instances are not equal.
- Parameters:
  - `other`: `MessageRole`, The other MessageRole to compare with.

#### func operator ==
```
operator func ==(other: MessageRole): Bool
```
- Description: Checks if two MessageRole instances are equal.
- Parameters:
  - `other`: `MessageRole`, The other MessageRole to compare with.

####  Assistant
```
Assistant
```
- Description: Represents the assistant role in a message.

####  System
```
System
```
- Description: Represents the system role in a message.

####  Unknown
```
Unknown
```
- Description: Represents an unknown role in a message.

####  User
```
User
```
- Description: Represents the user role in a message.

#### func fromStr
```
static func fromStr(str: String): MessageRole
```
- Description: Converts a string to the corresponding MessageRole.
- Parameters:
  - `str`: `String`, The string to convert to a MessageRole.

#### func toString
```
func toString(): String
```
- Description: Converts the MessageRole to its string representation.


