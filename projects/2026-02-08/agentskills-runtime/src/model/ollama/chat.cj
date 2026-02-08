/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model.ollama

import magic.core.model.*
import magic.core.message.*
import magic.core.tool.{Tool, ToolRequest}
import magic.config.Config
import magic.dsl.jsonable
import magic.jsonable.*
import magic.utils.http.*
import magic.log.LogUtils

import std.time.DateTime
import std.collection.{ArrayList, HashMap, map, collectArray}
import stdx.encoding.json.*

@jsonable
private class OllamaChatResponse {
    let model: String
    let created_at: String
    let message: OllamaChatMessage
    let done: Bool
    let done_reason: String

    let total_duration: Option<Int64>
    // let load_duration: Option<Int64>
    let prompt_eval_count: Option<Int64>
    // let prompt_eval_duration: Option<Int64>
    let eval_count: Option<Int64>
}

@jsonable
private class OllamaChatMessage {
    let role: String
    let content: String
    let thinking: Option<String>
    let tool_calls: Array<OllamaToolCall>
}

@jsonable
private class OllamaToolCall {
    let function: OllamaFunctionCall
}

@jsonable
private class OllamaFunctionCall {
    let name: String
    let arguments: JsonObject
}

private class AsyncChatChunkStream <: Iterator<AsyncChatChunk> {
    AsyncChatChunkStream(let httpStream: HttpStream) { }

    override public func next(): Option<AsyncChatChunk> {
        while (let Some(data) <- httpStream.next()) {
            if (data.isEmpty()) {
                continue
            }
            let resp = OllamaChatResponse.fromJsonValue(JsonValue.fromStr(data))
            // If the output is too long, output may be truncated,
            // which result in incomplete Json string of the tool call
            // Throw an exception to notify the callers
            if (resp.done_reason == "length") {
                throw ModelException("length")
            }
            if (resp.done) {
                return AsyncChatChunk(
                    message: Message(MessageRole.fromStr(resp.message.role), resp.message.content),
                    done: true,
                    usage: ChatUsage(
                        promptTokens: resp.prompt_eval_count ?? 0,
                        completionTokens: resp.eval_count ?? 0,
                        // totalTokens: (resp.prompt_eval_count ?? 0) + (resp.eval_count ?? 0),
                        timeCost: resp.total_duration.map { t => Duration.nanosecond * t }
                    )
                )
            } else {
                return AsyncChatChunk(
                    message: Message(MessageRole.fromStr(resp.message.role), resp.message.content),
                )
            }
        }
        return None
    }
}

public class OllamaChatModel <: ChatModel {
    private let model: String
    private let baseURL: String
    private var _contextLength: Int64
    private var _maxTokens: Option<Int64>

    public init(
        model: String,
        baseURL!: String,
        contextLength!: Int64 = Config.defaultContextLen) {
        this.model = model
        this.baseURL = baseURL
        this._contextLength = contextLength
        this._maxTokens = None
    }

    override public prop provider: String {
        get() { "ollama" }
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
        match (HttpUtils.post("${this.baseURL}/api/chat", header, req)) {
            case Some(body) =>
                if (body.isEmpty()) {
                    throw ModelException("Http response body is empty")
                } else {
                    return this.parseResponse(body)
                }
            case None => throw ModelException("Fail to get http response")
        }
    }

    override public func asyncCreate(chatReq: ChatRequest): AsyncChatResponse {
        let (header, req) = prepareHeaderAndRequest(chatReq, stream: true)
        let httpStream = HttpUtils.asyncPost("${this.baseURL}/api/chat", header, req)
        let chunkStream = AsyncChatChunkStream(httpStream)
        return AsyncChatResponse(model, chunkStream)
    }

    private func prepareHeaderAndRequest(chatReq: ChatRequest, stream!: Bool): (HashMap<String, String>, JsonObject) {
        let header = HashMap<String, String>([
            ("Content-Type", "application/json")
        ])
        let req = this.request2Json(chatReq, stream: stream)
        return (header, req)
    }

    private func request2Json(chatReq: ChatRequest, stream!: Bool): JsonObject {
        let jo = JsonObject()
        jo.put("model", JsonString(model))
        jo.put("messages", this.messageList2Json(chatReq.messageList))
        jo.put("stream", JsonBool(stream))
        if (!chatReq.tools.isEmpty()) {
            jo.put("tools", this.tools2Json(chatReq.tools))
        }
        // Prepare option
        if (chatReq.stop.isSome() || chatReq.temperature.isSome()) {
            let options = JsonObject()
            // Prepare "temperature"
            if (let Some(temp) <- chatReq.temperature) {
                options.put("temperature", JsonFloat(temp))
            }
            // Prepare "stop"
            if (let Some(items) <- chatReq.stop) {
                if (!items.isEmpty()) {
                    let ja = JsonArray(
                        Array<JsonValue>(items.size, { i: Int64 =>
                            JsonString(items[i])
                        })
                    )
                    options.put("stop", ja)
                }
            }
            if (let Some(value) <- this.maxTokens) {
                jo.put("num_predict", JsonInt(value))
            }
            jo.put("options", options)
        }
        return jo
    }

    private func messageList2Json(messageList: MessageList): JsonArray {
        let ja = JsonArray()
        for (m in messageList) {
            let jo = JsonObject()
            jo.put("role", JsonString(m.role.toString()))
            jo.put("content", JsonString(m.content))
            if (let Some(image) <- m.image) {
                if (image.startsWith("data:image/")) {
                    let base64 = ";base64,"
                    if (let Some(pos) <- image.indexOf(base64)) {
                        let start = pos + base64.size
                        jo.put("images", JsonArray([JsonString(image[start..])]))
                    }
                } else {
                    jo.put("images", JsonArray([JsonString(image)]))
                }
            }
            ja.add(jo)
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

    private func parseResponse(body: String): ChatResponse {
        let resp = OllamaChatResponse.fromJsonValue(JsonValue.fromStr(body))
        let msg = resp.message

        let toolRequests = msg.tool_calls |>
            map { toolCall =>
                ToolRequest(
                    name: toolCall.function.name,
                    args: toolCall.function.arguments
                )
            } |>
            collectArray

        let usage = ChatUsage(
            promptTokens: resp.prompt_eval_count ?? 0,
            completionTokens: resp.eval_count ?? 0,
            // totalTokens: (resp.prompt_eval_count ?? 0) + (resp.eval_count ?? 0),
            timeCost: resp.total_duration.map { t => Duration.nanosecond * t }
        )

        return ChatResponse(
            model,
            Message(MessageRole.fromStr(msg.role), msg.content, reason: msg.thinking),
            toolRequests: toolRequests,
            usage: usage
        )
    }
}
