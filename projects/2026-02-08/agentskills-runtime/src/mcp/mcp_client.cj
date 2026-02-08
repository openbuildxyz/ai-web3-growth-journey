/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.mcp

import magic.core.tool.{Tool, Toolset, ToolResponse}
import magic.jsonable.*
import magic.log.LogUtils

import stdx.encoding.json.{JsonValue, JsonObject}

/**
 * MCP client
 * Currently, clients support listing/calling tools
 */
public interface MCPClient <: Toolset {
    /**
     * Get the parameters used when starting the MCP server.
     */
    prop initParams: JsonObject

    /**
     * Call a specified tool from the MCP server.
     */
    func callTool(name: String, args: Array<(String, ToJsonValue)>): ToolResponse

    /**
     * Call a specified tool from the MCP server.
     */
    func callTool(name: String, args: Array<(String, JsonValue)>): ToolResponse
}
