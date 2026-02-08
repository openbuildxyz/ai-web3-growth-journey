/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.tool

/**
 * Manage agent tools
 */
public interface ToolManager <: Toolset {
    /**
     * Add a new tool
     */
    func addTool(tool: Tool): Unit

    /**
     * Delete a tool if it exists
     */
    func delTool(tool: Tool): Unit

    /**
     * Add new tools
     */
    func addTools(tools: Collection<Tool>): Unit

    /**
     * Delete all tools
     */
    func clear(): Unit

    /**
     * Find a tool according to its name
     */
    func findTool(name: String): Option<Tool>

    /**
     * Filter related tools to the question
     */
    func filterTool(question: String, filter: ToolFilter): Array<Tool>

    /**
     * Whether filtering tools is enabled
     */
    prop enableFilter: Bool
}