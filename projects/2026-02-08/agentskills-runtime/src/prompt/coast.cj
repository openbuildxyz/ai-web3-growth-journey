/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class COAST {
//     @element[description="Set the stage for the conversation"]
//     let context: String

//     @element[description="Describe the goal"]
//     let objective: String

//     @element[description="Explain the required actions"]
//     let action: String

//     @element[description="Describe the scenario"]
//     let scenario: String

//     @element[description="Describe the task."]
//     let task: String

// }

public class COAST {
    let context: String

    let objective: String

    let action: String

    let scenario: String

    let task: String



    public init(context!: String, objective!: String, action!: String, scenario!: String, task!: String) {
        this.context = context
        this.objective = objective
        this.action = action
        this.scenario = scenario
        this.task = task
    }


    public static func getElementNames(): Array < String > {
        return["context", "objective", "action", "scenario", "task"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Context")
        sb.append("\n")
        sb.append(context)
        sb.append("\n")

        sb.append("## ")
        sb.append("Objective")
        sb.append("\n")
        sb.append(objective)
        sb.append("\n")

        sb.append("## ")
        sb.append("Action")
        sb.append("\n")
        sb.append(action)
        sb.append("\n")

        sb.append("## ")
        sb.append("Scenario")
        sb.append("\n")
        sb.append(scenario)
        sb.append("\n")

        sb.append("## ")
        sb.append("Task")
        sb.append("\n")
        sb.append(task)
        sb.append("\n")

        return sb.toString()
    }

}