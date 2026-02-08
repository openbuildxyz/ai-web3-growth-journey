/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

import magic.core.message.{Conversation, MessageList}
import magic.core.interaction.EventStream
import magic.jsonable.TypeSchema
import magic.utils.ImportedFile

import std.collection.{ArrayList, HashMap}
import std.fs.Path

/**
 * The execution request to an agent executor
 * This type encodes the agent communication protocol
 */
public class AgentRequest {
    /**
     * The current user question
     */
    public let question: String

    /**
     * The user input question for using VLM
     */
    public let image: Option<String>

    /**
     * Conversation between the user and agent
     */
    public let conversation: Option<Conversation>

    /**
     * Dump internal execution information
     */
    public let verbose: Bool

    /**
     * The maximum number of tools that can be used when enable tool filter
     */
    public let maxTool: Int64

    public init(question: String,
                image!: Option<String> = None,
                conversation!: Option<Conversation> = None,
                verbose!: Bool = false,
                maxTool!: Int64 = 10) {
        this.question = question
        this.image = image
        this.conversation = conversation
        this.verbose = verbose
        this.maxTool = maxTool
    }

    //-----------------------------------------------------------------
    // The following fields are used internally by the agent executor
    //-----------------------------------------------------------------

    /**
     * Subagent may need to access the previous execution context
     */
    protected var parentContext: Option<MessageList> = None

    /**
     * Subagents may inherit the event stream of the parent agent
     */
    protected var eventStream: Option<EventStream> = None

     /**
      * Users can register event handlers for each request
      */
    protected var eventHandlerManager: Option<Object> = None // Avoid circular import

    /**
     * Output schema for structured output
     */
    protected var outputSchema: Option<TypeSchema> = None

    /**
     * Imported files from the request question
     * Processed by the importer utility
     */
    protected var importedFiles = ArrayList<ImportedFile>()

    /**
     * Whether the request has been dispatched to a subagent
     */
    protected var dispatchToSubagent : Bool = false

    /**
     * Clone the request with some fields changed
     */
    protected func clone(question!: Option<String> = None,
                         image!: Option<String> = None,
                         conversation!: Option<Conversation> = None,
                         verbose!: Option<Bool> = None,
                         maxTool!: Option<Int64> = None): AgentRequest {
        let req = AgentRequest(
            question ?? this.question,
            image: image ?? this.image,
            conversation: conversation ?? this.conversation,
            verbose: verbose ?? this.verbose,
            maxTool: maxTool ?? this.maxTool,
        )

        req.parentContext = this.parentContext
        req.eventStream = this.eventStream
        req.eventHandlerManager = this.eventHandlerManager
        req.outputSchema = this.outputSchema
        req.importedFiles = this.importedFiles
        req.dispatchToSubagent = this.dispatchToSubagent
        return req
    }
}
