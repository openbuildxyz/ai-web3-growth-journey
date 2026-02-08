/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.common

import magic.log.LogUtils

import std.collection.ArrayList

class AgentTaskStackUtils {
    /**
    * A thread-local stack to store the current executing AgentTask.
    * This is used to support nested agent calls, for example an agent calls a tool that will start another.
    * When the agent execution is cancelled, the cancellation is always sent from the first task.
    */
    private static let AGENT_TASK_STACK = ThreadLocal<ArrayList<AgentTask>>()

    static func push(task: AgentTask): Unit {
        if (let Some(stack) <- AGENT_TASK_STACK.get()) {
            stack.add(task)
        } else {
            AGENT_TASK_STACK.set(ArrayList([task]))
        }
    }

    static func pop(): Unit {
        if (let Some(stack) <- AGENT_TASK_STACK.get()) {
            stack.remove(at: stack.size - 1)
        } else {
            LogUtils.error("No agent task to pop")
        }
    }

    /**
     * Get the first (bottom) agent task in the stack.
     */
    static func first(): Option<AgentTask> {
        if (let Some(stack) <- AGENT_TASK_STACK.get()) {
            return stack.first
        } else {
            LogUtils.error("No agent task in the stack")
            return None
        }
    }
}