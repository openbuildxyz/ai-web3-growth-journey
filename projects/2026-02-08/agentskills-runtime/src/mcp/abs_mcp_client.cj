/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.mcp

import magic.core.tool.Tool
import magic.utils.newProcess
import magic.jsonable.*
import magic.log.LogUtils
import magic.core.ToolResponse

import std.collection.{ArrayList, HashMap, map, collectArray}
import stdx.encoding.json.{JsonValue, JsonObject}

/**
 * MCP client via the stdio transport
 */
public abstract class AbsMCPClient <: MCPClient {
    protected func doSend(req: JsonObject): Bool

    protected func doRecv(): Option<String>

    open protected func doBeforeRequest(): Unit { }

    protected func send(req: JsonObject): Unit {
        if (!doSend(req)) {
            throw MCPException("Fail to send request")
        }
    }

    protected func recv(): String {
        return doRecv().getOrThrow({ => MCPException("Fail to get MCP response") })
    }

    protected func initialize(): Unit {
        let initRequest = InitialRequest(
            params: InitialParams(
                capabilities: ClientCapabilities(),
                clientInfo: Implementation(
                    name: "Cangjie Magic Agent Client",
                    version: "0.1"
                )
            )
        )
        this.send(initRequest)
        let resp = this.recvResponse<InitialResponse>()
        if (resp.result.protocolVersion != initRequest.params.protocolVersion) {
            throw MCPException("ProtocolVersion of the client and server mismatches")
        }
        this.send(InitializedNotification())
    }

    private func listTools(): ListToolsResult {
        this.send(ListToolsRequest())
        let resp = this.recvResponse<ListToolsResponse>()
        return resp.result
    }

    override public prop tools: Array<Tool> {
        get() {
            this.doBeforeRequest()
            let result = ArrayList<Tool>()
            for (t in this.listTools().tools) {
                result.add(MCPToolWrapper(this, t))
            }
            return result.toArray()
        }
    }

    override public func callTool(name: String, args: Array<(String, ToJsonValue)>): ToolResponse {
        let arguments = ArrayList<(String, JsonValue)>()
        for (arg in args) {
            arguments.add((arg[0], arg[1].toJsonValue()))
        }
        return this.callTool(name, arguments.toArray())
    }

    override public func callTool(name: String, args: Array<(String, JsonValue)>): ToolResponse {
        this.doBeforeRequest()
        // Prepare the request
        let arguments = HashMap<String, JsonValue>(args)
        let req = CallToolRequest(
            params: CallToolParams(
                name: name,
                arguments: if (args.isEmpty()) { None } else { JsonObject(arguments) }
            )
        )
        // Send the request and receive its response
        this.send(req)
        let resp = this.recvResponse<CallToolResponse>()
        if (req.id != resp.id) {
            // Temporarily disable logging to prevent interference with MCP protocol
        }

        // Merge all result content
        let result = resp.result
        let strBuilder = StringBuilder()
        for (content in result.content) {
            let contentValue = content.getValue()
            strBuilder.append(contentValue)
            strBuilder.append("\n")
        }
        if ((result.isError ?? false)) {
            let responseStr = strBuilder.toString()
            return ToolResponse(responseStr, isError: true)
        } else {
            let responseStr = strBuilder.toString()
            return ToolResponse(responseStr, isError: false)
        }
    }

    private func send<T>(request: T): Unit where T <: Jsonable<T> {
        this.send(request.toJsonValue().asObject())
    }

    private func recvResponse<T>(): T where T <: Jsonable<T> {
        let msg = this.recv()
        return T.fromJsonValue(JsonValue.fromStr(msg))
    }
}
