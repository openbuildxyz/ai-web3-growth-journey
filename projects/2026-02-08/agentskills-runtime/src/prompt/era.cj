/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class ERA {
//     @element[description="Describe the desired result"]
//     let expectation: String

//     @element[description="Specify agent's role"]
//     let role: String

//     @element[description="Specify the actions to be taken"]
//     let action: String

// }

public class ERA {
    let expectation: String

    let role: String

    let action: String



    public init(expectation!: String, role!: String, action!: String) {
        this.expectation = expectation
        this.role = role
        this.action = action
    }


    public static func getElementNames(): Array < String > {
        return["expectation", "role", "action"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Expectation")
        sb.append("\n")
        sb.append(expectation)
        sb.append("\n")

        sb.append("## ")
        sb.append("Role")
        sb.append("\n")
        sb.append(role)
        sb.append("\n")

        sb.append("## ")
        sb.append("Action")
        sb.append("\n")
        sb.append(action)
        sb.append("\n")

        return sb.toString()
    }

}