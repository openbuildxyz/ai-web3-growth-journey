/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class RISE {
//     @element[description="Specify agent's role"]
//     let role: String

//     @element[description="Describe the information or resources"]
//     let input: String

//     @element[description="Ask for detailed steps"]
//     let steps: String

//     @element[description="Describe the desired result."]
//     let expectation: String

// }

public class RISE {
    let role: String

    let input: String

    let steps: String

    let expectation: String



    public init(role!: String, input!: String, steps!: String, expectation!: String) {
        this.role = role
        this.input = input
        this.steps = steps
        this.expectation = expectation
    }


    public static func getElementNames(): Array < String > {
        return["role", "input", "steps", "expectation"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Role")
        sb.append("\n")
        sb.append(role)
        sb.append("\n")

        sb.append("## ")
        sb.append("Input")
        sb.append("\n")
        sb.append(input)
        sb.append("\n")

        sb.append("## ")
        sb.append("Steps")
        sb.append("\n")
        sb.append(steps)
        sb.append("\n")

        sb.append("## ")
        sb.append("Expectation")
        sb.append("\n")
        sb.append(expectation)
        sb.append("\n")

        return sb.toString()
    }

}