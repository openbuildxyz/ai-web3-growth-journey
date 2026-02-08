/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

public struct ImageRequest {
    public ImageRequest(
        protected let prompt: String,
        // protected negativePrompt: Option<String>,
        // public let n: Int64,
        protected let size!: String = "1024x1024") {
    }
}
