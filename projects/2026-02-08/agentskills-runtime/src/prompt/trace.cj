/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class TRACE {
//     @element[description="Define the specific task"]
//     let task: String

//     @element[description="Describe your request"]
//     let request: String

//     @element[description="Explain the actions you need"]
//     let action: String

//     @element[description="Provide context or situation"]
//     let context: String

//     @element[description="Give an example to illustrate your point"]
//     let example: String

// }

public class TRACE {
    let task: String

    let request: String

    let action: String

    let context: String

    let example: String



    public init(task!: String, request!: String, action!: String, context!: String, example!: String) {
        this.task = task
        this.request = request
        this.action = action
        this.context = context
        this.example = example
    }


    public static func getElementNames(): Array < String > {
        return["task", "request", "action", "context", "example"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Task")
        sb.append("\n")
        sb.append(task)
        sb.append("\n")

        sb.append("## ")
        sb.append("Request")
        sb.append("\n")
        sb.append(request)
        sb.append("\n")

        sb.append("## ")
        sb.append("Action")
        sb.append("\n")
        sb.append(action)
        sb.append("\n")

        sb.append("## ")
        sb.append("Context")
        sb.append("\n")
        sb.append(context)
        sb.append("\n")

        sb.append("## ")
        sb.append("Example")
        sb.append("\n")
        sb.append(example)
        sb.append("\n")

        return sb.toString()
    }

}