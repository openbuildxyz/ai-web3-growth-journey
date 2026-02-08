/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.agent_executor.react

import magic.core.*
import magic.core.message.{Message, MessageList, Tag}
import magic.log.LogUtils
import magic.model.ModelUtils
import magic.utils.sleep2
import magic.parser.{TagStreamParser, ParserException}

import std.collection.{ArrayList, map, collectArray}

class AsyncReactAnswer <: Iterator<String> {
    private var finished = false

    AsyncReactAnswer(
        let parser: TagStreamParser
    ) {
        if ((this.parser.currTag ?? Tag.Fail) != Tag.Answer) {
            throw AgentExecutionException("Invalid async react ${Tag.Answer}. Content: ${this.parser.currContent}")
        }
        // Remove the prefix of tag
        this.parser.removeTag(Tag.Answer)
    }

    override public func next(): Option<String> {
        if (finished) {
            return None
        }
        if (let Some((content, _isClosed)) <- this.parser.readContentUntilClosed(Tag.Answer)) {
            finished = _isClosed
            return content
        }
        return None
    }
}

class AsyncReactStep {
    AsyncReactStep(
        let parser: TagStreamParser
    ) { }

    // Each react step has [Thought], so we parse thoughts and save them
    private let thoughts = ArrayList<String>()

    private func readThoughts(): Unit {
        while (let Some(tag) <- this.parser.currTag) {
            if (tag == Tag.Thought) {
                thoughts.add(this.parser.readTagAndContent(Tag.Thought))
            } else if (tag == Tag.Action || tag == Tag.Answer) {
                break
            } else {
                throw ParserException("Invalid react tag `${tag}`")
            }
        }
    }

   func peekTag(): Tag {
        this.readThoughts()
        // If there are no tags, this step is a single [Thought]?
        if (let Some(tag) <- this.parser.currTag) {
            return tag
        } else {
            return Tag.Thought
        }
    }

    func getStepOf(tag: Tag): ReactStep {
        try {
            let thought = String.join(this.thoughts.toArray(), delimiter: "\n")
            let action = if (tag == Tag.Thought) {
                ""
            } else if (tag == Tag.Action) {
                this.parser.readTagAndContent(Tag.Action)
            } else {
                throw AgentExecutionException("Unreachable")
            }
            let content = "${thought}\n${action}"
            LogUtils.debug("React action content: ${content}")
            return ReactStep.fromStr(content)
        } catch (ex: Exception) {
            return ReactStep.Failure(
                FailureInfo(
                    FailureLevel.Fatal,
                    message: "",
                    reason: ex.toString(),
                    suggestion: ""
                )
            )
        }
    }

    func getAsyncAnswer(): (String, AsyncReactAnswer) {
        let thought = String.join(this.thoughts.toArray(), delimiter: "\n")
        (thought, AsyncReactAnswer(this.parser))
    }
}
