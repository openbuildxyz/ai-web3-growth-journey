/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.http

import magic.log.LogUtils

import std.collection.HashMap
import stdx.encoding.json.JsonObject
import stdx.net.http.HttpHeaders

protected class HttpException <: Exception {
    protected HttpException(
        protected let error: String
    ) { super(error) }
}

/**
 * Used for hybrid http request, return either a string or a stream.
 */
public enum HttpResultOption {
    | Json(String)
    | Stream(HttpStream)
}

public class HttpResult {
    public let status: Int64
    public let header: HttpHeaders
    public let value: HttpResultOption

    protected init(status!: Int64, header!: Array<(String, String)>, value!: HttpResultOption) {
        this.status = status
        this.value = value
        this.header = HttpHeaders()
        for ((k,v) in header) {
            this.header.add(k,v)
        }
    }

    protected init(status!: Int64, header!: HashMap<String, String>, value!: HttpResultOption) {
        this.status = status
        this.value = value
        this.header = HttpHeaders()
        for ((k,v) in header) {
            this.header.add(k,v)
        }
    }

    protected init(status!: Int64, header!: HttpHeaders, value!: HttpResultOption) {
        this.status = status
        this.header = header
        this.value = value
    }

    public func isSuccess(): Bool {
        return this.status >= 200 && this.status < 300
    }

    public func isAccepted(): Bool {
        return this.status == 202
    }

    public func isNotFound(): Bool {
        return this.status == 404
    }

    public func isBadRequest(): Bool {
        return this.status == 400
    }
}

func logHttpInfo(method: String, url: String, header: HashMap<String, String>, body: Option<JsonObject>, async!: Bool = false) {
    let action = if (async) {
        "async http ${method}"
    } else {
        "http ${method}"
    }
    LogUtils.trace("${action}: ${url}")
    for ((k,v) in header) {
        LogUtils.trace("header: ${k} - ${v}")
    }
    if (let Some(b) <- body) {
        LogUtils.trace("body: ${b.toString()}")
    }
}

public struct HttpUtils {
    static public func get(url: String,
                           header: HashMap<String, String>,
                           body: Option<JsonObject>,
                           verify!: Bool = false): Option<String> {
        return HttpUtilsImpl.send("GET", url, header, body, verify: verify)
    }

    static public func post(url: String,
                            header: HashMap<String, String>,
                            body: JsonObject,
                            verify!: Bool = false): Option<String> {
        return HttpUtilsImpl.send("POST", url, header, body, verify: verify)
    }

    static public func asyncGet(url: String,
                                header: HashMap<String, String>,
                                body: Option<JsonObject>,
                                verify!: Bool = false): HttpStream {
        return HttpUtilsImpl.asyncSend("GET", url, header, body, verify: verify)
    }

    static public func asyncPost(url: String,
                                 header: HashMap<String, String>,
                                 body: JsonObject,
                                 verify!: Bool = false): HttpStream {
        return HttpUtilsImpl.asyncSend("POST", url, header, body, verify: verify)
    }

    static public func hybridPost(url: String,
                                  header: HashMap<String, String>,
                                  body: JsonObject,
                                  verify!: Bool = false): HttpResult {
        return HttpUtilsImpl.hybridSend("POST", url, header, body, verify: verify)
    }

    /**
     * HTTP Server-Sent Events
     */
    static protected func sseConnect(url: String, verify!: Bool = false): SSEventStream {
        let header = HashMap<String, String>()
        header.add("Accept", "text/event-stream")
        let httpStream = HttpUtils.asyncGet(url, header, None, verify: verify)
        return SSEventStream(httpStream)
    }
}
