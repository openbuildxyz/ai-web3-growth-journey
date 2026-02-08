/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.prompt

// import magic.dsl.{promptPattern, element}

// @promptPattern[autoToString=true]
// public class CRISPE {
//     @element[description="What role an agent should play"]
//     let capacityAndRole: String

//     @element[description="Provide insights, background, and context"]
//     let insight: String

//     @element[description="What you are asking the agent to do"]
//     let statement: String

//     @element[description="In what style, personality, or manner you want it to respond"]
//     let personality: String

//     @element[description="Request the agent to respond with multiple examples"]
//     let experiment: String

// }

public class CRISPE {
    let capacityAndRole: String

    let insight: String

    let statement: String

    let personality: String

    let experiment: String



    public init(capacityAndRole!: String, insight!: String, statement!: String, personality!: String, experiment!: String) {
        this.capacityAndRole = capacityAndRole
        this.insight = insight
        this.statement = statement
        this.personality = personality
        this.experiment = experiment
    }


    public static func getElementNames(): Array < String > {
        return["capacityAndRole", "insight", "statement", "personality", "experiment"]
    }


    public func toString(): String {
        let sb = StringBuilder()
        sb.append("## ")
        sb.append("Capacityandrole")
        sb.append("\n")
        sb.append(capacityAndRole)
        sb.append("\n")

        sb.append("## ")
        sb.append("Insight")
        sb.append("\n")
        sb.append(insight)
        sb.append("\n")

        sb.append("## ")
        sb.append("Statement")
        sb.append("\n")
        sb.append(statement)
        sb.append("\n")

        sb.append("## ")
        sb.append("Personality")
        sb.append("\n")
        sb.append(personality)
        sb.append("\n")

        sb.append("## ")
        sb.append("Experiment")
        sb.append("\n")
        sb.append(experiment)
        sb.append("\n")

        return sb.toString()
    }

}