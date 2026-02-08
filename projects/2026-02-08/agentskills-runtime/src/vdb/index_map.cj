/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.vdb

import magic.prompt.ToPrompt

public interface IndexMap<Self, T> where T <: ToPrompt {
    // func add(index: Int64, content: T): Unit
    /**
     * The index is determined by the order in which it was added.
     */
    func add(content: T): Unit

    func get(index: Int64): T

    func save(filePath: String): Unit

    static func load(filePath: String): Self
}