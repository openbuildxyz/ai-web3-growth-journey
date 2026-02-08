/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.memory


public interface Memory {
    /**
     * Update the memory
     */
    func update(segment: String): Unit

    /**
     * According to the user question, find related content in the memory
     */
    func search(question: String): Array<String>
}