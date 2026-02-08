/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.examples.doc_generator

import magic.dsl.*
import magic.prelude.*
import magic.utils.*
import magic.config.Config

import std.fs.Path

@agent[
    model: "ark:deepseek-v3-250324",
    executor: "naive"
]
class DocAgent {
    init() {
        this.model.maxTokens = 8192
    }

    @prompt(
        """
        # Background
        ${readFile(Path("./src/examples/doc_generator/cj-lang.md"))}

        # Instruction
        Given a Cangjie program, you are required to generate API documents for it.
        Only generate documents for public type definitions and public member definitions.
        This is an import requirement.
        You must follow Cangjie syntax, e.g., function definition, class definition.
        Function descriptions and parameter descriptions are in English.
        """
    )
    @user(
        """
        This is the program.
        ```cangjie
        {code}
        ```
        Generate the document now.
        Descriptions and parameter descriptions must be in English.
        """
    )
}

