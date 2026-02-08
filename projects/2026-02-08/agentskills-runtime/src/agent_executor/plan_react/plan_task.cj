/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
 */
package magic.agent_executor.plan_react

import magic.core.agent.*
import magic.agent_executor.common.AgentTask

protected class PlanTask <: AgentTask {
    private var _subtasks: Option<Array<Subtask>>
    private var _knowledge: Option<String>

    protected init(agent: Agent, request: AgentRequest) {
        super(agent, request)
        this._subtasks = None
        this._knowledge = None
    }

    protected mut prop subtasks: Array<Subtask> {
        get() { this._subtasks.getOrThrow({ => AgentExecutionException("Subtasks are not decomposed") }) }
        set(v) { this._subtasks = v }
    }

    protected mut prop knowledge: String {
        get() { this._knowledge.getOrThrow({ => AgentExecutionException("Knowledge is not extracted") }) }
        set(v) { this._knowledge = v }
    }

    prop progress: String {
        get() {
            let strBuilder = StringBuilder()
            for (subtask in subtasks) {
                if (let Some(result) <- subtask.result) {
                    strBuilder.append("[Task]\n${subtask.simpleDescription}\n")
                    strBuilder.append("[Result]\n${result}\n")
                } else {
                    break
                }
            }
            return strBuilder.toString()
        }
    }
}