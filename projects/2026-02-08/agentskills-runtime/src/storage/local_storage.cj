/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.storage

public interface LocalStorage {
    prop workspace: String
    prop collection: String

    func commit(): Unit
    func close(): Unit
    func reset(): Unit
}