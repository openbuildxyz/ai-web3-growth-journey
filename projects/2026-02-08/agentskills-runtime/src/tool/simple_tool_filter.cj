/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tool

import magic.dsl.jsonable
import magic.core.tool.*
import magic.core.rag.*
import magic.core.message.{Message, MessageList}
import magic.core.model.{ChatModel, EmbeddingModel}
import magic.jsonable.*
import magic.log.LogUtils
import magic.parser.{ParserUtils, ParserException}
import magic.vdb.{SemanticMap, InMemoryVectorDatabase, SimpleIndexMap}
import magic.model.{ModelManager, ModelUtils}
import magic.prompt.Template

import std.collection.{ArrayList, HashMap, map, collectArray}
import stdx.encoding.json.*

@jsonable
private class Response {
    let relevantTools: Array<FoundTool>
}

@jsonable
private class FoundTool {
    let name: String
    let reason: String
}

private const FILTER_TOOL_PROMPT = """
Objective: Select the most relevant tool(s) for a given user question from a predefined list.

# Instructions

Analyze the user's question and the provided list of tools.
For each tool, evaluate its relevance to the question based on its name and description.
Return the top {number} most relevant tools (if any), ranked by relevance. If no tool fits, return an empty list.
Justify your selections with a brief reasoning.

# Available Tools

{tools}
...

# Output Structure:

```json
{
  "relevantTools": [
    {
      "name": "[Selected Tool Name]",
      "reason": "[Brief justification]"
    },
    ...
  ]
}
```

# Examples of Input/Output

## Example 1

User Question: "How can I extract text from a PDF?"
Available Tools:

PDF Text Extractor: Extracts raw text from PDFs while preserving formatting.
-----
Image OCR: Converts text in images/scans to machine-readable text.
-----
PDF Editor: Edits PDF metadata, merges/splits pages, but does not extract text.

Output:
```json
{
  "relevantTools": [
    {
      "name": "PDF Text Extractor",
      "reason": "Directly matches the task of extracting text from PDFs."
    },
    {
      "name": "Image OCR",
      "reason": "May be useful if the PDF contains scanned images of text."
    }
  ]
}
```

## Example 2

User Question: "What's the weather today?"
Available Tools:

PDF Text Extractor: Extracts raw text from PDFs while preserving formatting.
-----
Image OCR: Converts text in images/scans to machine-readable text.
-----
Web Search: Retrieve information from the internet by querying search engines.
-----
Get Time: Retrieves the current date and time

Output:
```json
{
  "relevantTools": [
    {
      "name": "Web Search",
      "reason": "Search the Weather forecast."
    },
    {
      "name": "Get Time",
      "reason": "I need to know today's date to get the accurate weather."
    }
  ]
}
```

User Question: "Generate a login page html for me?"
Available Tools:

PDF Text Extractor: Extracts raw text from PDFs while preserving formatting.
-----
Get Time: Retrieves the current date and time

Output:
```json
{
  "relevantTools": [ ]
}
```

# Input
User Question: {question}
"""

private type InMemSemanticMap = SemanticMap<InMemoryVectorDatabase, SimpleIndexMap, String>

private struct FilterConfig {
    /**
     * Filter tools via an embedding model or a chat model
     */
    let viaEmbedding: Bool
    /**
     * The chat model to use
     */
    let chatModel: Option<ChatModel>
    /**
     * The embedding model to use
     */
    let embeddingModel: Option<EmbeddingModel>
    /**
     * The maximum number of tools to filter
     */
    let number: Int64

    init(chatModel: ChatModel, number!: Int64) {
        this.viaEmbedding = false
        this.chatModel = chatModel
        this.embeddingModel = None
        this.number = number
    }

    init(embeddingModel: EmbeddingModel, number!: Int64) {
        this.viaEmbedding = true
        this.chatModel = None
        this.embeddingModel = embeddingModel
        this.number = number
    }
}

/**
 * A simple tool filter implements two ways to filter tools:
 * 1. Via an embedding model, which is more efficient
 * 2. Via a chat model, which is less efficient but can handle more complex filtering
 */
protected class SimpleToolFilter <: ToolFilter {
    private let config: FilterConfig

    protected init(chatModel: ChatModel, number!: Int64) {
        this.config = FilterConfig(chatModel, number: number)
    }

    protected init(embeddingModel: EmbeddingModel, number!: Int64) {
        this.config = FilterConfig(embeddingModel, number: number)
    }

    public override func filter(question: String, tools: Collection<Tool>): Array<Tool> {
        if (config.viaEmbedding) {
            this.filterToolViaEmbedding(question, tools, config)
        } else {
            this.filterToolViaLLM(question, tools, config)
        }
    }

    private func filterToolViaEmbedding(question: String,
                                        tools: Collection<Tool>,
                                        config: FilterConfig): Array<Tool> {
        if (config.embeddingModel.isNone()) {
            throw ToolException("An embedding model is not specified")
        }
        // Do not build the semantic map from scratch
        // Change it later
        let semMap = InMemSemanticMap(
            vectorDB: InMemoryVectorDatabase(),
            indexMap: SimpleIndexMap(),
            embeddingModel: config.embeddingModel.getOrThrow()
        )
        // Put tools in the semantic map
        for (tool in tools) {
            semMap.put(tool.description, tool.name)
        }

        let filteredTools = ArrayList<Tool>()
        for (name in semMap.search(question, number: config.number)) {
            if (let Some(t) <- SimpleToolFilter.findTool(tools, name)) {
                filteredTools.add(t)
            }
        }
        return filteredTools.toArray()
    }

    private func filterToolViaLLM(question: String,
                                  tools: Collection<Tool>,
                                  config: FilterConfig): Array<Tool> {
        if (config.chatModel.isNone()) {
            throw ToolException("A chat model is not specified")
        }
        let toolPrompts = ArrayList<String>()
        for (tool in tools) {
            toolPrompts.add("${tool.name}: ${tool.description}")
        }
        let messages = MessageList([
            Message.system(
                FILTER_TOOL_PROMPT.format([
                    ("number", config.number),
                    ("question", question),
                    ("tools", String.join(toolPrompts.toArray(), delimiter: "\n-----\n"))
                ])
            )
        ])
        // Use LLM to filter out tools
        let chatResp = ModelUtils.makeChat("Simple Tool Manager", config.chatModel.getOrThrow(), messages)
        // Parse the LLM output
        var response = Option<Response>.None
        if (let Some(_chatResp) <- chatResp) {
            try {
                response = ParserUtils.extractFirstValue<Response>(_chatResp.message.content)
            } catch (ex: ParserException) {
                LogUtils.error("Failed to parse the chat model response `${_chatResp.message.content}`; ${ex.reason}")
            }
        }
        let filteredTools = ArrayList<Tool>()
        for (tool in (response?.relevantTools) ?? []) {
            if (let Some(t) <- SimpleToolFilter.findTool(tools, tool.name)) {
                filteredTools.add(t)
            } else {
                LogUtils.error("Invalid tool after being filtered: `${tool.name}`")
            }
        }
        return filteredTools.toArray()
    }

    static func findTool(tools: Collection<Tool>, name: String): Option<Tool> {
        for (tool in tools) {
            if (tool.name == name) {
                return Some(tool)
            }
        }
        return None
    }
}