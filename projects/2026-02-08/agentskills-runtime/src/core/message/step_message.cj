/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.message

import magic.jsonable.{Jsonable, FromJsonValue, ToJsonValue, JsonUtils}
import magic.core.tool.ToolRequest

import std.collection.{LinkedList, LinkedListNode}
import stdx.encoding.json.*

/**
 * Info of a single step in the agent execution
 */
protected struct StepInfo {
    /**
     * The tag of this step
     */
    let tag: Tag

    /**
     * The tool request in this step if it's a tool call message
     */
    let toolRequest: Option<ToolRequest>

    StepInfo(tag: Tag, toolRequest: Option<ToolRequest>) {
        this.tag = tag
        this.toolRequest = toolRequest
    }
}

/**
 * A single step in the agent execution, consisting of a message and other optional information.
 * Used internally
 */
protected class ExecutionMessage {
    /**
     * The original message
     */
    protected let message: Message

    protected let stepInfo: Option<StepInfo>

    protected init(message: Message) {
        this.message = message
        this.stepInfo = None
    }

    protected init(message: Message, tag: Tag, toolRequest!: Option<ToolRequest> = None) {
        this.message = message
        this.stepInfo = StepInfo(tag, toolRequest)
    }

    protected func isStep(): Bool {
        return this.stepInfo.isSome()
    }
}

/**
 * A step message in the agent execution
 */
public class StepMessage {
    private let list: LinkedList<ExecutionMessage>

    private let node: LinkedListNode<ExecutionMessage>

    protected init(list!: LinkedList<ExecutionMessage>, node!: LinkedListNode<ExecutionMessage>) {
        this.list = list
        this.node = node
    }

    public prop message: Message {
        get() {
            return this.node.value.message
        }
    }

    public prop tag: Option<Tag> {
        get() {
            return (this.node.value.stepInfo)?.tag
        }
    }

    public prop toolRequest: Option<ToolRequest> {
        get() {
            match (this.node.value.stepInfo) {
                case Some(stepInfo) => return stepInfo.toolRequest
                case None => return None
            }
        }
    }

    public func update(message: Message) {
        this.node.value = ExecutionMessage(message)
    }

    public func setObsolete(): Unit {
        this.list.remove(this.node)
    }
}
