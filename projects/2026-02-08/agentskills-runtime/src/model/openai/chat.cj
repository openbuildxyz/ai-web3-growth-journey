/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model.openai

import magic.core.model.*
import magic.utils.http.*
import magic.core.message.*
import magic.core.tool.{Tool, ToolRequest}
import magic.dsl.jsonable
import magic.jsonable.*
import magic.config.Config
import magic.log.LogUtils

import std.collection.{ArrayList, map, collectArray}
import std.collection.HashMap
import std.time.DateTime
import stdx.encoding.json.*

@When[cjc_version < "1.0.0"]
import std.time.Duration

@jsonable
private class OpenAIChatResponse {
    let id: String
    let object: String
    let created: Int64
    let model: String
    let choices: Array<Choice>
    let usage: OpenAIChatUsage
}

@jsonable
private class Choice {
    let index: Int64
    let message: OpenAIChatMessage
    let finish_reason: String
}

@jsonable
private class OpenAIChatMessage {
    let role: String
    let content: String
    let reasoning_content: Option<String>
    let tool_calls: Array<OpenAIChatToolCall>
}

@jsonable
private class OpenAIChatToolCall {
    let id: String
    // let `type`: String
    let function: OpenAIChatFunctionCall
}

@jsonable
private class OpenAIChatFunctionCall {
    let name: String
    let arguments: String // Arguments of the function call
}

@jsonable
private class OpenAIChatUsage {
    let prompt_tokens: Int64
    let completion_tokens: Int64
    let total_tokens: Int64
}

//----------------------------------------------
// Response for streaming
//----------------------------------------------
@jsonable
private class ChunkResponse {
    let id: String
    let object: String
    let created: Int64
    let model: String
    let choices: Array<ChunkChoice>
    let usage: Option<OpenAIChatUsage>
}

@jsonable
private class ChunkChoice {
    let finish_reason: String
    let index: Int64
    let delta: Delta
}

@jsonable
private class Delta {
    let role: Option<String>
    let content: String
    let reasoning_content: Option<String>
}

private class AsyncChatChunkStream <: Iterator<AsyncChatChunk> {
    private let sseStream: SSEStream
    private let start = DateTime.now()
    private var role: Option<MessageRole> = None
    private var usage: Option<ChatUsage> = None
    private var finished = false

    init(httpStream: HttpStream) {
        this.sseStream = SSEStream(httpStream)
    }

    override public func next(): Option<AsyncChatChunk> {
        if (finished) {
            return None
        }
        while (true) {
            let sseItem = try {
                this.sseStream.next()
            } catch(ex: HttpException) {
                throw ModelException("Fail to get chat model async chat response: ${ex.error}")
            }
            if (let Some(sseItem) <- sseItem) {
                if (let Some(chunk) <- this.parseSSEItem(sseItem)) {
                    return chunk
                } else {
                    continue
                }
            } else {
                // Some model provider may not return "[DONE]" and finish the http stream directly?
                this.finished = true
                return AsyncChatChunk(
                    message: Message(this.role.getOrThrow(), ""),
                    done: true,
                    usage: this.usage
                )
            }
        }
        throw UnsupportedException("Unreachable")
    }

    private func parseSSEItem(sseItem: SSEItem): Option<AsyncChatChunk> {
        if (sseItem.tag != "data") {
            let msg = "Async chat response read invalid sse data: `${sseItem}`"
            LogUtils.debug(msg)
            throw ModelException(msg)
        }
        LogUtils.trace("To parse SSE content: `${sseItem.content}`")
        if (sseItem.content.isEmpty()) {
            return None
        }
        // Try to parse the data
        let (reason, content) = try {
            parseContent(sseItem.content)
        } catch(ex: Exception) {
            LogUtils.debug("Parsing SSE content failure ${ex}")
            throw ex
        }
        LogUtils.trace("[AsyncChatChunkStream]", String.join([
            "Parsed",
            "===================================",
            "Reasoning: ${reason}",
            "-----------------------------------",
            "Content: ${content}"], delimiter: "\n")
        )
        if (content == "[DONE]") {
            // Consume and close the http sse stream
            while (let Some(_) <- this.sseStream.next()) { }
            this.finished = true
            return AsyncChatChunk(
                message: Message(this.role.getOrThrow(), ""),
                done: true,
                usage: this.usage
            )
        } else {
            return AsyncChatChunk(
                message: Message(
                    this.role.getOrThrow(),
                    content,
                    reason: if (reason.isEmpty()) { None } else { reason }
                ),
                done: false
            )
        }
    }

    /**
     * Parse the content of a SSE data item, return the reasoning content and the content
     * If the content is "[DONE]", return an empty reasoning content and the content itself.
     */
    private func parseContent(content: String): (String, String) {
        if (content == "[DONE]") {
            return ("", content)
        }
        let chunkResp = try {
            ChunkResponse.fromJsonValue(JsonValue.fromStr(content))
        } catch(ex: JsonException | IllegalStateException) { // JsonValue.fromStr may throw an IllegalArgumentException
            let msg = "Fail to parse http chunk data response as a JSON value `${content}`"
            LogUtils.error(msg)
            throw ModelException(msg)
        }
        // A chunk response may have multiple choices? See the OpenAI API document
        // So, merge the reasoning_content and content of choices of the chunk response
        let reasonContentBuilder = StringBuilder()
        let contentBuilder = StringBuilder()
        for (chunkChoice in chunkResp.choices) {
            let delta = chunkChoice.delta
            if (let Some(role) <- delta.role) {
                this.role = MessageRole.fromStr(role) // Do we need to check the role?
            }
            reasonContentBuilder.append(delta.reasoning_content ?? "")
            contentBuilder.append(delta.content)
        }
        // Check whether this chunk contains the usage
        if (let Some(respUsage) <- chunkResp.usage) {
            let duration = DateTime.now() - start
            this.usage = ChatUsage(
                promptTokens: respUsage.prompt_tokens,
                completionTokens: respUsage.completion_tokens,
                // totalTokens: respUsage.total_tokens,
                timeCost: duration
            )
        }
        return (reasonContentBuilder.toString(), contentBuilder.toString())
    }
}

public class OpenAIChatModel <: ChatModel {
    private let _provider: String
    private let model: String
    private let baseURL: String
    private let apiKey: String
    private var _contextLength: Int64
    private var _maxTokens: Option<Int64> = None

    public init(
        _provider: String,
        model: String,
        apiKey!: String,
        baseURL!: String,
        temperature!: Option<Float64> = None,
        contextLength!: Int64 = Config.defaultContextLen) {
        this._provider = _provider
        this.model = model
        this.baseURL = baseURL
        this.apiKey = apiKey
        this._contextLength = contextLength
    }

    override public prop provider: String {
        get() { _provider }
    }

    override public prop name: String {
        get() { model }
    }

    override public prop contextLength: Int64 {
        get() { _contextLength }
    }

    override public mut prop maxTokens: Option<Int64> {
        get() { _maxTokens }
        set(v) { _maxTokens = v }
    }

    override public func create(chatReq: ChatRequest): ChatResponse {
        let (header, req) = prepareHeaderAndRequest(chatReq, stream: false)
        let start = DateTime.now()

        try {
            match (HttpUtils.post("${this.baseURL}/chat/completions", header, req)) {
                case Some(body) =>
                    if (body.isEmpty()) {
                        throw ModelException("Http response body is empty")
                    } else {
                        return this.parseResponse(body, DateTime.now() - start)
                    }
                case None => throw ModelException("Http response body is None")
            }
        } catch (ex: HttpException) {
            throw ModelException(ex.error)
        }
    }

    private func prepareHeaderAndRequest(chatReq: ChatRequest, stream!: Bool): (HashMap<String, String>, JsonObject) {
        let header = HashMap<String, String>([
            ("Content-Type", "application/json"),
            ("Authorization", "Bearer ${this.apiKey}")
        ])
        let req = this.request2Json(chatReq, stream: stream)
        return (header, req)
    }

    private func request2Json(chatReq: ChatRequest, stream!: Bool): JsonObject {
        let jo = JsonObject()
        jo.put("model", JsonString(model))
        jo.put("messages", this.messageList2Json(chatReq.messageList))
        jo.put("stream", JsonBool(stream))
        if (let Some(items) <- chatReq.stop) {
            if (!items.isEmpty()) {
                let ja = JsonArray(
                    Array<JsonValue>(items.size, { i: Int64 =>
                        JsonString(items[i])
                    })
                )
                jo.put("stop", ja)
            }
        }
        if (let Some(temp) <- chatReq.temperature) {
            jo.put("temperature", JsonFloat(temp))
        }
        if (!chatReq.tools.isEmpty()) {
            jo.put("tools", this.tools2Json(chatReq.tools))
        }
        if (let Some(value) <- this.maxTokens) {
            jo.put("max_tokens", JsonInt(value))
        }
        return jo
    }

    private func messageList2Json(messageList: MessageList): JsonArray {
        let ja = JsonArray()
        for (msg in messageList) {
            let msgJson = if (let Some(image) <- msg.image) {
                // Schema: { role: string,
                //           content: [
                //             { type: "text", text: string },
                //             { type: "image_url", image_url: {url: string} }
                //           ]
                // }
                JsonUtils.buildJsonObject(
                    ("role", JsonString(msg.role.toString())),
                    ("content", JsonArray([
                        JsonUtils.buildJsonObject([
                            ("type", "text"),
                            ("text", msg.content)
                        ]),
                        JsonUtils.buildJsonObject(
                            ("type", JsonString("image_url")),
                            ("image_url", JsonUtils.buildJsonObject("url", image))
                        )
                    ])
                ))
            } else {
                // Schema: { role: string, content: string }
                JsonUtils.buildJsonObject(
                    ("role", msg.role.toString()),
                    ("content", msg.content)
                )
            }
            ja.add(msgJson)
        }
        return ja
    }

    private func tools2Json(tools: Array<Tool>): JsonArray {
        tools |>
            map { tool =>
                JsonUtils.buildJsonObject([
                    ("type", JsonString("function")),
                    ("function", tool.toJsonValue())
                ])
            } |>
            collectArray |>
            JsonUtils.buildJsonArray
    }

    private func parseResponse(body: String, duration: Duration): ChatResponse {
        let resp = OpenAIChatResponse.fromJsonValue(JsonValue.fromStr(body))
        let messageList = MessageList()
        if (resp.choices.size > 1) {
            LogUtils.error("The chat model replied multiple messages")
        } else if (resp.choices.isEmpty()) {
            let msg = "The chat model did not reply a message"
            LogUtils.error(msg)
            throw ModelException(msg)
        }
        let choice = resp.choices[0]
        // If the output is too long, output may be truncated,
        // which result in incomplete Json string of the tool call
        // Throw an exception to notify the callers
        if (choice.finish_reason == "length") {
            LogUtils.error("The chat model replied a message truncated by length")
            throw ModelException("length")
        }
        let openAIMsg = choice.message
        let message = Message(
            MessageRole.fromStr(openAIMsg.role),
            openAIMsg.content,
            reason: openAIMsg.reasoning_content
        )
        let toolRequests = ArrayList<ToolRequest>()
        for (toolCall in choice.message.tool_calls) {
            // If the output is too long, output may be truncated,
            // which result in incomplete Json string of the tool call
            try {
                toolRequests.add(
                    ToolRequest(
                        name: toolCall.function.name,
                        args: JsonValue.fromStr(toolCall.function.arguments).asObject()
                    )
                )
            } catch(ex: JsonException) {
                LogUtils.debug("Invalid tool call: ${toolCall.toJsonValue().toJsonString()}")
            }
        }
        let usage = ChatUsage(
            promptTokens: resp.usage.prompt_tokens,
            completionTokens: resp.usage.completion_tokens,
            // totalTokens: resp.usage.total_tokens,
            timeCost: duration
        )
        return ChatResponse(resp.model, message, toolRequests: toolRequests.toArray(), usage: usage)
    }

    override public func asyncCreate(chatReq: ChatRequest): AsyncChatResponse {
        let (header, req) = prepareHeaderAndRequest(chatReq, stream: true)
        let httpStream = HttpUtils.asyncPost("${this.baseURL}/chat/completions", header, req)
        let chunkStream = AsyncChatChunkStream(httpStream)
        return AsyncChatResponse(model, chunkStream)
    }
}
