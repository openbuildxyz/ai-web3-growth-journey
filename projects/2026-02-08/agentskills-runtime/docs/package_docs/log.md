## Package log
- [Package log](#package-log)
  - [struct LogUtils](#struct-logutils)
    - [func debug](#func-debug)
    - [func debug](#func-debug-1)
    - [func debug](#func-debug-1)
    - [func debug](#func-debug-1)
    - [func debug](#func-debug-1)
    - [func debug](#func-debug-1)
    - [func debug](#func-debug-1)
    - [func error](#func-error)
    - [func error](#func-error-1)
    - [func error](#func-error-1)
    - [func info](#func-info)
    - [func info](#func-info-1)
    - [func info](#func-info-1)
    - [func info](#func-info-1)
    - [func info](#func-info-1)
    - [func info](#func-info-1)
    - [func info](#func-info-1)
    - [func info](#func-info-1)
    - [func info](#func-info-1)
    - [func trace](#func-trace)
    - [func trace](#func-trace-1)
    - [func trace](#func-trace-1)
    - [func trace](#func-trace-1)

### struct LogUtils
#### func debug
```
static func debug(ex: Exception): Unit
```
- Description: Logs a debug level message from an Exception object.
- Parameters:
  - `ex`: `Exception`, The Exception object containing the message to be logged.

#### func debug
```
static func debug(msg: String): Unit
```
- Description: Logs a debug level message.
- Parameters:
  - `msg`: `String`, The message to be logged.

#### func debug
```
static func debug(msg: Message): Unit
```
- Description: Logs a debug level message from a Message object.
- Parameters:
  - `msg`: `Message`, The Message object containing the message to be logged.

#### func debug
```
static func debug(messages: MessageList): Unit
```
- Description: Logs multiple debug level messages from a MessageList.
- Parameters:
  - `messages`: `MessageList`, The list of messages to be logged.

#### func debug
```
static func debug(name: String, msg: String): Unit
```
- Description: Logs a debug level message with a name prefix.
- Parameters:
  - `name`: `String`, The name prefix for the message.
  - `msg`: `String`, The message to be logged.

#### func debug
```
static func debug(name: String, msg: Message): Unit
```
- Description: Logs a debug level message with a name prefix from a Message object.
- Parameters:
  - `name`: `String`, The name prefix for the message.
  - `msg`: `Message`, The Message object containing the message to be logged.

#### func debug
```
static func debug(name: String, messages: MessageList): Unit
```
- Description: Logs multiple debug level messages with a name prefix from a MessageList.
- Parameters:
  - `name`: `String`, The name prefix for the messages.
  - `messages`: `MessageList`, The list of messages to be logged.

#### func error
```
static func error(ex: Exception): Unit
```
- Description: Logs an error level message from an Exception object.
- Parameters:
  - `ex`: `Exception`, The Exception object containing the message to be logged.

#### func error
```
static func error(msg: String): Unit
```
- Description: Logs an error level message.
- Parameters:
  - `msg`: `String`, The message to be logged.

#### func error
```
static func error(name: String, msg: String): Unit
```
- Description: Logs an error level message with a name prefix.
- Parameters:
  - `name`: `String`, The name prefix for the message.
  - `msg`: `String`, The message to be logged.

#### func info
```
static func info(msg: String): Unit
```
- Description: Logs an info level message.
- Parameters:
  - `msg`: `String`, The message to be logged.

#### func info
```
static func info(ex: Exception): Unit
```
- Description: Logs an info level message from an Exception object.
- Parameters:
  - `ex`: `Exception`, The Exception object containing the message to be logged.

#### func info
```
static func info(msg: Message): Unit
```
- Description: Logs an info level message from a Message object.
- Parameters:
  - `msg`: `Message`, The Message object containing the message to be logged.

#### func info
```
static func info(name: String, msg: Message): Unit
```
- Description: Logs an info level message with a name prefix from a Message object.
- Parameters:
  - `name`: `String`, The name prefix for the message.
  - `msg`: `Message`, The Message object containing the message to be logged.

#### func info
```
static func info(messages: MessageList): Unit
```
- Description: Logs multiple info level messages from a MessageList.
- Parameters:
  - `messages`: `MessageList`, The list of messages to be logged.

#### func info
```
static func info(name: String, history: MessageList): Unit
```
- Description: Logs multiple info level messages with a name prefix from a MessageList.
- Parameters:
  - `name`: `String`, The name prefix for the messages.
  - `history`: `MessageList`, The list of messages to be logged.

#### func info
```
static func info(messages: Array<Message>): Unit
```
- Description: Logs multiple info level messages from an array of Message objects.
- Parameters:
  - `messages`: `Array<Message>`, The array of messages to be logged.

#### func info
```
static func info(name: String, messages: Array<Message>): Unit
```
- Description: Logs multiple info level messages with a name prefix from an array of Message objects.
- Parameters:
  - `name`: `String`, The name prefix for the messages.
  - `messages`: `Array<Message>`, The array of messages to be logged.

#### func info
```
static func info(name: String, msg: String): Unit
```
- Description: Logs an info level message with a name prefix.
- Parameters:
  - `name`: `String`, The name prefix for the message.
  - `msg`: `String`, The message to be logged.

#### func trace
```
static func trace(messages: MessageList): Unit
```
- Description: Logs multiple trace level messages from a MessageList.
- Parameters:
  - `messages`: `MessageList`, The list of messages to be logged.

#### func trace
```
static func trace(msg: Message): Unit
```
- Description: Logs a trace level message from a Message object.
- Parameters:
  - `msg`: `Message`, The Message object containing the message to be logged.

#### func trace
```
static func trace(name: String, msg: String): Unit
```
- Description: Logs a trace level message with a name prefix.
- Parameters:
  - `name`: `String`, The name prefix for the message.
  - `msg`: `String`, The message to be logged.

#### func trace
```
static func trace(msg: String): Unit
```
- Description: Logs a trace level message.
- Parameters:
  - `msg`: `String`, The message to be logged.


