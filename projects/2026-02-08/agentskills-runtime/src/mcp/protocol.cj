/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.mcp

import magic.dsl.jsonable
import magic.jsonable.*

import std.collection.{HashMap, ArrayList}
import stdx.encoding.json.*

//--------------------------------------------------------------------------------------------
// https://github.com/modelcontextprotocol/specification/blob/main/schema/2024-11-05/schema.ts
//--------------------------------------------------------------------------------------------
const LATEST_PROTOCOL_VERSION = "2024-11-05";
const JSONRPC_VERSION = "2.0";

var globalID = 1
func getRequestID(): Int64 {
    let id = globalID
    globalID += 1
    return id
}

@jsonable
class MCPRequest {
    let jsonrpc: String
    let id: Int64
    let method: String

    init() {
        this.jsonrpc = JSONRPC_VERSION
        this.id = getRequestID()
        this.method = "ping"
    }
}

@jsonable
class MCPError {
    var jsonrpc: String = JSONRPC_VERSION
    let id: Int64
    let error: ErrorContent
}

const PARSE_ERROR = -32700
const INVALID_REQUEST = -32600
const METHOD_NOT_FOUND = -32601
const INVALID_PARAMS = -32602
const INTERNAL_ERROR = -32603

@jsonable
class ErrorContent {
    /**
    * The error type that occurred.
    */
    let code: Int64
    /**
    * A short description of the error. The message SHOULD be limited to a concise single sentence.
    */
    let message: String
    /**
    * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
    */
    // data?: unknown;
}

@jsonable
class PingRequest {
    var jsonrpc: String = JSONRPC_VERSION
    var id: Int64 = getRequestID()
    var method: String = "ping"
}

@jsonable
class PingResult { }

@jsonable
class PingResponse {
    var jsonrpc: String = JSONRPC_VERSION
    var id: Int64
    let result: PingResult
}


@jsonable
public class Annotation {
    let audience: Option<Array<String>>
    let priority: Option<Int64>
}

@jsonable
public class TextContent {
    var annotations: Option<Annotation> = None
    var `type`: String = "text"
    let text: String
}

@jsonable
public class ImageContent {
    var annotations: Option<Annotation> = None
    var `type`: String = "image"
    let data: String
    let mimeType: String
}

//-----------------------------------------------------------------

@jsonable
class InitialRequest {
    var jsonrpc: String = JSONRPC_VERSION
    var id: Int64 = getRequestID()
    var method: String = "initialize"
    let params: InitialParams
}

@jsonable
class InitialParams {
    var protocolVersion: String = LATEST_PROTOCOL_VERSION
    let capabilities: ClientCapabilities
    let clientInfo: Implementation
}

@jsonable
class ClientCapabilities {
}

@jsonable
class Implementation {
    let name: String
    let version: String
}

@jsonable
class InitialResponse {
    var jsonrpc: String = JSONRPC_VERSION
    let id: Int64
    let result: InitialResult
}

@jsonable
class InitialResult {
    var protocolVersion: String = LATEST_PROTOCOL_VERSION
    let capabilities: ServerCapabilities
    let serverInfo: Implementation
    var instructions: Option<String> = None
}

@jsonable
class ServerCapabilities {
    // let experimental: Option<HashMap<String, Object>>
    // let logging: Option<Object>
    let prompts: Option<PromptsCapability>
    let resources: Option<ResourcesCapability>
    let tools: Option<ToolsCapability>
}

@jsonable
struct PromptsCapability {
    var listChanged: Bool = false
}

@jsonable
struct ResourcesCapability {
    var subscribe: Bool = false
    var listChanged: Bool = false
}

@jsonable
struct ToolsCapability {
    var listChanged: Bool = false
}

@jsonable
struct InitializedNotification {
    var jsonrpc: String = JSONRPC_VERSION
    var method: String = "notifications/initialized"
}
//-----------------------------------------------------------------

class ListResourcesRequest {
    var jsonrpc: String = JSONRPC_VERSION
    var id: Int64 = getRequestID()
    var method: String = "resources/list"
    var params: PaginatedParams = PaginatedParams()
}

@jsonable
class PaginatedParams {
    var cursor: Option<String> = None
}

@jsonable
class ListResourcesResponse {
    let jsonrpc: String
    let id: Int64
    let result: ListResourcesResult
}

@jsonable
class ListResourcesResult {
    let resources: Array<Resource>
    let nextCursor: Option<String>
}

@jsonable
class Resource {
    let annotations: Option<Annotation>
    let url: String
    let name: String
    let description: Option<String>
    let mimeType: Option<String>
    let size: Option<Int64>
}

//-----------------------------------------------------------------

@jsonable
class ListToolsRequest {
    var jsonrpc: String = JSONRPC_VERSION
    var id: Int64 = getRequestID()
    var method: String = "tools/list"
    var params: PaginatedParams = PaginatedParams()
}

@jsonable
class ListToolsResponse {
    var jsonrpc: String = JSONRPC_VERSION
    let id: Int64
    let result: ListToolsResult
}

@jsonable
public class ListToolsResult {
    let tools: Array<MCPTool>
    var nextCursor: Option<String> = None
}

@jsonable
public class MCPTool {
    let name: String
    let description: Option<String>
    let inputSchema: JsonObject
}

//-----------------------------------------------------------------

@jsonable
class CallToolRequest {
    var jsonrpc: String = JSONRPC_VERSION
    var id: Int64 = getRequestID()
    var method: String = "tools/call"
    let params: CallToolParams
}

@jsonable
class CallToolParams {
    let name: String
    let arguments: Option<JsonObject>
}

@jsonable
class CallToolResponse {
    var jsonrpc: String = JSONRPC_VERSION
    let id: Int64
    let result: CallToolResult
}

@jsonable
public class CallToolResult {
    let content: Array<ToolCallContent>
    let isError: Option<Bool>
}

public enum ToolCallContent <: Jsonable<ToolCallContent> {
    | Text(TextContent)
    | Image(ImageContent)

    public static func getTypeSchema(): TypeSchema {
        throw JsonableException("Unsupported method")
    }

    public static func fromJsonValue(json: JsonValue): ToolCallContent {
        match (JsonUtils.getString(json, "type") ?? "") {
            case "text" => return ToolCallContent.Text(TextContent.fromJsonValue(json))
            case "image" => return ToolCallContent.Image(ImageContent.fromJsonValue(json))
            case _ => throw MCPException("Unsupported tool call result `${json.toString()}`")
        }
    }

    public func toJsonValue(): JsonValue {
        match (this) {
            case ToolCallContent.Text(content) => content.toJsonValue()
            case ToolCallContent.Image(content) => content.toJsonValue()
        }
    }

    public func getValue(): String {
        match (this) {
            case ToolCallContent.Text(text) => text.text
            case ToolCallContent.Image(image) => image.data
        }
    }
}
