/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class SAGE {
//     @element[description="Describes the context or background in which the task is performed."]
//     let situation: String

//     @element[description="Specify what operations or steps need to be taken"]
//     let action: String

//     @element[description="Specify the purpose or effect that should be achieved after the task is completed"]
//     let goal: String

//     @element[description="Specify specific requirement for the output result"]
//     let expectation: String

// }

public class SAGE {
    let situation: String

    let action: String

    let goal: String

    let expectation: String



    public init(situation!: String, action!: String, goal!: String, expectation!: String) {
        this.situation = situation
        this.action = action
        this.goal = goal
        this.expectation = expectation
    }


    public static func getElementNames(): Array < String > {
        return["situation", "action", "goal", "expectation"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Situation")
        sb.append("\n")
        sb.append(situation)
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

        sb.append("## ")
        sb.append("Expectation")
        sb.append("\n")
        sb.append(expectation)
        sb.append("\n")

        return sb.toString()
    }

}