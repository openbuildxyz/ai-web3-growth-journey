/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model.openai

import magic.core.model.*
import magic.utils.http.*
import magic.dsl.jsonable
import magic.jsonable.*

import stdx.encoding.json.*
import std.collection.{HashMap, ArrayList}

@jsonable
private class OpenAIImageResponse {
    let created: String
    let data: Array<OpenAIImageData>
}

@jsonable
private class OpenAIImageData {
    let url: String
    let b64_json: Option<String>
    let revised_prompt: String
}

public class OpenAIImageModel <: ImageModel {
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
        get() { "openai" }
    }

    override public prop name: String {
        get() { model }
    }

    override public func create(imageReq: ImageRequest): ImageResponse {
        let req = JsonObject()
        req.put("model", JsonString(model))
        req.put("prompt", JsonString(imageReq.prompt))
        req.put("quality", JsonString("standard"))
        req.put("response_format", JsonString("url"))
        req.put("size", JsonString(imageReq.size))
        req.put("style", JsonString("natural"))
        let header = HashMap<String, String>([
            ("Content-Type", "application/json"),
            ("Authorization", "Bearer ${this.apiKey}")
        ])
        match (HttpUtils.post("${this.baseURL}/images/generations", header, req, verify: false)) {
            case Some(body) =>
                let resp = OpenAIImageResponse.fromJsonValue(JsonValue.fromStr(body))
                let image = resp.data[0] // Currently, we just return the first image
                return ImageResponse(
                    url: image.url,
                    // b64Json: image.b64_json ?? "",
                    revisedPrompt: image.revised_prompt
                )
            case None => throw ModelException("Fail to get image http response")
        }
    }
}
