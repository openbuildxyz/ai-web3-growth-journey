/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model.llamacpp

import magic.core.model.*
import magic.utils.http.*
import magic.dsl.jsonable
import magic.jsonable.*

import stdx.encoding.json.*
import std.collection.ArrayList
import std.collection.HashMap

@jsonable
private class LlamaCppResponse {
    let index: Int64
    let embedding: Array<Float64>
}

public class LlamacppEmbeddingModel <: EmbeddingModel {
    private let baseURL: String
    private let header = HashMap<String, String>([("Content-Type", "application/json")])

    override public prop provider: String {
        get() { "llamacpp" }
    }

    override public prop name: String {
        get() { "unknown" }
    }

    public init(
        baseURL!: String
    ) {
        this.baseURL = baseURL
    }

    public func create(embeddingReq: EmbeddingRequest): EmbeddingResponse {
        let req = JsonObject()
        req.put("content", JsonString(embeddingReq.prompt))
        match (HttpUtils.post("${this.baseURL}/embedding", this.header, req)) {
            case Some(body) =>
                let resp = LlamaCppResponse.fromJsonValue(JsonObject.fromStr(body))
                return EmbeddingResponse(resp.embedding)
            case None => throw ModelException("Fail to get embedding http response")
        }
    }
}
