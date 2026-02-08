/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class ROSES {
//     @element[description="Specify agent's role"]
//     let role: String

//     @element[description="State the goal or objective"]
//     let objective: String

//     @element[description="Describe the situation"]
//     let scenario: String

//     @element[description="Define the desired result"]
//     let expectation: String

//     @element[description="Steps needed to achieve the solution"]
//     let steps: String

// }

public class ROSES {
    let role: String

    let objective: String

    let scenario: String

    let expectation: String

    let steps: String



    public init(role!: String, objective!: String, scenario!: String, expectation!: String, steps!: String) {
        this.role = role
        this.objective = objective
        this.scenario = scenario
        this.expectation = expectation
        this.steps = steps
    }


    public static func getElementNames(): Array < String > {
        return["role", "objective", "scenario", "expectation", "steps"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Role")
        sb.append("\n")
        sb.append(role)
        sb.append("\n")

        sb.append("## ")
        sb.append("Objective")
        sb.append("\n")
        sb.append(objective)
        sb.append("\n")

        sb.append("## ")
        sb.append("Scenario")
        sb.append("\n")
        sb.append(scenario)
        sb.append("\n")

        sb.append("## ")
        sb.append("Expectation")
        sb.append("\n")
        sb.append(expectation)
        sb.append("\n")

        sb.append("## ")
        sb.append("Steps")
        sb.append("\n")
        sb.append(steps)
        sb.append("\n")

        return sb.toString()
    }

}