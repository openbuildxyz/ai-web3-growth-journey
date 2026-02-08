/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.mcp

import magic.dsl.jsonable
import magic.jsonable.*
import magic.log.LogUtils
import magic.utils.http.*

import std.collection.HashMap
import std.collection.ArrayList
import std.time.DateTime
import stdx.encoding.json.*

@jsonable
public class HttpMCPInitParams {
    public let url: String
    public let header: HashMap<String, String>  // Additional headers
}

/**
 * MCP client using the Streamable HTTP transport
 * Implements the MCP 2025-03-26 Streamable HTTP specification
 */
public class HttpMCPClient <: AbsMCPClient {
    private let _initParams: HttpMCPInitParams

    // Session management
    private var sessionId: Option<String> = None
    private var lastActivity: DateTime

    // Request management
    private var requestIdCounter: Int64 = 1

    // Streaming support
    private var activeStreams: HashMap<String, SSEventStream> = HashMap()

    /**
     * Message queue for received messages
     */
    private var messageQueue: ArrayList<String> = ArrayList()

    public init(endpoint: String, headers!: Array<(String, String)> = []) {
        this._initParams = HttpMCPInitParams(url: endpoint, header: HashMap(headers))
        // Validate endpoint URL
        if (!HttpMCPClientUtils.validateEndpoint(endpoint)) {
            throw MCPException("Invalid endpoint URL: ${endpoint}. Must start with http:// or https://")
        }

        this.lastActivity = DateTime.now()
        // Initialize HTTP-specific session after parent initialization
        this.initializeHttpSession()
    }

    override public prop initParams: JsonObject {
        get() {
            return this._initParams.toJsonValue().asObject()
        }
    }

    override protected func doSend(req: JsonObject): Bool {
        let result = this.sendRequest(req)
        if (!result.isSuccess()) {
            return false
        }

        // If session ID not set, extract from response header
        if (this.sessionId.isNone()) {
            if (let Some(sessionId) <- result.header.getFirst("mcp-session-id")) {
                this.sessionId = sessionId
            } else if (let Some(sessionId) <- result.header.getFirst("Mcp-Session-Id")) {
                this.sessionId = sessionId
            }
        }

        // Handle responses
        if (result.isAccepted()) {
            // Notification accepted, no response needed
            this.messageQueue.add("202 Accepted") // put a special value
            return true
        }

        if (let HttpResultOption.Json(body) <- result.value) {
            // Direct response
            this.messageQueue.add(body)
        } else if (let HttpResultOption.Stream(stream) <- result.value) {
            // SSE stream response
            this.handleSSEStream(SSEventStream(stream))
        }

        return true
    }

    override protected func doRecv(): Option<String> {
        if (this.messageQueue.size > 0) {
            return this.messageQueue.remove(at: 0)
        }
        return None
    }

    override protected func doBeforeRequest(): Unit {
        // Check if session needs refresh
        if (this.sessionExpired()) {
            this.refreshSession()
        }

        this.lastActivity = DateTime.now()
    }

    // Private implementation methods
    private func sendRequest(req: JsonObject): HttpResult {
        let headers = this.buildHeaders()
        return HttpUtils.hybridPost(this._initParams.url, headers, req)
    }

    private func handleSessionError(error: Exception): Unit {
        // Check if this is a session expiration error
        if (error.toString().contains("404") || error.toString().contains("session")) {
            this.refreshSession()
        } else {
            // For other errors, rethrow
            throw error
        }
    }

    private func buildHeaders(): HashMap<String, String> {
        let headers = HashMap<String, String>()
        headers.add("Content-Type", "application/json")
        headers.add("Accept", "application/json, text/event-stream")

        // Add session ID if available
        if (let Some(sid) <- this.sessionId) {
            headers.add("Mcp-Session-Id", sid)
        }

        // Add custom headers from initParams
        for ((key, value) in this._initParams.header) {
            headers.add(key, value)
        }

        return headers
    }

    private func sessionExpired(): Bool {
        return false
        // if (let Some(created) <- this.sessionCreatedAt) {
        //     let elapsed = DateTime.now() - created
        //     return elapsed.toMilliseconds() > this.initParams.sessionTimeout
        // }
        // return true
    }

    private func refreshSession(): Unit {
        this.terminateSession()
        this.initialize()
    }

    private func terminateSession(): Unit {
        // Close all active streams
        for ((_, stream) in this.activeStreams) {
            stream.close()
        }
        this.activeStreams.clear()

        // Clear session data
        this.sessionId = None
        this.messageQueue.clear()
    }

    private func handleSSEStream(stream: SSEventStream): Unit {
        while (let Some(event) <- stream.next()) {
            if (event.event == "message") {
                this.messageQueue.add(event.data)
            } else if (event.event == "error") {
                // Handle error event silently
            }
        }
    }

    // HTTP-specific session initialization
    private func initializeHttpSession(): Unit {
        let initRequest = InitialRequest(
            params: InitialParams(
                protocolVersion: "2025-03-26",
                capabilities: ClientCapabilities(),
                clientInfo: Implementation(
                    name: "Cangjie Magic Agent Client",
                    version: "0.1"
                )
            )
        )
        this.send(initRequest.toJsonValue().asObject())
        let msg = this.recv()
        let resp = InitialResponse.fromJsonValue(JsonValue.fromStr(msg))
        if (resp.result.protocolVersion != initRequest.params.protocolVersion) {
            throw MCPException("ProtocolVersion of the client and server mismatches")
        }
        this.send(InitializedNotification().toJsonValue().asObject())
        let result = this.recv()
        // MCP requires the server to return 202 Accepted for the notification
        // however, if proxy is set, the server response may be replaced as 200 with an empty string?
        if (result == "202 Accepted" || result.isEmpty()) {
        } else {
            throw MCPException("Fail to initialize HTTP MCP client session. Received: ${result}")
        }
    }

    public func close(): Unit {
        LogUtils.info("Closing HTTP MCP client session")
        this.terminateSession()
    }
}

/**
 * Utility class for HTTP MCP operations
 */
private class HttpMCPClientUtils {
    /**
     * Validate MCP endpoint URL format
     */
    public static func validateEndpoint(url: String): Bool {
        return url.startsWith("http://") || url.startsWith("https://")
    }

    /**
     * Check if response indicates a session error
     */
    public static func isSessionError(responseBody: String): Bool {
        return responseBody.contains("\"code\":") &&
               (responseBody.contains("404") ||
                responseBody.contains("session") ||
                responseBody.contains("unauthorized"))
    }

    /**
     * Extract error message from MCP response
     */
    public static func extractErrorMessage(responseBody: String): String {
        try {
            let json = JsonValue.fromStr(responseBody)
            if (let Some(error) <- json.asObject().get("error")) {
                if (let Some(message) <- error.asObject().get("message")) {
                    return message.asString().getValue()
                }
            }
        } catch (_: Exception) {
            // Ignore parsing errors
        }
        return "Unknown MCP error"
    }
}