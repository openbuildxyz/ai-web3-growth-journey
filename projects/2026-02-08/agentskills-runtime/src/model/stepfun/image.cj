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

// StepFun image response structure (if supported)
@jsonable
private class StepFunImageResponse {
    let created: Int64
    let data: Array<ImageData>
}

@jsonable
private class ImageData {
    let url: String
    let b64_json: Option<String>
    let revised_prompt: Option<String>
}

public class StepFunImageModel <: ImageModel {
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

    override public func create(imageReq: ImageRequest): ImageResponse {
        let start = DateTime.now()

        // Prepare request
        let header = HashMap<String, String>([
            ("Content-Type", "application/json"),
            ("Authorization", "Bearer ${this.apiKey}")
        ])

        let req = JsonObject()
        req.put("model", JsonString(this.model))
        req.put("prompt", JsonString(imageReq.prompt))
        req.put("size", JsonString(imageReq.size))
        req.put("response_format", JsonString("url")) // Default to URL format

        let response = HttpUtils.post("${this.baseURL}/images/generations", header, req)
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

    private func parseResponse(body: String, duration: Duration): ImageResponse {
        let resp = StepFunImageResponse.fromJsonValue(JsonValue.fromStr(body))

        // Use the first image as per OpenAI compatible API
        let image = resp.data[0]

        return ImageResponse(
            url: image.url,
            revisedPrompt: if (let Some(revPrompt) <- image.revised_prompt) { revPrompt } else { "" }
        )
    }
}