/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model.ollama

import magic.core.model.*
import magic.utils.http.*
import magic.dsl.jsonable
import magic.jsonable.*

import stdx.encoding.json.*
import std.collection.ArrayList
import std.collection.HashMap

@jsonable
private class OllamaEmbeddingResponse {
    let model: String
    let embeddings: Array<Array<Float64>>
    // let total_duration: Int64
    // let load_duration: Int64
    // let prompt_eval_count: Int64
}

public class OllamaEmbeddingModel <: EmbeddingModel {
    private let model: String
    private let baseURL: String
    private let head = HashMap<String, String>([("Content-Type", "application/json")])

    override public prop provider: String {
        get() { "ollama" }
    }

    override public prop name: String {
        get() { model }
    }

    public init(
        model: String,
        baseURL!: String
    ) {
        this.model = model
        this.baseURL = baseURL
    }

    public func create(embeddingReq: EmbeddingRequest): EmbeddingResponse {
        let req = JsonObject()
        req.put("model", JsonString(model))
        req.put("input", JsonString(embeddingReq.prompt))
        match (HttpUtils.post("${this.baseURL}/api/embed", this.head, req)) {
            case Some(body) =>
                let resp = OllamaEmbeddingResponse.fromJsonValue(JsonObject.fromStr(body))
                return EmbeddingResponse(resp.embeddings[0])
            case None => throw ModelException("Fail to get embedding http response")
        }
    }
}
