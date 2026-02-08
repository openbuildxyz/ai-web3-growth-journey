/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils.http

import magic.log.LogUtils
import magic.config.Config

import std.collection.HashMap
import stdx.encoding.json.*
import std.collection.concurrent.BlockingQueue
@When[ohos == "true"]
import ohos.net.http.*

//=====================================================================================

@When[ohos == "true"]
private func buildRequestOptions(method: String, header: HashMap<String, String>, body: Option<JsonObject>): HttpRequestOptions {
    let m = if (method == "POST") { RequestMethod.POST } else { RequestMethod.GET }
    if (let Some(b) <- body) {
        return HttpRequestOptions(
            method: m,
            extraData: HttpData.STRING_DATA(b.toJsonString()),
            expectDataType: HttpDataType.STRING,
            header: header,
            readTimeout: UInt32(Config.httpReadWriteTimeout),
            connectTimeout: UInt32(Config.httpConnectTimeout),
        )
    } else {
        return HttpRequestOptions(
            method: m,
            expectDataType: HttpDataType.STRING,
            header: header,
            readTimeout: UInt32(Config.httpReadWriteTimeout),
            connectTimeout: UInt32(Config.httpConnectTimeout),
        )
    }
}

@When[ohos == "true"]
protected struct HttpUtilsImpl {
    static protected func send(method: String,
                               url: String,
                               header: HashMap<String, String>,
                               body: Option<JsonObject>,
                               verify!: Bool): Option<String> {
        logHttpInfo(method, url, header, body, async: false)
        let httpRequest = createHttp()
        let httpOpt = buildRequestOptions(method, header, body)
        let queue = BlockingQueue<String>()
        httpRequest.request(
            url,
            { err, resp =>
                spawn {
                    if (let Some(e) <- err) {
                        LogUtils.error("Request failed. Exception: ${e.message}")
                        queue.enqueue("[ERROR_request]")
                    }
                    if (let Some(r) <- resp){
                        match (r.result) {
                            case STRING_DATA(value) => queue.enqueue(value)
                            case ARRAY_DATA(value) => queue.enqueue(String.fromUtf8(value))
                            case _ => throw UnsupportedException("Unsupported http response type")
                        }
                    }
                    httpRequest.destroy()
                }
            },
            options: httpOpt
        )
        // Receive the response content
        let msg = queue.dequeue()
        if (msg == "[ERROR_request]") {
            throw HttpException("Http request error")
        }
        LogUtils.trace("Raw http response: ${msg}")
        return msg
    }

    static protected func asyncSend(method: String,
                                    url: String,
                                    header: HashMap<String, String>,
                                    body: Option<JsonObject>,
                                    verify!: Bool): HttpStream {
        logHttpInfo(method, url, header, body, async: true)
        let httpRequest = createHttp()
        let httpStream = HttpStream(closeFn: { =>
            LogUtils.debug("Http stream closed ${url}")
            httpRequest.destroy()
        })
        // Register callbacks
        httpRequest.onDataReceive({ data: Array<Byte> =>
            // let str = String.fromUtf8(data)
            // LogUtils.debug("Receive http stream: ${str}")
            // Each line is a chunk response from chat models, so we split the data here
            // for (line in str.split("\n", removeEmpty: true)) {
                // httpStream.put(line)
            // }

            LogUtils.debug("Http stream received bytes from ${url}; size: ${data.size}")
            httpStream.put(data)
        })
        httpRequest.onDataEnd({ =>
            LogUtils.debug("End the http stream of ${url}")
            httpStream.markEOF()
            httpRequest.offDataReceive()
            httpRequest.offDataEnd()
            httpRequest.destroy()
        })
        // Make the request
        let httpOpt = buildRequestOptions(method, header, body)
        httpRequest.requestInStream(
            url,
            { err, code =>
                if (let Some(e) <- err) {
                    LogUtils.error("Http stream request for ${url} failed: ${e.message}")
                    httpStream.markError()
                    httpStream.markEOF()
                }
            },
            options: httpOpt
        )
        return httpStream
    }

    static protected func hybridSend(method: String,
                                     url: String,
                                     header: HashMap<String, String>,
                                     body: Option<JsonObject>,
                                     verify!: Bool): HttpResult {
        throw UnsupportedException()
    }
}