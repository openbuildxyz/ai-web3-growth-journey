/*
 * Copyright (c) 2024-2025. All rights reserved.
 */
package magic.model.stepfun

import magic.core.model.*
import magic.utils.http.*
import magic.dsl.jsonable
import magic.jsonable.*
import magic.config.Config
import magic.log.LogUtils

import std.collection.ArrayList
import std.collection.HashMap
import std.time.DateTime

import stdx.encoding.json.*

@When[cjc_version < "1.0.0"]
import std.time.Duration

// StepFun embedding response structure
@jsonable
private class StepFunEmbeddingResponse {
    let object: String
    let data: Array<EmbeddingData>
    let model: String
    let usage: EmbeddingUsage
}

@jsonable
private class EmbeddingData {
    let object: String
    let index: Int64
    let embedding: Array<Float64>
}

@jsonable
private class EmbeddingUsage {
    let prompt_tokens: Int64
    let total_tokens: Int64
}

public class StepFunEmbeddingModel <: EmbeddingModel {
    private let model: String
    private let baseURL: String
    private let apiKey: String

    public init(model: String, apiKey!: String, baseURL!: String) {
        this.model = model
        this.baseURL = baseURL
        this.apiKey = apiKey
    }

    override public prop provider: String {
        get() { "stepfun" }
    }

    override public prop name: String {
        get() { model }
    }

    override public func create(embeddingReq: EmbeddingRequest): EmbeddingResponse {
        let start = DateTime.now()

        // Prepare request
        let header = HashMap<String, String>([
            ("Content-Type", "application/json"),
            ("Authorization", "Bearer ${this.apiKey}")
        ])

        let req = JsonObject()
        req.put("model", JsonString(this.model))

        req.put("input", JsonString(embeddingReq.prompt))

        let response = HttpUtils.post("${this.baseURL}/embeddings", header, req)
        match (response) {
            case Some(body) =>
                if (body.isEmpty()) {
                    throw ModelException("Http response body is empty")
                } else {
                    return this.parseResponse(body, DateTime.now() - start)
                }
            case None => throw ModelException("Http response body is None")
        }
    }

    private func parseResponse(body: String, duration: Duration): EmbeddingResponse {
        let resp = StepFunEmbeddingResponse.fromJsonValue(JsonValue.fromStr(body))

        // Return the first embedding as per OpenAI compatible API
        return EmbeddingResponse(resp.data[0].embedding)
    }
}