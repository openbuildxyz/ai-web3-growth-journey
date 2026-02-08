/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

public interface ImageModel <: Model {
    func create(request: ImageRequest): ImageResponse
}
