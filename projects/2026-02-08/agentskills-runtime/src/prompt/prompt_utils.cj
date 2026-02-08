/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.prompt

import magic.utils.{exists, readFile}

import std.fs.{Path, FSException}
import std.io.StringReader

public struct PromptUtils {
    public static func readPromptFile(path: String): String {
        if (!exists(path)) {
            throw FSException("Prompt file ${path} does not exist.")
        }
        return readFile(Path(path))
    }
}