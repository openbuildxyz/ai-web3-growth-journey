/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class APE {
//     @element[description="Define the work or activity to be completed"]
//     let action: String

//     @element[description="Define why initiating the action."]
//     let purpose: String

//     @element[description="State the expected result"]
//     let expectation: String

// }

public class APE {
    let action: String

    let purpose: String

    let expectation: String



    public init(action!: String, purpose!: String, expectation!: String) {
        this.action = action
        this.purpose = purpose
        this.expectation = expectation
    }


    public static func getElementNames(): Array < String > {
        return["action", "purpose", "expectation"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Action")
        sb.append("\n")
        sb.append(action)
        sb.append("\n")

        sb.append("## ")
        sb.append("Purpose")
        sb.append("\n")
        sb.append(purpose)
        sb.append("\n")

        sb.append("## ")
        sb.append("Expectation")
        sb.append("\n")
        sb.append(expectation)
        sb.append("\n")

        return sb.toString()
    }

}