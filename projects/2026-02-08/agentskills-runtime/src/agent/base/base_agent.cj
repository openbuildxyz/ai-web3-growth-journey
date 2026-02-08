/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent.base

import magic.core.*
import magic.tool.SimpleToolManager
import magic.core.model.ChatModel
import magic.interaction.EventHandlerManager

import std.collection.{HashMap, map, collectArray, ArrayList}

/**
 * This class is used to define customized agents via APIs instead of @agent.
 */
open public class BaseAgent <: AbsAgent {
    protected var _name: String = ""
    protected var _description: String = ""
    protected var _temperature: Option<Float64> = None
    protected var _systemPrompt: String = ""
    protected var _toolManager: ToolManager = SimpleToolManager()
    protected var _model: ChatModel
    protected var _executor: Option<AgentExecutor> = None
    protected var _retriever: Option<Retriever> = None
    protected var _memory: Option<Memory> = None
    protected var _interceptor: Option<Interceptor> = None
    protected var _eventHandlerManager: Option<EventHandlerManager> = None

    public init(
        model!: ChatModel,
        name!: String = "Base Agent",
        description!: String = "",
        temperature!: Option<Float64> = None,
        systemPrompt!: String = "",
        toolManager!: ToolManager = SimpleToolManager(),
        executor!: Option<AgentExecutor> = None,
        retriever!: Option<Retriever> = None,
        memory!: Option<Memory> = None,
        interceptor!: Option<Interceptor> = None,
        eventHandlerManager!: Option<EventHandlerManager> = None
    ) {
        this._name = name
        this._description = description
        this._temperature = temperature
        this._systemPrompt = systemPrompt
        this._toolManager = toolManager
        this._model = model
        this._executor = executor
        this._retriever = retriever
        this._memory = memory
        this._interceptor = interceptor
        this._eventHandlerManager = eventHandlerManager
    }

    override public mut prop name: String {
        get() { _name }
        set(v) { _name = v }
    }
    override public prop description: String { get() { _description } }
    override public mut prop temperature: Option<Float64> {
        get() { _temperature }
        set(v) { _temperature = v }
    }
    override public mut prop systemPrompt: String {
        get() { _systemPrompt }
        set(v) { _systemPrompt = v }
    }
    override public prop toolManager: ToolManager { get() { _toolManager } }
    override public mut prop model: ChatModel {
        get() { _model }
        set(m) { _model = m }
    }
    override public mut prop executor: AgentExecutor {
        get() { _executor.getOrThrow() }
        set(e) { _executor = e }
    }
    override public mut prop retriever: Option<Retriever> {
        get() { _retriever }
        set(v) { _retriever = v }
    }
    override public mut prop memory: Option<Memory> {
        get() { _memory }
        set(m) { _memory = m }
    }
    override public mut prop interceptor: Option<Interceptor> {
        get() { _interceptor }
        set(v) { _interceptor = v }
    }
    override public prop eventHandlerManager: Option<Object> {
        get() {
            if (let Some(o) <- _eventHandlerManager) {
                return o
            }
            return None
        }
    }
}
