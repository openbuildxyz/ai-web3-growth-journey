/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model.dashscope

import magic.core.model.*
import magic.utils.http.*
import magic.dsl.jsonable
import magic.jsonable.{Jsonable, FieldSchema, JsonableException, TypeSchema}

import stdx.encoding.json.*
import std.collection.{ArrayList, HashMap}

@jsonable
private class DashscopeResponse {
    let output: Output
    let usage: Usage
    let request_id: String
}

@jsonable
private class Output {
    let embeddings: Array<Embedding>
}

@jsonable
private class Embedding {
    let text_index: Int64
    let embedding: Array<Float64>
}

@jsonable
private class Usage {
    let total_tokens: Int64
}

/**
 * See: https://bailian.console.aliyun.com/?switchAgent=10345028&productCode=p_efm&switchUserType=3#/model-market/detail/text-embedding-v3
 */
public class DashscopeEmbeddingModel <: EmbeddingModel {
    private let model: String
    private let baseURL: String
    public let apiKey: String

    public init(
        model: String,
        apiKey!: String,
        baseURL!: String
    ) {
        this.model = model
        this.apiKey = apiKey
        this.baseURL = baseURL
    }

    override public prop provider: String {
        get() { "dashscope" }
    }

    override public prop name: String {
        get() { model }
    }

    public func create(embeddingReq: EmbeddingRequest): EmbeddingResponse {
        let header = HashMap<String, String>([
            ("Content-Type", "application/json"),
            ("Authorization", "Bearer ${this.apiKey}")
        ])
        let req = JsonObject()
        req.put("model", JsonString(model))

        let input = JsonObject()
        input.put("texts", JsonArray([
            JsonString(embeddingReq.prompt)
        ]))
        req.put("input", input)

        let parameters = JsonObject()
        parameters.put("text_type", JsonString("query"))
        if (embeddingReq.dimensions.isSome()) {
            parameters.put("dimension", JsonInt(embeddingReq.dimensions.getOrThrow()))
        }
        req.put("parameters", parameters)

        match (HttpUtils.post("${this.baseURL}/services/embeddings/text-embedding/text-embedding", header, req)) {
            case Some(body) =>
                let resp = DashscopeResponse.fromJsonValue(JsonValue.fromStr(body))
                return EmbeddingResponse(resp.output.embeddings[0].embedding)
            case None => throw ModelException("Fail to get embedding http response")
        }
    }
}
