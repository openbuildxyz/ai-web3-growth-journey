/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.mcp

import magic.dsl.jsonable
import magic.core.tool.Tool
import magic.jsonable.*
import magic.log.LogUtils
import magic.config.Config
import magic.utils.http.{HttpUtils, SSEvent}
import magic.utils.http.SSEventStream
import magic.utils.newProcess

import std.io.{StringReader, StringWriter, OutputStream, InputStream}
import std.collection.{ArrayList, HashMap, map, collectArray}
import std.time.DateTime
import stdx.encoding.url.URL
import stdx.encoding.json.*

@jsonable
public class SseMCPInitParams {
    public let url: String
}

/**
 * MCP client via the stdio transport
 */
public class SseMCPClient <: AbsMCPClient {
    private let userURL: String // The input URL specified by the user
    private var baseURL: String

    private var _sseStream: Option<SSEventStream> = None
    private var endpoint: String = ""
    private var lastInitTime: DateTime

    public init(url: String) {
        this.userURL = url
        let items = url.split("/sse") // Split the URl to get the domain base URL
        this.baseURL = items[0]
        this.lastInitTime = DateTime.now()
        this.doInit()
    }

    override public prop initParams: JsonObject {
        get() {
            let jo = JsonObject()
            jo.put("url", JsonString(this.userURL))
            return jo
        }
    }

    private prop sseStream: SSEventStream {
        get() { this._sseStream.getOrThrow() }
    }

    private func doInit(): Unit {
        this.lastInitTime = DateTime.now()
        this._sseStream = HttpUtils.sseConnect("${this.userURL}")
        if (let Some(event) <- this.sseStream.next()) {
            if (event.event != "endpoint") {
                throw MCPException("Invalid endpoint event: ${event}")
            }
            this.endpoint = event.data
            LogUtils.info("Found endpoint: ${this.endpoint}")
        } else {
            throw MCPException("Fail to make SSE connection: ${this.userURL}")
        }
        // Now, initialize
        this.initialize()
    }

    override protected func doBeforeRequest(): Unit {
        // Before sending the request, initialize the MCP
        let dur = DateTime.now() - this.lastInitTime
        if (dur.toMilliseconds() > (Config.httpReadWriteTimeout - 10000)) {
            LogUtils.info("Reinitialize the sse session. Close ${this.endpoint}")
            this.sseStream.close()
            this.doInit()
        }
    }

    override protected func doSend(req: JsonObject): Bool {
        let header = HashMap<String, String>([
            ("Content-Type", "application/json")
        ])
        let url = URL.parse(this.baseURL).resolveURL(URL.parse(this.endpoint))
        let resp = HttpUtils.post("${url}", header, req, verify: false)
        return !resp.isNone()
    }

    override protected func doRecv(): Option<String> {
        if (let Some(event) <- this.sseStream.next()) {
            // Temporarily disable logging to prevent interference with MCP protocol
            if (event.event != "message") {
                throw MCPException("Invalid message event: ${event}")
            }
            return event.data
        } else {
            throw MCPException("Fail to receive sse event")
        }
    }
}
