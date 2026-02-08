/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class CARE {
//     @element[description="Set the stage or context for the discussion"]
//     let context: String

//     @element[description="Describe what you want to do"]
//     let action: String

//     @element[description="Describe the desired result"]
//     let result: String

//     @element[description="Give an example to illustrate your point."]
//     let example: String

// }

public class CARE {
    let context: String

    let action: String

    let result: String

    let example: String



    public init(context!: String, action!: String, result!: String, example!: String) {
        this.context = context
        this.action = action
        this.result = result
        this.example = example
    }


    public static func getElementNames(): Array < String > {
        return["context", "action", "result", "example"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Context")
        sb.append("\n")
        sb.append(context)
        sb.append("\n")

        sb.append("## ")
        sb.append("Action")
        sb.append("\n")
        sb.append(action)
        sb.append("\n")

        sb.append("## ")
        sb.append("Result")
        sb.append("\n")
        sb.append(result)
        sb.append("\n")

        sb.append("## ")
        sb.append("Example")
        sb.append("\n")
        sb.append(example)
        sb.append("\n")

        return sb.toString()
    }

}