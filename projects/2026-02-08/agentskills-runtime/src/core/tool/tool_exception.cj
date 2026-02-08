/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.tool

public class ToolException <: Exception {
    public let reason: String
    public init(reason: String) {
        super(reason)
        this.reason = reason
    }
}
