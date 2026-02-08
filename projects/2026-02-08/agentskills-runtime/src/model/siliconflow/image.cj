/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model.siliconflow

import magic.core.model.*
import magic.utils.http.*
import magic.dsl.jsonable
import magic.jsonable.*

import stdx.encoding.json.*
import std.collection.{HashMap, ArrayList}

// See doc: https://docs.siliconflow.cn/cn/api-reference/images/images-generations
@jsonable
private class SiliconflowImageResponse {
    let seed: Int64
    let images: Array<SiliconflowImage>
}

@jsonable
private class SiliconflowImage {
    let url: String
}

public class SiliconflowImageModel <: ImageModel {
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
        get() { "siliconflow" }
    }

    override public prop name: String {
        get() { model }
    }

    override public func create(imageReq: ImageRequest): ImageResponse {
        let req = JsonObject()
        req.put("model", JsonString(model))
        req.put("prompt", JsonString(imageReq.prompt))
        req.put("image_size", JsonString(imageReq.size))
        req.put("batch_size", JsonInt(1))
        let header = HashMap<String, String>([
            ("Content-Type", "application/json"),
            ("Authorization", "Bearer ${this.apiKey}")
        ])
        match (HttpUtils.post("${this.baseURL}/images/generations", header, req, verify: false)) {
            case Some(body) =>
                let resp = SiliconflowImageResponse.fromJsonValue(JsonValue.fromStr(body))
                let image = resp.images[0] // Currently, we just return the first image
                return ImageResponse(
                    url: image.url
                    // b64Json: image.b64_json ?? "",
                )
            case None => throw ModelException("Fail to get image http response")
        }
    }
}