/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.tool

/**
 * Compact the tool invocation
 */
public interface ToolCompactor {
    /**
     * Compact the tool invocation
     */
    func compact(toolRequest: ToolRequest, toolResponse: ToolResponse): String
}