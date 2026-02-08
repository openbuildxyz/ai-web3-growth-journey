/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class BROKE {
//     @element[description="Describe the background and provide sufficient information"]
//     let background: String

//     @element[description="Specify agent's role"]
//     let role: String

//     @element[description="Define the task objectives to be achieved"]
//     let objectives: String

//     @element[description="Define key, measurable outcomes to guide the agent on how to assess the achievement of the objectives."]
//     let keyResult: String

//     @element[description="Test results through experimentation and adjustments, and optimize as needed."]
//     let evolve: String

// }

public class BROKE {
    let background: String

    let role: String

    let objectives: String

    let keyResult: String

    let evolve: String



    public init(background!: String, role!: String, objectives!: String, keyResult!: String, evolve!: String) {
        this.background = background
        this.role = role
        this.objectives = objectives
        this.keyResult = keyResult
        this.evolve = evolve
    }


    public static func getElementNames(): Array < String > {
        return["background", "role", "objectives", "keyResult", "evolve"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Background")
        sb.append("\n")
        sb.append(background)
        sb.append("\n")

        sb.append("## ")
        sb.append("Role")
        sb.append("\n")
        sb.append(role)
        sb.append("\n")

        sb.append("## ")
        sb.append("Objectives")
        sb.append("\n")
        sb.append(objectives)
        sb.append("\n")

        sb.append("## ")
        sb.append("Keyresult")
        sb.append("\n")
        sb.append(keyResult)
        sb.append("\n")

        sb.append("## ")
        sb.append("Evolve")
        sb.append("\n")
        sb.append(evolve)
        sb.append("\n")

        return sb.toString()
    }

}