/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.tool

import magic.jsonable.TypeSchema

public struct ToolParameter {
    public let name: String
    public let description: String
    public let typeSchema: TypeSchema

    public init(name: String, description: String, typeSchema: TypeSchema) {
        this.name = name
        this.description = description
        this.typeSchema = typeSchema
    }
}