/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model.zhipuai

import magic.core.model.*
import magic.utils.http.*
import magic.dsl.jsonable
import magic.jsonable.*

import stdx.encoding.json.*
import std.collection.{HashMap, ArrayList}

@jsonable
private class ZhipuAIImageResponse {
    let created: Int64
    let data: Array<ZhipuAIImageData>
}

@jsonable
private class ZhipuAIImageData {
    let url: String
}

public class ZhipuAIImageModel <: ImageModel {
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
        get() { "zhipuai" }
    }

    override public prop name: String {
        get() { model }
    }

    override public func create(imageReq: ImageRequest): ImageResponse {
        let req = JsonObject()
        req.put("model", JsonString(model))
        req.put("prompt", JsonString(imageReq.prompt))
        req.put("quality", JsonString("standard"))
        req.put("size", JsonString(imageReq.size))
        let header = HashMap<String, String>([
            ("Content-Type", "application/json"),
            ("Authorization", "Bearer ${this.apiKey}")
        ])
        match (HttpUtils.post("${this.baseURL}/images/generations", header, req, verify: false)) {
            case Some(body) =>
                let resp = ZhipuAIImageResponse.fromJsonValue(JsonValue.fromStr(body))
                let image = resp.data[0] // Currently, we just return the first image
                return ImageResponse(
                    url: image.url
                )
            case None => throw ModelException("Fail to get image http response")
        }
    }
}
