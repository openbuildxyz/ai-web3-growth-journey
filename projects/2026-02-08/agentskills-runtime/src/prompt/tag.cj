/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class TAG {
//     @element[description="Define the specific task"]
//     let task: String

//     @element[description="Describe what needs to be done"]
//     let action: String

//     @element[description="Explain the final goal."]
//     let goal: String

// }

public class TAG {
    let task: String

    let action: String

    let goal: String



    public init(task!: String, action!: String, goal!: String) {
        this.task = task
        this.action = action
        this.goal = goal
    }


    public static func getElementNames(): Array < String > {
        return["task", "action", "goal"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Task")
        sb.append("\n")
        sb.append(task)
        sb.append("\n")

        sb.append("## ")
        sb.append("Action")
        sb.append("\n")
        sb.append(action)
        sb.append("\n")

        sb.append("## ")
        sb.append("Goal")
        sb.append("\n")
        sb.append(goal)
        sb.append("\n")

        return sb.toString()
    }

}