/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.storage.kv

import stdx.serialization.serialization.*
import magic.storage.LocalStorage

public interface KVStorage<T> where T <: Serializable<T> {
    func get(id: String): Option<T>
    func remove(id: String): Option<T>
    func upsert(id: String, value: T): Unit
}

public interface LocalKVStorage<T> <: KVStorage<T> & LocalStorage where T <: Serializable<T> {
    
}