/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.mcp

import magic.core.agent.Agent
import magic.core.tool.Tool
import magic.jsonable.*
import magic.log.LogUtils

import std.collection.{ArrayList, HashMap, map, collectArray}
import stdx.encoding.json.{JsonValue, JsonObject, JsonString}

private func convertTool2MCP(tool: Tool): MCPTool {
    let properties = JsonObject()
    let required = ArrayList<String>()
    for (param in tool.parameters) {
        let paramTypeSchema = param.typeSchema.toJsonValue().asObject()
        // description should be added to the type schema
        if (!param.description.isEmpty()) {
            paramTypeSchema.put("description", JsonString(param.description))
        }
        properties.put(param.name, paramTypeSchema)
        required.add(param.name)
    }
    let inputSchema= JsonUtils.buildJsonObject([
        ("type", JsonString("object")),
        ("properties", properties),
        ("required", JsonUtils.buildJsonArray(required.toArray()))
    ])
    return MCPTool(
        name: tool.name,
        description: tool.description,
        inputSchema: inputSchema
    )
}

/**
 * MCP server via the stdio & sse transport
 */
public abstract class AbsMCPServer {
    protected func send(msg: String): Unit

    protected func recv(): Option<String>

    private let tools: Array<Tool>

    protected init(tools: Array<Tool>) {
        this.tools = tools
    }

    protected func initialize(): Unit {
        var initialized = false
        while (!initialized) {
            try {
                let initReq = this.recvRequest<InitialRequest>()
                let initResp = this.buildInitResponse(initReq.id)
                this.send(initResp)

                let _ = this.recvRequest<InitializedNotification>()
                initialized = true
            } catch (e: Exception) {
                LogUtils.error("Initialization failed: ${e.message}, retrying...")
            }
        }
    }

    private func buildInitResponse(id: Int): InitialResponse {
        return InitialResponse(
            id: id,
            result: InitialResult(
                capabilities: ServerCapabilities(
                    prompts: PromptsCapability(),
                    resources: ResourcesCapability(),
                    tools: ToolsCapability()
                ),
                serverInfo: Implementation(
                    name: "Cangjie Magic Agent Server",
                    version: "0.1"
                )
            )
        )
    }

    /**
     * Currently, only tool list and call requests are supported.
     */
    protected func handleRequestMessage(msg: String): Option<ToJsonValue> {
        let req = MCPRequest.fromJsonValue(JsonValue.fromStr(msg))
        let response: Option<ToJsonValue> = match (req.method) {
            case "initialize" => Some(this.buildInitResponse(req.id))
            case "notifications/initialized" => Option<ToJsonValue>.None
            case "notifications/cancelled" => Option<ToJsonValue>.None
            case "tools/list" =>
                let mcpTools = this.tools |> map { tool => convertTool2MCP(tool) } |> collectArray
                Some(ListToolsResponse(
                    id: req.id,
                    result: ListToolsResult(tools: mcpTools)
                ))
            case "tools/call" =>
                let callResult = this.handleCallTool(CallToolRequest.fromJsonValue(JsonValue.fromStr(msg)))
                // For tools/call, we return the result directly, not wrapped in Some
                // because handleCallTool already returns a ToJsonValue (CallToolResponse)
                Some(callResult)
            case "ping" =>
                let pingResult = PingResponse(
                    id: req.id,
                    result: PingResult()
                )
                Some(pingResult)
            case _ =>
                let errorResult = MCPError(
                    id: req.id,
                    error: ErrorContent(
                        code: INVALID_REQUEST,
                        message: "Server does not support ${req.method}"
                    )
                )
                Some(errorResult)
        }
        return response
    }

    private func handleCallTool(callToolRequest: CallToolRequest): ToJsonValue {
        let name = callToolRequest.params.name
        if (let Some(tool) <- this.findTool(name)) {
            let args = (callToolRequest.params.arguments ?? JsonObject()).getFields()

            let toolResponse = tool.invoke(args)

            // Check if the tool response contains execution status strings
            // Only check for exact matches of status strings that are short
            if (toolResponse.content.size <= 10 && (
                toolResponse.content == "Success" ||
                toolResponse.content == "Failure" ||
                toolResponse.content == "Partial" ||
                toolResponse.content == "Result" ||
                toolResponse.content == "Response" ||
                toolResponse.content == "Return" ||
                toolResponse.content == "Ready")) {
                // If the content is an execution status string, return an error response
                // Instead of returning an error, wrap the status in a proper JSON response
                let wrappedContent = "{\"result\":\"${toolResponse.content}\",\"is_status_like\":true,\"warning\":\"Short status-like string returned by tool\"}"
                return CallToolResponse(
                    id: callToolRequest.id,
                    result: CallToolResult(
                        content: [ToolCallContent.Text(TextContent(text: wrappedContent))],
                        isError: Some(false)  // Not treating as error anymore
                    )
                )
            }

            // Attempt to validate that the response is valid JSON
            try {
                let _ = JsonValue.fromStr(toolResponse.content)
            } catch (e: Exception) {
                // Wrap non-JSON responses in JSON format to prevent parsing errors on client side
                let wrappedContent = "{\"result\":\"${toolResponse.content}\",\"is_raw_response\":true,\"warning\":\"Non-JSON response wrapped in JSON format\"}"
                return CallToolResponse(
                    id: callToolRequest.id,
                    result: CallToolResult(
                        content: [ToolCallContent.Text(TextContent(text: wrappedContent))],
                        isError: Some(false)  // Not treating as error anymore
                    )
                )
            }

            return CallToolResponse(
                id: callToolRequest.id,
                result: CallToolResult(
                    content: [ToolCallContent.Text(TextContent(text: toolResponse.content))],
                    isError: Some(toolResponse.isError)
                )
            )
        } else {
            return MCPError(
                id: callToolRequest.id,
                error: ErrorContent(
                    code: METHOD_NOT_FOUND,
                    message: "Server does not has tool ${name}"
                )
            )
        }
    }

    private func findTool(name: String): Option<Tool> {
        for (tool in this.tools) {
            if (tool.name == name) {
                return tool
            }
        }
        return None
    }

    protected func send<T>(response: T): Unit where T <: ToJsonValue {
        this.send(response.toJsonValue().toString())
    }

    private func recvRequest<T>(): T where T <: Jsonable<T> {
        let msg = this.recv().getOrThrow({=> MCPException("Fail to get MCP response")})
        return T.fromJsonValue(JsonValue.fromStr(msg))
    }
}
