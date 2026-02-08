/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

class DslException <: Exception {
    public init(msg: String) { super(msg) }
}
