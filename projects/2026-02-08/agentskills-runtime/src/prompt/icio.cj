/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class ICIO {
//     @element[description="Specific task for the AI to perform"]
//     let instruction: String

//     @element[description="Provide more background information to the AI"]
//     let context: String

//     @element[description="Inform the model of the data to process"]
//     let input: String

//     @element[description="Inform us of the type or style of output we want"]
//     let output: String

// }

public class ICIO {
    let instruction: String

    let context: String

    let input: String

    let output: String



    public init(instruction!: String, context!: String, input!: String, output!: String) {
        this.instruction = instruction
        this.context = context
        this.input = input
        this.output = output
    }


    public static func getElementNames(): Array < String > {
        return["instruction", "context", "input", "output"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Instruction")
        sb.append("\n")
        sb.append(instruction)
        sb.append("\n")

        sb.append("## ")
        sb.append("Context")
        sb.append("\n")
        sb.append(context)
        sb.append("\n")

        sb.append("## ")
        sb.append("Input")
        sb.append("\n")
        sb.append(input)
        sb.append("\n")

        sb.append("## ")
        sb.append("Output")
        sb.append("\n")
        sb.append(output)
        sb.append("\n")

        return sb.toString()
    }

}