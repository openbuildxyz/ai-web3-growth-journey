/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*

let PROMPT_BUILDER = Token(TokenKind.IDENTIFIER, "__prompt_builder__")
let SYSTEM_PROMPT_FUNC = "__system_prompt_func__"
let USER_PROMPT_FUNC = "__user_prompt_func__"
let HANDLER_FUNC_NAME = "__handler_func__"

let TEMPLATE_FUNC_NAME_POSTFIX = "__template_"
let TOOL_METADATA_BUILDER_PREFIX = "__tool_metadata_of_"
let TOOL_IMPL_PREFIX = "__tool_impl_of_"
let PROMPT_ELEMENT_NAME_PREFIX = "__prompt_of_"