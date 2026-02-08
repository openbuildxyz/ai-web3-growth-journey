/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

public struct ImageResponse {
    public ImageResponse(
        public let url!: String = "",
        // protected let b64Json: Option<String> = None
        public let revisedPrompt!: String = "") {
    }
}
