package magic.mcp

import stdx.net.http.*
import std.collection.ArrayList
import std.collection.concurrent.ConcurrentHashMap
import std.time.*
import magic.core.agent.Agent
import magic.tool.AgentAsTool
import magic.log.LogUtils
import magic.jsonable.*
import magic.core.tool.Tool
import magic.utils.{randomString}

import stdx.net.http.*

extend HttpContext {
    public func startSSE(): Unit {
        this.responseBuilder.header("Content-Type", "text/event-stream")
        this.responseBuilder.header("Cache-Control", "no-cache")
        this.responseBuilder.header("Connection", "keep-alive")
        this.responseBuilder.header("Transfer-Encoding", "chunked")
        this.responseBuilder.header("Access-Control-Allow-Origin", "*")
        this.responseBuilder.status(200)
    }
}

public class SseMCPServer <: AbsMCPServer {
    var client_map = ConcurrentHashMap<String, HttpResponseWriter>()

    public init(tools: Array<Tool>) {
        super(tools)
    }

    public func start(host: String, port: UInt16): Unit {
        let http_server = ServerBuilder().addr(host).port(port).build()

        let sseHandler: HttpRequestHandler = FuncHandler({ httpContext =>
            if (httpContext.request.method != "GET") {
                return
            }

            httpContext.startSSE()

            let writer = HttpResponseWriter(httpContext)
            let uuid = randomString(size: 12)

            writer.write("event: endpoint\ndata: /messages/?session_id=${uuid}\n\n".toArray())
            this.client_map.add(uuid, writer)

            while (true) {
                sleep(Duration.second * 8)
                try {
                    writer.write(": ping - ${DateTime.now()}\n\n".toArray())
                } catch (e: Exception) {
                    LogUtils.error("Client: ${uuid} ${e.message}")
                    this.client_map.remove(uuid)
                    break
                }
            }
        })

        var messagesHandler: HttpRequestHandler = FuncHandler({ httpContext =>
            if (httpContext.request.method != "POST") {
                return
            }

            let query = httpContext.request.url.queryForm
            let length = httpContext.request.bodySize

            let stream = Array<UInt8>(length.getOrThrow(), repeat: 0)
            httpContext.request.body.read(stream)

            let msg = String.fromUtf8(stream)
            let uuid = query.get("session_id").getOrThrow().toString()

            LogUtils.info("Recv: ${uuid}: ${msg}")

            httpContext.responseBuilder.status(202)
            httpContext.responseBuilder.body("Accepted")

            spawn {
                this.loop(msg, uuid)
            }
        })

        http_server.distributor.register("/sse", sseHandler)
        http_server.distributor.register("/messages/", messagesHandler)

        http_server.serve()
    }

    public func loop(msg: String, uuid: String): Unit {
        if (let Some(resp) <- this.handleRequestMessage(msg)) {
            this.send(resp, uuid)
        }
    }

    private func send(msg: String, uuid: String): Unit {
        LogUtils.info("Send: ${uuid}: ${msg}")
        client_map.get(uuid).getOrThrow().write("event: message\ndata: ${msg}\n\n".toArray())
    }

    private func send<T>(response: T, uuid: String): Unit where T <: ToJsonValue {
        this.send(response.toJsonValue().toString(), uuid)
    }

    protected override func send(msg: String): Unit {
        throw Exception("Implementation")
    }

    protected override func recv(): Option<String> {
        throw Exception("Implementation")
    }

    public static func startWith(agents: Array<Agent>, host: String, port: UInt16): Unit {
        let allTools = ArrayList<Tool>()
        for (agent in agents) {
            allTools.add(all: agent.toolManager.tools)
            // The agent itself is also a tool
            allTools.add(AgentAsTool(agent))
        }
        let server = SseMCPServer(allTools.toArray())
        server.start(host, port)
    }

    public static func startWith(tools: Array<Tool>, host: String, port: UInt16): Unit {
        let server = SseMCPServer(tools)
        server.start(host, port)
    }
}
