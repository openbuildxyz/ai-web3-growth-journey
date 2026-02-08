/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent

import magic.agent.base.BaseAgent
import magic.agent_executor.AgentExecutorManager
import magic.core.agent.{AgentRequest, AgentResponse, AgentExecutor, AgentExecutionException}
import magic.core.tool.{Tool, ToolException}
import magic.config.Config
import magic.core.model.ChatModel
import magic.jsonable.TypeSchema
import magic.jsonable.{Jsonable, JsonableException}
import magic.model.ModelManager
import magic.prompt.Template
import magic.parser.{ParserUtils, ParserException}
import magic.log.LogUtils
import magic.tool.NativeFuncTool

import std.collection.{enumerate, HashMap}
import stdx.encoding.json.{JsonValue, JsonObject}

private let AI_FUNC_PROMPT = """
You are a deterministic function executor. Given a function's definition and concrete arguments, simulate its behavior and return the correct output. Follow these rules:

## Function Definition

Function Name: {func_name}

Parameters:
{parameters}

Return Type: {ret_type}

Optional Instruction of the Function: {func_prompt}

Argument Values:
{arguments}

## Execution

Your task is to simulate the behavior of this function as accurately as possible, using the given parameters and values.

- If a description exists, use it as the primary guide for behavior.
- If external tools are available, you may use them when appropriate.

## Output

- Return only the result (matching the return type schema).
- No explanations, unless validation fails.
- Do not write code--just simulate the function's execution and return the expected output.
"""

let OUTPUT_FORMAT_WITH_TOOL = """
- Output format:
```json
{
    "name": "_answer_"
    "arguments": {
        "func_result": <func_result>
    }
}
```
Where <func_result> is a json value that matches the return type schema.

- If an error occurs, return:
```json
{
    "name": "_answer_"
    "arguments": {
        "func_error": <func_error>
    }
}
```
Where <func_error> is a json string.
"""

let OUTPUT_FORMAT_WITHOUT_TOOL = """
- Output format:
```json
{
    "func_result": <func_result>
}
```
Where <func_result> is a json value that matches the return type schema.

- If an error occurs, return:
```json
{
    "func_error": <func_error>
}
```
Where <func_error> is a json string.
"""

/**
 * A special fake tool
 * This tool is used to provide the final answer after all steps are completed
 * There is an internal **trick** that we can inject our answer tool with the same name
 */
private let ANSWER_TOOL = NativeFuncTool(
    name: "_answer_",
    description: "This is a special tool to provide the the final answer.",
    parameters: [
        ("result", "The final JSON Value according to expected type schema.", TypeSchema.Obj([]))
    ],
    extra: HashMap([
        ("filterable", "false"),
        ("terminal", "true"),
        ("compactable", "false")
    ]),
    execFn: { args: HashMap<String, JsonValue> =>
        if (args.contains("func_result") || args.contains("func_error")) {
            return JsonObject(args).toJsonString()
        } else {
            throw ToolException("The result parameter is required for the answer tool")
        }
    }
)

/**
 * This specific agent is used to execute @ai functions
 */
public class AiFuncAgent <: BaseAgent {
    public AiFuncAgent(
        model!: Option<String>,
        temperature!: Option<Float64>,
        tools!: Option<Array<Tool>>,
        private let funcPrompt!: Option<String>,
        private let funcName!: String,
        private let parameters!: Array<(String, TypeSchema)>,
        private let retType!: TypeSchema
    ) {
        super (
            name: "AiFuncAgent",
            model: if (let Some(m) <- model) { ModelManager.createChatModel(m) }
                   else { Config.defaultChatModel.getOrThrow() },
            temperature: temperature,
        )
        if (let Some(ts) <- tools && !ts.isEmpty()) {
            this.toolManager.addTools(ts)
            this.toolManager.addTool(ANSWER_TOOL)
            this.executor = AgentExecutorManager.create("tool-loop")
        } else {
            this.executor = AgentExecutorManager.create("naive")
        }
    }

    public func run<T>(args: Array<JsonValue>): T where T <: Jsonable<T> {
        // Build and set the system prompt
        let promptTemplate = if (this.executor.name == "tool-loop") {
            AI_FUNC_PROMPT + OUTPUT_FORMAT_WITH_TOOL
        } else {
            AI_FUNC_PROMPT + OUTPUT_FORMAT_WITHOUT_TOOL
        }
        this.systemPrompt = promptTemplate.format([
            ("func_name", this.funcName),
            ("parameters", this.buildParametersPrompt()),
            ("ret_type", this.retType.toJsonValue().toJsonString()),
            ("func_prompt", this.funcPrompt ?? "None"),
            ("arguments", this.buildArgumentsPrompt(args))
        ])
        // Start the agent to simulate the function
        let rawResult = this.chat("Please simulate the function and return the result in JSON format.")
        LogUtils.info(this.name, "Raw AI function result: ${rawResult}")
        // Parse the result and convert it to the expected type
        return this.convertResult<T>(rawResult)
    }

    private func buildArgumentsPrompt(args: Array<JsonValue>): String {
        let jo = JsonObject()
        // Assume that args is in the same order as parameters
        for ((idx, (name, _)) in enumerate(this.parameters)) {
            jo.put(name, args[idx])
        }
        return jo.toJsonString()
    }

    private func buildParametersPrompt(): String {
        let jo = JsonObject()
        for ((name, typeSchema) in this.parameters) {
            jo.put(name, typeSchema.toJsonValue().asObject())
        }
        return jo.toJsonString()
    }

    /**
     * Extract `{ "func_result": <func_result> }`,
     * and convert the result to the expected type.
     */
    private func convertResult<T>(rawResult: String): T where T <: Jsonable<T> {
        try {
            let jo = ParserUtils.extractFirstValue<JsonObject>(rawResult)
            if (jo.containsKey("func_result")) {
                return T.fromJsonValue(jo["func_result"])
            } else if (jo.containsKey("func_error")) {
                let errorMsg = jo["func_error"].asString().toString()
                LogUtils.error("Function execution failed: ${errorMsg}")
                throw AgentExecutionException(errorMsg)
            } else {
                let msg = "The function execution result does not contain 'func_result' or 'func_error'."
                LogUtils.error(msg)
                throw AgentExecutionException(msg)
            }
        } catch (ex: ParserException) {
            let msg = "Failed to parse the AI function result. ${ex.reason}"
            LogUtils.error(msg)
            throw AgentExecutionException(msg)
        } catch (ex: JsonableException) {
            let msg = "Failed to convert the AI function result to the expected type."
            LogUtils.error(msg)
            throw AgentExecutionException(msg)
        }
    }
}