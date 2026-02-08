/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor

import magic.core.agent.AgentExecutor
import magic.agent_executor.naive.NaiveExecutor
import magic.agent_executor.react.ReactExecutor
import magic.agent_executor.plan_react.PlanReactExecutor
import magic.agent_executor.tool_loop.ToolLoopExecutor
import magic.agent_executor.dsl.DslExecutor

import std.collection.ArrayList
import magic.core.agent.AgentExecutionException
import std.convert.Parsable

private struct AgentExecutorBuilder {
    AgentExecutorBuilder(
        let checkFn: (String) -> Bool,
        let buildFn: (String) -> AgentExecutor) { }
}

public struct AgentExecutorManager {
    private static let AGENT_EXECUTOR_BUILDS = ArrayList<AgentExecutorBuilder>()

    public static func register(checkFn: (String) -> Bool,
                                buildFn: (String) -> AgentExecutor): Unit {
        AGENT_EXECUTOR_BUILDS.add(AgentExecutorBuilder(checkFn, buildFn))
    }

    public static func register(name: String,
                                buildFn: () -> AgentExecutor): Unit {
        AGENT_EXECUTOR_BUILDS.add(
            AgentExecutorBuilder(
                { n: String => n == name },
                { n: String => buildFn() }
            )
        )
    }

    public static func create(name: String): AgentExecutor {
        if (name == "naive") {
            return NaiveExecutor()
        } else if (name == "react") {
            return ReactExecutor()
        } else if (name == "plan-react") {
            return PlanReactExecutor()
        } else if (name == "tool-loop") {
            return ToolLoopExecutor()
        } else if (name == "dsl-executor") {
            return DslExecutor()
        }
        // react with a loop number, like react:5
        if (name.startsWith("react:") || name.startsWith("tool-loop:")) {
            let items = name.split(":")
            if (items.size == 2) {
                if (let Some(num) <- Int64.tryParse(items[1])) {
                    if (items[0] == "react") {
                        return ReactExecutor(loop: num)
                    } else {
                        return ToolLoopExecutor(loop: num)
                    }
                }
            }
        }
        for (builder in AGENT_EXECUTOR_BUILDS) {
            if (builder.checkFn(name)) {
                return builder.buildFn(name)
            }
        }
        throw AgentExecutionException("Unknown executor: `${name}`")
    }
}
