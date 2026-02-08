/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.tool

/**
 * Result of the tool invocation
 */
public struct ToolResponse {
    public let content: String
    public let isError: Bool

    public init(content: String, isError!: Bool = false) {
        this.content = content
        this.isError = isError
    }
}
