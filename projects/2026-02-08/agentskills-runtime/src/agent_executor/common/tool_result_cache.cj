/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.common

import magic.core.tool.{ToolRequest, ToolResponse}

import std.collection.HashMap

private struct CacheItem {
    CacheItem(
        /**
         * Original tool request
         */
        let toolRequest: ToolRequest,

        /**
         * Result of the tool invocation
         */
        let toolResponse: ToolResponse,

        /**
         * Compacted result
         */
        let compactedResult: String
    ) { }
}

/**
 * A simple cache for tool results.
 * It stores the tool request, its invocation result and its compacted result.
 */
class ToolResultCache {
    private let cache = HashMap<Int64, CacheItem>()

    func getOriginalResult(id: Int64): Option<String> {
        return (this.cache.get(id)?.toolResponse)?.content
    }

    public func put(toolRequest!: ToolRequest,
                    toolResponse!: ToolResponse,
                    compactedResult!: String): String {
        let id = this.cache.size
        this.cache.add(id, CacheItem(toolRequest, toolResponse, compactedResult))
        return String.join(
            [
                "# Summary of Tool Result",
                compactedResult,
                "---------------------------------------",
                "VERY IMPORTANT NOTE: This result is summarized, and detailed results can be viewed by calling tool `${ToolResultViewerTool.NAME}` with ${ToolResultViewerTool.PARAM}: ${id}."
            ],
            delimiter: "\n"
        )
    }

    public func clear(): Unit {
        this.cache.clear()
    }
}