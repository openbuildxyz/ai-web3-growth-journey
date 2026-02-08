## Package compactor
- [Package compactor](#package-compactor)
  - [class SimpleConversationCompactor](#class-simpleconversationcompactor)
    - [func compact](#func-compact)
  - [class SimpleToolCompactor](#class-simpletoolcompactor)
    - [func compact](#func-compact-1)

### class SimpleConversationCompactor
#### func compact
```
func compact(conversation: Conversation): String
```
- Description: This agent attempts to summarize the tool execution results into concise and structured summaries.
- Parameters:
  - `conversation`: `Conversation`, The conversation to be summarized.


### class SimpleToolCompactor
#### func compact
```
func compact(toolRequest: ToolRequest, toolResponse: ToolResponse): String
```
- Description: This agent attempts to summarize the tool execution results into concise and structured summaries.
- Parameters:
  - `toolRequest`: `ToolRequest`, The request object containing details of the tool invocation.
  - `toolResponse`: `ToolResponse`, The response object containing the results from the tool execution.


