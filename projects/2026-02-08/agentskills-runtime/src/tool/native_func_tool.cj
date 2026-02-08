/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tool

import magic.core.tool.*
import magic.core.agent.AgentCancelException
import magic.jsonable.TypeSchema
import std.collection.{ArrayList, HashMap}

import stdx.encoding.json.JsonValue

private type ExecFn = (HashMap<String, JsonValue>) -> String

open public class NativeFuncTool <: AbsTool {
    private let _name: String
    private let _description: String
    private let _parameters: ArrayList<ToolParameter>
    private var _retType: TypeSchema = TypeSchema.Str
    private let _examples: ArrayList<String>
    private var _fnOpt: Option<ExecFn>

    public init(name!: String,
                description!: String,
                parameters!: Array<(String, String, TypeSchema)> = [],
                retType!: TypeSchema = TypeSchema.Str,
                examples!: Array<String> = [],
                extra!: HashMap<String, String> = HashMap<String, String>(),
                execFn!: Option<ExecFn> = None) {
        _name = name
        _description = description
        _parameters = ArrayList<ToolParameter>()
        for (item in parameters) {
            _parameters.add(ToolParameter(item[0], item[1], item[2]))
        }
        _retType = retType
        _examples = ArrayList<String>()
        _examples.add(all: examples)
        _fnOpt = execFn
        _extra = extra
    }

    public prop name: String {
        get() { _name }
    }

    public prop description: String {
        get() { _description }
    }

    public prop parameters: Array<ToolParameter> {
        get() { _parameters.toArray() }
    }

    public prop retType: TypeSchema {
        get() { _retType }
    }

    public prop examples: Array<String> {
        get() { _examples.toArray() }
    }

    /**
     * Each argument is represented as a string of Json value
     */
    override public func invoke(args: HashMap<String, JsonValue>): ToolResponse {
        if (let Some(fn) <- _fnOpt) {
            let result = fn(args)
            return ToolResponse(result)
        } else {
            throw ToolException("The tool `${_name}` has not a native function")
        }
    }
}