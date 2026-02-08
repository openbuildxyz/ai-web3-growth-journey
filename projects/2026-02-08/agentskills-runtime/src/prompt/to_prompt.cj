/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.prompt

/**
 * This interface is used to constrain types to generate prompts
 * It's used by vdb.SemanticMap
 */
public interface ToPrompt {
    func toPrompt(): String
}

extend String <: ToPrompt {
    public func toPrompt(): String {
        return this
    }
}