/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.interaction

import magic.parser.*
import magic.core.agent.*
import magic.core.interaction.*
import magic.core.message.{Tag, WithTag}
import magic.utils.{Color, Colorful}

import std.env.getStdOut

/**
 * Dumper the verbose internal execution information for debugging
 */
public class ConsolePrinter <: EventStreamVisitor {
    public init(asyncResponse: AsyncAgentResponse) {
        super(asyncResponse.execution.events)
    }

    private func getTagColor(tag: Tag): Color {
        if (tag == Tag.Plan) {
            return Color.Red
        } else if (tag == Tag.Info || tag == Tag.Action) {
            return Color.Green
        } else {
            return Color.Blue
        }
    }

    override public func on(event: NotifyEvent): Unit {
        let tag = event.tag
        let tagColor = getTagColor(tag)
        getStdOut().writeln(tag.open.withColor(tagColor))
        if (tag != Tag.Answer) {
            getStdOut().writeln(event.content.trimAscii())
        } else {
            // getStdOut().writeln("...")
            getStdOut().writeln(event.content.trimAscii())
        }
        getStdOut().writeln(tag.close.withColor(tagColor))
    }

    override public func on(event: ToolCallStartEvent): Unit {
        let tag = Tag.Action
        let tagColor = getTagColor(tag)
            getStdOut().writeln(tag.open.withColor(tagColor))
            getStdOut().writeln(event.toolRequest)
            getStdOut().writeln(tag.close.withColor(tagColor))
    }

    public static func print(asyncResponse: AsyncAgentResponse, verbose!: Bool = false): Unit {
        if (verbose) {
            let printer = ConsolePrinter(asyncResponse)
            printer.start()
        }
        for (data in asyncResponse) {
            getStdOut().write(data)
        }
        getStdOut().write("\n")
    }
}
