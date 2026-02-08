/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tool

import magic.core.tool.*
import magic.log.LogUtils
import magic.core.model.{ChatModel, EmbeddingModel}

import std.collection.{ArrayList, HashMap, map, collectArray}

public class SimpleToolManager <: ToolManager {
    private let _tools = HashMap<String, Tool>()

    private let _enableFilter: Bool

    public init() {
        _enableFilter = false
    }

    public init(tools: Collection<Tool>, enableFilter!: Bool = false) {
        this._enableFilter = enableFilter
        for (t in tools) {
            addTool(t)
        }
    }

    override public prop tools: Array<Tool> {
        get() {
            this._tools.values().toArray()
        }
    }

    override public prop enableFilter: Bool {
        get() { return _enableFilter }
    }

    override public func addTool(tool: Tool): Unit {
        this._tools.add(tool.name, tool)
    }

    override public func delTool(tool: Tool): Unit {
        if (this._tools.contains(tool.name)) {
            this._tools.remove(tool.name)
        }
    }

    override public func addTools(tools: Collection<Tool>): Unit {
        for (tool in tools) {
            this.addTool(tool)
        }
    }

    override public func clear(): Unit {
        this._tools.clear()
    }

    override public func findTool(name: String): Option<Tool> {
        return this._tools.get(name)
    }

    private func splitTools(pred: (Tool) -> Bool): (ArrayList<Tool>, ArrayList<Tool>) {
        let groupA = ArrayList<Tool>()
        let groupB = ArrayList<Tool>()
        for (tool in this.tools) {
            if (pred(tool)) {
                groupA.add(tool)
            } else {
                groupB.add(tool)
            }
        }
        return (groupA, groupB)
    }

    override public func filterTool(question: String, filter: ToolFilter): Array<Tool> {
        if (!this.enableFilter) {
            return this.tools
        }
        // Tools, whose filterable == false, are special tools
        let (specialTools, normalTools) = this.splitTools({ tool =>
            (tool.extra.get("filterable") ?? "") == "false"
        })
        let filteredTools = filter.filter(question, normalTools)
        LogUtils.info("Filtered tools: ${normalTools.size} -> ${filteredTools.size}")
        // Special tools are put first
        specialTools.add(all: filteredTools)
        return specialTools.toArray()
    }

}
