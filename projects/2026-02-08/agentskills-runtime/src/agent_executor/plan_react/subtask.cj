/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
 */
package magic.agent_executor.plan_react

import magic.jsonable.*
import magic.dsl.jsonable
import magic.utils.{Color, Colorful}

import stdx.encoding.json.*
import std.collection.{HashMap, ArrayList}

/**
 * A question will be decomposed as subtasks to solve.
 */
@jsonable
protected class Subtask {
    let name: String
    let goal: String
    let criticism: String
    let milestones: Array<String>
    // let tools: Array<String>
    var result: Option<String> = None

    init(name!: String, goal!: String) {
        this.name = name
        this.goal = goal
        this.criticism = ""
        this.milestones = []
        // this.tools = []
        this.result = None
    }

    prop simpleDescription: String {
        get() {
            let strBuilder = StringBuilder()
            strBuilder.append("Task-Name: ${name}\n")
            strBuilder.append("Task-Goal: ${goal}")
            return strBuilder.toString()
        }
    }

    prop complexDescription: String {
        get() {
            let strBuilder = StringBuilder()
            strBuilder.append("Task-Name: ${name}\n")
            strBuilder.append("Task-Goal: ${goal}\n")
            strBuilder.append("Task-Milestones: ${milestones}")
            return strBuilder.toString()
        }
    }

    func toMarkdown(): String {
        let strBuilder = StringBuilder()
        strBuilder.append("## 📝 Task ${name}\n\n")
        strBuilder.append("**🎯 Goal**: ${goal}\n")
        strBuilder.append("**📌 Criticism**: ${criticism}\n")
        strBuilder.append("**🚩 Milestones**:\n")
        for (m in milestones) {
            strBuilder.append("- ${m}\n")
        }
        if (let Some(r) <- result) {
            strBuilder.append("**🏆 Result**: ${r}\n")
        }
        return strBuilder.toString()
    }
}