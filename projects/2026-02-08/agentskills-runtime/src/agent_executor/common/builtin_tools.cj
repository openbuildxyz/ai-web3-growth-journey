/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.common

import magic.core.agent.Agent
import magic.core.tool.{Tool, ToolException}
import magic.tool.NativeFuncTool
import magic.jsonable.TypeSchema
import magic.log.LogUtils

import std.collection.HashMap
import stdx.encoding.json.{JsonObject, JsonValue}

/**
* This tool is used to provide the final answer after all steps are completed
* There is an internal **trick** that we can inject our answer tool with the same name
*/
protected class AnswerTool <: NativeFuncTool {
    protected static let NAME = "_answer_"

    protected static let DESC = """
    This is a special tool that can only be used after you complete all the steps and resolve the task.
    You use this tool to provide the user with the final answer.
    If you interact with them using this tool without finishing the task, the user will get upset.
    """

    init() {
        super(
            name: AnswerTool.NAME,
            description: AnswerTool.DESC,
            parameters: [
                ("result", "The final result", TypeSchema.Str)
            ],
            extra: HashMap([
                ("filterable", "false"),
                ("terminal", "true"),
                ("compactable", "false")
            ]),
            execFn: { args: HashMap<String, JsonValue> =>
                // The result is the final answer
                return args.get("result")
                    .getOrThrow({ => ToolException("Parameter `result` is required by the answer tool") })
                    .asString()
                    .getValue()
            }
        )
    }
}

protected class AnswerToolWithOutput <: NativeFuncTool {
    protected static let PARAM_DESC = """
    The argument is a JSON value representing the final answer.
    You MUST obey the the argument schema.
    """

    init (schema: TypeSchema) {
        super (
            name: AnswerTool.NAME,
            description: AnswerTool.DESC,
            parameters: [
                ("result", AnswerToolWithOutput.PARAM_DESC, schema)
            ],
            extra: HashMap([
                ("filterable", "false"),
                ("terminal", "true"),
                ("compactable", "false")
            ]),
            execFn: { args: HashMap<String, JsonValue> =>
                // The result is the final answer
                return args.get("result")
                    .getOrThrow({ => ToolException("Parameter `result` is required by the answer tool") })
                    .toJsonString()
            }
        )
    }
}

//--------------------------------------------------------------------------------

/**
* This tool is used to provide the final answer after all steps are completed
* There is an internal **trick** that we can inject our answer tool with the same name
*/
protected class ToolResultViewerTool <: NativeFuncTool  {
    protected static let NAME = "_tool_result_viewer_"

    protected static let PARAM = "tool_result_id"

    init(cache: ToolResultCache) {
        super(
            name: ToolResultViewerTool.NAME,
            description: "This tool is used to query \"detailed results of past tool invocations\". Note that only summarized tool invocation results can be queried. Each summarized tool invocation has a unique ID, so ensure the correct ID is provided.",
            parameters: [
                (ToolResultViewerTool.PARAM, "Unique id of the summarized tool invocation", TypeSchema.Int)
            ],
            extra: HashMap([
                ("filterable", "false"),
                ("terminal", "false"),
                ("compactable", "false")
            ]),
            execFn: { args: HashMap<String, JsonValue> =>
                // The result is the final answer
                let id = args.get(ToolResultViewerTool.PARAM)
                    .getOrThrow({ => ToolException("Argument `${ToolResultViewerTool.PARAM}` is missing") })
                    .asInt()
                    .getValue()
                if (let Some(result) <- cache.getOriginalResult(id)) {
                    return result
                } else {
                    let msg = "Tool result with id `${id}` not found in the cache"
                    LogUtils.error("ToolResultViewer", msg)
                    return msg
                }
            }
        )
    }
}

//--------------------------------------------------------------------------------

protected class RetrieverTool <: NativeFuncTool {
    protected static let NAME = "_retriever_tool_"

    // private let task: AgentTask
    init(task: AgentTask) {
        super(
            name: RetrieverTool.NAME,
            description: "Search related knowledge and context",
            parameters: [
                ("query", "The query to search", TypeSchema.Str)
            ],
            extra: HashMap([
                ("filterable", "true"),
                ("terminal", "false"),
                ("compactable", "true")
            ]),
            execFn: { args: HashMap<String, JsonValue> =>
                let query = args["query"].asString().getValue()
                let retrieval = task.agent.retriever.getOrThrow().search(query)
                task.execution.addRetrieval(query, retrieval)
                return retrieval.toPrompt()
            }
        )
    }
}

//--------------------------------------------------------------------------------

protected struct BuiltinToolUtils {
   protected static func buildAnswerTool(schema: Option<TypeSchema>): NativeFuncTool {
        if (let Some(schema) <- schema) {
            return AnswerToolWithOutput(schema)
        } else {
            return AnswerTool()
        }
    }

    static func buildToolResultViewerTool(cache: ToolResultCache): NativeFuncTool {
        ToolResultViewerTool(cache)
    }

    static func buildRetrieverTool(task: AgentTask): NativeFuncTool {
        RetrieverTool(task)
    }
}

