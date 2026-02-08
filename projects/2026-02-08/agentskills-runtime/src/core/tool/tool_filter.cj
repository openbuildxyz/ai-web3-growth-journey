/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.tool

/**
 * Filter tools
 */
public interface ToolFilter {
    func filter(question: String, tools: Collection<Tool>): Array<Tool>
}