/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.http

import magic.log.LogUtils
import magic.utils.getEnv
import magic.config.Config

import std.collection.{HashMap, contains}
@When[cjc_version < "1.0.0"]
import std.socket.{SocketAddress, TcpSocket}
@When[cjc_version >= "1.0.0"]
import std.net.{SocketAddress, TcpSocket}
import std.io.StringReader

import stdx.net.tls.{TlsClientConfig, CertificateVerifyMode}
import stdx.net.http.*
import stdx.encoding.json.*
import stdx.encoding.url.URL

private func buildHttpClient(url: String, verify: Bool): Client {
    let cb = ClientBuilder()
    cb.readTimeout(Duration.minute * 10)
    if (url.startsWith("https")) {
        var config = TlsClientConfig()
        if (!verify) {
            config.verifyMode = TrustAll
        }
        config.domain = URL.parse(url).hostName
        cb.tlsConfig(config)
    }
    let TcpSocketConnector = { sa: SocketAddress =>
        let socket = TcpSocket(sa)
        socket.readTimeout = Duration.millisecond * Config.httpReadWriteTimeout
        socket.writeTimeout = Duration.millisecond * Config.httpReadWriteTimeout
        socket.connect(timeout: Duration.millisecond * Config.httpConnectTimeout)
        return socket
    }
    cb.connector(TcpSocketConnector)
    // if (let Some(proxy) <- getEnv("http_proxy")) {
    //     cb.httpProxy(proxy)
    // }
    // if (let Some(proxy) <- getEnv("https_proxy")) {
    //     cb.httpProxy(proxy)
    // }
    return cb.build()
}

private func prepareHttpRequest(method: String,
                                url: String,
                                header: HashMap<String, String>,
                                body: Option<JsonObject>): HttpRequest {
    let rb = HttpRequestBuilder().url(url)
    if (let Some(b) <- body) {
        rb.body(b.toJsonString())
    }
    if (method == "POST") {
        rb.post()
    } else if (method == "GET") {
        rb.get()
    }
    for ((k, v) in header) {
        rb.header(k, v)
    }
    return rb.build()
}

private func sendHttp(method: String,
                      url: String,
                      header: HashMap<String, String>,
                      body: Option<JsonObject>,
                      verify: Bool): (Client, HttpResponse) {
    let client = buildHttpClient(url, verify)
    let req = prepareHttpRequest(method, url, header, body)
    try {
        let response = client.send(req)
        if (response.status != HttpStatusCode.STATUS_OK &&
            response.status != HttpStatusCode.STATUS_ACCEPTED) {
            let content = readHttpBody(response).trimAscii()
            let msg = if (content.isEmpty()) {
                "Http status: ${response.status}"
            } else {
                "Http status: ${response.status}\nHttp response: ${content}"
            }
            LogUtils.error("Http ${url} with data: ${(body ?? JsonObject()).toJsonString()} failed")
            LogUtils.error(msg)
            throw HttpException(msg)
        }
        return (client, response)
    } catch (ex: Exception) {
        LogUtils.error("Http ${url} with data: ${(body ?? JsonObject()).toJsonString()} failed")
        LogUtils.debug(ex)
        throw HttpException(ex.message)
    }
}

private func readHttpBody(resp: HttpResponse): String {
    let reader = StringReader(resp.body)
    return reader.readToEnd()
}

//=====================================================================================

@When[ohos != "true" && http != "curl"]
protected struct HttpUtilsImpl {
    static protected func send(method: String,
                               url: String,
                               header: HashMap<String, String>,
                               body: Option<JsonObject>,
                               verify!: Bool): Option<String> {
        // header.put("Accept", "application/json")
        logHttpInfo(method, url, header, body, async: false)
        let (client, resp) = sendHttp(method, url, header, body, verify)
        return processJson(client, resp)
    }

    static private func processJson(client: Client, response: HttpResponse): String {
        try {
            return readHttpBody(response)
        } finally {
            client.close()
        }
    }

    static protected func asyncSend(method: String,
                                    url: String,
                                    header: HashMap<String, String>,
                                    body: Option<JsonObject>,
                                    verify!: Bool): HttpStream {
        logHttpInfo(method, url, header, body, async: true)
        // header.add("Accept", "text/event-stream")
        let (client, resp) = sendHttp(method, url, header, body, verify)
        let httpStream = HttpStream()
        spawn {
            processStream(client, resp, httpStream)
        }
        return httpStream
    }

    static private func processStream(client: Client, response: HttpResponse, httpStream: HttpStream): Unit {
        let buffer = Array<Byte>(1024 * 10, { _ => 0})
        while (true) {
            let length = response.body.read(buffer)
            if (length == 0) {
                break
            } else {
                httpStream.put(buffer[..length].clone())
            }
        }
        // Put the termination mark
        LogUtils.trace("End http stream. Status: ${response.status}")
        httpStream.markEOF()
        client.close()
    }

    static protected func hybridSend(method: String,
                                     url: String,
                                     header: HashMap<String, String>,
                                     body: Option<JsonObject>,
                                     verify!: Bool): HttpResult {
        logHttpInfo(method, url, header, body, async: false)
        let (client, resp) = sendHttp(method, url, header, body, verify)
        if ((resp.headers.get("Content-Type") |> contains("text/event-stream")) ||
            (resp.headers.get("content-type") |> contains("text/event-stream"))) {
            let httpStream = HttpStream()
            spawn {
                processStream(client, resp, httpStream)
            }
            return HttpResult(
                status: Int64(resp.status),
                header: resp.headers,
                value: HttpResultOption.Stream(httpStream)
            )
        } else {
            return HttpResult(
                status: Int64(resp.status),
                header: resp.headers,
                value: HttpResultOption.Json(processJson(client, resp))
            )
        }
    }
}